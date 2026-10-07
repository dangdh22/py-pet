import { useState } from "react";
import type { Exercise } from "../content/types";
import type { ResultSource } from "../game/mastery";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { ItemBoundary } from "./ItemBoundary";
import { ItemView } from "./ItemView";
import { ResultView } from "./ResultView";

export interface SessionScreenProps {
  title: string;
  items: Exercise[];
  source: Exclude<ResultSource, "lesson">;
  /** Called once, when the child finishes the last item; the screen then shows the result. */
  onFinish(result: { correct: number; total: number }): void;
  doneTitle: string;
  onExit(): void;
}

/**
 * A series of items, 1 per card (spec 8.2.4): a review station or a practice set. With no item it can still finish.
 * A broken item can be skipped: it counts as done, sends no grading event and is left out of the total, so the child
 * who answers every other item right still has a perfect session.
 */
export function SessionScreen({ title, items, source, onFinish, doneTitle, onExit }: SessionScreenProps) {
  const { t } = useLang();
  const game = useGame();
  const [before] = useState(() => game.state);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(boolean | undefined)[]>(() => items.map(() => undefined));
  const [finished, setFinished] = useState(false);
  // The practice for a misconception comes after the session; a practice set offers no more practice.
  const [practiceConcepts, setPracticeConcepts] = useState<string[]>([]);
  const correct = results.filter((r) => r === true).length;
  const answered = results.filter((r) => r !== undefined).length;

  if (finished) {
    return (
      <ResultView
        before={before}
        after={game.state}
        title={doneTitle}
        message={t("review.score", { correct, total: answered })}
        practiceConcepts={source === "practice" ? undefined : practiceConcepts}
        onExit={onExit}
      />
    );
  }

  const item: Exercise | undefined = items[index];
  const isLast = index >= items.length - 1;
  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onFinish({ correct, total: answered });
  };

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{title}</h1>
        {item && <span>{t("review.itemOf", { current: index + 1, total: items.length })}</span>}
      </div>
      {item ? (
        <ItemBoundary key={item.id} itemId={item.id} onSkip={next}>
          <ItemView
            item={item}
            source={source}
            onDone={(result) =>
              setResults((current) => current.map((old, i) => (i === index && old === undefined ? result.correct : old)))
            }
            onMisconception={(id) => setPracticeConcepts((current) => (current.includes(id) ? current : [...current, id]))}
          />
        </ItemBoundary>
      ) : (
        <p>{t("review.empty")}</p>
      )}
      <nav className="lesson-nav">
        <button className="primary" onClick={next} disabled={item !== undefined && results[index] === undefined}>
          {isLast ? t("lesson.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
