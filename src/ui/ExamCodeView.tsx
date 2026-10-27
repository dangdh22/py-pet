import { useMemo, useState } from "react";
import type { CodeExercise } from "../content/types";
import { problemFromOutcome } from "../explain/problem";
import { errorMisconceptionFrom } from "../explain/providers";
import type { QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { CodeEditor } from "./CodeEditor";
import { useContent, useRunner } from "./contexts";
import { ExampleTable } from "./ExampleTable";
import { feedbackForProblem, type Feedback } from "./feedback";
import { Icon } from "./icons";
import { LangSwitch, Prompt } from "./LangSwitch";
import { OutputPanel } from "./OutputPanel";
import { RobotBubble } from "./RobotBubble";
import { useExplain } from "./useExplain";

/**
 * A code exercise in a test: the child may run the code with their own input, then submits once. The result stays
 * hidden until the end of the test; no hints, no solution, no lesson draft. A trial run explains its errors like a
 * lesson run does; a submit shows nothing.
 */
export function ExamCodeView({
  exercise,
  onSubmitted,
}: {
  exercise: CodeExercise;
  onSubmitted(info: { result: JudgeResult; code: string }): void;
}) {
  const { t, questionLang } = useLang();
  const runner = useRunner();
  const bundle = useContent();
  const explain = useExplain();
  const misconceptionOf = useMemo(() => errorMisconceptionFrom(bundle.errors), [bundle]);
  const example = exercise.tests.find((test) => !test.hidden) ?? null;
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [code, setCode] = useState(exercise.starter);
  const [stdin, setStdin] = useState(example?.input ?? "");
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState<"run" | "submit" | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  async function handleRun() {
    setBusy(true);
    setFailed(null);
    setFeedback(null);
    setErrorLine(null);
    try {
      const result = await runner.run(code, stdin);
      setOutput(result.stdout);
      const problem = problemFromOutcome(result, false);
      if (problem) {
        setErrorLine(problem.line);
        setFeedback(await feedbackForProblem(problem, code, explain, t));
      }
    } catch {
      setFailed("run");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    setBusy(true);
    setFailed(null);
    setFeedback(null);
    setErrorLine(null);
    try {
      const result = await judge(exercise, code, runner.run, misconceptionOf);
      setSubmitted(true);
      onSubmitted({ result, code });
    } catch {
      setFailed("submit");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || submitted || runner.status !== "ready";
  return (
    <div className="exercise-split">
      <section className="card problem-card">
        <LangSwitch lang={lang} onChange={setLang} />
        <Prompt text={exercise.prompt} lang={lang} />
        {example && <ExampleTable input={example.input} output={example.output} />}
        {feedback && <RobotBubble {...feedback} />}
      </section>
      <section className="ide">
        <CodeEditor value={code} onChange={setCode} errorLine={errorLine} ariaLabel={t("code.editorLabel")} />
        <div className="io">
          <label className="box input-box">
            <span className="box-head">{t("code.inputLabel")}</span>
            <textarea value={stdin} onChange={(event) => setStdin(event.target.value)} rows={4} />
          </label>
          <div className="io-result">
            {busy && <p>{t("code.running")}</p>}
            {failed && <p role="alert">{t(failed === "submit" ? "exam.submitFailed" : "app.crash")}</p>}
            {output !== null && <OutputPanel stdout={output} />}
          </div>
        </div>
        <div className="actions">
          <button onClick={handleRun} disabled={disabled}>
            <Icon name="play" />
            {t("code.run")}
          </button>
          <button className="primary" onClick={handleSubmit} disabled={disabled}>
            {t("code.submit")}
          </button>
        </div>
        {submitted && <p className="exam-answered">{t("exam.submitted")}</p>}
      </section>
    </div>
  );
}
