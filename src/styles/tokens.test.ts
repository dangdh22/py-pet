import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const read = (name: string) => readFileSync(`src/styles/${name}.css`, "utf8");
const tokens = read("tokens");
const components = { base: read("base"), shell: read("shell") };

describe("design tokens", () => {
  test.each([
    ["--on-primary", "#ffffff"],
    ["--chip-pin", "#d9f5e6"],
    ["--icon-flame", "#e2541b"],
    ["--icon-coin", "#a77b00"],
    ["--shadow-press", "1px 1px 0 var(--ink)"],
  ])("%s is defined as %s", (name, value) => {
    expect(tokens).toContain(`${name}: ${value};`);
  });

  test("the unused --radius token is gone", () => {
    expect(tokens).not.toContain("--radius");
  });

  // The components read these values from the tokens, so a change is made in 1 place.
  test.each(["#fff", "#ffffff", "#d9f5e6", "#e2541b", "#a77b00", "1px 1px 0"])("base.css and shell.css do not repeat %s", (raw) => {
    // A hex value is a whole value: "#fff" must not match the start of "#fffdf6".
    const found = new RegExp(`${raw}${raw.startsWith("#") ? "(?![0-9a-f])" : ""}`, "i");
    for (const css of Object.values(components)) {
      expect(css).not.toMatch(found);
    }
  });
});
