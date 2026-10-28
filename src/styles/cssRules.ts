// A helper of the style sheet tests (not part of the app): the list of the sheets and a small parser that gives the rules of a sheet.
import { readdirSync } from "node:fs";

/** The style sheets: the entry `src/styles.css` and every sheet in `src/styles/`. */
export function cssFiles(): string[] {
  return ["src/styles.css", ...readdirSync("src/styles").filter((name) => name.endsWith(".css")).sort().map((name) => `src/styles/${name}`)];
}

/** The rules (selector and declarations) of a style sheet; a rule inside `@media` counts as 1 rule. */
export function rules(css: string): { selector: string; body: string }[] {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.trim(),
    body: match[2]!,
  }));
}
