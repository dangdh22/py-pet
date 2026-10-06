import { DexieStore } from "./dexieStore";
import { MemoryStore } from "./memoryStore";
import type { GameStore } from "./types";

export async function openGameStore(open: () => Promise<GameStore> = () => DexieStore.open()): Promise<GameStore> {
  try {
    return await open();
  } catch {
    return new MemoryStore();
  }
}

export interface LocksLike {
  request(name: string, options: { ifAvailable: boolean }, callback: (lock: unknown) => Promise<void>): Promise<unknown>;
}

const LOCK_NAME = "py-pet-writer";

function browserLocks(): LocksLike | undefined {
  return (globalThis.navigator as { locks?: LocksLike } | undefined)?.locks;
}

/** Holds the writer lock for the life of the tab. Resolves false when another tab holds it. */
export function acquireTabLock(locks: LocksLike | undefined = browserLocks()): Promise<boolean> {
  if (!locks) return Promise.resolve(true);
  return new Promise((resolve) => {
    void locks.request(LOCK_NAME, { ifAvailable: true }, (lock) => {
      if (lock === null) {
        resolve(false);
        return Promise.resolve();
      }
      resolve(true);
      return new Promise<void>(() => {});
    });
  });
}

export async function requestPersistence(
  storage: { persist?: () => Promise<boolean> } | undefined = globalThis.navigator?.storage,
): Promise<boolean> {
  try {
    return (await storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
