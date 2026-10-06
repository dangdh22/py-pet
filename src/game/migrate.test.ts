import { describe, expect, test } from "vitest";
import { StateFormatError, upgradeGameState } from "./migrate";
import { GAME_STATE_VERSION, initialGameState } from "./state";

/** A state as the M2 app saved it (version 1). */
function versionOneState(): Record<string, unknown> {
  const { mastery, reviews, retry, ...rest } = initialGameState("2026-10-06");
  const { completedReviews, ...progress } = rest.progress;
  return { ...rest, version: 1, progress: { ...progress, completedLessons: ["s1.lam-quen.l1"] } };
}

function problemOf(raw: unknown): string {
  try {
    upgradeGameState(raw);
  } catch (error) {
    if (error instanceof StateFormatError) return error.problem;
    throw error;
  }
  return "none";
}

describe("upgradeGameState", () => {
  test("keeps a current state as it is", () => {
    const state = initialGameState("2026-10-06");
    expect(upgradeGameState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  test("upgrades a version 1 state and keeps its progress", () => {
    const upgraded = upgradeGameState(versionOneState());
    expect(upgraded.version).toBe(GAME_STATE_VERSION);
    expect(upgraded.mastery).toEqual({});
    expect(upgraded.reviews).toEqual({});
    expect(upgraded.retry).toEqual({});
    expect(upgraded.progress.completedReviews).toEqual([]);
    expect(upgraded.progress.completedLessons).toEqual(["s1.lam-quen.l1"]);
  });

  test("keeps the optional exercise stats", () => {
    const raw = versionOneState();
    (raw.progress as Record<string, unknown>).exerciseStats = { a: { fails: 2, hints: 1, viewedSolution: false } };
    expect(upgradeGameState(raw).progress.exerciseStats).toEqual({ a: { fails: 2, hints: 1, viewedSolution: false } });
  });

  test("refuses a state from a newer app", () => {
    expect(problemOf({ ...initialGameState("2026-10-06"), version: GAME_STATE_VERSION + 1 })).toBe("newer-version");
  });

  test("refuses a damaged state", () => {
    expect(problemOf(null)).toBe("damaged");
    expect(problemOf({})).toBe("damaged");
    expect(problemOf({ version: 0 })).toBe("damaged");
    expect(problemOf({ ...initialGameState("2026-10-06"), wallet: { xu: -5 } })).toBe("damaged");
    expect(problemOf({ ...initialGameState("2026-10-06"), pet: "robo" })).toBe("damaged");
    expect(problemOf({ ...versionOneState(), progress: { completedLessons: "all" } })).toBe("damaged");
  });
});
