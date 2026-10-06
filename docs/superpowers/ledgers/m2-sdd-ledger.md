# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md
Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable)
Branch: feat/m2-vong-choi-pet, worktree .worktrees/m2-vong-choi-pet, merge base 4a29a6c, plan commit c9bf7aa
Baseline: npm run check green (vitest 193, pytest 17, e2e 5)
Env: .venv is a symlink to main checkout venv (excluded via .git/info/exclude); public/pyodide copied.

## Pre-flight scan
| Pair / task | Produces vs consumes | Finding |
|---|---|---|
| T1→T2,T3 | GameState, rewards consts, dates | match |
| T3→T10,T11,T12 | lessonStatuses/nextLessonId/growth/petCondition/displayStreak/todayPoints/weekLessons | match; fixture stage XP 38 verified (10+15+3+10) |
| T4→T5,T6,T7 | GameStore, AppMeta, emptyMeta, appendErrorLog, AttemptInput | match; JudgeStatus exists in src/runner/judge.ts |
| T5→T7,T13 | encodeBackup/decodeBackup/previewOf/buildBackupPayload/backupFileName, hashPin/verifyPin | match |
| T6→T8,T9 | openGameStore/acquireTabLock/requestPersistence | match |
| T7→T8..T13 | useGame API, renderWithGame, useLogError, i18n keys | match; explainWithChain signature verified |
| T9→T10 | HomeScreen edited in T9, deleted in T10 | consistent |
| T9→T12 | LessonScreen onComplete removed T9; T12 adds ResultView | consistent; T12 removes unused lesson.backHome |
| T10→T11 | T10 AppRoutes test opens t.l2 via "Học tiếp" with t.l1 done, so T11 lock doesn't break it | fixed in plan self-review |
| T11→T13 | Route "backup" shows Room until T13 | consistent |
| T12 | CodeExerciseView state names hintsShown/failedSubmits/solutionShown, setJudgeResult(result); QuestionCard selected/lang | verified in M1 code |
| T13 | ErrorBoundary contextType ErrorLogContext from contexts.tsx (T7) | match |
| T14 | lesson 1 content: ex1 prints "Xin chào Robo" (1 test), q1 mcq correct print("Hello") | verified; XP 28/xu 8 consistent with T2 rules |
| T1..T14 self-consistency | tests vs code per task | checked during plan self-review; jsdom supports crypto.subtle PBKDF2, randomUUID, File.text (probed) |
Risk noted: e2e reload with Web Locks — old document must release lock before new one runs (assumption; e2e T14 will reveal).
Scan result: no open conflicts.

