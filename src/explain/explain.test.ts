import { describe, expect, test } from "vitest";
import type { ErrorEntry } from "../content/types";
import type { PyErrorInfo } from "../runner/types";
import { checks, findSimilarName, isAssignedInCode, levenshtein } from "./checks";
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

const NAME_MESSAGE = "^name '(?<name>[^']+)' is not defined$";
const entries: ErrorEntry[] = [
  entry("name-before-assign", "NameError", {
    match: { type: "NameError", message: NAME_MESSAGE, check: "assigned-in-code" },
    misconception: "var-before-use",
  }),
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
    match: { type: "SyntaxError", message: "Maybe you meant '==' (or ':=' )?instead of '='", check: "assign-in-condition" },
  }),
  entry("assign-in-if", "SyntaxError", {
    match: { type: "SyntaxError", message: "^invalid syntax$", check: "assign-in-if" },
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
    expect(findSimilarName("tênn", "tên = 1\nprint(tênn)")).toBe("tên");
  });

  test("findSimilarName ignores far names, other first letters and words inside strings", () => {
    expect(findSimilarName("Robo", "print(Robo)")).toBeNull();
    expect(findSimilarName("Xin", "print(Xin)")).toBeNull();
    expect(findSimilarName("tuoii", 'print("tuoi")\nprint(tuoii)')).toBeNull();
  });
});

describe("assign-in-if check", () => {
  const lineOf = (lineText: string) => ({ error: error("SyntaxError", "invalid syntax", 2, lineText), code: "", vars: {} });

  test("is ok for a lone = in an if, elif or while line", () => {
    expect(checks["assign-in-if"](lineOf("if n % 4 == 0 and n % 100 = 0:"))).toMatchObject({ ok: true });
    expect(checks["assign-in-if"](lineOf("    elif a == 1 and b = 2:"))).toMatchObject({ ok: true });
    expect(checks["assign-in-if"](lineOf("while x > 0 or y = 2:"))).toMatchObject({ ok: true });
    expect(checks["assign-in-if"](lineOf("if not x = 2:"))).toMatchObject({ ok: true });
  });

  test("is not ok when every = belongs to ==, <=, >= or !=", () => {
    expect(checks["assign-in-if"](lineOf("if a == 1 and b != 2:"))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("if a <= 1 and b >= 2 or c ==3:"))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("if x => 3:"))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("if x > 3 and y =< 3:"))).toEqual({ ok: false });
  });

  test("ignores an = inside a string or a comment", () => {
    expect(checks["assign-in-if"](lineOf('if a == "x = 1" and b ==:'))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("if a == 'b = 2' and"))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("if a == 1 and  # b = 2"))).toEqual({ ok: false });
  });

  test("is not ok for a line that is not if, elif or while", () => {
    expect(checks["assign-in-if"](lineOf("x = 5 +"))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("print(a = 1 and b"))).toEqual({ ok: false });
    expect(checks["assign-in-if"](lineOf("iffy = 5 and"))).toEqual({ ok: false });
  });

  test("does not look at an = after the colon of a one-line body", () => {
    expect(checks["assign-in-if"](lineOf("if a == 1: b = 2 +"))).toEqual({ ok: false });
  });
});

describe("assigned-in-code check", () => {
  const input = (name: string, code: string) => ({
    error: error("NameError", `name '${name}' is not defined`, 1),
    code,
    vars: { name },
  });

  test("ok when the name is assigned later in the code", () => {
    expect(checks["assigned-in-code"](input("diem", "print(diem)\ndiem = 5"))).toMatchObject({ ok: true });
    expect(checks["assigned-in-code"](input("điểm", "print(điểm)\n  điểm=5"))).toMatchObject({ ok: true });
  });

  test("not ok when the name is never assigned", () => {
    expect(checks["assigned-in-code"](input("Robo", "print(Robo)"))).toEqual({ ok: false });
    expect(checks["assigned-in-code"](input("diem", "print(diem)\nprint(diem == 5)"))).toEqual({ ok: false });
    expect(checks["assigned-in-code"](input("diem", "print(diem)\n# diem = 5\nprint('diem = 5')"))).toEqual({ ok: false });
    expect(checks["assigned-in-code"](input("a", "print(a)\nab = 5"))).toEqual({ ok: false });
    expect(checks["assigned-in-code"]({ error: error("NameError"), code: "x = 1", vars: {} })).toEqual({ ok: false });
  });

  test("an augmented assignment such as += counts as an assignment", () => {
    expect(checks["assigned-in-code"](input("tong", "for i in range(3):\n    tong += i"))).toMatchObject({ ok: true });
    expect(checks["assigned-in-code"](input("x", "x //= 2"))).toMatchObject({ ok: true });
    expect(checks["assigned-in-code"](input("x", "x <= 2\nx != 2\nx == 2"))).toEqual({ ok: false });
  });

  test("escapes the name for a RegExp", () => {
    expect(isAssignedInCode("a.b", "axb = 1")).toBe(false);
  });
});

