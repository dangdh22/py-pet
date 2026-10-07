import type { ReactNode } from "react";
import { SHOP_ITEMS } from "../../game/shop";
import { DECOR_COLORS as D } from "./palette";

/*
 * The 5 decorations of the shop (spec 5.12). Each one is drawn once in its own viewBox; the room places that drawing
 * at its fixed spot (design decision 6) and the shop fits the same drawing into a 40 × 40 icon. Two exceptions: the
 * rug lies flat on the floor in the room, so its icon is the same rug seen from higher up; the icon of the night
 * lamp leaves out the bedside table.
 */

interface DecorDrawing {
  w: number;
  h: number;
  art: (lit: boolean) => ReactNode;
  /** A drawing of its own for the 40 × 40 icon; by default the art fitted into the icon. */
  icon?: ReactNode;
}

function Leaf({ angle, length, width }: { angle: number; length: number; width: number }) {
  return (
    <g transform={`rotate(${angle})`}>
      <path d={`M0 0 Q${width} ${-length / 2} 0 ${-length} Q${-width} ${-length / 2} 0 0 Z`} fill={D.leaf} />
      <path d={`M0 0 L0 ${-length * 0.85}`} stroke={D.leafDark} strokeWidth={0.8} strokeLinecap="round" />
    </g>
  );
}

function Plant() {
  return (
    <>
      <g transform="translate(20 34)">
        <Leaf angle={-78} length={17} width={5} />
        <Leaf angle={78} length={17} width={5} />
        <Leaf angle={-48} length={25} width={6.5} />
        <Leaf angle={48} length={25} width={6.5} />
        <Leaf angle={-20} length={30} width={7} />
        <Leaf angle={20} length={30} width={7} />
        <Leaf angle={0} length={33} width={7} />
      </g>
      <path d="M8.5 36 H31.5 L28.5 55 H11.5 Z" fill={D.pot} />
      <rect x={6} y={32} width={28} height={6} rx={2} fill={D.potDark} />
    </>
  );
}

/** The lamp alone, standing on y = 39 between x 8 and 32. */
function LampTop() {
  return (
    <>
      <ellipse cx={20} cy={37} rx={7} ry={2.2} fill={D.lampBase} />
      <rect x={18.8} y={22} width={2.4} height={15} fill={D.lampBase} />
      <path d="M8 24 L13 6 H27 L32 24 Z" fill={D.shade} stroke={D.shadeDark} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M13 6 H27" stroke={D.shadeDark} strokeWidth={1.6} />
    </>
  );
}

function Lamp({ lit }: { lit: boolean }) {
  return (
    <>
      {lit && <circle data-part="lamp-glow" cx={20} cy={16} r={19} fill={D.glow} opacity={0.75} />}
      {/* Bedside table. */}
      <rect x={3} y={38} width={34} height={5} rx={1.5} fill={D.wood} />
      <rect x={6} y={43} width={28} height={15} fill={D.woodDark} />
      <rect x={9} y={46} width={22} height={9} rx={1} fill={D.wood} />
      <circle cx={20} cy={50.5} r={1.3} fill={D.woodDeep} />
      <rect x={7} y={58} width={4} height={6} fill={D.woodDeep} />
      <rect x={29} y={58} width={4} height={6} fill={D.woodDeep} />
      <LampTop />
    </>
  );
}

function Painting() {
  return (
    <>
      <rect x={0} y={0} width={48} height={38} rx={2} fill={D.wood} />
      <rect x={1} y={1} width={46} height={36} rx={1.5} fill="none" stroke={D.woodDark} strokeWidth={1} />
      <rect x={4} y={4} width={40} height={30} fill={D.paintSky} />
      <circle cx={34} cy={12} r={4.5} fill={D.paintSun} />
      <path d="M4 34 L15 17 L22 26 L29 18 L44 34 Z" fill={D.hill} />
      <path d="M4 34 Q16 27 26 30 T44 29 V34 Z" fill={D.hillDark} />
    </>
  );
}

