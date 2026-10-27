# SDD ledger — plan: docs/superpowers/plans/2026-10-27-r1-nen-tang-giao-dien.md

Spec: docs/superpowers/specs/2026-10-27-ui-revamp-design.md (binding). Branch feat/ui-revamp, worktree .claude/worktrees/ui-revamp. Baseline a646bcd: lint, typecheck, 1418 Vitest green; e2e not run at baseline.

## Pre-flight scan

| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 ↔ T2 | base.css classes (.button .chip .card .icon .icon-solid .banner) → T2 components; T1 creates empty shell.css, T2 fills | OK |
| T1 ↔ T3..T7 | T1 removes old `.lang-switch` from styles.css "moved to new files" | `.lang-switch` is still used by question LangSwitch and onboarding → Ruling 1 |
| T2 ↔ T3 | Icon, UiLangSwitch → LandingScreen | OK |
| T2 ↔ T4 | SideNav, RailLayout, FocusLayout, RailItem → AppRoutes; T2 drops Header tests, T4 deletes Header.tsx | OK (Header untested between T2 and T4) |
| T3 ↔ T4 | LandingScreen({onStart}) → GameRoot / AppRoutes | OK |
| T4 ↔ T5 | GameRoot passes onBack (T5); T4 App test 3 creates a profile through the old form, T5 rewrites it for 4 steps | OK, T5 file list names AppRoutes.test.tsx |
| T4 ↔ T7 | T4 wraps ParentScreen in RailLayout temporarily; T7 restructures | T4 file list lacks ParentScreen.tsx → Ruling 2 |
| T2 ↔ T6 | StreakChip/XuChip texts = room.streak/room.xu; RoomScreen tests getByText("Xu: 0") | OK (svg has no text) |
| T2 ↔ T7 | RailLayout mode="parent", SideNav logo reused by ParentNav | OK (a shared Logo component is the implementer's call) |
| T8 | consumes all flows | OK; e2e red from T4 to T8 is planned |
| T1 self | tests are build checks, files consistent | OK |
| T2 self | test 2 expects "Robo sẵn sàng": renderWithApp default runner is ready (old Header test relied on it); test 3/4 need renderWithGame | OK |
| T3 self | onStart present/absent variants match tests | OK |
| T4 self | tests 1-6 match code steps | OK |
| T5 self | tests match steps | OK |
| T6 self | toHaveAccessibleDescription needs aria-describedby on hidden span; accname includes directly referenced hidden nodes | OK |
| T7 self | test 1 wording "link Menu chính" means the nav named "Menu chính" | OK |
| T8 self | OK | OK |

Ruling 1: Task 1 moves the `.lang-switch` rule into base.css (square buttons, aria-pressed state) instead of dropping it — question LangSwitch and the onboarding still use the class — cost if wrong: one CSS rule to delete later.
Ruling 2: Task 4 may edit src/ui/ParentScreen.tsx only to wrap both states in `<RailLayout nav={<SideNav current="parent" />}>`; its nav.room links stay until Task 7 — the plan text requires the wrap but omits the file — cost if wrong: none, Task 7 rewrites it.

## Tasks

Task 1: dispatched (BASE a646bcd, implementer sonnet)
Task 1: implementer DONE_WITH_CONCERNS, commit 2856b50; review dispatched (sonnet). Carry to Task 6: `.scene-bubble` still has border-radius 16px (spec 5.5 wants the Robo bubble square); `.card` 760px layout now scoped to `.lesson .card, .question-card`.
Task 1: review Approved, spec ✅. Ruling: `.scene-bubble` 16px radius (plan-mandated keep) is squared in Task 6 per spec 5.5 — cost if wrong: one CSS rule.
Task 1: minor (deferred): `.fill-template input` grew taller from the global input padding — fix in R2 when fill exercises are restyled.
Task 1: minor (deferred): `.lang-switch` buttons have no hover change.
Task 1: minor (deferred): hard-coded colors in base.css (#fff, #e2541b, #a77b00, #d9f5e6), repeated `1px 1px 0` shadow, dead `--radius` token.
Task 1: minor (deferred): `--stat-pin` fill is under 3:1 as a graphic; keep the ink frame on stat bars (Task 6).
Task 1: minor (deferred): copy_fonts.mjs bare catch hides error.code; lockfile gained a root engines block (harmless).
Task 1: complete (commits a646bcd..2856b50, review clean)
Task 2: dispatched (BASE 2856b50, implementer sonnet)
Task 2: implementer DONE, commit 829be9c (1450 Vitest). Ruling: commit trailers name the model that wrote the commit (subagent's own attribution) — implementer-rules updated; Task 1's commit says Opus though Sonnet wrote it, left as is — cost if wrong: one trailer line. Carry to Task 4: remove the old `.runner-status { margin-left: auto }` rule in styles.css with Header. Review dispatched (sonnet).
Task 2: review Approved, spec ✅. Extra: src/ui/shell/Logo.tsx (shared logo, for Task 7 ParentNav).
Task 2: minor (deferred): collapsed rail shows Python status as a colored square only (text hidden visually).
Task 2: minor (deferred): collapsed rail on windows under ~520px tall hides the bottom group (nav cannot scroll).
Task 2: minor (deferred): divider color #f0eadb is a raw hex, no token.
Task 2: complete (commits 2856b50..829be9c, review clean)
Task 3: dispatched (BASE 829be9c, implementer sonnet)
Task 3: implementer DONE, commit 28eb238 (1460 Vitest). Parent button is a toggle with aria-expanded. Carry to Task 4: LandingScreen renders its own <main>; do not wrap it. Review dispatched (sonnet).
Task 3: review Approved, spec ✅.
Task 3: minor (deferred): opening the parent card on a phone gives no focus move/scroll (card may be below the fold).
Task 3: minor (deferred): code window may cover Robo's foot at 900-1150px (unrendered estimate) — check by eye.
Task 3: minor (deferred): hover on the expanded nav "Khu phụ huynh" drops its mint background.
Task 3: minor (deferred): PARENT_INFO_TITLE_ID is a constant (useId idiom); min-height 100vh vs 100dvh.
Task 3: complete (commits 829be9c..28eb238, review clean)
Task 4: dispatched (BASE 28eb238, implementer sonnet)
Task 4: implementer DONE_WITH_CONCERNS, commit 336c1d4 (1474 Vitest). Added `.app-loading` CSS (not in brief); no failed-runner panel on landing/onboarding/load error (as brief); one map-click test scoped to nav. Carry to Task 6: room's own nav links still duplicate the side nav until Task 6 removes them. Review dispatched (sonnet).
Task 4: review Approved, spec ✅. Carry to Task 7: ErrorBoundary wraps the whole ParentScreen, so a parent-area crash drops the side nav — Task 7 puts the boundary inside its frame; pass mode="parent".
Task 4: minor (deferred): no test that a crashing screen keeps the nav/focus bar; railItem uses `default: "room"` (not exhaustive); `.app-loading` raw values in styles.css; routing.test.ts missing blank line.
Task 4: complete (commits 28eb238..336c1d4, review clean)
Task 5: dispatched (BASE 336c1d4, implementer sonnet)
Task 5: implementer DONE, commit 62cbcc1 (1484 Vitest). Name check moved out of save (step 2 blocks it). Review dispatched (sonnet).
Task 5: review Needs fixes — Important: Enter on step 1 does not advance (focus on a language button). Ruling: step 1 focuses the "Tiếp" submit button; language buttons stay Tab-reachable — cost if wrong: one focus target. Fix round 1 sent to the implementer (+ tests: Enter on step 1, onCreated not called after Enter on steps 2-3).
Task 5: fix round 1/5 (1 addressed, 0 open — Enter on step 1; commits 62cbcc1..49a58af)
Task 5: minor (deferred): comment "language buttons stay 1 Tab away" is inaccurate (Shift+Tab 2-3 presses); negative onCreated checks are synchronous.
Task 5: complete (commits 336c1d4..49a58af, review clean after 1 fix round)
Task 6: dispatched (BASE 49a58af, implementer sonnet)
Task 6: implementer DONE_WITH_CONCERNS, commit 4a81b91 (1499 Vitest). main is `room-page` (old `.room`/`.room-actions` kept for R2 screens); scene stays compact (~215px) at 1024-1440 via existing container query; week squares wrap. Review dispatched (sonnet).
Task 6: review Approved, spec ✅.
Task 6: minor (deferred): RoomScreen.test negated multi-class `not.toHaveClass("next-card","primary")` is weak — split into 2 calls.
Task 6: minor (deferred): redundant `.room-side .card-title` margin; Squares shows 0 filled for small progress on long goals; stat-bar label column 11em squeezes the track (visual); scene compact ~215px vs mockup ~440px (visual) — check in the R1 visual pass.
Task 6: complete (commits 49a58af..4a81b91, review clean)
Task 7: dispatched (BASE 4a81b91, implementer sonnet)
Task 7: implementer DONE_WITH_CONCERNS, commit 5012da7 (1505 Vitest). Inner ErrorBoundary key={tab} inside the parent layout; `.tabs` kept (ShopScreen uses it); shared side-nav CSS tweaked; no arrow-key roving on tabs. Review dispatched (sonnet).
Task 7: review Approved, spec ✅ (`.tabs` kept: ShopScreen uses it — justified deviation).
Task 7: minor (deferred): parent-tab id built in 2 files (export a helper); dead `?? "parent.title"` fallback; gate h1 unstyled (R3 restyles the PIN card); tabs have no roving tabindex/arrow keys and the tablist has no name (R3); comment says "red" for the coral badge.
Task 7: complete (commits 4a81b91..5012da7, review clean)
Task 8: dispatched (BASE 5012da7, implementer sonnet)
Task 8: implementer DONE, commit 2c7504d — `npm run check` exit 0 (Vitest 1505, pytest 21, Playwright 17/17). Parent exits now use "Khóa và quay lại" (no other exit in parent mode).
Task 8: review Needs fixes — Important: runner-failed "on a study screen" assertions can pass on the room (RailLayout also renders the alert). Fix round 1 sent (+ minors: Vietnamese face font check, named guide heading).
Task 8: fix round 1/5 (1 Important + 2 minors addressed, 0 open — runner-failed pinned to the lesson screen; commits 2c7504d..5f94fff)
Task 8: minor (deferred): fonts.check returns true when no face covers the text — could also assert a loaded Lexend FontFace.
Task 8: complete (commits 5012da7..5f94fff, review clean after 1 fix round)
Final review: dispatched (opus, range a646bcd..5f94fff)
Final review: "With fixes" — 0 Critical, 2 Important (no focus-bar slot for R2; frame/boundary contract tests missing), 11 Minor + deferred triage.
Ruling: the FocusLayout slot (title, steps, "Câu n/m") becomes the first task of the R2 plan instead of an R1 fix — R2's first change depends on it and the R2 plan is being drafted — cost if wrong: none, it lands before any R2 screen work.
Ruling: "5 câu" in room.reviewHint stays (it is the plan's text; free review may hold fewer items early on) — reported to the maintainer — cost if wrong: one string.
Ruling: stage on the "Học tiếp" card stays the pet stage (content has no lessons outside the current stage today) — cost if wrong: wrong stage name if content changes.
Ruling: CSS split of shell.css and a `.button.lg` variant go to the R2 plan (where the R2 CSS lives).
Controller visual check: collapsed rail at 1093×520 shows the whole bottom group (no fix needed); room at 1280×800 shows the short scene (fix item 11).
Final fix wave: dispatched (sonnet) with 13 items in final-fix-findings.md (BASE 5f94fff).
Final fix wave: commits 0aca0a9, 7918b8f — Vitest 1545, Playwright 17, lint and typecheck clean. Scoped re-review: all 13 addressed, no new Critical/Important. Accepted implementer choices: ErrorBoundary `fallback` prop (parent nav counts), 2 old ParentScreen tests replaced (they asserted the removed flash), welcome field description = error + help text, white-on-ink via `--surface`, room scene min-height 400px from 900px.
Final fix wave: minor (deferred): skip link keeps `href="#main-content"` (opening it in a new tab gives an unknown route); parent h1 focus shows the focus ring; raw #fff left in old styles.css rules of unrestyled screens (R2/R3); room scene at 900-960px unverified.
R1: complete (commits a646bcd..7918b8f). R2 plan committed a41fa68.
Controller visual pass (dev server :5180): landing, welcome, room at 1024 and 1366 match the mockups; at 1024 the scene is short and Robo's feet sit behind the landing code window (deferred minors confirmed, cosmetic).
Task 5: minor (deferred): save() no longer guards a non-empty name itself (step 2 gate covers it); Logo in the welcome is a link that does nothing; focus on mount skips the h1 for screen readers.
