export type Lang = "vi" | "en";
export type QuestionLang = Lang | "both";

/** Text with a required Vietnamese version and an optional English version. */
export interface LocalizedText {
  vi: string;
  en?: string;
}

export function pick(text: LocalizedText, lang: Lang): string {
  if (lang === "en" && text.en) return text.en;
  return text.vi;
}

/** Vietnamese, then English when the English text exists and differs. */
export function pickBoth(text: LocalizedText): string {
  return text.en && text.en !== text.vi ? `${text.vi} / ${text.en}` : text.vi;
}
