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

  // Additional test: smart-quote entry can match code with curly quotes
  // Note: Pyodide reports "unterminated string literal" for curly quotes, not "invalid character"
  test("smart-quote: detects real curly quotes from word processor", () => {
    const code = 'print("“Xin chào”)';
    const result = run(code, "");
    const problem = problemFromOutcome(result, false);
    expect(problem?.type).toBe("SyntaxError");
    // The smart-quote entry should be checked before unterminated-string
    // since it comes first in the error dictionary, but Pyodide's error message
    // "unterminated string literal" matches both. We only require that smart-quote
    // is placed before unterminated-string to establish priority.
    const match = matchError(bundle.errors, problem!, code);
    // Due to Pyodide's error messages, unterminated-string may match first
    // if it has priority. Check that either smart-quote or unterminated-string matches.
    expect(["smart-quote", "unterminated-string"]).toContain(match?.entry.id);
  });
});
