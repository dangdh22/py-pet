import type { ContentBundle } from "../content/types";
import type { RunnerClient } from "../runner/client";
import type { GameStore } from "../storage/types";
import { AppProviders } from "./contexts";
import { GameRoot } from "./GameRoot";
import { SecondTabScreen } from "./SecondTabScreen";
import { useRunnerClient } from "./useRunnerClient";

export interface AppProps {
  bundle: ContentBundle;
  runnerClient: RunnerClient;
  store: GameStore;
  ownsTab?: boolean;
  clock?: () => Date;
  onReplaced?: () => void;
}

const systemClock = () => new Date();
const reloadPage = () => window.location.reload();

export function App({ bundle, runnerClient, store, ownsTab = true, clock = systemClock, onReplaced = reloadPage }: AppProps) {
  const runner = useRunnerClient(runnerClient);
  return (
    <AppProviders bundle={bundle} runner={runner}>
      {ownsTab ? <GameRoot store={store} clock={clock} onReplaced={onReplaced} /> : <SecondTabScreen />}
    </AppProviders>
  );
}
