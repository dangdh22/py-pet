import type { CompareMode } from "../content/types";

export interface CompareResult {
  equal: boolean;
  /** 0-based index of the first line that differs, or null when equal. */
  firstDiffLine: number | null;
}

export function normalizeOutput(text: string): string[] {
  const lines = text
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function isNumber(token: string): boolean {
  return token !== "" && !Number.isNaN(Number(token));
}

function linesEqual(expected: string | undefined, actual: string | undefined, mode: CompareMode): boolean {
  if (expected === undefined || actual === undefined) return false;
  if (mode.kind === "exact") return expected === actual;
  const expectedTokens = expected.trim().split(/\s+/);
  const actualTokens = actual.trim().split(/\s+/);
  if (expectedTokens.length !== actualTokens.length) return false;
  return expectedTokens.every((token, i) => {
    const other = actualTokens[i] as string;
    if (isNumber(token) && isNumber(other)) return Math.abs(Number(token) - Number(other)) <= mode.tolerance;
    return token === other;
  });
}

export function compareOutput(expected: string, actual: string, mode: CompareMode): CompareResult {
  const expectedLines = normalizeOutput(expected);
  const actualLines = normalizeOutput(actual);
  const count = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < count; i += 1) {
    if (!linesEqual(expectedLines[i], actualLines[i], mode)) return { equal: false, firstDiffLine: i };
  }
  return { equal: true, firstDiffLine: null };
}
