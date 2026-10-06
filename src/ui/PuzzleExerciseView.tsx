import { Fragment, useState } from "react";
import { fillTemplate } from "../content/exercise";
import { FILL_BLANK, type FillExercise, type ParsonsExercise } from "../content/types";
import { isPseudoError, problemFromOutcome } from "../explain/problem";
import { shuffled, type Rng } from "../game/random";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { FAILED_SUBMITS_BEFORE_SOLUTION, type ExerciseOutcome, type JudgedInfo } from "./CodeExerciseView";
import { useRunner } from "./contexts";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { RobotBubble } from "./RobotBubble";
import { TestResultList } from "./TestResultList";
import { useExplain } from "./useExplain";

/** The lines in a new order: never the right order when another order exists. */
export function scrambleLines(lines: readonly string[], rng: Rng): string[] {
  const out = shuffled(lines, rng);
  const unchanged = out.every((line, i) => line === lines[i]);
  return unchanged && new Set(lines).size > 1 ? [...out.slice(1), out[0] as string] : out;
}

/** A parsons exercise (put the lines in order) or a fill exercise (type the blanks), graded with test cases. */
export function PuzzleExerciseView({
  exercise,
  onComplete,
  onJudged,
  onHint,
  onSolutionViewed,
  rng = Math.random,
}: {
  exercise: ParsonsExercise | FillExercise;
  onComplete(outcome: ExerciseOutcome): void;
  onJudged?(info: JudgedInfo): void;
  onHint?(): void;
  onSolutionViewed?(): void;
  rng?: Rng;
}) {
  const { t, uiLang } = useLang();
  const runner = useRunner();
  const explain = useExplain();
  const [lines, setLines] = useState(() => (exercise.type === "parsons" ? scrambleLines(exercise.lines, rng) : []));
  const [blanks, setBlanks] = useState(() => (exercise.type === "fill" ? exercise.answers.map(() => "") : []));
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [failedSubmits, setFailedSubmits] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const example = exercise.tests.find((test) => !test.hidden) ?? null;
  const code = exercise.type === "parsons" ? `${lines.join("\n")}\n` : fillTemplate(exercise.template, blanks);

  function move(index: number, step: -1 | 1) {
    setLines((current) => {
      const next = [...current];
      [next[index], next[index + step]] = [next[index + step] as string, next[index] as string];
      return next;
    });
  }

  async function handleSubmit() {
    setFeedback(null);
    setJudgeResult(null);
    setBusy(true);
    try {
      const result = await judge(exercise, code, runner.run);
      setJudgeResult(result);
      onJudged?.({ result, code, failedSubmitsBefore: failedSubmits, hintsUsed: hintsShown, viewedSolution: solutionShown });
      if (result.status === "accepted") {
        setSolved(true);
        setFeedback({ mood: "happy", message: t("judge.accepted", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
        onComplete("solved");
        return;
      }
      setFailedSubmits((n) => n + 1);
      const failedTests = result.tests.filter((test) => test.ran && !test.passed);
      const failed = failedTests.find((test) => !test.hidden) ?? failedTests[0] ?? null;
      const problem = failed ? problemFromOutcome(failed, true) : null;
      if (problem && failed && (!failed.hidden || isPseudoError(problem.type))) {
        setFeedback(await feedbackForProblem(problem, code, explain, t));
      } else {
        setFeedback({ mood: "sad", message: t("judge.partial", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
      }
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setBusy(false);
    }
  }

  function showHint() {
    setHintsShown((n) => n + 1);
    onHint?.();
  }

  function showSolution() {
    setSolutionShown(true);
    onSolutionViewed?.();
    onComplete("viewed-solution");
  }

  return (
    <div className="puzzle">
      <p className="exercise-prompt">{pick(exercise.prompt, uiLang)}</p>
      {example && (
        <div className="example">
          <h4>{t("exercise.example")}</h4>
          {example.input !== "" && (
            <>
              <span>{t("judge.input")}</span>
              <pre>{example.input.trimEnd()}</pre>
            </>
          )}
          <span>{t("exercise.expectedOutput")}</span>
          <pre>{example.output.trimEnd()}</pre>
        </div>
      )}
      {exercise.type === "parsons" ? (
        <ol className="parsons-lines" aria-label={t("parsons.lines")}>
          {lines.map((line, i) => (
            <li key={i}>
              <pre className="parsons-line">{line}</pre>
              <button aria-label={t("parsons.up", { n: i + 1 })} disabled={solved || i === 0} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button
                aria-label={t("parsons.down", { n: i + 1 })}
                disabled={solved || i === lines.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <pre className="fill-template">
          <code>
            {exercise.template.split(FILL_BLANK).map((part, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <input
                    aria-label={t("fill.blank", { n: i })}
                    value={blanks[i - 1]}
                    disabled={solved}
                    spellCheck={false}
                    size={Math.max(4, (blanks[i - 1] ?? "").length + 1)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((current) => current.map((old, j) => (j === i - 1 ? value : old)));
                    }}
                  />
                )}
                {part}
              </Fragment>
            ))}
          </code>
        </pre>
      )}
      {exercise.hints.slice(0, hintsShown).map((hint, i) => (
        <p key={i} className="hint">
          {t("hint.title", { n: i + 1 })}: {pick(hint, uiLang)}
        </p>
      ))}
      {hintsShown < exercise.hints.length && !solved && (
        <button onClick={showHint}>{hintsShown === 0 ? t("hint.show") : t("hint.next")}</button>
      )}
      {failedSubmits >= FAILED_SUBMITS_BEFORE_SOLUTION && !solutionShown && !solved && (
        <button onClick={showSolution}>{t("solution.show")}</button>
      )}
      {solutionShown && (
        <div className="solution">
          <h4>{t("solution.title")}</h4>
          <pre>{exercise.solution.trimEnd()}</pre>
        </div>
      )}
      <div className="exercise-actions">
        <button className="primary" onClick={handleSubmit} disabled={busy || solved || runner.status !== "ready"}>
          {t("code.submit")}
        </button>
      </div>
      {busy && <p>{t("code.running")}</p>}
      {feedback && <RobotBubble {...feedback} />}
      {judgeResult && <TestResultList result={judgeResult} />}
    </div>
  );
}
