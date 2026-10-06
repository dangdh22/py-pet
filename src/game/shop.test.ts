import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { MAX_CONSUMABLES, SHOP_ITEMS, STREAK_GIFTS } from "./shop";
import { initialGameState, type GameState } from "./state";

const DAY = "2026-10-06";
const buy = (itemId: string): GameEvent => ({ type: "ItemBought", itemId });
const use = (itemId: string): GameEvent => ({ type: "ItemUsed", itemId });

function withXu(xu: number): GameState {
  const state = initialGameState(DAY);
  state.wallet.xu = xu;
  return state;
}

describe("shop items", () => {
  test("every item has a unique id; gifts are not sold and are accessories", () => {
    const ids = SHOP_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const gift of Object.values(STREAK_GIFTS)) {
      expect(SHOP_ITEMS.find((item) => item.id === gift)).toMatchObject({ kind: "accessory", price: null });
    }
  });
});

describe("ItemBought", () => {
  test("pays the price, records it and keeps the item", () => {
    const state = apply(withXu(100), buy("pin-sac"), at(DAY));
    expect(state.wallet.xu).toBe(70);
    expect(state.inventory.consumables).toEqual({ "pin-sac": 1 });
    expect(state.wallet.history).toEqual([{ day: DAY, delta: -30, reason: "shop", ref: "pin-sac" }]);
  });

  test("needs enough xu", () => {
    const state = apply(withXu(29), buy("pin-sac"), at(DAY));
    expect(state.wallet.xu).toBe(29);
    expect(state.inventory.consumables).toEqual({});
  });

  test("an accessory or a decoration is bought once; a gift cannot be bought", () => {
    const state = run(withXu(500), [
      [DAY, buy("kinh-ram")],
      [DAY, buy("kinh-ram")],
      [DAY, buy("tranh")],
      [DAY, buy("tranh")],
      [DAY, buy("vuong-mien")],
      [DAY, buy("khong-co")],
    ]);
    expect(state.inventory.owned).toEqual(["kinh-ram", "tranh"]);
    expect(state.wallet.xu).toBe(500 - 60 - 60);
  });

  test("keeps at most 9 of a Pin or Vui item", () => {
    const steps: [string, GameEvent][] = Array.from({ length: MAX_CONSUMABLES + 1 }, () => [DAY, buy("bong")]);
    const state = run(withXu(1000), steps);
    expect(state.inventory.consumables).toEqual({ bong: MAX_CONSUMABLES });
    expect(state.wallet.xu).toBe(1000 - 15 * MAX_CONSUMABLES);
  });
});

describe("ItemUsed", () => {
  test("a Pin item raises Pin up to 5; a Vui item raises Vui", () => {
    const start = withXu(200);
    start.pet.pin = 2;
    start.pet.vui = 1;
    const state = run(start, [
      [DAY, buy("pin-sac")],
      [DAY, buy("pin-sac")],
      [DAY, buy("bong")],
      [DAY, use("pin-sac")],
      [DAY, use("bong")],
    ]);
    expect(state.pet).toMatchObject({ pin: 4, vui: 2 });
    expect(state.inventory.consumables).toEqual({ "pin-sac": 1 });
  });

  test("is not used up when the stat is full or the item is missing", () => {
    const start = withXu(100);
    start.pet.pin = 5;
    const state = run(start, [
      [DAY, buy("dau-nhot")],
      [DAY, use("dau-nhot")],
      [DAY, use("bong")],
    ]);
    expect(state.pet.pin).toBe(5);
    expect(state.inventory.consumables).toEqual({ "dau-nhot": 1 });
  });

  test("puts an accessory on and off, 1 per slot", () => {
    const state = run(withXu(500), [
      [DAY, buy("no-buom")],
      [DAY, buy("khan-quang")],
      [DAY, buy("kinh-ram")],
      [DAY, use("no-buom")],
      [DAY, use("kinh-ram")],
      [DAY, use("khan-quang")],
    ]);
    expect(state.inventory.equipped).toEqual(["kinh-ram", "khan-quang"]);
    const off = apply(state, use("kinh-ram"), at(DAY));
    expect(off.inventory.equipped).toEqual(["khan-quang"]);
    const notOwned = apply(off, use("tai-nghe"), at(DAY));
    expect(notOwned.inventory.equipped).toEqual(["khan-quang"]);
  });
});

describe("streak gifts", () => {
  test("a 3-day streak gives its accessory with the bonus", () => {
    let state = initialGameState("2026-10-05");
    for (const day of ["2026-10-05", "2026-10-06", "2026-10-07"]) {
      state = apply(state, { type: "LessonCompleted", lessonId: `l-${day}` }, at(day));
      state = apply(state, { type: "LessonCompleted", lessonId: `m-${day}` }, at(day));
    }
    expect(state.inventory.owned).toEqual([STREAK_GIFTS[3]]);
  });
});
