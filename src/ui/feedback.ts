import { isPseudoError } from "../explain/problem";
import type { Explanation } from "../explain/types";
import type { MessageVars } from "../i18n/translate";
import type { MessageKey } from "../i18n/vi";
import { formatRawError } from "../runner/pyRun";
import type { PyErrorInfo } from "../runner/types";
import type { RobotMood } from "./Robot";

export interface Feedback {
  mood: RobotMood;
  message: string;
  hint: string | null;
  rawError: string | null;
}

export type Translate = (key: MessageKey, vars?: MessageVars) => string;
export type Explain = (error: PyErrorInfo, code: string) => Promise<Explanation | null>;

export async function feedbackForProblem(
  problem: PyErrorInfo,
  code: string,
  explain: Explain,
  t: Translate,
): Promise<Feedback> {
  const explanation = await explain(problem, code);
  return {
    mood: "sad",
    message: explanation ? explanation.text : t("explain.unknown"),
    hint: explanation?.hint ?? null,
    rawError: isPseudoError(problem.type) ? null : formatRawError(problem),
  };
}

export function crashFeedback(t: Translate): Feedback {
  return { mood: "sad", message: t("app.crash"), hint: null, rawError: null };
}
