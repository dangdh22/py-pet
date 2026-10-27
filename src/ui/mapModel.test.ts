import { describe, expect, test } from "vitest";
import { initialGameState, type EvolutionAttempt, type GameState } from "../game/state";
import { examBundle, twoStageBundle } from "../test/examBundle";
import { testBundle } from "../test/fixtures";
import { reviewBundle } from "../test/reviewBundle";
import { mapModel } from "./mapModel";

const TODAY = "2026-10-06";

function attempt(overrides: Partial<EvolutionAttempt>): EvolutionAttempt {
  return { at: "2026-10-06T09:00:00.000Z", stage: 1, score: 7, max: 7, passed: true, items: [], wrongConcepts: [], ...overrides };
}

/** The state after stage "x" of `examBundle()` is done: both lessons, the topic test and a passed evolution test. */
function stageOneDone(): GameState {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  state.progress.topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };
  state.pet.stage = 2;
  state.progress.evolutionTests = [attempt({})];
  return state;
}

describe("mapModel", () => {
  test("a new profile: the first lesson is next, the second is locked", () => {
    const model = mapModel(testBundle(), initialGameState(TODAY));
    expect(model.current).toBe(0);
    expect(model.stages).toHaveLength(1);
    const stage = model.stages[0]!;
    expect(stage.number).toBe(1);
    expect(stage.evolution).toBeNull();
    expect(stage.passed).toBe(false);
    const topic = stage.topics[0]!;
    expect(topic).toMatchObject({ number: 1, lessonsDone: 0, lessonCount: 2, open: true, test: undefined });
    expect(topic.nodes.map(({ node, status, number }) => [node.id, status, number])).toEqual([
      ["t.l1", "next", 1],
      ["t.l2", "locked", 2],
    ]);
  });

  test("a review station has no number and the lessons after it go on counting", () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1", "r.l2"];
    const nodes = mapModel(reviewBundle(), state).stages[0]!.topics[0]!.nodes;
    expect(nodes.map(({ node, status, number }) => [node.id, status, number])).toEqual([
      ["r.l1", "done", 1],
      ["r.l2", "done", 2],
      ["r.r1", "next", null],
      ["r.l3", "locked", 3],
    ]);
    expect(mapModel(reviewBundle(), state).stages[0]!.topics[0]).toMatchObject({ lessonsDone: 2, lessonCount: 3 });
  });

  test("a topic test and an evolution test that are done: the stage is passed", () => {
    const stage = mapModel(examBundle(), stageOneDone()).stages[0]!;
    expect(stage.passed).toBe(true);
    expect(stage.evolution).toMatchObject({ status: "done", number: null });
    expect(stage.bestPass?.score).toBe(7);
    expect(stage.topics[0]!.test?.best).toBe(6);
    expect(stage.topics[0]!.nodes.map((view) => view.number)).toEqual([1, 2, null]);
  });

  test("a stage with an evolution test still to do is not passed; the last passed paper is the best one", () => {
    const state = stageOneDone();
    state.pet.stage = 1;
    state.progress.evolutionTests = [attempt({ passed: true, score: 6 }), attempt({ passed: false, score: 2 }), attempt({ passed: true, score: 7 })];
    const stage = mapModel(examBundle(), state).stages[0]!;
    expect(stage.passed).toBe(false);
    expect(stage.evolution?.status).toBe("next");
    expect(stage.bestPass?.score).toBe(7);
    state.progress.evolutionTests = [attempt({ passed: false }), attempt({ stage: 2, passed: true })];
    expect(mapModel(examBundle(), state).stages[0]!.bestPass).toBeUndefined();
  });

  test("the current stage follows the next step; the last stage when nothing is left", () => {
    const bundle = twoStageBundle();
    const fresh = mapModel(bundle, initialGameState(TODAY));
    expect(fresh.current).toBe(0);
    expect(fresh.stages[1]!.topics[0]!.open).toBe(false);

    const state = stageOneDone();
    expect(mapModel(bundle, state).current).toBe(1);
    expect(mapModel(bundle, state).stages[1]!.topics[0]!.open).toBe(true);

    state.progress.completedLessons.push("t.l1", "t.l2");
    const all = mapModel(bundle, state);
    expect(all.current).toBe(1);
    expect(all.stages[1]!.evolution).toBeNull();
    expect(all.stages[1]!.passed).toBe(true);
  });

  test("no stages: the current stage is 0", () => {
    expect(mapModel({ ...testBundle(), stages: [] }, initialGameState(TODAY))).toEqual({ stages: [], current: 0 });
  });
});
