import { en } from "./en";
import type { Lang } from "./lang";
import { vi, type MessageKey } from "./vi";

export type MessageVars = Record<string, string | number>;

const catalogs: Record<Lang, Record<MessageKey, string>> = { vi, en };

export function translate(lang: Lang, key: MessageKey, vars: MessageVars = {}): string {
  return catalogs[lang][key].replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}
