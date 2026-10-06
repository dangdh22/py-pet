import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { buildBundle, ContentError } from "./buildBundle";

function writeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "py-pet-content-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

const LESSON = `---
id: s1.a.l1
title: { vi: Bài 1 }
exercises:
  - id: s1.a.l1.ex1
    type: code
    concepts: [print-call]
    prompt: { vi: In ra Hi }
    solution: 'print("Hi")'
    tests:
      - { output: Hi }
---
Thẻ **một**
`;

function minimalTree(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    "stage-1/stage.yaml": "id: s1\ntitle: { vi: Khởi động, en: Getting started }\ntopics: [01-a]\n",
    "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: Chủ đề A }\nlessons: [01-x.md]\n",
    "stage-1/01-a/concepts.yaml": "concepts:\n  - id: print-call\n    name: { vi: Lệnh print }\n",
    "stage-1/01-a/questions.yaml": [
      "questions:",
      "  - id: s1.a.b1",
      "    type: mcq",
      "    lessons: [s1.a.l1]",
      "    prompt: { vi: Câu hỏi?, en: Question? }",
      "    choices:",
      "      - { text: A, correct: true }",
      "      - { vi: Không, en: No }",
      "    explanation: { vi: Vì vậy., en: Because. }",
      "",
    ].join("\n"),
    "stage-1/01-a/01-x.md": LESSON,
    "errors/errors.yaml": [
      "- id: zero-division",
      "  match: { type: ZeroDivisionError }",
      "  explain: { vi: Chia cho 0, en: Division by 0 }",
      "  sample: 'print(1 / 0)'",
      "",
    ].join("\n"),
    ...overrides,
  };
}

