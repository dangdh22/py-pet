import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { cssFiles, rules } from "./cssRules";

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

// The card that takes the place of a broken item (`ItemBoundary`) has a rule of its own: it is the card of a message, 560 px at most.
test("study.css styles the card of a broken item", () => {
  const rule = sheet("study").find((candidate) => candidate.selector === ".item-broken");
  expect(rule?.body).toContain("max-width: 560px;");
});

// The red of an alert (`errors.css`) must beat the ink of the `.banner` of `base.css`. Both rules have the same specificity, so the import
// order decides, together with the last place of the alert rule in `errors.css`.
describe("the import order", () => {
  test("src/styles.css imports base.css before errors.css", () => {
    const names = read("src/styles.css")
      .split("\n")
      .map((line) => /^@import "\.\/styles\/([a-z-]+)\.css";$/.exec(line.trim())?.[1])
      .filter((name): name is string => name !== undefined);
    expect(names).toContain("base");
    expect(names).toContain("errors");
    expect(names.indexOf("base")).toBeLessThan(names.indexOf("errors"));
  });
});

/** The selectors of a rule: the list is split at the commas outside (...) and [...], and the spaces are made single. */
function selectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i];
    if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth -= 1;
    else if (char === "," && depth === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts.map((part) => part.trim().replace(/\s+/g, " ")).filter((part) => part !== "");
}

const sheetName = (file: string) => file.replace(/^.*\//, "");

/** The sheets that define a selector: it stands alone in the selector list of a rule (a scoped variant such as `.parent .table` does not count). */
function definedIn(selector: string): string[] {
  return cssFiles()
    .filter((file) => rules(read(file)).some((rule) => selectorList(rule.selector).includes(selector)))
    .map(sheetName);
}

// What the pages share lives in `base.css`, and the page frame in `shell.css`: 1 place each, so a page does not restyle its own copy.
describe("where the shared parts are defined", () => {
  test.each([".section-title", ".table", ".table-scroll", 'input[type="file"]', ".pin-form", ".link-button", "button.danger", ".code-block"])(
    "%s is defined in base.css only",
    (selector) => {
      expect(definedIn(selector)).toEqual(["base.css"]);
    },
  );

  test.each([".page", ".page-head", ".page-head-side", ".page-tabs"])("%s is defined in shell.css only", (selector) => {
    expect(definedIn(selector)).toEqual(["shell.css"]);
  });
});

/** Every `.class` in the selectors of every sheet (the declarations are left out, so `0.08s` is not a class). */
function classesInSheets(): string[] {
  const names = new Set<string>();
  for (const file of cssFiles()) {
    for (const rule of rules(read(file))) {
      for (const match of rule.selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) names.add(match[1]!);
    }
  }
  return [...names].sort();
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A bare name such as `.form` or `.badge` is too general for a page: it would style every element that takes the name later. The pages use
// a prefix (`.robo-form`, `.ach-badge`, `.shop-tag`, `.concept-count-number`).
describe("page classes", () => {
  test.each([".form", ".forms", ".badge", ".badges", ".big", ".tag"])("no sheet defines the bare page class %s", (name) => {
    // A whole name: `.form` is not `.form-x` and not `.robo-form`.
    const bare = new RegExp(`${escapeRegExp(name)}(?![\\w-])`);
    const found = cssFiles().flatMap((file) =>
      rules(read(file))
        .filter((rule) => bare.test(rule.selector))
        .map((rule) => `${sheetName(file)}: ${rule.selector}`),
    );
    expect(found).toEqual([]);
  });

  // The classes that the code builds from a prefix and a variable (`decor-${id}`, `ach-badge-${group}`...): they never appear whole in the
  // code. The last 3 are `chip-${kind}` (ResultView), `choice-${mark}` (QuestionCard) and `runner-${status}` (RunnerStatus).
  const DYNAMIC_PREFIXES = [
    "decor-",
    "robot-pose-",
    "scene-",
    "stat-",
    "map-node-",
    "map-key-",
    "shop-pic-",
    "ach-badge-",
    "cm-",
    "chip-",
    "choice-",
    "runner-",
  ];

  /** The code of the app: every `.ts` and `.tsx` file of `src` but the tests, the test helpers and the sheets' own tests. */
  function appCode(): string {
    return (readdirSync("src", { recursive: true }) as string[])
      .filter((path) => /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path) && !/^(test|styles)\//.test(path))
      .map((path) => read(`src/${path}`))
      .join("\n");
  }

  test("every class in the style sheets is used in src", () => {
    const code = appCode();
    const unused = classesInSheets().filter((name) => {
      if (DYNAMIC_PREFIXES.some((prefix) => name.startsWith(prefix))) return false;
      // A whole name, so `badge` is not found inside `ach-badge`.
      return !new RegExp(`(?<![\\w-])${escapeRegExp(name)}(?![\\w-])`).test(code);
    });
    expect(unused).toEqual([]);
  });
});

// WCAG 1.4.13 (content on hover or focus): a floating note must go away with Escape, with no move of the pointer or the focus. The hook
// `useEscapeHidesTips` puts `data-tips-hidden` on the root. Every selector that shows a note starts with `:root:not([data-tips-hidden])`,
// so the base rule of the note (`opacity: 0`) applies again while the attribute is there.
describe("the floating notes", () => {
  const TIPS_SHOWN = ":root:not([data-tips-hidden])";

  test.each([".side-nav-label", ".ach-badge-day", ".map-node-caption"])(
    "the rule that shows %s starts with :root:not([data-tips-hidden])",
    (name) => {
      // A whole name: `.map-node-caption` is not `.map-node-caption-x`.
      const named = new RegExp(`${escapeRegExp(name)}(?![\\w-])`);
      const shows = cssFiles().flatMap((file) =>
        rules(read(file))
          .filter((rule) => /(?<![\w-])opacity:\s*1\s*(?:;|$)/.test(rule.body) && named.test(rule.selector))
          .map((rule) => ({ file: sheetName(file), selectors: selectorList(rule.selector) })),
      );
      // A guard that finds no rule would pass for nothing: the note has a rule that shows it.
      expect(shows.length).toBeGreaterThan(0);
      // Every selector of the list counts (the `:hover` one and the `:focus-visible` one), inside `@media` or not.
      const bare = shows.flatMap(({ file, selectors }) =>
        selectors.filter((selector) => !selector.startsWith(TIPS_SHOWN)).map((selector) => `${file}: ${selector}`),
      );
      expect(bare).toEqual([]);
    },
  );
});
