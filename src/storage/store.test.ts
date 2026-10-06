import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { DexieStore } from "./dexieStore";
import { MemoryStore } from "./memoryStore";
import { emptyMeta, type AppMeta, type AttemptRecord, type GameStore, type StoredProfile } from "./types";

const profile: StoredProfile = { id: "p1", childName: "An", robotName: "Robo", createdAt: "2026-10-06T02:00:00.000Z" };

function codeAttempt(itemId: string, n: number): AttemptRecord {
  return {
    kind: "code",
    profileId: "p1",
    itemId,
    at: `2026-10-06T02:00:${String(n).padStart(2, "0")}.000Z`,
    code: `print(${n})`,
    status: "wrong-answer",
    passedCount: 0,
    total: 1,
    misconceptions: [],
  };
}

let dbCounter = 0;
const stores: [string, () => Promise<GameStore>][] = [
  ["MemoryStore", async () => new MemoryStore()],
  ["DexieStore", () => DexieStore.open(`test-${(dbCounter += 1)}`, { indexedDB: new IDBFactory(), IDBKeyRange })],
];

describe.each(stores)("%s", (_name, makeStore) => {
  test("starts with empty meta and no active profile", async () => {
    const store = await makeStore();
    expect(await store.readMeta()).toEqual(emptyMeta());
    expect(await store.loadActive()).toBeNull();
  });

  test("createProfile makes the profile active and loadable", async () => {
    const store = await makeStore();
    const state = initialGameState("2026-10-06");
    await store.createProfile(profile, state);
    const loaded = await store.loadActive();
    expect(loaded?.profile).toEqual(profile);
    expect(loaded?.state).toEqual(state);
    expect(loaded?.drafts.size).toBe(0);
    expect(loaded?.meta.activeProfileId).toBe("p1");
  });

  test("saveState stores the state and keeps the 10 latest attempts per item", async () => {
    const store = await makeStore();
    await store.createProfile(profile, initialGameState("2026-10-06"));
    const state = initialGameState("2026-10-06");
    state.pet.xp = 25;
    for (let n = 0; n < 12; n += 1) await store.saveState("p1", state, codeAttempt("ex1", n));
    await store.saveState("p1", state, codeAttempt("ex2", 0));
    expect((await store.loadActive())?.state.pet.xp).toBe(25);
    const [bundle] = await store.exportProfiles();
    const ex1 = bundle!.attempts.filter((a) => a.itemId === "ex1");
    expect(ex1).toHaveLength(10);
    expect(ex1.map((a) => (a.kind === "code" ? a.code : ""))).toEqual(
      Array.from({ length: 10 }, (_, i) => `print(${i + 2})`),
    );
    expect(bundle!.attempts.filter((a) => a.itemId === "ex2")).toHaveLength(1);
  });

  test("attemptsFor returns the attempts of the given items, oldest first", async () => {
    const store = await makeStore();
    await store.createProfile(profile, initialGameState("2026-10-06"));
    const state = initialGameState("2026-10-06");
    await store.saveState("p1", state, codeAttempt("ex1", 1));
    await store.saveState("p1", state, codeAttempt("ex2", 2));
    await store.saveState("p1", state, codeAttempt("ex3", 3));
    await store.saveState("p1", state, codeAttempt("ex1", 4));
    const found = await store.attemptsFor("p1", ["ex1", "ex3"]);
    expect(found.map((a) => [a.itemId, a.at.slice(-7, -5)])).toEqual([
      ["ex1", "01"],
      ["ex3", "03"],
      ["ex1", "04"],
    ]);
    expect(await store.attemptsFor("p1", [])).toEqual([]);
    expect(await store.attemptsFor("p2", ["ex1"])).toEqual([]);
  });

  test("drafts are saved per item and loaded with the profile", async () => {
    const store = await makeStore();
    await store.createProfile(profile, initialGameState("2026-10-06"));
    await store.saveDraft("p1", "ex1", "print(1)");
    await store.saveDraft("p1", "ex1", "print(2)");
    await store.saveDraft("p1", "ex2", "x = 1");
    const loaded = await store.loadActive();
    expect(Object.fromEntries(loaded!.drafts)).toEqual({ ex1: "print(2)", ex2: "x = 1" });
  });

  test("writeMeta merges and the error log keeps the 50 latest entries", async () => {
    const store = await makeStore();
    await store.writeMeta({ lastBackupAt: "2026-10-06T02:00:00.000Z" });
    for (let n = 0; n < 55; n += 1) {
      await store.appendErrorLog({ at: `2026-10-06T02:00:${String(n).padStart(2, "0")}.000Z`, kind: "ui-crash", detail: `e${n}` });
    }
    const meta = await store.readMeta();
    expect(meta.lastBackupAt).toBe("2026-10-06T02:00:00.000Z");
    expect(meta.errorLog).toHaveLength(50);
    expect(meta.errorLog[0]!.detail).toBe("e5");
  });

  test("a meta with missing fields gets the defaults and still takes error log entries", async () => {
    const store = await makeStore();
    const partial = { schemaVersion: 1, activeProfileId: "p1" } as unknown as AppMeta;
    await store.replaceAll(partial, []);
    expect(await store.readMeta()).toEqual({ ...emptyMeta(), schemaVersion: 1, activeProfileId: "p1" });
    await store.appendErrorLog({ at: "2026-10-06T02:00:00.000Z", kind: "ui-crash", detail: "boom" });
    expect((await store.readMeta()).errorLog).toEqual([{ at: "2026-10-06T02:00:00.000Z", kind: "ui-crash", detail: "boom" }]);
  });

  test("exportProfiles and replaceAll round-trip into another store", async () => {
    const source = await makeStore();
    const state = initialGameState("2026-10-06");
    state.wallet.xu = 40;
    await source.createProfile(profile, state);
    await source.saveState("p1", state, codeAttempt("ex1", 1));
    await source.saveDraft("p1", "ex1", "print(1)");
    const target = await makeStore();
    await target.createProfile({ ...profile, id: "old", childName: "Cũ" }, initialGameState("2026-10-06"));
    await target.replaceAll({ ...emptyMeta(), activeProfileId: "p1" }, await source.exportProfiles());
    const loaded = await target.loadActive();
    expect(loaded?.profile.childName).toBe("An");
    expect(loaded?.state.wallet.xu).toBe(40);
    expect(Object.fromEntries(loaded!.drafts)).toEqual({ ex1: "print(1)" });
    const exported = await target.exportProfiles();
    expect(exported.map((p) => p.profile.id)).toEqual(["p1"]);
    expect(exported[0]!.attempts).toHaveLength(1);
  });
});

describe("persistence flags", () => {
  test("MemoryStore is not persistent unless asked", () => {
    expect(new MemoryStore().persistent).toBe(false);
    expect(new MemoryStore({ persistent: true }).persistent).toBe(true);
  });

  test("DexieStore keeps data after reopening the same database", async () => {
    const indexedDB = new IDBFactory();
    const first = await DexieStore.open("reopen", { indexedDB, IDBKeyRange });
    expect(first.persistent).toBe(true);
    await first.createProfile(profile, initialGameState("2026-10-06"));
    first.close();
    const second = await DexieStore.open("reopen", { indexedDB, IDBKeyRange });
    expect((await second.loadActive())?.profile.id).toBe("p1");
  });
});
