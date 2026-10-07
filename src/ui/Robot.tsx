import type { ReactElement } from "react";
import type { RobotForm } from "../game/look";
import { findShopItem } from "../game/shop";
import { AccessoryArt } from "./robot/accessories";
import { RobotBody, VIEW_H, VIEW_W, type AccessoryLayers } from "./robot/bodies";
import type { RobotMood } from "./robot/faces";

export type { RobotMood } from "./robot/faces";

export interface RobotProps {
  mood?: RobotMood;
  /** Width in pixels; the height keeps the 64:72 shape of the drawing. */
  size?: number;
  form?: RobotForm;
  /** Design decision 1: passed the check of the last stage, a gold star on the chest screen. */
  graduated?: boolean;
  /** Accessory ids; ids that are not accessories are ignored. */
  equipped?: string[];
}

/** Design decision 5: the cape hangs behind the body; on vacation the sunglasses of the state replace the face slot. */
function accessoryLayers(form: RobotForm, mood: RobotMood, equipped: string[]): AccessoryLayers {
  const layers: Required<Record<keyof AccessoryLayers, ReactElement[]>> = { back: [], neck: [], face: [], head: [] };
  for (const id of equipped) {
    const slot = findShopItem(id)?.slot;
    if (!slot || (slot === "face" && mood === "vacation")) continue;
    const layer = id === "ao-choang" ? "back" : slot;
    layers[layer].push(<AccessoryArt key={id} id={id} form={form} />);
  }
  return layers;
}

export function Robot({ mood = "neutral", size = 56, form = 1, graduated = false, equipped = [] }: RobotProps) {
  return (
    <svg
      role="img"
      aria-label="Robo"
      data-mood={mood}
      data-form={form}
      data-size={size}
      width={size}
      height={Math.round((size * VIEW_H) / VIEW_W)}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
    >
      <RobotBody form={form} mood={mood} graduated={graduated} layers={accessoryLayers(form, mood, equipped)} />
    </svg>
  );
}
