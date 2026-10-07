import { describe, expect, test } from "vitest";
import { contentBundle } from "../content/bundle";
import { findConcept, findItem, findLesson } from "../content/lookup";
import type { ContentBundle, Exercise } from "../content/types";
import { reviewBundle, reviewCode } from "../test/reviewBundle";
import { emptyMastery } from "./mastery";
import { seededRng } from "./random";
import { availableItems, buildPracticeSet, buildReviewSet, conceptsMet, REVIEW_SIZE } from "./reviewSet";
import { initialGameState, type GameState } from "./state";

/** The sample bundle, with a lesson 2 that teaches c2 through a code exercise (the sample has none). */
function sampleBundle(): ContentBundle {
  const base = reviewBundle();
  base.stages[0]!.topics[0]!.lessons[1]!.exercises = [{ ...reviewCode, id: "r.l2.ex1", concepts: ["c2"] }];
  return base;
}

const bundle = sampleBundle();
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
      ["r.l1.ex1", "r.p1", "r.q1", "r.q2", "r.q6"].sort(),
    );
  });
});

/** The sample bundle plus a practice item that needs c1 and c2, and one with no concepts. */
function conceptBundle(): { bundle: ContentBundle } {
  const base = sampleBundle();
  const both: Exercise = { ...reviewCode, id: "r.c1", concepts: ["c1", "c2"] };
  const noConcepts: Exercise = { ...reviewCode, id: "r.c2", concepts: [] };
  base.stages[0]!.topics[0]!.practice.push(both, noConcepts);
  return { bundle: base };
}

describe("conceptsMet", () => {
  test("holds the concepts of the exercises of finished lessons only", () => {
    const { bundle: b } = conceptBundle();
    expect([...conceptsMet(b, stateWith([]))]).toEqual([]);
    expect([...conceptsMet(b, stateWith(["r.l1"]))]).toEqual(["c1"]);
    expect([...conceptsMet(b, stateWith(["r.l2"]))]).toEqual(["c2"]);
    expect([...conceptsMet(b, stateWith(["r.l1", "r.l2"]))].sort()).toEqual(["c1", "c2"]);
  });
});

describe("availableItems and practice items", () => {
  test("a practice item opens once every concept of it was met in a finished lesson", () => {
    const { bundle: b } = conceptBundle();
    const open = (lessons: string[]) =>
      [...availableItems(b, stateWith(lessons)).keys()].filter((id) => ["r.p1", "r.f1", "r.c1"].includes(id)).sort();
    expect(open([])).toEqual([]);
    // c1 is met in lesson 1 only: r.p1 (c1) opens, r.f1 (c2) and r.c1 (c1 and c2) wait for lesson 2.
    expect(open(["r.l1"])).toEqual(["r.p1"]);
    expect(open(["r.l2"])).toEqual(["r.f1"]);
    expect(open(["r.l1", "r.l2"])).toEqual(["r.c1", "r.f1", "r.p1"]);
  });

  test("an item without concepts follows the first finished lesson of its topic", () => {
    const { bundle: b } = conceptBundle();
    expect(availableItems(b, stateWith([])).has("r.c2")).toBe(false);
    expect(availableItems(b, stateWith(["r.l3"])).has("r.c2")).toBe(true);
  });

  test("bank questions keep the rule of their lessons", () => {
    const { bundle: b } = conceptBundle();
    const keys = [...availableItems(b, stateWith(["r.l2"])).keys()];
    expect(keys).toContain("r.q3");
    expect(keys).not.toContain("r.q1");
  });

  test("a practice set after a misconception does not give a concept item that needs a later lesson", () => {
    const { bundle: b } = conceptBundle();
    const state = stateWith(["r.l1"]);
    state.mastery = { c2: { ...emptyMastery(), level: 2 } };
    const set = buildPracticeSet(b, state, "c2", seededRng(1)).map((i) => i.id);
    expect(set).not.toContain("r.f1");
    expect(set).not.toContain("r.c1");
    expect(buildPracticeSet(b, stateWith(["r.l1", "r.l2"]), "c2", seededRng(1)).map((i) => i.id)).toContain("r.f1");
  });
});

describe("practice items of the real content", () => {
  const real = (lessons: string[]) => [...availableItems(contentBundle, stateWith(lessons)).keys()];

  test("s4.chu-so.c5 needs continue, taught in lesson 5", () => {
    expect(findLesson(contentBundle, "s4.chu-so.l5")).toBeDefined();
    expect(real(["s4.chu-so.l1"])).not.toContain("s4.chu-so.c5");
    expect(real(["s4.chu-so.l1", "s4.chu-so.l2", "s4.chu-so.l3", "s4.chu-so.l4"])).not.toContain("s4.chu-so.c5");
    expect(real(["s4.chu-so.l1", "s4.chu-so.l5"])).toContain("s4.chu-so.c5");
  });

  test("s4.for-range.c2 needs the step of range, taught in lesson 3", () => {
    expect(real(["s4.for-range.l1", "s4.for-range.l2"])).not.toContain("s4.for-range.c2");
    expect(real(["s4.for-range.l2", "s4.for-range.l3"])).toContain("s4.for-range.c2");
  });

  test("s4.long-nhau.c4 needs the spaces at the start of a row, taught in lesson 5", () => {
    expect(real(["s4.long-nhau.l1", "s4.long-nhau.l2", "s4.long-nhau.l3", "s4.long-nhau.l4"])).not.toContain("s4.long-nhau.c4");
    expect(real(["s4.long-nhau.l3", "s4.long-nhau.l5"])).toContain("s4.long-nhau.c4");
  });

  test("the 3 items removed from the level 3 lists in M5d are back, each with the concept of its later lesson", () => {
    const back: [string, string, string][] = [
      ["digit-split", "s4.chu-so.c5", "continue-skip"],
      ["range-stop-excluded", "s4.for-range.c2", "range-start-step"],
      ["row-col-pattern", "s4.long-nhau.c4", "leading-spaces"],
    ];
    for (const [conceptId, itemId, laterConcept] of back) {
      expect(findConcept(contentBundle, conceptId)?.practice.level3).toContain(itemId);
      expect(findItem(contentBundle, itemId)?.concepts).toContain(laterConcept);
    }
  });

  test("every practice item opens once all the lessons are done", () => {
    const all = contentBundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons.map((lesson) => lesson.id)));
    const open = new Set(real(all));
    const hidden = contentBundle.stages
      .flatMap((stage) => stage.topics.flatMap((topic) => topic.practice))
      .filter((item) => !open.has(item.id))
      .map((item) => item.id);
    expect(hidden).toEqual([]);
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
    // c2 has no level 3 item; r.q3 (level 1) and r.f1 (level 2) need c2, taught in lesson 2, not learned: only r.q6.
    expect(buildPracticeSet(bundle, state, "c2", seededRng(1)).map((i) => i.id)).toEqual(["r.q6"]);
    state.progress.completedLessons = ["r.l1", "r.l2"];
    expect(buildPracticeSet(bundle, state, "c2", seededRng(1)).map((i) => i.id)).toEqual(["r.f1", "r.q3"]);
  });
});
