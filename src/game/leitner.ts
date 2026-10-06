import { addDays } from "./dates";
import type { ReviewCard } from "./state";

/** Days until the next review for boxes 1 to 5 (spec 5.10). */
export const LEITNER_DAYS = [1, 2, 4, 7, 14] as const;

/** Right: 1 box up (at most 5). Wrong: back to box 1. A new question starts in box 1. */
export function reviewCard(card: ReviewCard | undefined, correct: boolean, today: string): ReviewCard {
  const box = correct ? Math.min(LEITNER_DAYS.length, (card?.box ?? 1) + 1) : 1;
  return { box, due: addDays(today, LEITNER_DAYS[box - 1] as number) };
}

export function isDue(card: ReviewCard, today: string): boolean {
  return card.due <= today;
}
