import { useEffect, useState } from "react";
import { useLang } from "../i18n/LangProvider";
import type { GameStore, LoadedGame } from "../storage/types";
import { AppRoutes } from "./AppRoutes";
import { GameProvider } from "./GameProvider";
import { Header } from "./Header";
import { OnboardingScreen } from "./OnboardingScreen";

export function GameRoot({ store, clock, onReplaced }: { store: GameStore; clock: () => Date; onReplaced(): void }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState<LoadedGame | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    store.loadActive().then(
      (result) => {
        if (alive) setLoaded(result);
      },
      () => {
        if (alive) setLoaded(null);
      },
    );
    return () => {
      alive = false;
    };
  }, [store]);

  if (loaded === undefined) {
    return (
      <>
        <Header />
        <main className="room">
          <p>{t("app.loading")}</p>
        </main>
      </>
    );
  }
  if (loaded === null) {
    return (
      <>
        <Header />
        <OnboardingScreen store={store} clock={clock} onCreated={setLoaded} />
      </>
    );
  }
  return (
    <GameProvider store={store} loaded={loaded} clock={clock} onReplaced={onReplaced}>
      <AppRoutes />
    </GameProvider>
  );
}
