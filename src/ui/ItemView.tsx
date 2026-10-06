import { useRef } from "react";
import { isChoiceQuestion, type Exercise } from "../content/types";
import type { ResultSource } from "../game/mastery";
import { CodeExerciseView, type ExerciseOutcome, type JudgedInfo } from "./CodeExerciseView";
import { useGame } from "./GameProvider";
import { PuzzleExerciseView } from "./PuzzleExerciseView";
import { QuestionCard } from "./QuestionCard";

export interface ItemDone {
  /** True when the first answer or the first submit was right, without a hint or the solution. */
  correct: boolean;
}

/**
 * Shows 1 exercise or question of any type and sends its events with the concepts and the source. Outside a lesson,
 * the view starts clean: no saved draft, no saved hint counts.
 */
export function ItemView({ item, source, onDone }: { item: Exercise; source: ResultSource; onDone(result: ItemDone): void }) {
  const game = useGame();
  const firstTry = useRef<boolean | null>(null);
  const inLesson = source === "lesson";

  if (isChoiceQuestion(item)) {
    return (
      <QuestionCard
        question={item}
        onAnswered={(correct, detail) => {
          game.dispatch(
            {
              type: "QuestionAnswered",
              questionId: item.id,
              correct,
              concepts: item.concepts,
              misconception: item.choices[detail.choiceIndex]?.misconception ?? null,
              source,
            },
            { kind: "choice", itemId: item.id, choiceIndex: detail.choiceIndex, correct, lang: detail.lang },
          );
          onDone({ correct });
        }}
      />
    );
  }

  const onJudged = (info: JudgedInfo) => {
    const accepted = info.result.status === "accepted";
    firstTry.current ??= accepted && info.hintsUsed === 0 && !info.viewedSolution;
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
  const onComplete = (outcome: ExerciseOutcome) => onDone({ correct: outcome === "solved" && firstTry.current === true });
  const onHint = inLesson ? () => game.dispatch({ type: "HintShown", exerciseId: item.id }) : undefined;
  const onSolutionViewed = () => game.dispatch({ type: "SolutionViewed", exerciseId: item.id });

  if (item.type === "code") {
    return (
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
    );
  }
  return (
    <PuzzleExerciseView
      exercise={item}
      onHint={onHint}
      onSolutionViewed={onSolutionViewed}
      onJudged={onJudged}
      onComplete={onComplete}
    />
  );
}
