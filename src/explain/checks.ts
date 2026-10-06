import type { CheckName } from "../content/types";
import type { PyErrorInfo } from "../runner/types";

export interface CheckInput {
  error: PyErrorInfo;
  code: string;
  vars: Record<string, string>;
}

export type CheckResult = { ok: true; vars: Record<string, string> } | { ok: false };

const KNOWN_NAMES = [
  "print", "input", "int", "float", "str", "len", "range", "round", "abs", "max", "min", "sum",
  "list", "dict", "bool", "type", "True", "False", "None",
];

export function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min((previous[j] as number) + 1, (current[j - 1] as number) + 1, (previous[j - 1] as number) + cost);
    }
    previous = current;
  }
  return previous[b.length] as number;
}

function stripStringsAndComments(code: string): string {
  return code
    .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g, '""')
    .replace(/#.*$/gm, "");
}

/** A known or used name that looks like `name`: same letters in another case, or a small typo. */
export function findSimilarName(name: string, code: string): string | null {
  const used = stripStringsAndComments(code).match(/[\p{L}_][\p{L}\p{N}_]*/gu) ?? [];
  const candidates = new Set<string>([...KNOWN_NAMES, ...used]);
  candidates.delete(name);
  const lower = name.toLowerCase();
  for (const candidate of candidates) {
    if (candidate.toLowerCase() === lower) return candidate;
  }
  const maxDistance = name.length <= 4 ? 1 : 2;
  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (candidate[0]?.toLowerCase() !== lower[0]) continue;
    const distance = levenshtein(lower, candidate.toLowerCase());
    if (distance <= maxDistance && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

export const checks: Record<CheckName, (input: CheckInput) => CheckResult> = {
  "similar-name": ({ code, vars }) => {
    const name = vars.name;
    if (!name) return { ok: false };
    const suggestion = findSimilarName(name, code);
    return suggestion ? { ok: true, vars: { ...vars, suggestion } } : { ok: false };
  },
  "assign-in-condition": ({ error, vars }) =>
    /^\s*(if|elif|while)\b/.test(error.lineText) ? { ok: true, vars } : { ok: false },
  "while-loop": ({ code, vars }) => (/^\s*while\b/m.test(code) ? { ok: true, vars } : { ok: false }),
};
