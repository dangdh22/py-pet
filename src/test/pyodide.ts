import { loadPyodide } from "pyodide";
import { createPyRunner, type PyRunner } from "../runner/pyRun";

let runner: Promise<PyRunner> | null = null;

/** Loads Pyodide in Node once per test file. */
export function getPyRunner(): Promise<PyRunner> {
  runner ??= loadPyodide().then(createPyRunner);
  return runner;
}
