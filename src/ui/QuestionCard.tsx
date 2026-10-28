import { Fragment, useId, useMemo, useState } from "react";
import type { ChoiceQuestion } from "../content/types";
import { seedFromText, seededRng, shuffled } from "../game/random";
import type { QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { Icon } from "./icons";
import { LangSwitch, Prompt, showText } from "./LangSwitch";
import { RobotBubble } from "./RobotBubble";

/** A predict choice is always program output; an mcq choice is code when it reads the same in both languages. */
function isCodeChoice(question: ChoiceQuestion, choice: ChoiceQuestion["choices"][number]): boolean {
  return question.type === "predict" || choice.text.vi === choice.text.en;
}

/**
 * 1 predict/mcq question. In a test (`exam`), the answer is only recorded: no right/wrong marks and no explanation
 * until the end (spec 8.2.4). The choices are shown in an order shuffled by the question ID, the same every time,
 * so the place of the right answer gives nothing away; answers are still reported by their index in the content.
 * After the check, the right choice and a wrong chosen choice carry a mark: a class, an icon and a description that the radio
 * points at. The description sits outside the label, so the name of the radio stays the text of the choice.
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
  const markId = useId();
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const order = useMemo(
    () => shuffled(question.choices.map((_, i) => i), seededRng(seedFromText(question.id))),
    [question],
  );
  const correctIndex = question.choices.findIndex((choice) => choice.correct);
  const isCorrect = selected === correctIndex;

  function check() {
    if (selected === null) return;
    setChecked(true);
    onAnswered(isCorrect, { choiceIndex: selected, lang });
  }

  /** The mark of a choice after the check; a test (`exam`) shows none, so a choice never tells right from wrong there. */
  function markOf(i: number): "correct" | "wrong" | null {
    if (!checked || exam) return null;
    if (i === correctIndex) return "correct";
    return i === selected ? "wrong" : null;
  }

  return (
    <div className="card question-card">
      <div className="question-head">
        <p className="kicker">{t(question.type === "predict" ? "question.kindPredict" : "question.kindMcq")}</p>
        <LangSwitch lang={lang} onChange={setLang} />
      </div>
      <Prompt text={question.prompt} lang={lang} />
      {question.code && (
        <pre className="code-block">
          <code>{question.code.trimEnd()}</code>
        </pre>
      )}
      <fieldset disabled={checked}>
        <legend className="sr-only">{t("question.choices")}</legend>
        {order.map((i) => {
          const mark = markOf(i);
          const classes = ["choice", selected === i ? "choice-selected" : "", mark ? `choice-${mark}` : ""].filter(Boolean).join(" ");
          const describedBy = `${markId}-${i}`;
          return (
            <Fragment key={i}>
              <label className={classes}>
                <input
                  type="radio"
                  name={question.id}
                  checked={selected === i}
                  aria-describedby={mark ? describedBy : undefined}
                  onChange={() => setSelected(i)}
                />
                <span className={isCodeChoice(question, question.choices[i]!) ? "choice-text code" : "choice-text"}>
                  {showText(question.choices[i]!.text, lang)}
                </span>
                {mark && <Icon name={mark === "correct" ? "check" : "cross"} />}
              </label>
              {mark && (
                <span className="sr-only" id={describedBy}>
                  {t(mark === "correct" ? "question.markCorrect" : "question.markWrong")}
                </span>
              )}
            </Fragment>
          );
        })}
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
