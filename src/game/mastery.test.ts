import { describe, expect, test } from "vitest";
import { addDays } from "./dates";
import { isDue, LEITNER_DAYS, reviewCard } from "./leitner";
import { emptyMastery, recordMisconception, recordResult, solvedScore, type ResultSource } from "./mastery";
import { seededRng, shuffled } from "./random";
import type { ConceptMastery } from "./state";

function results(values: number[], source: ResultSource = "lesson", start = emptyMastery()): ConceptMastery {
  return values.reduce((m, s) => recordResult(m, s, source), start);
}

describe("solvedScore", () => {
  test("follows spec 5.9", () => {
    expect(solvedScore(0, 0, false)).toBe(1);
    expect(solvedScore(2, 0, false)).toBe(0.6);
    expect(solvedScore(0, 1, false)).toBe(0.3);
    expect(solvedScore(4, 0, true)).toBe(0.3);
  });
});

describe("recordResult", () => {
  test("moves the score 30% of the way to s x 100", () => {
    expect(results([1]).score).toBe(30);
    expect(results([1, 1]).score).toBe(51);
    expect(results([1, 1, 1]).score).toBe(65.7);
    expect(results([1, 1, 1, 1]).score).toBe(75.99);
    expect(results([0.6]).score).toBe(18);
    expect(results([1, 0]).score).toBe(21);
  });

  test("keeps the last 5 results", () => {
    expect(results([1, 0, 1, 0, 1, 0.6]).recent).toEqual([0, 1, 0, 1, 0.6]);
  });

  test("the ladder goes up after 2 right in a row and down after 2 wrong in a row", () => {
    expect(results([1]).level).toBe(1);
    expect(results([1, 0.6]).level).toBe(2);
    expect(results([1, 1, 1, 1]).level).toBe(3);
    expect(results([1, 1, 1, 1, 1, 1]).level).toBe(3);
    expect(results([1, 1, 0, 0]).level).toBe(1);
    expect(results([0, 0]).level).toBe(1);
    expect(results([1, 1, 0, 1, 0]).level).toBe(2);
  });

  test("a result with a hint (0.3) counts as wrong on the ladder", () => {
    expect(results([1, 1, 0.3, 0.3]).level).toBe(1);
  });

  test("flags help when fewer than 60% of at least 5 results are right", () => {
    expect(results([1, 0, 0, 1]).needsHelp).toBe(false);
    expect(results([1, 0, 0, 1, 0]).needsHelp).toBe(true);
    expect(results([1, 0, 1, 1, 0]).needsHelp).toBe(false);
  });

  test("flags help after 2 wrong review answers in a row, not after lesson answers", () => {
    expect(results([0, 0], "lesson").needsHelp).toBe(false);
    expect(results([0, 0], "review").needsHelp).toBe(true);
    expect(results([0, 1, 0], "review").needsHelp).toBe(false);
  });

  test("clears the flag and its causes when the score goes above 70", () => {
    const flagged = results([0, 0], "review");
    const cleared = results([1, 1, 1, 1], "lesson", flagged);
    expect(cleared.score).toBe(75.99);
    expect(cleared).toMatchObject({ needsHelp: false, reviewMisses: 0, misconceptions: 0 });
    expect(results([1, 1, 1], "lesson", flagged).needsHelp).toBe(true);
  });

  test("does not change the input", () => {
    const start = emptyMastery();
    recordResult(start, 1, "review");
    expect(start).toEqual(emptyMastery());
  });
});

describe("recordMisconception", () => {
  test("flags help at the third sighting", () => {
    const twice = recordMisconception(recordMisconception(emptyMastery()));
    expect(twice).toMatchObject({ misconceptions: 2, needsHelp: false });
    expect(recordMisconception(twice)).toMatchObject({ misconceptions: 3, needsHelp: true });
  });
});

describe("Leitner", () => {
  test("a new question answered right goes to box 2", () => {
    expect(reviewCard(undefined, true, "2026-10-06")).toEqual({ box: 2, due: "2026-10-08" });
    expect(reviewCard(undefined, false, "2026-10-06")).toEqual({ box: 1, due: "2026-10-07" });
  });

  test("right moves up 1 box until box 5, wrong goes back to box 1", () => {
    expect(reviewCard({ box: 3, due: "2026-10-06" }, true, "2026-10-06")).toEqual({ box: 4, due: "2026-10-13" });
    expect(reviewCard({ box: 5, due: "2026-10-06" }, true, "2026-10-06")).toEqual({ box: 5, due: "2026-10-20" });
    expect(reviewCard({ box: 4, due: "2026-10-06" }, false, "2026-10-06")).toEqual({ box: 1, due: "2026-10-07" });
    expect(LEITNER_DAYS).toEqual([1, 2, 4, 7, 14]);
  });

  test("a card is due on its day and after it", () => {
    const card = { box: 2, due: "2026-10-08" };
    expect(isDue(card, "2026-10-07")).toBe(false);
    expect(isDue(card, "2026-10-08")).toBe(true);
    expect(isDue(card, addDays("2026-10-08", 3))).toBe(true);
  });
});

describe("random", () => {
  test("the same seed gives the same numbers", () => {
    const a = seededRng(42);
    const b = seededRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seededRng(1)()).not.toBe(seededRng(2)());
  });

  test("shuffled keeps every item and does not change the input", () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffled(items, seededRng(7));
    expect([...out].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });
});
