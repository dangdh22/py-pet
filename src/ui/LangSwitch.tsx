import type { LocalizedText } from "../content/types";
import { pick, pickBoth, type QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";

const LANG_BUTTONS = [
  { lang: "vi", label: "question.langVi" },
  { lang: "en", label: "question.langEn" },
  { lang: "both", label: "question.langBoth" },
] as const;

/** A question text in the chosen language, or both languages side by side. */
export function showText(text: LocalizedText, lang: QuestionLang): string {
  return lang === "both" ? pickBoth(text) : pick(text, lang);
}

/** The VI / EN / VI + EN buttons of 1 question (spec 7.2). */
export function LangSwitch({ lang, onChange }: { lang: QuestionLang; onChange(lang: QuestionLang): void }) {
  const { t } = useLang();
  return (
    <div role="group" aria-label={t("question.lang")} className="lang-switch">
      {LANG_BUTTONS.map((button) => (
        <button key={button.lang} aria-pressed={lang === button.lang} onClick={() => onChange(button.lang)}>
          {t(button.label)}
        </button>
      ))}
    </div>
  );
}

/** A prompt in the chosen language; "both" shows the 2 versions as 2 paragraphs. */
export function Prompt({ text, lang }: { text: LocalizedText; lang: QuestionLang }) {
  if (lang !== "both") return <p className="question-prompt">{pick(text, lang)}</p>;
  return (
    <>
      <p className="question-prompt">{text.vi}</p>
      {text.en && (
        <p className="question-prompt" lang="en">
          {text.en}
        </p>
      )}
    </>
  );
}
