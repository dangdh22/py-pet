import { localDay } from "../game/dates";
import type { Lang } from "../i18n/lang";

/** A score with at most 1 decimal, written the way the language writes decimals (19,2 in Vietnamese). */
export function formatScore(score: number, lang: Lang): string {
  const text = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return lang === "vi" ? text.replace(".", ",") : text;
}

/** A moment as "YYYY-MM-DD HH:MM" in local time, the same in every language. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${localDay(date)} ${hours}:${minutes}`;
}
