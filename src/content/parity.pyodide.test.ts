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
});
