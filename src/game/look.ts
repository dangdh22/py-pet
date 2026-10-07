import type { ContentBundle } from "../content/types";
import {
  currentStage,
  growthSize,
  roomCondition,
  stageXp,
  stageXpMax,
  type GrowthSize,
} from "./progress";
import { SHOP_ITEMS, type AccessorySlot } from "./shop";
import type { GameState } from "./state";

/** The robot forms of the achievement book (spec 8.4), 1 per stage. */
export const FORM_COUNT = 4;

export type RobotForm = 1 | 2 | 3 | 4;
/** The 5 states of spec 8.3; "sad" and "thinking" are only extra faces of the explanation bubble. */
export type RobotState = "happy" | "neutral" | "sleepy" | "drained" | "vacation";

export interface RobotLook {
  form: RobotForm;
  /** pet.stage > FORM_COUNT: the child passed the check of the last stage. */
  graduated: boolean;
  size: GrowthSize;
  state: RobotState;
  /** Ids of the accessories worn, in the order head, face, neck; ids not in SHOP_ITEMS are dropped. */
  equipped: string[];
}

const SLOT_ORDER: readonly AccessorySlot[] = ["head", "face", "neck"];

/** Design decision 1: the form is the stage, and stays the last form after the last check. */
export function formOf(stage: number): RobotForm {
  return Math.min(FORM_COUNT, Math.max(1, Math.trunc(stage))) as RobotForm;
}

/** Design decision 3: grows with (form, size), so a robot never shrinks after an evolution. */
export function robotPixelSize(form: RobotForm, size: GrowthSize): number {
  return 96 + 24 * (form - 1) + 8 * (size - 1);
}

export function robotLook(bundle: ContentBundle, state: GameState, today: string): RobotLook {
  const stage = currentStage(bundle, state);
  const condition = roomCondition(state, today);
  const graduated = state.pet.stage > FORM_COUNT;
  const equipped = SLOT_ORDER.flatMap((slot) =>
    state.inventory.equipped.filter((id) => SHOP_ITEMS.some((item) => item.id === id && item.slot === slot)),
  );
  return {
    form: formOf(state.pet.stage),
    graduated,
    // A graduate is fully grown: stageXp starts again at 0 after the last check, which must not shrink Robo.
    size: graduated ? 3 : growthSize(stageXp(state), stage ? stageXpMax(stage) : 0),
    state: condition === "normal" ? "neutral" : condition,
    equipped,
  };
}
