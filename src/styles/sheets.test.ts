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

  // The classes that the code builds from a prefix and a variable (`decor-${id}`, `scene-${where}`...): they never appear whole in the code.
  // A prefix is kept only where the names come from data or from a long list; a short fixed list is spelled out in `DYNAMIC_NAMES`, so
  // the other classes with that prefix (`ach-badge-mark`, `chip-big`...) still have to be found in the code.
  const DYNAMIC_PREFIXES = ["decor-", "robot-pose-", "scene-", "stat-", "map-node-", "shop-pic-", "cm-"];
  const DYNAMIC_NAMES = [
    // `ach-badge-${group}` (AchievementsScreen, `BadgeGroup`).
    "ach-badge-lessons",
    "ach-badge-streak",
    "ach-badge-practice",
    "ach-badge-test",
    "ach-badge-concepts",
    "ach-badge-evolution",
    // `chip-${kind}` (ResultView, `RewardChips`). `chip-xu` and `chip-pin` are also spelled whole in the code, so they need no entry.
    "chip-xp",
    "chip-vui",
    // `choice-${mark}` (QuestionCard, `markOf`).
    "choice-correct",
    "choice-wrong",
    // `runner-${status}` (RunnerStatus; a failed runner shows no status line, so `runner-failed` is the alert panel's own class).
    // The loading status has no rule of its own: the yellow square is the default, so only `runner-ready` has a sheet rule.
    "runner-ready",
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
      if (DYNAMIC_NAMES.includes(name) || DYNAMIC_PREFIXES.some((prefix) => name.startsWith(prefix))) return false;
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

// `body` turns the ligatures off for all the mono text (see `ligatures.test.ts`), so no sheet needs a `font-feature-settings` line.
test("no sheet sets font-feature-settings", () => {
  const found = cssFiles().flatMap((file) =>
    rules(read(file))
      .filter((rule) => /(?<![\w-])font-feature-settings\s*:/.test(rule.body))
      .map((rule) => `${sheetName(file)}: ${rule.selector}`),
  );
  expect(found).toEqual([]);
});

// `100vh` is the height of the window as if the bars of a phone browser were out of it, so a page of that height is taller than what the
// child sees. `100dvh` follows the bars. A browser that does not know `dvh` drops that line and keeps the `100vh` line before it.
test("every 100vh height has a 100dvh line after it in the same rule", () => {
  const missing: string[] = [];
  for (const file of cssFiles()) {
    for (const rule of rules(read(file))) {
      const declarations = rule.body
        .split(";")
        .map((declaration) => declaration.trim())
        .filter((declaration) => declaration !== "")
        .map((declaration) => {
          const colon = declaration.indexOf(":");
          return { property: declaration.slice(0, colon).trim(), value: declaration.slice(colon + 1).trim() };
        });
      declarations.forEach(({ property, value }, index) => {
        if (value !== "100vh") return;
        const fallbackFollows = declarations.slice(index + 1).some((later) => later.property === property && later.value === "100dvh");
        if (!fallbackFollows) missing.push(`${sheetName(file)}: ${rule.selector} { ${property}: 100vh }`);
      });
    }
  }
  expect(missing).toEqual([]);
});

// `.study-nav` puts Back at the left end and Next at the right end (`space-between`). A row with 1 button (a review, a practice set or a
// test has no Back) would put it at the left end, so a lone button takes the auto margin that pushes it to the right.
test(".study-nav pushes a lone button to the right end", () => {
  const rule = sheet("study").find((candidate) => selectorList(candidate.selector).includes(".study-nav > :only-child"));
  expect(rule?.body).toContain("margin-left: auto;");
});

// The card of a broken item is 560 px at most; the row under it is as wide, as the row under a 760 px card is as wide as that card.
test("the row under the card of a broken item is as wide as the card", () => {
  const rule = sheet("study").find((candidate) =>
    selectorList(candidate.selector).includes(".study-page:has(> .item-broken) > .study-nav"),
  );
  expect(rule?.body).toContain("max-width: 560px;");
  expect(rule?.body).toContain("margin-inline: auto;");
});

// The pale column of the line numbers must run the full height of the editor, also when the code has 1 or 2 lines. The scroller is `height: 100%`
// of an editor whose height is automatic, which cannot resolve, so the minimum height is on the content and on the gutter (the idiom of
// CodeMirror), and not on `.cm-editor`. A browser test would need real layout; this only keeps the rule where it works.
test("the editor takes its minimum height on the content and the gutter, not on .cm-editor", () => {
  const rule = sheet("study").find((candidate) => selectorList(candidate.selector).includes(".code-editor .cm-gutter"));
  expect(rule && selectorList(rule.selector)).toContain(".code-editor .cm-content");
  expect(rule?.body).toContain("min-height: 220px;");
  const onEditor = sheet("study").filter((candidate) => /\.cm-editor(?![\w-])/.test(candidate.selector) && /min-height/.test(candidate.body));
  expect(onEditor.map((candidate) => candidate.selector)).toEqual([]);
});
