import type { CodeExercise, Lang } from "../content/types";
import type { TestOutcome } from "../runner/judge";
import type { PyErrorInfo } from "../runner/types";

export interface ExplainContext {
  error: PyErrorInfo;
  code: string;
  lang: Lang;
  exercise?: CodeExercise;
  failedTest?: TestOutcome;
  recentMisconceptions?: string[];
}

export interface Explanation {
  text: string;
  hint: string | null;
  entryId: string | null;
  misconception: string | null;
}

export interface ExplainProvider {
  explain(context: ExplainContext): Promise<Explanation | null>;
}
