const DAY_MS = 86_400_000;

/** The local calendar day of a moment, as YYYY-MM-DD. */
export function localDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcMs(day: string): number {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year as number, (month as number) - 1, date as number);
}

export function addDays(day: string, n: number): string {
  return new Date(toUtcMs(day) + n * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

/** The Monday of the week that contains `day`. */
export function weekStart(day: string): string {
  const weekday = new Date(toUtcMs(day)).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}

/** Milliseconds from `now` to 1 second after the next local midnight. */
export function msUntilNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}
