import { describe, expect, test } from "vitest";
import { StateFormatError, upgradeGameState } from "./migrate";
import { emptyMastery } from "./mastery";
import { DEFAULT_SETTINGS, GAME_STATE_VERSION, initialGameState, type GameState } from "./state";

/** A state as the M3b app saved it (version 3), with 1 concept record and 25 xu. */
function versionThreeState(): Record<string, unknown> {
  const { inventory, rewards, vacation, assigned, badges, ...rest } = initialGameState("2026-10-06");
  const { questionLang, passPercent, helpPercent, runSeconds, ...settings } = rest.settings;
  const { coachedAt, ...concept } = emptyMastery();
  return {
    ...rest,
    version: 3,
    wallet: { xu: 25 },
    activity: { lastActiveDay: "2026-10-05", decayApplied: 0 },
    settings: { ...settings, dailyGoal: 3 },
    mastery: { k1: { ...concept, score: 42 } },
  };
}

/** A state as the M3a app saved it (version 2). */
function versionTwoState(): Record<string, unknown> {
  const { remedial, ...rest } = versionThreeState();
  const { topicTests, evolutionTests, ...progress } = rest.progress as GameState["progress"];
  const { stageStartXp, ...pet } = rest.pet as GameState["pet"];
  return { ...rest, version: 2, pet: { ...pet, xp: 70 }, progress: { ...progress, completedReviews: ["s1.lam-quen.r1"] } };
}

/** A state as the M2 app saved it (version 1). */
function versionOneState(): Record<string, unknown> {
  const { mastery, reviews, retry, ...rest } = versionTwoState();
  const { completedReviews, ...progress } = rest.progress as Record<string, unknown>;
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
    expect(upgraded.progress.topicTests).toEqual({});
    expect(upgraded.remedial).toBeNull();
  });

  test("upgrades a version 2 state and keeps its review stations", () => {
    const upgraded = upgradeGameState(versionTwoState());
    expect(upgraded.version).toBe(GAME_STATE_VERSION);
    expect(upgraded.progress.completedReviews).toEqual(["s1.lam-quen.r1"]);
    expect(upgraded.pet).toMatchObject({ xp: 70, stageStartXp: 0 });
    expect(upgraded.progress.topicTests).toEqual({});
    expect(upgraded.progress.evolutionTests).toEqual([]);
    expect(upgraded.remedial).toBeNull();
  });

  test("upgrades a version 3 state: shop, rewards, vacation and settings start empty or default", () => {
    const upgraded = upgradeGameState(versionThreeState());
    expect(upgraded.version).toBe(GAME_STATE_VERSION);
    expect(upgraded.wallet).toEqual({ xu: 25, history: [] });
    expect(upgraded.activity).toEqual({ lastActiveDay: "2026-10-05", decayApplied: 0, seconds: {} });
    expect(upgraded.settings).toEqual({ ...DEFAULT_SETTINGS, dailyGoal: 3 });
    expect(upgraded.mastery.k1).toEqual({ ...emptyMastery(), score: 42, coachedAt: null });
    expect(upgraded.inventory).toEqual({ consumables: {}, owned: [], equipped: [] });
    expect(upgraded.rewards).toEqual({ catalog: [], requests: [] });
    expect(upgraded.vacation).toEqual({ since: null, ranges: [] });
    expect(upgraded.assigned).toEqual([]);
    expect(upgraded.badges).toEqual({});
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
