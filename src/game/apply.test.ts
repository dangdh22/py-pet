import { describe, expect, test } from "vitest";
import { apply, type GameEvent } from "./apply";
import { isPass } from "./rewards";
import { petCondition } from "./progress";
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

describe("exercise stats", () => {
  const hint: GameEvent = { type: "HintShown", exerciseId: "x" };
  const solution: GameEvent = { type: "SolutionViewed", exerciseId: "x" };

  test("HintShown and SolutionViewed are stored and do not count as activity", () => {
    const next = run(initialGameState("2026-10-06"), [
      ["2026-10-06", hint],
      ["2026-10-06", hint],
      ["2026-10-06", solution],
    ]);
    expect(next.progress.exerciseStats?.x).toEqual({ fails: 0, hints: 2, viewedSolution: true });
    expect(next.activity.lastActiveDay).toBeNull();
    expect(next.pet.xp).toBe(0);
  });

  test("a rejected submit counts a failure until the exercise is solved", () => {
    const next = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x", { accepted: false })],
      ["2026-10-06", solved("x", { accepted: false })],
      ["2026-10-06", solved("x", { failedSubmitsBefore: 2 })],
      ["2026-10-06", solved("x", { accepted: false })],
    ]);
    expect(next.progress.exerciseStats?.x?.fails).toBe(2);
  });

  test("accepted after a stored solution view pays 3 XP and no xu even if the event says first try", () => {
    const next = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solution],
      ["2026-10-06", solved("x")],
    ]);
    expect(next.pet.xp).toBe(3);
    expect(next.wallet.xu).toBe(0);
  });

  test("accepted after stored failures and hints pays the retry reward", () => {
    const next = run(initialGameState("2026-10-06"), [
      ["2026-10-06", hint],
      ["2026-10-06", solved("x", { accepted: false })],
      ["2026-10-06", solved("x", { accepted: false })],
      ["2026-10-06", solved("x", { accepted: false })],
      ["2026-10-06", solved("x")],
    ]);
    expect(next.pet.xp).toBe(10);
    expect(next.wallet.xu).toBe(5);
  });

  test("a stored hint removes the no-hint bonus", () => {
    const next = run(initialGameState("2026-10-06"), [
      ["2026-10-06", hint],
      ["2026-10-06", solved("x")],
    ]);
    expect(next.pet.xp).toBe(15);
    expect(next.wallet.xu).toBe(5);
  });

  test("a saved state without exercise stats still applies", () => {
    const old = initialGameState("2026-10-06");
    delete old.progress.exerciseStats;
    expect(apply(old, solved("x"), at("2026-10-06")).wallet.xu).toBe(8);
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

describe("mastery and Leitner", () => {
  const question = (questionId: string, correct: boolean, extra: Partial<Extract<GameEvent, { type: "QuestionAnswered" }>> = {}): GameEvent => ({
    type: "QuestionAnswered",
    questionId,
    correct,
    concepts: ["c1"],
    ...extra,
  });

  test("a solved exercise updates the score of each concept", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x", { concepts: ["c1", "c2"] })],
      ["2026-10-06", solved("y", { concepts: ["c1"], failedSubmitsBefore: 2 })],
    ]);
    expect(state.mastery.c1).toMatchObject({ score: 39, recent: [1, 0.6], level: 2 });
    expect(state.mastery.c2).toMatchObject({ score: 30, recent: [1] });
  });

  test("a hint or the solution makes s = 0.3", () => {
    const hinted = apply(initialGameState("2026-10-06"), solved("x", { concepts: ["c1"], hintsUsed: 1 }), at("2026-10-06"));
    expect(hinted.mastery.c1!.score).toBe(9);
  });

  test("a failed submit adds no result but counts the misconceptions it shows", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x", { accepted: false, concepts: ["c1"], misconceptions: ["m1"] })],
      ["2026-10-06", solved("x", { accepted: false, concepts: ["c1"], misconceptions: ["m1"] })],
      ["2026-10-06", solved("x", { accepted: false, concepts: ["c1"], misconceptions: ["m1"] })],
    ]);
    expect(state.mastery.c1).toBeUndefined();
    expect(state.mastery.m1).toMatchObject({ misconceptions: 3, needsHelp: true });
  });

  test("a question answer updates the score, the misconception and the Leitner box", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", question("q", false, { misconception: "m1" })],
      ["2026-10-07", question("q", true)],
    ]);
    expect(state.mastery.c1).toMatchObject({ score: 30, recent: [0, 1] });
    expect(state.mastery.m1).toMatchObject({ misconceptions: 1 });
    expect(state.reviews.q).toEqual({ box: 2, due: "2026-10-09" });
  });

  test("a review answer pays no XP and does not change the lesson progress", () => {
    const state = apply(initialGameState("2026-10-06"), question("q", true, { source: "review" }), at("2026-10-06"));
    expect(state.pet.xp).toBe(0);
    expect(state.progress.answeredQuestions).toEqual([]);
    expect(state.reviews.q).toEqual({ box: 2, due: "2026-10-08" });
    expect(state.mastery.c1!.score).toBe(30);
  });

  test("2 wrong review answers in a row flag the concept", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", question("q", false, { source: "review" })],
      ["2026-10-06", question("r", false, { source: "review" })],
    ]);
    expect(state.mastery.c1!.needsHelp).toBe(true);
  });

  test("a solved review exercise pays nothing and is not marked solved", () => {
    const state = apply(initialGameState("2026-10-06"), solved("x", { concepts: ["c1"], source: "review" }), at("2026-10-06"));
    expect(state.pet.xp).toBe(0);
    expect(state.wallet.xu).toBe(0);
    expect(state.progress.solvedExercises).toEqual([]);
    expect(state.mastery.c1!.score).toBe(30);
  });

  test("a shown solution brings the exercise back the next day until it is solved without help", () => {
    const shown = apply(initialGameState("2026-10-06"), { type: "SolutionViewed", exerciseId: "x" }, at("2026-10-06"));
    expect(shown.retry).toEqual({ x: "2026-10-07" });
    const helped = apply(shown, solved("x", { viewedSolution: true }), at("2026-10-06"));
    expect(helped.retry).toEqual({ x: "2026-10-07" });
    const later = apply(helped, solved("x", { source: "review" }), at("2026-10-07"));
    expect(later.retry).toEqual({});
  });
});

