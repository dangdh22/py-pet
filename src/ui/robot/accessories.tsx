import type { ReactNode } from "react";
import type { RobotForm } from "../../game/look";
import { findShopItem, type AccessorySlot } from "../../game/shop";
import { ANTENNA, FACE_BOX, FLOOR_Y, HEAD_BOX, starPoints } from "./bodies";
import { ACCESSORY_COLORS as A, PALETTE as C } from "./palette";

/*
 * Design decision 5: each slot (head, face, neck) has an anchor on each form. Hats, glasses and neckwear are drawn
 * once in a unit box and scaled onto the anchor; the headphones, the cape, the gold antenna and the star pin follow
 * the parts of the form (ears, shoulders, antenna, chest) instead.
 *
 * Anchors, all centred on x:
 * - head: the line where a hat band sits, a little below the top of the head so the hat looks worn; w is the width
 *   of the head on that line. Hats are drawn upward from it in a 40-unit-wide box.
 * - face: the top of the face screen, w its width. Glasses use the 30 × 18 box of the faces, so they sit on the eyes.
 * - neck: the middle of the neckwear, just under the head; w its width (20-unit box). The capsule has no neck:
 *   neckwear sits on the bottom edge of its face screen.
 */
export interface Anchor {
  x: number;
  y: number;
  w: number;
}

const faceAnchor = (form: RobotForm): Anchor => {
  const box = FACE_BOX[form];
  return { x: box.x + box.w / 2, y: box.y, w: box.w };
};

export const ACCESSORY_ANCHORS: Record<RobotForm, Record<AccessorySlot, Anchor>> = {
  1: { head: { x: 32, y: 26.5, w: 30 }, face: faceAnchor(1), neck: { x: 32, y: 50, w: 15 } },
  2: { head: { x: 32, y: 20, w: 36 }, face: faceAnchor(2), neck: { x: 32, y: 53, w: 16 } },
  3: { head: { x: 32, y: 18, w: 33 }, face: faceAnchor(3), neck: { x: 32, y: 48, w: 16 } },
  4: { head: { x: 32, y: 11.5, w: 29 }, face: faceAnchor(4), neck: { x: 32, y: 36.6, w: 14 } },
};

const UNIT_W: Record<AccessorySlot, number> = { head: 40, face: 30, neck: 20 };

/** Places a drawing of the unit box of `slot` onto the anchor of `form`. */
function OnAnchor({ form, slot, children }: { form: RobotForm; slot: AccessorySlot; children: ReactNode }) {
  const { x, y, w } = ACCESSORY_ANCHORS[form][slot];
  const scale = w / UNIT_W[slot];
  // The face box has its origin at the top left corner, the others at the centre of the anchor line.
  const left = slot === "face" ? x - w / 2 : x;
  return <g transform={`translate(${left} ${y}) scale(${scale})`}>{children}</g>;
}

/* ---- Hats, head unit: 40 wide, origin at the middle of the hat band, drawn upward. ---- */

function Cap({ button }: { button: boolean }) {
  return (
    <>
      <path d="M-17 0.5 C-17 -14 17 -14 17 0.5 Z" fill={A.cap} />
      <path d="M0 -10.4 V0.5 M-8.5 -8.6 Q-10.5 -4 -10 0.5 M8.5 -8.6 Q10.5 -4 10 0.5" fill="none" stroke={A.capDark} strokeWidth={0.9} />
      {button && <circle cx={0} cy={-10.6} r={1.6} fill={A.capDark} />}
      {/* The peak, turned a little to the side. */}
      <path d="M-5 -1.5 C8 -4 22 -3.5 28 0.2 C23 3.2 8 3 -5 2.2 Z" fill={A.capDark} />
      <path d="M-17 0.5 H17" stroke={A.capDark} strokeWidth={1.4} />
    </>
  );
}

/** A crown with a gap in the middle, where the antenna light of forms 2 to 4 rises like a jewel. */
function Crown() {
  return (
    <>
      <path
        d="M-14 0.5 V-11 L-9.5 -6 L-5 -14 L0 -5 L5 -14 L9.5 -6 L14 -11 V0.5 Z"
        fill={C.gold}
        stroke={C.goldDark}
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <rect x={-14} y={-3.6} width={28} height={4.1} fill={C.goldDark} />
      {[-14, -5, 5, 14].map((x) => (
        <circle key={x} cx={x} cy={x === -5 || x === 5 ? -14.6 : -11.6} r={1.5} fill={C.gold} stroke={C.goldDark} strokeWidth={0.6} />
      ))}
      <circle cx={-8} cy={-1.55} r={1.3} fill={A.sapphire} />
      <circle cx={0} cy={-1.55} r={1.5} fill={A.ruby} />
      <circle cx={8} cy={-1.55} r={1.3} fill={A.sapphire} />
    </>
  );
}

