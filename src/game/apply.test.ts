import { describe, expect, test } from "vitest";
import { apply, type GameEvent } from "./apply";
import { initialGameState, type GameState } from "./state";

const at = (day: string, hour = 10) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00`);

function run(state: GameState, steps: [string, GameEvent][]): GameState {
  return steps.reduce((s, [day, event]) => apply(s, event, at(day)), state);
}

const lesson = (lessonId: string): GameEvent => ({ type: "LessonCompleted", lessonId });
const solved = (exerciseId: string, extra: Partial<Extract<GameEvent, { type: "ExerciseJudged" }>> = {}): GameEvent => ({
  type: "ExerciseJudged",
  exerciseId,
  accepted: true,
  failedSubmitsBefore: 0,
  hintsUsed: 0,
  viewedSolution: false,
  ...extra,
});

describe("LessonCompleted", () => {
  test("rewards the first completion only", () => {
    const start = initialGameState("2026-10-06");
    const once = apply(start, lesson("a"), at("2026-10-06"));
    expect(once.pet.xp).toBe(10);
    expect(once.pet.pin).toBe(5);
    expect(once.progress.completedLessons).toEqual(["a"]);
    expect(once.week.lessonsDone).toBe(1);
    expect(once.streak).toMatchObject({ pointsDay: "2026-10-06", points: 1, current: 0 });
    expect(once.activity).toEqual({ lastActiveDay: "2026-10-06", decayApplied: 0 });
    const twice = apply(once, lesson("a"), at("2026-10-06", 11));
    expect(twice.pet.xp).toBe(10);
    expect(twice.week.lessonsDone).toBe(1);
    expect(twice.streak.points).toBe(1);
  });

  test("does not mutate the input state", () => {
    const start = initialGameState("2026-10-06");
    const before = JSON.stringify(start);
    apply(start, lesson("a"), at("2026-10-06"));
    expect(JSON.stringify(start)).toBe(before);
  });

  test("Pin never goes above 5", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", lesson("b")],
    ]);
    expect(state.pet.pin).toBe(5);
  });
});

describe("streak", () => {
  test("2 lessons in a day achieve the day", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", lesson("b")],
    ]);
    expect(state.streak).toMatchObject({ current: 1, best: 1, lastAchievedDay: "2026-10-06", points: 2 });
  });

  test("consecutive days grow the streak and a missed day without a saver resets it", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", lesson("b")],
      ["2026-10-07", lesson("c")],
      ["2026-10-07", lesson("d")],
    ]);
    expect(state.streak.current).toBe(2);
    const later = run(state, [
      ["2026-10-09", lesson("e")],
      ["2026-10-09", lesson("f")],
    ]);
    expect(later.streak).toMatchObject({ current: 1, best: 2 });
  });

  test("a streak saver covers a missed day", () => {
    const state = initialGameState("2026-10-06");
    state.settings.dailyGoal = 1;
    state.streak = { current: 5, best: 5, freezes: 1, lastAchievedDay: "2026-10-04", pointsDay: null, points: 0 };
    const next = apply(state, lesson("a"), at("2026-10-06"));
    expect(next.streak).toMatchObject({ current: 6, freezes: 0 });
  });

  test("milestones pay xu and every 7 days gives a saver up to 2", () => {
    const three = initialGameState("2026-10-06");
    three.settings.dailyGoal = 1;
    three.streak = { current: 2, best: 2, freezes: 0, lastAchievedDay: "2026-10-05", pointsDay: null, points: 0 };
    expect(apply(three, lesson("a"), at("2026-10-06")).wallet.xu).toBe(20);

    const seven = initialGameState("2026-10-06");
    seven.settings.dailyGoal = 1;
    seven.streak = { current: 6, best: 6, freezes: 0, lastAchievedDay: "2026-10-05", pointsDay: null, points: 0 };
    const afterSeven = apply(seven, lesson("a"), at("2026-10-06"));
    expect(afterSeven.wallet.xu).toBe(50);
    expect(afterSeven.streak.freezes).toBe(1);

    seven.streak.freezes = 2;
    expect(apply(seven, lesson("a"), at("2026-10-06")).streak.freezes).toBe(2);
  });
});

describe("ExerciseJudged", () => {
  test("first try without hints: 15 XP and 8 xu", () => {
    const next = apply(initialGameState("2026-10-06"), solved("x"), at("2026-10-06"));
    expect(next.pet.xp).toBe(15);
    expect(next.wallet.xu).toBe(8);
    expect(next.progress.solvedExercises).toEqual(["x"]);
  });

  test("first try with a hint: 5 xu", () => {
    expect(apply(initialGameState("2026-10-06"), solved("x", { hintsUsed: 1 }), at("2026-10-06")).wallet.xu).toBe(5);
  });

  test("after retries: 10 XP, persistence bonus from 3 failures", () => {
    const one = apply(initialGameState("2026-10-06"), solved("x", { failedSubmitsBefore: 1 }), at("2026-10-06"));
    expect(one.pet.xp).toBe(10);
    expect(one.wallet.xu).toBe(0);
    const three = apply(initialGameState("2026-10-06"), solved("x", { failedSubmitsBefore: 3 }), at("2026-10-06"));
    expect(three.wallet.xu).toBe(5);
  });

  test("after viewing the solution: 3 XP and no xu", () => {
    const next = apply(
      initialGameState("2026-10-06"),
      solved("x", { failedSubmitsBefore: 3, viewedSolution: true }),
      at("2026-10-06"),
    );
    expect(next.pet.xp).toBe(3);
    expect(next.wallet.xu).toBe(0);
  });

  test("a wrong submit gives nothing and a solved exercise pays only once", () => {
    const wrong = apply(initialGameState("2026-10-06"), solved("x", { accepted: false }), at("2026-10-06"));
    expect(wrong.pet.xp).toBe(0);
    expect(wrong.progress.solvedExercises).toEqual([]);
    const again = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x")],
      ["2026-10-06", solved("x")],
    ]);
    expect(again.pet.xp).toBe(15);
  });
});

describe("QuestionAnswered and Vui", () => {
  test("only a correct first answer pays 3 XP", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q", correct: true }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q", correct: true }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "r", correct: false }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "r", correct: true }],
    ]);
    expect(state.pet.xp).toBe(3);
    expect(state.progress.answeredQuestions).toEqual(["q", "r"]);
  });

  test("3 correct in a row raise Vui, a mistake resets the run", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x")],
      ["2026-10-06", solved("y")],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q", correct: true }],
    ]);
    expect(state.pet.vui).toBe(5);
    const broken = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x")],
      ["2026-10-06", solved("y", { accepted: false })],
      ["2026-10-06", solved("y", { failedSubmitsBefore: 1 })],
      ["2026-10-06", solved("z")],
    ]);
    expect(broken.pet.vui).toBe(4);
  });
});

describe("day rollover", () => {
  function activeOn(day: string): GameState {
    const state = initialGameState(day);
    state.activity.lastActiveDay = day;
    return state;
  }

  test("the first absent day is free, then 1 point per day", () => {
    const start = activeOn("2026-10-05");
    expect(apply(start, { type: "DayRollover" }, at("2026-10-07")).pet).toMatchObject({ pin: 4, vui: 4 });
    expect(apply(start, { type: "DayRollover" }, at("2026-10-08")).pet).toMatchObject({ pin: 3, vui: 3 });
  });

  test("rollover is idempotent within a day", () => {
    const once = apply(activeOn("2026-10-05"), { type: "DayRollover" }, at("2026-10-08", 9));
    const twice = apply(once, { type: "DayRollover" }, at("2026-10-08", 20));
    expect(twice.pet.pin).toBe(3);
    const later = apply(twice, { type: "DayRollover" }, at("2026-10-10"));
    expect(later.pet.pin).toBe(1);
  });

  test("stats never go below 0", () => {
    expect(apply(activeOn("2026-09-01"), { type: "DayRollover" }, at("2026-10-06")).pet).toMatchObject({ pin: 0, vui: 0 });
  });

  test("activity after an absence applies the decay, then rewards and resets the counter", () => {
    const next = apply(activeOn("2026-10-01"), lesson("a"), at("2026-10-06"));
    expect(next.pet.pin).toBe(2);
    expect(next.pet.vui).toBe(1);
    expect(next.activity).toEqual({ lastActiveDay: "2026-10-06", decayApplied: 0 });
  });

  test("a new week pays the weekly plan bonus and resets the count", () => {
    const met = initialGameState("2026-09-30");
    met.week.lessonsDone = 10;
    const afterMet = apply(met, { type: "DayRollover" }, at("2026-10-06"));
    expect(afterMet.wallet.xu).toBe(50);
    expect(afterMet.week).toEqual({ start: "2026-10-05", lessonsDone: 0 });

    const exceeded = initialGameState("2026-09-30");
    exceeded.week.lessonsDone = 13;
    expect(apply(exceeded, { type: "DayRollover" }, at("2026-10-06")).wallet.xu).toBe(100);

    const missed = initialGameState("2026-09-30");
    missed.week.lessonsDone = 9;
    expect(apply(missed, { type: "DayRollover" }, at("2026-10-06")).wallet.xu).toBe(0);
  });

  test("clock rollback skips streak and decay and logs one warning per day", () => {
    const start = activeOn("2026-10-08");
    start.streak.points = 1;
    start.streak.pointsDay = "2026-10-08";
    const first = apply(start, lesson("a"), at("2026-10-06", 9));
    expect(first.pet.xp).toBe(10);
    expect(first.week.lessonsDone).toBe(0);
    expect(first.streak).toMatchObject({ points: 1, pointsDay: "2026-10-08", current: 0 });
    expect(first.activity.lastActiveDay).toBe("2026-10-08");
    expect(first.warnings).toHaveLength(1);
    expect(first.warnings[0]).toMatchObject({ kind: "clock-rollback" });
    const second = apply(first, { type: "DayRollover" }, at("2026-10-06", 15));
    expect(second.warnings).toHaveLength(1);
    expect(second.pet.pin).toBe(5);
  });
});

describe("SettingsChanged", () => {
  test("updates settings without counting as activity", () => {
    const next = apply(initialGameState("2026-10-06"), { type: "SettingsChanged", patch: { uiLang: "en" } }, at("2026-10-06"));
    expect(next.settings.uiLang).toBe("en");
    expect(next.activity.lastActiveDay).toBeNull();
  });
});
