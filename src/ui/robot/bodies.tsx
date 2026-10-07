import type { ReactNode } from "react";
import type { RobotForm } from "../../game/look";
import { BatteryEmpty, Face, SleepyZ, type Box, type RobotMood } from "./faces";
import { PALETTE as C } from "./palette";

/*
 * Every form is drawn in the same viewBox 0 0 64 72 with its feet on the floor (y = 70), so Robo stands on the
 * same line whatever the form. Design decision 2: each form keeps the parts of the form before and adds one:
 * 1 capsule (round body and head in one, face screen), 2 newborn + antenna, 3 kid + arms, 4 teen + chest screen
 * and a taller body.
 */
export const VIEW_W = 64;
export const VIEW_H = 72;
export const FLOOR_Y = 70;

/** The face screen of each form, 5:3 like the face unit box. */
export const FACE_BOX: Record<RobotForm, Box> = {
  1: { x: 17, y: 29, w: 30, h: 18 },
  2: { x: 15.5, y: 24, w: 33, h: 19.8 },
  3: { x: 17, y: 21, w: 30, h: 18 },
  4: { x: 18.5, y: 13.5, w: 27, h: 16.2 },
};

/** The outline of the head; for the capsule, the whole body. */
export const HEAD_BOX: Record<RobotForm, Box> = {
  1: { x: 10, y: 22, w: 44, h: 44 },
  2: { x: 9, y: 17, w: 46, h: 33 },
  3: { x: 11, y: 15, w: 42, h: 30 },
  4: { x: 14, y: 9, w: 36, h: 25 },
};

/**
 * The antenna of each form: the top of the light, the head top where it stands, the light radius. The capsule has
 * none; its entry places the gold antenna accessory on top of the capsule.
 */
export const ANTENNA: Record<RobotForm, { top: number; base: number; r: number }> = {
  1: { top: 13, base: 22.5, r: 3.2 },
  2: { top: 8, base: 17, r: 3.5 },
  3: { top: 6, base: 15, r: 3.2 },
  4: { top: 3.2, base: 9, r: 2.7 },
};

/** Where the empty battery shows: the belly, or the chest screen of the teen. */
const BELLY: Record<RobotForm, { x: number; y: number }> = {
  1: { x: 32, y: 57 },
  2: { x: 32, y: 56 },
  3: { x: 32, y: 55 },
  4: { x: 32, y: 46 },
};

/** Bottom left corner of the sleepy "z", beside the head. */
const Z_SPOT: Record<RobotForm, { x: number; y: number }> = {
  1: { x: 50, y: 24 },
  2: { x: 52, y: 17 },
  3: { x: 51, y: 15 },
  4: { x: 50, y: 13 },
};

type ArmPose = "up" | "down" | "rest" | "think";
type Point = readonly [number, number];
/** Shoulder, elbow and hand of the left arm; the right arm is the mirror image. */
const ARMS: Record<3 | 4, Record<ArmPose, readonly [Point, Point, Point]>> = {
  3: {
    down: [[19, 49], [14, 54], [13, 60]],
    rest: [[19, 49], [12, 53], [9, 58]],
    up: [[19, 49], [11, 46], [8, 38]],
    think: [[19, 49], [11, 50], [11.5, 42]],
  },
  4: {
    down: [[18, 39], [13, 46], [12, 53]],
    rest: [[18, 39], [11, 44], [8, 51]],
    up: [[18, 39], [10, 34], [7, 26]],
    think: [[18, 39], [10, 40], [11, 32]],
  },
};

function armPoses(mood: RobotMood): [ArmPose, ArmPose] {
  if (mood === "happy") return ["up", "up"];
  if (mood === "sleepy" || mood === "drained") return ["down", "down"];
  // Thinking: the right hand on the cheek.
  if (mood === "thinking") return ["rest", "think"];
  return ["rest", "rest"];
}

