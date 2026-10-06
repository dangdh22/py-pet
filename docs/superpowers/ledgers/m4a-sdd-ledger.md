# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m4a-cua-hang-nghi.md

Branch feat/m4a-cua-hang-nghi from main 284833e, plan commit e09ac94. Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable). Baseline npm run check: Vitest 494, pytest 21, e2e 11.
Maintainer instruction 2026-10-06: run M4, M5, M6 in turn, merge to main per milestone, record decisions to revisit in docs/superpowers/DECISIONS.md. The M4a plan was not reviewed by the maintainer (continuous run).

## Pre-flight scan

The plan was generated from a prototype (branch proto-m4a) and replayed task by task on a clean worktree from main: after each task tsc clean and the whole Vitest suite green (T1 496, T2 499, T3 508, T4 515, T5 523, T6 534, T7 540, T8 548, T9 551); final tree identical to the prototype, whose npm run check was green (Vitest 551, pytest 21, e2e 12).

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 2-6 | src/game/state.ts types (XuEntry with `day`, inventory, rewards, vacation, assigned, badges) | T1 gives the final state.ts/schema.ts; later tasks only consume. Consistent. |
| 2-6 | src/game/apply.ts | Each task gives the whole file at its step; each version builds on the previous one. Consistent. |
| 1 / 8 | src/ui/AppRoutes.test.tsx | T1 edits the older-app test; T8 appends a describe. No overlap. |
| 6 / 7-9 | routes shop/achievements/assigned, BADGES | Consumed by UI tasks. Consistent. |
| 7 / 8-9 | names.ts, i18n keys for all UI tasks | T7 adds every M4a key at once. Consistent. |
| 5 / 9 | roomCondition, weekTarget | Consistent. |
| each task | tests vs code inside the task | Replay shows each task's tests pass with its code only. |

Scan clean; no rulings needed.

