import type { Lang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 3;
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

/** One concept's learning record (spec 5.9). */
export interface ConceptMastery {
  /** 0 to 100, updated with m <- m + 0.3 * (s * 100 - m). */
  score: number;
  /** The ladder level: 1 = predict/mcq, 2 = parsons/fill, 3 = code. */
  level: 1 | 2 | 3;
  /** Results in a row on the ladder: +n right, -n wrong. */
  run: number;
  needsHelp: boolean;
  /** How often this concept's misconception was seen since the help flag was last cleared. */
  misconceptions: number;
  /** The last results, newest last, each from 0 to 1. */
  recent: number[];
  /** Wrong review-station answers in a row. */
  reviewMisses: number;
}

/** The Leitner box (1 to 5) of a question and the day it is due again (spec 5.10). */
export interface ReviewCard {
  box: number;
  due: string;
}

/** The best result and the latest paper of a topic test (spec 5.3: it never blocks the path). */
export interface TopicTestRecord {
  attempts: number;
  best: number;
  max: number;
  passed: boolean;
  /** The items of the latest attempt, avoided by the next one when the bank allows. */
  lastItems: string[];
}

/** One evolution test (spec 5.11). */
export interface EvolutionAttempt {
  at: string;
  stage: number;
  score: number;
  max: number;
  passed: boolean;
  items: string[];
  wrongConcepts: string[];
}

/** The focused review set opened by a failed evolution test; the retake waits until it is done (spec 5.11). */
export interface RemedialSet {
  stage: number;
  items: string[];
}

export interface GameState {
  version: number;
  pet: {
    stage: number;
    /** All XP ever earned; it is never lost (spec 5.4). */
    xp: number;
    /** pet.xp when the current stage began: the growth bar shows xp - stageStartXp. */
    stageStartXp: number;
    pin: number;
    vui: number;
    correctRun: number;
  };
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
  mastery: Record<string, ConceptMastery>;
  reviews: Record<string, ReviewCard>;
  /** Exercises whose solution was shown -> the day they come back in a review station (spec 5.9). */
  retry: Record<string, string>;
  remedial: RemedialSet | null;
  progress: {
    completedLessons: string[];
    solvedExercises: string[];
    answeredQuestions: string[];
    completedReviews: string[];
    topicTests: Record<string, TopicTestRecord>;
    evolutionTests: EvolutionAttempt[];
    /** Optional: states saved before it existed have no stats. Read it with `?? {}`. */
    exerciseStats?: Record<string, ExerciseStats>;
  };
  warnings: { at: string; kind: "clock-rollback" }[];
}

export const DEFAULT_SETTINGS: GameSettings = { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" };

export function initialGameState(today: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    pet: { stage: 1, xp: 0, stageStartXp: 0, pin: STAT_START, vui: STAT_START, correctRun: 0 },
    wallet: { xu: 0 },
    activity: { lastActiveDay: null, decayApplied: 0 },
    streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
    week: { start: weekStart(today), lessonsDone: 0 },
    settings: { ...DEFAULT_SETTINGS },
    mastery: {},
    reviews: {},
    retry: {},
    remedial: null,
    progress: {
      completedLessons: [],
      solvedExercises: [],
      answeredQuestions: [],
      completedReviews: [],
      topicTests: {},
      evolutionTests: [],
    },
    warnings: [],
  };
}
