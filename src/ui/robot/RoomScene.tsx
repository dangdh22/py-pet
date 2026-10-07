import type { CSSProperties, ReactNode } from "react";
import type { RobotForm, RobotLook } from "../../game/look";
import { Robot } from "../Robot";
import { DecorArt, DECOR_IDS } from "./decor";
import { PALETTE as C, SCENE_COLORS as S } from "./palette";

/*
 * Spec 8.3 and design decisions 4 and 6: Robo in the room (wall, floor, window, decorations at fixed spots) or, on
 * vacation, on the beach without decorations. Sleepy and drained make the room darker with night in the window; a
 * drained Robo lies on its side beside the charger. Walls, floor, sky and sand are CSS backgrounds (styles.css);
 * the drawings here are aria-hidden, Robo keeps its role="img".
 */

/** Left edge of the body of each form in drained pose (viewBox units): the side Robo lies on. */
const LYING_SIDE: Record<RobotForm, number> = { 1: 10, 2: 6, 3: 8, 4: 9 };

/**
 * A drained Robo turns a quarter left, head toward the charger. The rotation is on a wrapper (never on the svg), and
 * it is moved down so its side rests on the line where the feet of a standing Robo would be.
 */
function lyingStyle(form: RobotForm, size: number): CSSProperties {
  const height = (size * 72) / 64;
  return {
    "--lie-drop": `${((size * (2 + LYING_SIDE[form])) / 64).toFixed(1)}px`,
    // The turned robot is as wide as it was tall.
    "--lie-side": `${((height - size) / 2).toFixed(1)}px`,
  } as CSSProperties;
}

function RoomWindow({ night }: { night: boolean }) {
  return (
    <svg className="scene-window" data-part="window" aria-hidden="true" focusable="false" viewBox="0 0 64 54">
      <rect x={8} y={5} width={48} height={40} fill={night ? S.skyNight : S.skyDay} />
      {night ? (
        <>
          <circle cx={42} cy={16} r={6} fill={S.moon} />
          <circle cx={45} cy={14} r={5.2} fill={S.skyNight} />
          {[
            [16, 12],
            [24, 22],
            [14, 34],
            [48, 34],
            [36, 30],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill={S.star} />
          ))}
        </>
      ) : (
        <>
          <ellipse cx={22} cy={18} rx={7} ry={3.2} fill={S.cloud} />
          <ellipse cx={26} cy={15.5} rx={4.5} ry={3.2} fill={S.cloud} />
          <ellipse cx={44} cy={33} rx={6} ry={2.6} fill={S.cloud} opacity={0.9} />
        </>
      )}
      <rect x={8} y={5} width={48} height={40} fill="none" stroke={S.frame} strokeWidth={3} />
      <path d="M32 5 V45 M8 25 H56" stroke={S.frame} strokeWidth={2.4} />
      <rect x={4} y={44} width={56} height={4} rx={1} fill={S.frame} />
      <rect x={6} y={48} width={52} height={1.6} fill={S.frameShade} />
      {/* Curtains, tied back on both sides. */}
      <path d="M2 2 H14 Q12 14 15 26 Q9 32 11 50 H2 Z" fill={S.curtain} />
      <path d="M62 2 H50 Q52 14 49 26 Q55 32 53 50 H62 Z" fill={S.curtain} />
      <path d="M6 4 Q5 26 7 48 M58 4 Q59 26 57 48" stroke={S.curtainDark} strokeWidth={1} fill="none" />
      <rect x={0} y={0} width={64} height={3} rx={1.5} fill={S.pole} />
    </svg>
  );
}

function Charger() {
  return (
    <svg className="scene-charger" data-part="charger" aria-hidden="true" focusable="false" viewBox="0 0 44 60">
      <rect x={6} y={12} width={22} height={44} rx={5} fill={S.charger} stroke={S.chargerEdge} strokeWidth={1.5} />
      <rect x={10} y={17} width={14} height={18} rx={2.5} fill={C.screen} />
      <path d="M18.5 19.5 L13 27.5 H17 L15.5 33 L21 25 H17 Z" fill={S.bolt} strokeLinejoin="round" />
      <circle cx={17} cy={42} r={2} fill={C.light} />
      <rect x={2} y={54} width={30} height={6} rx={2} fill={S.chargerEdge} />
      {/* The cable runs along the floor to Robo's head. */}
      <path d="M28 46 C36 46 34 57 44 57" fill="none" stroke={S.cable} strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}

function Sun() {
  return (
    <svg className="scene-sun" aria-hidden="true" focusable="false" viewBox="0 0 40 40">
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d="M20 2 L22 8 H18 Z"
          fill={S.sunRay}
          transform={`rotate(${i * 30} 20 20)`}
        />
      ))}
      <circle cx={20} cy={20} r={10} fill={S.sun} />
    </svg>
  );
}

