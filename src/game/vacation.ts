import { addDays, daysBetween } from "./dates";
import { KEEP_DAYS, type GameState } from "./state";

/** Spec 5.7: a day of the vacation switched on now (from `since`) or of a scheduled or past range. */
export function isVacationDay(state: GameState, day: string): boolean {
  const { since, ranges } = state.vacation;
  if (since !== null && day >= since) return true;
  return ranges.some((range) => range.start <= day && day <= range.end);
}

/** The days strictly between `from` and `to` that are not vacation days (spec 5.6-5.8: they do not count). */
export function workDaysBetween(state: GameState, from: string, to: string): number {
  const gap = daysBetween(from, to) - 1;
  if (gap <= 0) return 0;
  let count = 0;
  for (let i = 1; i <= gap; i += 1) if (!isVacationDay(state, addDays(from, i))) count += 1;
  return count;
}

/** The days of the week starting on `monday` that are not vacation days. */
export function workDaysOfWeek(state: GameState, monday: string): number {
  let count = 0;
  for (let i = 0; i < 7; i += 1) if (!isVacationDay(state, addDays(monday, i))) count += 1;
  return count;
}

/** The week plan without its vacation days (spec 5.7), rounded up. */
export function weekTarget(state: GameState, monday: string): number {
  return Math.ceil((state.settings.weeklyTarget * workDaysOfWeek(state, monday)) / 7);
}

/** Switches the vacation on from `today`, or off: the days already taken become a past range. */
export function toggleVacation(s: GameState, on: boolean, today: string): void {
  const { since } = s.vacation;
  if (on) {
    if (since === null) s.vacation.since = today;
    return;
  }
  if (since === null) return;
  const yesterday = addDays(today, -1);
  if (since <= yesterday) s.vacation.ranges.push({ start: since, end: yesterday });
  s.vacation.since = null;
}

/** Schedules a vacation from today or later. */
export function scheduleVacation(s: GameState, start: string, end: string, today: string): void {
  if (start > end || start < today) return;
  s.vacation.ranges.push({ start, end });
}

/** Cancels the scheduled vacation that starts on `start`: a future one is removed, a running one ends yesterday. */
export function cancelVacation(s: GameState, start: string, today: string): void {
  const yesterday = addDays(today, -1);
  s.vacation.ranges = s.vacation.ranges.flatMap((range) => {
    if (range.start !== start || range.end < today) return [range];
    return range.start <= yesterday ? [{ start: range.start, end: yesterday }] : [];
  });
}

/** Drops the ranges that ended more than KEEP_DAYS days ago. */
export function pruneVacations(s: GameState, today: string): void {
  const oldest = addDays(today, -KEEP_DAYS);
  s.vacation.ranges = s.vacation.ranges.filter((range) => range.end >= oldest);
}
