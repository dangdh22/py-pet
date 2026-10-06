import { allLessons } from "../content/lookup";
import type { ContentBundle, Stage } from "../content/types";
import { daysBetween, weekStart } from "./dates";
import { XP } from "./rewards";
import type { GameState } from "./state";

export type LessonStatus = "done" | "next" | "locked";
export type PetCondition = "happy" | "normal" | "sleepy" | "drained";
export type GrowthSize = 1 | 2 | 3;

export function lessonStatuses(bundle: ContentBundle, state: GameState): Map<string, LessonStatus> {
  const done = new Set(state.progress.completedLessons);
  const statuses = new Map<string, LessonStatus>();
  let nextGiven = false;
  for (const lesson of allLessons(bundle)) {
    if (done.has(lesson.id)) {
      statuses.set(lesson.id, "done");
    } else if (!nextGiven) {
      statuses.set(lesson.id, "next");
      nextGiven = true;
    } else {
      statuses.set(lesson.id, "locked");
    }
  }
  return statuses;
}

export function nextLessonId(bundle: ContentBundle, state: GameState): string | null {
  const done = new Set(state.progress.completedLessons);
  return allLessons(bundle).find((lesson) => !done.has(lesson.id))?.id ?? null;
}

export function currentStage(bundle: ContentBundle, state: GameState): Stage | null {
  return bundle.stages[state.pet.stage - 1] ?? bundle.stages[bundle.stages.length - 1] ?? null;
}

/** The XP a child can earn in a stage from lessons and their exercises. */
export function stageXpMax(stage: Stage): number {
  return stage.topics
    .flatMap((topic) => topic.lessons)
    .reduce(
      (sum, lesson) =>
        sum +
        XP.lesson +
        lesson.exercises.reduce((part, exercise) => part + (exercise.type === "code" ? XP.codeFirstTry : XP.question), 0),
      0,
    );
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
