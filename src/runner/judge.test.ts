import { describe, expect, test } from "vitest";
import type { CodeExercise } from "../content/types";
import { INPUT_PROMPT_MISCONCEPTION, judge } from "./judge";
import type { RunFn, RunResult } from "./types";

const exercise: CodeExercise = {
  id: "ex",
  type: "code",
  concepts: [],
  prompt: { vi: "Cộng 1" },
  starter: "",
  solution: "print(int(input()) + 1)",
  tests: [
    { input: "1", output: "2", hidden: false },
    { input: "5", output: "6", hidden: true },
  ],
  commonWrong: [{ test: 0, output: "11", misconception: "input-str", sample: "print(input() + '1')" }],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};

const result = (stdout: string, extra: Partial<RunResult> = {}): RunResult => ({
  stdout,
  stderr: "",
  durationMs: 1,
  outcome: "ok",
  error: null,
  usedInputPrompt: false,
  ...extra,
});

function fakeRun(byInput: (stdin: string) => RunResult): RunFn & { calls: string[] } {
  const calls: string[] = [];
  const run = async (_code: string, stdin: string) => {
    calls.push(stdin);
    return byInput(stdin);
  };
  return Object.assign(run, { calls });
}

describe("judge", () => {
  test("accepts when every test matches", async () => {
    const run = fakeRun((stdin) => result(`${Number(stdin) + 1}  \n`));
    const judged = await judge(exercise, "code", run);
    expect(judged.status).toBe("accepted");
    expect(judged.passedCount).toBe(2);
    expect(judged.total).toBe(2);
    expect(judged.misconceptions).toEqual([]);
    expect(judged.tests.map((t) => t.hidden)).toEqual([false, true]);
  });

  test("reports a wrong answer with the first different line", async () => {
    const judged = await judge(exercise, "code", fakeRun(() => result("7\n")));
    expect(judged.status).toBe("wrong-answer");
    expect(judged.passedCount).toBe(0);
    expect(judged.tests[0]).toMatchObject({ passed: false, ran: true, expected: "2", actual: "7\n", firstDiffLine: 0 });
  });

  test("detects a common wrong output only for its own test", async () => {
    const judged = await judge(exercise, "code", fakeRun((stdin) => result(`${stdin}1\n`)));
    expect(judged.misconceptions).toEqual(["input-str"]);
    const onlySecond = await judge(exercise, "code", fakeRun((stdin) => result(stdin === "1" ? "2\n" : "11\n")));
    expect(onlySecond.misconceptions).toEqual([]);
  });

  test("adds the input-prompt misconception", async () => {
    const run = fakeRun((stdin) => result(`Nhập: ${Number(stdin) + 1}\n`, { usedInputPrompt: true }));
    const judged = await judge(exercise, "code", run);
    expect(judged.status).toBe("wrong-answer");
    expect(judged.misconceptions).toEqual([INPUT_PROMPT_MISCONCEPTION]);
  });

  test("reports errors and asks for the error misconception", async () => {
    const error = { type: "NameError", message: "name 'x' is not defined", line: 1, column: null, lineText: "print(x)" };
    const run = fakeRun(() => result("", { outcome: "error", error }));
    const judged = await judge(exercise, "print(x)", run, (e, code) => (e.type === "NameError" && code === "print(x)" ? "string-quotes" : undefined));
    expect(judged.status).toBe("error");
    expect(judged.tests[0]).toMatchObject({ passed: false, outcome: "error", error });
    expect(judged.misconceptions).toEqual(["string-quotes"]);
  });

  test("treats output-limit as an error", async () => {
    const judged = await judge(exercise, "code", fakeRun(() => result("spam", { outcome: "output-limit" })));
    expect(judged.status).toBe("error");
  });

  test("stops after a timeout and marks the other tests as not run", async () => {
    const run = fakeRun(() => result("", { outcome: "timeout" }));
    const judged = await judge(exercise, "code", run);
    expect(judged.status).toBe("timeout");
    expect(run.calls).toEqual(["1"]);
    expect(judged.tests[1]).toMatchObject({ ran: false, passed: false, outcome: null, actual: "" });
  });
});
