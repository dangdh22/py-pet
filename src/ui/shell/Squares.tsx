/** The state of 1 step of a study screen, drawn as 1 square of the focus bar. */
export type StepState = "done" | "current" | "todo";

/** The states of `count` steps while the child is on step `current`: a step before it, or one that is done, counts as done. */
export function stepStates(count: number, current: number, isDone: (index: number) => boolean): StepState[] {
  return Array.from({ length: count }, (_, index): StepState => {
    if (index === current) return "current";
    return index < current || isDone(index) ? "done" : "todo";
  });
}

/** A square for each step. It is only a picture: the text beside it ("Thẻ 1/4") says where the child is. */
export function StepSquares({ steps }: { steps: readonly StepState[] }) {
  return (
    <span className="squares steps" aria-hidden="true">
      {steps.map((state, index) => (
        <span key={index} className={state} />
      ))}
    </span>
  );
}

/** The most squares a goal row shows; a longer goal fills them in proportion. */
const GOAL_SQUARES_MAX = 10;

/**
 * A row of squares for a goal: `done` of `goal`, with the numbers in the text beside it, so the squares are only a picture.
 * As soon as there is some progress, at least 1 square is filled.
 */
export function GoalSquares({ done, goal }: { done: number; goal: number }) {
  const shown = Math.min(goal, GOAL_SQUARES_MAX);
  const filled = done > 0 && goal > 0 ? Math.min(shown, Math.max(1, Math.floor((done * shown) / goal))) : 0;
  return (
    <span className="squares" aria-hidden="true">
      {Array.from({ length: shown }, (_, index) => (
        <span key={index} className={index < filled ? "on" : undefined} />
      ))}
    </span>
  );
}
