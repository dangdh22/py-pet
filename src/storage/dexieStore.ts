import Dexie, { type DexieOptions, type Table } from "dexie";
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

interface MetaRow {
  key: "app";
  value: AppMeta;
}

interface StateRow {
  profileId: string;
  state: GameState;
}

class PyPetDatabase extends Dexie {
  meta!: Table<MetaRow, string>;
  profiles!: Table<StoredProfile, string>;
  states!: Table<StateRow, string>;
  attempts!: Table<AttemptRecord, number>;
  drafts!: Table<DraftRecord, [string, string]>;

  constructor(name: string, options?: DexieOptions) {
    super(name, options);
    this.version(1).stores({
      meta: "key",
      profiles: "id",
      states: "profileId",
      attempts: "++id, [profileId+itemId], profileId",
      drafts: "[profileId+itemId], profileId",
    });
  }
}

export class DexieStore implements GameStore {
  readonly persistent = true;

  private constructor(private readonly db: PyPetDatabase) {}

  static async open(name = "py-pet", options?: DexieOptions): Promise<DexieStore> {
    const db = new PyPetDatabase(name, options);
    await db.open();
    return new DexieStore(db);
  }

  close(): void {
    this.db.close();
  }

  async readMeta(): Promise<AppMeta> {
    // A meta written by an older app or imported from a file may lack fields: fill in the defaults.
    return { ...emptyMeta(), ...(await this.db.meta.get("app"))?.value };
  }

  async writeMeta(patch: Partial<AppMeta>): Promise<void> {
    await this.db.transaction("rw", this.db.meta, async () => {
      const current = await this.readMeta();
      await this.db.meta.put({ key: "app", value: { ...current, ...patch } });
    });
  }

  async appendErrorLog(entry: ErrorLogEntry): Promise<void> {
    await this.db.transaction("rw", this.db.meta, async () => {
      const current = await this.readMeta();
      await this.db.meta.put({ key: "app", value: { ...current, errorLog: appendErrorLog(current.errorLog, entry) } });
    });
  }

  async loadActive(): Promise<LoadedGame | null> {
    const meta = await this.readMeta();
    const id = meta.activeProfileId;
    if (id === null) return null;
    const [profile, stateRow, drafts] = await Promise.all([
      this.db.profiles.get(id),
      this.db.states.get(id),
      this.db.drafts.where("profileId").equals(id).toArray(),
    ]);
    if (!profile || !stateRow) return null;
    return { profile, state: stateRow.state, drafts: new Map(drafts.map((d) => [d.itemId, d.code])), meta };
  }

  async createProfile(profile: StoredProfile, state: GameState): Promise<void> {
    await this.db.transaction("rw", [this.db.meta, this.db.profiles, this.db.states], async () => {
      await this.db.profiles.put(profile);
      await this.db.states.put({ profileId: profile.id, state });
      const meta = await this.readMeta();
      await this.db.meta.put({ key: "app", value: { ...meta, activeProfileId: profile.id } });
    });
  }

  async saveState(profileId: string, state: GameState, attempt?: AttemptRecord): Promise<void> {
    await this.db.transaction("rw", this.db.states, this.db.attempts, async () => {
      await this.db.states.put({ profileId, state });
      if (!attempt) return;
      await this.db.attempts.add(attempt);
      const keys = await this.db.attempts.where("[profileId+itemId]").equals([profileId, attempt.itemId]).primaryKeys();
      const extra = keys.length - ATTEMPTS_PER_ITEM;
      if (extra > 0) await this.db.attempts.bulkDelete(keys.slice(0, extra));
    });
  }

  async saveDraft(profileId: string, itemId: string, code: string): Promise<void> {
    await this.db.drafts.put({ profileId, itemId, code });
  }

  async exportProfiles(): Promise<ProfileBundle[]> {
    const profiles = await this.db.profiles.toArray();
    return Promise.all(
      profiles.map(async (profile) => ({
        profile,
        state: ((await this.db.states.get(profile.id)) as StateRow).state,
        attempts: await this.db.attempts.where("profileId").equals(profile.id).toArray(),
        drafts: await this.db.drafts.where("profileId").equals(profile.id).toArray(),
      })),
    );
  }

  async replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void> {
    const tables = [this.db.meta, this.db.profiles, this.db.states, this.db.attempts, this.db.drafts];
    await this.db.transaction("rw", tables, async () => {
      await Promise.all(tables.map((table) => table.clear()));
      await this.db.meta.put({ key: "app", value: meta });
      await this.db.profiles.bulkPut(profiles.map((p) => p.profile));
      await this.db.states.bulkPut(profiles.map((p) => ({ profileId: p.profile.id, state: p.state })));
      await this.db.attempts.bulkPut(profiles.flatMap((p) => p.attempts));
      await this.db.drafts.bulkPut(profiles.flatMap((p) => p.drafts));
    });
  }

  async attemptsFor(profileId: string, itemIds: string[]): Promise<AttemptRecord[]> {
    if (itemIds.length === 0) return [];
    const rows = await this.db.attempts
      .where("[profileId+itemId]")
      .anyOf(itemIds.map((itemId) => [profileId, itemId]))
      .toArray();
    return rows.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }
}
