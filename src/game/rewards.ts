export const XP = { lesson: 10, codeFirstTry: 15, codeAfterRetries: 10, codeAfterSolution: 3, question: 3 } as const;

export const XU = {
  codeFirstSubmit: 5,
  noHintBonus: 3,
  persistenceBonus: 5,
  weekPlanMet: 50,
  weekPlanExceeded: 100,
} as const;

/** Failed submits before a correct one that earn the persistence bonus. */
export const PERSISTENCE_FAILS = 3;

/** Streak length -> bonus xu. */
export const STREAK_MILESTONES: Readonly<Record<number, number>> = { 3: 20, 7: 50, 14: 100, 30: 250 };

export const FREEZE_EVERY = 7;
export const MAX_FREEZES = 2;
export const WEEK_EXCEED_RATIO = 1.3;
export const POINTS = { lesson: 1 } as const;
export const CORRECT_RUN_FOR_VUI = 3;
