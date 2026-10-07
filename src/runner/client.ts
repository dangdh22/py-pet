import type { WorkerRequest, WorkerResponse } from "./protocol";
import { DEFAULT_TIMEOUT_MS, type RunResult } from "./types";

export type RunnerStatus = "loading" | "ready" | "failed";

export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: { data: WorkerResponse }) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export type WorkerFactory = () => WorkerLike;

export class RunnerCrashError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunnerCrashError";
  }
}

export const MAX_CONSECUTIVE_CRASHES = 3;
/** Design decision 5: Pyodide that is not ready after this long counts as failed to start (a slow school network needs ~10 MB). */
export const START_TIMEOUT_MS = 120_000;

interface PendingRun {
  id: number;
  resolve(result: RunResult): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

export class RunnerClient {
  private worker: WorkerLike | null = null;
  private ready: Promise<void> = Promise.resolve();
  private pending: PendingRun | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private nextId = 1;
  private crashes = 0;
  private currentStatus: RunnerStatus = "loading";
  private startTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<(status: RunnerStatus) => void>();

  constructor(
    private readonly createWorker: WorkerFactory,
    private readonly indexURL: string,
    private readonly startTimeoutMs: number = START_TIMEOUT_MS,
  ) {
    this.start();
  }

  get status(): RunnerStatus {
    return this.currentStatus;
  }

  subscribe(listener: (status: RunnerStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  run(code: string, stdin: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<RunResult> {
    const task = this.queue.then(() => this.runNow(code, stdin, timeoutMs));
    this.queue = task.catch(() => undefined);
    return task;
  }

  retry(): void {
    if (this.currentStatus !== "failed") return;
    this.crashes = 0;
    this.restart();
  }

  private setStatus(status: RunnerStatus): void {
    this.currentStatus = status;
    if (status !== "loading") this.clearStartTimer();
    for (const listener of this.listeners) listener(status);
  }

  private clearStartTimer(): void {
    if (this.startTimer === null) return;
    clearTimeout(this.startTimer);
    this.startTimer = null;
  }

  private start(): void {
    this.clearStartTimer();
    const worker = this.createWorker();
    this.worker = worker;
    this.setStatus("loading");
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (event) => {
        const message = event.data;
        switch (message.type) {
          case "ready":
            // A worker that is no longer current (retry, restart, timeout) must not change the status.
            if (this.worker !== worker) break;
            if (this.currentStatus === "failed") {
              // A late ready after init-failed (a stray rejection while Pyodide went on loading): the worker is
              // usable, so recover with a fresh resolved promise instead of leaving "ready" with a rejected one.
              this.ready = Promise.resolve();
              this.setStatus("ready");
              break;
            }
            if (this.currentStatus !== "loading") break;
            this.setStatus("ready");
            resolve();
            break;
          case "init-failed":
            if (this.worker !== worker || this.currentStatus !== "loading") break;
            this.setStatus("failed");
            reject(new Error(message.message));
            break;
          case "result":
            this.settle(message.id, (pending) => {
              this.crashes = 0;
              pending.resolve(message.result);
            });
            break;
          case "run-failed":
            this.settle(message.id, (pending) => pending.reject(new RunnerCrashError(message.message)));
            break;
        }
      };
      this.startTimer = setTimeout(() => {
        this.startTimer = null;
        if (this.worker !== worker || this.currentStatus !== "loading") return;
        worker.terminate();
        this.setStatus("failed");
        reject(new Error("Pyodide did not become ready in time"));
      }, this.startTimeoutMs);
      worker.onerror = () => {
        if (this.currentStatus === "loading") {
          this.setStatus("failed");
          reject(new Error("Pyodide worker failed to start"));
          return;
        }
        this.handleCrash();
      };
    });
    this.ready.catch(() => undefined);
    worker.postMessage({ type: "init", indexURL: this.indexURL });
  }

  private restart(): void {
    this.worker?.terminate();
    this.start();
  }

  private settle(id: number, action: (pending: PendingRun) => void): void {
    const pending = this.pending;
    if (!pending || pending.id !== id) return;
    clearTimeout(pending.timer);
    this.pending = null;
    action(pending);
  }

  private handleCrash(): void {
    const pending = this.pending;
    if (pending) {
      clearTimeout(pending.timer);
      this.pending = null;
      pending.reject(new RunnerCrashError("Pyodide worker crashed"));
    }
    this.crashes += 1;
    if (this.crashes >= MAX_CONSECUTIVE_CRASHES) {
      this.worker?.terminate();
      this.worker = null;
      this.setStatus("failed");
      this.ready = Promise.reject(new RunnerCrashError("Pyodide worker crashed too many times"));
      this.ready.catch(() => undefined);
      return;
    }
    this.restart();
  }

  private async runNow(code: string, stdin: string, timeoutMs: number): Promise<RunResult> {
    await this.ready;
    const worker = this.worker;
    if (!worker) throw new RunnerCrashError("Pyodide worker is not available");
    const id = this.nextId++;
    return new Promise<RunResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending?.id !== id) return;
        this.pending = null;
        this.restart();
        resolve({ stdout: "", stderr: "", durationMs: timeoutMs, outcome: "timeout", error: null, usedInputPrompt: false });
      }, timeoutMs);
      this.pending = { id, resolve, reject, timer };
      worker.postMessage({ type: "run", id, code, stdin });
    });
  }
}