describe("ReviewCompleted", () => {
  const review = (stationId: string | null, correct: number, total = 5): GameEvent => ({
    type: "ReviewCompleted",
    stationId,
    correct,
    total,
  });

  test("the first run of a station pays XP, xu, Pin and 1 activity point", () => {
    const start = initialGameState("2026-10-06");
    start.pet.pin = 2;
    const state = apply(start, review("s.r1", 4), at("2026-10-06"));
    expect(state.pet.xp).toBe(13);
    expect(state.wallet.xu).toBe(10);
    expect(state.pet.pin).toBe(4);
    expect(state.progress.completedReviews).toEqual(["s.r1"]);
    expect(state.streak.points).toBe(1);
    expect(state.week.lessonsDone).toBe(0);
    expect(state.activity.lastActiveDay).toBe("2026-10-06");
  });

  test("all answers right adds 5 xu", () => {
    expect(apply(initialGameState("2026-10-06"), review("s.r1", 5), at("2026-10-06")).wallet.xu).toBe(15);
  });

  test("a repeated station or a free review pays XP and Pin but no xu", () => {
    const once = apply(initialGameState("2026-10-06"), review("s.r1", 5), at("2026-10-06"));
    const again = apply(once, review("s.r1", 5), at("2026-10-06"));
    expect(again.wallet.xu).toBe(15);
    expect(again.pet.xp).toBe(30);
    const free = apply(initialGameState("2026-10-06"), review(null, 2), at("2026-10-06"));
    expect(free).toMatchObject({ wallet: { xu: 0 }, pet: { xp: 9, pin: 5 } });
    expect(free.progress.completedReviews).toEqual([]);
  });

  test("an empty station pays the base reward without the all-right bonus", () => {
    const state = apply(initialGameState("2026-10-06"), review("s.r1", 0, 0), at("2026-10-06"));
    expect(state.pet.xp).toBe(5);
    expect(state.wallet.xu).toBe(10);
  });

  test("a review and a lesson on the same day reach the daily goal", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", lesson("a")],
      ["2026-10-06", review("s.r1", 3)],
    ]);
    expect(state.streak).toMatchObject({ points: 2, current: 1 });
  });
});

