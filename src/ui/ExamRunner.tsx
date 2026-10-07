import { useState } from "react";
import { isConceptReached } from "../content/lookup";
import { isChoiceQuestion } from "../content/types";
import type { ExamAnswer, ExamItem } from "../game/exam";
import type { Lang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { ExamCodeView } from "./ExamCodeView";
import { useGame } from "./GameProvider";
import { ItemBoundary } from "./ItemBoundary";
import { QuestionCard } from "./QuestionCard";

/** A score with at most 1 decimal, written the way the language writes decimals (19,2 in Vietnamese). */
export function formatScore(score: number, lang: Lang): string {
  const text = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return lang === "vi" ? text.replace(".", ",") : text;
}

/**
 * The items of a test, 1 per card (spec 8.2.4). Each answer is recorded at once (mastery, Leitner, attempt history)
 * with the source "test", which pays nothing per item; the results appear only after the last item. A broken item can
 * be skipped: nothing is recorded for it and its answer stays undefined, which the grade leaves out of the score and the max.
 */
export function ExamRunner({
  title,
  items,
  onFinish,
}: {
  title: string;
  items: ExamItem[];
  onFinish(answers: (ExamAnswer | undefined)[]): void;
}) {
  const { t } = useLang();
  const game = useGame();
  const bundle = useContent();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(ExamAnswer | undefined)[]>(() => items.map(() => undefined));
  const item: ExamItem | undefined = items[index];
  const isLast = index >= items.length - 1;
  const record = (answer: ExamAnswer) =>
    setAnswers((current) => current.map((old, i) => (i === index && old === undefined ? answer : old)));

  const advance = () => (isLast ? onFinish(answers) : setIndex(index + 1));

  let body;
  if (!item) {
    body = <p>{t("exam.empty")}</p>;
  } else if (isChoiceQuestion(item)) {
    body = (
      <QuestionCard
        question={item}
        exam
        onAnswered={(correct, detail) => {
          const chosen = item.choices[detail.choiceIndex]?.misconception ?? null;
          game.dispatch(
            {
              type: "QuestionAnswered",
              questionId: item.id,
              correct,
              concepts: item.concepts,
              misconception: chosen && isConceptReached(bundle, chosen, game.state.pet.stage) ? chosen : null,
              source: "test",
            },
            { kind: "choice", itemId: item.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
          );
          record({ kind: "choice", correct });
        }}
      />
    );
  } else {
    body = (
      <ExamCodeView
        exercise={item}
        onSubmitted={({ result, code }) => {
          const misconceptions = result.misconceptions.filter((id) => isConceptReached(bundle, id, game.state.pet.stage));
          game.dispatch(
            {
              type: "ExerciseJudged",
              exerciseId: item.id,
              accepted: result.status === "accepted",
              failedSubmitsBefore: 0,
              hintsUsed: 0,
              viewedSolution: false,
              concepts: item.concepts,
              misconceptions,
              source: "test",
            },
            {
              kind: "code",
              itemId: item.id,
              code,
              status: result.status,
              passedCount: result.passedCount,
              total: result.total,
              misconceptions,
            },
          );
          record({ kind: "code", passed: result.passedCount, total: result.total });
        }}
      />
    );
  }

  if (item) {
    body = (
      <ItemBoundary key={item.id} itemId={item.id} onSkip={advance}>
        {body}
      </ItemBoundary>
    );
  }

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{title}</h1>
        {item && <span>{t("review.itemOf", { current: index + 1, total: items.length })}</span>}
      </div>
      {body}
      <nav className="lesson-nav">
        <button
          className="primary"
          disabled={item !== undefined && answers[index] === undefined}
          onClick={advance}
        >
          {isLast ? t("exam.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
