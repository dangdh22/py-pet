import type { GameSettings } from "./state";

/** Spec 5 (*) and 9.5: the range a parent can set for each number. */
export const SETTING_LIMITS = {
  dailyGoal: { min: 1, max: 10 },
  weeklyTarget: { min: 0, max: 50 },
  graceDays: { min: 0, max: 7 },
  passPercent: { min: 50, max: 100 },
  helpPercent: { min: 30, max: 90 },
  runSeconds: { min: 1, max: 10 },
} as const satisfies Partial<Record<keyof GameSettings, { min: number; max: number }>>;

export type NumberSetting = keyof typeof SETTING_LIMITS;

/** Whole numbers inside their limits; a value that is not a number keeps the old one. */
export function cleanSettings(current: GameSettings, patch: Partial<GameSettings>): GameSettings {
  const next = { ...current, ...patch };
  for (const key of Object.keys(SETTING_LIMITS) as NumberSetting[]) {
    const { min, max } = SETTING_LIMITS[key];
    const value = next[key] as unknown;
    next[key] =
      typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : current[key];
  }
  if (next.uiLang !== "vi" && next.uiLang !== "en") next.uiLang = current.uiLang;
  if (!["vi", "en", "both"].includes(next.questionLang)) next.questionLang = current.questionLang;
  return next;
}
