import { useCallback } from "react";
import { explainWithChain } from "../explain/providers";
import { useLang } from "../i18n/LangProvider";
import type { PyErrorInfo } from "../runner/types";
import { useExplainProviders, useLogError } from "./contexts";
import type { Explain } from "./feedback";

export function useExplain(): Explain {
  const providers = useExplainProviders();
  const { uiLang } = useLang();
  const logError = useLogError();
  return useCallback(
    async (error: PyErrorInfo, code: string) => {
      const explanation = await explainWithChain(providers, { error, code, lang: uiLang });
      if (!explanation) logError({ kind: "unknown-python-error", detail: `${error.type}: ${error.message}` });
      return explanation;
    },
    [providers, uiLang, logError],
  );
}
