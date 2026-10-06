import type { PyodideAPI } from "pyodide";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import { createPyRunner, type PyRunner } from "./pyRun";

interface WorkerScope {
  postMessage(message: WorkerResponse): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
}

const scope = self as unknown as WorkerScope;
let runner: PyRunner | null = null;

scope.onmessage = async (event) => {
  const message = event.data;
  if (message.type === "init") {
    try {
      const url = `${message.indexURL}pyodide.mjs`;
      const module = (await import(/* @vite-ignore */ url)) as {
        loadPyodide(options: { indexURL: string }): Promise<PyodideAPI>;
      };
      const py = await module.loadPyodide({ indexURL: message.indexURL });
      runner = createPyRunner(py);
      scope.postMessage({ type: "ready" });
    } catch (error) {
      scope.postMessage({ type: "init-failed", message: String(error) });
    }
    return;
  }
  if (!runner) {
    scope.postMessage({ type: "run-failed", id: message.id, message: "Pyodide is not ready" });
    return;
  }
  try {
    scope.postMessage({ type: "result", id: message.id, result: runner(message.code, message.stdin) });
  } catch (error) {
    scope.postMessage({ type: "run-failed", id: message.id, message: String(error) });
  }
};
