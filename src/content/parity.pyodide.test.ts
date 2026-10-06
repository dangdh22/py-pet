import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, test } from "vitest";
import { matchError } from "../explain/match";
import { problemFromOutcome } from "../explain/problem";
import { compareOutput } from "../runner/compare";
import { judge } from "../runner/judge";
import type { PyRunner } from "../runner/pyRun";
import { DEFAULT_TIMEOUT_MS, type RunFn } from "../runner/types";
import { getPyRunner } from "../test/pyodide";
import { allExercises, allLessons } from "./lookup";
import type { ChoiceQuestion, CodeExercise, ContentBundle } from "./types";

const bundle = JSON.parse(readFileSync("src/generated/content.json", "utf8")) as ContentBundle;
const exact = { kind: "exact" } as const;

let run: PyRunner;
let runAsync: RunFn;

beforeAll(async () => {
  run = await getPyRunner();
  runAsync = async (code, stdin) => run(code, stdin);
});

describe("error dictionary on Pyodide", () => {
  test("has the expected number of entries", () => {
    expect(bundle.errors.length).toBe(28);
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

  test("NameError with a Vietnamese name is explained", () => {
    const code = "print(tên)";
    const problem = problemFromOutcome(run(code, ""), false);
    const match = matchError(bundle.errors, problem!, code);
    expect(match?.entry.id).toBe("name-undefined");
    expect(match?.vars.name).toBe("tên");
  });

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

describe("lesson content on Pyodide", () => {
  test("stage 1 has content", () => {
    expect(allLessons(bundle).length).toBeGreaterThan(0);
  });

  const exercises = allExercises(bundle);

  for (const exercise of exercises.filter((e): e is CodeExercise => e.type === "code")) {
    test(`${exercise.id}: solution passes fast, starter fails, common wrong outputs match`, async () => {
      expect((await judge(exercise, exercise.solution, runAsync)).status).toBe("accepted");
      for (const testCase of exercise.tests) {
        expect(run(exercise.solution, testCase.input).durationMs).toBeLessThan(DEFAULT_TIMEOUT_MS);
      }
      expect((await judge(exercise, exercise.starter, runAsync)).status).not.toBe("accepted");
      for (const wrong of exercise.commonWrong) {
        const testCase = exercise.tests[wrong.test]!;
        expect(compareOutput(wrong.output, run(wrong.sample, testCase.input).stdout, exact).equal).toBe(true);
      }
    });
  }

  for (const question of exercises.filter((e): e is ChoiceQuestion => e.type === "predict")) {
    test(`${question.id}: the marked answer matches Pyodide`, () => {
      const result = run(question.code ?? "", "");
      const correct = question.choices.find((choice) => choice.correct)!;
      if (result.outcome === "error") {
        expect(correct.error).toBe(true);
        return;
      }
      expect(result.outcome).toBe("ok");
      const matching = question.choices.filter(
        (choice) => !choice.error && compareOutput(choice.text.vi, result.stdout, exact).equal,
      );
      expect(matching).toEqual([correct]);
    });
  }

  for (const lesson of allLessons(bundle)) {
    test(`${lesson.id}: card examples behave as marked`, () => {
      for (const card of lesson.cards) {
        for (const segment of card.segments) {
          if (segment.kind !== "code" || !segment.run) continue;
          const result = run(segment.code, "");
          expect(result.outcome).toBe(segment.expectError ? "error" : "ok");
        }
      }
    });
  }
});
