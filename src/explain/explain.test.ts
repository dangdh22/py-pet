import { describe, expect, test } from "vitest";
import type { ErrorEntry } from "../content/types";
import type { PyErrorInfo } from "../runner/types";
import { findSimilarName, levenshtein } from "./checks";
import { matchError, renderTemplate } from "./match";
import { isPseudoError, problemFromOutcome } from "./problem";
import { DictionaryProvider, errorMisconceptionFrom, explainWithChain } from "./providers";
import type { ExplainProvider } from "./types";

function entry(id: string, type: string, extra: Partial<ErrorEntry> = {}): ErrorEntry {
  return {
    id,
    match: { type, message: null, check: null },
    explain: { vi: `vi ${id}: dòng {line}`, en: `en ${id}: line {line}` },
    hint: null,
    misconception: null,
    sample: "",
    sampleInput: "",
    ...extra,
  };
}

function error(type: string, message = "", line: number | null = 1, lineText = ""): PyErrorInfo {
  return { type, message, line, column: null, lineText };
}

const NAME_MESSAGE = "^name '(?<name>\\w+)' is not defined$";
const entries: ErrorEntry[] = [
  entry("name-similar", "NameError", {
    match: { type: "NameError", message: NAME_MESSAGE, check: "similar-name" },
    explain: { vi: 'Dòng {line}: "{name}" hay "{suggestion}"?', en: 'Line {line}: "{name}" or "{suggestion}"?' },
    misconception: "case-sensitive",
  }),
  entry("name-undefined", "NameError", {
    match: { type: "NameError", message: NAME_MESSAGE, check: null },
    misconception: "string-quotes",
  }),
  entry("smart-quote", "SyntaxError", {
    match: { type: "SyntaxError", message: "^invalid character '(?<char>.)' \\(U\\+(?<code>[0-9A-F]+)\\)$", check: null },
    explain: { vi: "Ký tự lạ {char} ({code})", en: "Strange character {char} ({code})" },
  }),
  entry("assign-in-condition", "SyntaxError", {
    match: { type: "SyntaxError", message: "Maybe you meant '=='", check: "assign-in-condition" },
  }),
  entry("syntax-other", "SyntaxError"),
  entry("timeout-while", "Timeout", { match: { type: "Timeout", message: null, check: "while-loop" } }),
  entry("timeout", "Timeout"),
];

describe("checks", () => {
  test("levenshtein", () => {
    expect(levenshtein("prnt", "print")).toBe(1);
    expect(levenshtein("abc", "abc")).toBe(0);
    expect(levenshtein("", "ab")).toBe(2);
  });

  test("findSimilarName finds case mistakes, typos and known names", () => {
    expect(findSimilarName("Print", "Print('hi')")).toBe("print");
    expect(findSimilarName("prnt", "prnt(1)")).toBe("print");
    expect(findSimilarName("tuoii", "tuoi = 11\nprint(tuoii)")).toBe("tuoi");
  });

  test("findSimilarName ignores far names, other first letters and words inside strings", () => {
    expect(findSimilarName("Robo", "print(Robo)")).toBeNull();
    expect(findSimilarName("Xin", "print(Xin)")).toBeNull();
    expect(findSimilarName("tuoii", 'print("tuoi")\nprint(tuoii)')).toBeNull();
  });
});

