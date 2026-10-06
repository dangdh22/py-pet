import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi, type Mock } from "vitest";
import type { ContentBundle, Lang } from "../content/types";
import type { RunnerStatus } from "../runner/client";
import type { PyErrorInfo, RunResult } from "../runner/types";
import { AppProviders, type RunnerApi } from "../ui/contexts";
import { testBundle } from "./fixtures";

export function okResult(stdout: string, extra: Partial<RunResult> = {}): RunResult {
  return { stdout, stderr: "", durationMs: 5, outcome: "ok", error: null, usedInputPrompt: false, ...extra };
}

export function errorResult(
  error: Pick<PyErrorInfo, "type" | "message" | "line"> & Partial<PyErrorInfo>,
  stdout = "",
): RunResult {
  return {
    stdout,
    stderr: "",
    durationMs: 5,
    outcome: "error",
    error: { column: null, lineText: "", ...error },
    usedInputPrompt: false,
  };
}

export interface FakeRunner extends RunnerApi {
  /** Each run; `timeoutMs` only when the caller gave one. */
  calls: { code: string; stdin: string; timeoutMs?: number }[];
  retry: Mock<() => void>;
}

export function fakeRunner(
  impl: (code: string, stdin: string) => RunResult | Promise<RunResult>,
  status: RunnerStatus = "ready",
): FakeRunner {
  const calls: FakeRunner["calls"] = [];
  return {
    status,
    calls,
    retry: vi.fn(),
    run: async (code, stdin, timeoutMs) => {
      calls.push(timeoutMs === undefined ? { code, stdin } : { code, stdin, timeoutMs });
      return impl(code, stdin);
    },
  };
}

export function renderWithApp(
  ui: ReactElement,
  options: { bundle?: ContentBundle; runner?: RunnerApi; lang?: Lang } = {},
): RenderResult {
  return render(
    <AppProviders
      bundle={options.bundle ?? testBundle()}
      runner={options.runner ?? fakeRunner(() => okResult(""))}
      initialLang={options.lang ?? "vi"}
    >
      {ui}
    </AppProviders>,
  );
}
