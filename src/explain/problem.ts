import type { PyErrorInfo, RunOutcome } from "../runner/types";

export const PSEUDO_ERROR_TYPES = ["Timeout", "OutputLimit", "InputPrompt"] as const;

export function isPseudoError(type: string): boolean {
  return (PSEUDO_ERROR_TYPES as readonly string[]).includes(type);
}

function pseudo(type: (typeof PSEUDO_ERROR_TYPES)[number]): PyErrorInfo {
  return { type, message: "", line: null, column: null, lineText: "" };
}

/** The problem to explain for 1 run, or null when there is nothing to explain. */
export function problemFromOutcome(
  outcome: { outcome: RunOutcome | null; error: PyErrorInfo | null; usedInputPrompt: boolean },
  judgedWrong: boolean,
): PyErrorInfo | null {
  switch (outcome.outcome) {
    case "error":
      return outcome.error;
    case "timeout":
      return pseudo("Timeout");
    case "output-limit":
      return pseudo("OutputLimit");
    case "ok":
      return judgedWrong && outcome.usedInputPrompt ? pseudo("InputPrompt") : null;
    default:
      return null;
  }
}
