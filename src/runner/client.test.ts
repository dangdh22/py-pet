import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { FakeWorker } from "../test/fakeWorker";
import { RunnerClient, RunnerCrashError } from "./client";
import type { RunResult } from "./types";

function setup() {
  const workers: FakeWorker[] = [];
  const client = new RunnerClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker;
  }, "http://localhost/pyodide/");
  return { client, workers, current: () => workers[workers.length - 1] as FakeWorker };
}

const flush = async () => {
  for (let i = 0; i < 20; i += 1) await Promise.resolve();
};

const ok = (stdout: string): RunResult => ({
  stdout,
  stderr: "",
  durationMs: 1,
  outcome: "ok",
  error: null,
  usedInputPrompt: false,
});

describe("RunnerClient", () => {
  test("starts a worker and sends init", () => {
    const { client, current } = setup();
    expect(current().sent[0]).toEqual({ type: "init", indexURL: "http://localhost/pyodide/" });
    expect(client.status).toBe("loading");
  });

  test("becomes ready and notifies subscribers", () => {
    const { client, current } = setup();
    const seen: string[] = [];
    client.subscribe((status) => seen.push(status));
    current().emit({ type: "ready" });
    expect(client.status).toBe("ready");
    expect(seen).toEqual(["loading", "ready"]);
  });

  test("a run waits for ready, then resolves with the matching result", async () => {
    const { client, current } = setup();
    const pending = client.run("print(1)", "");
    await flush();
    expect(current().lastRun()).toBeUndefined();
    current().emit({ type: "ready" });
    await flush();
    const request = current().lastRun();
    expect(request).toMatchObject({ type: "run", code: "print(1)", stdin: "" });
    current().emit({ type: "result", id: request!.id, result: ok("1\n") });
    await expect(pending).resolves.toEqual(ok("1\n"));
  });

  test("runs are serialized", async () => {
    const { client, current } = setup();
    current().emit({ type: "ready" });
    const first = client.run("print(1)", "");
    const second = client.run("print(2)", "");
    await flush();
    expect(current().sent.filter((m) => m.type === "run")).toHaveLength(1);
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("1\n") });
    await expect(first).resolves.toEqual(ok("1\n"));
    await flush();
    expect(current().lastRun()).toMatchObject({ code: "print(2)" });
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("2\n") });
    await expect(second).resolves.toEqual(ok("2\n"));
  });

  test("ignores a result with an unknown id", async () => {
    const { client, current } = setup();
    current().emit({ type: "ready" });
    const pending = client.run("print(1)", "");
    await flush();
    current().emit({ type: "result", id: 999, result: ok("x") });
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("1\n") });
    await expect(pending).resolves.toEqual(ok("1\n"));
  });

  test("init failure makes the status failed and runs reject", async () => {
    const { client, current } = setup();
    current().emit({ type: "init-failed", message: "no wasm" });
    expect(client.status).toBe("failed");
    await expect(client.run("print(1)", "")).rejects.toThrow("no wasm");
  });

  test("a crash during a run rejects and restarts the worker", async () => {
    const { client, workers, current } = setup();
    current().emit({ type: "ready" });
    const pending = client.run("print(1)", "");
    await flush();
    current().crash();
    await expect(pending).rejects.toBeInstanceOf(RunnerCrashError);
    expect(workers).toHaveLength(2);
    expect(workers[0]!.terminated).toBe(true);
    expect(client.status).toBe("loading");
  });

  test("3 crashes in a row make the status failed", async () => {
    const { client, workers, current } = setup();
    for (let i = 0; i < 3; i += 1) {
      current().emit({ type: "ready" });
      const pending = client.run("print(1)", "");
      await flush();
      current().crash();
      await expect(pending).rejects.toBeInstanceOf(RunnerCrashError);
    }
    expect(client.status).toBe("failed");
    expect(workers).toHaveLength(3);
    await expect(client.run("print(1)", "")).rejects.toBeInstanceOf(RunnerCrashError);
  });

  test("retry starts a new worker after a failure", () => {
    const { client, workers, current } = setup();
    current().emit({ type: "init-failed", message: "no wasm" });
    client.retry();
    expect(workers).toHaveLength(2);
    expect(client.status).toBe("loading");
    current().emit({ type: "ready" });
    expect(client.status).toBe("ready");
  });

  test("a run-failed message rejects the run with RunnerCrashError and keeps the worker", async () => {
    const { client, workers, current } = setup();
    current().emit({ type: "ready" });
    const pending = client.run("print(1)", "");
    await flush();
    const request = current().lastRun()!;
    current().emit({ type: "run-failed", id: request.id, message: "boom" });
    await expect(pending).rejects.toBeInstanceOf(RunnerCrashError);
    expect(workers).toHaveLength(1);
    expect(client.status).toBe("ready");
    const next = client.run("print(2)", "");
    await flush();
    expect(current().lastRun()).toMatchObject({ code: "print(2)" });
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("2\n") });
    await expect(next).resolves.toEqual(ok("2\n"));
  });

  test("retry while loading does nothing", () => {
    const { client, workers } = setup();
    client.retry();
    expect(workers).toHaveLength(1);
    expect(workers[0]!.terminated).toBe(false);
  });

  describe("timeouts", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    test("a run that is too long returns timeout and restarts the worker", async () => {
      const { client, workers, current } = setup();
      current().emit({ type: "ready" });
      const pending = client.run("while True:\n    pass", "", 2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(current().lastRun()).toBeDefined();
      await vi.advanceTimersByTimeAsync(2000);
      await expect(pending).resolves.toEqual({
        stdout: "",
        stderr: "",
        durationMs: 2000,
        outcome: "timeout",
        error: null,
        usedInputPrompt: false,
      });
      expect(workers[0]!.terminated).toBe(true);
      expect(workers).toHaveLength(2);
      expect(workers[1]!.sent[0]).toMatchObject({ type: "init" });
      expect(client.status).toBe("loading");
    });
  });
});
