/** The colours of Robo. Every robot drawing takes its colours from here. */
export const PALETTE = {
  /** Head and the top of the capsule. */
  body: "#9aa8cc",
  /** Torso, arms and the bottom of the capsule. */
  bodyDark: "#7b8bb3",
  /** Shine on the head. */
  bodyLight: "#c3cde6",
  /** Legs, feet, ear bolts and seams. */
  joint: "#5f6f99",
  /** Face and chest screens. */
  screen: "#1d2440",
  /** The inside of a yawning mouth. */
  screenDeep: "#0b1022",
  eye: "#6ff",
  /** Eyes of an empty battery. */
  eyeDim: "#3e4a72",
  /** Antenna light and the empty battery. */
  light: "#ff5c7a",
  cheek: "#ff8fb0",
  gold: "#ffc83d",
  goldDark: "#d99a12",
  sunglasses: "#111",
  /** The sleepy "z", drawn beside the head on any background. */
  ink: "#4b5a8a",
} as const;
