# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m4b-khu-phu-huynh.md

Branch feat/m4b-khu-phu-huynh from main e69c943, plan commit d10bf95. Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable). Baseline npm run check on main: Vitest 574, pytest 21, e2e 12.
Maintainer instruction 2026-10-06: run M4, M5, M6 in turn, merge to main per milestone, record decisions to revisit in docs/superpowers/DECISIONS.md. The M4b plan was not reviewed by the maintainer (continuous run).

## Pre-flight scan

The plan was generated from a prototype (branch proto-m4b). Its blocks (whole files and exact diffs) were replayed mechanically on a clean worktree from main, task by task: after each task tsc clean and the whole Vitest suite green (T1 580, T2 587, T3 595, T4 597, T5 599, T6 602, T7 607, T8 610, T9 610); final tree identical to the prototype, whose npm run check was green (Vitest 610, pytest 21, e2e 14).

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 2 | src/ui/GameProvider.tsx, GameProvider.test.tsx | Both diffs; T2's diff context is T1's result (replayed). Consistent. |
| 1 / 7 | SETTING_LIMITS, cleanSettings | T7 form uses the limits; rules still clamp. Consistent. |
| 2 / 3, 4, 7, 8 | setPin, pinResetAt, attemptsFor, eraseAll, errorLog, "load-failed" | Produced in T2, consumed later. Consistent. |
| 3 / 4-7 | ParentScreen.tsx (T3 whole file, T4-T7 diffs add one tab each) | Replayed. Consistent. |
| 3 / 4, 6 | parentStats, formatDateTime | Consistent. |
| 1, 3-8 | src/i18n/vi.ts, en.ts (diffs per task) | Each task adds its own keys; parity test green after each. |
| 3, 4, 6, 7 | src/styles.css diffs | Consistent. |
| 6 | realRewards.ts limits + ParentRewards max attrs | Consistent. |
| each task | tests vs code inside the task | Replay shows each task's tests pass with its code only. |

