import { readdirSync, readFileSync } from "node:fs";
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

  // The browser sheet sets `monospace` on `pre` and `code`; a `<code>` inside a `<pre>` would show the system font, not the code font.
  test("base.css sets the code font on pre and code, with font-family and not the font shorthand", () => {
    const plain = components.base.replace(/\/\*[\s\S]*?\*\//g, "");
    const rule = [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((match) =>
      match[1]!.split(",").map((selector) => selector.trim()).includes("code"),
    );
    expect(rule).toBeDefined();
    const selectors = rule![1]!.split(",").map((selector) => selector.trim());
    expect(selectors).toEqual(expect.arrayContaining(["pre", "code"]));
    expect(rule![2]).toContain("font-family: var(--font-mono);");
    expect(rule![2]).not.toMatch(/(?:^|[;\s])font:/);
  });

  test("the unused --radius token is gone", () => {
    expect(tokens).not.toContain("--radius");
  });

  // R1 kept 4 old names for the screens that were not restyled yet. Every screen is restyled now: the names are gone and the sheets
  // read `--ink` and `--font-mono` themselves.
  test.each(["--text", "--border", "--code-text", "--mono"])("the old token %s is gone", (name) => {
    // The name is a whole name: `--border` is not `--border-w` and `--mono` is not `--font-mono`.
    expect(tokens).not.toMatch(new RegExp(`(?<![\\w-])${name}\\s*:`));
    for (const file of ["src/styles.css", ...readdirSync("src/styles").filter((entry) => entry.endsWith(".css")).map((entry) => `src/styles/${entry}`)]) {
      expect(readFileSync(file, "utf8"), `${file} reads ${name}`).not.toMatch(new RegExp(`var\\(\\s*${name}\\s*[,)]`));
    }
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

// The R3 files take their colors from the tokens (a tint is a color-mix of a token) and have square corners only.
describe.each(["pages", "parent", "errors"])("%s.css", (name) => {
  const css = read(name);

  test("has no hex color", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  test("has square corners only", () => {
    const radii = [...css.matchAll(/border-radius:\s*([^;}]+)/g)].map((match) => match[1].trim());
    expect(radii.filter((value) => value !== "0")).toEqual([]);
  });
});
