import type { CommonWrong, CompareMode, TestCase } from "../content/types";
import { compareOutput } from "./compare";
import type { PyErrorInfo, RunFn, RunOutcome } from "./types";

export type JudgeStatus = "accepted" | "wrong-answer" | "error" | "timeout";

export interface TestOutcome {
  index: number;
  passed: boolean;
  hidden: boolean;
  ran: boolean;
  input: string;
  expected: string;
  actual: string;
  firstDiffLine: number | null;
  outcome: RunOutcome | null;
  error: PyErrorInfo | null;
  usedInputPrompt: boolean;
}

export interface JudgeResult {
  status: JudgeStatus;
  passedCount: number;
  total: number;
  tests: TestOutcome[];
  misconceptions: string[];
}

export type ErrorMisconceptionFn = (error: PyErrorInfo, code: string) => string | undefined;

// Built-in misconception id; content/stage-2/03-input/concepts.yaml defines the concept of that id.
export const INPUT_PROMPT_MISCONCEPTION = "input-prompt";

/** What judging needs from a code, parsons or fill exercise. */
export interface JudgeSpec {
  tests: TestCase[];
  compare: CompareMode;
  commonWrong?: CommonWrong[];
}

export async function judge(
  exercise: JudgeSpec,
  code: string,
  run: RunFn,
  errorMisconception: ErrorMisconceptionFn = () => undefined,
): Promise<JudgeResult> {
  const tests: TestOutcome[] = [];
  let stopped = false;
  for (const [index, testCase] of exercise.tests.entries()) {
    const base = { index, hidden: testCase.hidden, input: testCase.input, expected: testCase.output };
    if (stopped) {
      tests.push({ ...base, passed: false, ran: false, actual: "", firstDiffLine: null, outcome: null, error: null, usedInputPrompt: false });
      continue;
    }
    const result = await run(code, testCase.input);
    const comparison =
      result.outcome === "ok"
        ? compareOutput(testCase.output, result.stdout, exercise.compare)
        : { equal: false, firstDiffLine: null };
    tests.push({
      ...base,
      passed: comparison.equal,
      ran: true,
      actual: result.stdout,
      firstDiffLine: comparison.firstDiffLine,
      outcome: result.outcome,
      error: result.error,
      usedInputPrompt: result.usedInputPrompt,
    });
    if (result.outcome === "timeout") stopped = true;
  }

  const passedCount = tests.filter((t) => t.passed).length;
  let status: JudgeStatus = "wrong-answer";
  if (tests.some((t) => t.outcome === "timeout")) status = "timeout";
  else if (tests.some((t) => t.outcome === "error" || t.outcome === "output-limit")) status = "error";
  else if (passedCount === tests.length) status = "accepted";

  return {
    status,
    passedCount,
    total: tests.length,
    tests,
    misconceptions: collectMisconceptions(exercise, code, tests, errorMisconception),
  };
}

function collectMisconceptions(
  exercise: JudgeSpec,
  code: string,
  tests: TestOutcome[],
  errorMisconception: ErrorMisconceptionFn,
): string[] {
  const found = new Set<string>();
  for (const test of tests) {
    if (!test.ran || test.passed) continue;
    if (test.outcome === "ok") {
      for (const wrong of exercise.commonWrong ?? []) {
        if (wrong.test === test.index && compareOutput(wrong.output, test.actual, { kind: "exact" }).equal) {
          found.add(wrong.misconception);
        }
      }
      if (test.usedInputPrompt) found.add(INPUT_PROMPT_MISCONCEPTION);
    } else if (test.error) {
      const misconception = errorMisconception(test.error, code);
      if (misconception) found.add(misconception);
    }
  }
  return [...found];
}
