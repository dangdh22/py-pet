import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { rules } from "./cssRules";

const read = (path: string) => readFileSync(path, "utf8");
const sheet = (name: string) => rules(read(`src/styles/${name}.css`));

// `src/styles.css` is the entry that `main.tsx` imports. It only lists the sheets: every rule lives in a sheet of its own.
describe("src/styles.css", () => {
  const lines = () =>
    read("src/styles.css")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

  test("src/styles.css has only @import lines", () => {
    expect(lines().length).toBeGreaterThan(0);
    expect(lines().filter((line) => !/^@import "\.\/styles\/[a-z-]+\.css";$/.test(line))).toEqual([]);
  });

  test("styles.css imports room.css and evolution.css after errors.css", () => {
    const names = lines().map((line) => /\/([a-z-]+)\.css/.exec(line)?.[1]);
    expect(names.indexOf("errors")).toBeGreaterThanOrEqual(0);
    expect(names.slice(names.indexOf("errors"))).toEqual(["errors", "room", "evolution"]);
  });
});

// The rules that used to follow the imports in `styles.css` now sit in the sheet of their own topic.
describe("the rules moved out of styles.css", () => {
  test.each([
    ["base", ".code-block"],
    ["shell", ".app-loading"],
    ["study", ".evolve"],
    ["study", ".result-card h1:focus"],
    ["room", ".room-scene"],
    ["room", ".stat-bar"],
    ["evolution", ".evolution-show"],
  ])("%s.css has the rule %s", (name, selector) => {
    expect(sheet(name).map((rule) => rule.selector)).toContain(selector);
  });

  // `errors.css` is the last of the old sheets, so the red of an alert still wins over the color of a card or a banner.
  test('the [role="alert"] rule is the last rule of errors.css', () => {
    expect(sheet("errors").at(-1)?.selector).toBe('[role="alert"]');
  });
});
