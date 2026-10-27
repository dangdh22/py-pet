import { useEffect, useMemo, useState } from "react";
import type { CodeExercise } from "../content/types";
import type { ExerciseStats } from "../game/state";
import { isPseudoError, problemFromOutcome } from "../explain/problem";
import { errorMisconceptionFrom } from "../explain/providers";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { CodeEditor } from "./CodeEditor";
import { useContent, useRunner } from "./contexts";
import { ExampleTable } from "./ExampleTable";
import { ExerciseHelp } from "./ExerciseHelp";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { Icon } from "./icons";
import { OutputPanel } from "./OutputPanel";
import { RobotBubble } from "./RobotBubble";
import { TestResultList } from "./TestResultList";
import { useExplain } from "./useExplain";

export type ExerciseOutcome = "solved" | "viewed-solution";

export interface JudgedInfo {
  result: JudgeResult;
  code: string;
  failedSubmitsBefore: number;
  hintsUsed: number;
  viewedSolution: boolean;
}

export function CodeExerciseView({
  exercise,
  onComplete,
  initialCode,
  onCodeChange,
  onJudged,
  initialStats,
  onHint,
  onSolutionViewed,
}: {
  exercise: CodeExercise;
  onComplete(outcome: ExerciseOutcome): void;
  initialCode?: string;
  onCodeChange?(code: string): void;
  onJudged?(info: JudgedInfo): void;
  /** Saved counts from an earlier visit, so a reload does not reset them. */
  initialStats?: ExerciseStats;
  onHint?(): void;
  onSolutionViewed?(): void;
}) {
  const { t, uiLang } = useLang();
  const runner = useRunner();
  const bundle = useContent();
  const explain = useExplain();
  const misconceptionOf = useMemo(() => errorMisconceptionFrom(bundle.errors), [bundle]);
  const example = exercise.tests.find((test) => !test.hidden) ?? null;

  const [code, setCode] = useState(initialCode ?? exercise.starter);
  const [stdin, setStdin] = useState(example?.input ?? "");
  const [busy, setBusy] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(() => Math.min(initialStats?.hints ?? 0, exercise.hints.length));
  const [failedSubmits, setFailedSubmits] = useState(initialStats?.fails ?? 0);
  const [solutionShown, setSolutionShown] = useState(initialStats?.viewedSolution ?? false);
  const [solved, setSolved] = useState(false);

  // A solution seen before a reload still counts as this step's outcome. Runs once, on mount.
  useEffect(() => {
    if (initialStats?.viewedSolution) onComplete("viewed-solution");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only: onComplete may change identity on every parent render and must not fire again
  }, []);

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
      // A hidden test may only report pass/fail: explain it only when the problem carries no hidden data.
      if (problem && failed && (!failed.hidden || isPseudoError(problem.type))) {
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

  function showHint() {
    setHintsShown((n) => n + 1);
    onHint?.();
  }

  function showSolution() {
    setSolutionShown(true);
    onSolutionViewed?.();
    onComplete("viewed-solution");
  }

  const disabled = busy || runner.status !== "ready";

  return (
    <div className="exercise-split">
      <section className="card problem-card">
        <p className="kicker">{t("exercise.kindCode")}</p>
        <p className="exercise-prompt">{pick(exercise.prompt, uiLang)}</p>
        {example && <ExampleTable input={example.input} output={example.output} />}
        <ExerciseHelp
          hints={exercise.hints}
          shown={hintsShown}
          onHint={showHint}
          failedSubmits={failedSubmits}
          solution={exercise.solution}
          solutionShown={solutionShown}
          onShowSolution={showSolution}
          finished={solved}
        />
        {feedback && <RobotBubble {...feedback} />}
      </section>
      <section className="ide">
        <CodeEditor value={code} onChange={(value) => {
            setCode(value);
            onCodeChange?.(value);
          }}
          errorLine={errorLine} ariaLabel={t("code.editorLabel")} />
        <div className="io">
          <label className="box input-box">
            <span className="box-head">{t("code.inputLabel")}</span>
            <textarea
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
              placeholder={t("code.inputPlaceholder")}
              rows={4}
            />
          </label>
          <div className="io-result">
            {busy && <p>{t("code.running")}</p>}
            {runOutput !== null && <OutputPanel stdout={runOutput} />}
          </div>
        </div>
        {/* Under the row, not in it: the comparison puts 2 code blocks side by side and needs the width of the whole side. */}
        {judgeResult && <TestResultList result={judgeResult} />}
        <div className="actions">
          <button onClick={handleRun} disabled={disabled}>
            <Icon name="play" />
            {t("code.run")}
          </button>
          <button className="primary" onClick={handleSubmit} disabled={disabled}>
            {t("code.submit")}
          </button>
        </div>
      </section>
    </div>
  );
}
