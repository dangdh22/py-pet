import { gameStateSchema } from "./schema";
import { GAME_STATE_VERSION, type GameState } from "./state";

export type StateProblem = "newer-version" | "damaged";

export class StateFormatError extends Error {
  constructor(
    readonly problem: StateProblem,
    message: string,
  ) {
    super(message);
    this.name = "StateFormatError";
  }
}

type RawState = Record<string, unknown>;

function isRecord(value: unknown): value is RawState {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** version N -> a pure function that turns a version N state into a version N+1 state. */
const STEPS: Record<number, (state: RawState) => RawState> = {
  1: (state) => ({
    ...state,
    version: 2,
    mastery: {},
    reviews: {},
    retry: {},
    progress: { ...(isRecord(state.progress) ? state.progress : {}), completedReviews: [] },
  }),
  2: (state) => ({
    ...state,
    version: 3,
    pet: { ...(isRecord(state.pet) ? state.pet : {}), stageStartXp: 0 },
    remedial: null,
    progress: { ...(isRecord(state.progress) ? state.progress : {}), topicTests: {}, evolutionTests: [] },
  }),
};

/** Brings a saved state up to GAME_STATE_VERSION and checks its shape. Throws StateFormatError. */
export function upgradeGameState(raw: unknown): GameState {
  if (!isRecord(raw) || typeof raw.version !== "number" || !Number.isInteger(raw.version) || raw.version < 1) {
    throw new StateFormatError("damaged", "The saved game has no valid version");
  }
  if (raw.version > GAME_STATE_VERSION) {
    throw new StateFormatError("newer-version", `Version ${raw.version} is newer than ${GAME_STATE_VERSION}`);
  }
  let current = raw;
  for (let version = raw.version; version < GAME_STATE_VERSION; version += 1) {
    const step = STEPS[version];
    if (!step) throw new StateFormatError("damaged", `Missing migration from version ${version}`);
    current = step(current);
  }
  const parsed = gameStateSchema.safeParse(current);
  if (!parsed.success) {
    const where = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new StateFormatError("damaged", where.join("; "));
  }
  return parsed.data;
}
