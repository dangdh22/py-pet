import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply, type GameEvent } from "./apply";
import { cleanCatalog, freeXu, REWARD_HISTORY_LIMIT, requestBlock } from "./realRewards";
import { initialGameState, type GameState, type RewardItem } from "./state";

const MONDAY = "2026-10-05";
const PARK: RewardItem = { id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 };
const ICE: RewardItem = { id: "ice", name: "Kem", price: 30, weeklyLimit: 2 };

function withRewards(xu: number): GameState {
  const state = initialGameState(MONDAY);
  state.wallet.xu = xu;
  return apply(state, { type: "RewardsEdited", catalog: [PARK, ICE] }, at(MONDAY));
}

const ask = (requestId: string, rewardId: string): GameEvent => ({ type: "RewardRequested", requestId, rewardId });

describe("RewardsEdited", () => {
  test("cleans the parent's list", () => {
    expect(
      cleanCatalog([
        { id: "a", name: "  Kem ", price: 30.7, weeklyLimit: -1 },
        { id: "a", name: "Kem 2", price: 10, weeklyLimit: 1 },
        { id: "b", name: "   ", price: 10, weeklyLimit: 1 },
        { id: "", name: "No id", price: 10, weeklyLimit: 1 },
      ]),
    ).toEqual([{ id: "a", name: "Kem", price: 30, weeklyLimit: 0 }]);
  });
});

describe("RewardRequested", () => {
  test("creates a pending request; no xu is taken yet", () => {
    const state = apply(withRewards(150), ask("q1", "park"), at(MONDAY));
    expect(state.wallet.xu).toBe(150);
    expect(state.rewards.requests).toEqual([
      { id: "q1", rewardId: "park", name: "Đi công viên", price: 100, at: at(MONDAY).toISOString(), status: "pending", decidedAt: null },
    ]);
    expect(freeXu(state)).toBe(50);
  });

  test("needs enough free xu and respects the weekly limit", () => {
    const state = run(withRewards(150), [
      [MONDAY, ask("q1", "park")],
      [MONDAY, ask("q2", "ice")],
      [MONDAY, ask("q3", "ice")],
      [MONDAY, ask("q4", "ice")],
    ]);
    expect(state.rewards.requests.map((r) => r.id)).toEqual(["q1", "q2"]);
    expect(requestBlock(state, ICE, MONDAY)).toBe("xu");
    const richer = { ...state, wallet: { ...state.wallet, xu: 1000 } };
    expect(requestBlock(richer, PARK, MONDAY)).toBe("limit");
    expect(requestBlock(richer, PARK, "2026-10-12")).toBeNull();
  });

  test("an unknown reward or a repeated request id does nothing", () => {
    const state = run(withRewards(500), [
      [MONDAY, ask("q1", "nope")],
      [MONDAY, ask("q2", "ice")],
      [MONDAY, ask("q2", "ice")],
    ]);
    expect(state.rewards.requests.map((r) => r.id)).toEqual(["q2"]);
  });
});

describe("RewardApproved and RewardRejected", () => {
  test("approving takes the xu and records it; rejecting takes nothing", () => {
    const state = run(withRewards(150), [
      [MONDAY, ask("q1", "park")],
      [MONDAY, ask("q2", "ice")],
      ["2026-10-06", { type: "RewardApproved", requestId: "q1" }],
      ["2026-10-06", { type: "RewardRejected", requestId: "q2" }],
      ["2026-10-06", { type: "RewardApproved", requestId: "q2" }],
    ]);
    expect(state.wallet.xu).toBe(50);
    expect(state.wallet.history).toEqual([{ day: "2026-10-06", delta: -100, reason: "reward", ref: "park" }]);
    expect(state.rewards.requests.map((r) => [r.id, r.status])).toEqual([
      ["q1", "approved"],
      ["q2", "rejected"],
    ]);
    expect(state.rewards.requests[0]!.decidedAt).toBe(at("2026-10-06").toISOString());
  });

  test("an approval waits while the child has too few xu", () => {
    const asked = apply(withRewards(100), ask("q1", "park"), at(MONDAY));
    const spent = { ...asked, wallet: { ...asked.wallet, xu: 40 } };
    const state = apply(spent, { type: "RewardApproved", requestId: "q1" }, at(MONDAY));
    expect(state.wallet.xu).toBe(40);
    expect(state.rewards.requests[0]!.status).toBe("pending");
  });

  test("keeps every pending request and the latest decided ones", () => {
    let state = withRewards(100_000);
    state.rewards.catalog = [{ ...ICE, weeklyLimit: 1000 }];
    for (let i = 0; i < REWARD_HISTORY_LIMIT + 3; i += 1) {
      state = apply(state, ask(`q${i}`, "ice"), at(MONDAY));
      state = apply(state, { type: "RewardRejected", requestId: `q${i}` }, at(MONDAY));
    }
    state = apply(state, ask("last", "ice"), at(MONDAY));
    expect(state.rewards.requests).toHaveLength(REWARD_HISTORY_LIMIT + 1);
    expect(state.rewards.requests[0]!.id).toBe("q3");
    expect(state.rewards.requests.at(-1)).toMatchObject({ id: "last", status: "pending" });
  });
});