## Tasks
Task 1: dispatched (BASE c9bf7aa, haiku, agent abfad5f6e86cea25b)
Task 1: minor (deferred): dates.ts toUtcMs does not validate malformed day strings (NaN -> RangeError in addDays); imported state could reach it
Task 1: minor (deferred): STREAK_MILESTONES Record<number,number> lookup typed number not number|undefined (plan-mandated type)
Task 1: complete (commits c9bf7aa..f82e180, review clean)
Task 2: dispatched (BASE f82e180, sonnet, agent aa95bd4ce1510ad29)
Task 2: Ruling: streak lapse without savers — stored streak.current becomes 1 on the next achieved day; displayStreak (Task 3) shows 0 meanwhile, matching spec 5.8 "về 0" on screen — cost if wrong: stored value differs from spec wording only; no visible difference
Task 2: Ruling: clock rollback still pays XP/xu/Pin for real learning but skips decay, streak points and week count (spec 5.14 forbids DayRollover, not rewards) — cost if wrong: a child who sets the clock back can still earn XP/xu; low abuse value
Task 2: minor (deferred): apply.test.ts missing tests — lesson on first day of new week ordering; multi-day miss with partial savers; 14/30 milestones; null lastActiveDay path
Task 2: minor (deferred): SettingsChanged patch not validated (dailyGoal 0, negative graceDays) — settings UI is M4
Task 2: complete (commits f82e180..915d819, review clean)
Task 3: dispatched (BASE 915d819, haiku, agent a9bdbd07139540eda)
Task 3: minor (deferred): nextLessonId duplicates the scan in lessonStatuses (plan-mandated, small)
Task 3: minor (deferred): progress.test.ts lacks vui=2 sleepy case and more displayStreak freeze cases
Task 3: complete (commits 915d819..da6cd53, review clean)
Task 4: dispatched (BASE da6cd53, sonnet, agent adc06b53dc514de3a)
Task 4: minor (deferred, consider before merge): readMeta does not merge emptyMeta() defaults — imported/old meta missing errorLog/autoBackups would throw in appendErrorLog
Task 4: minor (deferred, consider before merge): exportProfiles casts missing state row — one corrupt profile aborts the whole export (the crash-screen escape hatch)
Task 4: minor (deferred): saveState does not check profile exists; MemoryStore.replaceAll not atomic on clone failure; AttemptInput comment garbled; coverage gaps (cross-profile trim, ChoiceAttempt, saveState without attempt)
Task 4: complete (commits da6cd53..e3a588b, review clean)
Task 5: dispatched (BASE e3a588b, sonnet, agent aa86b4d7cea8116d5)
Task 5: minor (deferred, consider before merge): decodeBackup rejects (throws) for envelope with schemaVersion 0/negative/fraction via migrateBackup — import UI could crash instead of "not a backup" (Review Focus 5)
Task 5: minor (deferred, consider before merge): previewOf throws on hand-edited profiles like [{}] with a valid envelope (Review Focus 5)
Task 5: minor (deferred): backupFileName regex uses literal combining chars (plan text lost the ̀-ͯ escapes when written) — rewrite as escapes for readability
Task 5: minor (deferred): verifyPin trusts stored.iterations (no bound)
Task 5: complete (commits e3a588b..c23f8ac, review clean)
Task 6: dispatched (BASE c23f8ac, haiku, agent ac9df82652716c9ea)
Task 6: Ruling: acquireTabLock must fail open (resolve true) when locks.request rejects — matches the plan's "no Web Locks -> allow writing" behavior and Review Focus 4 (app stays usable) — cost if wrong: a broken Locks API could allow 2 writer tabs, same as browsers without the API
Task 6: Ruling: amend unpushed local commit 8e129a6 to restore the required trailer — local branch, never pushed — cost if wrong: none (SHA changes before anyone else sees it)
Task 6: minor (deferred): openGameStore catch drops the error silently (plan-mandated); FakeLocks never releases
Task 6: fix round 1/5 (2 addressed, 0 open — trailer amended, fail-open on lock rejection; commits 8f124ef..922fde6)
Task 6: complete (commits c23f8ac..922fde6, review clean)
Task 7: dispatched (BASE 922fde6, sonnet, agent a76e6243f7af1cf8b)
Task 7: Ruling: plan-mandated importBackup race (writes enqueued after import can overwrite imported state) — fix it: import runs inside the write queue, a replacing flag set at import start makes enqueue drop later writes (incl. draft timers and unmount flush), flag cleared and error rethrown if replace fails — spec 6.4 requires imported data to land intact — cost if wrong: small extra code in GameProvider
Task 7: ⚠️ resolved: stable clock/onReplaced — Task 9 App uses module-level systemClock and reloadPage defaults; GameRoot passes them through unchanged
Task 7: minor (deferred, consider before merge): exportBackup reads outside the queue — state/attempts may disagree if a save lands between reads
Task 7: minor (deferred): writeFailed sticky and cause not logged; visibilitychange writes even same day; test leaks visibilityState/document.title; coverage gaps (retry-once success, useExplain logging, unmount draft flush, StrictMode); banner.backupReminder hard-codes 7 (plan-mandated); no clean RED run recorded
Task 7: fix round 1/5 (1 addressed, 0 open — import inside write queue with replacing flag; commits 410607a..f42040a)
Task 7: minor (deferred): import drops drafts typed in last 400 ms and writes made during a failed import (ruling accepts)
Task 7: carry to Task 13: guard the import confirm button against a double click (second importBackup would back up the first import's data)
Task 7: complete (commits 922fde6..f42040a, review clean)
Task 8: dispatched (BASE f42040a, sonnet, agent a8f8578b933b6d99e)
Task 8: Ruling: plan-mandated onboarding write order — hash the PIN first, write meta.pin before createProfile (activeProfileId only set once the PIN exists), try/catch/finally with a new i18n key onboarding.errorSave, null loadActive treated as an error — spec 6.3 needs the PIN to gate import; Review Focus 4 needs a usable app on write failure — cost if wrong: one extra string pair
Task 8: minor (deferred): rejection tests do not assert nothing persisted; unused fill() helper in test (plan-mandated); "Robo" default duplicated; no maxLength on PIN inputs
Task 8: fix round 1/5 (1 addressed, 0 open — PIN before profile, try/catch with onboarding.errorSave; commits 7ca5605..5bf083d)
Task 8: complete (commits f42040a..5bf083d, review clean)
Task 9: dispatched (BASE 5bf083d, sonnet, agent ae23edd0249889c5e)
Task 9: ⚠️ resolved: openGameStore catches and DexieStore.open only opens/creates schema (no data writes); acquireTabLock fails open since Task 6 fix; #/backup route lands in Task 13 (plan order)
Task 9: Ruling: plan-mandated GameRoot treats a rejected loadActive as "no profile" and sends the child to onboarding (new profile would replace activeProfileId, hiding old data) — fix: a load error shows a role=alert screen with Robot sad, existing keys app.crash + app.reload (reload button), never onboarding — Review Focus 4 / no silent data loss — cost if wrong: a transient read error needs a manual reload
Task 9: minor (deferred): AppRoutes.test rewrite dropped "Bài học" heading, reload-button and unknown-lesson (#/lesson/khong-co) assertions; second-tab test does not assert the store is untouched; HomeScreen builds a Set per render
Task 9: fix round 1/5 (1 addressed, 0 open — load error screen instead of onboarding; commits 053f351..2c2e11d)
Task 9: complete (commits 5bf083d..2c2e11d, review clean)
Task 10: dispatched (BASE 2c2e11d, sonnet, agent a825421b9ca9aa8f7)
Task 10: minor (deferred): dead CSS .lesson-list/.badge-done (and .home once Task 11 replaces the not-found branch)
Task 10: complete (commits 2c2e11d..7ccc353, review clean)
Task 11: dispatched (BASE 7ccc353, sonnet, agent a8768e0eca7287aeb)
Task 11: ⚠️ resolved: lessonStatuses only returns done/next/locked (Task 3); AppRoutes.test has beforeEach hash reset (Task 9)
Task 11: minor (deferred): useGame() placement in AppRoutes; missing blank line in routing.test.ts
Task 11: complete (commits 7ccc353..7418314, review clean)
Task 12: dispatched (BASE 7418314, sonnet, agent a6004d4ee3e5f5db3)
Task 12: Ruling: plan defect — new QuestionCard test clicks "Check" but the EN toggle only switches the question language, UI stays vi, so the button is "Kiểm tra"; existing onAnswered assertions updated for the new detail argument — cost if wrong: none (assertions unchanged)
Task 12: ⚠️ resolved: result.* and nav.room keys added in Task 7 (parity verified there); dispatch -> single saveState transaction verified in Task 7 review
Task 12: minor (deferred): LessonScreen.test rewrite dropped navigation-gating assertions (Quay lại disabled, Thẻ 2/2, Bài tập n/2, Hoàn thành disabled) — plan-mandated replacement; ResultView zero-delta / no-next-lesson cases untested; inline onJudged mapping long
Task 12: complete (commits 7418314..da8b923, review clean)
Task 13: dispatched (BASE da8b923, sonnet, agent a189f58a1e2a8ba92; adds double-click guard per Task 7 carry)
Task 13: Ruling: getByLabelText -> await findByLabelText after async PIN check (test timing fix, no expected values changed) — cost if wrong: none
Task 13: ⚠️ resolved: backup.* and banner.writeFailed keys added in Task 7 with vi/en parity test
Task 13: Ruling: crash-screen export failure gets a new i18n key backup.exportFailed (vi "Chưa xuất được file sao lưu.", en "The backup file could not be exported.") shown in role=alert — the crash screen is the last escape hatch and must not fail silently — cost if wrong: one extra string pair
Task 13: minor (deferred): onExport/onFile in BackupScreen have no try/catch; out-of-order async decodes; import error cause not logged; same bad file twice gives no feedback (reset input value)
Task 13: fix round 1/5 (3 addressed, 0 open — failed-import test, double-click RED evidence, crash export try/catch + backup.exportFailed; commits 65f3661..bdc20e6)
Task 13: complete (commits da8b923..bdc20e6, review clean)
Task 14: dispatched (BASE bdc20e6, sonnet, agent a5d2f02b6295f69ed)
Task 14: Ruling: plan defects in e2e test code — radio name needs exact:true (Print("Hello") also matched); after import the page reloads on #/backup so the test clicks "Về phòng" before expecting "Chào An!" — cost if wrong: none
Task 14: risk resolved: Web Lock released and re-acquired on reload and post-import reload (e2e green)
Task 14: minor (deferred, consider before merge): after import the reload stays on #/backup; reloading to #/ would land the child in the room
Task 14: minor (deferred, consider before merge): backup e2e exports a fresh profile — does not prove xu/XP/completed lessons survive import; PIN replacement not asserted
Task 14: minor (deferred): second-tab e2e checks only the message; no e2e for blocked IndexedDB or wrong-PIN import
Task 14: complete (commits bdc20e6..016970b, review clean)
Final review: dispatched (MERGE_BASE 4a29a6c, opus)
Final review: With fixes — 0 critical, 3 important, 8 minor
Final: Ruling: fix Important 1 (export from in-memory state, best-effort lastBackupAt, try/catch onExport) — spec 10 / Review Focus 4 — cost if wrong: none
Final: Ruling: fix Important 2 now (persist per-exercise fails/hints/solution in GameState.progress, optional field defaulting to {} so the schema-1 fixture stays valid) — xu feed parent-approved rewards in M4; inflated balances would carry forward — cost if wrong: extra state field to migrate later
Final: Ruling: fix Important 3 now (after PIN, list automatic backups with date and child name and a download button) — a parent who imports the wrong file needs an undo — cost if wrong: small extra UI on the backup screen
Final: Ruling: fix before merge minors 1 (onFile try/catch + decodeBackup rejects non-positive-integer schemaVersion), 2 (meta merged with emptyMeta on read and import), 3 (go to #/ after import), 4 (top-level ErrorBoundary in App), 6 (flush pending drafts on pagehide), 8 (checklist day count) — cheap and user-facing
Final: Ruling: defer minor 5 (drained message when no lessons remain) to M3 review station; minor 7 (midnight timer) to M3; recommendation 3 (GameState version check on load) to the next schema change — cost if wrong: cosmetic display issues until M3
Final: fix wave dispatched (FIX_BASE 016970b, opus)
Final: fix wave done (commits 016970b..0e188b4: dda87ee, 22d479a, 1410a5b, 0e188b4); npm run check green (Vitest 336, pytest 17, e2e 8/8); implementer extras: readMeta failure still fails export; CodeExerciseView marks step done on mount when stored viewedSolution
Final: re-review — all 9 findings ADDRESSED, no new Critical/Important
Final: parked — export drops other profiles when exportProfiles throws — Ruling: real but harmless in M2 (1 profile per device); revisit when multi-profile UI lands — cost if wrong: a multi-profile import could lose profiles
Final: parked — export clicked during a running import mixes old in-memory profile with imported store data — Ruling: needs a deliberate click in a sub-second window before the reload; not worth more code now — cost if wrong: one odd backup file
Final: parked — decodeBackup validates only the envelope; a broken state inside can still be imported (crash screen then shows) — Ruling: defer deep validation (zod schema) to M3 with the GameState version check — cost if wrong: a hand-edited file can break the app until another file is imported
Final: complete (commits 4a29a6c..0e188b4)
