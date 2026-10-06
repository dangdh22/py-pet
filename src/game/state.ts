import type { Lang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 1;
export const STAT_MAX = 5;
export const STAT_START = 4;
export const WARNING_LIMIT = 20;

export interface GameSettings {
  dailyGoal: number;
  weeklyTarget: number;
  graceDays: number;
  uiLang: Lang;
}

/** What the child did on an unsolved code exercise; it decides the reward and survives a reload. */
export interface ExerciseStats {
  fails: number;
  hints: number;
  viewedSolution: boolean;
}

export interface GameState {
  version: number;
  pet: { stage: number; xp: number; pin: number; vui: number; correctRun: number };
  wallet: { xu: number };
  activity: { lastActiveDay: string | null; decayApplied: number };
  streak: {
    current: number;
    best: number;
    freezes: number;
    lastAchievedDay: string | null;
    pointsDay: string | null;
    points: number;
  };
  week: { start: string; lessonsDone: number };
  settings: GameSettings;
  progress: {
    completedLessons: string[];
    solvedExercises: string[];
    answeredQuestions: string[];
    /** Optional: states saved before it existed have no stats. Read it with `?? {}`. */
    exerciseStats?: Record<string, ExerciseStats>;
  };
  warnings: { at: string; kind: "clock-rollback" }[];
}

export const DEFAULT_SETTINGS: GameSettings = { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" };

export function initialGameState(today: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    pet: { stage: 1, xp: 0, pin: STAT_START, vui: STAT_START, correctRun: 0 },
    wallet: { xu: 0 },
    activity: { lastActiveDay: null, decayApplied: 0 },
    streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
    week: { start: weekStart(today), lessonsDone: 0 },
    settings: { ...DEFAULT_SETTINGS },
    progress: { completedLessons: [], solvedExercises: [], answeredQuestions: [] },
    warnings: [],
  };
}
