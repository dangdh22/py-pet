import { describe, expect, test } from "vitest";
import { testBundle } from "../test/fixtures";
import { FORM_COUNT, formOf, robotLook, robotPixelSize, type RobotForm } from "./look";
import { growthSize, stageXpMax } from "./progress";
import { initialGameState } from "./state";

const TODAY = "2026-10-06";
const bundle = testBundle();
const FORMS: RobotForm[] = [1, 2, 3, 4];

describe("formOf", () => {
  test("clamps the stage to 1..FORM_COUNT", () => {
    expect(FORM_COUNT).toBe(4);
    expect([0, -3, 1, 2, 3, 4, 5, 9].map(formOf)).toEqual([1, 1, 1, 2, 3, 4, 4, 4]);
  });
});

describe("robotPixelSize", () => {
  test("matches the table of design decision 3", () => {
    const table = FORMS.map((form) => ([1, 2, 3] as const).map((size) => robotPixelSize(form, size)));
    expect(table).toEqual([
      [96, 104, 112],
      [120, 128, 136],
      [144, 152, 160],
      [168, 176, 184],
    ]);
  });

  test("the robot never shrinks: the smallest of the next form is bigger than the largest of the previous one", () => {
    for (const form of [1, 2, 3] as const) {
      expect(robotPixelSize(form, 3)).toBeLessThan(robotPixelSize((form + 1) as RobotForm, 1));
    }
  });
});

describe("robotLook", () => {
  test("a new robot is a happy, small capsule with nothing worn", () => {
    expect(robotLook(bundle, initialGameState(TODAY), TODAY)).toEqual({
      form: 1,
      graduated: false,
      size: 1,
      state: "happy",
      equipped: [],
    });
  });

  test("passing the stage 4 check keeps the 4th form and marks it graduated", () => {
    const state = initialGameState(TODAY);
    state.pet.stage = 5;
    expect(robotLook(bundle, state, TODAY)).toMatchObject({ form: 4, graduated: true });
    state.pet.stage = 4;
    expect(robotLook(bundle, state, TODAY)).toMatchObject({ form: 4, graduated: false });
  });

  test("a graduated robot is fully grown: it is not smaller than before the last check", () => {
    const state = initialGameState(TODAY);
    state.pet.stage = 4;
    state.pet.xp = 1000;
    state.pet.stageStartXp = 0;
    const before = robotLook(bundle, state, TODAY);
    expect(before.size).toBe(3);
    // Passing the check sets stage 5 and starts a new count of the stage XP (apply.ts).
    state.pet.stage = 5;
    state.pet.stageStartXp = state.pet.xp;
    const after = robotLook(bundle, state, TODAY);
    expect(after).toMatchObject({ form: 4, graduated: true, size: 3 });
    expect(robotPixelSize(after.form, after.size)).toBeGreaterThanOrEqual(184);
    expect(robotPixelSize(after.form, after.size)).toBeGreaterThanOrEqual(robotPixelSize(before.form, before.size));
  });

  test("maps the room condition to the 5 states, vacation first, then an empty battery", () => {
    const state = initialGameState(TODAY);
    state.pet.pin = 3;
    state.pet.vui = 3;
    expect(robotLook(bundle, state, TODAY).state).toBe("neutral");
    state.pet.pin = 2;
    expect(robotLook(bundle, state, TODAY).state).toBe("sleepy");
    state.pet.pin = 0;
    expect(robotLook(bundle, state, TODAY).state).toBe("drained");
    state.vacation.since = TODAY;
    expect(robotLook(bundle, state, TODAY).state).toBe("vacation");
  });

  test("Vui counts like Pin: 0 is drained, 2 or less sleepy, and happy needs both at 4 or more", () => {
    const stateWith = (pin: number, vui: number) => {
      const state = initialGameState(TODAY);
      state.pet.pin = pin;
      state.pet.vui = vui;
      return robotLook(bundle, state, TODAY).state;
    };
    expect(stateWith(5, 0)).toBe("drained");
    expect(stateWith(5, 2)).toBe("sleepy");
    expect(stateWith(5, 1)).toBe("sleepy");
    expect(stateWith(5, 3)).toBe("neutral");
    expect(stateWith(5, 4)).toBe("happy");
    expect(stateWith(4, 5)).toBe("happy");
    expect(stateWith(3, 5)).toBe("neutral");
    expect(stateWith(0, 5)).toBe("drained");
  });

  test("the size follows the XP of the stage", () => {
    const state = initialGameState(TODAY);
    const max = stageXpMax(bundle.stages[0]!);
    state.pet.xp = Math.ceil(max / 2);
    expect(robotLook(bundle, state, TODAY).size).toBe(growthSize(state.pet.xp, max));
    state.pet.xp = max;
    expect(robotLook(bundle, state, TODAY).size).toBe(3);
  });

  test("equipped follows head, face, neck and drops unknown ids", () => {
    const state = initialGameState(TODAY);
    state.inventory.equipped = ["no-buom", "khong-co", "tai-nghe", "kinh-ram"];
    expect(robotLook(bundle, state, TODAY).equipped).toEqual(["tai-nghe", "kinh-ram", "no-buom"]);
  });

  test("right after an evolution the robot is bigger than the largest size of the form before", () => {
    const before = initialGameState(TODAY);
    before.pet.xp = stageXpMax(bundle.stages[0]!);
    const largest = robotLook(bundle, before, TODAY);
    expect(largest).toMatchObject({ form: 1, size: 3 });

    const after = initialGameState(TODAY);
    after.pet.stage = 2;
    after.pet.xp = before.pet.xp;
    after.pet.stageStartXp = after.pet.xp;
    const look = robotLook(bundle, after, TODAY);
    expect(look).toMatchObject({ form: 2, size: 1 });
    expect(robotPixelSize(look.form, look.size)).toBeGreaterThan(robotPixelSize(largest.form, largest.size));
  });
});