/* ---- Headphones: a band over the head and a cup on each ear. ---- */

interface PhoneGeometry {
  left: number;
  right: number;
  /** Top of the band. */
  top: number;
  /** Height of the ear cups' middle. */
  ear: number;
  cup: number;
}

function Headphones({ left, right, top, ear, cup }: PhoneGeometry) {
  // A cubic with both control points at c peaks at 0.25 * ear + 0.75 * c.
  const c = (top - 0.25 * ear) / 0.75;
  const cupW = cup * 0.62;
  const cupAt = (x: number) => (
    <g key={x}>
      <rect x={x - cupW / 2} y={ear - cup / 2} width={cupW} height={cup} rx={cupW / 2.2} fill={A.phoneCup} />
      <rect x={x - cupW / 4} y={ear - cup / 3} width={cupW / 2} height={(cup * 2) / 3} rx={cupW / 5} fill={A.phoneCupDark} />
    </g>
  );
  return (
    <>
      <path
        d={`M${left} ${ear - cup / 3} C${left} ${c} ${right} ${c} ${right} ${ear - cup / 3}`}
        fill="none"
        stroke={A.phoneBand}
        strokeWidth={cup * 0.24}
        strokeLinecap="round"
      />
      {cupAt(left)}
      {cupAt(right)}
    </>
  );
}

function headphonesOn(form: RobotForm): PhoneGeometry {
  const head = HEAD_BOX[form];
  const face = FACE_BOX[form];
  return {
    left: head.x,
    right: head.x + head.w,
    top: (form === 1 ? 22 : head.y) - 1.5,
    ear: face.y + face.h / 2,
    cup: form === 4 ? 11 : 12.5,
  };
}

/* ---- Gold antenna: a gold stem and ball over the antenna of the form (or on top of the capsule). ---- */

function GoldAntenna({ top, base, r, x = 32 }: { top: number; base: number; r: number; x?: number }) {
  const ball = r + 0.5;
  return (
    <>
      <line x1={x} y1={base} x2={x} y2={top + ball} stroke={C.goldDark} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={x} cy={top} r={ball} fill={C.gold} stroke={C.goldDark} strokeWidth={0.7} />
      <circle cx={x - ball * 0.35} cy={top - ball * 0.35} r={ball * 0.3} fill="#fff" opacity={0.8} />
      {/* A twinkle beside the ball. */}
      <path
        d={`M${x + ball + 2.2} ${top - ball - 1.2} v3 M${x + ball + 0.7} ${top - ball + 0.3} h3`}
        stroke={C.gold}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </>
  );
}

/* ---- Glasses, face unit: the 30 × 18 box of the faces, eyes at x 9.5 and 20.5, y 8. ---- */

function Sunglasses() {
  return (
    <>
      <path d="M3.5 6 L-3.5 5 M26.5 6 L33.5 5" stroke={A.sunFrame} strokeWidth={1.4} strokeLinecap="round" />
      <rect x={3.2} y={3.2} width={11.3} height={8.8} rx={3.2} fill={C.sunglasses} stroke={A.sunFrame} strokeWidth={1.2} />
      <rect x={15.5} y={3.2} width={11.3} height={8.8} rx={3.2} fill={C.sunglasses} stroke={A.sunFrame} strokeWidth={1.2} />
      <path d="M14.5 6 Q15 5 15.5 6" fill="none" stroke={A.sunFrame} strokeWidth={1.2} />
      <path d="M5.6 5.4 l2.8 2.8 M17.9 5.4 l2.8 2.8" stroke="#fff" strokeOpacity={0.6} strokeWidth={1} strokeLinecap="round" />
    </>
  );
}

function RoundGlasses() {
  return (
    <>
      <path d="M4.9 7 L-3 6 M25.1 7 L33 6" stroke={A.roundFrame} strokeWidth={1.3} strokeLinecap="round" />
      <circle cx={9.5} cy={8} r={4.6} fill="#fff" fillOpacity={0.16} stroke={A.roundFrame} strokeWidth={1.4} />
      <circle cx={20.5} cy={8} r={4.6} fill="#fff" fillOpacity={0.16} stroke={A.roundFrame} strokeWidth={1.4} />
      <path d="M14.1 7.4 Q15 6.2 15.9 7.4" fill="none" stroke={A.roundFrame} strokeWidth={1.3} />
    </>
  );
}

