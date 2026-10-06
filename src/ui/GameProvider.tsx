import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apply, type GameEvent } from "../game/apply";
import { daysBetween, localDay, msUntilNextDay } from "../game/dates";
import type { GameState } from "../game/state";
import type { Lang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import {
  backupFileName,
  buildBackupPayload,
  encodeBackup,
  type ActiveSnapshot,
  type BackupPayload,
} from "../storage/backup";
import { verifyPin } from "../storage/pin";
import {
  appendErrorLog,
  AUTO_BACKUPS,
  emptyMeta,
  type AppMeta,
  type AttemptInput,
  type AttemptRecord,
  type ErrorLogEntry,
  type GameStore,
  type LoadedGame,
  type StoredProfile,
} from "../storage/types";
import { ErrorLogContext, RunnerTimeout, type LogError } from "./contexts";

export const BACKUP_REMINDER_DAYS = 7;
export const DRAFT_SAVE_DELAY_MS = 400;

export interface GameApi {
  profile: StoredProfile;
  state: GameState;
  today: string;
  persistent: boolean;
  writeFailed: boolean;
  lastBackupAt: string | null;
  needsBackupReminder: boolean;
  dispatch(event: GameEvent, attempt?: AttemptInput): void;
  draftFor(itemId: string): string | undefined;
  saveDraft(itemId: string, code: string): void;
  exportBackup(): Promise<{ fileName: string; text: string }>;
  checkPin(pin: string): Promise<boolean>;
  importBackup(payload: BackupPayload): Promise<void>;
  /** The encoded automatic backups, newest first. */
  autoBackups(): Promise<string[]>;
}

const GameContext = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside <GameProvider>");
  return value;
}

export function useOptionalGame(): GameApi | null {
  return useContext(GameContext);
}

export interface GameProviderProps {
  store: GameStore;
  loaded: LoadedGame;
  clock: () => Date;
  onReplaced(): void;
  children: ReactNode;
}

