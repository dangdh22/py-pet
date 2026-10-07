import { useEffect, useState } from "react";
import { localDay } from "../game/dates";
import { StateFormatError, upgradeGameState, type StateProblem } from "../game/migrate";
import { useLang } from "../i18n/LangProvider";
import type { GameStore, LoadedGame } from "../storage/types";
import { AppRoutes } from "./AppRoutes";
import { GameProvider } from "./GameProvider";
import { Header } from "./Header";
import { downloadText } from "./download";
import { OnboardingScreen } from "./OnboardingScreen";
import { Robot } from "./Robot";

export function GameRoot({ store, clock, onReplaced }: { store: GameStore; clock: () => Date; onReplaced(): void }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState<LoadedGame | null | undefined>(undefined);
  const [loadProblem, setLoadProblem] = useState<StateProblem | "unreadable" | null>(null);

  useEffect(() => {
    let alive = true;
    store.loadActive().then(
      (result) => {
        if (!alive) return;
        if (result === null) {
          setLoaded(null);
          return;
        }
        try {
          // Data saved by an older app is upgraded here; the first event writes it back.
          setLoaded({ ...result, state: upgradeGameState(result.state) });
        } catch (error) {
          const problem = error instanceof StateFormatError ? error.problem : "damaged";
          setLoadProblem(problem);
          logLoadFailure(store, clock, `${problem}: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
      (error: unknown) => {
        if (!alive) return;
        setLoadProblem("unreadable");
        logLoadFailure(store, clock, `unreadable: ${error instanceof Error ? error.message : String(error)}`);
      },
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per store; a new clock identity must not reload the game
  }, [store]);

  if (loadProblem !== null) {
    return (
      <>
        <Header />
        <main className="crash" role="alert">
          <Robot mood="sad" size={80} />
          <p>{t(loadProblem === "newer-version" ? "app.newerData" : "app.crash")}</p>
          <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
          {loadProblem !== "newer-version" && <RawExport store={store} clock={clock} />}
        </main>
      </>
    );
  }
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

/** Spec 10: a load failure goes to the error log, which the parent area shows. A failed write is ignored. */
function logLoadFailure(store: GameStore, clock: () => Date, detail: string): void {
  store.appendErrorLog({ at: clock().toISOString(), kind: "load-failed", detail }).catch(() => {});
}

/**
 * The saved data as it is, damaged state included, so a parent can keep it or send it for support before
 * anything is lost. It is plain JSON, not a .pypet file: a damaged state cannot be imported.
 */
function RawExport({ store, clock }: { store: GameStore; clock: () => Date }) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  async function exportRaw() {
    setFailed(false);
    try {
      // No PIN hash (brute-forceable) and no automatic backups: the file is meant for support.
      const meta = { ...(await store.readMeta()), pin: null, autoBackups: [] };
      const data = { exportedAt: clock().toISOString(), meta, profiles: await store.exportProfiles() };
      downloadText(`py-pet-data-${localDay(clock())}.json`, JSON.stringify(data, null, 2));
    } catch {
      setFailed(true);
    }
  }
  return (
    <>
      <button onClick={() => void exportRaw()}>{t("app.exportRaw")}</button>
      {failed && <p>{t("app.exportRawFailed")}</p>}
    </>
  );
}
