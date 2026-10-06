import { localDay } from "../game/dates";

/** A moment as "YYYY-MM-DD HH:MM" in local time, the same in every language. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${localDay(date)} ${hours}:${minutes}`;
}
