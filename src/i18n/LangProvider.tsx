import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang, QuestionLang } from "./lang";
import { translate, type MessageVars } from "./translate";
import type { MessageKey } from "./vi";

export interface LangState {
  uiLang: Lang;
  setUiLang(lang: Lang): void;
  questionLang: QuestionLang;
  setQuestionLang(lang: QuestionLang): void;
  t(key: MessageKey, vars?: MessageVars): string;
}

const LangContext = createContext<LangState | null>(null);

export function LangProvider({ initialLang = "vi", children }: { initialLang?: Lang; children: ReactNode }) {
  const [uiLang, setUiLang] = useState<Lang>(initialLang);
  const [questionLang, setQuestionLang] = useState<QuestionLang>("vi");
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = uiLang;
  }, [uiLang]);
  const value = useMemo<LangState>(
    () => ({
      uiLang,
      setUiLang,
      questionLang,
      setQuestionLang,
      t: (key, vars) => translate(uiLang, key, vars),
    }),
    [uiLang, questionLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}
