import { useMemo, useState } from "react";
import type { CodeExercise } from "../content/types";
import { problemFromOutcome } from "../explain/problem";
import { errorMisconceptionFrom } from "../explain/providers";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { CodeEditor } from "./CodeEditor";
import { useContent, useRunner } from "./contexts";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { OutputPanel } from "./OutputPanel";
import { RobotBubble } from "./RobotBubble";
import { TestResultList } from "./TestResultList";
import { useExplain } from "./useExplain";

export type ExerciseOutcome = "solved" | "viewed-solution";

const FAILED_SUBMITS_BEFORE_SOLUTION = 3;

export function CodeExerciseView({
  exercise,
  onComplete,
}: {
  exercise: CodeExercise;
  onComplete(outcome: ExerciseOutcome): void;
}) {
  const { t, uiLang } = useLang();
  const runner = useRunner();
  const bundle = useContent();
  const explain = useExplain();
  const misconceptionOf = useMemo(() => errorMisconceptionFrom(bundle.errors), [bundle]);
  const example = exercise.tests.find((test) => !test.hidden) ?? null;

  const [code, setCode] = useState(exercise.starter);
  const [stdin, setStdin] = useState(example?.input ?? "");
  const [busy, setBusy] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [failedSubmits, setFailedSubmits] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  function reset() {
    setFeedback(null);
    setErrorLine(null);
    setRunOutput(null);
    setJudgeResult(null);
  }

  async function handleRun() {
    reset();
    setBusy(true);
    try {
      const result = await runner.run(code, stdin);
      setRunOutput(result.stdout);
      const problem = problemFromOutcome(result, false);
      if (problem) {
        setErrorLine(problem.line);
        setFeedback(await feedbackForProblem(problem, code, explain, t));
      }
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    reset();
    setBusy(true);
    try {
      const result = await judge(exercise, code, runner.run, misconceptionOf);
      setJudgeResult(result);
      if (result.status === "accepted") {
        setFeedback({ mood: "happy", message: t("judge.accepted", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
        onComplete("solved");
        return;
      }
      setFailedSubmits((n) => n + 1);
      const failed = result.tests.find((test) => test.ran && !test.passed);
      const problem = failed ? problemFromOutcome(failed, true) : null;
      if (problem) {
        setErrorLine(problem.line);
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

  function showSolution() {
    setSolutionShown(true);
    onComplete("viewed-solution");
  }

  const disabled = busy || runner.status !== "ready";

  return (
    <div className="exercise-split">
      <section className="exercise-left">
        <p className="exercise-prompt">{pick(exercise.prompt, uiLang)}</p>
        {example && (
          <div className="example">
            <h4>{t("exercise.example")}</h4>
            {example.input !== "" && (
              <>
                <span>{t("judge.input")}</span>
                <pre>{example.input}</pre>
              </>
            )}
            <span>{t("exercise.expectedOutput")}</span>
            <pre>{example.output}</pre>
          </div>
        )}
        {exercise.hints.slice(0, hintsShown).map((hint, i) => (
          <p key={i} className="hint">
            {t("hint.title", { n: i + 1 })}: {pick(hint, uiLang)}
          </p>
        ))}
        {hintsShown < exercise.hints.length && (
          <button onClick={() => setHintsShown((n) => n + 1)}>{hintsShown === 0 ? t("hint.show") : t("hint.next")}</button>
        )}
        {failedSubmits >= FAILED_SUBMITS_BEFORE_SOLUTION && !solutionShown && (
          <button onClick={showSolution}>{t("solution.show")}</button>
        )}
        {solutionShown && (
          <div className="solution">
            <h4>{t("solution.title")}</h4>
            <pre>{exercise.solution.trimEnd()}</pre>
          </div>
        )}
        {feedback && <RobotBubble {...feedback} />}
      </section>
      <section className="exercise-right">
        <CodeEditor value={code} onChange={setCode} errorLine={errorLine} ariaLabel={t("code.editorLabel")} />
        <label className="input-label">
          {t("code.inputLabel")}
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder={t("code.inputPlaceholder")}
            rows={3}
          />
        </label>
        <div className="exercise-actions">
          <button onClick={handleRun} disabled={disabled}>
            {t("code.run")}
          </button>
          <button className="primary" onClick={handleSubmit} disabled={disabled}>
            {t("code.submit")}
          </button>
        </div>
        {busy && <p>{t("code.running")}</p>}
        {runOutput !== null && <OutputPanel stdout={runOutput} />}
        {judgeResult && <TestResultList result={judgeResult} />}
      </section>
    </div>
  );
}
