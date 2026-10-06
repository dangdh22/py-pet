import { isChoiceQuestion, type ContentBundle, type Stage } from "../content/types";
import { daysBetween, weekStart } from "./dates";
import { hasTest } from "./path";
import { XP } from "./rewards";
import { REVIEW_SIZE } from "./reviewSet";
import type { GameState } from "./state";

export type PetCondition = "happy" | "normal" | "sleepy" | "drained";
export type GrowthSize = 1 | 2 | 3;

export function currentStage(bundle: ContentBundle, state: GameState): Stage | null {
  return bundle.stages[state.pet.stage - 1] ?? bundle.stages[bundle.stages.length - 1] ?? null;
}

/** The XP of the current stage: all XP minus the XP the robot had when the stage began. */
export function stageXp(state: GameState): number {
  return state.pet.xp - state.pet.stageStartXp;
}

/**
 * The XP a child can earn in a stage from lessons, their exercises, 1 perfect run of each review station and each topic
 * test.
 */
export function stageXpMax(stage: Stage): number {
  const lessons = stage.topics
    .flatMap((topic) => topic.lessons)
    .reduce(
      (sum, lesson) =>
        sum +
        XP.lesson +
        lesson.exercises.reduce((part, exercise) => part + (isChoiceQuestion(exercise) ? XP.question : XP.codeFirstTry), 0),
      0,
    );
  const stations = stage.topics.reduce((sum, topic) => sum + topic.reviews.length, 0);
  const tests = stage.topics.filter((topic) => hasTest(topic.test)).length;
  return lessons + stations * (XP.review + XP.reviewPerCorrect * REVIEW_SIZE) + tests * XP.topicTest;
}

export function growthPercent(xp: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((xp / max) * 100));
}

export function growthSize(xp: number, max: number): GrowthSize {
  const ratio = max > 0 ? xp / max : 0;
  if (ratio >= 2 / 3) return 3;
  if (ratio >= 1 / 3) return 2;
  return 1;
}

export function petCondition(state: GameState): PetCondition {
  const { pin, vui } = state.pet;
  if (pin === 0 || vui === 0) return "drained";
  if (pin <= 2 || vui <= 2) return "sleepy";
  if (pin >= 4 && vui >= 4) return "happy";
  return "normal";
}

/** The streak to show today: 0 once the missed days exceed the savers. */
export function displayStreak(state: GameState, today: string): number {
  const { current, freezes, lastAchievedDay } = state.streak;
  if (lastAchievedDay === null) return 0;
  const missed = daysBetween(lastAchievedDay, today) - 1;
  if (missed <= 0) return current;
  return freezes >= missed ? current : 0;
}

export function todayPoints(state: GameState, today: string): number {
  return state.streak.pointsDay === today ? state.streak.points : 0;
}

export function weekLessons(state: GameState, today: string): number {
  return state.week.start === weekStart(today) ? state.week.lessonsDone : 0;
}
