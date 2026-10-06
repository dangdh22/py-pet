import { describe, expect, test } from "vitest";
import { reviewBundle } from "../test/reviewBundle";
import { findNode, nextNode, nodeStatuses, pathNodes } from "./path";
import { stageXpMax } from "./progress";
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
