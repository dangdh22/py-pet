import { MASTERY } from "./mastery";
import type { GameState } from "./state";

/** Spec 8.2.7: the badges of the achievement book, in the order it shows them. */
export const BADGES = [
  "first-lesson",
  "lessons-10",
  "lessons-25",
  "lessons-50",
  "streak-3",
  "streak-7",
  "streak-14",
  "streak-30",
  "perfect-review",
  "topic-test",
  "week-plan",
  "concepts-5",
  "concepts-10",
  "evolution-2",
  "evolution-3",
  "evolution-4",
] as const;

export type BadgeId = (typeof BADGES)[number];

/** Spec 8.2.7: concepts the child knows well (above the score that clears "needs help") and is practising. */
export const PRACTISING_FROM = 40;

export function masteredConcepts(state: GameState): number {
  return Object.values(state.mastery).filter((m) => m.score > MASTERY.clearHelpAbove).length;
}

export function practisingConcepts(state: GameState): number {
  return Object.values(state.mastery).filter((m) => m.score >= PRACTISING_FROM && m.score <= MASTERY.clearHelpAbove)
    .length;
}

/** The badges whose condition can be read from the state; "perfect-review" and "week-plan" are given by their events. */
function earned(state: GameState): BadgeId[] {
  const lessons = state.progress.completedLessons.length;
  const best = state.streak.best;
  const mastered = masteredConcepts(state);
  const rules: [BadgeId, boolean][] = [
    ["first-lesson", lessons >= 1],
    ["lessons-10", lessons >= 10],
    ["lessons-25", lessons >= 25],
    ["lessons-50", lessons >= 50],
    ["streak-3", best >= 3],
    ["streak-7", best >= 7],
    ["streak-14", best >= 14],
    ["streak-30", best >= 30],
    ["topic-test", Object.values(state.progress.topicTests).some((record) => record.passed)],
    ["concepts-5", mastered >= 5],
    ["concepts-10", mastered >= 10],
    ["evolution-2", state.pet.stage >= 2],
    ["evolution-3", state.pet.stage >= 3],
    ["evolution-4", state.pet.stage >= 4],
  ];
  return rules.filter(([, ok]) => ok).map(([id]) => id);
}

export function giveBadge(s: GameState, id: BadgeId, today: string): void {
  if (!(id in s.badges)) s.badges[id] = today;
}

/** Gives every badge the state now earns; a badge, once given, stays. */
export function awardBadges(s: GameState, today: string): void {
  for (const id of earned(s)) giveBadge(s, id, today);
}
