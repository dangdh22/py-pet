import type { LocalizedText } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";

export const FAILED_SUBMITS_BEFORE_SOLUTION = 3;

/**
 * The help of an exercise: the hints opened so far, the buttons for the next hint and for the solution, and the solution
 * once it is shown. The solution button is always there until the solution is shown, but it stays off until the child
 * has failed enough submits. A finished exercise (solved) needs no more help, so both buttons go away.
 */
export function ExerciseHelp({
  hints,
  shown,
  onHint,
  failedSubmits,
  solution,
  solutionShown,
  onShowSolution,
  finished = false,
}: {
  hints: LocalizedText[];
  shown: number;
  onHint(): void;
  failedSubmits: number;
  solution: string;
  solutionShown: boolean;
  onShowSolution(): void;
  finished?: boolean;
}) {
  const { t, uiLang } = useLang();
  const canHint = shown < hints.length && !finished;
  const canShowSolution = !solutionShown && !finished;
  const solutionLocked = failedSubmits < FAILED_SUBMITS_BEFORE_SOLUTION;
  return (
    <div className="exercise-help">
      {hints.slice(0, shown).map((hint, i) => (
        <p key={i} className="hint">
          {t("hint.title", { n: i + 1 })}: {pick(hint, uiLang)}
        </p>
      ))}
      {(canHint || canShowSolution) && (
        <div className="exercise-help-buttons">
          {canHint && (
            <button className="small" onClick={onHint}>
              {t("hint.button", { n: shown + 1, total: hints.length })}
            </button>
          )}
          {canShowSolution && (
            <button className="small" onClick={onShowSolution} disabled={solutionLocked}>
              {t("solution.show")}
              {solutionLocked && <small aria-hidden="true">{t("solution.after", { n: FAILED_SUBMITS_BEFORE_SOLUTION })}</small>}
            </button>
          )}
        </div>
      )}
      {solutionShown && (
        <div className="solution">
          <h4>{t("solution.title")}</h4>
          <pre>{solution.trimEnd()}</pre>
        </div>
      )}
    </div>
  );
}
