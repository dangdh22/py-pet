import type { ContentBundle } from "../content/types";
import type { RunnerClient } from "../runner/client";
import type { GameStore } from "../storage/types";
import { AppProviders } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { DevGalleryGate } from "./GalleryScreen";
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
/** After an import, open the room: the page would otherwise reload on the backup screen. */
const reloadPage = () => {
  window.location.hash = "#/";
  window.location.reload();
};

export function App({ bundle, runnerClient, store, ownsTab = true, clock = systemClock, onReplaced = reloadPage }: AppProps) {
  const runner = useRunnerClient(runnerClient);
  const app = ownsTab ? <GameRoot store={store} clock={clock} onReplaced={onReplaced} /> : <SecondTabScreen />;
  return (
    <AppProviders bundle={bundle} runner={runner}>
      {/* Design decision 8: the robot gallery is in dev builds only; this branch is dropped from `npm run build`. */}
      <ErrorBoundary>{import.meta.env.DEV ? <DevGalleryGate>{app}</DevGalleryGate> : app}</ErrorBoundary>
    </AppProviders>
  );
}
