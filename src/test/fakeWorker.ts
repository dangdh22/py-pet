import type { WorkerLike } from "../runner/client";
import type { WorkerRequest, WorkerResponse } from "../runner/protocol";

type RunRequest = Extract<WorkerRequest, { type: "run" }>;

export class FakeWorker implements WorkerLike {
  onmessage: WorkerLike["onmessage"] = null;
  onerror: WorkerLike["onerror"] = null;
  readonly sent: WorkerRequest[] = [];
  terminated = false;

  postMessage(message: WorkerRequest): void {
    this.sent.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  emit(message: WorkerResponse): void {
    this.onmessage?.({ data: message });
  }

  crash(): void {
    this.onerror?.(new Error("worker crashed"));
  }

  lastRun(): RunRequest | undefined {
    return [...this.sent].reverse().find((m): m is RunRequest => m.type === "run");
  }
}
