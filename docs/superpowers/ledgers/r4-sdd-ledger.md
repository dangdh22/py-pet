# SDD ledger — plan: docs/superpowers/plans/2026-10-28-r4-don-css.md

Spec: docs/superpowers/specs/2026-10-27-ui-revamp-design.md (binding). Branch feat/r4-don-css (from main 2d6ad1b = R1+R2+R3), worktree .claude/worktrees/ui-revamp. Plan commit 9823f26. Maintainer request 2026-10-28: "Dọn CSS, sau đó tạo sub agent review tổng thể toàn nhánh trước khi push" — the final review covers origin/main..HEAD (R1-R4), split into 3 parallel reviewers by area (plan, last section).

## Pre-flight scan

| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 ↔ T2 | T1 creates room.css, evolution.css with raw colors; T2 tokenizes them and extends the raw-color guard to all sheets | OK, ordered |
| T1 ↔ T2/T3/T5/T6 | T1 creates sheets.test.ts with `rules()`; T2 needs `rules()` in tokens.test.ts (radius allowlist) | importing a test file from another test file re-runs its tests → Ruling 1 |
| T1 ↔ T3 | T1 style-snapshot tool (scratch) → T3 reuses; T3 retakes "before" after T2's color change | OK (plan says so) |
| T1 ↔ T3 | T1 moves `.code-block` to base.css, `.app-loading` to shell.css; T3 test ".code-block defined in base.css only" | OK, consistent |
| T1 self | `[role="alert"]` moves to the end of errors.css (last import) — keeps its cascade place; test checks styles.css imports room, evolution after errors | OK |
| T2 self | radius allowlist `.evo-halo` in evolution.css; raw color only as custom properties in room.css; contrast of the new `.evo-from` grey on ink | OK |
| T3 self | "every class is used" test: a word match in JS `\b` treats `-` as a boundary (`badge` would match `ach-badge`) | → Ruling 2 |
| T3 ↔ T4 | both edit ShopScreen.tsx (T3 `.tag`→`.shop-tag`, T4 hook) | OK, sequential |
| T3 ↔ T5 | T3 produces `.ach-badge-day` → T5 prefixes its show rule | OK |
| T4 self | tests match steps; `fireEvent.keyDown` returns false when prevented | OK |
| T5 self | `.side-nav-label` show rule lives inside `@media (max-width: 1099px)`; a selector list has 2 items (hover, focus-visible) | → Ruling 3 |
| T5 ↔ T6 | T6 e2e checks Escape on map captions built in T5 | OK; opacity may transition → Ruling 4 |
| T6 self | `.choice input:focus-visible { outline: none }` keeps the block ring (`.choice:has(input:focus-visible)`, study.css:491) | OK |
| T6 ↔ T1 | "every 100vh has 100dvh" applies to the moved sheets too | OK (evolution/room have no 100vh) |

Ruling 1: `rules(css)` moves into a test helper module `src/styles/cssRules.ts` (exported, no tests inside); ligatures.test.ts, sheets.test.ts and tokens.test.ts import it — a test file imported by another runs its tests twice — cost if wrong: one tiny module.
Ruling 2: the "every class is used" test matches a class as a whole token: `(?<![\w-])name(?![\w-])` in the TS/TSX text, so `badge` is not found inside `ach-badge` — cost if wrong: a dead class slips through.
Ruling 3: the Task 5 guard checks every selector of the selector list (hover and focus-visible) that shows the note, inside or outside `@media` — cost if wrong: none.
Ruling 4: the Task 6 Escape e2e asserts with `toHaveCSS("opacity", …)` (auto-retry), not a one-shot read — cost if wrong: none.

## Tasks