describe("review answers and Vui", () => {
  const reviewAnswer = (questionId: string, correct: boolean): GameEvent => ({
    type: "QuestionAnswered",
    questionId,
    correct,
    concepts: ["c1"],
    source: "review",
  });

  test("charging by review after a long absence wakes the robot up", () => {
    const start = initialGameState("2026-10-06");
    start.activity.lastActiveDay = "2026-10-06";
    const away = apply(start, { type: "DayRollover" }, at("2026-10-17"));
    expect(away.pet).toMatchObject({ pin: 0, vui: 0 });
    expect(petCondition(away)).toBe("drained");
    const state = run(away, [
      ["2026-10-17", reviewAnswer("q1", true)],
      ["2026-10-17", reviewAnswer("q2", true)],
      ["2026-10-17", reviewAnswer("q3", true)],
      ["2026-10-17", { type: "ReviewCompleted", stationId: null, correct: 3, total: 3 }],
    ]);
    expect(state.pet).toMatchObject({ pin: 2, vui: 1 });
    expect(petCondition(state)).not.toBe("drained");
  });

  test("a wrong review answer resets the correct run", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", reviewAnswer("q1", true)],
      ["2026-10-06", reviewAnswer("q2", true)],
      ["2026-10-06", reviewAnswer("q3", false)],
    ]);
    expect(state.pet.correctRun).toBe(0);
    expect(state.pet.vui).toBe(4);
  });

  test("review answers count for the run but still pay no XP", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", reviewAnswer("q1", true)],
      ["2026-10-06", reviewAnswer("q2", true)],
    ]);
    expect(state.pet.correctRun).toBe(2);
    expect(state.pet.xp).toBe(0);
    expect(state.progress.answeredQuestions).toEqual([]);
  });

  test("a review exercise accepted at the first submit without help counts for the run", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", solved("x", { source: "review" })],
      ["2026-10-06", solved("y", { source: "review" })],
      ["2026-10-06", reviewAnswer("q1", true)],
    ]);
    expect(state.pet).toMatchObject({ correctRun: 3, vui: 5, xp: 0 });
    expect(state.wallet.xu).toBe(0);
    expect(state.progress.solvedExercises).toEqual([]);
    expect(state.progress.exerciseStats ?? {}).toEqual({});
  });

  test("any other judged review submit resets the run", () => {
    for (const extra of [{ accepted: false }, { failedSubmitsBefore: 1 }, { hintsUsed: 1 }, { viewedSolution: true }]) {
      const state = run(initialGameState("2026-10-06"), [
        ["2026-10-06", reviewAnswer("q1", true)],
        ["2026-10-06", solved("x", { source: "review", ...extra })],
      ]);
      expect(state.pet.correctRun).toBe(0);
      expect(state.progress.exerciseStats ?? {}).toEqual({});
    }
  });
});

