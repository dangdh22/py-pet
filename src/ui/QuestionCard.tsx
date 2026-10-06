import { useState } from "react";
import type { ChoiceQuestion } from "../content/types";
import type { QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { LangSwitch, Prompt, showText } from "./LangSwitch";
import { RobotBubble } from "./RobotBubble";

/**
 * 1 predict/mcq question. In a test (`exam`), the answer is only recorded: no right/wrong marks and no explanation
 * until the end (spec 8.2.4).
 */
export function QuestionCard({
  question,
  onAnswered,
  exam = false,
}: {
  question: ChoiceQuestion;
  onAnswered(correct: boolean, detail: { choiceIndex: number; lang: QuestionLang }): void;
  exam?: boolean;
}) {
  const { t, questionLang } = useLang();
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correctIndex = question.choices.findIndex((choice) => choice.correct);
  const isCorrect = selected === correctIndex;

  function check() {
    if (selected === null) return;
    setChecked(true);
    onAnswered(isCorrect, { choiceIndex: selected, lang });
  }

  function choiceClass(i: number): string {
    if (!checked || exam) return "choice";
    if (i === correctIndex) return "choice choice-correct";
    if (i === selected) return "choice choice-wrong";
    return "choice";
  }

  return (
    <div className="question-card">
      <LangSwitch lang={lang} onChange={setLang} />
      <Prompt text={question.prompt} lang={lang} />
      {question.code && (
        <pre className="code-block">
          <code>{question.code.trimEnd()}</code>
        </pre>
      )}
      <fieldset disabled={checked}>
        <legend className="sr-only">{t("question.choices")}</legend>
        {question.choices.map((choice, i) => (
          <label key={i} className={choiceClass(i)}>
            <input type="radio" name={question.id} checked={selected === i} onChange={() => setSelected(i)} />
            <span className={question.type === "predict" ? "choice-text code" : "choice-text"}>{showText(choice.text, lang)}</span>
          </label>
        ))}
      </fieldset>
      {!checked && (
        <button className="primary" disabled={selected === null} onClick={check}>
          {t(exam ? "exam.choose" : "question.check")}
        </button>
      )}
      {checked && exam && <p className="exam-answered">{t("exam.answered")}</p>}
      {checked && !exam && (
        <RobotBubble
          mood={isCorrect ? "happy" : "sad"}
          message={isCorrect ? t("question.correct") : t("question.incorrect")}
          hint={showText(question.explanation, lang)}
        />
      )}
    </div>
  );
}
