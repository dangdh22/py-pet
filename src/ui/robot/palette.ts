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

/** The colours of the accessories (Task 3), each one easy to tell apart at 40 px. */
export const ACCESSORY_COLORS = {
  /** Baseball cap. */
  cap: "#3b82f6",
  capDark: "#1f5fc7",
  /** Bow tie. */
  bow: "#f0508c",
  bowDark: "#c22f68",
  /** The red scarf of the young pioneers. */
  scarf: "#e53935",
  scarfDark: "#a81f1c",
  /** Cape: royal purple with a darker lining. */
  cape: "#7b4fd6",
  capeDark: "#5632a6",
  /** Headphones: dark band, orange ear cups. */
  phoneBand: "#2b3040",
  phoneCup: "#ff8a3d",
  phoneCupDark: "#d9661c",
  /** Frame of the sunglasses and of the round glasses. */
  sunFrame: "#e23b5a",
  roundFrame: "#e2863a",
  /** Jewels of the crown. */
  ruby: "#e53950",
  sapphire: "#3fa9f5",
} as const;
