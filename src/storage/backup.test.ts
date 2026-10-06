import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { sampleBackupPayload } from "../test/backupSample";
import {
  backupFileName,
  buildBackupPayload,
  decodeBackup,
  encodeBackup,
  migrateBackup,
  previewOf,
} from "./backup";
import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import { MemoryStore } from "./memoryStore";
import { hashPin, isValidPin, verifyPin } from "./pin";

describe("encoding", () => {
  test("UTF-8 base64 round-trips Vietnamese text", () => {
    expect(base64ToUtf8(utf8ToBase64("Xin chào Robo – đẹp"))).toBe("Xin chào Robo – đẹp");
  });

  test("sha256Hex", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("PIN", () => {
  test("isValidPin accepts 4 to 6 digits", () => {
    expect(["1234", "123456"].map(isValidPin)).toEqual([true, true]);
    expect(["123", "1234567", "12a4", ""].map(isValidPin)).toEqual([false, false, false, false]);
  });

  test("hash then verify", async () => {
    const stored = await hashPin("2468", 1000);
    expect(stored.iterations).toBe(1000);
    expect(await verifyPin("2468", stored)).toBe(true);
    expect(await verifyPin("2469", stored)).toBe(false);
    const again = await hashPin("2468", 1000);
    expect(again.salt).not.toBe(stored.salt);
  });

  test("hashPin rejects an invalid PIN", async () => {
    await expect(hashPin("12", 1000)).rejects.toThrow("PIN");
  });
});

describe("backup file", () => {
  test("encode then decode round-trips with a valid checksum", async () => {
    const payload = sampleBackupPayload();
    const result = await decodeBackup(await encodeBackup(payload));
    expect(result).toEqual({ ok: true, payload, checksumValid: true });
  });

  test("flags a tampered file", async () => {
    const text = await encodeBackup(sampleBackupPayload());
    const edited = JSON.parse(base64ToUtf8(text));
    edited.profiles[0].state.wallet.xu = 99999;
    const result = await decodeBackup(utf8ToBase64(JSON.stringify(edited)));
    expect(result.ok).toBe(true);
    expect(result.ok && result.checksumValid).toBe(false);
  });

  test("rejects garbage and other JSON", async () => {
    expect(await decodeBackup("%%% not base64 %%%")).toEqual({ ok: false, reason: "not-a-backup" });
    expect(await decodeBackup(utf8ToBase64('{"hello":1}'))).toEqual({ ok: false, reason: "not-a-backup" });
    expect(await decodeBackup(utf8ToBase64("[1,2]"))).toEqual({ ok: false, reason: "not-a-backup" });
  });

  test("rejects a schema version that is not a positive whole number", async () => {
    for (const schemaVersion of [0, 0.5, -1]) {
      expect(await decodeBackup(await encodeBackup({ ...sampleBackupPayload(), schemaVersion }))).toEqual({
        ok: false,
        reason: "not-a-backup",
      });
    }
  });

  test("refuses a newer schema", async () => {
    const text = await encodeBackup({ ...sampleBackupPayload(), schemaVersion: 99 });
    expect(await decodeBackup(text)).toEqual({ ok: false, reason: "newer-version" });
  });

  test("migrateBackup throws when a migration step is missing", () => {
    expect(() => migrateBackup({ ...sampleBackupPayload(), schemaVersion: 0 })).toThrow("Missing migration from schema 0");
  });

  test("previewOf shows the active profile", () => {
    expect(previewOf(sampleBackupPayload("Bình"))).toEqual({ childName: "Bình", stage: 1, xu: 120, lastActiveDay: "2026-10-06" });
    expect(previewOf({ ...sampleBackupPayload(), profiles: [] })).toBeNull();
  });

  test("backupFileName removes accents", () => {
    expect(backupFileName("Đặng Minh An", "2026-10-06")).toBe("py-pet-dang-minh-an-2026-10-06.pypet");
    expect(backupFileName("  ", "2026-10-06")).toBe("py-pet-con-2026-10-06.pypet");
  });

  test("buildBackupPayload leaves the automatic backups out", async () => {
    const store = new MemoryStore();
    await store.createProfile(sampleBackupPayload().profiles[0]!.profile, initialGameState("2026-10-06"));
    await store.writeMeta({ autoBackups: ["old"] });
    const payload = await buildBackupPayload(store, new Date("2026-10-06T12:00:00.000Z"));
    expect(payload.meta.autoBackups).toEqual([]);
    expect(payload.exportedAt).toBe("2026-10-06T12:00:00.000Z");
    expect(payload.profiles).toHaveLength(1);
  });

  test("decodes the committed schema 1 sample file", async () => {
    const text = readFileSync("src/storage/fixtures/backup-v1.pypet", "utf8");
    const result = await decodeBackup(text);
    expect(result.ok && result.checksumValid).toBe(true);
    expect(result.ok && previewOf(result.payload)?.childName).toBe("An");
  });
});
