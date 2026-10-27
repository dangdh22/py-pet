import type { ContentBundle, Stage, Topic } from "../content/types";
import { nextNode, nodeStatuses, pathNodes, type NodeStatus, type PathNode } from "../game/path";
import type { EvolutionAttempt, GameState, TopicTestRecord } from "../game/state";

/** One square of the learning map. */
export interface MapNodeView {
  node: PathNode;
  status: NodeStatus;
  /** The place of a lesson in its topic, from 1. A review station and a test have none. */
  number: number | null;
}

export interface MapTopicView {
  topic: Topic;
  /** The place of the topic in its stage, from 1. */
  number: number;
  nodes: MapNodeView[];
  lessonsDone: number;
  lessonCount: number;
  test: TopicTestRecord | undefined;
  /** At least 1 square is not locked. */
  open: boolean;
}

export interface MapStageView {
  stage: Stage;
  /** The place of the stage, from 1. It is the `stage` of its evolution test. */
  number: number;
  topics: MapTopicView[];
  /** The evolution test at the end of the stage; null when the stage has none. */
  evolution: MapNodeView | null;
  /** Every square of the stage, the evolution test too, is done. */
  passed: boolean;
  /** The latest passed paper of the evolution test. */
  bestPass: EvolutionAttempt | undefined;
}

/**
 * What the learning map shows: the stages (each a tab) with their topics, the squares of each topic, and the stage that holds the
 * next step (`current`; the last stage when nothing is left to do).
 */
export function mapModel(bundle: ContentBundle, state: GameState): { stages: MapStageView[]; current: number } {
  const statuses = nodeStatuses(bundle, state);
  const nodes = pathNodes(bundle);
  const view = (node: PathNode, number: number | null): MapNodeView => ({
    node,
    status: statuses.get(node.id) ?? "locked",
    number,
  });
  const stages = bundle.stages.map((stage, index): MapStageView => {
    const number = index + 1;
    const topics = stage.topics.map((topic, topicIndex): MapTopicView => {
      let lessons = 0;
      const topicNodes = nodes
        .filter((node) => node.kind !== "evolution" && node.topicId === topic.id)
        .map((node) => view(node, node.kind === "lesson" ? ++lessons : null));
      return {
        topic,
        number: topicIndex + 1,
        nodes: topicNodes,
        lessonsDone: topicNodes.filter(({ node, status }) => node.kind === "lesson" && status === "done").length,
        lessonCount: lessons,
        test: state.progress.topicTests[topic.id],
        open: topicNodes.some(({ status }) => status !== "locked"),
      };
    });
    const evolutionNode = nodes.find((node) => node.kind === "evolution" && node.stageId === stage.id);
    const evolution = evolutionNode ? view(evolutionNode, null) : null;
    const all = [...topics.flatMap((topic) => topic.nodes), ...(evolution ? [evolution] : [])];
    return {
      stage,
      number,
      topics,
      evolution,
      passed: all.every(({ status }) => status === "done"),
      bestPass: state.progress.evolutionTests.filter((attempt) => attempt.stage === number && attempt.passed).at(-1),
    };
  });

  const next = nextNode(bundle, state);
  const holder = next
    ? stages.findIndex((stage) =>
        next.kind === "evolution" ? stage.stage.id === next.stageId : stage.topics.some(({ topic }) => topic.id === next.topicId),
      )
    : -1;
  return { stages, current: holder >= 0 ? holder : Math.max(0, stages.length - 1) };
}
