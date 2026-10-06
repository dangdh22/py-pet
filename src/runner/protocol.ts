import type { RunResult } from "./types";

export type WorkerRequest =
  | { type: "init"; indexURL: string }
  | { type: "run"; id: number; code: string; stdin: string };

export type WorkerResponse =
  | { type: "ready" }
  | { type: "init-failed"; message: string }
  | { type: "result"; id: number; result: RunResult }
  | { type: "run-failed"; id: number; message: string };
