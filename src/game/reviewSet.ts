import { allConcepts } from "../content/lookup";
import { isChoiceQuestion, type ChoiceQuestion, type ContentBundle, type Exercise } from "../content/types";
import { isDue } from "./leitner";
import { shuffled, type Rng } from "./random";
import type { ConceptMastery, GameState } from "./state";

/** Items in a review station (spec 5.10). */
export const REVIEW_SIZE = 5;
/** Items in a practice set after a misconception (spec 5.9 step 2). */
export const PRACTICE_SIZE = 2;

const LEVELS = ["level1", "level2", "level3"] as const;

/**
 * The items a child may meet in a review: exercises and questions of finished lessons, and the practice exercises
 * of topics with at least 1 finished lesson. Items of lessons not learned yet stay hidden.
 */
export function availableItems(bundle: ContentBundle, state: GameState): Map<string, Exercise> {
  const done = new Set(state.progress.completedLessons);
  const items = new Map<string, Exercise>();
  for (const topic of bundle.stages.flatMap((stage) => stage.topics)) {
    for (const lesson of topic.lessons) {
      if (done.has(lesson.id)) for (const exercise of lesson.exercises) items.set(exercise.id, exercise);
    }
    for (const question of topic.questions) {
      if (question.lessons.some((id) => done.has(id))) items.set(question.id, question);
    }
    if (topic.lessons.some((lesson) => done.has(lesson.id))) {
      for (const exercise of topic.practice) items.set(exercise.id, exercise);
    }
  }
  return items;
}

/** Items for a concept at the ladder level first, then at the nearest other levels, then its other questions. */
export function itemsForConcept(bundle: ContentBundle, available: Map<string, Exercise>, conceptId: string, level: number, rng: Rng): Exercise[] {
  const concept = allConcepts(bundle).find((c) => c.id === conceptId);
  if (!concept) return [];
  const order = [...LEVELS].sort((a, b) => Math.abs(LEVELS.indexOf(a) + 1 - level) - Math.abs(LEVELS.indexOf(b) + 1 - level));
  const items: Exercise[] = [];
  for (const key of order) {
    for (const id of shuffled(concept.practice[key], rng)) {
      const item = available.get(id);
      if (item && !items.includes(item)) items.push(item);
    }
  }
  const others = [...available.values()].filter(
    (item) => isChoiceQuestion(item) && item.concepts.includes(conceptId) && !items.includes(item),
  );
  return [...items, ...shuffled(others, rng)];
}

function weakestScore(question: ChoiceQuestion, state: GameState): number {
  return Math.min(100, ...question.concepts.map((id) => state.mastery[id]?.score ?? 100));
}

export interface ReviewSetInput {
  bundle: ContentBundle;
  state: GameState;
  today: string;
  rng: Rng;
  /** The lessons the station reviews: the ones since the previous station, or the latest ones. */
  recentLessons: string[];
}

/**
 * Up to 5 items (spec 5.10): 2 questions on the recent lessons; 2 due questions, weakest concepts first; 1 item for
 * help (an exercise whose solution was shown and is due again, else a "needs help" concept at its ladder level);
 * random older questions for the rest.
 */
export function buildReviewSet({ bundle, state, today, rng, recentLessons }: ReviewSetInput): Exercise[] {
  const available = availableItems(bundle, state);
  const questions = [...available.values()].filter(isChoiceQuestion);
  const chosen: Exercise[] = [];
  const take = (item: Exercise | undefined) => {
    if (item && chosen.length < REVIEW_SIZE && !chosen.includes(item)) chosen.push(item);
  };

  const recent = new Set(recentLessons);
  shuffled(questions.filter((q) => q.lessons.some((id) => recent.has(id))), rng)
    .slice(0, 2)
    .forEach(take);

  const due = questions
    .filter((q) => !chosen.includes(q) && state.reviews[q.id] !== undefined && isDue(state.reviews[q.id]!, today))
    .sort(
      (a, b) =>
        weakestScore(a, state) - weakestScore(b, state) ||
        state.reviews[a.id]!.due.localeCompare(state.reviews[b.id]!.due) ||
        a.id.localeCompare(b.id),
    );
  due.slice(0, 2).forEach(take);

  take(helpItem(bundle, state, today, available, chosen, rng));
  shuffled(questions, rng).forEach(take);
  return chosen;
}

function helpItem(
  bundle: ContentBundle,
  state: GameState,
  today: string,
  available: Map<string, Exercise>,
  chosen: Exercise[],
  rng: Rng,
): Exercise | undefined {
  const retry = Object.entries(state.retry)
    .filter(([, day]) => day <= today)
    .map(([id]) => available.get(id))
    .filter((item): item is Exercise => item !== undefined && !chosen.includes(item))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (retry[0]) return retry[0];
  const flagged = (Object.entries(state.mastery) as [string, ConceptMastery][])
    .filter(([, m]) => m.needsHelp)
    .sort((a, b) => a[1].score - b[1].score || a[0].localeCompare(b[0]));
  for (const [conceptId, m] of flagged) {
    const item = itemsForConcept(bundle, available, conceptId, m.level, rng).find((i) => !chosen.includes(i));
    if (item) return item;
  }
  return undefined;
}

/** 2 practice items for a concept at the child's ladder level (spec 5.9 step 2). */
export function buildPracticeSet(bundle: ContentBundle, state: GameState, conceptId: string, rng: Rng): Exercise[] {
  const level = state.mastery[conceptId]?.level ?? 1;
  return itemsForConcept(bundle, availableItems(bundle, state), conceptId, level, rng).slice(0, PRACTICE_SIZE);
}
