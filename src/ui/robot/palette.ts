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

/** The decorations of the room (Task 4), each easy to tell apart at 40 px. */
export const DECOR_COLORS = {
  /** Wood of the shelf, the picture frame and the bedside table. */
  wood: "#b47a48",
  woodDark: "#8a5630",
  woodDeep: "#5e3a1f",
  pot: "#d9734a",
  potDark: "#b4532c",
  leaf: "#43a852",
  leafDark: "#2c7a38",
  /** Lamp shade and its light. */
  shade: "#ffd166",
  shadeDark: "#e2a93a",
  glow: "#fff1b8",
  lampBase: "#6b5b8f",
  /** The painting: sky, sun, hills. */
  paintSky: "#a8dcff",
  paintSun: "#ffcf3d",
  hill: "#5aa469",
  hillDark: "#3f8a52",
  /** Rings of the rug, from the edge to the middle. */
  rug: ["#e4656b", "#f6c26b", "#5fa8d8", "#f6c26b"],
  rugFringe: "#c94e55",
  /** Book spines. */
  books: ["#e5533d", "#3b82f6", "#f2c14e", "#43a852", "#8e6bd8", "#2ab3a6"],
} as const;

/** The room and the beach around Robo (Task 4). Walls, floor, sky and sand are CSS variables in styles.css. */
export const SCENE_COLORS = {
  frame: "#ffffff",
  frameShade: "#cdd6ea",
  skyDay: "#9fd8ff",
  skyNight: "#26305e",
  cloud: "#ffffff",
  moon: "#fff3b0",
  star: "#ffe680",
  curtain: "#f39bb6",
  curtainDark: "#d9789a",
  /** The charging station of a drained Robo. */
  charger: "#e9edf6",
  chargerEdge: "#7b8bb3",
  cable: "#3b4466",
  bolt: "#ffc83d",
  sun: "#ffcf3d",
  sunRay: "#ffe27a",
  foam: "#ffffff",
  umbrella: "#ef5a5a",
  umbrellaLight: "#ffffff",
  pole: "#8a5630",
  ball: ["#ef5a5a", "#ffffff", "#3b82f6", "#ffd166"],
} as const;
