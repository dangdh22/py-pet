import { describe, expect, test } from "vitest";
import { composite, contrastRatio } from "../test/contrast";
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

describe("composite", () => {
  test("paints a translucent color over an opaque one", () => {
    expect(composite("rgba(0, 0, 0, 0.5)", "#ffffff")).toBe("#808080");
    expect(composite("rgba(255, 0, 0, 0.25)", "#000000")).toBe("#400000");
  });

  test("an opaque top color hides the one underneath, a fully clear one shows it", () => {
    expect(composite("#123456", "#ffffff")).toBe("#123456");
    expect(composite("rgba(255, 0, 0, 0)", "#00ff00")).toBe("#00ff00");
  });

  test("refuses a color it cannot read, and a translucent color underneath", () => {
    expect(() => composite("red", "#ffffff")).toThrow();
    expect(() => composite("#ffffff", "rgba(0, 0, 0, 0.5)")).toThrow();
  });
});

describe("editor colors", () => {
  const { background, selection, activeLine, errorLine } = EDITOR_COLORS;
  // CodeMirror paints the selection in a layer behind the text and the line backgrounds on top of it, so a tinted
  // line over the selection is a real pair of colors, next to the 4 plain ones.
  const surfaces = {
    background,
    "current line over the background": composite(activeLine, background),
    "error line over the background": composite(errorLine, background),
    selection,
    "current line over the selection": composite(activeLine, selection),
    "error line over the selection": composite(errorLine, selection),
  };

  for (const [token, color] of Object.entries(EDITOR_COLORS.syntax)) {
    for (const [name, surface] of Object.entries(surfaces)) {
      test(`the ${token} color reads on the ${name} (4.5:1)`, () => {
        expect(contrastRatio(color, surface)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  test("the line numbers read on the gutter (4.5:1)", () => {
    expect(contrastRatio(EDITOR_COLORS.gutterText, EDITOR_COLORS.gutterBackground)).toBeGreaterThanOrEqual(4.5);
  });

  // Why the 2 tints are translucent: an opaque line background hides the selection layer behind it, so a selection on
  // the line with the cursor or on the error line would not show at all.
  describe("the tints of the current line and of the error line", () => {
    const tints = { "current line": activeLine, "error line": errorLine };

    for (const [name, tint] of Object.entries(tints)) {
      test(`the ${name} is translucent, so the selection shows through it`, () => {
        const alpha = Number(/^rgba\(.*,\s*([\d.]+)\)$/.exec(tint)?.[1]);
        expect(alpha).toBeGreaterThan(0);
        expect(alpha).toBeLessThan(1);
        expect(contrastRatio(composite(tint, selection), composite(tint, background))).toBeGreaterThanOrEqual(1.1);
      });
    }

    test("they look like the plan's colors over the editor background", () => {
      expect(composite(activeLine, background)).toBe("#f8f1de");
      expect(composite(errorLine, background)).toBe("#ffecec");
    });
  });
});
