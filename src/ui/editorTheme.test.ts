import { describe, expect, test } from "vitest";
import { contrastRatio } from "../test/contrast";
import { EDITOR_COLORS } from "./editorTheme";

describe("contrastRatio", () => {
  test("matches the WCAG formula", () => {
    expect(contrastRatio("#ffffff", "#2f5bea")).toBeCloseTo(5.52, 1);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  test("does not depend on the order of the colors", () => {
    expect(contrastRatio("#2f5bea", "#ffffff")).toBe(contrastRatio("#ffffff", "#2f5bea"));
  });
});

describe("editor colors", () => {
  const backgrounds = {
    background: EDITOR_COLORS.background,
    activeLine: EDITOR_COLORS.activeLine,
    errorLine: EDITOR_COLORS.errorLine,
    selection: EDITOR_COLORS.selection,
  };

  for (const [token, color] of Object.entries(EDITOR_COLORS.syntax)) {
    for (const [name, background] of Object.entries(backgrounds)) {
      test(`the ${token} color reads on the ${name} (4.5:1)`, () => {
        expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  test("the line numbers read on the gutter (4.5:1)", () => {
    expect(contrastRatio(EDITOR_COLORS.gutterText, EDITOR_COLORS.gutterBackground)).toBeGreaterThanOrEqual(4.5);
  });
});
