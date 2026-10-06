import { useRef, useState } from "react";
import { findConcept } from "../content/lookup";
import { isChoiceQuestion, type Exercise } from "../content/types";
import type { ResultSource } from "../game/mastery";
import { CodeExerciseView, type ExerciseOutcome, type JudgedInfo } from "./CodeExerciseView";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { MisconceptionHelp } from "./MisconceptionHelp";
import { PuzzleExerciseView } from "./PuzzleExerciseView";
import { QuestionCard } from "./QuestionCard";

export interface ItemDone {
  /** True when the first answer or the first submit was right, without a hint or the solution. */
  correct: boolean;
}

/**
 * Shows 1 exercise or question of any type and sends its events with the concepts and the source. Outside a lesson,
 * the view starts clean: no saved draft, no saved hint counts. `onMisconception` hears each concept whose
 * misconception card the view shows, so the screen can offer its practice at the end.
 */
export function ItemView({
  item,
  source,
  onDone,
  onMisconception,
}: {
  item: Exercise;
  source: ResultSource;
  onDone(result: ItemDone): void;
  onMisconception?(conceptId: string): void;
}) {
  const game = useGame();
  const bundle = useContent();
  const firstTry = useRef<boolean | null>(null);
  const [misconception, setMisconception] = useState<string | null>(null);
  const inLesson = source === "lesson";
  const isConcept = (id: string) => findConcept(bundle, id) !== undefined;
  const showHelp = (id: string | null) => {
    setMisconception(id);
    if (id !== null) onMisconception?.(id);
  };
  const help = misconception && <MisconceptionHelp conceptId={misconception} />;

  if (isChoiceQuestion(item)) {
    return (
      <>
        <QuestionCard
          question={item}
          onAnswered={(correct, detail) => {
            const chosen = item.choices[detail.choiceIndex]?.misconception ?? null;
            game.dispatch(
              {
                type: "QuestionAnswered",
                questionId: item.id,
                correct,
                concepts: item.concepts,
                misconception: chosen,
                source,
              },
              { kind: "choice", itemId: item.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
            );
            if (!correct && chosen && isConcept(chosen)) showHelp(chosen);
            onDone({ correct });
          }}
        />
        {help}
      </>
    );
  }

  const onJudged = (info: JudgedInfo) => {
    const accepted = info.result.status === "accepted";
    firstTry.current ??= accepted && info.hintsUsed === 0 && !info.viewedSolution;
    showHelp(accepted ? null : (info.result.misconceptions.find(isConcept) ?? null));
    game.dispatch(
      {
        type: "ExerciseJudged",
        exerciseId: item.id,
        accepted,
        failedSubmitsBefore: info.failedSubmitsBefore,
        hintsUsed: info.hintsUsed,
        viewedSolution: info.viewedSolution,
        concepts: item.concepts,
        misconceptions: info.result.misconceptions,
        source,
      },
      {
        kind: "code",
        itemId: item.id,
        code: info.code,
        status: info.result.status,
        passedCount: info.result.passedCount,
        total: info.result.total,
        misconceptions: info.result.misconceptions,
      },
    );
  };
  const onComplete = (outcome: ExerciseOutcome) =>
    onDone({ correct: outcome === "solved" && firstTry.current === true });
  const onHint = inLesson ? () => game.dispatch({ type: "HintShown", exerciseId: item.id }) : undefined;
  const onSolutionViewed = () => game.dispatch({ type: "SolutionViewed", exerciseId: item.id });

  if (item.type === "code") {
    return (
      <>
        <CodeExerciseView
          exercise={item}
          initialCode={inLesson ? game.draftFor(item.id) : undefined}
          onCodeChange={inLesson ? (code) => game.saveDraft(item.id, code) : undefined}
          initialStats={inLesson ? game.state.progress.exerciseStats?.[item.id] : undefined}
          onHint={onHint}
          onSolutionViewed={onSolutionViewed}
          onJudged={onJudged}
          onComplete={onComplete}
        />
        {help}
      </>
    );
  }
  return (
    <>
      <PuzzleExerciseView
        exercise={item}
        initialStats={inLesson ? game.state.progress.exerciseStats?.[item.id] : undefined}
        onHint={onHint}
        onSolutionViewed={onSolutionViewed}
        onJudged={onJudged}
        onComplete={onComplete}
      />
      {help}
    </>
  );
}
