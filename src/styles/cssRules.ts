// A helper of the style sheet tests (not part of the app): a small parser that gives the rules of a sheet.

/** The rules (selector and declarations) of a style sheet; a rule inside `@media` counts as 1 rule. */
export function rules(css: string): { selector: string; body: string }[] {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.trim(),
    body: match[2]!,
  }));
}