/** An oval rug centred on (cx, cy): rings of colour and a fringe at both ends. */
function Rug({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  const fringe = Array.from({ length: 5 }, (_, i) => (i - 2) * ry * 0.3);
  return (
    <>
      {fringe.flatMap((dy) =>
        [-1, 1].map((side) => {
          const y = cy + dy;
          const x = cx + side * rx * Math.sqrt(1 - (dy / ry) ** 2);
          return (
            <line
              key={`${side}${dy}`}
              x1={x - side * 0.5}
              y1={y}
              x2={x + side * Math.max(2.5, rx * 0.05)}
              y2={y}
              stroke={D.rugFringe}
              strokeWidth={Math.max(0.8, ry * 0.1)}
              strokeLinecap="round"
            />
          );
        }),
      )}
      {D.rug.map((fill, i) => {
        const k = 1 - i * 0.24;
        return <ellipse key={i} cx={cx} cy={cy} rx={rx * k} ry={ry * k} fill={fill} />;
      })}
    </>
  );
}

function Book({ x, bottom, w, h, color, tilt = 0 }: { x: number; bottom: number; w: number; h: number; color: string; tilt?: number }) {
  return (
    <g transform={tilt ? `rotate(${tilt} ${x + w} ${bottom})` : undefined}>
      <rect x={x} y={bottom - h} width={w} height={h} rx={0.6} fill={color} />
      <rect x={x} y={bottom - h + 2.5} width={w} height={1.2} fill="#fff" opacity={0.55} />
    </g>
  );
}

function Bookshelf() {
  const [red, blue, yellow, green, purple, teal] = D.books;
  return (
    <>
      <rect x={0} y={0} width={44} height={70} rx={2} fill={D.wood} />
      <rect x={3} y={3} width={38} height={64} fill={D.woodDeep} />
      <rect x={3} y={23} width={38} height={3} fill={D.wood} />
      <rect x={3} y={45} width={38} height={3} fill={D.wood} />
      {/* Top shelf. */}
      <Book x={5} bottom={23} w={4} h={15} color={red} />
      <Book x={9.5} bottom={23} w={5} h={17} color={blue} />
      <Book x={15} bottom={23} w={3.5} h={13} color={yellow} />
      <Book x={19} bottom={23} w={4.5} h={16} color={green} />
      <Book x={25} bottom={23} w={4} h={14} color={purple} tilt={18} />
      <circle cx={36} cy={18.5} r={4.5} fill={teal} />
      {/* Middle shelf. */}
      <Book x={5} bottom={45} w={5} h={16} color={purple} />
      <Book x={10.5} bottom={45} w={4} h={13} color={teal} />
      <Book x={15} bottom={45} w={4.5} h={17} color={red} />
      <Book x={22} bottom={45} w={4} h={15} color={yellow} />
      <Book x={26.5} bottom={45} w={5} h={16} color={blue} />
      <Book x={32} bottom={45} w={4} h={12} color={green} />
      {/* Bottom shelf. */}
      <Book x={5} bottom={67} w={4.5} h={14} color={green} />
      <Book x={10} bottom={67} w={4} h={17} color={yellow} />
      <Book x={14.5} bottom={67} w={5} h={15} color={red} />
      <Book x={20} bottom={67} w={4} h={13} color={blue} tilt={-14} />
      <Book x={29} bottom={67} w={5} h={16} color={purple} />
      <Book x={34.5} bottom={67} w={4} h={18} color={teal} />
    </>
  );
}

const DRAWINGS: Record<string, DecorDrawing> = {
  "chau-cay": { w: 40, h: 56, art: () => <Plant /> },
  "den-ngu": {
    w: 40,
    h: 64,
    art: (lit) => <Lamp lit={lit} />,
    // At 40 px the table makes the lamp too small: the icon is the lamp alone, lit.
    icon: (
      <g transform="translate(-2 -4.5) scale(1.1)">
        <circle cx={20} cy={18.5} r={13.5} fill={D.glow} />
        <LampTop />
      </g>
    ),
  },
  tranh: { w: 48, h: 38, art: () => <Painting /> },
  tham: {
    w: 120,
    h: 26,
    art: () => <Rug cx={60} cy={13} rx={55} ry={11.5} />,
    icon: <Rug cx={20} cy={20} rx={15} ry={10.5} />,
  },
  "ke-sach": { w: 44, h: 70, art: () => <Bookshelf /> },
};

/** The decoration ids of the shop, in shop order. */
export const DECOR_IDS: readonly string[] = SHOP_ITEMS.filter((item) => item.kind === "decor" && DRAWINGS[item.id]).map(
  (item) => item.id,
);

export function isDecor(id: string): boolean {
  return DECOR_IDS.includes(id);
}

/** A decoration standing in the room; `lit` turns the night lamp on. Null for an id that is not a decoration. */
export function DecorArt({ id, lit = false }: { id: string; lit?: boolean }) {
  const drawing = DRAWINGS[id];
  if (!drawing) return null;
  return (
    <svg
      className={`decor decor-${id}`}
      data-decor={id}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${drawing.w} ${drawing.h}`}
    >
      {drawing.art(lit)}
    </svg>
  );
}

/** The content of a 40 × 40 icon for a decoration (the caller draws the svg); null for any other id. */
export function decorIcon(id: string): ReactNode {
  const drawing = DRAWINGS[id];
  if (!drawing) return null;
  if (drawing.icon) return <g data-decor={id}>{drawing.icon}</g>;
  // Fit the art into the 36 × 36 middle of the icon, centred.
  const scale = 36 / Math.max(drawing.w, drawing.h);
  const x = 20 - (drawing.w * scale) / 2;
  const y = 20 - (drawing.h * scale) / 2;
  return (
    <g data-decor={id} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})`}>
      {drawing.art(false)}
    </g>
  );
}