describe("matchError", () => {
  test("uses the first matching entry and fills the variables", () => {
    const match = matchError(entries, error("NameError", "name 'Print' is not defined", 3), "Print('hi')");
    expect(match?.entry.id).toBe("name-similar");
    expect(match?.vars).toMatchObject({ line: "3", name: "Print", suggestion: "print" });
  });

  test("falls through when a check fails", () => {
    expect(matchError(entries, error("NameError", "name 'Robo' is not defined"), "print(Robo)")?.entry.id).toBe(
      "name-undefined",
    );
  });

  test("matches the smart quote entry with its captured character", () => {
    const match = matchError(entries, error("SyntaxError", "invalid character '“' (U+201C)"), "print(“hi”)");
    expect(match?.entry.id).toBe("smart-quote");
    expect(match?.vars).toMatchObject({ char: "“", code: "201C" });
  });

  test("assign-in-condition needs a condition line", () => {
    const message = "invalid syntax. Maybe you meant '==' or ':=' instead of '='?";
    expect(matchError(entries, error("SyntaxError", message, 2, "if x = 5:"), "")?.entry.id).toBe("assign-in-condition");
    expect(matchError(entries, error("SyntaxError", message, 2, "print(x = 5)"), "")?.entry.id).toBe("syntax-other");
  });

  test("while-loop check for timeouts", () => {
    expect(matchError(entries, error("Timeout", "", null), "while True:\n    pass")?.entry.id).toBe("timeout-while");
    expect(matchError(entries, error("Timeout", "", null), "for i in range(10**12):\n    pass")?.entry.id).toBe("timeout");
  });

  test("returns null when no entry matches", () => {
    expect(matchError(entries, error("KeyError", "'a'"), "")).toBeNull();
  });

  test("renderTemplate keeps unknown variables", () => {
    expect(renderTemplate("{a} và {b}", { a: "1" })).toBe("1 và {b}");
  });
});

describe("problemFromOutcome", () => {
  const pyError = error("NameError", "x");

  test("returns the Python error", () => {
    expect(problemFromOutcome({ outcome: "error", error: pyError, usedInputPrompt: false }, false)).toBe(pyError);
  });

  test("turns timeout and output-limit into pseudo errors", () => {
    expect(problemFromOutcome({ outcome: "timeout", error: null, usedInputPrompt: false }, false)?.type).toBe("Timeout");
    expect(problemFromOutcome({ outcome: "output-limit", error: null, usedInputPrompt: false }, false)?.type).toBe(
      "OutputLimit",
    );
  });

  test("problemFromOutcome returns InputPrompt only when judged wrong", () => {
    expect(problemFromOutcome({ outcome: "ok", error: null, usedInputPrompt: true }, true)?.type).toBe("InputPrompt");
    expect(problemFromOutcome({ outcome: "ok", error: null, usedInputPrompt: true }, false)).toBeNull();
    expect(problemFromOutcome({ outcome: "ok", error: null, usedInputPrompt: false }, true)).toBeNull();
    expect(problemFromOutcome({ outcome: null, error: null, usedInputPrompt: false }, true)).toBeNull();
  });

  test("isPseudoError", () => {
    expect(isPseudoError("Timeout")).toBe(true);
    expect(isPseudoError("NameError")).toBe(false);
  });
});

describe("providers", () => {
  test("DictionaryProvider explains in the requested language", async () => {
    const provider = new DictionaryProvider(entries);
    const context = { error: error("NameError", "name 'Robo' is not defined", 4), code: "print(Robo)" };
    expect(await provider.explain({ ...context, lang: "vi" })).toEqual({
      text: "vi name-undefined: dòng 4",
      hint: null,
      entryId: "name-undefined",
      misconception: "string-quotes",
    });
    expect((await provider.explain({ ...context, lang: "en" }))?.text).toBe("en name-undefined: line 4");
  });

  test("DictionaryProvider renders the hint", async () => {
    const withHint = [entry("zero", "ZeroDivisionError", { hint: { vi: "Gợi ý dòng {line}", en: "Hint line {line}" } })];
    const result = await new DictionaryProvider(withHint).explain({ error: error("ZeroDivisionError", "division by zero", 2), code: "", lang: "vi" });
    expect(result?.hint).toBe("Gợi ý dòng 2");
  });

  test("explainWithChain uses the first provider that answers", async () => {
    const silent: ExplainProvider = { explain: async () => null };
    const loud: ExplainProvider = { explain: async () => ({ text: "AI", hint: null, entryId: null, misconception: null }) };
    const context = { error: error("KeyError", "'a'"), code: "", lang: "vi" as const };
    expect(await explainWithChain([new DictionaryProvider(entries), silent, loud], context)).toMatchObject({ text: "AI" });
    expect(await explainWithChain([silent], context)).toBeNull();
  });

  test("errorMisconceptionFrom", () => {
    const find = errorMisconceptionFrom(entries);
    expect(find(error("NameError", "name 'Print' is not defined"), "Print(1)")).toBe("case-sensitive");
    expect(find(error("KeyError", "'a'"), "")).toBeUndefined();
  });
});
