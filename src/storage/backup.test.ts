import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { GAME_STATE_VERSION, initialGameState } from "../game/state";
import { sampleBackupPayload } from "../test/backupSample";
import {
  backupFileName,
  buildBackupPayload,
  decodeBackup,
  encodeBackup,
  migrateBackup,
  previewOf,
  type BackupPayload,
} from "./backup";
import { base64ToUtf8, sha256Hex, utf8ToBase64 } from "./encoding";
import { MemoryStore } from "./memoryStore";
import { hashPin, isValidPin, verifyPin } from "./pin";
import { SCHEMA_VERSION } from "./types";

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

  test("decodes the committed schema 1 sample file and upgrades it", async () => {
    const text = readFileSync("src/storage/fixtures/backup-v1.pypet", "utf8");
    const result = await decodeBackup(text);
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    expect(previewOf(result.payload)?.childName).toBe("An");
    expect(result.payload.schemaVersion).toBe(SCHEMA_VERSION);
    const state = result.payload.profiles[0]!.state;
    expect(state.version).toBe(GAME_STATE_VERSION);
    expect(state.progress.completedReviews).toEqual([]);
    expect(state.wallet.xu).toBe(120);
  });

  test("decodes the committed schema 2 sample file and upgrades it", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v2.pypet", "utf8"));
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    expect(result.payload.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.payload.profiles[0]!.state.mastery).toEqual({});
    expect(result.payload.profiles[0]!.state.remedial).toBeNull();
  });

  test("decodes the committed schema 3 sample file and upgrades it", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v3.pypet", "utf8"));
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    expect(result.payload.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.payload.profiles[0]!.state.progress.topicTests).toEqual({});
    expect(result.payload.profiles[0]!.state.wallet).toEqual({ xu: 120, history: [] });
  });

  test("decodes the committed schema 4 sample file", async () => {
    const result = await decodeBackup(readFileSync("src/storage/fixtures/backup-v4.pypet", "utf8"));
    if (!result.ok) throw new Error("the sample file must decode");
    expect(result.checksumValid).toBe(true);
    const state = result.payload.profiles[0]!.state;
    expect(state.inventory).toEqual({ consumables: { bong: 1 }, owned: ["kinh-ram"], equipped: ["kinh-ram"] });
    expect(state.rewards.catalog).toEqual([{ id: "r1", name: "Đọc truyện", price: 50, weeklyLimit: 1 }]);
    expect(state.badges).toEqual({ "first-lesson": "2026-10-06" });
    expect(state.vacation.ranges).toEqual([{ start: "2026-10-20", end: "2026-10-22" }]);
    expect(state.activity.seconds).toEqual({ "2026-10-06": 300 });
    expect(state.wallet.history).toHaveLength(1);
  });

  test("refuses a file whose profile or state is damaged", async () => {
    const broken = sampleBackupPayload();
    (broken.profiles[0]!.state as unknown as { wallet: unknown }).wallet = "lots";
    expect(await decodeBackup(await encodeBackup(broken))).toEqual({ ok: false, reason: "damaged" });
    const noProfile = { ...sampleBackupPayload(), profiles: [{}] } as unknown as BackupPayload;
    expect(await decodeBackup(await encodeBackup(noProfile))).toEqual({ ok: false, reason: "damaged" });
    const newerState = sampleBackupPayload();
    newerState.profiles[0]!.state.version = GAME_STATE_VERSION + 1;
    expect(await decodeBackup(await encodeBackup(newerState))).toEqual({ ok: false, reason: "damaged" });
  });

  test("checks the shared data: a file without profiles or with a broken PIN is damaged", async () => {
    const empty = { ...sampleBackupPayload(), profiles: [] };
    expect(await decodeBackup(await encodeBackup(empty))).toEqual({ ok: false, reason: "damaged" });
    const badPin = sampleBackupPayload();
    (badPin.meta as unknown as { pin: unknown }).pin = { salt: "", hash: "x", iterations: 1 };
    expect(await decodeBackup(await encodeBackup(badPin))).toEqual({ ok: false, reason: "damaged" });
  });

  test("an active profile that is not in the file becomes its first profile", async () => {
    const payload = sampleBackupPayload();
    payload.meta.activeProfileId = "someone-else";
    const result = await decodeBackup(await encodeBackup(payload));
    expect(result.ok && result.payload.meta.activeProfileId).toBe(payload.profiles[0]!.profile.id);
    expect(result.ok && result.payload.meta.pinResetAt).toBeNull();
  });
});
