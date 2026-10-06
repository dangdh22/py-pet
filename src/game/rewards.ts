export const XP = {
  lesson: 10,
  codeFirstTry: 15,
  codeAfterRetries: 10,
  codeAfterSolution: 3,
  question: 3,
  review: 5,
  reviewPerCorrect: 2,
  topicTest: 30,
} as const;

export const XU = {
  codeFirstSubmit: 5,
  noHintBonus: 3,
  persistenceBonus: 5,
  weekPlanMet: 50,
  weekPlanExceeded: 100,
  review: 10,
  reviewPerfect: 5,
  topicTestPassed: 20,
  evolution: 100,
} as const;

/** Failed submits before a correct one that earn the persistence bonus. */
export const PERSISTENCE_FAILS = 3;

/** Streak length -> bonus xu. */
export const STREAK_MILESTONES: Readonly<Record<number, number>> = { 3: 20, 7: 50, 14: 100, 30: 250 };

export const FREEZE_EVERY = 7;
export const MAX_FREEZES = 2;
export const WEEK_EXCEED_RATIO = 1.3;
export const POINTS = { lesson: 1, review: 1 } as const;
/** Pin from a review station (spec 5.6). */
export const PIN_REVIEW = 2;
/** Days before an exercise whose solution was shown comes back (spec 5.9: 1 to 2 days). */
export const RETRY_AFTER_DAYS = 1;
export const CORRECT_RUN_FOR_VUI = 3;
/** A test is passed from this share of its points (spec 5.11; the parent can change it in M4). */
export const PASS_RATIO = 0.8;

/**
 * True when `score` reaches `percent` of `max` (the parent's pass mark, spec 5.11 (*)). The tolerance keeps 11.2 of
 * 14 a pass at 80% despite float rounding.
 */
export function isPass(score: number, max: number, percent: number = PASS_RATIO * 100): boolean {
  return max > 0 && score >= (max * percent) / 100 - 1e-9;
}
