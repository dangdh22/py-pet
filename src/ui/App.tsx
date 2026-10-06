import type { ContentBundle } from "../content/types";
import type { RunnerClient } from "../runner/client";
import { AppRoutes } from "./AppRoutes";
import { AppProviders } from "./contexts";
import { useRunnerClient } from "./useRunnerClient";

export function App({ bundle, runnerClient }: { bundle: ContentBundle; runnerClient: RunnerClient }) {
  const runner = useRunnerClient(runnerClient);
  return (
    <AppProviders bundle={bundle} runner={runner}>
      <AppRoutes />
    </AppProviders>
  );
}
