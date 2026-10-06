import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { BADGES, masteredConcepts, practisingConcepts } from "./badges";
import { emptyMastery } from "./mastery";
import { initialGameState } from "./state";

const lessons = (day: string, n = 2): [string, GameEvent][] =>
  Array.from({ length: n }, (_, i) => [day, { type: "LessonCompleted", lessonId: `${day}-${i}` }]);

describe("badges", () => {
  test("are given once, on the day they are earned", () => {
    const state = run(initialGameState("2026-10-05"), [
      ...lessons("2026-10-05"),
      ...lessons("2026-10-06"),
      ...lessons("2026-10-07", 6),
      ...lessons("2026-10-08"),
    ]);
    expect(state.badges).toEqual({ "first-lesson": "2026-10-05", "lessons-10": "2026-10-07", "streak-3": "2026-10-07" });
  });

  test("a perfect review station, a passed topic test and an evolution", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-05", { type: "ReviewCompleted", stationId: null, correct: 3, total: 3 }],
      ["2026-10-06", { type: "TopicTestCompleted", topicId: "t", score: 14, max: 14, items: [] }],
      [
        "2026-10-07",
        { type: "EvolutionTestCompleted", stage: 1, score: 24, max: 24, items: [], wrongConcepts: [], remedialItems: [] },
      ],
    ]);
    expect(state.badges).toEqual({
      "perfect-review": "2026-10-05",
      "topic-test": "2026-10-06",
      "evolution-2": "2026-10-07",
    });
  });

  test("a right answer after 3 failed tries gives the persistence badge, after 2 it does not", () => {
    const solved = (failedSubmitsBefore: number): GameEvent => ({
      type: "ExerciseJudged",
      exerciseId: "x",
      accepted: true,
      failedSubmitsBefore,
      hintsUsed: 0,
      viewedSolution: false,
    });
    const day = at("2026-10-05");
    expect(apply(initialGameState("2026-10-05"), solved(3), day).badges).toEqual({ persistence: "2026-10-05" });
    expect(apply(initialGameState("2026-10-05"), solved(2), day).badges).toEqual({});
  });

  test("the week plan badge comes with the week's reward", () => {
    const start = initialGameState("2026-10-05");
    start.settings.weeklyTarget = 1;
    const state = run(start, [...lessons("2026-10-05", 1), ["2026-10-12", { type: "DayRollover" }]]);
    expect(state.badges["week-plan"]).toBe("2026-10-12");
  });

  test("counts concepts known well and being practised", () => {
    const state = initialGameState("2026-10-05");
    state.mastery = {
      a: { ...emptyMastery(), score: 80 },
      b: { ...emptyMastery(), score: 70 },
      c: { ...emptyMastery(), score: 40 },
      d: { ...emptyMastery(), score: 39 },
    };
    expect(masteredConcepts(state)).toBe(1);
    expect(practisingConcepts(state)).toBe(2);
  });

  test("every badge id is unique", () => {
    expect(new Set(BADGES).size).toBe(BADGES.length);
  });
});

describe("ActiveTimeRecorded", () => {
  test("adds seconds to today, at most a day, and keeps 60 days", () => {
    const start = initialGameState("2026-10-05");
    start.activity.seconds = { "2026-08-01": 600, "2026-09-01": 300 };
    const state = run(start, [
      ["2026-10-05", { type: "ActiveTimeRecorded", seconds: 60 }],
      ["2026-10-05", { type: "ActiveTimeRecorded", seconds: 59.6 }],
      ["2026-10-05", { type: "ActiveTimeRecorded", seconds: -5 }],
    ]);
    expect(state.activity.seconds).toEqual({ "2026-09-01": 300, "2026-10-05": 120 });
    const full = apply(state, { type: "ActiveTimeRecorded", seconds: 100_000 }, at("2026-10-05"));
    expect(full.activity.seconds["2026-10-05"]).toBe(86_400);
    expect(full.activity.lastActiveDay).toBeNull();
  });
});

describe("practice from the parent", () => {
  test("is kept until done; an empty or repeated one is ignored", () => {
    const state = run(initialGameState("2026-10-05"), [
      ["2026-10-05", { type: "PracticeAssigned", id: "p1", conceptId: "k1", items: ["q1", "q2"] }],
      ["2026-10-05", { type: "PracticeAssigned", id: "p1", conceptId: "k1", items: ["q3"] }],
      ["2026-10-05", { type: "PracticeAssigned", id: "p2", conceptId: "k2", items: [] }],
    ]);
    expect(state.assigned).toEqual([{ id: "p1", conceptId: "k1", items: ["q1", "q2"], day: "2026-10-05" }]);
    const done = apply(state, { type: "AssignedPracticeDone", id: "p1" }, at("2026-10-06"));
    expect(done.assigned).toEqual([]);
    expect(done.activity.lastActiveDay).toBe("2026-10-06");
  });

  test("SupportGiven clears the help flag and its counters and keeps the score", () => {
    const start = initialGameState("2026-10-05");
    start.mastery.k1 = { ...emptyMastery(), score: 35, needsHelp: true, misconceptions: 3, recent: [0, 0], reviewMisses: 2 };
    const state = apply(start, { type: "SupportGiven", conceptId: "k1" }, at("2026-10-06"));
    expect(state.mastery.k1).toEqual({ ...emptyMastery(), score: 35, coachedAt: "2026-10-06" });
  });
});