describe("matchError", () => {
  test("uses the first matching entry and fills the variables", () => {
    const match = matchError(entries, error("NameError", "name 'Print' is not defined", 3), "Print('hi')");
    expect(match?.entry.id).toBe("name-similar");
    expect(match?.vars).toMatchObject({ line: "3", name: "Print", suggestion: "print" });
  });

  test("captures a Vietnamese variable name", () => {
    const match = matchError(entries, error("NameError", "name 'tên' is not defined", 2), "print(tên)");
    expect(match?.entry.id).toBe("name-undefined");
    expect(match?.vars.name).toBe("tên");
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

  test("assign-in-condition also matches the message without ':='", () => {
    const message = "cannot assign to expression here. Maybe you meant '==' instead of '='?";
    expect(matchError(entries, error("SyntaxError", message, 2, "if n % 2 = 0:"), "")?.entry.id).toBe("assign-in-condition");
    expect(matchError(entries, error("SyntaxError", message, 1, "11 = tuoi"), "")?.entry.id).toBe("syntax-other");
  });

  test("assign-in-if catches a plain invalid syntax on a condition line only", () => {
    const message = "invalid syntax";
    expect(matchError(entries, error("SyntaxError", message, 2, "if a == 1 and b = 2:"), "")?.entry.id).toBe("assign-in-if");
    expect(matchError(entries, error("SyntaxError", message, 2, "if a == 1 and b == 2 3:"), "")?.entry.id).toBe("syntax-other");
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

  test("name-similar is the case-sensitive misconception only for a change of letter case, not for a typo", async () => {
    const find = errorMisconceptionFrom(entries);
    expect(find(error("NameError", "name 'Print' is not defined"), "Print(1)")).toBe("case-sensitive");
    expect(find(error("NameError", "name 'pirnt' is not defined"), "pirnt(1)")).toBeUndefined();
    const provider = new DictionaryProvider(entries);
    const explain = (name: string) =>
      provider.explain({ error: error("NameError", `name '${name}' is not defined`, 1), code: `${name}(1)`, lang: "vi" });
    expect(await explain("Print")).toMatchObject({ entryId: "name-similar", misconception: "case-sensitive" });
    expect(await explain("pirnt")).toMatchObject({ entryId: "name-similar", misconception: null });
  });

  test("a name used before its assignment is var-before-use; a never-assigned name stays string-quotes", async () => {
    const find = errorMisconceptionFrom(entries);
    const message = "name 'diem' is not defined";
    expect(find(error("NameError", message, 1), "print(diem)\ndiem = 5")).toBe("var-before-use");
    expect(find(error("NameError", "name 'Robo' is not defined", 1), "print(Robo)")).toBe("string-quotes");
    const provider = new DictionaryProvider(entries);
    expect(
      await provider.explain({ error: error("NameError", message, 1), code: "print(diem)\ndiem = 5", lang: "vi" }),
    ).toMatchObject({ entryId: "name-before-assign", misconception: "var-before-use" });
  });

  test("errorMisconceptionFrom", () => {
    const find = errorMisconceptionFrom(entries);
    expect(find(error("NameError", "name 'Print' is not defined"), "Print(1)")).toBe("case-sensitive");
    expect(find(error("KeyError", "'a'"), "")).toBeUndefined();
  });
});
