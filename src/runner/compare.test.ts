import { describe, expect, test } from "vitest";
import { compareOutput, normalizeOutput } from "./compare";

const exact = { kind: "exact" } as const;

describe("normalizeOutput", () => {
  test("drops trailing spaces, trailing blank lines and CRLF", () => {
    expect(normalizeOutput("a  \r\nb\n\n\n")).toEqual(["a", "b"]);
  });
});

describe("compareOutput", () => {
  test("accepts the same text", () => {
    expect(compareOutput("Hi\n", "Hi", exact)).toEqual({ equal: true, firstDiffLine: null });
  });

  test("finds the first different line", () => {
    expect(compareOutput("1\n2\n3", "1\n5\n3", exact)).toEqual({ equal: false, firstDiffLine: 1 });
  });

  test("reports a missing last line", () => {
    expect(compareOutput("1\n2\n3", "1\n2", exact)).toEqual({ equal: false, firstDiffLine: 2 });
  });

  test("keeps leading spaces significant", () => {
    expect(compareOutput("  *", "*", exact).equal).toBe(false);
  });

  test("treats composed and decomposed Vietnamese as equal", () => {
    expect(compareOutput("Xin chào", "Xin chào", exact).equal).toBe(true);
  });

  test("compares numbers with a tolerance in float mode", () => {
    const float = { kind: "float", tolerance: 0.01 } as const;
    expect(compareOutput("3.14 cm", "3.141 cm", float).equal).toBe(true);
    expect(compareOutput("3.14", "3.2", float).equal).toBe(false);
    expect(compareOutput("1 2", "1", float).equal).toBe(false);
    expect(compareOutput("abc", "abd", float).equal).toBe(false);
  });
});
