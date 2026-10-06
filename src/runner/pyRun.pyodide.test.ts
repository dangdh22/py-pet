import { beforeAll, describe, expect, test } from "vitest";
import { getPyRunner } from "../test/pyodide";
import { formatRawError, type PyRunner } from "./pyRun";
import { OUTPUT_LIMIT_CHARS } from "./types";

let run: PyRunner;

beforeAll(async () => {
  run = await getPyRunner();
});

describe("createPyRunner on real Pyodide", () => {
  test("reads input() lines from stdin", () => {
    expect(run("a = int(input())\nb = int(input())\nprint(a + b)", "2\n3\n")).toMatchObject({
      outcome: "ok",
      stdout: "5\n",
      error: null,
      usedInputPrompt: false,
    });
  });

  test("keeps Vietnamese text", () => {
    expect(run('print("Xin chào Robo")', "").stdout).toBe("Xin chào Robo\n");
  });

  test("reports a runtime error with the line of the user code", () => {
    const result = run('print("x")\nprint(y)', "");
    expect(result.outcome).toBe("error");
    expect(result.stdout).toBe("x\n");
    expect(result.error).toEqual({
      type: "NameError",
      message: "name 'y' is not defined",
      line: 2,
      column: null,
      lineText: "print(y)",
    });
  });

  test("reports a syntax error with its line and column", () => {
    expect(run("if True\n    print(1)", "").error).toEqual({
      type: "SyntaxError",
      message: "expected ':'",
      line: 1,
      column: 8,
      lineText: "if True",
    });
  });

  test("reports IndentationError by its own name", () => {
    expect(run("if True:\nprint(1)", "").error).toMatchObject({ type: "IndentationError", line: 2 });
  });

  test("raises EOFError when the input runs out", () => {
    expect(run("print(input())", "").error).toMatchObject({ type: "EOFError", line: 1 });
  });

  test("each run starts with fresh variables", () => {
    run("x = 1", "");
    expect(run("print(x)", "").error?.type).toBe("NameError");
  });

  test("stops output that is too long, even inside try/except Exception", () => {
    const result = run("try:\n    while True:\n        print('spam')\nexcept Exception:\n    pass", "");
    expect(result.outcome).toBe("output-limit");
    expect(result.stdout.length).toBeLessThanOrEqual(OUTPUT_LIMIT_CHARS);
  });

  test("flags input() with a prompt", () => {
    const result = run('x = input("Nhập: ")\nprint(x)', "5\n");
    expect(result.usedInputPrompt).toBe(true);
    expect(result.stdout).toBe("Nhập: 5\n");
  });

  test("sys.exit() ends the program normally", () => {
    expect(run('import sys\nprint("a")\nsys.exit()\nprint("b")', "")).toMatchObject({ outcome: "ok", stdout: "a\n" });
  });

  test("captures stderr and measures the duration", () => {
    const result = run('import sys\nsys.stderr.write("oops")', "");
    expect(result.stderr).toBe("oops");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("formatRawError", () => {
  test("shows the file, the line and the message", () => {
    expect(
      formatRawError({ type: "NameError", message: "name 'y' is not defined", line: 2, column: null, lineText: "print(y)" }),
    ).toBe('File "<bai-cua-con>", line 2\n    print(y)\nNameError: name \'y\' is not defined');
  });

  test("leaves out the location when there is no line", () => {
    expect(formatRawError({ type: "MemoryError", message: "", line: null, column: null, lineText: "" })).toBe(
      "MemoryError: ",
    );
  });
});
