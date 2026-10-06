import { addDays } from "./dates";
import { MASTERY } from "./mastery";
import { PRACTISING_FROM } from "./badges";
import type { ConceptMastery, GameState } from "./state";
import { isVacationDay } from "./vacation";

export interface DayMinutes {
  day: string;
  minutes: number;
  vacation: boolean;
}

/** Spec 9.1: minutes of study for the last `days` days, oldest first, with the vacation days marked. */
export function minutesByDay(state: GameState, today: string, days = 7): DayMinutes[] {
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return {
      day,
      minutes: Math.round((state.activity.seconds[day] ?? 0) / 60),
      vacation: isVacationDay(state, day),
    };
  });
}

/** Spec 5.5: xu earned per day over the last `days` days, for the parent to price rewards. Spending is left out. */
export function averageXuPerDay(state: GameState, today: string, days = 14): number {
  const from = addDays(today, -days + 1);
  const earned = state.wallet.history
    .filter((entry) => entry.delta > 0 && entry.day >= from && entry.day <= today)
    .reduce((sum, entry) => sum + entry.delta, 0);
  return Math.round(earned / days);
}

/** The share of right results among the latest ones, in percent, or null without results. */
export function accuracyPercent(m: ConceptMastery): number | null {
  if (m.recent.length === 0) return null;
  const right = m.recent.filter((s) => s >= MASTERY.rightFrom).length;
  return Math.round((right / m.recent.length) * 100);
}

/** Spec 9.2: concepts flagged "needs help", weakest first. */
export function conceptsNeedingHelp(state: GameState): [string, ConceptMastery][] {
  return Object.entries(state.mastery)
    .filter(([, m]) => m.needsHelp)
    .sort((a, b) => a[1].score - b[1].score || a[0].localeCompare(b[0]));
}

/** Spec 9.2: concepts being practised (score 40 to 70) and not flagged, weakest first. */
export function conceptsPractising(state: GameState): [string, ConceptMastery][] {
  return Object.entries(state.mastery)
    .filter(([, m]) => !m.needsHelp && m.score >= PRACTISING_FROM && m.score <= MASTERY.clearHelpAbove)
    .sort((a, b) => a[1].score - b[1].score || a[0].localeCompare(b[0]));
}
