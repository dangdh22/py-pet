import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, test } from "vitest";
import { matchError } from "../explain/match";
import { problemFromOutcome } from "../explain/problem";
import type { PyRunner } from "../runner/pyRun";
import { getPyRunner } from "../test/pyodide";
import type { ContentBundle } from "./types";

const bundle = JSON.parse(readFileSync("src/generated/content.json", "utf8")) as ContentBundle;

let run: PyRunner;

beforeAll(async () => {
  run = await getPyRunner();
});

describe("error dictionary on Pyodide", () => {
  test("has the expected number of entries", () => {
    expect(bundle.errors.length).toBe(27);
  });

  for (const entry of bundle.errors) {
    test(`${entry.id}: the sample is recognized by its own entry`, () => {
      if (entry.match.type === "Timeout") {
        const timeout = { type: "Timeout", message: "", line: null, column: null, lineText: "" };
        expect(matchError(bundle.errors, timeout, entry.sample)?.entry.id).toBe(entry.id);
        return;
      }
      const result = run(entry.sample, entry.sampleInput);
      const problem = problemFromOutcome(result, entry.match.type === "InputPrompt");
      expect(problem?.type).toBe(entry.match.type);
      expect(matchError(bundle.errors, problem!, entry.sample)?.entry.id).toBe(entry.id);
    });
  }

  test("smart-quote: real curly quotes pasted from Word are recognized (added test)", () => {
    const code = "print(“Xin chào”)";
    const result = run(code, "");
    const problem = problemFromOutcome(result, false);
    expect(problem?.type).toBe("SyntaxError");
    const match = matchError(bundle.errors, problem!, code);
    expect(match?.entry.id).toBe("smart-quote");
    expect(match?.vars.char).toBe("“");
  });
});
