import type { GameState } from "../game/state";
import type { QuestionLang } from "../i18n/lang";
import type { JudgeStatus } from "../runner/judge";

export const SCHEMA_VERSION = 4;
export const ATTEMPTS_PER_ITEM = 10;
export const ERROR_LOG_LIMIT = 50;
export const AUTO_BACKUPS = 3;

export interface StoredProfile {
  id: string;
  childName: string;
  robotName: string;
  createdAt: string;
}

interface AttemptBase {
  id?: number;
  profileId: string;
  itemId: string;
  at: string;
}

export interface CodeAttempt extends AttemptBase {
  kind: "code";
  code: string;
  status: JudgeStatus;
  passedCount: number;
  total: number;
  misconceptions: string[];
}

export interface ChoiceAttempt extends AttemptBase {
  kind: "choice";
  choiceIndex: number;
  correct: boolean;
  lang: QuestionLang;
}

export type AttemptRecord = CodeAttempt | ChoiceAttempt;
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** What the UI supplies; the provider adds id-less profileId and time. */
export type AttemptInput = DistributiveOmit<AttemptRecord, "id" | "profileId" | "at">;

export interface DraftRecord {
  profileId: string;
  itemId: string;
  code: string;
}

export interface PinHash {
  salt: string;
  hash: string;
  iterations: number;
}

export interface ErrorLogEntry {
  at: string;
  kind: "unknown-python-error" | "ui-crash" | "load-failed";
  detail: string;
}

export interface AppMeta {
  schemaVersion: number;
  activeProfileId: string | null;
  pin: PinHash | null;
  lastBackupAt: string | null;
  errorLog: ErrorLogEntry[];
  autoBackups: string[];
  /** When the PIN was last reset without the old one (spec 6.3: the parent area shows it), or null. */
  pinResetAt: string | null;
}

export interface ProfileBundle {
  profile: StoredProfile;
  state: GameState;
  attempts: AttemptRecord[];
  drafts: DraftRecord[];
}

export interface LoadedGame {
  profile: StoredProfile;
  state: GameState;
  drafts: Map<string, string>;
  meta: AppMeta;
}

export interface GameStore {
  readonly persistent: boolean;
  readMeta(): Promise<AppMeta>;
  writeMeta(patch: Partial<AppMeta>): Promise<void>;
  appendErrorLog(entry: ErrorLogEntry): Promise<void>;
  loadActive(): Promise<LoadedGame | null>;
  createProfile(profile: StoredProfile, state: GameState): Promise<void>;
  saveState(profileId: string, state: GameState, attempt?: AttemptRecord): Promise<void>;
  saveDraft(profileId: string, itemId: string, code: string): Promise<void>;
  exportProfiles(): Promise<ProfileBundle[]>;
  replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void>;
  /** The saved attempts of these items for a profile, oldest first (spec 9.2: the evidence for a parent). */
  attemptsFor(profileId: string, itemIds: string[]): Promise<AttemptRecord[]>;
}

export function emptyMeta(): AppMeta {
  return {
    schemaVersion: SCHEMA_VERSION,
    activeProfileId: null,
    pin: null,
    lastBackupAt: null,
    errorLog: [],
    autoBackups: [],
    pinResetAt: null,
  };
}

export function appendErrorLog(log: ErrorLogEntry[], entry: ErrorLogEntry): ErrorLogEntry[] {
  return [...log, entry].slice(-ERROR_LOG_LIMIT);
}