function Umbrella() {
  return (
    <svg className="scene-umbrella" aria-hidden="true" focusable="false" viewBox="0 0 60 80">
      <path d="M30 8 L34 79" stroke={S.pole} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M2 26 Q4 4 30 4 Q56 4 58 26 Q51 21 44 26 Q37 21 30 26 Q23 21 16 26 Q9 21 2 26 Z" fill={S.umbrella} />
      <path d="M30 4 Q20 6 16 26 Q23 21 30 26 Z" fill={S.umbrellaLight} />
      <path d="M30 4 Q50 6 58 26 Q51 21 44 26 Q42 12 30 4 Z" fill={S.umbrellaLight} />
      <circle cx={30} cy={4} r={2} fill={S.pole} />
    </svg>
  );
}

function Ball() {
  const [red, white, blue, yellow] = S.ball;
  return (
    <svg className="scene-ball" aria-hidden="true" focusable="false" viewBox="0 0 20 20">
      <circle cx={10} cy={10} r={9} fill={white} />
      <path d="M10 1 A9 9 0 0 1 19 10 Q13 9 10 1 Z" fill={red} />
      <path d="M19 10 A9 9 0 0 1 6 18.1 Q12 15 19 10 Z" fill={blue} />
      <path d="M6 18.1 A9 9 0 0 1 2.2 5.5 Q7 11 6 18.1 Z" fill={yellow} />
      <circle cx={10} cy={10} r={9} fill="none" stroke={C.ink} strokeWidth={0.6} opacity={0.4} />
    </svg>
  );
}

/** White foam where the sea meets the sand, stretched across the scene. */
function Foam() {
  const d = Array.from({ length: 10 }, (_, i) => `Q${i * 10 + 5} 0 ${i * 10 + 10} 5`).join(" ");
  return (
    <svg className="scene-foam" aria-hidden="true" focusable="false" viewBox="0 0 100 10" preserveAspectRatio="none">
      <path d={`M0 5 ${d} V10 H0 Z`} fill={S.foam} opacity={0.85} />
    </svg>
  );
}

export interface RoomSceneProps {
  look: RobotLook;
  /** Ids of the decorations the child owns; ids that are not decorations are left out. */
  decor: string[];
  robotSize: number;
  /** Robo's words, shown in a speech bubble pointing at Robo. */
  children?: ReactNode;
}

export function RoomScene({ look, decor, robotSize, children }: RoomSceneProps) {
  const { state } = look;
  const where = state === "vacation" ? "beach" : "room";
  const dark = state === "sleepy" || state === "drained";
  const shown = where === "beach" ? [] : DECOR_IDS.filter((id) => decor.includes(id));
  return (
    <div className={`room-scene scene-${where}`} data-scene={where} data-condition={state}>
      <div className={dark ? "scene-inner scene-dark" : "scene-inner"}>
        {where === "room" ? (
          <>
            <RoomWindow night={dark} />
            {shown.map((id) => (
              <DecorArt key={id} id={id} lit={dark} />
            ))}
          </>
        ) : (
          <>
            <Sun />
            <Foam />
            <Umbrella />
            <Ball />
          </>
        )}
        {children && <div className="scene-bubble">{children}</div>}
        <div className="scene-stage">
          {state === "drained" && <Charger />}
          <div
            className={`robot-pose robot-pose-${state}`}
            style={state === "drained" ? lyingStyle(look.form, robotSize) : undefined}
          >
            <Robot
              mood={state}
              size={robotSize}
              form={look.form}
              graduated={look.graduated}
              equipped={look.equipped}
            />
            {state === "sleepy" &&
              [0, 1, 2].map((i) => (
                <span key={i} className="scene-z" aria-hidden="true">
                  Z
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
