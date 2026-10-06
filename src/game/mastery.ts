import type { ConceptMastery } from "./state";

/** Learning constants of spec 5.9. The values marked (*) in the spec become parent settings in M4. */
export const MASTERY = {
  rate: 0.3,
  /** s: right at the first try, right after some tries, right with a hint or the solution, wrong. */
  score: { firstTry: 1, retried: 0.6, helped: 0.3, wrong: 0 },
  /** A result counts as right from this s. */
  rightFrom: 0.6,
  recent: 5,
  helpAccuracy: 0.6,
  helpMinResults: 5,
  helpMisconceptions: 3,
  helpReviewMisses: 2,
  clearHelpAbove: 70,
  ladderStep: 2,
} as const;

/** Where an answer was given. "test" is a topic or evolution test: it pays per test, not per answer. */
export type ResultSource = "lesson" | "review" | "practice" | "test";

export function emptyMastery(): ConceptMastery {
  return { score: 0, level: 1, run: 0, needsHelp: false, misconceptions: 0, recent: [], reviewMisses: 0, coachedAt: null };
}

/** The s of a solved exercise (spec 5.9). */
export function solvedScore(failedSubmitsBefore: number, hintsUsed: number, viewedSolution: boolean): number {
  if (viewedSolution || hintsUsed > 0) return MASTERY.score.helped;
  return failedSubmitsBefore === 0 ? MASTERY.score.firstTry : MASTERY.score.retried;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function shouldFlag(m: ConceptMastery): boolean {
  const right = m.recent.filter((s) => s >= MASTERY.rightFrom).length;
  const lowAccuracy = m.recent.length >= MASTERY.helpMinResults && right / m.recent.length < MASTERY.helpAccuracy;
  return lowAccuracy || m.misconceptions >= MASTERY.helpMisconceptions || m.reviewMisses >= MASTERY.helpReviewMisses;
}

/** Adds 1 result s (0 to 1) to a concept: score, ladder, recent results and the help flag. */
export function recordResult(current: ConceptMastery, s: number, source: ResultSource): ConceptMastery {
  const m: ConceptMastery = { ...current, recent: [...current.recent, s].slice(-MASTERY.recent) };
  m.score = round2(Math.min(100, Math.max(0, m.score + MASTERY.rate * (s * 100 - m.score))));
  const right = s >= MASTERY.rightFrom;
  m.run = right ? Math.max(0, m.run) + 1 : Math.min(0, m.run) - 1;
  if (m.run >= MASTERY.ladderStep) {
    m.level = Math.min(3, m.level + 1) as ConceptMastery["level"];
    m.run = 0;
  } else if (m.run <= -MASTERY.ladderStep) {
    m.level = Math.max(1, m.level - 1) as ConceptMastery["level"];
    m.run = 0;
  }
  if (source === "review") m.reviewMisses = right ? 0 : m.reviewMisses + 1;
  if (m.score > MASTERY.clearHelpAbove) {
    // Clearing the flag also clears what raised it, so it does not come back at once.
    m.needsHelp = false;
    m.misconceptions = 0;
    m.reviewMisses = 0;
  } else if (shouldFlag(m)) {
    m.needsHelp = true;
  }
  return m;
}

/** Counts 1 sighting of the misconception that belongs to this concept. */
export function recordMisconception(current: ConceptMastery): ConceptMastery {
  const m = { ...current, misconceptions: current.misconceptions + 1 };
  if (shouldFlag(m)) m.needsHelp = true;
  return m;
}
