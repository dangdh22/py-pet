import type { ReactNode } from "react";
import type { RobotState } from "../../game/look";
import { PALETTE as C } from "./palette";

/** The 5 states of spec 8.3, and the 2 extra faces of the explanation bubble. */
export type RobotMood = RobotState | "sad" | "thinking";

export const ROBOT_MOODS: readonly RobotMood[] = ["happy", "neutral", "sleepy", "drained", "vacation", "sad", "thinking"];

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Faces are drawn in a 30 × 18 box, then scaled into the face screen of the form (same 5:3 shape). */
export const FACE_UNIT = { w: 30, h: 18 } as const;

const line = { fill: "none", stroke: C.eye, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const oval = (x: number, y: number, h: number, fill: string = C.eye) => (
  <rect x={x - 2} y={y - h / 2} width={4} height={h} rx={2} fill={fill} />
);

const FACES: Record<RobotMood, ReactNode> = {
  neutral: (
    <>
      {oval(9.5, 8, 7)}
      {oval(20.5, 8, 7)}
      <path d="M12.5 13.5 q2.5 2.2 5 0" {...line} />
    </>
  ),
  happy: (
    <>
      <path d="M6.5 9 q3 -5.5 6 0 M17.5 9 q3 -5.5 6 0" {...line} strokeWidth={2} />
      <path d="M11 11.5 h8 q-0.4 5 -4 5 q-3.6 0 -4 -5 z" fill={C.eye} />
      <ellipse cx={4.5} cy={12.5} rx={2.2} ry={1.3} fill={C.cheek} opacity={0.85} />
      <ellipse cx={25.5} cy={12.5} rx={2.2} ry={1.3} fill={C.cheek} opacity={0.85} />
    </>
  ),
  sad: (
    <>
      {oval(9.5, 9, 5.5)}
      {oval(20.5, 9, 5.5)}
      <path d="M6.5 5 L11.5 3.4 M23.5 5 L18.5 3.4" {...line} strokeWidth={1.3} />
      <path d="M11.5 15.5 q3.5 -3 7 0" {...line} />
    </>
  ),
  thinking: (
    <>
      {oval(11, 7, 6)}
      {oval(22, 7, 6)}
      <path d="M19 2.3 q3 -1.4 6 0" {...line} strokeWidth={1.3} />
      <path d="M11 14 q1.5 -1.3 3 0 t3 0" {...line} />
    </>
  ),
  // Half-closed eyes and a yawning round mouth.
  sleepy: (
    <>
      <path d="M7 9.2 a2.5 2.1 0 0 0 5 0 z M18 9.2 a2.5 2.1 0 0 0 5 0 z" fill={C.eye} />
      <path d="M5.8 8.2 q3.7 2.4 7.4 0 M16.8 8.2 q3.7 2.4 7.4 0" {...line} strokeWidth={1.4} />
      <ellipse cx={15} cy={13.6} rx={2.3} ry={2.7} fill={C.screenDeep} stroke={C.eye} strokeWidth={1.4} />
    </>
  ),
  // Dim eyes; the empty battery is drawn on the belly or the chest screen.
  drained: (
    <>
      {oval(9.5, 9, 3.5, C.eyeDim)}
      {oval(20.5, 9, 3.5, C.eyeDim)}
      <path d="M12.5 14 h5" {...line} stroke={C.eyeDim} />
    </>
  ),
  // Spec 8.3: on vacation the robot wears sunglasses.
  vacation: (
    <>
      <rect x={4.5} y={4} width={9.5} height={7} rx={2.6} fill={C.sunglasses} />
      <rect x={16} y={4} width={9.5} height={7} rx={2.6} fill={C.sunglasses} />
      <path d="M14 6.5 h2" stroke={C.sunglasses} strokeWidth={1.5} />
      <path d="M6.5 6 l2.5 2.5 M18 6 l2.5 2.5" stroke="#fff" strokeOpacity={0.55} strokeWidth={1} strokeLinecap="round" />
      <path d="M11 13 q4 3.6 8 0" {...line} />
    </>
  ),
};

/** The eyes and mouth of a mood, inside the face screen `box`. */
export function Face({ mood, box }: { mood: RobotMood; box: Box }) {
  const scale = box.w / FACE_UNIT.w;
  return (
    <g data-part="face" data-face={mood} transform={`translate(${box.x} ${box.y}) scale(${scale})`}>
      {FACES[mood]}
    </g>
  );
}

/** A "z" and a bigger "Z" rising from the bottom left corner `(x, y)`. */
export function SleepyZ({ x, y }: { x: number; y: number }) {
  const z = (left: number, top: number, s: number) => `M${left} ${top} h${s} l${-s} ${s} h${s}`;
  return (
    <path
      data-part="zzz"
      d={`${z(x, y - 3.5, 3.5)} ${z(x + 4, y - 11, 5)}`}
      fill="none"
      stroke={C.ink}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** An empty battery centred on `(x, y)`, 11 units wide. */
export function BatteryEmpty({ x, y }: { x: number; y: number }) {
  return (
    <g data-part="battery" transform={`translate(${x - 5.5} ${y - 3})`}>
      <rect x={0} y={0} width={9.5} height={6} rx={1.2} fill={C.screen} stroke={C.light} strokeWidth={1.2} />
      <rect x={9.6} y={1.8} width={1.4} height={2.4} rx={0.4} fill={C.light} />
      <rect x={1.4} y={1.4} width={1.3} height={3.2} rx={0.3} fill={C.light} />
    </g>
  );
}