function Arms({ form, mood }: { form: 3 | 4; mood: RobotMood }) {
  const [left, right] = armPoses(mood);
  const arm = (pose: ArmPose, mirror: boolean) => {
    const points = ARMS[form][pose].map(([x, y]) => [mirror ? VIEW_W - x : x, y] as const);
    const hand = points[2] as Point;
    return (
      <g key={mirror ? "right" : "left"}>
        <polyline
          points={points.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={C.bodyDark}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={hand[0]} cy={hand[1]} r={form === 3 ? 3.2 : 3} fill={C.body} stroke={C.joint} strokeWidth={0.8} />
      </g>
    );
  };
  return (
    <g data-part="arms" data-pose={`${left}-${right}`}>
      {arm(left, false)}
      {arm(right, true)}
    </g>
  );
}

function Antenna({ form }: { form: 2 | 3 | 4 }) {
  const { top, base, r } = ANTENNA[form];
  return (
    <g data-part="antenna">
      <line x1={32} y1={base + 1} x2={32} y2={top + r} stroke={C.joint} strokeWidth={2} strokeLinecap="round" />
      <circle cx={32} cy={top} r={r} fill={C.light} />
      <circle cx={32 - r * 0.35} cy={top - r * 0.35} r={r * 0.3} fill="#fff" opacity={0.7} />
    </g>
  );
}

function Head({ form }: { form: 2 | 3 | 4 }) {
  const { x, y, w, h } = HEAD_BOX[form];
  const bolt = form === 4 ? 2.6 : 3;
  return (
    <g data-part="head">
      <circle cx={x} cy={y + h / 2} r={bolt} fill={C.joint} />
      <circle cx={x + w} cy={y + h / 2} r={bolt} fill={C.joint} />
      <rect x={x} y={y} width={w} height={h} rx={form === 4 ? 10 : 13} fill={C.body} />
      <ellipse cx={x + 9} cy={y + 4} rx={4.5} ry={1.8} fill={C.bodyLight} transform={`rotate(-18 ${x + 9} ${y + 4})`} />
    </g>
  );
}

function Screen({ form }: { form: RobotForm }) {
  const { x, y, w, h } = FACE_BOX[form];
  return <rect data-part="face-screen" x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx={6} fill={C.screen} />;
}

function Feet({ left, right, y }: { left: number; right: number; y: number }) {
  const h = FLOOR_Y - y;
  return (
    <g data-part="feet">
      <rect x={left} y={y} width={10} height={h} rx={3.5} fill={C.joint} />
      <rect x={right} y={y} width={10} height={h} rx={3.5} fill={C.joint} />
    </g>
  );
}

export function starPoints(cx: number, cy: number, outer: number): string {
  const inner = outer * 0.45;
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function Star({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <polygon
      data-part="star"
      points={starPoints(x, y, r)}
      fill={C.gold}
      stroke={C.goldDark}
      strokeWidth={0.7}
      strokeLinejoin="round"
    />
  );
}

/** The teen's chest screen: a heartbeat line, the gold star of a graduate, or room for the empty battery. */
function Chest({ mood, graduated }: { mood: RobotMood; graduated: boolean }) {
  const drained = mood === "drained";
  return (
    <g data-part="chest">
      <rect x={21} y={40} width={22} height={12} rx={3} fill={C.screen} stroke={C.joint} strokeWidth={0.8} />
      {graduated && <Star x={drained ? 25.6 : 32} y={46} r={drained ? 3.3 : 4.8} />}
      {!graduated && !drained && (
        <path
          d="M23.5 46 h4.5 l1.8 -3.6 l2.6 7.2 l1.8 -3.6 h5.3"
          fill="none"
          stroke={C.eye}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

function Capsule() {
  return (
    <>
      <Feet left={19} right={35} y={61} />
      <g data-part="body">
        <rect x={10} y={22} width={44} height={44} rx={20} fill={C.bodyDark} />
        {/* The lid of the capsule, down to the seam under the face screen. */}
        <path d="M10 50 V42 A20 20 0 0 1 30 22 H34 A20 20 0 0 1 54 42 V50 Z" fill={C.body} />
        <path d="M10 50 H54" stroke={C.joint} strokeWidth={1} />
        <ellipse cx={20} cy={29} rx={4.5} ry={2} fill={C.bodyLight} transform="rotate(-35 20 29)" />
      </g>
    </>
  );
}

function Newborn() {
  return (
    <>
      <Feet left={20} right={34} y={61} />
      <rect data-part="body" x={19} y={46} width={26} height={17} rx={7} fill={C.bodyDark} />
      <Antenna form={2} />
      <Head form={2} />
    </>
  );
}

function Kid({ mood }: { mood: RobotMood }) {
  return (
    <>
      <Feet left={20} right={34} y={61} />
      <rect data-part="body" x={17} y={43} width={30} height={20} rx={7} fill={C.bodyDark} />
      <Antenna form={3} />
      <Head form={3} />
      <Arms form={3} mood={mood} />
    </>
  );
}

function Teen({ mood, graduated }: { mood: RobotMood; graduated: boolean }) {
  return (
    <>
      <g data-part="legs">
        <rect x={23} y={57} width={6} height={9} fill={C.joint} />
        <rect x={35} y={57} width={6} height={9} fill={C.joint} />
      </g>
      <Feet left={20} right={34} y={64} />
      <rect x={28} y={31} width={8} height={7} fill={C.joint} />
      <rect data-part="body" x={16} y={35} width={32} height={25} rx={7} fill={C.bodyDark} />
      <Chest mood={mood} graduated={graduated} />
      <Antenna form={4} />
      <Head form={4} />
      <Arms form={4} mood={mood} />
    </>
  );
}

/** Accessories drawn in their layer: behind the body, then in front of the neck, on the face, on the head. */
export interface AccessoryLayers {
  back?: ReactNode;
  neck?: ReactNode;
  face?: ReactNode;
  head?: ReactNode;
}

/** Robo of one form in one mood; accessories go between the parts in the order of their layer. */
export function RobotBody({
  form,
  mood,
  graduated,
  layers = {},
}: {
  form: RobotForm;
  mood: RobotMood;
  graduated: boolean;
  layers?: AccessoryLayers;
}) {
  const belly = BELLY[form];
  const z = Z_SPOT[form];
  return (
    <>
      {layers.back}
      {form === 1 && <Capsule />}
      {form === 2 && <Newborn />}
      {form === 3 && <Kid mood={mood} />}
      {form === 4 && <Teen mood={mood} graduated={graduated} />}
      <Screen form={form} />
      <Face mood={mood} box={FACE_BOX[form]} />
      {layers.neck}
      {layers.face}
      {mood === "drained" && <BatteryEmpty x={form === 4 && graduated ? belly.x + 4 : belly.x} y={belly.y} />}
      {mood === "sleepy" && <SleepyZ x={z.x} y={z.y} />}
      {layers.head}
    </>
  );
}
