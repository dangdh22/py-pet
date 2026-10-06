import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ContentBundle, Lang } from "../content/types";
import { DictionaryProvider } from "../explain/providers";
import type { ExplainProvider } from "../explain/types";
import { LangProvider } from "../i18n/LangProvider";
import type { RunnerStatus } from "../runner/client";
import type { RunFn } from "../runner/types";
import type { ErrorLogEntry } from "../storage/types";

export interface RunnerApi {
  status: RunnerStatus;
  run: RunFn;
  retry(): void;
}

const ContentContext = createContext<ContentBundle | null>(null);
const RunnerContext = createContext<RunnerApi | null>(null);
const ExplainContext = createContext<ExplainProvider[] | null>(null);

export function AppProviders({
  bundle,
  runner,
  initialLang = "vi",
  children,
}: {
  bundle: ContentBundle;
  runner: RunnerApi;
  initialLang?: Lang;
  children: ReactNode;
}) {
  const providers = useMemo<ExplainProvider[]>(() => [new DictionaryProvider(bundle.errors)], [bundle]);
  return (
    <LangProvider initialLang={initialLang}>
      <ContentContext.Provider value={bundle}>
        <RunnerContext.Provider value={runner}>
          <ExplainContext.Provider value={providers}>{children}</ExplainContext.Provider>
        </RunnerContext.Provider>
      </ContentContext.Provider>
    </LangProvider>
  );
}

function required<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} must be used inside <AppProviders>`);
  return value;
}

export function useContent(): ContentBundle {
  return required(useContext(ContentContext), "useContent");
}

export function useRunner(): RunnerApi {
  return required(useContext(RunnerContext), "useRunner");
}

export function useExplainProviders(): ExplainProvider[] {
  return required(useContext(ExplainContext), "useExplainProviders");
}

export type LogError = (entry: Omit<ErrorLogEntry, "at">) => void;

/** Defaults to doing nothing outside a GameProvider. */
export const ErrorLogContext = createContext<LogError>(() => {});

export function useLogError(): LogError {
  return useContext(ErrorLogContext);
}
