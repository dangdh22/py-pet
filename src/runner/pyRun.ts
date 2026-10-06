import type { PyodideAPI } from "pyodide";
import { HARNESS_PY } from "./harness";
import { OUTPUT_LIMIT_CHARS, type PyErrorInfo, type RunResult } from "./types";

export type PyRunner = (code: string, stdin: string) => RunResult;

interface HarnessJson {
  outcome: "ok" | "error" | "output-limit";
  error: PyErrorInfo | null;
  stdout: string;
  stderr: string;
  usedInputPrompt: boolean;
}

export function createPyRunner(py: PyodideAPI): PyRunner {
  py.runPython(HARNESS_PY);
  const runUserCode = py.globals.get("run_user_code") as unknown as (code: string, stdin: string, limit: number) => string;
  return (code, stdin) => {
    const started = performance.now();
    const json = runUserCode(code, stdin, OUTPUT_LIMIT_CHARS);
    const durationMs = Math.round(performance.now() - started);
    const parsed = JSON.parse(json) as HarnessJson;
    return { ...parsed, durationMs };
  };
}

export function formatRawError(error: PyErrorInfo): string {
  const location = error.line === null ? "" : `File "<bai-cua-con>", line ${error.line}\n    ${error.lineText.trim()}\n`;
  return `${location}${error.type}: ${error.message}`;
}
