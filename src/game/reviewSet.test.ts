import { describe, expect, test } from "vitest";
import { reviewBundle } from "../test/reviewBundle";
import { emptyMastery } from "./mastery";
import { seededRng } from "./random";
import { availableItems, buildPracticeSet, buildReviewSet, REVIEW_SIZE } from "./reviewSet";
import { initialGameState, type GameState } from "./state";

const bundle = reviewBundle();
const TODAY = "2026-10-10";
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

function stateWith(lessons: string[]): GameState {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = lessons;
  return state;
}

function ids(state: GameState, recentLessons: string[], seed: number): string[] {
  return buildReviewSet({ bundle, state, today: TODAY, rng: seededRng(seed), recentLessons }).map((item) => item.id);
}

describe("availableItems", () => {
  test("hides the items of lessons not learned yet", () => {
    expect([...availableItems(bundle, stateWith([])).keys()]).toEqual([]);
    expect([...availableItems(bundle, stateWith(["r.l1"])).keys()].sort()).toEqual(
      ["r.f1", "r.l1.ex1", "r.p1", "r.q1", "r.q2", "r.q6"].sort(),
    );
  });
});

describe("buildReviewSet", () => {
  test("has 5 questions of the learned lessons only", () => {
    for (const seed of SEEDS) {
      const set = ids(stateWith(["r.l1", "r.l2"]), ["r.l1", "r.l2"], seed);
      expect(set).toHaveLength(REVIEW_SIZE);
      expect([...set].sort()).toEqual(["r.q1", "r.q2", "r.q3", "r.q4", "r.q6"]);
    }
  });

  test("always asks about the lessons just learned", () => {
    for (const seed of SEEDS) {
      expect(ids(stateWith(["r.l1", "r.l2", "r.l3"]), ["r.l3"], seed)).toContain("r.q5");
    }
  });

  test("takes 2 due questions, weakest concept first", () => {
    const state = stateWith(["r.l1", "r.l2", "r.l3"]);
    state.reviews = {
      "r.q1": { box: 2, due: "2026-10-09" },
      "r.q2": { box: 1, due: TODAY },
      "r.q4": { box: 3, due: "2026-10-08" },
      "r.q6": { box: 4, due: "2026-10-20" },
    };
    state.mastery = { c1: { ...emptyMastery(), score: 80 }, c2: { ...emptyMastery(), score: 10 } };
    for (const seed of SEEDS) {
      const set = ids(state, ["r.l3"], seed);
      expect(set).toContain("r.q4");
      expect(set).toContain("r.q1");
    }
  });

  test("adds a practice item at the ladder level of a concept that needs help", () => {
    const state = stateWith(["r.l1", "r.l2"]);
    state.mastery = { c2: { ...emptyMastery(), needsHelp: true, level: 2 } };
    for (const seed of SEEDS) expect(ids(state, ["r.l1", "r.l2"], seed)).toContain("r.f1");
  });

  test("brings back an exercise whose solution was shown once it is due", () => {
    const state = stateWith(["r.l1", "r.l2"]);
    state.retry = { "r.l1.ex1": "2026-10-11" };
    expect(ids(state, ["r.l2"], 1)).not.toContain("r.l1.ex1");
    state.retry = { "r.l1.ex1": TODAY };
    for (const seed of SEEDS) expect(ids(state, ["r.l2"], seed)).toContain("r.l1.ex1");
  });

  test("does not bring back a due exercise of a lesson not finished", () => {
    const state = stateWith(["r.l2"]);
    state.retry = { "r.l1.ex1": TODAY };
    for (const seed of SEEDS) expect(ids(state, ["r.l2"], seed)).not.toContain("r.l1.ex1");
  });

  test("returns fewer items when little is learned, and the same set for the same seed", () => {
    expect([...ids(stateWith(["r.l1"]), ["r.l1"], 3)].sort()).toEqual(["r.q1", "r.q2", "r.q6"]);
    expect(ids(stateWith([]), [], 3)).toEqual([]);
    const state = stateWith(["r.l1", "r.l2", "r.l3"]);
    expect(ids(state, ["r.l3"], 9)).toEqual(ids(state, ["r.l3"], 9));
  });
});

describe("buildPracticeSet", () => {
  test("starts at the child's ladder level, then the nearest levels", () => {
    const state = stateWith(["r.l1"]);
    expect(buildPracticeSet(bundle, state, "c1", seededRng(1)).map((i) => i.id)).toEqual(["r.q1", "r.p1"]);
    state.mastery = { c1: { ...emptyMastery(), level: 3 } };
    expect(buildPracticeSet(bundle, state, "c1", seededRng(1)).map((i) => i.id)).toEqual(["r.l1.ex1", "r.p1"]);
    expect(buildPracticeSet(bundle, state, "nope", seededRng(1))).toEqual([]);
  });

  test("falls back to the concept's questions", () => {
    const state = stateWith(["r.l1"]);
    state.mastery = { c2: { ...emptyMastery(), level: 3 } };
    // c2 has no level 3 item; r.q3 (level 1) belongs to lesson 2, not learned: the fill exercise, then r.q6.
    expect(buildPracticeSet(bundle, state, "c2", seededRng(1)).map((i) => i.id)).toEqual(["r.f1", "r.q6"]);
  });
});
