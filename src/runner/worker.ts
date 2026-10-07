import type { PyodideAPI } from "pyodide";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import { createPyRunner, type PyRunner } from "./pyRun";

interface WorkerScope {
  postMessage(message: WorkerResponse): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
}

const scope = self as unknown as WorkerScope;
let runner: PyRunner | null = null;
let initializing = false;

/** Reports a failed start once; a later report for the same start is ignored. */
function failInit(message: string): void {
  if (!initializing) return;
  initializing = false;
  scope.postMessage({ type: "init-failed", message });
}

// Pyodide (Emscripten) does not reject loadPyodide when the .wasm cannot be fetched: it logs "wasm instantiation
// failed!" and leaves an unhandled rejection, so the start would hang until the client's start timeout.
self.addEventListener("unhandledrejection", (event) => failInit(String(event.reason)));

scope.onmessage = async (event) => {
  const message = event.data;
  if (message.type === "init") {
    initializing = true;
    try {
      const url = `${message.indexURL}pyodide.mjs`;
      const module = (await import(/* @vite-ignore */ url)) as {
        loadPyodide(options: { indexURL: string }): Promise<PyodideAPI>;
      };
      const py = await module.loadPyodide({ indexURL: message.indexURL });
      runner = createPyRunner(py);
      initializing = false;
      scope.postMessage({ type: "ready" });
    } catch (error) {
      failInit(String(error));
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