/* ---- Neckwear, neck unit: 20 wide, origin at the middle. ---- */

function BowTie() {
  return (
    <>
      <path d="M-1.5 0 L-9.5 -5 Q-10.8 0 -9.5 5 Z" fill={A.bow} stroke={A.bowDark} strokeWidth={0.8} strokeLinejoin="round" />
      <path d="M1.5 0 L9.5 -5 Q10.8 0 9.5 5 Z" fill={A.bow} stroke={A.bowDark} strokeWidth={0.8} strokeLinejoin="round" />
      <rect x={-2.6} y={-3} width={5.2} height={6} rx={1.6} fill={A.bowDark} />
    </>
  );
}

/** The red scarf: a band round the neck, a knot and two short tails spread apart. */
function Scarf() {
  return (
    <>
      <path d="M-10 -3 Q0 1.5 10 -3 L10 0.5 Q0 5 -10 0.5 Z" fill={A.scarf} stroke={A.scarfDark} strokeWidth={0.7} />
      <path d="M-1.6 2.2 L-8.5 9.5 L-4.2 10.4 Z" fill={A.scarf} stroke={A.scarfDark} strokeWidth={0.7} strokeLinejoin="round" />
      <path d="M1.6 2.2 L8 10.2 L3.6 10.6 Z" fill={A.scarf} stroke={A.scarfDark} strokeWidth={0.7} strokeLinejoin="round" />
      <circle cx={0} cy={2} r={2.6} fill={A.scarf} stroke={A.scarfDark} strokeWidth={0.7} />
    </>
  );
}

function StarPin({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r * 1.12} fill="#fff" stroke={C.goldDark} strokeWidth={r * 0.18} />
      <polygon points={starPoints(x, y, r * 0.95)} fill={C.gold} stroke={C.goldDark} strokeWidth={r * 0.12} strokeLinejoin="round" />
    </>
  );
}

/** Left of the chest, clear of the arms and of the empty battery on the belly. */
const PIN_SPOT: Record<RobotForm, { x: number; y: number; r: number }> = {
  1: { x: 19.5, y: 55.5, r: 3 },
  2: { x: 23.5, y: 55.5, r: 2.7 },
  3: { x: 23.8, y: 49.8, r: 2.7 },
  4: { x: 22.3, y: 38.4, r: 2.4 },
};

/* ---- Cape: hangs from behind the shoulders and flares out to the floor. ---- */

interface CapeGeometry {
  x: number;
  top: number;
  /** Half width at the shoulders and at the hem. */
  shoulder: number;
  hem: number;
  bottom: number;
}

function Cape({ x, top, shoulder, hem, bottom }: CapeGeometry) {
  const outline = `M${x - shoulder} ${top} L${x - hem} ${bottom - 2} Q${x} ${bottom + 2} ${x + hem} ${bottom - 2} L${x + shoulder} ${top} Q${x} ${top - 3} ${x - shoulder} ${top} Z`;
  return (
    <>
      <path d={outline} fill={A.cape} stroke={A.capeDark} strokeWidth={0.8} strokeLinejoin="round" />
      <path
        d={`M${x - shoulder * 0.55} ${top + 4} L${x - hem * 0.62} ${bottom - 1.2} M${x + shoulder * 0.55} ${top + 4} L${x + hem * 0.62} ${bottom - 1.2}`}
        stroke={A.capeDark}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path d={`M${x - hem} ${bottom - 2} Q${x} ${bottom + 2} ${x + hem} ${bottom - 2}`} fill="none" stroke={C.gold} strokeWidth={1.2} />
    </>
  );
}

const CAPE_ON: Record<RobotForm, CapeGeometry> = {
  1: { x: 32, top: 44, shoulder: 19, hem: 27, bottom: FLOOR_Y - 1 },
  2: { x: 32, top: 45, shoulder: 15.5, hem: 24, bottom: FLOOR_Y - 1 },
  3: { x: 32, top: 42, shoulder: 17.5, hem: 25, bottom: FLOOR_Y - 1 },
  4: { x: 32, top: 32.5, shoulder: 19, hem: 26, bottom: FLOOR_Y - 1 },
};

