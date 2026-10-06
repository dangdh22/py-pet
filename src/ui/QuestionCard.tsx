import { useState } from "react";
import type { ChoiceQuestion, LocalizedText } from "../content/types";
import { pick, pickBoth, type QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { RobotBubble } from "./RobotBubble";

const LANG_BUTTONS = [
  { lang: "vi", label: "question.langVi" },
  { lang: "en", label: "question.langEn" },
  { lang: "both", label: "question.langBoth" },
] as const;

function show(text: LocalizedText, lang: QuestionLang): string {
  return lang === "both" ? pickBoth(text) : pick(text, lang);
}

export function QuestionCard({
  question,
  onAnswered,
}: {
  question: ChoiceQuestion;
  onAnswered(correct: boolean, detail: { choiceIndex: number; lang: QuestionLang }): void;
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
    if (!checked) return "choice";
    if (i === correctIndex) return "choice choice-correct";
    if (i === selected) return "choice choice-wrong";
    return "choice";
  }

  return (
    <div className="question-card">
      <div role="group" aria-label={t("question.lang")} className="lang-switch">
        {LANG_BUTTONS.map((button) => (
          <button key={button.lang} aria-pressed={lang === button.lang} onClick={() => setLang(button.lang)}>
            {t(button.label)}
          </button>
        ))}
      </div>
      {lang === "both" ? (
        <>
          <p className="question-prompt">{question.prompt.vi}</p>
          {question.prompt.en && (
            <p className="question-prompt" lang="en">
              {question.prompt.en}
            </p>
          )}
        </>
      ) : (
        <p className="question-prompt">{pick(question.prompt, lang)}</p>
      )}
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
            <span className={question.type === "predict" ? "choice-text code" : "choice-text"}>{show(choice.text, lang)}</span>
          </label>
        ))}
      </fieldset>
      {!checked && (
        <button className="primary" disabled={selected === null} onClick={check}>
          {t("question.check")}
        </button>
      )}
      {checked && (
        <RobotBubble
          mood={isCorrect ? "happy" : "sad"}
          message={isCorrect ? t("question.correct") : t("question.incorrect")}
          hint={show(question.explanation, lang)}
        />
      )}
    </div>
  );
}
