import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import { SCHEMA_VERSION, type AppMeta, type GameStore, type ProfileBundle } from "./types";

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

export async function buildBackupPayload(store: GameStore, now: Date): Promise<BackupPayload> {
  const meta = await store.readMeta();
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: now.toISOString(),
    meta: { ...meta, autoBackups: [] },
    profiles: await store.exportProfiles(),
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
