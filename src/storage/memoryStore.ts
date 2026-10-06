import type { GameState } from "../game/state";
import {
  ATTEMPTS_PER_ITEM,
  appendErrorLog,
  emptyMeta,
  type AppMeta,
  type AttemptRecord,
  type DraftRecord,
  type ErrorLogEntry,
  type GameStore,
  type LoadedGame,
  type ProfileBundle,
  type StoredProfile,
} from "./types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const draftKey = (profileId: string, itemId: string) => `${profileId}\u0000${itemId}`;

/** Keeps everything in memory: the fallback when IndexedDB is blocked, and a test double. */
export class MemoryStore implements GameStore {
  readonly persistent: boolean;
  private meta: AppMeta = emptyMeta();
  private profiles = new Map<string, StoredProfile>();
  private states = new Map<string, GameState>();
  private attempts: AttemptRecord[] = [];
  private drafts = new Map<string, DraftRecord>();
  private nextAttemptId = 1;

  constructor(options: { persistent?: boolean } = {}) {
    this.persistent = options.persistent ?? false;
  }

  async readMeta(): Promise<AppMeta> {
    return clone(this.meta);
  }

  async writeMeta(patch: Partial<AppMeta>): Promise<void> {
    this.meta = { ...this.meta, ...clone(patch) };
  }

  async appendErrorLog(entry: ErrorLogEntry): Promise<void> {
    this.meta = { ...this.meta, errorLog: appendErrorLog(this.meta.errorLog, clone(entry)) };
  }

  async loadActive(): Promise<LoadedGame | null> {
    const id = this.meta.activeProfileId;
    if (id === null) return null;
    const profile = this.profiles.get(id);
    const state = this.states.get(id);
    if (!profile || !state) return null;
    const drafts = new Map<string, string>();
    for (const draft of this.drafts.values()) if (draft.profileId === id) drafts.set(draft.itemId, draft.code);
    return { profile: clone(profile), state: clone(state), drafts, meta: clone(this.meta) };
  }

  async createProfile(profile: StoredProfile, state: GameState): Promise<void> {
    this.profiles.set(profile.id, clone(profile));
    this.states.set(profile.id, clone(state));
    this.meta = { ...this.meta, activeProfileId: profile.id };
  }

  async saveState(profileId: string, state: GameState, attempt?: AttemptRecord): Promise<void> {
    this.states.set(profileId, clone(state));
    if (!attempt) return;
    this.attempts.push({ ...clone(attempt), id: this.nextAttemptId++ });
    const same = this.attempts.filter((a) => a.profileId === profileId && a.itemId === attempt.itemId);
    const extra = same.length - ATTEMPTS_PER_ITEM;
    if (extra > 0) {
      const dropped = new Set(same.slice(0, extra));
      this.attempts = this.attempts.filter((a) => !dropped.has(a));
    }
  }

  async saveDraft(profileId: string, itemId: string, code: string): Promise<void> {
    this.drafts.set(draftKey(profileId, itemId), { profileId, itemId, code });
  }

  async exportProfiles(): Promise<ProfileBundle[]> {
    return [...this.profiles.values()].map((profile) => ({
      profile: clone(profile),
      state: clone(this.states.get(profile.id) as GameState),
      attempts: clone(this.attempts.filter((a) => a.profileId === profile.id)),
      drafts: clone([...this.drafts.values()].filter((d) => d.profileId === profile.id)),
    }));
  }

  async replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void> {
    this.meta = clone(meta);
    this.profiles = new Map(profiles.map((p) => [p.profile.id, clone(p.profile)]));
    this.states = new Map(profiles.map((p) => [p.profile.id, clone(p.state)]));
    this.attempts = clone(profiles.flatMap((p) => p.attempts));
    this.drafts = new Map(profiles.flatMap((p) => p.drafts).map((d) => [draftKey(d.profileId, d.itemId), clone(d)]));
    this.nextAttemptId = Math.max(0, ...this.attempts.map((a) => a.id ?? 0)) + 1;
  }
}
