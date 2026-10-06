import { z } from "zod";
import type { GameState } from "./state";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const count = z.number().int().min(0);
const stat = z.number().int().min(0).max(5);

const masterySchema = z.object({
  score: z.number().min(0).max(100),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  run: z.number().int(),
  needsHelp: z.boolean(),
  misconceptions: count,
  recent: z.array(z.number().min(0).max(1)),
  reviewMisses: count,
  coachedAt: day.nullable(),
});

const itemId = z.string().min(1);

/** The shape of a saved GameState of the current version. Unknown keys are dropped. */
export const gameStateSchema: z.ZodType<GameState> = z.object({
  version: z.number().int(),
  pet: z.object({
    stage: z.number().int().min(1),
    xp: count,
    stageStartXp: count,
    pin: stat,
    vui: stat,
    correctRun: count,
  }),
  wallet: z.object({
    xu: count,
    history: z.array(
      z.object({
        day,
        delta: z.number().int(),
        reason: z.enum(["code", "review", "topicTest", "evolution", "streak", "week", "shop", "reward"]),
        ref: z.string().nullable(),
      }),
    ),
  }),
  activity: z.object({ lastActiveDay: day.nullable(), decayApplied: count, seconds: z.record(day, count) }),
  streak: z.object({
    current: count,
    best: count,
    freezes: count,
    lastAchievedDay: day.nullable(),
    pointsDay: day.nullable(),
    points: count,
  }),
  week: z.object({ start: day, lessonsDone: count }),
  settings: z.object({
    dailyGoal: count,
    weeklyTarget: count,
    graceDays: count,
    uiLang: z.enum(["vi", "en"]),
    questionLang: z.enum(["vi", "en", "both"]),
    passPercent: z.number().int().min(1).max(100),
    helpPercent: z.number().int().min(1).max(100),
    runSeconds: z.number().int().min(1).max(30),
  }),
  mastery: z.record(z.string(), masterySchema),
  reviews: z.record(z.string(), z.object({ box: z.number().int().min(1).max(5), due: day })),
  retry: z.record(z.string(), day),
  remedial: z.object({ stage: z.number().int().min(1), items: z.array(z.string()) }).nullable(),
  inventory: z.object({
    consumables: z.record(itemId, count),
    owned: z.array(itemId),
    equipped: z.array(itemId),
  }),
  rewards: z.object({
    catalog: z.array(z.object({ id: itemId, name: z.string().min(1), price: count, weeklyLimit: count })),
    requests: z.array(
      z.object({
        id: itemId,
        rewardId: itemId,
        name: z.string(),
        price: count,
        at: z.string(),
        status: z.enum(["pending", "approved", "rejected"]),
        decidedAt: z.string().nullable(),
      }),
    ),
  }),
  vacation: z.object({ since: day.nullable(), ranges: z.array(z.object({ start: day, end: day })) }),
  assigned: z.array(z.object({ id: itemId, conceptId: itemId, items: z.array(z.string()), day })),
  badges: z.record(z.string(), day),
  progress: z.object({
    completedLessons: z.array(z.string()),
    solvedExercises: z.array(z.string()),
    answeredQuestions: z.array(z.string()),
    completedReviews: z.array(z.string()),
    topicTests: z.record(
      z.string(),
      z.object({
        attempts: count,
        best: z.number().min(0),
        max: z.number().min(0),
        passed: z.boolean(),
        lastItems: z.array(z.string()),
      }),
    ),
    evolutionTests: z.array(
      z.object({
        at: z.string(),
        stage: z.number().int().min(1),
        score: z.number().min(0),
        max: z.number().min(0),
        passed: z.boolean(),
        items: z.array(z.string()),
        wrongConcepts: z.array(z.string()),
      }),
    ),
    exerciseStats: z
      .record(z.string(), z.object({ fails: count, hints: count, viewedSolution: z.boolean() }))
      .optional(),
  }),
  warnings: z.array(z.object({ at: z.string(), kind: z.literal("clock-rollback") })),
});
