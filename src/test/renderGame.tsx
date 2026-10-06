import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import type { ContentBundle } from "../content/types";
import { initialGameState, type GameState } from "../game/state";
import type { Lang } from "../i18n/lang";
import { MemoryStore } from "../storage/memoryStore";
import type { AppMeta, GameStore, LoadedGame, StoredProfile } from "../storage/types";
import { AppProviders, type RunnerApi } from "../ui/contexts";
import { GameProvider } from "../ui/GameProvider";
import { testBundle } from "./fixtures";
import { fakeRunner, okResult } from "./render";

/** Tuesday 2026-10-06 09:00 local time. */
export const FIXED_NOW = new Date(2026, 9, 6, 9, 0, 0);
export const TODAY = "2026-10-06";

export function testProfile(): StoredProfile {
  return { id: "p1", childName: "An", robotName: "Robo", createdAt: FIXED_NOW.toISOString() };
}

export interface GameRenderOptions {
  bundle?: ContentBundle;
  runner?: RunnerApi;
  lang?: Lang;
  state?: GameState;
  meta?: Partial<AppMeta>;
  drafts?: Record<string, string>;
  store?: GameStore;
  clock?: () => Date;
  onReplaced?: () => void;
}

export async function renderWithGame(
  ui: ReactElement,
  options: GameRenderOptions = {},
): Promise<RenderResult & { store: GameStore }> {
  const store = options.store ?? new MemoryStore({ persistent: true });
  const state: GameState = JSON.parse(JSON.stringify(options.state ?? initialGameState(TODAY)));
  if (options.lang) state.settings.uiLang = options.lang;
  const profile = testProfile();
  await store.createProfile(profile, state);
  if (options.meta) await store.writeMeta(options.meta);
  const loaded: LoadedGame = {
    profile,
    state,
    drafts: new Map(Object.entries(options.drafts ?? {})),
    meta: await store.readMeta(),
  };
  const result = render(
    <AppProviders
      bundle={options.bundle ?? testBundle()}
      runner={options.runner ?? fakeRunner(() => okResult(""))}
      initialLang={options.lang ?? "vi"}
    >
      <GameProvider
        store={store}
        loaded={loaded}
        clock={options.clock ?? (() => FIXED_NOW)}
        onReplaced={options.onReplaced ?? (() => {})}
      >
        {ui}
      </GameProvider>
    </AppProviders>,
  );
  return { ...result, store };
}
