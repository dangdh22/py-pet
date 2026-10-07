import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { fillTemplate, parsonsLines } from "../../src/content/exercise";
import { buildBundle as buildBundleChecked, ContentError } from "./buildBundle";

// Most tests build a tiny tree to check one feature, so they skip the coverage rules (spec 3.9 rules 8 and 9). The
// coverage tests and the complete-tree test call `buildBundleChecked`, which applies them as `content:build` does.
const buildBundle = (dir: string) => buildBundleChecked(dir, { skipCoverage: true });

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

function problemsOfChecked(files: Record<string, string>): string[] {
  try {
    buildBundleChecked(writeTree(files));
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
      {
        id: "print-call",
        name: { vi: "Lệnh print" },
        ai: false,
        misconceptionCard: null,
        misconceptionHtml: null,
        parentTip: null,
        practice: { level1: [], level2: [], level3: [] },
      },
    ]);
    expect(topic.reviews).toEqual([]);
    expect(topic.practice).toEqual([]);
    expect(topic.test).toEqual({ questions: 8, code: 2 });
    expect(bundle.stages[0]!.evolution).toEqual({ questions: 15, ai: 3, code: 3 });
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

  test("builds parsons and fill exercises, practice files, review stations and concept practice", () => {
    const practice = [
      "exercises:",
      "  - id: s1.a.p1",
      "    type: parsons",
      "    concepts: [print-call]",
      "    prompt: { vi: Sắp xếp }",
      "    solution: |",
      "      print(\"A\")",
      "",
      "      print(\"B\")",
      "    tests:",
      "      - { output: \"A\\nB\" }",
      "  - id: s1.a.f1",
      "    type: fill",
      "    concepts: [print-call]",
      "    prompt: { vi: Điền }",
      "    template: |",
      "      print(___)",
      "    answers: ['\"Hi\"']",
      "    tests:",
      "      - { output: Hi }",
      "",
    ].join("\n");
    const concepts = [
      "concepts:",
      "  - id: print-call",
      "    name: { vi: Lệnh print }",
      "    misconception_card: Viết **print** thường.",
      "    parent_tip: Đọc to lệnh print.",
      "    practice: { level1: [s1.a.b1], level2: [s1.a.p1, s1.a.f1], level3: [s1.a.l1.ex1] }",
      "",
    ].join("\n");
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("    type: mcq\n", "    type: mcq\n    concepts: [print-call]\n");
    const bundle = buildBundleChecked(
      writeTree(
        minimalTree({
          "stage-1/stage.yaml":
            "id: s1\ntitle: { vi: Khởi động }\ntopics: [01-a]\nevolution: { questions: 0, ai: 0, code: 0 }\n",
          "stage-1/01-a/topic.yaml":
            "id: s1.a\ntitle: { vi: Chủ đề A }\nlessons: [01-x.md]\nreviews:\n  - { id: s1.a.r1, after: s1.a.l1 }\ntest: { questions: 1, code: 0 }\n",
          "stage-1/01-a/concepts.yaml": concepts,
          "stage-1/01-a/questions.yaml": questions,
          "stage-1/01-a/practice.yaml": practice,
        }),
      ),
    );
    const topic = bundle.stages[0]!.topics[0]!;
    expect(topic.reviews).toEqual([{ id: "s1.a.r1", after: "s1.a.l1" }]);
    expect(topic.practice[0]).toMatchObject({ type: "parsons", lines: ['print("A")', 'print("B")'], solution: 'print("A")\nprint("B")\n' });
    expect(topic.practice[1]).toMatchObject({ type: "fill", template: "print(___)\n", answers: ['"Hi"'], solution: 'print("Hi")\n' });
    expect(topic.concepts[0]!.misconceptionHtml).toBe("<p>Viết <strong>print</strong> thường.</p>\n");
    expect(topic.concepts[0]!.practice).toEqual({ level1: ["s1.a.b1"], level2: ["s1.a.p1", "s1.a.f1"], level3: ["s1.a.l1.ex1"] });
  });

  test("reports bad parsons and fill exercises", () => {
    const practice = [
      "exercises:",
      "  - { id: s1.a.p1, type: parsons, prompt: { vi: P }, solution: 'print(1)', tests: [{ output: '1' }] }",
      "  - { id: s1.a.f1, type: fill, prompt: { vi: F }, template: 'print(___, ___)', answers: ['1'], tests: [{ output: '1' }] }",
      "  - { id: s1.a.q9, type: mcq, prompt: { vi: Q, en: Q }, choices: [{ text: A, correct: true }, { text: B }], explanation: { vi: E, en: E } }",
      "",
    ].join("\n");
    expect(problemsOf(minimalTree({ "stage-1/01-a/practice.yaml": practice }))).toEqual([
      expect.stringContaining("Bài parsons cần ít nhất 2 dòng khác nhau"),
      expect.stringContaining("Mẫu có 2 chỗ trống ___ nhưng có 1 đáp án"),
      expect.stringContaining("practice.yaml chỉ chứa bài code, parsons hoặc fill"),
    ]);
  });

  test("reports bad review stations and practice references", () => {
    const topic = "id: s1.a\ntitle: { vi: A }\nlessons: [01-x.md]\nreviews:\n  - { id: s1.a.r1, after: s1.a.l9 }\n  - { id: s1.a.b1, after: s1.a.l1 }\n";
    const concepts =
      "concepts:\n  - id: print-call\n    name: { vi: P }\n    practice: { level1: [s1.a.l1.ex1], level3: [nope] }\n";
    expect(problemsOf(minimalTree({ "stage-1/01-a/topic.yaml": topic, "stage-1/01-a/concepts.yaml": concepts }))).toEqual([
      's1.a.r1: trạm ôn phải đặt sau 1 bài học của chủ đề s1.a, không có "s1.a.l9"',
      'ID trùng "s1.a.b1": câu hỏi và trạm ôn',
      'print-call: practice.level1: bài "s1.a.l1.ex1" có type code, mức này cần predict hoặc mcq',
      'print-call: practice.level3: bài "nope" không tồn tại',
    ]);
  });

  test("reports concepts without a card, a tip or practice at every level", () => {
    expect(problemsOfChecked(minimalTree())).toContain(
      "print-call: thiếu thẻ hiểu lầm, gợi ý cho phụ huynh, bài luyện level1, bài luyện level2, bài luyện level3",
    );
  });

  test("an AI concept needs practice at level 1 only", () => {
    const concepts = [
      "concepts:",
      "  - id: print-call",
      "    name: { vi: Lệnh print }",
      "  - { id: ai-x, name: { vi: A }, ai: true, misconception_card: C, parent_tip: T, practice: { level1: [s1.a.b1] } }",
      "  - { id: ai-y, name: { vi: B }, ai: true, misconception_card: C, parent_tip: T }",
      "",
    ].join("\n");
    const tree = minimalTree({ "stage-1/01-a/concepts.yaml": concepts });
    tree["stage-1/01-a/questions.yaml"] = (tree["stage-1/01-a/questions.yaml"] as string).replace(
      "    type: mcq\n",
      "    type: mcq\n    concepts: [ai-x]\n",
    );
    const problems = problemsOfChecked(tree);
    expect(problems.filter((w) => w.startsWith("ai-x"))).toEqual([]);
    expect(problems).toContain("ai-y: thiếu bài luyện level1");
  });

  test("reports when a bank is too small for its tests (spec 3.9 rule 9)", () => {
    expect(problemsOfChecked(minimalTree()).slice(1)).toEqual([
      "s1: ngân hàng có 1 câu, cần ít nhất 30 câu cho đề tiến hóa",
      "s1: có 0 câu AI, đề tiến hóa cần 3",
      "s1: có 0 bài code test_eligible, đề tiến hóa cần 3",
      "s1.a: có 1 câu, kiểm tra chủ đề cần 8",
      "s1.a: có 0 bài code test_eligible, kiểm tra chủ đề cần 2",
    ]);
  });

  test("a coverage gap stops the build with one error that lists every gap", () => {
    const dir = writeTree(minimalTree());
    expect(() => buildBundleChecked(dir)).toThrow(ContentError);
    expect(() => buildBundleChecked(dir)).toThrow(/^Nội dung có 6 lỗi:/);
    expect(() => buildBundleChecked(dir)).toThrow(/print-call: thiếu thẻ hiểu lầm[^\n]*\ns1: ngân hàng có 1 câu/);
  });

  test("coverage gaps are not reported on top of other problems", () => {
    const problems = problemsOfChecked(minimalTree({ "stage-1/01-a/concepts.yaml": "concepts: nope\n" }));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.some((p) => p.includes("thiếu") || p.includes("ngân hàng có"))).toBe(false);
  });

  test("reads test configs and the AI flag, and reports a test larger than its AI share allows", () => {
    const bundle = buildBundle(
      writeTree(
        minimalTree({
          "stage-1/stage.yaml": "id: s1\ntitle: { vi: K }\ntopics: [01-a]\nevolution: { questions: 4, ai: 1, code: 1 }\n",
          "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: A }\nlessons: [01-x.md]\ntest: { questions: 3, code: 1 }\n",
          "stage-1/01-a/concepts.yaml": "concepts:\n  - id: print-call\n    name: { vi: P }\n    ai: true\n",
        }),
      ),
    );
    expect(bundle.stages[0]!.evolution).toEqual({ questions: 4, ai: 1, code: 1 });
    expect(bundle.stages[0]!.topics[0]!.test).toEqual({ questions: 3, code: 1 });
    expect(bundle.stages[0]!.topics[0]!.concepts[0]!.ai).toBe(true);
    const badStage = "id: s1\ntitle: { vi: K }\ntopics: [01-a]\nevolution: { questions: 2, ai: 3, code: 0 }\n";
    expect(problemsOf(minimalTree({ "stage-1/stage.yaml": badStage }))).toEqual([
      expect.stringContaining("Số câu AI không được lớn hơn số câu hỏi"),
    ]);
  });

  test("reports an item whose ID is a test node ID", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("id: s1.a.b1", "id: s1.a.test");
    expect(problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }))).toEqual([
      'ID trùng "s1.a.test": kiểm tra chủ đề và câu hỏi',
    ]);
  });

  test("parsonsLines and fillTemplate", () => {
    expect(parsonsLines("a\r\n\n  b  \n")).toEqual(["a", "  b"]);
    expect(fillTemplate("x = ___ + ___", ["1", "2"])).toBe("x = 1 + 2");
    expect(fillTemplate("print(1)", [])).toBe("print(1)");
  });
});
