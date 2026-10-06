import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { displayStreak, roomCondition } from "./progress";
import { initialGameState } from "./state";
import { isVacationDay, weekTarget, workDaysBetween } from "./vacation";

const lessons = (day: string): [string, GameEvent][] => [
  [day, { type: "LessonCompleted", lessonId: `a-${day}` }],
  [day, { type: "LessonCompleted", lessonId: `b-${day}` }],
];

describe("vacation days", () => {
  test("switched on now, then off: the days taken stay vacation days", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-06", { type: "VacationToggled", on: true }],
      ["2026-10-09", { type: "VacationToggled", on: false }],
    ]);
    expect(state.vacation).toEqual({ since: null, ranges: [{ start: "2026-10-06", end: "2026-10-08" }] });
    expect(["2026-10-05", "2026-10-06", "2026-10-08", "2026-10-09"].map((d) => isVacationDay(state, d))).toEqual([
      false,
      true,
      true,
      false,
    ]);
  });

  test("scheduled from today or later; a cancelled one is removed or ends yesterday", () => {
    const start = initialGameState("2026-10-05");
    const state = run(start, [
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-01", end: "2026-10-03" }],
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-12", end: "2026-10-10" }],
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-12", end: "2026-10-16" }],
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-20", end: "2026-10-21" }],
      ["2026-10-14", { type: "VacationCancelled", start: "2026-10-12" }],
      ["2026-10-14", { type: "VacationCancelled", start: "2026-10-20" }],
    ]);
    expect(state.vacation.ranges).toEqual([{ start: "2026-10-12", end: "2026-10-13" }]);
  });

  test("counts only the days that are not vacation days", () => {
    const state = initialGameState("2026-10-05");
    state.vacation.ranges = [{ start: "2026-10-07", end: "2026-10-08" }];
    expect(workDaysBetween(state, "2026-10-05", "2026-10-10")).toBe(2);
    expect(workDaysBetween(state, "2026-10-05", "2026-10-06")).toBe(0);
    state.settings.weeklyTarget = 10;
    expect(weekTarget(state, "2026-10-05")).toBe(8);
  });
});

describe("vacation and the game", () => {
  test("Pin and Vui do not drop on vacation days", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ["2026-10-06", { type: "VacationToggled", on: true }],
      ["2026-10-15", { type: "DayRollover" }],
    ]);
    expect(state.pet).toMatchObject({ pin: 5, vui: 4 });
  });

  test("the streak is frozen during a vacation", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ["2026-10-06", { type: "VacationScheduled", start: "2026-10-06", end: "2026-10-10" }],
      ...lessons("2026-10-11"),
    ]);
    expect(state.streak.current).toBe(2);
    expect(displayStreak(state, "2026-10-12")).toBe(2);
  });

  test("the week plan leaves out vacation days", () => {
    const start = initialGameState("2026-10-05");
    start.settings.weeklyTarget = 7;
    const state = run(start, [
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-07", end: "2026-10-11" }],
      ...lessons("2026-10-05"),
      ["2026-10-12", { type: "DayRollover" }],
    ]);
    // 2 working days: the plan of 7 lessons becomes 2, and 2 lessons meet it.
    expect(state.wallet.history).toEqual([{ day: "2026-10-12", delta: 50, reason: "week", ref: "2026-10-05" }]);
  });

  test("the room shows the vacation first", () => {
    const state = apply(initialGameState("2026-10-05"), { type: "VacationToggled", on: true }, at("2026-10-05"));
    state.pet.pin = 0;
    expect(roomCondition(state, "2026-10-05")).toBe("vacation");
    expect(roomCondition({ ...state, vacation: { since: null, ranges: [] } }, "2026-10-05")).toBe("drained");
  });

  test("old ranges are dropped after 60 days", () => {
    const start = initialGameState("2026-10-05");
    start.vacation.ranges = [
      { start: "2026-07-01", end: "2026-07-02" },
      { start: "2026-09-01", end: "2026-09-02" },
    ];
    const state = apply(start, { type: "DayRollover" }, at("2026-10-05"));
    expect(state.vacation.ranges).toEqual([{ start: "2026-09-01", end: "2026-09-02" }]);
  });

  test("days outside a vacation still cost streak savers", () => {
    // 2 work days missed, 1 saver: the streak starts again
    const start = initialGameState("2026-10-05");
    start.streak = { current: 5, best: 5, freezes: 1, lastAchievedDay: "2026-10-05", pointsDay: "2026-10-05", points: 2 };
    start.vacation.ranges = [{ start: "2026-10-07", end: "2026-10-08" }];
    const state = run(start, lessons("2026-10-10"));
    expect(state.streak).toMatchObject({ current: 1, freezes: 1 });

    // 1 work day missed, 1 saver used
    const start2 = initialGameState("2026-10-05");
    start2.streak = { current: 5, best: 5, freezes: 1, lastAchievedDay: "2026-10-05", pointsDay: "2026-10-05", points: 2 };
    start2.vacation.ranges = [{ start: "2026-10-06", end: "2026-10-08" }];
    const state2 = run(start2, lessons("2026-10-10"));
    expect(state2.streak).toMatchObject({ current: 6, freezes: 0 });
  });

  test("decay starts again after the vacation, after the free first day", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-06", end: "2026-10-08" }],
      ["2026-10-11", { type: "DayRollover" }],
    ]);
    expect(state.pet).toMatchObject({ pin: 4, vui: 3 });
  });

  test("a week fully on vacation pays nothing", () => {
    const start = initialGameState("2026-10-05");
    start.settings.weeklyTarget = 1;
    const state = run(start, [
      ["2026-10-05", { type: "VacationScheduled", start: "2026-10-05", end: "2026-10-11" }],
      ...lessons("2026-10-05"),
      ["2026-10-12", { type: "DayRollover" }],
    ]);
    expect(state.wallet.history.filter((e) => e.reason === "week")).toEqual([]);
    expect(weekTarget(state, "2026-10-05")).toBe(0);
  });

  test("vacation changes are ignored while the clock is set back", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-10", { type: "LessonCompleted", lessonId: "a" }],
      ["2026-10-08", { type: "VacationToggled", on: true }],
      ["2026-10-08", { type: "VacationScheduled", start: "2026-10-08", end: "2026-10-09" }],
    ]);
    expect(state.vacation).toEqual({ since: null, ranges: [] });
  });
});