Task 1: dispatched (BASE 9823f26, implementer sonnet)
Task 1: implementer DONE, commit bfef302 (Vitest 1741). Snapshot 60 pages before=after (only the 4 removed tokens differ); before run twice identical. Extra: 8 placement tests in sheets.test.ts. Review dispatched (sonnet).
Task 1: review Approved, spec ✅ (sonnet). Moved blocks byte-identical; cascade analysis: no moved rule (incl. .evo-skip states) can lose.
Task 1: minor (deferred): stale "styles.css" comments in EvolutionShow.tsx:39, robot/palette.ts:81, RoomScene.tsx:10; errors.css:67-69 comment wrong (room/evolution come after it); sheet path list duplicated in ligatures.test and tokens.test; dead `(?:font-)?` in ligatures.test regex; tokens.css stacked comments, --stat-pin/--stat-vui outside the stat group; `.evolve` placement test satisfied by the reduced-motion copy alone; snapshot misses evolution pass, parent help .code-block, a code question.
Ruling: carry Task 1 minors 1-5 (stale comments, errors.css comment, export `cssFiles()` from cssRules.ts, dead regex alternative, tokens.css grouping) into Task 2 — it edits the same sheets and tests — and minor 7 (snapshot pages for the gaps) into Task 3 — cost if wrong: a slightly larger Task 2 diff.
Task 1: complete (commits 9823f26..bfef302, review clean)
Task 2: dispatched (BASE bfef302, implementer sonnet) with Task 1 minors 1-5
Task 2: implementer DONE, commit 9f4b640 (Vitest 1768). Snapshot: 10 pages differ, all intended (15%→14% line in parent progress/settings; gallery .scene-z Lexend, evolution glow/from color). Contrast .evo-from 13.05:1. Extras: guard against --map-soft or a hand-mixed soft grey; cssFiles() sorted. Review dispatched (sonnet).
Task 2: review Approved, spec ✅ (sonnet). Reviewer re-ran the snapshot diff: only decision-3 changes; guard simulation catches hex/rgb/rgba/hsl in all 10 sheets.
Task 2: minor (deferred): .evo-from grey 214 → 217.4 (84% mix, brief value); room.css exemption allows any `--x: #hex;` line anywhere in room.css; color regex misses oklch/hwb/lab/color()/named colors (matches the constraint); errors.css comment credits the last-rule place for beating .banner (it is the import order); "--line-soft" guard comment overclaims; editorTheme.ts keeps its own #f6efdc (same as --box-head).
Ruling: keep the 84% mix for .evo-from — 3 levels lighter is invisible and contrast rises (13.05:1); it goes into the maintainer notes — cost if wrong: one percentage.
Ruling: carry Task 2 minors (room.css exemption limited to the 11 scene palette names with nothing else on the line; errors.css comment names the import order; --line-soft guard comment; --box-head comment notes the editor gutter twin in editorTheme.ts) and Task 1 minor 7 (snapshot pages for the evolution pass, parent help .code-block, a code question) into Task 3 — cost if wrong: a slightly larger Task 3 diff.
Task 2: complete (commits bfef302..9f4b640, review clean)
Task 3: dispatched (BASE 9f4b640, implementer sonnet) with Task 2 minors and Task 1 minor 7
Task 3: implementer DONE_WITH_CONCERNS, commit 03792ae (Vitest 1789). Snapshot 70 pages: only backup-unlocked file button transition differs (new states). .item-broken screenshot checked by the controller: centered card, OK; the Back/Next row under it stays full width.
Ruling: accept the 3 extra dynamic prefixes `chip-`, `choice-`, `runner-` in the "class is used" test — the code builds `chip-${kind}`, `choice-${mark}`, `runner-${status}` — cost if wrong: a dead class with one of these prefixes passes the guard.
Review dispatched (sonnet).
Task 3: review Approved, spec ✅ (sonnet). Cascade of moved rules checked (no loss); no old class name left in src, e2e, tools; snapshot reproduces.
Task 3: minor (deferred): room.css exemption tail `\s*(?:\/\*.*)?$` lets a comment swallow the rest of the line; `input[type="file"]:focus-visible` repeats the global ring (plan-mandated), comment should say so; `ach-badge-` prefix exempts 12 classes but only the 6 group names are dynamic (same for chip-/choice-/runner-); file button got a 0.08 s transition (counts as part of the "like .small" states); `.section-title` and `.card-title` near-duplicates (pre-existing).
Ruling: carry Task 3 minors 1 (closed-comment tail), 2 (comment), 3 (exact dynamic names instead of the `ach-badge-` prefix where cheap) and the full-width Back/Next row under `.item-broken` into Task 6 — cost if wrong: a slightly larger Task 6 diff.
Task 3: complete (commits 9f4b640..03792ae, review clean)
Task 4: dispatched (BASE 03792ae, implementer sonnet)
Task 4: implementer DONE, commit f80b36f (Vitest 1795). Screen keyboard tests pass unchanged; map dropped its unreachable `if (!target) return`. Review dispatched (sonnet).
Task 4: review Approved, spec ✅ (sonnet). Key logic now in 1 place; empty list and modifier guards covered by tests that fail without them.
Task 4: minor (deferred): tabKeys.ts JSDoc still names only shop and parent tabs; useRovingTabs `onSelect` contract (index in 0..count-1) undocumented while MapScreen dereferences without a guard; hook tests do not assert preventDefault for Home/End/horizontal arrows nor a click focusing the tab.
Ruling: carry Task 4 minors 1-3 (2 doc lines, 2 test asserts) into Task 6 — cost if wrong: a slightly larger Task 6 diff.
Task 4: complete (commits 03792ae..f80b36f, review clean)
Task 5: dispatched (BASE f80b36f, implementer sonnet)
Task 5: implementer DONE, commit 3d7dcfc (Vitest 1805). Browser-checked map captions and narrow menu labels; badge note covered by the sheet guard only. 3 extra hook tests. Review dispatched (sonnet).
Task 5: review Approved, spec ✅ (sonnet). Listener is `pointerover` (decision 7); PIN gate → area remount safe; wide menu has no show rule.
Task 5: minor (deferred): no test pins pointerover vs pointermove; no test for 2 frames one after the other; attribute is global without a count (overlap unreachable today); no e2e for the narrow menu label's computed opacity after Escape.
Ruling: carry Task 5 minors 1, 2 and 4 (2 hook tests, 1 e2e assertion) into Task 6; minor 3 stays deferred (no overlap in the app) — cost if wrong: a slightly larger Task 6 diff.
Task 5: complete (commits f80b36f..3d7dcfc, review clean)
Task 6: dispatched (BASE 3d7dcfc, implementer sonnet) with 10 carried review notes in task-6-extras.md
Task 6: implementer DONE_WITH_CONCERNS, commits 5d3b0ce (review notes), 8ef5bcd (polish, e2e, STATUS). CI=1 npm run check exit 0: Vitest 1818, pytest 21, Playwright 23.
Ruling: the short-window e2e runs at 1000 x 400, not the plan's 1000 x 500 — the narrow menu is 494 px tall, so at 500 the test passes without the fix; 400 fails before and passes after; the media query keeps max-height 540px — cost if wrong: none.
Ruling: accept `align-self: stretch` in the short-window rule — without it the menu's background and border stop at 494 px on a taller page — cost if wrong: one CSS line.
Review dispatched (sonnet).
Task 6: review Approved, spec ✅ (sonnet). Polish items keep computed styles; short-window e2e proved RED; STATUS numbers add up (1818/21/23).
Task 6: minor (deferred): prefixes kept for short typed unions mixed with literal classes (shop-pic-, scene-, stat-, map-node-) hide dead literals; DYNAMIC_NAMES has dead `runner-loading` and redundant `chip-xu`, `chip-pin`; 100vh test misses calc(100vh …); narrow menu not sticky between 495 and 540 px tall (plan-mandated band); STATUS heading still says R1-R3; new rules checked as source strings only.
Ruling: keep the 4 prefixes (shop-pic-, scene-, stat-, map-node-) — their literal members are in use today and an exact list would duplicate unions spread over 4 files; the final review triages it — cost if wrong: a dead literal class can slip through the guard.
Task 6: complete (commits 3d7dcfc..8ef5bcd, review clean)
Final review: 3 parallel reviewers (opus) over origin/main..HEAD split by area (A frame/foundation, B study/map/evolution, C pages/parent/errors/guide/i18n), per the maintainer's request.
Final review: dispatched 3 opus reviewers at HEAD 8ef5bcd (packages final-area-A/B/C.diff, brief final-review-brief.md)
Final review B (opus): "With fixes" — 0 Critical, 1 Important: map page scrolls sideways (hidden 220 px captions at row ends): scrollWidth 406-424 at 375 px, 930 at 900 px stage 4 (spec 6.4) → `.map-page { overflow-x: clip }` + e2e map width check at 375 and 900 through every stage tab. Minor: focus bar breaks at 375 px (area A); map square names miss the visible "1"/"KT" (WCAG 2.5.3); editor gutter stops at the last line (`.cm-scroller` height 100% unresolved); focus falls to body after the last step (ResultView h1 no focus; pre-existing); styled lists lose list role in Safari (role="list"). Triage: only the caption overflow must be fixed before push.
Final review C (opus): "Yes" — 0 Critical, 0 Important. Minor: badge note (and likely side-menu labels, map captions) fail 1.4.13 "hoverable" (6 px gap + pointer-events none); focus to body when backup/PIN steps swap forms (pre-existing); `.parent` has no max-width (1600 px lines on 1920); guide "Robo sẵn sàng" line absent below 1100 px; guide "change device" sentence omits that the PIN becomes the file's PIN; level-1 crash leaves no `main` landmark; English "1 concepts"; identical "Tải về" button names; 375 px e2e misses backup unlocked and 3 parent tabs. Triage: all "can wait"; guide sentences into the parent's wording review.
Final review A (opus): "With fixes" — 0 Critical, 2 Important: focus bar cannot wrap below ~440 px (lesson h1 0 px wide at 375/320, progress text over the status square, page scrolls sideways at 320 = 400% zoom; spec 6.4, WCAG 1.4.10); narrow-menu labels not hoverable (WCAG 1.4.13; same pattern in map captions and badge date). Minor: scroll position carries over between routes; welcome focus on "Tiếp" skips h1/question (+ wrong comment); room chips and landing code overflow at 320; banners/RunnerAlert and in-frame crash card outside landmarks; landing parent toggle loses mint on hover; stale comments, redundant margin, dead `runner-loading`, copy_fonts bare catch.
Ruling: ONE fix wave with the 3 Important items (map overflow, focus bar wrap, hoverable notes for all 3 kinds) plus the cheap Minors of all 3 areas (list in final-fix-findings.md) — they are small, visible to children or parents, and the maintainer asked for a whole review before the push — cost if wrong: a larger fix diff to re-review.
Ruling: deferred to a follow-up, not in the fix wave: map square names without the visible number (B-M3; spec 7.4 and R2 decision 3 set the names, and changing them touches e2e/unit locators — the maintainer decides); focus after backup/PIN form swaps (C-M2; pre-existing, needs a per-step design); Banners/RunnerAlert outside landmarks (A-M6 first half); `chip-`/`scene-`/`stat-` prefix tightening; Settings h2/h3 and inline <code> size (R4 decision 9) — cost if wrong: these stay as known minor debt.
Final fix wave: dispatched (sonnet, BASE 8ef5bcd) with 17 items in final-fix-findings.md
Final fix wave: implementer DONE_WITH_CONCERNS, commit 2b233fb (Vitest 1833, Playwright 33 before the last 3 small additions). Extra: src/ui/mapCaption.ts keeps captions inside the page on hover/focus (clip alone cut 14/31 at 375 px); found and fixed the backup page 476 px wide after the PIN at 375 px. Scoped re-review dispatched (sonnet); controller runs CI=1 npm run check at 2b233fb.
Controller: CI=1 npm run check at 2b233fb exit 0 — Vitest 1833 (91 files), pytest 21, Playwright 33.
Final fix wave: scoped re-review (sonnet): 17/17 ADDRESSED, no Critical/Important breakage; the mapCaption.ts script judged sound (no CSS-only route short of anchor positioning).
Final fix wave: parked — `pointer-events: auto` also on the :focus-visible show rules (a keyboard-shown note catches clicks, which activate the focused link) — Ruling: the code stands; the finding asked for hover and focus rules, the effect is a click on the note acting as a click on its own trigger — cost if wrong: a rare surprise click, fixed by splitting 3 rules.
Final fix wave: parked — fitCaption measures only on pointerenter/focus (stale shift after a resize while focused; onFocus path untested) — Ruling: real, deferred; cosmetic and rare — cost if wrong: an off-centre caption until the next hover.
Final fix wave: parked — guide footer still says "cập nhật 2026-10-27" — Ruling: real, deferred to the parent's wording review of the guide (STATUS list item 12) — cost if wrong: a 1-day-old date in the footer.
Final fix wave: parked — the map-after-room scroll e2e assertion likely passes without the fix (only the welcome→room one bites); Help tab e2e only in its empty state — Ruling: real, deferred; the unit test pins scrollToTop — cost if wrong: a weaker e2e guard.
Final fix wave: out of scope (deferred): ~12 other styled lists without role="list"; EvolutionFailed h1 gets no focus on mount; scrollToTop also runs on Back/Forward (browser scroll restore lost).
R4: complete (commits 9823f26..2b233fb; final review of origin/main..2b233fb by 3 opus reviewers, 1 fix wave, re-review clean; CI=1 npm run check exit 0 at 2b233fb: Vitest 1833, pytest 21, Playwright 33).