/** The cape alone, seen from the front: a stand-up collar, a gold clasp and a wavy hem flying a little. */
function CapeIcon() {
  return (
    <>
      <path
        d="M14 9 Q8 18 4 34 Q9 31 13 35 Q17 31 21 35 Q25 31 29 35 Q33 31 37 33 Q32 18 26 9 Z"
        fill={A.cape}
        stroke={A.capeDark}
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <path d="M17 13 L11 32 M23 13 L28 32 M20 13 V33" stroke={A.capeDark} strokeWidth={0.9} strokeLinecap="round" />
      <path d="M4 34 Q9 31 13 35 Q17 31 21 35 Q25 31 29 35 Q33 31 37 33" fill="none" stroke={C.gold} strokeWidth={1.3} />
      {/* The collar stands up on both sides of the neck. */}
      <path d="M19 10 L9 3.5 L12.5 12 Z M21 10 L31 3.5 L27.5 12 Z" fill={A.capeDark} strokeLinejoin="round" />
      <circle cx={20} cy={10} r={2.6} fill={C.gold} stroke={C.goldDark} strokeWidth={0.7} />
    </>
  );
}

/* ---- The 10 accessories: on Robo, and alone in a 40 × 40 icon for the shop. ---- */

interface Art {
  robot(form: RobotForm): ReactNode;
  icon: ReactNode;
}

const ARTS: Record<string, Art> = {
  "mu-luoi-trai": {
    robot: (form) => (
      <OnAnchor form={form} slot="head">
        <Cap button={form === 1} />
      </OnAnchor>
    ),
    icon: (
      <g transform="translate(14 26) scale(0.86)">
        <Cap button />
      </g>
    ),
  },
  "vuong-mien": {
    robot: (form) => (
      <OnAnchor form={form} slot="head">
        <Crown />
      </OnAnchor>
    ),
    icon: (
      <g transform="translate(20 29) scale(1.15)">
        <Crown />
      </g>
    ),
  },
  "tai-nghe": {
    robot: (form) => <Headphones {...headphonesOn(form)} />,
    icon: <Headphones left={8} right={32} top={7} ear={25} cup={14} />,
  },
  "ang-ten-vang": {
    robot: (form) => <GoldAntenna {...ANTENNA[form]} />,
    icon: (
      <>
        <rect x={12} y={31} width={16} height={5} rx={2.5} fill={C.goldDark} />
        <GoldAntenna x={19} top={13} base={32} r={5} />
      </>
    ),
  },
  "kinh-ram": {
    robot: (form) => (
      <OnAnchor form={form} slot="face">
        <Sunglasses />
      </OnAnchor>
    ),
    icon: (
      <g transform="translate(2.75 11) scale(1.15)">
        <Sunglasses />
      </g>
    ),
  },
  "kinh-tron": {
    robot: (form) => (
      <OnAnchor form={form} slot="face">
        <RoundGlasses />
      </OnAnchor>
    ),
    icon: (
      <g transform="translate(2.75 10.5) scale(1.15)">
        <RoundGlasses />
      </g>
    ),
  },
  "no-buom": {
    robot: (form) => (
      <OnAnchor form={form} slot="neck">
        <BowTie />
      </OnAnchor>
    ),
    icon: (
      <g transform="translate(20 20) scale(1.75)">
        <BowTie />
      </g>
    ),
  },
  "khan-quang": {
    robot: (form) => (
      <OnAnchor form={form} slot="neck">
        <Scarf />
      </OnAnchor>
    ),
    icon: (
      <g transform="translate(20 12.5) scale(1.6)">
        <Scarf />
      </g>
    ),
  },
  "ghim-sao": {
    robot: (form) => <StarPin {...PIN_SPOT[form]} />,
    icon: <StarPin x={20} y={20} r={14} />,
  },
  "ao-choang": {
    robot: (form) => <Cape {...CAPE_ON[form]} />,
    icon: <CapeIcon />,
  },
};

/** One accessory on Robo of `form`, in the coordinates of the robot drawing; null for an unknown id. */
export function AccessoryArt({ id, form }: { id: string; form: RobotForm }) {
  const art = ARTS[id];
  const slot = findShopItem(id)?.slot;
  if (!art || !slot) return null;
  return (
    <g data-accessory={id} data-slot={slot}>
      {art.robot(form)}
    </g>
  );
}

/** The picture of a shop item, 40 × 40, beside its name; null when the item has no picture yet. */
export function ItemIcon({ id, size = 40 }: { id: string; size?: number }) {
  const art = ARTS[id];
  if (!art) return null;
  return (
    <svg className="item-icon" aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 40 40">
      <g data-accessory={id}>{art.icon}</g>
    </svg>
  );
}
