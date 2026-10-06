import { evolutionTestId, topicTestId } from "../content/lookup";
import type { ContentBundle, EvolutionTestConfig, TopicTestConfig } from "../content/types";
import type { GameState } from "./state";

/**
 * A step of the learning map (spec 5.3): a lesson, a review station with the lessons it reviews, the test at the end
 * of a topic, or the evolution test at the end of a stage.
 */
export type PathNode =
  | { kind: "lesson"; id: string; topicId: string }
  | { kind: "review"; id: string; topicId: string; lessons: string[] }
  | { kind: "topicTest"; id: string; topicId: string }
  | { kind: "evolution"; id: string; stageId: string; stage: number };

export type NodeStatus = "done" | "next" | "locked";

/** What "Học tiếp" opens (spec 5.3): an open focused review set first, then the next node of the map. */
export type NextStep = { kind: "remedial" } | { kind: "node"; node: PathNode };

/** A test with no items in its config does not exist. */
export function hasTest(config: TopicTestConfig | EvolutionTestConfig): boolean {
  return config.questions + config.code > 0;
}

export function pathNodes(bundle: ContentBundle): PathNode[] {
  const nodes: PathNode[] = [];
  bundle.stages.forEach((stage, index) => {
    for (const topic of stage.topics) {
      const stations = new Map(topic.reviews.map((review) => [review.after, review.id]));
      let since: string[] = [];
      for (const lesson of topic.lessons) {
        nodes.push({ kind: "lesson", id: lesson.id, topicId: topic.id });
        since.push(lesson.id);
        const stationId = stations.get(lesson.id);
        if (stationId) {
          nodes.push({ kind: "review", id: stationId, topicId: topic.id, lessons: since });
          since = [];
        }
      }
      if (hasTest(topic.test)) nodes.push({ kind: "topicTest", id: topicTestId(topic), topicId: topic.id });
    }
    if (hasTest(stage.evolution)) {
      nodes.push({ kind: "evolution", id: evolutionTestId(stage), stageId: stage.id, stage: index + 1 });
    }
  });
  return nodes;
}

export function isNodeDone(node: PathNode, state: GameState): boolean {
  switch (node.kind) {
    case "lesson":
      return state.progress.completedLessons.includes(node.id);
    case "review":
      return state.progress.completedReviews.includes(node.id);
    case "topicTest":
      return state.progress.topicTests[node.topicId] !== undefined;
    case "evolution":
      return state.pet.stage > node.stage;
  }
}

/** Done nodes, then the first node not done (next), then the rest (locked): a station or a test must be done to go on. */
export function nodeStatuses(bundle: ContentBundle, state: GameState): Map<string, NodeStatus> {
  const statuses = new Map<string, NodeStatus>();
  let nextGiven = false;
  for (const node of pathNodes(bundle)) {
    if (isNodeDone(node, state)) {
      statuses.set(node.id, "done");
    } else if (!nextGiven) {
      statuses.set(node.id, "next");
      nextGiven = true;
    } else {
      statuses.set(node.id, "locked");
    }
  }
  return statuses;
}

export function nextNode(bundle: ContentBundle, state: GameState): PathNode | null {
  return pathNodes(bundle).find((node) => !isNodeDone(node, state)) ?? null;
}

export function nextStep(bundle: ContentBundle, state: GameState): NextStep | null {
  if (state.remedial !== null) return { kind: "remedial" };
  const node = nextNode(bundle, state);
  return node ? { kind: "node", node } : null;
}

export function findNode(bundle: ContentBundle, id: string): PathNode | undefined {
  return pathNodes(bundle).find((node) => node.id === id);
}
