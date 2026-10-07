import type { RobotForm } from "../game/look";
import { RobotBody, VIEW_H, VIEW_W } from "./robot/bodies";
import type { RobotMood } from "./robot/faces";

export type { RobotMood } from "./robot/faces";

export interface RobotProps {
  mood?: RobotMood;
  /** Width in pixels; the height keeps the 64:72 shape of the drawing. */
  size?: number;
  form?: RobotForm;
  /** Design decision 1: passed the check of the last stage, a gold star on the chest screen. */
  graduated?: boolean;
  /** Accessory ids, drawn from Task 3 on. */
  equipped?: string[];
}

export function Robot({ mood = "neutral", size = 56, form = 1, graduated = false }: RobotProps) {
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
      <RobotBody form={form} mood={mood} graduated={graduated} />
    </svg>
  );
}
