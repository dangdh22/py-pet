import { describe, expect, test } from "vitest";
import { LessonFormatError, parseCard, parseLessonFile, splitCards, splitFrontmatter } from "./parseLesson";

describe("splitFrontmatter", () => {
  test("separates the YAML part from the body", () => {
    expect(splitFrontmatter("---\nid: a\n---\nThân bài")).toEqual({ frontmatter: "id: a\n", body: "Thân bài" });
  });

  test("accepts Windows line endings", () => {
    expect(splitFrontmatter("---\r\nid: a\r\n---\r\nThân")).toEqual({ frontmatter: "id: a\n", body: "Thân" });
  });

  test("accepts a file that ends right after the closing line", () => {
    expect(splitFrontmatter("---\nid: a\n---")).toEqual({ frontmatter: "id: a\n", body: "" });
  });

  test("rejects a file without the opening line", () => {
    expect(() => splitFrontmatter("id: a\n")).toThrow(LessonFormatError);
  });

  test("rejects a file without the closing line", () => {
    expect(() => splitFrontmatter("---\nid: a\n")).toThrow(LessonFormatError);
  });
});

describe("splitCards", () => {
  test("splits on lines that contain only ---", () => {
    expect(splitCards("Một\n---\nHai\n")).toEqual(["Một", "Hai"]);
  });

  test("does not split on --- inside a code fence", () => {
    const body = "Một\n```python\nprint('---')\n---\n```\n---\nHai";
    expect(splitCards(body)).toEqual(["Một\n```python\nprint('---')\n---\n```", "Hai"]);
  });

  test("drops empty cards", () => {
    expect(splitCards("\n---\nMột\n---\n\n")).toEqual(["Một"]);
  });
});

describe("parseCard", () => {
  test("turns Markdown into HTML and Python fences into code segments", () => {
    const card = parseCard('**Biến** là hộp.\n\n```python run\nprint("hi")\n```\n\nHết.');
    expect(card.segments).toEqual([
      { kind: "html", html: "<p><strong>Biến</strong> là hộp.</p>\n" },
      { kind: "code", code: 'print("hi")', run: true, expectError: false },
      { kind: "html", html: "<p>Hết.</p>\n" },
    ]);
  });

  test("reads the expect-error flag and plain Python blocks", () => {
    const card = parseCard("```python run expect-error\nPrint(1)\n```\n```python\nx = 1\n```");
    expect(card.segments).toEqual([
      { kind: "code", code: "Print(1)", run: true, expectError: true },
      { kind: "code", code: "x = 1", run: false, expectError: false },
    ]);
  });

  test("keeps non-Python fences as Markdown", () => {
    const card = parseCard("```text\nxin chào\n```");
    expect(card.segments).toHaveLength(1);
    expect(card.segments[0]).toMatchObject({ kind: "html" });
    expect((card.segments[0] as { html: string }).html).toContain("xin chào");
  });
});

describe("parseLessonFile", () => {
  test("parses YAML and cards", () => {
    const parsed = parseLessonFile("---\nid: s1.a.l1\ntitle: { vi: Bài 1 }\n---\nThẻ 1\n---\nThẻ 2\n");
    expect(parsed.frontmatter).toEqual({ id: "s1.a.l1", title: { vi: "Bài 1" } });
    expect(parsed.cards).toHaveLength(2);
  });

  test("reports invalid YAML as LessonFormatError", () => {
    expect(() => parseLessonFile("---\nid: [\n---\nThẻ\n")).toThrow(LessonFormatError);
  });
});
