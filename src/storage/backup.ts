import type { GameState } from "../game/state";
import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import {
  SCHEMA_VERSION,
  type AppMeta,
  type DraftRecord,
  type GameStore,
  type ProfileBundle,
  type StoredProfile,
} from "./types";

export const BACKUP_FORMAT = "py-pet-backup";
export const APP_VERSION = "0.2.0";
/** Detects hand edits; it is not a security measure. */
const CHECKSUM_SECRET = "py-pet/backup/checksum/2026";

export interface BackupPayload {
  format: string;
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  meta: AppMeta;
  profiles: ProfileBundle[];
}

export type DecodeResult =
  | { ok: true; payload: BackupPayload; checksumValid: boolean }
  | { ok: false; reason: "not-a-backup" | "newer-version" };

export interface BackupPreview {
  childName: string;
  stage: number;
  xu: number;
  lastActiveDay: string | null;
}

/** schemaVersion N -> function that turns an N payload into an N+1 payload. */
const MIGRATIONS: Record<number, (payload: BackupPayload) => BackupPayload> = {};

/** The active profile as the app holds it in memory: newer than the store when a write failed. */
export interface ActiveSnapshot {
  profile: StoredProfile;
  state: GameState;
  drafts: DraftRecord[];
}

/**
 * Without `active`, every profile comes from the store. With `active`, that profile's state and drafts come
 * from memory; its attempts and the other profiles come from the store, or are left out when the store cannot
 * read them.
 */
export async function buildBackupPayload(store: GameStore, now: Date, active?: ActiveSnapshot): Promise<BackupPayload> {
  const meta = await store.readMeta();
  let profiles: ProfileBundle[];
  if (!active) {
    profiles = await store.exportProfiles();
  } else {
    let stored: ProfileBundle[] = [];
    try {
      stored = await store.exportProfiles();
    } catch {
      // Keep the export working: the in-memory progress matters more than the attempt history.
    }
    const id = active.profile.id;
    const bundle: ProfileBundle = {
      profile: active.profile,
      state: active.state,
      attempts: stored.find((p) => p.profile.id === id)?.attempts ?? [],
      drafts: active.drafts,
    };
    profiles = stored.some((p) => p.profile.id === id)
      ? stored.map((p) => (p.profile.id === id ? bundle : p))
      : [...stored, bundle];
  }
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: now.toISOString(),
    meta: { ...meta, autoBackups: [] },
    profiles,
  };
}

export async function encodeBackup(payload: BackupPayload): Promise<string> {
  const checksum = await sha256Hex(JSON.stringify(payload) + CHECKSUM_SECRET);
  return utf8ToBase64(JSON.stringify({ ...payload, checksum }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function decodeBackup(text: string): Promise<DecodeResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(base64ToUtf8(text.trim()));
  } catch {
    return { ok: false, reason: "not-a-backup" };
  }
  if (
    !isRecord(parsed) ||
    parsed.format !== BACKUP_FORMAT ||
    typeof parsed.schemaVersion !== "number" ||
    !Array.isArray(parsed.profiles) ||
    !isRecord(parsed.meta)
  ) {
    return { ok: false, reason: "not-a-backup" };
  }
  if (parsed.schemaVersion > SCHEMA_VERSION) return { ok: false, reason: "newer-version" };
  const { checksum, ...rest } = parsed;
  const expected = await sha256Hex(JSON.stringify(rest) + CHECKSUM_SECRET);
  return { ok: true, payload: migrateBackup(rest as unknown as BackupPayload), checksumValid: checksum === expected };
}

export function migrateBackup(payload: BackupPayload): BackupPayload {
  let current = payload;
  for (let version = payload.schemaVersion; version < SCHEMA_VERSION; version += 1) {
    const step = MIGRATIONS[version];
    if (!step) throw new Error(`Missing migration from schema ${version}`);
    current = step(current);
  }
  return current;
}

export function previewOf(payload: BackupPayload): BackupPreview | null {
  const active =
    payload.profiles.find((p) => p.profile.id === payload.meta.activeProfileId) ?? payload.profiles[0];
  if (!active) return null;
  return {
    childName: active.profile.childName,
    stage: active.state.pet.stage,
    xu: active.state.wallet.xu,
    lastActiveDay: active.state.activity.lastActiveDay,
  };
}

export function backupFileName(childName: string, today: string): string {
  const slug = childName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `py-pet-${slug || "con"}-${today}.pypet`;
}