Scan clean; no rulings needed.
Task 1: implementer haiku, commit f37df38; tree identical to prototype 3adc1ff; review dispatched (sonnet)
Task 1: minor (deferred, fix at final review): cleanSettings uses Number(), so null/""/false become 0 and clamp to the minimum instead of keeping the old value (comment says "not a number keeps the old one"); guard with typeof value === "number"
Task 1: minor (deferred): questionLang change does not update a question card already open (takes effect on the next card); no test that RunnerTimeout keeps status/retry and that a caller timeout wins
Task 1: complete (commits d10bf95..f37df38, review clean)
Task 2: implementer haiku, commit d907f83; tree identical to prototype ea79172; review dispatched (sonnet)
Task 2: Ruling: Important (plan-mandated) duplicated replace protocol in GameProvider importBackup/eraseAll — extract one local helper both use. Also fix Minors: (a) import of a file without a PIN keeps the device pinResetAt too; (b) metaSchema checks pinResetAt (string|null, optional); (c) setPin writes through the same queue as import/erase; (d) tests: malformed meta (errorLog not an array) rejected, setPin(…, false) then checkPin true, import without PIN keeps pinResetAt. Fix round waits until Task 3's implementer has committed (same branch). Cost if wrong: none.
Task 2: minor (deferred): store.test order check derives order from the timestamp text (brittle but correct)
Task 3: implementer haiku, commit 2f4a898; review dispatched (sonnet)
Task 3: Ruling: Important (auto-lock idle clock restarts on any ParentScreen re-render because the lock effect depends on an inline onLock) — keep onLock in a ref / stable callback, effect mount-only, add a test (4 min, re-render, 2 min, locked). Also fix Minors: busy reset in finally with an error message, a back button from the reset form (reuse backup.cancel), PIN-reset banner role="status", English counts reworded so n=1 reads right ("Reward requests waiting: {n}" etc.). Fix round after Task 2's fix commits. Cost if wrong: none.
Task 3: minor (deferred): tablist has no aria-controls/tabpanel; Math.round minutes shows 0 under 30 s; PRACTISING_FROM imported from badges.ts
Task 2: fix round 1/5 (5 addressed, 0 open — replaceData helper, pinResetAt kept on import without a PIN, setPin queued, metaSchema pinResetAt, 4 tests; commit 2d371c3). Vitest 597.
Task 2: minor (deferred): import with a PIN takes payload.meta.pinResetAt without `?? null` (decodeBackup normalises it)
Task 2: complete (commits f37df38..d907f83 + fix 2d371c3, review clean after 1 fix round)
Task 3: fix round 1/5 (4 addressed, 1 open — code of finding 1 fixed (lockRef, mount-only effect) but its test never re-renders between the time steps and passes on the old code; commit a5f1bf7). Round 2 (test only, plus drop the unused LOCK_AFTER_MS import or use it) after Task 4's implementer commits.
Task 4: implementer haiku, commit 58288ef; new files identical to prototype; review dispatched (sonnet)
Task 4: minor (deferred, fix at final review): "assign more practice" disabled only by local state, so after a tab switch it can assign the same concept again — derive from state.assigned; buildPracticeSet runs every render just for canPractice (consumes rng) — compute without the draw
Task 4: minor (deferred): effect deps omit game.attemptsFor; choice text shown in uiLang not attempt.lang; no tests for no-practice / no-evidence / attemptsFor rejection; evidence lacks output vs expected (DECISIONS M4b item 3)
Task 4: complete (commits a5f1bf7..58288ef, review clean)
Task 3: fix round 2/5 (1 addressed, 0 open — re-render test with a wrapper; controller verified it fails on the old ParentScreen.tsx (2d371c3) and passes now; commit d7ec9b1). Vitest 601.
Task 3: minor (deferred): the new test's react import sits after vitest imports and its comments are wordy
Task 3: complete (commits d907f83..2f4a898 + fixes a5f1bf7, d7ec9b1, review clean after 2 fix rounds)
Task 5: implementer haiku, commit ec9ea4d; new files identical to prototype; review dispatched (sonnet)
Task 5: minor (deferred): empty nested <ul> per lesson without stats; raw exercise id shown; evolution history oldest first; no test of a lesson not done / passed verdict; time and question language per lesson not shown (plan decision 5, DECISIONS)
Task 5: complete (commits d7ec9b1..ec9ea4d, review clean)
Task 6: implementer haiku, commit 50fcfb3; files identical to prototype; review dispatched (sonnet)
Task 6: Ruling: Important (plan-mandated) after Save the edit rows keep raw values while the stored catalog is cleaned (clamped, floored, blank names dropped) and the screen says "saved" — after dispatch set rows to cleanCatalog(rows); test: price above the maximum shows the maximum after save, a blank-name row disappears. Also split the long price input line. Fix after Task 7's implementer commits. Cost if wrong: none.
Task 6: minor (deferred): an emptied number field shows 0; no UI test of the history cap/order; unsaved edits lost on tab switch; progress-table CSS rides in this task's commit
Task 7: implementer haiku, commit 1886157; new files identical to prototype; review dispatched (sonnet)
Task 7: Ruling: Important (plan-mandated) the goals form says "saved" while showing the unclamped value — after save, refill the fields from the cleaned settings; test asserts the field shows 50 after typing 30. Also fix Minors: scheduling an exact duplicate range is refused (no duplicate keys); setPin and eraseAll failures show an error (banner.writeFailed, role="alert"); PIN test checks the new PIN works. Fix after Task 6's fix commits. Cost if wrong: none.
Task 7: minor (deferred): vacation buttons give no feedback while the clock is set back (events are no-ops); warning text fixed to "clock set back" for any kind; erase test does not check a wrong name keeps the button off
Task 6: fix round 1/5 (1 addressed + format, 0 open — rows set to cleanCatalog(rows) after save, test of clamp and blank-row drop; commit 531f692; controller read the small diff in place of a re-review). Vitest 612.
Task 6: complete (commits ec9ea4d..50fcfb3 + fix 531f692, review clean after 1 fix round)
Task 7: fix round 1/5 (4 addressed, 0 open — fields refilled from cleanSettings after save, duplicate range refused, PIN/erase failures shown, PIN test verifies the hash; commit 6395b41; controller read the diff in place of a re-review). Vitest 612.
Task 7: minor (deferred, final batch): unused `current` parameter in setValues updater; a duplicate range is refused silently
Task 7: complete (commits 50fcfb3..1886157 + fix 6395b41, review clean after 1 fix round)
Task 8: implementer haiku, commit d83e4dc; files identical to prototype; review dispatched (sonnet)
Task 8: minor (deferred, fix at final review): raw export includes meta.pin (a 4-6 digit PIN hash is brute-forceable) and meta.autoBackups — strip both, the file is meant for support
Task 8: minor (deferred): same-direction focus branch and the fill-blank lock untested; export shown for "unreadable" where it likely fails (handled)
Task 8: complete (commits 6395b41..d83e4dc, review clean)
Task 9: implementer haiku, commit 17395f2; e2e file identical to prototype (controller check in place of a task review: verbatim test file only); npm run check: Vitest 615, pytest 21, content ok, e2e 14
Task 9: complete (commits d83e4dc..17395f2)
Final review (opus): ready to merge with fixes. Important 1: import of a file with a PIN overwrote the device pinResetAt (reset trace lost). Minors: blank settings field saves the minimum; pass mark also applies to topic tests (DECISIONS); DECISIONS missing plan decisions 4, 5, 8; erase has no backup (DECISIONS); help card shows a misconception count only (can wait).
Final review: Ruling: fix wave = Important 1 + T1/Minor 1 (cleanSettings typeof guard, blank field skipped), T4 assigned from state and canPractice without the rng, T8 raw export without pin/autoBackups, T7 unused parameter. No auto-backup on erase (the parent asked to erase everything; recorded in DECISIONS). DECISIONS entries for the pass mark on topic tests, plan decisions 4/5/8 and the reset+erase consequence written by the controller. Cost if wrong: erase stays unrecoverable by design.
Final fix wave: commit 32d07f6 (pinResetAt keeps the later stamp; blank goal fields ignored and cleanSettings accepts only finite numbers; assigned practice derived from state, canPractice without the rng; raw export without pin/autoBackups; unused parameter). Scoped re-review: all 5 addressed, no new breakage. npm run check: Vitest 619, pytest 21, e2e 14.