describe("tests", () => {
  const topicTest = (score: number, max = 14, items = ["a", "b"]): GameEvent => ({
    type: "TopicTestCompleted",
    topicId: "t1",
    score,
    max,
    items,
  });
  const evolution = (
    score: number,
    extra: Partial<Extract<GameEvent, { type: "EvolutionTestCompleted" }>> = {},
  ): GameEvent => ({
    type: "EvolutionTestCompleted",
    stage: 1,
    score,
    max: 24,
    items: ["q1", "c1"],
    wrongConcepts: ["k1"],
    remedialItems: ["p1", "p2"],
    ...extra,
  });

  test("isPass uses 80% with a float tolerance", () => {
    expect(isPass(11.2, 14)).toBe(true);
    expect(isPass(11.19, 14)).toBe(false);
    expect(isPass(19.2, 24)).toBe(true);
    expect(isPass(0, 0)).toBe(false);
  });

  test("a topic test pays 30 XP once, and 20 xu with Vui +1 at the first pass", () => {
    const start = initialGameState("2026-10-06");
    const failed = apply(start, topicTest(8), at("2026-10-06"));
    expect(failed.pet.xp).toBe(30);
    expect(failed.wallet.xu).toBe(0);
    expect(failed.progress.topicTests.t1).toEqual({
      attempts: 1,
      best: 8,
      max: 14,
      passed: false,
      lastItems: ["a", "b"],
    });
    const passed = apply(failed, topicTest(12, 14, ["c"]), at("2026-10-06"));
    expect(passed.pet.xp).toBe(30);
    expect(passed.wallet.xu).toBe(20);
    expect(passed.pet.vui).toBe(5);
    expect(passed.progress.topicTests.t1).toEqual({ attempts: 2, best: 12, max: 14, passed: true, lastItems: ["c"] });
    const again = apply(passed, topicTest(14), at("2026-10-06"));
    expect(again.wallet.xu).toBe(20);
    expect(again.progress.topicTests.t1!.best).toBe(14);
  });

  test("a failed evolution test opens the focused review set and takes nothing away", () => {
    const start = initialGameState("2026-10-06");
    start.pet.xp = 120;
    const failed = apply(start, evolution(10), at("2026-10-06"));
    expect(failed.pet).toMatchObject({ stage: 1, xp: 120, stageStartXp: 0 });
    expect(failed.wallet.xu).toBe(0);
    expect(failed.remedial).toEqual({ stage: 1, items: ["p1", "p2"] });
    expect(failed.progress.evolutionTests).toEqual([
      {
        at: at("2026-10-06").toISOString(),
        stage: 1,
        score: 10,
        max: 24,
        passed: false,
        items: ["q1", "c1"],
        wrongConcepts: ["k1"],
      },
    ]);
    const done = apply(failed, { type: "RemedialCompleted" }, at("2026-10-06"));
    expect(done.remedial).toBeNull();
  });

  test("a failed test with nothing to practise opens no review set", () => {
    const failed = apply(initialGameState("2026-10-06"), evolution(10, { remedialItems: [] }), at("2026-10-06"));
    expect(failed.remedial).toBeNull();
  });

  test("a passed evolution test evolves the robot once, pays 100 xu and Vui +1, and keeps the XP", () => {
    const start = initialGameState("2026-10-06");
    start.pet.xp = 120;
    start.pet.vui = 3;
    start.remedial = { stage: 1, items: ["p1"] };
    const passed = apply(start, evolution(20, { wrongConcepts: [] }), at("2026-10-06"));
    expect(passed.pet).toMatchObject({ stage: 2, xp: 120, stageStartXp: 120, vui: 4 });
    expect(passed.wallet.xu).toBe(100);
    expect(passed.remedial).toBeNull();
    const twice = apply(passed, evolution(24), at("2026-10-06"));
    expect(twice.pet.stage).toBe(2);
    expect(twice.wallet.xu).toBe(100);
  });

  test("test answers pay no XP but count for the Vui run", () => {
    const state = run(initialGameState("2026-10-06"), [
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q1", correct: true, source: "test" }],
      ["2026-10-06", { type: "QuestionAnswered", questionId: "q2", correct: true, source: "test" }],
      ["2026-10-06", solved("c1", { source: "test" })],
    ]);
    expect(state.pet.xp).toBe(0);
    expect(state.pet.vui).toBe(5);
    expect(state.progress.answeredQuestions).toEqual([]);
    expect(state.progress.solvedExercises).toEqual([]);
  });
});
