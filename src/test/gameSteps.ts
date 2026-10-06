import { apply, type GameEvent } from "../game/apply";
import type { GameState } from "../game/state";

/** 10:00 local time on `day` (or another hour). */
export const at = (day: string, hour = 10) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00`);

/** Applies each [day, event] in order. */
export function run(state: GameState, steps: [string, GameEvent][]): GameState {
  return steps.reduce((s, [day, event]) => apply(s, event, at(day)), state);
}
