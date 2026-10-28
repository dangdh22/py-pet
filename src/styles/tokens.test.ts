import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { describe, expect, test } from "vitest";
import { cssFiles, rules } from "./cssRules";

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
    ["--line-soft", "color-mix(in srgb, var(--ink) 14%, var(--surface))"],
    ["--divider", "#f0eadb"],
    ["--box-head", "#f6efdc"],
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
    for (const file of cssFiles()) {
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

const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i;
// The room scene is a drawing: its palette is declared in `room.css`, as variables, with raw colors. The line may only declare 1 of these
// 11 names, and nothing but 1 closed comment may follow it (a `/*` that stays open, or a declaration after the comment, is refused).
const SCENE_PALETTE = "wall|wall-stripe|baseboard|floor|floor-seam|sky|sky-low|sea|sea-deep|sand|scene-ink";
const COLOR_VARIABLE = new RegExp(`^\\s*--(?:${SCENE_PALETTE}):\\s*#[0-9a-f]{3,8};\\s*(?:\\/\\*(?:(?!\\*\\/).)*\\*\\/)?\\s*$`, "i");
// The only round shape: the glow behind the new form in the evolution show (a sheet and a selector).
const ROUND_SHAPES = [["evolution.css", ".evo-halo"]];

describe("the line that may hold a raw color in room.css", () => {
  test.each(["  --wall: #fff;", "  --floor: #d9c8a9; /* the planks */", "  --sky: #aee3f9;   "])("accepts %j", (line) => {
    expect(COLOR_VARIABLE.test(line)).toBe(true);
  });

  test.each([
    ["a declaration after the comment", "  --wall: #fff; /* x */ color: #000;"],
    ["a comment that stays open", "  --wall: #fff; /* x"],
    ["a declaration after the value", "  --wall: #fff; color: #000;"],
    ["a name outside the palette", "  --color: #fff;"],
  ])("refuses %s", (_name, line) => {
    expect(COLOR_VARIABLE.test(line)).toBe(false);
  });
});

// Every sheet but `tokens.css` takes its colors from the tokens (a tint is a color-mix of a token) and has square corners only.
describe.each(cssFiles().filter((file) => basename(file) !== "tokens.css"))("%s", (file) => {
  const css = readFileSync(file, "utf8");

  test("has no raw color", () => {
    const raw = css.split("\n").filter((line) => RAW_COLOR.test(line));
    expect(basename(file) === "room.css" ? raw.filter((line) => !COLOR_VARIABLE.test(line)) : raw).toEqual([]);
  });

  test("has square corners only", () => {
    const round = rules(css)
      .filter((rule) => [...rule.body.matchAll(/border-radius:\s*([^;}]+)/g)].some((match) => match[1]!.trim() !== "0"))
      .map((rule) => [basename(file), rule.selector]);
    expect(round.filter(([name, selector]) => !ROUND_SHAPES.some(([sheet, allowed]) => sheet === name && allowed === selector))).toEqual([]);
  });

  // The soft grey line is 1 token. This forbids the old `--map-soft` and the 14% and 15% mixes of ink on surface that `--line-soft`
  // replaced; it does not catch another mix with a different share.
  test("reads the soft grey line from --line-soft", () => {
    expect(css).not.toContain("--map-soft");
    expect(css).not.toMatch(/color-mix\(\s*in srgb,\s*var\(--ink\)\s*1[45]%,\s*var\(--surface\)\s*\)/);
  });
});
