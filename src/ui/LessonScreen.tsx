import { useMemo, useState } from "react";
import type { Card, Exercise, Lesson } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { CardView } from "./CardView";
import { useGame } from "./GameProvider";
import { ItemBoundary } from "./ItemBoundary";
import { ItemView } from "./ItemView";
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
  const [practiceConcepts, setPracticeConcepts] = useState<string[]>([]);

  const step = steps[index];
  if (finished || step === undefined) {
    return (
      <ResultView
        before={before}
        after={game.state}
        title={t("lesson.doneTitle")}
        message={t("lesson.doneBody")}
        practiceConcepts={practiceConcepts}
        onExit={onExit}
      />
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

  const body =
    step.kind === "card" ? (
      <ItemBoundary key={`card-${index}`} itemId={`${lesson.id}#card${index + 1}`} onSkip={next}>
        <CardView card={step.card} />
      </ItemBoundary>
    ) : (
      // A skipped exercise sends no grading event; it only moves on (the lesson still completes after the last step).
      <ItemBoundary key={step.exercise.id} itemId={step.exercise.id} onSkip={next}>
        <ItemView
          item={step.exercise}
          source="lesson"
          onDone={() => markDone(index)}
          onMisconception={(id) => setPracticeConcepts((current) => (current.includes(id) ? current : [...current, id]))}
        />
      </ItemBoundary>
    );

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
