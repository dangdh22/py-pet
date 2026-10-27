# SDD ledger — plan: docs/superpowers/plans/2026-10-27-r2-man-hinh-hoc.md

Spec: docs/superpowers/specs/2026-10-27-ui-revamp-design.md (binding). Branch feat/ui-revamp, worktree .claude/worktrees/ui-revamp. Baseline cda744f (R1 complete: Vitest 1545, Playwright 17, lint/typecheck clean). R1 ledger: docs/superpowers/ledgers/r1-sdd-ledger.md.

## Pre-flight scan

| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 ↔ T4 | `.kicker` (base.css), `StepSquares` → problem card; both edit LessonScreen.test.tsx | OK (T4 edits hint button names only) |
| T1 ↔ T6 | `GoalSquares` → ResultView; both edit AppRoutes.test.tsx | OK |
| T1 ↔ T3 | T1 renames `.lesson .card` to `.study-page .card`; T3 deletes `.study-page .card` (theory-card replaces it) | OK, ordered |
| T1 self | deletes `.room` from styles.css; plan lists the notice users that move to StudyNotice | `.room` may have other users (result branches of Review/Remedial/Practice) → Ruling 1 |
| T3 ↔ T4 | `.box`, `.box-head`, CodeEditor, OutputPanel → split layout | OK |
| T4 ↔ T5 | `ExampleTable`, `ExerciseHelp`, `FAILED_SUBMITS_BEFORE_SOLUTION` → PuzzleExerciseView; T4 touches PuzzleExerciseView imports only | OK |
| T2 self | `formatScore` consumed from ExamRunner.tsx | must be exported; implementer checks (small export if missing) |
| T2/T3/T6 ↔ R1 tokens.test.ts | raw colors guarded in base.css and shell.css only; plan's named raw values live in study.css, map.css, editorTheme.ts | OK |
| T5 ↔ R1 | `.lang-switch` hover in base.css uses `--bg` | OK |
| T6 self | test 3 counts h1 through room → lesson → result → next lesson | OK |
| T7 | consumes all; e2e red from T2 to T7 | OK |
| T4 self, T5 self | tests match steps | OK |

Ruling 1: Task 1 removes `.room` only after a grep shows no remaining user; any remaining non-notice user (for example a done/result branch) moves to the new card look of StudyNotice or `.study-page` in the same task — cost if wrong: an unstyled message until T6.

## Tasks

