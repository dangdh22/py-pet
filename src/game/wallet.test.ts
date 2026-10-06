import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply } from "./apply";
import { initialGameState, WALLET_HISTORY_LIMIT } from "./state";
import { changeXu } from "./wallet";

describe("wallet history", () => {
  test("every xu change is recorded with its day, reason and source", () => {
    const state = run(initialGameState("2026-10-06"), [
      [
        "2026-10-06",
        { type: "ExerciseJudged", exerciseId: "e1", accepted: true, failedSubmitsBefore: 0, hintsUsed: 0, viewedSolution: false },
      ],
      ["2026-10-07", { type: "ReviewCompleted", stationId: "r1", correct: 5, total: 5 }],
      ["2026-10-07", { type: "TopicTestCompleted", topicId: "t1", score: 14, max: 14, items: [] }],
    ]);
    expect(state.wallet.xu).toBe(8 + 15 + 20);
    expect(state.wallet.history).toEqual([
      { day: "2026-10-06", delta: 8, reason: "code", ref: "e1" },
      { day: "2026-10-07", delta: 15, reason: "review", ref: "r1" },
      { day: "2026-10-07", delta: 20, reason: "topicTest", ref: "t1" },
    ]);
  });

  test("streak and week plan bonuses are recorded too", () => {
    let state = initialGameState("2026-10-05");
    state.settings.weeklyTarget = 1;
    for (const day of ["2026-10-05", "2026-10-06", "2026-10-07"]) {
      state = apply(state, { type: "LessonCompleted", lessonId: `l-${day}` }, at(day));
      state = apply(state, { type: "LessonCompleted", lessonId: `m-${day}` }, at(day));
    }
    state = apply(state, { type: "DayRollover" }, at("2026-10-12"));
    expect(state.wallet.history.map((entry) => [entry.reason, entry.delta, entry.ref])).toEqual([
      ["streak", 20, "3"],
      ["week", 100, "2026-10-05"],
    ]);
  });

  test("keeps the latest entries only", () => {
    const state = initialGameState("2026-10-06");
    for (let i = 0; i < WALLET_HISTORY_LIMIT + 5; i += 1) changeXu(state, 1, "code", `e${i}`, "2026-10-06");
    expect(state.wallet.xu).toBe(WALLET_HISTORY_LIMIT + 5);
    expect(state.wallet.history).toHaveLength(WALLET_HISTORY_LIMIT);
    expect(state.wallet.history[0]!.ref).toBe("e5");
  });
});
