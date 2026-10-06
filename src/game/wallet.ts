import { WALLET_HISTORY_LIMIT, type GameState, type XuReason } from "./state";

/** Adds `delta` xu (negative to spend) and records it in the wallet history (spec 5.2). */
export function changeXu(s: GameState, delta: number, reason: XuReason, ref: string | null, day: string): void {
  if (delta === 0) return;
  s.wallet.xu += delta;
  s.wallet.history = [...s.wallet.history, { day, delta, reason, ref }].slice(-WALLET_HISTORY_LIMIT);
}
