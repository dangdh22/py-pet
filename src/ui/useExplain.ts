import { useCallback } from "react";
import { explainWithChain } from "../explain/providers";
import { useLang } from "../i18n/LangProvider";
import type { PyErrorInfo } from "../runner/types";
import { useExplainProviders } from "./contexts";
import type { Explain } from "./feedback";

export function useExplain(): Explain {
  const providers = useExplainProviders();
  const { uiLang } = useLang();
  return useCallback(
    (error: PyErrorInfo, code: string) => explainWithChain(providers, { error, code, lang: uiLang }),
    [providers, uiLang],
  );
}
