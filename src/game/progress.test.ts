import { describe, expect, test } from "vitest";
import { testBundle } from "../test/fixtures";
import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
  petCondition,
  stageXpMax,
  todayPoints,
  weekLessons,
} from "./progress";
import { initialGameState } from "./state";

const bundle = testBundle();

describe("stage", () => {
  test("currentStage follows pet.stage", () => {
    expect(currentStage(bundle, initialGameState("2026-10-06"))?.id).toBe("t");
  });
});

describe("growth", () => {
  test("stageXpMax sums lesson, code and question XP", () => {
    expect(stageXpMax(bundle.stages[0]!)).toBe(38);
  });

  test("growthSize splits the stage into thirds", () => {
    expect(growthSize(0, 38)).toBe(1);
    expect(growthSize(12, 38)).toBe(1);
    expect(growthSize(13, 38)).toBe(2);
    expect(growthSize(26, 38)).toBe(3);
    expect(growthSize(5, 0)).toBe(1);
  });

  test("growthPercent is capped at 100", () => {
    expect(growthPercent(19, 38)).toBe(50);
    expect(growthPercent(50, 38)).toBe(100);
    expect(growthPercent(5, 0)).toBe(0);
  });
});

describe("pet condition", () => {
  test.each([
    [4, 4, "happy"],
    [3, 4, "normal"],
    [2, 5, "sleepy"],
    [0, 5, "drained"],
    [5, 0, "drained"],
  ] as const)("pin %i, vui %i -> %s", (pin, vui, expected) => {
    const state = initialGameState("2026-10-06");
    state.pet.pin = pin;
    state.pet.vui = vui;
    expect(petCondition(state)).toBe(expected);
  });
});

describe("streak and goals for display", () => {
  test("displayStreak keeps the streak while savers cover the gap", () => {
    const state = initialGameState("2026-10-06");
    expect(displayStreak(state, "2026-10-06")).toBe(0);
    state.streak = { current: 4, best: 4, freezes: 0, lastAchievedDay: "2026-10-05", pointsDay: null, points: 0 };
    expect(displayStreak(state, "2026-10-06")).toBe(4);
    expect(displayStreak(state, "2026-10-07")).toBe(0);
    state.streak.freezes = 1;
    expect(displayStreak(state, "2026-10-07")).toBe(4);
  });

  test("todayPoints and weekLessons reset on a new day or week", () => {
    const state = initialGameState("2026-10-06");
    state.streak.pointsDay = "2026-10-06";
    state.streak.points = 1;
    state.week.lessonsDone = 3;
    expect(todayPoints(state, "2026-10-06")).toBe(1);
    expect(todayPoints(state, "2026-10-07")).toBe(0);
    expect(weekLessons(state, "2026-10-11")).toBe(3);
    expect(weekLessons(state, "2026-10-12")).toBe(0);
  });
});
