import { allConcepts, topicQuestions, topicTestCode } from "../content/lookup";
import {
  isChoiceQuestion,
  type ChoiceQuestion,
  type CodeExercise,
  type ContentBundle,
  type Exercise,
  type Stage,
  type Topic,
} from "../content/types";
import { shuffled, type Rng } from "./random";
import { availableItems, itemsForConcept } from "./reviewSet";
import type { GameState } from "./state";

/** Spec 5.11: a code exercise in a test is worth 3 points, a question 1 point. */
export const CODE_POINTS = 3;
/** Wrong-concept items in a focused review set (spec 5.11: 2 to 3 per concept). */
export const REMEDIAL_PER_CONCEPT = 2;

/** An item of a test paper (spec 5.11): a predict/mcq question or a test-eligible code exercise. */
export type ExamItem = ChoiceQuestion | CodeExercise;

/** The answer to 1 item of a paper; undefined while it is not answered. */
export type ExamAnswer = { kind: "choice"; correct: boolean } | { kind: "code"; passed: number; total: number };

export interface ExamGrade {
  score: number;
  max: number;
  /** Concepts of the items that did not get full points, in paper order. */
  wrongConcepts: string[];
}

/** Picks `count` items, the ones not in `avoid` first (spec 5.11: avoid the questions of the previous attempt). */
function pick<T extends { id: string }>(pool: readonly T[], count: number, avoid: ReadonlySet<string>, rng: Rng): T[] {
  const fresh = shuffled(
    pool.filter((item) => !avoid.has(item.id)),
    rng,
  );
  const seen = shuffled(
    pool.filter((item) => avoid.has(item.id)),
    rng,
  );
  return [...fresh, ...seen].slice(0, Math.max(0, count));
}

/** A topic test: its questions, then its code exercises. A short bank gives a shorter paper. */
export function drawTopicTest(topic: Topic, previous: readonly string[], rng: Rng): ExamItem[] {
  const avoid = new Set(previous);
  return [
    ...pick(topicQuestions(topic), topic.test.questions, avoid, rng),
    ...pick(topicTestCode(topic), topic.test.code, avoid, rng),
  ];
}

/** An evolution test (spec 5.11): AI and other questions mixed, then the code exercises. */
export function drawEvolutionTest(
  bundle: ContentBundle,
  stage: Stage,
  previous: readonly string[],
  rng: Rng,
): ExamItem[] {
  const avoid = new Set(previous);
  const aiConcepts = new Set(
    allConcepts(bundle)
      .filter((concept) => concept.ai)
      .map((concept) => concept.id),
  );
  const questions = stage.topics.flatMap(topicQuestions);
  const isAi = (q: (typeof questions)[number]) => q.concepts.some((id) => aiConcepts.has(id));
  const { evolution } = stage;
  const ai = pick(questions.filter(isAi), evolution.ai, avoid, rng);
  const other = pick(
    questions.filter((q) => !isAi(q)),
    evolution.questions - ai.length,
    avoid,
    rng,
  );
  // Too few other questions: more AI questions fill the paper.
  const extra = pick(
    questions.filter((q) => isAi(q) && !ai.includes(q)),
    evolution.questions - ai.length - other.length,
    avoid,
    rng,
  );
  return [
    ...shuffled([...ai, ...other, ...extra], rng),
    ...pick(stage.topics.flatMap(topicTestCode), evolution.code, avoid, rng),
  ];
}

export function itemMax(item: Exercise): number {
  return isChoiceQuestion(item) ? 1 : CODE_POINTS;
}

function points(item: Exercise, answer: ExamAnswer): number {
  if (answer.kind === "choice") return answer.correct ? 1 : 0;
  return answer.total > 0 ? (itemMax(item) * answer.passed) / answer.total : 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Grades a paper. An item without an answer was skipped (ExamRunner requires an answer before Next, so the only way
 * is the Bỏ qua of a broken item): it is left out of the score, the max and the wrong concepts, so broken content does
 * not cost the child. A paper with every item skipped has max 0, like an empty paper, and never counts as passed.
 */
export function gradePaper(items: readonly Exercise[], answers: readonly (ExamAnswer | undefined)[]): ExamGrade {
  let score = 0;
  let max = 0;
  const wrongConcepts: string[] = [];
  items.forEach((item, i) => {
    const answer = answers[i];
    if (answer === undefined) return;
    const got = points(item, answer);
    score += got;
    max += itemMax(item);
    if (got < itemMax(item)) {
      for (const id of item.concepts) if (!wrongConcepts.includes(id)) wrongConcepts.push(id);
    }
  });
  return { score: round2(score), max, wrongConcepts };
}

/** A focused review set (spec 5.11): items for each wrong concept at the child's ladder level. */
export function buildRemedialSet(
  bundle: ContentBundle,
  state: GameState,
  wrongConcepts: readonly string[],
  rng: Rng,
): Exercise[] {
  const available = availableItems(bundle, state);
  const chosen: Exercise[] = [];
  for (const conceptId of wrongConcepts) {
    const level = state.mastery[conceptId]?.level ?? 1;
    const items = itemsForConcept(bundle, available, conceptId, level, rng).filter((item) => !chosen.includes(item));
    chosen.push(...items.slice(0, REMEDIAL_PER_CONCEPT));
  }
  return chosen;
}
