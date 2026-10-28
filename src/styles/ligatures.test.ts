import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// JetBrains Mono joins `!=`, `==`, `<=`, `>=` and `->` into single signs. A child who learns Python must see the
// characters as typed. `font-variant-ligatures` is inherited, so 1 rule on `body` covers all the mono text; only a
// rule with the `font` shorthand resets it, and that rule has to turn the ligatures off again after the shorthand.

const files = ["src/styles.css", ...readdirSync("src/styles").filter((name) => name.endsWith(".css")).map((name) => `src/styles/${name}`)];

/** The rules (selector and declarations) of a style sheet; a rule inside `@media` counts as 1 rule. */
function rules(css: string): { selector: string; body: string }[] {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.trim(),
    body: match[2]!,
  }));
}

describe("code is shown without font ligatures", () => {
  test("body turns the ligatures off for everything", () => {
    const body = rules(readFileSync("src/styles/base.css", "utf8")).find((rule) => rule.selector === "body");
    expect(body?.body).toContain("font-variant-ligatures: none");
  });

  const shorthands = files.flatMap((file) =>
    rules(readFileSync(file, "utf8"))
      .filter((rule) => /(?:^|[;\s])font:[^;]*var\(--(?:font-)?mono\)/.test(rule.body))
      .map((rule) => ({ file, ...rule })),
  );

  test("the style sheets have rules with the font shorthand and the mono font", () => {
    expect(shorthands.length).toBeGreaterThan(0);
  });

  test.each(shorthands.map((rule) => [`${rule.file}: ${rule.selector}`, rule.body] as const))(
    "%s sets the ligatures off after its font shorthand",
    (_name, body) => {
      expect(body).toContain("font-variant-ligatures: none");
      expect(body.indexOf("font-variant-ligatures")).toBeGreaterThan(body.search(/(?:^|[;\s])font:/));
    },
  );
});
