import { useMemo, useState } from "react";
import type { Card, Exercise, Lesson } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { CardView } from "./CardView";
import { CodeExerciseView } from "./CodeExerciseView";
import { useGame } from "./GameProvider";
import { QuestionCard } from "./QuestionCard";
import { ResultView } from "./ResultView";

type Step = { kind: "card"; card: Card } | { kind: "exercise"; exercise: Exercise };

export interface LessonScreenProps {
  lesson: Lesson;
  onExit(): void;
}

export function LessonScreen({ lesson, onExit }: LessonScreenProps) {
  const { t, uiLang } = useLang();
  const game = useGame();
  const [before] = useState(() => game.state);
  const steps = useMemo<Step[]>(
    () => [
      ...lesson.cards.map((card): Step => ({ kind: "card", card })),
      ...lesson.exercises.map((exercise): Step => ({ kind: "exercise", exercise })),
    ],
    [lesson],
  );
  const [index, setIndex] = useState(0);
  const [doneSteps, setDoneSteps] = useState<ReadonlySet<number>>(() => new Set());
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  if (finished || step === undefined) {
    return <ResultView before={before} after={game.state} onExit={onExit} />;
  }

  const markDone = (stepIndex: number) => setDoneSteps((previous) => new Set(previous).add(stepIndex));
  const next = () => {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      game.dispatch({ type: "LessonCompleted", lessonId: lesson.id });
    }
  };

  const cardCount = lesson.cards.length;
  const progress =
    step.kind === "card"
      ? t("lesson.cardOf", { current: index + 1, total: cardCount })
      : t("lesson.exerciseOf", { current: index - cardCount + 1, total: lesson.exercises.length });
  const canGoNext = step.kind === "card" || doneSteps.has(index);
  const isLast = index === steps.length - 1;

  let body;
  if (step.kind === "card") {
    body = <CardView key={`card-${index}`} card={step.card} />;
  } else if (step.exercise.type === "code") {
    const exercise = step.exercise;
    body = (
      <CodeExerciseView
        key={exercise.id}
        exercise={exercise}
        initialCode={game.draftFor(exercise.id)}
        onCodeChange={(code) => game.saveDraft(exercise.id, code)}
        initialStats={game.state.progress.exerciseStats?.[exercise.id]}
        onHint={() => game.dispatch({ type: "HintShown", exerciseId: exercise.id })}
        onSolutionViewed={() => game.dispatch({ type: "SolutionViewed", exerciseId: exercise.id })}
        onJudged={(info) =>
          game.dispatch(
            {
              type: "ExerciseJudged",
              exerciseId: exercise.id,
              accepted: info.result.status === "accepted",
              failedSubmitsBefore: info.failedSubmitsBefore,
              hintsUsed: info.hintsUsed,
              viewedSolution: info.viewedSolution,
            },
            {
              kind: "code",
              itemId: exercise.id,
              code: info.code,
              status: info.result.status,
              passedCount: info.result.passedCount,
              total: info.result.total,
              misconceptions: info.result.misconceptions,
            },
          )
        }
        onComplete={() => markDone(index)}
      />
    );
  } else {
    const question = step.exercise;
    body = (
      <QuestionCard
        key={question.id}
        question={question}
        onAnswered={(correct, detail) => {
          markDone(index);
          game.dispatch(
            { type: "QuestionAnswered", questionId: question.id, correct },
            { kind: "choice", itemId: question.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
          );
        }}
      />
    );
  }

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{pick(lesson.title, uiLang)}</h1>
        <span>{progress}</span>
      </div>
      {body}
      <nav className="lesson-nav">
        <button onClick={() => setIndex(index - 1)} disabled={index === 0}>
          {t("lesson.back")}
        </button>
        <button className="primary" onClick={next} disabled={!canGoNext}>
          {isLast ? t("lesson.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