Task 1: dispatched (BASE cda744f, implementer sonnet)
Task 1: implementer DONE, commit f5fabc8 (Vitest 1568). `.room` had no user left; removed. SessionScreen/ExamRunner inner empty <p> unchanged (not in brief). Review dispatched (sonnet).
Task 1: review Approved, spec ✅.
Task 1: minor (deferred): lesson step squares mark viewed cards ahead as todo after "Quay lại" (doneSteps holds exercises only); crash test restores console.error outside finally; bar-order test asserts literal runner class; truncated h1 has no title tooltip; StudyNotice states have no h1 (check in final review); `.kicker` unused until Task 4; bar may overflow under ~600px (not a target).
Task 1: complete (commits cda744f..f5fabc8, review clean)
Task 2: dispatched (BASE f5fabc8, implementer sonnet)
Task 2: implementer DONE_WITH_CONCERNS, commit 862f80a (Vitest 1581). `.sr-only` moved to base.css; greys via color-mix; wrapped tracks keep a connector stub; no grey Robo in the evolution card. e2e exam/review map queries red until Task 7. Review dispatched (sonnet).
Task 2: review Approved, spec ✅.
Task 2: minor (deferred): stage-tab keydown swallows Alt/Cmd+Arrow (browser Back) — return early on modifiers; invisible node captions may widen the page at narrow widths (check overflow); `--map-soft` grey could be a shared token for R3; `bestPass` is the latest passed paper (naming); UI test gaps (no evolution card for a stage without a test, locked node tabindex, legend entries); add role="list" to the styled ol; evolution card as a region landmark.
Task 2: complete (commits f5fabc8..862f80a, review clean)
Task 3: dispatched (BASE 862f80a, implementer sonnet)
Task 3: implementer DONE_WITH_CONCERNS, commit 56c7332 (Vitest 1614). Existing tests mock CodeEditor; new CodeEditor.test stubs Range rects.
Ruling: JetBrains Mono ligatures are turned off everywhere mono text shows (children must see `!=` as typed, not ≠) — not in the plan; found by the implementer — cost if wrong: none visible. Sent to the implementer before review.
Task 3: ruling implemented, commit 0061d87 (Vitest 1628; ligatures off in 12 mono rules + editor theme, guarded by src/styles/ligatures.test.ts). Review dispatched (sonnet) over 862f80a..0061d87.
Task 3: review Needs fixes — Important: (1) selection invisible on the cursor/error line (opaque line tints paint over CodeMirror's selection layer; verified in the dev app); (2) ligature fix repeated in 12 rules with a dead font-feature-settings pair.
Ruling: line tints become translucent rgba whose composite over the background matches the plan's hex; contrast tests check composites over background and selection — the plan's opaque EDITOR_COLORS hid the selection — cost if wrong: slightly different tint.
Ruling: one inherited `font-variant-ligatures: none` on body + the 2 `font:` shorthand mono rules + the editor theme; drop font-feature-settings — cost if wrong: Lexend also loses ligatures (none matter).
Task 3: fix round 1 sent to the implementer.
Task 3: fix round 1/5 (2 addressed, 0 open — translucent line tints rgba 0.4 composite to plan hex; single body ligature rule; commits 0061d87..4998a95)
Task 3: complete (commits 862f80a..4998a95, review clean after 1 fix round)
Task 4: dispatched (BASE 4998a95, implementer sonnet)
Task 4: implementer DONE, commit 1e374ff (Vitest 1647). `.exercise-actions` removed, so PuzzleExerciseView's submit row is unstyled until Task 5; disabled solution button dashed/muted; solution reason text aria-hidden (per brief). Review dispatched (sonnet).
Task 4: review Approved, spec ✅ (`.exercise-actions` gap judged acceptable, Task 5 replaces the markup).
Ruling: carry 3 Task 4 minors into Task 5 (it reuses ExerciseHelp): `aria-describedby` from the disabled "Xem lời giải" to its "sau 3 lần sai" text, ExerciseHelp returns null when empty, test that the solution button hides after it is shown — cost if wrong: small extra diff in Task 5.
Task 4: minor (deferred): input-box markup duplicated in CodeExerciseView and ExamCodeView; exam RobotBubble moved to the left card (matches lesson view).
Task 4: complete (commits 4998a95..1e374ff, review clean)
Task 5: dispatched (BASE 1e374ff, implementer sonnet)
Task 5: implementer DONE, commit 661e0fc (Vitest 1662). Found `<code>` inside `<pre>` falls back to the UA monospace.
Ruling: one base rule `pre, code, kbd, samp { font-family: var(--font-mono) }` instead of per-rule fixes — the UA sets monospace on them — cost if wrong: none. Sent to the implementer before review.
Task 5: ruling done, commit d093da7 (Vitest 1663). Inline <code> now same size as its text (watch in visual pass). Review dispatched (sonnet) over 1e374ff..d093da7.
Task 5: review Approved, spec ✅.
Task 5: minor (deferred): double focus ring on a choice (radio ring + block ring); redundant font-family on .parsons-line/.fill-template after the base pre rule; inline <code> now full text size (consider `:not(pre) > code { font-size: 0.9em }`); scrollable parsons line may become a tab stop; selected choice keeps a shadow after the check; 760px puzzle card (implementer's call).
Task 5: complete (commits 1e374ff..d093da7, review clean)
Task 6: dispatched (BASE d093da7, implementer sonnet)
Task 6: implementer DONE, commit 3eb8652 (Vitest 1670). Inline streak chip in ResultView (reads `after`); #fff → var(--surface) in evolution CSS; .evo-skip hover/press shadows reset. Review dispatched (sonnet).
Task 6: review Approved, spec ✅.
Task 6: minor (deferred): ResultView streak chip duplicates StreakChip markup; `.result-card h1:focus` rule sits in styles.css instead of study.css; brittle exact-className assertion in ResultView.test; "Bỏ qua" focus ring merges with its yellow shadow at the bottom-right; EvolutionPassed/Failed not seen in a browser.
Task 6: complete (commits d093da7..3eb8652, review clean)
Task 7: dispatched (BASE 3eb8652, implementer sonnet)
Task 7: implementer DONE, commit 7e3d142 — `npm run check` exit 0 (Vitest 1670, pytest 21, Playwright 18). Removed `.lesson-list a`, `.badge-done`, `.exercise-prompt`. Review dispatched (haiku).
Task 7: review Approved.
Ruling: accept removing `.exercise-prompt` from styles.css — its 2 declarations are always overridden by study.css (verified), so computed style is unchanged — cost if wrong: one rule to restore.
Task 7: minor (deferred): `.first()` after name filter assumes stations unlock in map order; class locators `.focus-bar` could be getByRole("banner").
Task 7: complete (commits 3eb8652..7e3d142, review clean)
Final review: dispatched (opus, range cda744f..7e3d142)
Final review: "With fixes" — 0 Critical, 3 Important (stage tabs show the number twice with real titles; misconception help misaligned; test comparison cramped at laptop widths), 7 Minor + triage. Reviewer used the :5180 test profile (progress changed there only).
Final fix wave: dispatched (sonnet) with 10 items in final-fix-findings.md (Important 1-3, map modifier keys, focusable empty tabpanel, StudyNotice h1, no shadow after check, legend shapes only, study-nav as wide as the card, formatScore util).
Deferred to the maintainer's visual pass: blank height in fill code, inline <code> size, EvolutionPassed/Failed cards, "Bỏ qua" ring, double focus ring on choices.
Final fix wave: commit de1d42e — `npm run check` exit 0 (Vitest 1676, pytest 21, Playwright 18). Note for merge: ParentProgress.tsx import changed (formatScore moved to src/ui/format.ts). Scoped re-review dispatched (sonnet).
Final fix wave: re-review — all 10 addressed, no new Critical/Important.
Final fix wave: minor (deferred): evolution-only tabpanel test does not isolate its clause; stale comment at study.css ~294; a lone "Tiếp" in `.study-nav` (review, practice, tests) sits at the card's left edge — fix in the post-merge polish (`margin-left: auto` on a lone child); `.box-head` raw #f6efdc (plan-named).
R2: complete (commits cda744f..de1d42e).
For R3 / merge: `--map-soft` shared token, `.result-card h1:focus` move, `.item-broken` style; expect conflicts in vi.ts, en.ts, styles.css, AppRoutes.tsx; re-run the dead-CSS check after merging.
Task 3: minor (deferred): focus ring overlaps the bottom of the main.py tab strip.
Coordination: R3 runs in its own session (local_a08bf06d-14eb-43e5-957b-53dcd8d44908) on its own branch from feat/ui-revamp; it avoids R2 files and checks ports 4173/4174 before e2e. Merge R3 into feat/ui-revamp after R2, asking the maintainer first.
