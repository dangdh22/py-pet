import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply } from "./apply";
import { emptyMastery, recordResult } from "./mastery";
import { isPass } from "./rewards";
import { cleanSettings } from "./settings";
import { DEFAULT_SETTINGS, initialGameState } from "./state";

describe("cleanSettings", () => {
  test("keeps numbers whole and inside their limits", () => {
    expect(
      cleanSettings(DEFAULT_SETTINGS, { dailyGoal: 0, weeklyTarget: 99, graceDays: 2.6, passPercent: 40, runSeconds: 3 }),
    ).toEqual({ ...DEFAULT_SETTINGS, dailyGoal: 1, weeklyTarget: 50, graceDays: 3, passPercent: 50, runSeconds: 3 });
  });

  test("a value that is not a number or not a language keeps the old one", () => {
    const bad = { helpPercent: Number.NaN, uiLang: "fr", questionLang: "de" } as unknown as Parameters<typeof cleanSettings>[1];
    expect(cleanSettings(DEFAULT_SETTINGS, bad)).toEqual(DEFAULT_SETTINGS);
  });

  test("null, an empty string or a boolean keeps the old number", () => {
    const current = { ...DEFAULT_SETTINGS, passPercent: 80, dailyGoal: 4, runSeconds: 5 };
    const bad = { passPercent: null, dailyGoal: "", runSeconds: false } as unknown as Parameters<typeof cleanSettings>[1];
    expect(cleanSettings(current, bad)).toEqual(current);
  });

  test("SettingsChanged uses it", () => {
    const state = apply(initialGameState("2026-10-06"), { type: "SettingsChanged", patch: { passPercent: 120 } }, at("2026-10-06"));
    expect(state.settings.passPercent).toBe(100);
  });
});

describe("the parent's numbers take effect", () => {
  test("the pass mark of the tests", () => {
    expect(isPass(18, 24)).toBe(false);
    expect(isPass(18, 24, 75)).toBe(true);
    const start = initialGameState("2026-10-06");
    start.settings.passPercent = 70;
    const state = run(start, [["2026-10-06", { type: "TopicTestCompleted", topicId: "t", score: 10, max: 14, items: [] }]]);
    expect(state.progress.topicTests.t!.passed).toBe(true);
  });

  test("the help threshold of a concept", () => {
    let m = emptyMastery();
    for (const s of [1, 1, 1, 0, 0]) m = recordResult(m, s, "lesson", 0.7);
    expect(m.needsHelp).toBe(true);
    let n = emptyMastery();
    for (const s of [1, 1, 1, 0, 0]) n = recordResult(n, s, "lesson");
    expect(n.needsHelp).toBe(false);
  });
});
