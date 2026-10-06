import { describe, expect, test } from "vitest";
import { acquireTabLock, openGameStore, requestPersistence, type LocksLike } from "./bootstrap";
import { MemoryStore } from "./memoryStore";

class FakeLocks implements LocksLike {
  held = new Set<string>();
  async request(name: string, _options: { ifAvailable: boolean }, callback: (lock: unknown) => Promise<void>): Promise<unknown> {
    if (this.held.has(name)) return callback(null);
    this.held.add(name);
    return callback({ name });
  }
}

describe("openGameStore", () => {
  test("returns the opened store", async () => {
    const store = new MemoryStore({ persistent: true });
    expect(await openGameStore(async () => store)).toBe(store);
  });

  test("falls back to MemoryStore when opening fails", async () => {
    const store = await openGameStore(async () => {
      throw new Error("IndexedDB blocked");
    });
    expect(store).toBeInstanceOf(MemoryStore);
    expect(store.persistent).toBe(false);
  });
});

describe("acquireTabLock", () => {
  test("allows writing when the browser has no Web Locks", async () => {
    expect(await acquireTabLock(undefined)).toBe(true);
  });

  test("a second request does not get the lock", async () => {
    const locks = new FakeLocks();
    expect(await acquireTabLock(locks)).toBe(true);
    expect(await acquireTabLock(locks)).toBe(false);
  });

  test("allows writing when the lock request fails", async () => {
    class FailingLocks implements LocksLike {
      async request(): Promise<unknown> {
        return Promise.reject(new Error("SecurityError"));
      }
    }
    expect(await acquireTabLock(new FailingLocks())).toBe(true);
  });
});

describe("requestPersistence", () => {
  test("returns what the browser answers, and false on errors", async () => {
    expect(await requestPersistence({ persist: async () => true })).toBe(true);
    expect(
      await requestPersistence({
        persist: async () => {
          throw new Error("no");
        },
      }),
    ).toBe(false);
    expect(await requestPersistence({})).toBe(false);
    expect(await requestPersistence(undefined)).toBe(false);
  });
});
