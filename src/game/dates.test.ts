import { describe, expect, test } from "vitest";
import { addDays, daysBetween, localDay, weekStart } from "./dates";
import { initialGameState } from "./state";

describe("dates", () => {
  test("localDay uses the local calendar", () => {
    expect(localDay(new Date(2026, 9, 6, 23, 59))).toBe("2026-10-06");
    expect(localDay(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });

  test("addDays crosses months and years", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-10-06", -6)).toBe("2026-09-30");
  });

  test("daysBetween counts calendar days", () => {
    expect(daysBetween("2026-10-06", "2026-10-06")).toBe(0);
    expect(daysBetween("2026-10-05", "2026-10-08")).toBe(3);
    expect(daysBetween("2026-10-08", "2026-10-05")).toBe(-3);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });

  test("weekStart returns the Monday", () => {
    expect(weekStart("2026-10-05")).toBe("2026-10-05");
    expect(weekStart("2026-10-06")).toBe("2026-10-05");
    expect(weekStart("2026-10-11")).toBe("2026-10-05");
    expect(weekStart("2026-10-12")).toBe("2026-10-12");
  });
});

describe("initialGameState", () => {
  test("starts with full defaults", () => {
    expect(initialGameState("2026-10-06")).toEqual({
      version: 1,
      pet: { stage: 1, xp: 0, pin: 4, vui: 4, correctRun: 0 },
      wallet: { xu: 0 },
      activity: { lastActiveDay: null, decayApplied: 0 },
      streak: { current: 0, best: 0, freezes: 0, lastAchievedDay: null, pointsDay: null, points: 0 },
      week: { start: "2026-10-05", lessonsDone: 0 },
      settings: { dailyGoal: 2, weeklyTarget: 10, graceDays: 1, uiLang: "vi" },
      progress: { completedLessons: [], solvedExercises: [], answeredQuestions: [] },
      warnings: [],
    });
  });
});