Task 1: minor (deferred): XuReason/RewardStatus/questionLang literal lists duplicated between state.ts types and schema.ts enums (drift risk)
Task 1: minor (deferred): schema bounds settings (pass/help 1-100, runSeconds 1-30); M4b's input limits must stay inside them (M4b prototype limits 50-100, 30-90, 1-10: inside)
Task 1: minor (deferred): rewards requests at/decidedAt plain z.string() (ISO timestamps, set in Task 4)
Task 1: complete (commits e09ac94..ccc2d1a, review clean)
Task 2: minor (deferred): 2 long lines in apply.ts (settleWeek, completeReview); completeEvolutionTest uses localDay(now) instead of a today parameter; no test of delta 0 skipped
Task 2: complete (commits ccc2d1a..70fc81d, review clean)
Task 3: minor (deferred): streak gift test does not assert the 20 xu; streaks 7/14/30, owned gift and Vui use at full untested; buyItem adds the item before changeXu (safe behind the guard); ./shop import order
Task 3: complete (commits 70fc81d..17b7a34, review clean)
Task 4: minor (deferred, triage at final review): cleanCatalog does not reject non-finite price/limit (NaN would make a reward free and unlimited); M4b's form must not pass NaN
Task 4: minor (deferred): no test that rejected requests do not count and approved ones do toward the weekly limit, nor of a second approval; weeklyLimit 0 means "cannot ask" (undocumented); buyItem can spend xu a pending request reserved (approval then waits); import order
Task 4: complete (commits 17b7a34..b6e7481, review clean)
Task 5: Ruling: Important (missing spec 11.1 tests for vacation with streak savers, the free absent day, a full vacation week, a set-back clock) — add the 4 tests; also fix Minor 1 (drop the COUNT_LIMIT shortcut that ignores an open `since`) and Minor 2 (vacation events are ignored while the clock is set back, so a parent cannot create a retroactive vacation). Expected values computed on the prototype: savers A {07..08}: current 1, freezes 1; {06..08}: current 6, freezes 0; decay B: pin 4, vui 3; full week C: no week entry, weekTarget 0 — cost if wrong: none (tests and 2 small guards). Carry into Task 6: its whole-file apply.ts must keep the rollback guard on the 3 vacation events.
Task 5: minor (deferred): scheduleVacation has no overlap/duplicate check (M4b form validates); pruning boundary untested; room test mutates the apply result
Task 5: fix round 1/5 (3 addressed, 0 open — vacation tests for savers/decay/full week/set-back clock, COUNT_LIMIT removed, rollback guard on vacation events; commits 03fcb93..031fa9d). Expected Vitest totals now +4 (M4a end 555).
Task 5: minor (deferred): workDaysBetween loops every day of a gap (cheap); cancel-during-rollback untested
Task 5: complete (commits b6e7481..031fa9d, review clean after 1 fix round)
Task 6: minor (deferred): most state-derived badges never awarded in tests; awardBadges skipped under rollback untested; recordTime 60-day boundary untested
Task 6: minor (deferred, triage at final review): AssignedPracticeDone with an unknown id still counts as activity; SupportGiven creates a mastery entry for an unknown concept; SupportGiven/PracticeAssigned not guarded under rollback; perfect-review badge from a 1-question free review (plan-mandated, cosmetic); PRACTISING_FROM in badges.ts; KEEP_DAYS comment wording
Task 6: complete (commits 031fa9d..e2834d0, review clean)
Task 7: Ruling: (Important, plan-mandated; requirement stated by the controller's dispatch: a child must see why a button is disabled) add a reason next to disabled Mua/Dùng in the robot tab (not enough xu / already has 9 / Pin or Vui full / none left), a distinct "Xu chưa bị giữ: {xu}" label instead of reusing shop.balance, and tests for those reasons and the weekly-limit reason — cost if wrong: a few extra strings
Task 7: minor (deferred): asked status never cleared; tabs without tabpanel/arrow keys; giftDays ?? 0; owned items still show the price (CSS comes in Task 9)
Task 7: fix round 1/5 (3 addressed, 0 open — reasons for disabled shop buttons, rewards.freeXu label, tests; commits b9a61a1..2742ae4). Expected totals now: after T7 547; M4a end 558.
Task 7: complete (commits e2834d0..2742ae4, review clean after 1 fix round)
Task 8: minor (deferred, triage at final review): STUDY_ROUTES wiring to the timer untested; hidden-page branch and 60 s boundary untested; up to 45 s lost when the tab closes (no pagehide flush)
Task 8: complete (commits 2742ae4..8f12167, review clean)
Task 9: minor (deferred): vacation room test's week plan assertion has no non-vacation control (default 10 gives 10/2 difference, fine in practice)
Task 9: complete (commits 8f12167..72c7570, review clean)
Task 10: complete (commits 72c7570..bd83307, review clean). npm run check: Vitest 558, pytest 21, e2e 12.
Final review (opus): With fixes. Important: shop spends xu reserved by pending requests (negative freeXu shown); spec 5.9 "Kiên trì" badge missing; NaN/Infinity reward or bad parent events make the save unloadable.
Final: Ruling: fix wave F1-F9 (reserve xu for pending requests; Kiên trì badge; validate reward list, assigned ids, vacation dates; reward tests; toggle-off ends a range covering today; "tuần nghỉ" instead of x/0; pagehide flush; v4 sample with M4 data, regenerate backup-v4 (new on this branch, not yet released); reason styling) — cost if wrong: small
Final: deferred (wait): badge dates in ISO; T1 duplicated literals; T3/T6/T7 cosmetic minors; SettingsChanged validation moves to M4b (its cleanSettings)
Final: fix wave F1-F9 done (commits bd83307..fb74e85); re-review: all addressed, no new breakage. npm run check: Vitest 574, pytest 21, e2e 12.
Final: out of scope, carried to M4b: cleanCatalog keeps finite huge numbers (schema int may reject >2^53) — M4b form must clamp prices/limits; room.weekOff also shows when the parent sets weeklyTarget 0; .shop-reason has no CSS.
