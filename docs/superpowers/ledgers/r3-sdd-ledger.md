# SDD ledger — plan: docs/superpowers/plans/2026-10-27-r3-man-hinh-con-lai.md

Spec: docs/superpowers/specs/2026-10-27-ui-revamp-design.md (binding). Branch feat/ui-revamp-r3, worktree .claude/worktrees/ui-revamp-r3, cut from main and fast-forwarded to refs/heads/feat/ui-revamp at 0061d87 (R1 done + R2 Tasks 1-3). Plan committed de05078. Baseline 0061d87: lint, typecheck, 1628 Vitest green; e2e not run at baseline (R2 mid-milestone, e2e red by R2 plan from its Task 2 to Task 7).

## Pre-flight scan

| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 ↔ T2 | PageHead, .page, .section-title → AchievementsScreen; T1 rewrites `.achievements, .shop` to `.achievements`, T2 deletes it | OK |
| T1 ↔ T3 | PageHead, .page → BackupScreen | OK |
| T3 ↔ T4, T5 | .pin-form → ParentGate (T4); .table → ParentProgress (T5) | OK |
| T1 ↔ T4 | tabKeyTarget (vertical), .page-head, .section-title → ParentNav, ParentArea, ParentOverview | OK |
| T1 ↔ T4, T6 | parent.css, errors.css created empty by T1 and read by the T1 token test; filled by T4/T5 and T6 | OK |
| T2 ↔ T4 | T4 vacation bar "kẻ sọc xám như .form-locked" (pages.css) | OK; T4 may repeat the gradient in parent.css (one line) |
| T4 ↔ T5 | both write parent.css and delete different blocks of styles.css | OK |
| T4 ↔ T6 | T6 edits ParentScreen.tsx (panel fallback) and the crashing-tab test after T4 restructured ParentArea | OK, T6 file list names both |
| T6 ↔ R2 | T6 must not touch the `.lesson-done, .crash` line R2 Task 6 edits | OK, plan decision 10 |
| T7 ↔ T1-T6 | e2e pages.spec walks shop, achievements, backup, parent overview; guide needs fonts.css | OK |
| T1 self | test 7 needs a consumable with count > 0 and a full stat (existing "a disabled button says why" setup) | OK |
| T2 self | graduated = stage 5, formOf(5) = 4 | OK |
| T3 self | tests match markup | OK |
| T4 self | 2026-10-06 is a Tuesday → "T3"; "Xem" buttons share a name, tests scope by card | OK |
| T5 self | NumberSettings form sits inside its section; 5 sections each 1 h2 | OK |
| T6 self | UnsupportedBrowser renders Robot without providers (already true) | OK |
| T7 self | e2e must run with CI=1 after the port check | OK |

No rulings needed before Task 1.

## Tasks

