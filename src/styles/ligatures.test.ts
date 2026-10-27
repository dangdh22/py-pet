import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// JetBrains Mono joins `!=`, `==`, `<=`, `>=` and `->` into single signs. A child who learns Python must see the
// characters as typed, so every rule that sets the mono font also turns the ligatures off.

const files = ["src/styles.css", ...readdirSync("src/styles").filter((name) => name.endsWith(".css") && name !== "tokens.css").map((name) => `src/styles/${name}`)];

/** The rules (selector and declarations) of a style sheet; a rule inside `@media` counts as 1 rule. */
function rules(css: string): { selector: string; body: string }[] {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.trim(),
    body: match[2]!,
  }));
}

const usesMono = (body: string) => /var\(--(?:font-)?mono\)/.test(body);

describe("code is shown without font ligatures", () => {
  const monoRules = files.flatMap((file) =>
    rules(readFileSync(file, "utf8"))
      .filter((rule) => usesMono(rule.body))
      .map((rule) => ({ file, ...rule })),
  );

  test("the style sheets have rules that use the mono font", () => {
    expect(monoRules.length).toBeGreaterThan(5);
  });

  test.each(monoRules.map((rule) => [`${rule.file}: ${rule.selector}`, rule.body] as const))("%s", (_name, body) => {
    expect(body).toContain("font-variant-ligatures: none");
    expect(body).toContain('font-feature-settings: "calt" 0, "liga" 0');
    // The `font` shorthand resets both, so it must come first.
    const shorthand = body.search(/(?:^|[;\s])font:/);
    if (shorthand !== -1) expect(body.indexOf("font-variant-ligatures")).toBeGreaterThan(shorthand);
  });
});
