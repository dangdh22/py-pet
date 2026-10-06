import { localDay, weekStart } from "./dates";
import type { GameState, RewardItem, RewardRequest } from "./state";

/** Decided requests kept for the history (pending ones are always kept). */
export const REWARD_HISTORY_LIMIT = 100;

export type RequestBlock = "xu" | "limit";

/** Xu still free to ask with: the balance minus the pending requests. */
export function freeXu(state: GameState): number {
  const pending = state.rewards.requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.price, 0);
  return state.wallet.xu - pending;
}

/** Requests of a reward this week (pending or approved), for its weekly limit (spec 5.12). */
export function requestsThisWeek(state: GameState, rewardId: string, today: string): number {
  const start = weekStart(today);
  return state.rewards.requests.filter(
    (r) => r.rewardId === rewardId && r.status !== "rejected" && localDay(new Date(r.at)) >= start,
  ).length;
}

/** Why the child cannot ask for this reward now, or null when they can. */
export function requestBlock(state: GameState, reward: RewardItem, today: string): RequestBlock | null {
  if (freeXu(state) < reward.price) return "xu";
  if (requestsThisWeek(state, reward.id, today) >= reward.weeklyLimit) return "limit";
  return null;
}

/**
 * A clean reward list: trimmed names, whole non-negative numbers, no empty names, no repeated ids; an item whose
 * name is not text or whose numbers are not finite is skipped. A weekly limit of 0 means the reward cannot be asked
 * for now.
 */
export function cleanCatalog(catalog: RewardItem[]): RewardItem[] {
  const seen = new Set<string>();
  const clean: RewardItem[] = [];
  for (const item of catalog) {
    if (typeof item.name !== "string" || !Number.isFinite(item.price) || !Number.isFinite(item.weeklyLimit)) continue;
    const name = item.name.trim();
    if (!item.id || seen.has(item.id) || name === "") continue;
    seen.add(item.id);
    clean.push({
      id: item.id,
      name,
      price: Math.max(0, Math.floor(item.price)),
      weeklyLimit: Math.max(0, Math.floor(item.weeklyLimit)),
    });
  }
  return clean;
}

/** Pending requests, then the latest decided ones. */
export function trimRequests(requests: RewardRequest[]): RewardRequest[] {
  const decided = requests.filter((r) => r.status !== "pending");
  const keep = new Set(decided.slice(-REWARD_HISTORY_LIMIT));
  return requests.filter((r) => r.status === "pending" || keep.has(r));
}
