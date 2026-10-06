import { describe, expect, test } from "vitest";
import { reviewBundle } from "../test/reviewBundle";
import { examBundle } from "../test/examBundle";
import { findNode, hasTest, nextNode, nextStep, nodeStatuses, pathNodes } from "./path";
import { stageXp, stageXpMax } from "./progress";
import { initialGameState } from "./state";

const bundle = reviewBundle();

function stateWith(lessons: string[], reviews: string[] = []) {
  const state = initialGameState("2026-10-06");
  state.progress.completedLessons = lessons;
  state.progress.completedReviews = reviews;
  return state;
}

describe("path", () => {
  test("places each review station after its lesson with the lessons it reviews", () => {
    expect(pathNodes(bundle)).toEqual([
      { kind: "lesson", id: "r.l1", topicId: "r.topic" },
      { kind: "lesson", id: "r.l2", topicId: "r.topic" },
      { kind: "review", id: "r.r1", topicId: "r.topic", lessons: ["r.l1", "r.l2"] },
      { kind: "lesson", id: "r.l3", topicId: "r.topic" },
    ]);
    expect(findNode(bundle, "r.r1")?.kind).toBe("review");
    expect(findNode(bundle, "nope")).toBeUndefined();
  });

  test("a station must be done before the next lesson opens", () => {
    expect([...nodeStatuses(bundle, stateWith([]))]).toEqual([
      ["r.l1", "next"],
      ["r.l2", "locked"],
      ["r.r1", "locked"],
      ["r.l3", "locked"],
    ]);
    const beforeStation = stateWith(["r.l1", "r.l2"]);
    expect(nodeStatuses(bundle, beforeStation).get("r.r1")).toBe("next");
    expect(nodeStatuses(bundle, beforeStation).get("r.l3")).toBe("locked");
    expect(nextNode(bundle, beforeStation)?.id).toBe("r.r1");
    const afterStation = stateWith(["r.l1", "r.l2"], ["r.r1"]);
    expect(nodeStatuses(bundle, afterStation).get("r.l3")).toBe("next");
    expect(nextNode(bundle, stateWith(["r.l1", "r.l2", "r.l3"], ["r.r1"]))).toBeNull();
  });

  test("stageXpMax counts lessons, lesson exercises and a perfect run of each station", () => {
    expect(stageXpMax(bundle.stages[0]!)).toBe(3 * 10 + 15 + 15);
  });
});

describe("tests on the path", () => {
  const exams = examBundle();

  function examState(lessons: string[]) {
    const state = initialGameState("2026-10-06");
    state.progress.completedLessons = lessons;
    return state;
  }

  test("a topic ends with its test and a stage with its evolution test", () => {
    expect(pathNodes(exams)).toEqual([
      { kind: "lesson", id: "x.l1", topicId: "x.t" },
      { kind: "lesson", id: "x.l2", topicId: "x.t" },
      { kind: "topicTest", id: "x.t.test", topicId: "x.t" },
      { kind: "evolution", id: "x.evolution", stageId: "x", stage: 1 },
    ]);
  });

  test("the topic test is done at any score; the evolution test only when passed", () => {
    const state = examState(["x.l1", "x.l2"]);
    expect(nextNode(exams, state)?.id).toBe("x.t.test");
    state.progress.topicTests["x.t"] = { attempts: 1, best: 2, max: 6, passed: false, lastItems: [] };
    expect(nextNode(exams, state)?.id).toBe("x.evolution");
    state.progress.evolutionTests.push({ at: "", stage: 1, score: 1, max: 7, passed: false, items: [], wrongConcepts: [] });
    expect(nextNode(exams, state)?.id).toBe("x.evolution");
    state.pet.stage = 2;
    expect(nextNode(exams, state)).toBeNull();
  });

  test("an open focused review set comes first", () => {
    const state = examState(["x.l1", "x.l2"]);
    expect(nextStep(exams, state)).toEqual({ kind: "node", node: { kind: "topicTest", id: "x.t.test", topicId: "x.t" } });
    state.remedial = { stage: 1, items: ["x.q1"] };
    expect(nextStep(exams, state)).toEqual({ kind: "remedial" });
  });

  test("a config of 0 items has no test", () => {
    expect(hasTest({ questions: 0, code: 0 })).toBe(false);
    expect(hasTest({ questions: 0, ai: 0, code: 1 })).toBe(true);
    expect(pathNodes(bundle).map((node) => node.kind)).not.toContain("topicTest");
  });

  test("stageXpMax adds 30 XP for each topic test", () => {
    expect(stageXpMax(exams.stages[0]!)).toBe(2 * 10 + 2 * 15 + 30);
  });

  test("stageXp counts from the start of the stage", () => {
    const state = examState([]);
    state.pet.xp = 150;
    state.pet.stageStartXp = 120;
    expect(stageXp(state)).toBe(30);
  });
});