function problemsOf(files: Record<string, string>): string[] {
  try {
    buildBundle(writeTree(files));
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  return [];
}

describe("buildBundle", () => {
  test("builds a bundle from a valid tree", () => {
    const bundle = buildBundle(writeTree(minimalTree()));
    const topic = bundle.stages[0]!.topics[0]!;
    const lesson = topic.lessons[0]!;
    expect(bundle.stages[0]!.title).toEqual({ vi: "Khởi động", en: "Getting started" });
    expect(lesson.cards[0]!.segments[0]).toEqual({ kind: "html", html: "<p>Thẻ <strong>một</strong></p>\n" });
    expect(lesson.exercises[0]).toEqual({
      id: "s1.a.l1.ex1",
      type: "code",
      concepts: ["print-call"],
      prompt: { vi: "In ra Hi" },
      starter: "",
      solution: 'print("Hi")',
      tests: [{ input: "", output: "Hi", hidden: false }],
      commonWrong: [],
      hints: [],
      compare: { kind: "exact" },
      testEligible: false,
    });
    expect(topic.questions[0]!.choices).toEqual([
      { text: { vi: "A", en: "A" }, correct: true, error: false, misconception: null },
      { text: { vi: "Không", en: "No" }, correct: false, error: false, misconception: null },
    ]);
    expect(topic.concepts).toEqual([
      { id: "print-call", name: { vi: "Lệnh print" }, misconceptionCard: null, parentTip: null },
    ]);
    expect(bundle.errors).toEqual([
      {
        id: "zero-division",
        match: { type: "ZeroDivisionError", message: null, check: null },
        explain: { vi: "Chia cho 0", en: "Division by 0" },
        hint: null,
        misconception: null,
        sample: "print(1 / 0)",
        sampleInput: "",
      },
    ]);
  });

  test("gives lesson questions their own lesson id", () => {
    const lesson = LESSON.replace(
      "---\nThẻ",
      [
        "  - id: s1.a.l1.q1",
        "    type: predict",
        "    code: 'print(1)'",
        "    prompt: { vi: In ra gì?, en: What is printed? }",
        "    choices:",
        "      - { text: '1', correct: true }",
        "      - { text: '2' }",
        "    explanation: { vi: Một., en: One. }",
        "---",
        "Thẻ",
      ].join("\n"),
    );
    const bundle = buildBundle(writeTree(minimalTree({ "stage-1/01-a/01-x.md": lesson })));
    const question = bundle.stages[0]!.topics[0]!.lessons[0]!.exercises[1]!;
    expect(question).toMatchObject({ id: "s1.a.l1.q1", lessons: ["s1.a.l1"], code: "print(1)" });
  });

  test("reports a neutral choice with empty text", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("{ text: A, correct: true }", '{ text: "", correct: true }');
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).not.toEqual([]);
  });

  test("requires English for a test-eligible code exercise", () => {
    const lesson = LESSON.replace("    prompt: { vi: In ra Hi }", "    prompt: { vi: In ra Hi }\n    test_eligible: true");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson }));
    expect(problems).toEqual([expect.stringMatching(/^stage-1\/01-a\/01-x\.md: exercises\.0: prompt\.en: /)]);
  });

  test("requires English in mcq prompts", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace(
      "{ vi: Câu hỏi?, en: Question? }",
      "{ vi: Câu hỏi? }",
    );
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual([expect.stringContaining("questions.0: prompt.en")]);
  });

  test("requires code in predict questions and exactly 1 correct choice", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!
      .replace("type: mcq", "type: predict")
      .replace("{ text: A, correct: true }", "{ text: A }");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual(
      expect.arrayContaining([expect.stringContaining("code: Câu predict"), expect.stringContaining("choices: Phải có đúng 1")]),
    );
  });

  test("reports duplicate ids", () => {
    const lesson = LESSON.replace("id: s1.a.l1.ex1", "id: s1.a.b1");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson }));
    expect(problems).toEqual([expect.stringContaining('ID trùng "s1.a.b1"')]);
  });

  test("reports unknown concepts and unknown lessons", () => {
    const lesson = LESSON.replace("concepts: [print-call]", "concepts: [khong-co]");
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("lessons: [s1.a.l1]", "lessons: [s1.a.l9]");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson, "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining('khái niệm "khong-co"'),
        expect.stringContaining('bài học "s1.a.l9" không tồn tại'),
      ]),
    );
  });

  test("reports an invalid regular expression in the error dictionary", () => {
    const errors = minimalTree()["errors/errors.yaml"]!.replace(
      "match: { type: ZeroDivisionError }",
      'match: { type: ZeroDivisionError, message: "(" }',
    );
    const problems = problemsOf(minimalTree({ "errors/errors.yaml": errors }));
    expect(problems).toEqual([expect.stringContaining("match.message: Biểu thức chính quy không hợp lệ")]);
  });

  test("reports a missing file", () => {
    const problems = problemsOf(minimalTree({ "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: A }\nlessons: [99-y.md]\n" }));
    expect(problems).toEqual(expect.arrayContaining([expect.stringContaining("stage-1/01-a/99-y.md: không tìm thấy file")]));
  });

  test("reports a lesson without cards", () => {
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": LESSON.replace("Thẻ **một**\n", "") }));
    expect(problems).toEqual([expect.stringContaining("bài học phải có ít nhất 1 thẻ")]);
  });

  test("sorts stage folders by number and allows a tree with only errors", () => {
    const tree = minimalTree();
    const onlyErrors = { "errors/errors.yaml": tree["errors/errors.yaml"]! };
    expect(buildBundle(writeTree(onlyErrors)).stages).toEqual([]);
    const stage10 = Object.fromEntries(
      Object.entries(tree)
        .filter(([path]) => path.startsWith("stage-1/"))
        .map(([path, text]) => [
          path.replace("stage-1/", "stage-10/"),
          text.replaceAll("s1.a", "s10.a").replaceAll("print-call", "print-call-b").replace("id: s1\n", "id: s10\n"),
        ]),
    );
    const bundle = buildBundle(writeTree({ ...tree, ...stage10 }));
    expect(bundle.stages.map((s) => s.id)).toEqual(["s1", "s10"]);
  });
});
