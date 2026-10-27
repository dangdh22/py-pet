/** The icon set (UI revamp spec 5.4): 18 x 18 frame, 2 px square strokes, sharp corners. */
const PATHS = {
  home: "M2 9 L9 2 L16 9 M4 7.5 V16 H14 V7.5",
  map: "M1 4 L6 2 L12 4 L17 2 V14 L12 16 L6 14 L1 16 Z M6 2 V14 M12 4 V16",
  shop: "M2 6 H16 V16 H2 Z M6 6 V3 H12 V6",
  trophy: "M4 2 H14 V7 L9 10 L4 7 Z M9 10 V14 M5 16 H13",
  save: "M2 2 H14 L16 4 V16 H2 Z M5 2 V7 H12 V2 M5 16 V11 H13 V16",
  help: "M2 2 H16 V16 H2 Z M7 7 Q7 4.5 9 4.5 Q11 4.5 11 6.5 Q11 8 9 9 V11 M9 13 V14",
  lock: "M3 8 H15 V16 H3 Z M6 8 V4 H12 V8",
  back: "M10 3 L4 9 L10 15 M4 9 H16",
  next: "M8 3 L14 9 L8 15 M14 9 H2",
  play: "M5 3 L14 9 L5 15 Z",
  check: "M3 9 L7 13 L15 5",
  cross: "M4 4 L14 14 M14 4 L4 14",
  chart: "M2 16 H16 M4 16 V9 M8 16 V4 M12 16 V11",
  alert: "M9 2 L16 15 H2 Z M9 7 V11 M9 13 V14",
  list: "M2 3 H16 M2 9 H12 M2 15 H8",
  gift: "M2 7 H16 V10 H2 Z M3 10 V16 H15 V10 M9 7 V16 M9 7 L6 3 M9 7 L12 3",
  sliders: "M2 5 H16 M2 13 H16 M6 3 V7 M12 11 V15",
  flame: "M9 1 L14 8 L12 16 L6 16 L4 8 L7 10 Z",
  coin: "M9 2 L16 9 L9 16 L2 9 Z",
} as const;

export type IconName = keyof typeof PATHS;

/** The 2 icons drawn filled; the chips color them. */
const SOLID: ReadonlySet<IconName> = new Set<IconName>(["flame", "coin"]);

/** A decorative icon: it is hidden from assistive technology, so the text next to it names the control. */
export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const classes = ["icon", SOLID.has(name) ? "icon-solid" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <svg
      className={classes}
      data-icon={name}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
