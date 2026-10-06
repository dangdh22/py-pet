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
  private readonly listeners = new Set<(status: RunnerStatus) => void>();

  constructor(
    private readonly createWorker: WorkerFactory,
    private readonly indexURL: string,
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
    for (const listener of this.listeners) listener(status);
  }

  private start(): void {
    const worker = this.createWorker();
    this.worker = worker;
    this.setStatus("loading");
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (event) => {
        const message = event.data;
        switch (message.type) {
          case "ready":
            this.setStatus("ready");
            resolve();
            break;
          case "init-failed":
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
