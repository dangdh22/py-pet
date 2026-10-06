import type { Lang, QuestionLang } from "../i18n/lang";
import { weekStart } from "./dates";

export const GAME_STATE_VERSION = 4;
export const STAT_MAX = 5;
export const STAT_START = 4;
export const WARNING_LIMIT = 20;
/** Wallet entries kept for the parent area (spec 5.2: the transaction history). */
export const WALLET_HISTORY_LIMIT = 200;
/** Days of study time and of past vacation ranges kept (the parent area shows 7 days). */
export const KEEP_DAYS = 60;

/** Spec 5 (*): the values a parent can change (M4b gives them a screen). */
export interface GameSettings {
  dailyGoal: number;
  weeklyTarget: number;
  graceDays: number;
  uiLang: Lang;
  /** The default question language (spec 7.2). */
  questionLang: QuestionLang;
  /** The evolution and topic test pass mark, in percent (spec 5.11: 80). */
  passPercent: number;
  /** "Needs help" below this share of right answers, in percent (spec 5.9: 60). */
  helpPercent: number;
  /** The time limit of 1 code run, in seconds (spec 4.1: 2). */
  runSeconds: number;
}

export type XuReason =
  | "code"
  | "review"
  | "topicTest"
  | "evolution"
  | "streak"
  | "week"
  | "shop"
  | "reward";

/** One change of the coin balance (spec 5.2: the transaction history). */
export interface XuEntry {
  day: string;
  delta: number;
  reason: XuReason;
  /** The item, reward or other thing it was for, when there is one. */
  ref: string | null;
}

/** A real reward the parent offers (spec 5.12). */
export interface RewardItem {
  id: string;
  name: string;
  price: number;
  /** Requests allowed per week (Monday to Sunday). */
  weeklyLimit: number;
}

export type RewardStatus = "pending" | "approved" | "rejected";

export interface RewardRequest {
  id: string;
  rewardId: string;
  /** Name and price when asked, so a later change of the list does not change the request. */
  name: string;
  price: number;
  at: string;
  status: RewardStatus;
  decidedAt: string | null;
}

export interface DayRange {
  start: string;
  end: string;
}

/** Practice a parent gives for a concept (spec 9.2); "Học tiếp" opens it first (spec 5.3). */
export interface AssignedPractice {
  id: string;
  conceptId: string;
  items: string[];
  day: string;
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
  /** The day a parent last marked "coached" for this concept (spec 9.2), or null. */
  coachedAt: string | null;
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
  wallet: {
    xu: number;
    /** The latest changes, newest last (WALLET_HISTORY_LIMIT). */
    history: XuEntry[];
  };
  activity: {
    lastActiveDay: string | null;
    decayApplied: number;
    /** Seconds of active study per day (spec 5.13), the last KEEP_DAYS days. */
    seconds: Record<string, number>;
  };
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
  /** Things bought in the shop (spec 5.12). */
  inventory: {
    /** Pin and Vui items not used yet: item -> count. */
    consumables: Record<string, number>;
    /** Accessories and room decorations owned, from the shop or as streak gifts. */
    owned: string[];
    /** The accessories the robot wears, at most 1 per slot. */
    equipped: string[];
  };
  rewards: { catalog: RewardItem[]; requests: RewardRequest[] };
  /** Spec 5.7: `since` is the first day of a vacation switched on now; `ranges` are scheduled and past ones. */
  vacation: { since: string | null; ranges: DayRange[] };
  assigned: AssignedPractice[];
  /** Badge -> the day it was earned (spec 8.2.7). */
  badges: Record<string, string>;
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

export const DEFAULT_SETTINGS: GameSettings = {
  dailyGoal: 2,
  weeklyTarget: 10,
  graceDays: 1,
  uiLang: "vi",
  questionLang: "vi",
  passPercent: 80,
  helpPercent: 60,
  runSeconds: 2,
};

export function initialGameState(today: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    pet: { stage: 1, xp: 0, stageStartXp: 0, pin: STAT_START, vui: STAT_START, correctRun: 0 },
    wallet: { xu: 0, history: [] },
    activity: { lastActiveDay: null, decayApplied: 0, seconds: {} },
    streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
    week: { start: weekStart(today), lessonsDone: 0 },
    settings: { ...DEFAULT_SETTINGS },
    mastery: {},
    reviews: {},
    retry: {},
    remedial: null,
    inventory: { consumables: {}, owned: [], equipped: [] },
    rewards: { catalog: [], requests: [] },
    vacation: { since: null, ranges: [] },
    assigned: [],
    badges: {},
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