export function GameProvider({ store, loaded, clock, onReplaced, children }: GameProviderProps) {
  const { uiLang, setUiLang, setQuestionLang } = useLang();
  const profile = loaded.profile;
  const [state, setState] = useState<GameState>(loaded.state);
  const stateRef = useRef<GameState>(loaded.state);
  const [meta, setMeta] = useState<AppMeta>(loaded.meta);
  const [writeFailed, setWriteFailed] = useState(false);
  const drafts = useRef(new Map(loaded.drafts));
  const draftTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const queue = useRef<Promise<void>>(Promise.resolve());
  /** Set while an import replaces the store: later writes are dropped because the page reloads. */
  const replacing = useRef(false);

  /** Writes run one after another; a failed write is retried once, then flagged. */
  const enqueue = useCallback((work: () => Promise<void>) => {
    if (replacing.current) return;
    queue.current = queue.current.then(async () => {
      try {
        await work();
      } catch {
        try {
          await work();
        } catch {
          setWriteFailed(true);
        }
      }
    });
  }, []);

  const dispatch = useCallback(
    (event: GameEvent, attempt?: AttemptInput) => {
      const now = clock();
      const next = apply(stateRef.current, event, now);
      stateRef.current = next;
      setState(next);
      const record = attempt ? ({ ...attempt, profileId: profile.id, at: now.toISOString() } as AttemptRecord) : undefined;
      enqueue(() => store.saveState(profile.id, next, record));
    },
    [clock, enqueue, store, profile.id],
  );

  useEffect(() => {
    dispatch({ type: "DayRollover" });
    const onVisibility = () => {
      if (document.visibilityState === "visible") dispatch({ type: "DayRollover" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [dispatch]);

  // An app left open past midnight starts the new day on time: rewards, decay and the room's goals.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        dispatch({ type: "DayRollover" });
        schedule();
      }, msUntilNextDay(clock()));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [clock, dispatch]);

  // First run: show the saved language. Later runs: save the language the child picks.
  const langInitialised = useRef(false);
  const waitingForLang = useRef<Lang | null>(null);
  useEffect(() => {
    const saved = stateRef.current.settings.uiLang;
    if (!langInitialised.current) {
      langInitialised.current = true;
      if (uiLang !== saved) {
        waitingForLang.current = saved;
        setUiLang(saved);
      }
      return;
    }
    if (waitingForLang.current !== null) {
      if (uiLang === waitingForLang.current) waitingForLang.current = null;
      return;
    }
    if (uiLang !== saved) dispatch({ type: "SettingsChanged", patch: { uiLang } });
  }, [uiLang, setUiLang, dispatch]);

  // The parent's default question language (spec 7.2); each question can still switch with VI/EN.
  const questionLang = state.settings.questionLang;
  useEffect(() => setQuestionLang(questionLang), [questionLang, setQuestionLang]);

  const draftFor = useCallback((itemId: string) => drafts.current.get(itemId), []);

  const saveDraft = useCallback(
    (itemId: string, code: string) => {
      drafts.current.set(itemId, code);
      const timers = draftTimers.current;
      const pending = timers.get(itemId);
      if (pending) clearTimeout(pending);
      timers.set(
        itemId,
        setTimeout(() => {
          timers.delete(itemId);
          enqueue(() => store.saveDraft(profile.id, itemId, code));
        }, DRAFT_SAVE_DELAY_MS),
      );
    },
    [enqueue, store, profile.id],
  );

  // Save the drafts still waiting for their delay when the page goes away or the provider unmounts.
  useEffect(() => {
    const timers = draftTimers.current;
    const flush = () => {
      for (const [itemId, timer] of timers) {
        clearTimeout(timer);
        const code = drafts.current.get(itemId);
        if (code !== undefined) enqueue(() => store.saveDraft(profile.id, itemId, code));
      }
      timers.clear();
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [enqueue, store, profile.id]);

  const logError = useCallback<LogError>(
    (entry) => {
      const full: ErrorLogEntry = { ...entry, at: clock().toISOString() };
      setMeta((current) => ({ ...current, errorLog: appendErrorLog(current.errorLog, full) }));
      enqueue(() => store.appendErrorLog(full));
    },
    [clock, enqueue, store],
  );

  /** The active profile as held in memory: it stays correct when the store cannot save. */
  const activeSnapshot = useCallback(
    (): ActiveSnapshot => ({
      profile,
      state: stateRef.current,
      drafts: [...drafts.current].map(([itemId, code]) => ({ profileId: profile.id, itemId, code })),
    }),
    [profile],
  );

  const exportBackup = useCallback(async () => {
    await queue.current;
    const now = clock();
    const text = await encodeBackup(await buildBackupPayload(store, now, activeSnapshot()));
    const lastBackupAt = now.toISOString();
    try {
      await store.writeMeta({ lastBackupAt });
    } catch {
      // The file is ready; a failed write only loses the reminder date after a reload.
    }
    setMeta((current) => ({ ...current, lastBackupAt }));
    return { fileName: backupFileName(profile.childName, localDay(now)), text };
  }, [clock, store, activeSnapshot, profile.childName]);

  const checkPin = useCallback(
    async (pin: string) => (meta.pin ? verifyPin(pin, meta.pin) : false),
    [meta.pin],
  );

  const importBackup = useCallback(
    async (payload: BackupPayload) => {
      replacing.current = true;
      for (const timer of draftTimers.current.values()) clearTimeout(timer);
      draftTimers.current.clear();
      const run = queue.current.then(async () => {
        const current = await encodeBackup(await buildBackupPayload(store, clock(), activeSnapshot()));
        const existing = await store.readMeta();
        const autoBackups = [current, ...existing.autoBackups].slice(0, AUTO_BACKUPS);
        const activeProfileId = payload.meta.activeProfileId ?? payload.profiles[0]?.profile.id ?? null;
        await store.replaceAll({ ...emptyMeta(), ...payload.meta, activeProfileId, autoBackups }, payload.profiles);
      });
      queue.current = run.catch(() => {});
      try {
        await run;
      } catch (error) {
        replacing.current = false;
        throw error;
      }
      onReplaced();
    },
    [clock, store, activeSnapshot, onReplaced],
  );

  const autoBackups = useCallback(async () => (await store.readMeta()).autoBackups, [store]);

  const today = localDay(clock());
  const reference = meta.lastBackupAt ?? profile.createdAt;
  const needsBackupReminder = daysBetween(localDay(new Date(reference)), today) >= BACKUP_REMINDER_DAYS;

  const api = useMemo<GameApi>(
    () => ({
      profile,
      state,
      today,
      persistent: store.persistent,
      writeFailed,
      lastBackupAt: meta.lastBackupAt,
      needsBackupReminder,
      dispatch,
      draftFor,
      saveDraft,
      exportBackup,
      checkPin,
      importBackup,
      autoBackups,
    }),
    [profile, state, today, store.persistent, writeFailed, meta.lastBackupAt, needsBackupReminder, dispatch, draftFor, saveDraft, exportBackup, checkPin, importBackup, autoBackups],
  );

  return (
    <GameContext.Provider value={api}>
      <ErrorLogContext.Provider value={logError}>
        <RunnerTimeout seconds={state.settings.runSeconds}>{children}</RunnerTimeout>
      </ErrorLogContext.Provider>
    </GameContext.Provider>
  );
}
