import { RunnerClient, type WorkerLike } from "./client";

export function createBrowserRunner(): RunnerClient {
  const indexURL = new URL(`${import.meta.env.BASE_URL}pyodide/`, window.location.href).href;
  return new RunnerClient(
    () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }) as unknown as WorkerLike,
    indexURL,
  );
}
