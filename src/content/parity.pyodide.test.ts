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
import { FILL_BLANK, type ChoiceQuestion, type CodeExercise, type ContentBundle } from "./types";

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
    expect(bundle.errors.length).toBe(39);
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

  test("name-before-assign: a variable used before its assignment is recognized, a never-assigned name is not", () => {
    const code = "print(diem)\ndiem = 5";
    const match = matchError(bundle.errors, problemFromOutcome(run(code, ""), false)!, code);
    expect(match?.entry.id).toBe("name-before-assign");
    expect(match?.vars.name).toBe("diem");
    const other = "print(Robo)";
    expect(matchError(bundle.errors, problemFromOutcome(run(other, ""), false)!, other)?.entry.id).toBe("name-undefined");
  });

  test("stage-3 comparison errors: => and a reversed str/int comparison are recognized, a sep typo is not", () => {
    const cases: [string, string][] = [
      ["print(5 => 3)", "assign-in-call"],
      ['print(9 >= "8")', "compare-str-int"],
      ['print("A", sap="-")', "type-other"],
      ["print(6 * 7 = 42)", "assign-in-call"],
      ["11 = tuoi", "assign-to-literal"],
    ];
    for (const [code, id] of cases) {
      const problem = problemFromOutcome(run(code, ""), false);
      expect(matchError(bundle.errors, problem!, code)?.entry.id).toBe(id);
    }
  });

  test("= instead of == in an if/elif/while condition: every form is recognized in Pyodide 3.14", () => {
    const cases: [string, string][] = [
      ["n = 4\nif n % 2 = 0:\n    print(1)", "assign-in-condition"],
      ["a = 1\nb = 2\nif a + b = 3:\n    print(1)", "assign-in-condition"],
      ["a = 1\nb = 9\nif a + b > 20:\n    print(1)\nelif a + b = 10:\n    print(2)", "assign-in-condition"],
      ["x = 5\nif x = 5:\n    print(x)", "assign-in-condition"],
      ["n = 4\nif n % 4 == 0 and n % 100 = 0:\n    print(1)", "assign-in-if"],
      ["a = 1\nb = 2\nif a == 1 and b = 2:\n    print(1)", "assign-in-if"],
      ["x = 1\nif x == 1 or x = 2:\n    print(1)", "assign-in-if"],
    ];
    for (const [code, id] of cases) {
      const problem = problemFromOutcome(run(code, ""), false);
      expect(problem?.type).toBe("SyntaxError");
      expect(matchError(bundle.errors, problem!, code)?.entry.id).toBe(id);
    }
  });

  test("stage-4 for lines: a missing colon or indentation is explained like on an if line", () => {
    const cases: [string, string][] = [
      ["for i in range(3)\n    print(i)", "missing-colon"],
      ["n = 4\nfor i in range(1, n + 1)\n    print(i)", "missing-colon"],
      ['for ch in "Robo"\n    print(ch)', "missing-colon"],
      ["for i in range(3):\n    print(i)\nelse\n    print(9)", "missing-colon"],
      ["x = 5\nif x > 3\n    print(x)", "missing-colon"],
      ["x = 5\nif x > 3:\n    print(1)\nelse\n    print(2)", "missing-colon"],
      ["for i in range(2):\nprint(i)", "indent-expected"],
      ["for i in range(2):\n    print(i)\n  print(1)", "indent-unmatched"],
    ];
    for (const [code, id] of cases) {
      const problem = problemFromOutcome(run(code, ""), false);
      expect(matchError(bundle.errors, problem!, code)?.entry.id).toBe(id);
    }
  });

  test("stage-4 while lines: colon, indentation and = in the condition are explained like on an if line", () => {
    const cases: [string, string][] = [
      ["i = 0\nwhile i < 3\n    print(i)\n    i = i + 1", "missing-colon"],
      ["pin = 2\nwhile pin > 0\n    pin = pin - 1", "missing-colon"],
      ["n = int(input())\nwhile n != 0\n    n = int(input())", "missing-colon"],
      ["keo = int(input())\nif keo > 0\n    keo = keo - 1", "missing-colon"],
      ["n = 0\nwhile n < 3:\n    n = n + 1\nelse\n    print(n)", "missing-colon"],
      ["i = 0\nwhile i < 3:\nprint(i)", "indent-expected"],
      ["i = 0\nwhile i < 3:\n    print(i)\n  i = i + 1", "indent-unmatched"],
      ["i = 0\nwhile i = 3:\n    i = i + 1", "assign-in-condition"],
      ["x = 5\nwhile x > 0 and x = 2:\n    x = x - 1", "assign-in-if"],
    ];
    for (const [code, id] of cases) {
      const problem = problemFromOutcome(run(code, "0\n"), false);
      expect(matchError(bundle.errors, problem!, code)?.entry.id).toBe(id);
    }
  });

  test("stage-4 endless while loops (lesson s4.while.l2): a printing loop hits the output limit, a silent one is a while timeout", () => {
    for (const code of ['pin = 3\nwhile pin > 0:\n    print("Robo đi 1 vòng")', "i = 1\nwhile i <= 3:\n    print(i)\ni = i + 1"]) {
      const problem = problemFromOutcome(run(code, ""), false);
      expect(problem?.type).toBe("OutputLimit");
      expect(matchError(bundle.errors, problem!, code)?.entry.id).toBe("output-limit");
    }
    const timeout = { type: "Timeout", message: "", line: null, column: null, lineText: "" };
    const silent = "pin = 3\nwhile pin > 0:\n    pin = pin + 1";
    expect(matchError(bundle.errors, timeout, silent)?.entry.id).toBe("timeout-while");
    expect(matchError(bundle.errors, timeout, "x = 0\nfor i in range(10 ** 12):\n    x = x + i")?.entry.id).toBe("timeout");
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

describe("parsons and fill on Pyodide", () => {
  const tests = [{ input: "4", output: "5", hidden: false }];

  test("a parsons program in the right order passes and a shuffled one does not", async () => {
    const lines = ["n = int(input())", "n = n + 1", "print(n)"];
    const spec = { tests, compare: exact };
    expect((await judge(spec, lines.join("\n"), runAsync)).status).toBe("accepted");
    expect((await judge(spec, [lines[0], lines[2], lines[1]].join("\n"), runAsync)).status).toBe("wrong-answer");
  });

  test("a filled template passes and an empty one does not", async () => {
    const template = "n = int(input())\nprint(n ___ 1)\n";
    const spec = { tests, compare: exact };
    expect((await judge(spec, template.replace(FILL_BLANK, "+"), runAsync)).status).toBe("accepted");
    expect((await judge(spec, template.replace(FILL_BLANK, ""), runAsync)).status).toBe("error");
  });
});

describe("lesson content on Pyodide", () => {
  test("stage 1 has content", () => {
    expect(allLessons(bundle).length).toBeGreaterThan(0);
  });

  const exercises = allExercises(bundle);

  for (const exercise of exercises) {
    if (exercise.type !== "parsons" && exercise.type !== "fill") continue;
    test(`${exercise.id}: the ${exercise.type} solution passes on Pyodide`, async () => {
      expect((await judge(exercise, exercise.solution, runAsync)).status).toBe("accepted");
      if (exercise.type === "fill") {
        const empty = exercise.template.replaceAll(FILL_BLANK, "");
        expect((await judge(exercise, empty, runAsync)).status).not.toBe("accepted");
      }
    });
  }

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
