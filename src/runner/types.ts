export interface PyErrorInfo {
  type: string;
  message: string;
  line: number | null;
  column: number | null;
  lineText: string;
}

export type RunOutcome = "ok" | "error" | "timeout" | "output-limit";

export interface RunResult {
  stdout: string;
  stderr: string;
  durationMs: number;
  outcome: RunOutcome;
  error: PyErrorInfo | null;
  /** True when the code called input() with a non-empty prompt. */
  usedInputPrompt: boolean;
}

export type RunFn = (code: string, stdin: string, timeoutMs?: number) => Promise<RunResult>;

export const OUTPUT_LIMIT_CHARS = 100_000;
export const DEFAULT_TIMEOUT_MS = 2_000;