Task 1: dispatched (BASE de05078, implementer sonnet)
Task 1: implementer DONE_WITH_CONCERNS, commit bd4078d (1654 Vitest). Old test "each accessory has a picture" scoped to .shop-pic svg (coin icon added a 2nd svg); extra .shop-meta/.shop-status/.shop-buttons/.shop-asked and a ShopCard component; Pin/Vui pictures drawn in ink (stat colors under 3:1 on tints). Carry to T4/T6: hex test regex also matches id selectors like #add. Review dispatched (sonnet).
Task 1: review Approved, spec ✅ (sonnet). Visual check claimed by implementer only.
Task 1: minor (deferred): tab onKeyDown does not ignore Alt/Ctrl/Meta + arrow (MapScreen has the same gap) — add one guard in each caller in the final wave.
Task 1: minor (deferred): no test for tabKeyTarget count <= 0; reward card "Đổi" aria-describedby not asserted; tabpanel has no tabIndex (empty rewards panel has no focus stop).
Task 1: minor (deferred): 2 near-duplicate reason <p> blocks in ShopCard; leftover `item-icon` class on ItemIcon svg has no CSS (general cleanup); hex test does not catch rgb()/hsl().
Task 1: complete (commits de05078..bd4078d, review clean)
Task 2: dispatched (BASE bd4078d, implementer sonnet)
Task 2: implementer DONE, commit 6ca60a8 (1658 Vitest). Ruling: form pictures are 100 px (the plan said "cỡ 100 như hiện tại" but the code had 72; the mockup draws 100) — the old data-size 72 assertion becomes 100 — cost if wrong: one number. Review dispatched (sonnet).
Task 2: review Approved, spec ✅ (sonnet).
Task 2: minor (deferred): Robo 100 px leaves ~3 px headroom in the 116 px stage (mockup draws 100 px tall ≈ size 89) — check antenna by eye; at ~320 px wide the stage is ~72 px and the svg overflows (cosmetic).
Task 2: minor (deferred): badge date note cannot be dismissed with Esc (same pattern as map captions, WCAG 1.4.13); badge tests use class queries.
Task 2: complete (commits bd4078d..6ca60a8, review clean)
Task 3: dispatched (BASE 6ca60a8, implementer sonnet)
Task 3: implementer DONE, commit be0b59c (1660 Vitest). File input box made borderless (only the selector button styled); tampered banner text in ink; extra layout classes backup-file/backup-preview/backup-actions. Review dispatched (sonnet).
Task 3: review Approved, spec ✅ (sonnet).
Task 3: minor (deferred): auto-backup table unchecked at 375 px (long names may push past the card; overflow-wrap on the name cell); table has no aria-labelledby to its h2; file picker button has no hover/active state.
Task 3: minor (deferred): global input[type=file] rule drops the input frame (only file input in src); banner classes on the tampered warning not asserted; .pin-form button justify-self start and p margin 0 are extras (Task 4 checks the gate).
Task 3: complete (commits 6ca60a8..be0b59c, review clean)
Task 4: dispatched (BASE be0b59c, implementer sonnet)
Task 4: implementer DONE_WITH_CONCERNS, commit 853ca4d (1667 Vitest). Added key overview.rewardDetail ("{name} · {price} xu") so the unit goes through t(); .parent h1 rule dropped (page-head h1 styles it); parent tabs ignore no modifier keys (same deferred minor as Task 1); gate status note mounts with the gate. Review dispatched (sonnet).
Task 4: review Approved, spec ✅ (sonnet).
Task 4: minor (deferred): show(next) with next === tab would leave the focus flag set (unreachable today: no "Xem" targets overview) — reset it in show() when next === tab.
Task 4: minor (deferred): gate role="status" note mounts with the gate (plan-mandated markup); alert details untested with several items; reset form pin-form untested; alertCard test helper depends on h2.nextElementSibling; long concept/reward lists in a card have no cap; .minutes-value 11 px (plan value).
Task 4: complete (commits be0b59c..853ca4d, review clean)
Task 5: dispatched (BASE 853ca4d, implementer sonnet)
Task 5: implementer DONE_WITH_CONCERNS, commit 44cb24d (1672 Vitest). Extra classes request-short, form-actions, vacation-list, small on "Hủy"; vacation form class settings-row renamed schedule-form (2-column grid broke the date labels). Review dispatched (sonnet).
Task 5: review Approved, spec ✅ (sonnet).
Task 5: minor (deferred): .schedule-form date inputs are 13 px (add font-size 16px); comment "on a phone" on .reward-rows li + li is wrong; redundant .parent-help > p margin; card grid lacks minmax(0, 1fr) and the progress table has no overflow-x at 375 px; disabled "Duyệt" not tied to its reason by aria-describedby (pre-existing); test total 1667 → 1672 with 4 tests added (+1 untraced, likely a stale Task 4 count).
Task 5: complete (commits 853ca4d..44cb24d, review clean)
PAUSED 2026-10-27 by the maintainer ("Dừng R3 ở đây, chưa làm tiếp"). Resume at Task 6 (brief task-6-brief.md already extracted). Not done: Task 6, Task 7, final review, npm run check (e2e never run on this branch), ledger copy to docs/superpowers/ledgers/r3-sdd-ledger.md.
RESUMED 2026-10-28 by the maintainer ("Kiểm tra đã làm đến đâu, sau đó tiếp tục công việc"). R2 finished on refs/heads/feat/ui-revamp (4c3dd2f, R2 ledger saved); dry-run merge into R3 conflicts only in src/styles.css.
Task 6: dispatched (BASE 44cb24d, implementer sonnet)
Maintainer decision (2026-10-28, asked in chat): merge refs/heads/feat/ui-revamp (R2 done) into feat/ui-revamp-r3 before Task 7, so npm run check runs on R2 + R3; resolve the src/styles.css conflict here. Merge after Task 6 is reviewed.
Task 6: implementer DONE, commit 1724efb (1676 Vitest). Ruling: the plan said "dải tiêu đề cố định" for the gallery, but the only strip with a bottom border is the `floor` style (a floor line, not a sticky header); the 2 px ink border went there — cost if wrong: none (one inline style). Extras: error-card padding/width/centered text, danger row for the failed raw export. Review dispatched (sonnet).
Task 6: review Approved, spec ✅ (sonnet).
Task 6: minor (deferred): redundant color in `.error-card p[role="alert"]` (only font-weight matters); "white box" test asserts class names only (computed ink vs danger color untested; check in e2e); min-height 100vh could add 100dvh; `.crash` selector now dead (delete after the R2 merge).
Task 6: complete (commits 44cb24d..1724efb, review clean)
Merge: refs/heads/feat/ui-revamp (4c3dd2f) merged into feat/ui-revamp-r3 as ab748ee; styles.css conflict = both sides deleted their block, both deletions kept. After merge: lint, typecheck, 1723 Vitest green.
Ruling: with R2 merged, Task 7 deletes the now-dead `.crash` rule from src/styles.css (decision 10 kept it only to avoid a conflict with R2) — cost if wrong: one CSS line.
Task 7: dispatched (BASE ab748ee, implementer sonnet)
Task 7: implementer DONE, commits 2844c3c (guide, STATUS list, .crash removed), 6de744e (e2e pages.spec, subpath guide checks). CI=1 npm run check exit 0: Vitest 1723, pytest 21, content valid, Playwright 19 (R2 specs included). STATUS "Môi trường" counts (1418 Vitest, 17 Playwright) left stale (brief: no other section). Review dispatched (sonnet).
Task 7: review Approved, spec ✅ (sonnet).
Task 7: minor (deferred): guide sentences 1 and 6 describe the wide layout (below 1100 px the menu shows icons and the status is a square); sentence 7 "on the landing page" opens the PIN only with a profile; pages.spec "Khu phụ huynh" link not exact; subpath "Mở app" accepts room or landing; STATUS "Môi trường" counts stale (1418/17 → 1723/19).
Task 7: complete (commits ab748ee..6de744e, review clean)
Final review: dispatched (opus, range 4c3dd2f..6de744e = R3 on top of the finished R2)
Final review: Ready to merge "Yes" — 0 Critical, 0 Important, 10 Minor + deferred triage (opus).
Ruling: one fix wave for final-review Minors 1-4, 6, 9 (page head p margin, 900→899 breakpoint, 16 px date inputs, card-title look in Progress/Rewards/Settings, error-state main landmark, table scroll wrappers + 375 px e2e pass), the Alt/Ctrl/Meta guard in the 2 R3 tab lists only (MapScreen is R2's; its guard and the shared hook go to the CSS/cleanup pass), the show() flag reset, guide sentence 7 "(khi đã có hồ sơ)", STATUS env counts — cheap, visible at the maintainer's visual check, or spec 6.4 — cost if wrong: one more small diff to review.
Ruling: spec 5.5 card titles: Progress, Rewards and Settings cards use the `.card-title` label look; Help cards keep a larger h2 because it is the concept name the parent reads — cost if wrong: one CSS rule.
Ruling: final-review Minors 5 (shared tab hook incl. MapScreen), 7 (badge note and map captions WCAG 1.4.13), 8 (shared rules into base.css, class prefixes) and the "can wait" triage list go to the general CSS cleanup after the R2+R3 merge — cost if wrong: they stay as minor a11y/maintainability debt until then.
Final fix wave: dispatched (sonnet, BASE 6de744e), findings in final-fix-findings.md
Final fix wave: implementer DONE, commit 3e957be. CI=1 npm run check exit 0: Vitest 1727, pytest 21, Playwright 20 (19 + subpath). Item 6 guard untested (unreachable path); CSS items checked by screenshot; extra `.backup-page .table-scroll { width: 100% }`. Scoped re-review dispatched (sonnet).
Final fix wave: scoped re-review (sonnet): 10/10 ADDRESSED, no new breakage (commits 6de744e..3e957be).
Final fix wave: minor (deferred): in Settings an h2 directly above an h3 now share the 13 px caps look (flat hierarchy in "Dữ liệu" and "Nhật ký"); the h3 could take --ink if the maintainer dislikes it at the visual check.
For the general CSS cleanup after merging R2+R3 into feat/ui-revamp: final-review Minors 5 (one roving-tab hook for Shop, ParentNav and MapScreen, with the modifier guard for MapScreen), 7 (badge date note and map captions: WCAG 1.4.13 Esc), 8 (shared rules .table, .table-scroll, input[type=file], .tag, .link-button, button.danger into base.css; prefix the global page classes .form, .forms, .badge, .tag, .big, .page), the deferred minors of Tasks 1-7 above, the leftover `item-icon` class, and the old non-R3 rules still in src/styles.css.
R3: complete (commits de05078..3e957be, merge ab748ee of R2; final review "Yes", fix wave clean).
