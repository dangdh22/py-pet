import { useState } from "react";
import type { CodeExercise } from "../content/types";
import type { QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { CodeEditor } from "./CodeEditor";
import { useRunner } from "./contexts";
import { LangSwitch, Prompt } from "./LangSwitch";
import { OutputPanel } from "./OutputPanel";

/**
 * A code exercise in a test: the child may run the code with their own input, then submits once. The result stays
 * hidden until the end of the test; no hints, no solution, no lesson draft.
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
  const example = exercise.tests.find((test) => !test.hidden) ?? null;
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [code, setCode] = useState(exercise.starter);
  const [stdin, setStdin] = useState(example?.input ?? "");
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleRun() {
    setBusy(true);
    setFailed(false);
    try {
      setOutput((await runner.run(code, stdin)).stdout);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    setBusy(true);
    setFailed(false);
    try {
      const result = await judge(exercise, code, runner.run);
      setSubmitted(true);
      onSubmitted({ result, code });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || submitted || runner.status !== "ready";
  return (
    <div className="exercise-split">
      <section className="exercise-left">
        <LangSwitch lang={lang} onChange={setLang} />
        <Prompt text={exercise.prompt} lang={lang} />
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
      </section>
      <section className="exercise-right">
        <CodeEditor value={code} onChange={setCode} errorLine={null} ariaLabel={t("code.editorLabel")} />
        <label className="input-label">
          {t("code.inputLabel")}
          <textarea value={stdin} onChange={(event) => setStdin(event.target.value)} rows={3} />
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
        {failed && <p role="alert">{t("app.crash")}</p>}
        {output !== null && <OutputPanel stdout={output} />}
        {submitted && <p className="exam-answered">{t("exam.submitted")}</p>}
      </section>
    </div>
  );
}
