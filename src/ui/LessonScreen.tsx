import { useMemo, useState } from "react";
import { lessonPlace } from "../content/lookup";
import type { Card, Exercise, Lesson } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { CardView } from "./CardView";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { ItemBoundary } from "./ItemBoundary";
import { ItemView } from "./ItemView";
import { ResultView } from "./ResultView";
import { FocusTitle } from "./shell/FocusTitle";
import { stepStates } from "./shell/Squares";

type Step = { kind: "card"; card: Card } | { kind: "exercise"; exercise: Exercise };

export interface LessonScreenProps {
  lesson: Lesson;
  onExit(): void;
}

export function LessonScreen({ lesson, onExit }: LessonScreenProps) {
  const { t, uiLang } = useLang();
  const game = useGame();
  const bundle = useContent();
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
  // The title is the number and the name of the lesson; the topic is the small line above it. A lesson that the content
  // does not place (it should not happen) keeps its own name.
  const place = lessonPlace(bundle, lesson.id);
  const lessonName = pick(lesson.title, uiLang);
  const title = place ? t("focus.lessonTitle", { n: place.number, title: lessonName }) : lessonName;

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
    <main className="study-page">
      <FocusTitle
        title={title}
        kicker={place && pick(place.topic.title, uiLang)}
        progress={progress}
        steps={stepStates(steps.length, index, (i) => doneSteps.has(i))}
      />
      {body}
      <nav className="study-nav">
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
