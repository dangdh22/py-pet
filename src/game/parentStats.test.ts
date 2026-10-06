import { describe, expect, test } from "vitest";
import { emptyMastery } from "./mastery";
import { accuracyPercent, averageXuPerDay, conceptsNeedingHelp, conceptsPractising, minutesByDay } from "./parentStats";
import { initialGameState } from "./state";

describe("parent statistics", () => {
  test("minutes of the last 7 days, with the vacation days", () => {
    const state = initialGameState("2026-10-06");
    state.activity.seconds = { "2026-09-29": 600, "2026-09-30": 90, "2026-10-06": 1500 };
    state.vacation.ranges = [{ start: "2026-10-02", end: "2026-10-03" }];
    expect(minutesByDay(state, "2026-10-06")).toEqual([
      { day: "2026-09-30", minutes: 2, vacation: false },
      { day: "2026-10-01", minutes: 0, vacation: false },
      { day: "2026-10-02", minutes: 0, vacation: true },
      { day: "2026-10-03", minutes: 0, vacation: true },
      { day: "2026-10-04", minutes: 0, vacation: false },
      { day: "2026-10-05", minutes: 0, vacation: false },
      { day: "2026-10-06", minutes: 25, vacation: false },
    ]);
  });

  test("xu earned per day over 14 days; spending does not count", () => {
    const state = initialGameState("2026-10-14");
    state.wallet.history = [
      { day: "2026-09-30", delta: 500, reason: "streak", ref: "30" },
      { day: "2026-10-01", delta: 100, reason: "evolution", ref: "1" },
      { day: "2026-10-10", delta: 40, reason: "code", ref: "e" },
      { day: "2026-10-12", delta: -60, reason: "shop", ref: "tranh" },
    ];
    expect(averageXuPerDay(state, "2026-10-14")).toBe(10);
  });

  test("accuracy and the concept lists", () => {
    expect(accuracyPercent({ ...emptyMastery(), recent: [1, 0.6, 0.3, 0] })).toBe(50);
    expect(accuracyPercent(emptyMastery())).toBeNull();
    const state = initialGameState("2026-10-06");
    state.mastery = {
      b: { ...emptyMastery(), score: 30, needsHelp: true },
      a: { ...emptyMastery(), score: 30, needsHelp: true },
      c: { ...emptyMastery(), score: 55 },
      d: { ...emptyMastery(), score: 45, needsHelp: true },
      e: { ...emptyMastery(), score: 80 },
    };
    expect(conceptsNeedingHelp(state).map(([id]) => id)).toEqual(["a", "b", "d"]);
    expect(conceptsPractising(state).map(([id]) => id)).toEqual(["c"]);
  });
});
