import { describe, expect, test } from "vitest";
import { at } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { gameStateSchema } from "./schema";
import { initialGameState } from "./state";

const bad: [string, unknown][] = [
  ["RewardsEdited with price NaN", { type: "RewardsEdited", catalog: [{ id: "a", name: "A", price: Number.NaN, weeklyLimit: 1 }] }],
  [
    "RewardsEdited with weeklyLimit Infinity",
    { type: "RewardsEdited", catalog: [{ id: "a", name: "A", price: 10, weeklyLimit: Number.POSITIVE_INFINITY }] },
  ],
  ["RewardsEdited with name 5", { type: "RewardsEdited", catalog: [{ id: "a", name: 5, price: 10, weeklyLimit: 1 }] }],
  ["PracticeAssigned with an empty id", { type: "PracticeAssigned", id: "", conceptId: "c", items: ["q1"] }],
  ["PracticeAssigned with an empty conceptId", { type: "PracticeAssigned", id: "p", conceptId: "", items: ["q1"] }],
  ["VacationScheduled with a bad start", { type: "VacationScheduled", start: "soon", end: "2026-10-12" }],
  ["VacationScheduled with a bad end", { type: "VacationScheduled", start: "2026-10-10", end: "later" }],
];

describe("a bad event from a parent form leaves a state the save can load", () => {
  test.each(bad)("%s", (_name, event) => {
    const state = apply(initialGameState("2026-10-05"), event as GameEvent, at("2026-10-05"));
    expect(gameStateSchema.safeParse(state).success).toBe(true);
  });
});
