import type { ContentBundle } from "../content/types";
import type { GameState } from "./state";

/** A step of the learning map: a lesson, or a review station with the lessons it reviews (spec 5.3). */
export type PathNode =
  | { kind: "lesson"; id: string; topicId: string }
  | { kind: "review"; id: string; topicId: string; lessons: string[] };

export type NodeStatus = "done" | "next" | "locked";

export function pathNodes(bundle: ContentBundle): PathNode[] {
  const nodes: PathNode[] = [];
  for (const topic of bundle.stages.flatMap((stage) => stage.topics)) {
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
  }
  return nodes;
}

export function isNodeDone(node: PathNode, state: GameState): boolean {
  return node.kind === "lesson"
    ? state.progress.completedLessons.includes(node.id)
    : state.progress.completedReviews.includes(node.id);
}

/** Done nodes, then the first node not done (next), then the rest (locked): a station must be done to go on. */
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

export function findNode(bundle: ContentBundle, id: string): PathNode | undefined {
  return pathNodes(bundle).find((node) => node.id === id);
}
