import { useMemo, useState } from "react";
import type { Card, Exercise, Lesson } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { CardView } from "./CardView";
import { CodeExerciseView } from "./CodeExerciseView";
import { useGame } from "./GameProvider";
import { QuestionCard } from "./QuestionCard";
import { Robot } from "./Robot";

type Step = { kind: "card"; card: Card } | { kind: "exercise"; exercise: Exercise };

export interface LessonScreenProps {
  lesson: Lesson;
  onExit(): void;
}

export function LessonScreen({ lesson, onExit }: LessonScreenProps) {
  const { t, uiLang } = useLang();
  const game = useGame();
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
    return (
      <main className="lesson-done">
        <Robot mood="happy" size={96} />
        <h2>{t("lesson.doneTitle")}</h2>
        <p>{t("lesson.doneBody")}</p>
        <button className="primary" onClick={onExit}>
          {t("lesson.backHome")}
        </button>
      </main>
    );
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
    body = <CodeExerciseView key={step.exercise.id} exercise={step.exercise} onComplete={() => markDone(index)} />;
  } else {
    body = <QuestionCard key={step.exercise.id} question={step.exercise} onAnswered={() => markDone(index)} />;
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
