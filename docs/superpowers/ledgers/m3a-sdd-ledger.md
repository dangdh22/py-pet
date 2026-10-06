# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m3a-on-tap-thanh-thao.md
Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable)
Branch: feat/m3a-on-tap-thanh-thao (cloud session, no worktree), merge base 49a5dc6 (main), plan commit 62405cb (on top of chore 76d873d)
Baseline: npm run check green (vitest 336, pytest 17, content valid, e2e 8)
Env: PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; superpowers plugin not installed, skill read from upstream clone at sha 5bf4e78
Note: plan code was prototyped end-to-end before writing (npm run check green: vitest 422, pytest 21, e2e 10); intermediate task states were not each type-checked.

## Pre-flight scan
| Pair / task | Produces vs consumes | Finding |
|---|---|---|
| T1→T2 | upgradeGameState/StateFormatError/StateProblem | match |
| T1→T4,T7 | ConceptMastery, ReviewCard, GameState.mastery/reviews/retry/completedReviews | match |
| T3→T4 | emptyMastery, MASTERY, recordResult, recordMisconception, solvedScore, ResultSource, reviewCard | match |
| T3→T7,T8 | shuffled, seededRng, Rng, isDue | match |
| T4→T8,T9 | event fields concepts/misconceptions/source optional; ReviewCompleted | match; optional fields keep M2 tests compiling |
| T5→T6 | FILL_BLANK, Parsons/Fill types, topic.practice | match |
| T5→T7 | findItem, allConcepts, isChoiceQuestion, Concept.practice, Topic.reviews/practice | match |
| T5→T8 | LessonScreen T5 narrowing (body=null branch) replaced by ItemView in T8 | consistent (intermediate) |
| T6→T8 | JudgeSpec lets PuzzleExerciseView call judge(parsons/fill) | match |
| T7→T8,T9,T10 | reviewBundle/reviewCode/reviewParsons/reviewFill fixtures; buildReviewSet/buildPracticeSet; path fns | match |
| T8→T9 | LessonScreen T8 keeps old ResultView props; T9 changes ResultView API and LessonScreen call | consistent |
| T8→T10 | ItemView T8 version then T10 full replacement | consistent |
| T9→T10 | Route practice exists in T9 (falls to Room), PracticeScreen route added T10 | consistent |
| T9 | removes lessonStatuses/nextLessonId; all callers (AppRoutes, Map, Room, Result) replaced in same task | checked |
| T9→T12 | content reviews r1 after l2 drive e2e | match |
| T11 | restored tests pass without code change (documented in plan) | ok |
| i18n T2,T8,T9,T10 | each task adds vi+en pairs together | ok (parity test) |
| styles.css T8,T9,T10 | append-only | ok |
| T1..T12 self-consistency | code and tests taken from the green prototype | ok |
Scan result: no open conflicts.

## Tasks
Task 1: dispatched (BASE 62405cb, haiku, agent a94f503fddca8231e)
Task 1: review dispatched (sonnet, agent af3eff9990045a3ab, package review-62405cb..d728e9b.diff)
Task 1: controller-confirmed gap: committed package-lock.json still marks node_modules/zod "dev": true (the removal sits uncommitted in the working tree with libc noise) — npm ci --omit=dev would drop a runtime dependency; joins the fix loop
Task 1: Ruling: accept the implementer's model-accurate Co-Authored-By trailer (Claude Haiku 4.5) instead of the plan's Opus line — attribution should name the model that wrote the commit; Claude-Session line present — cost if wrong: one trailer line differs from the plan text
Task 1: review: spec ✅, Approved; reviewer claimed node_modules/zod has no dev flag — wrong (git show HEAD:package-lock.json shows "dev": true); controller gap stands
Task 1: minor (deferred): gameStateSchema accepts any integer version (only called after migration)
Task 1: minor (deferred): migrate.test destructures unused fields (plan text)
Task 1: fix round 1 dispatched (resume a94f503fddca8231e): commit zod dev-flag removal only, discard libc noise
Task 1: fix round 1 done (commit c077522, controller verified lockfile hunk); scoped re-review dispatched (haiku, agent a0165d2c5c3fc6f22)
Task 2: dispatched (BASE c077522, sonnet, agent a7d375112582dedac)
Task 1: fix round 1/5 (1 addressed, 0 open — zod dev flag; commits d728e9b..c077522)
Task 1: complete (commits 62405cb..c077522, review clean)
Task 2: implementer DONE (commit f100076, vitest 345, typecheck clean); review dispatched (sonnet, agent aec069ba5843368e2)
Task 2: review: spec ✅, Approved; ⚠️ typecheck verified by controller (clean)
Task 2: minor (deferred): profileBundleSchema attempt kind enum code|choice — parsons/fill attempts are stored as kind "code" (ItemView, Task 8), so no breakage; revisit if a new kind is added
Task 2: minor (deferred): damaged-file test does not cover malformed attempts/drafts arrays
Task 2: minor (deferred): schema-2 envelope with a newer state version reports "damaged" not "newer-version" (plan-mandated test)
Task 2: minor (deferred): GameRoot swallows non-StateFormatError errors from upgradeGameState without logging
Task 2: complete (commits c077522..f100076, review clean)
Task 3: dispatched (BASE f100076, haiku)
Task 3: implementer DONE (commit eab79a8, agent ad3845cb02b767d01, vitest 360); review dispatched (sonnet, agent a73b578aee6b09fca)
Task 3: review: spec ✅, Approved; ⚠️ trailer and ConceptMastery level type verified by controller
Task 3: minor (deferred): recordMisconception can set needsHelp at score > 70 (cleared by the next result); ladder bounds 1/3 hard-coded; MASTERY.score.wrong unused until Task 4
Task 3: minor (deferred): test gaps — shuffled permutation/determinism, rng range, practice source, clamping, recordMisconception immutability
Task 3: complete (commits f100076..eab79a8, review clean)
Task 4: dispatched (BASE eab79a8, haiku)
Task 4: implementer DONE (commit 796fb43, agent a955354df87e5ca1b); review dispatched (sonnet, agent a39ab261d1ff11d01)
Task 4: review: spec ✅, Approved; ⚠️ full suite verified by controller (vitest 373 pass)
Task 4: minor (deferred): mastery score and retry clear use event stats while XP merges stored stats — UI (CodeExerciseView with initialStats in lessons) sends accumulated stats, so lessons are consistent; revisit for parsons/fill which have no stored stats
Task 4: minor (deferred): test gaps — correct>total clamp, ReviewCompleted on rollback day, failed review submit, lesson-source retry clear; repeated SolutionViewed pushes retry back
Task 4: complete (commits eab79a8..796fb43, review clean)
Task 5: dispatched (BASE 796fb43, sonnet)
Task 5: implementer DONE_WITH_CONCERNS (commit 5737a75, agent a6baf3a489ccf9901; one non-reproducing failed file in an early full run); review dispatched (sonnet, agent a02f06207263473da)
Ruling: BackupScreen.test 'wrong PIN keeps the file picker hidden' is a pre-existing M2 timing flake (synchronous getByRole('alert') after the async PBKDF2 check; failed 1 of 3 full runs under load, 0 of 5 isolated runs) — not caused by Task 5; carry a one-line fix (findByRole) into the final-review fix wave — cost if wrong: an occasional red unit run until then
Task 5: review: spec ✅, Approved; ⚠️ full suite verified by controller (379 pass on rerun; the one red run was the BackupScreen flake ruled above)
Task 5: ⚠️ resolved: validate_content.py practice iteration and parsons/fill routing land in Task 6; stageXpMax parsons/fill count lands in Task 7 (both in plan text)
Task 5: minor (deferred): untested references branches (2 stations after 1 lesson, missing concept back-reference, level2/3 wrong type), fill answer newline, tested-exercise refinements on parsons/fill; ____ (4 underscores) counts as 1 blank + "_" (plan-mandated marker)
Task 5: complete (commits 796fb43..5737a75, review clean)
Task 6: dispatched (BASE 5737a75, haiku)
Task 6: implementer DONE (commit f901d43, agent a61e2b97b7b2e8fb2; controller: vitest 381, typecheck clean); review dispatched (sonnet, agent a4604c491754e98f2)
Task 6: review: spec ✅, Approved; ⚠️ trailer covered by the Task 1 ruling; parity loop over real parsons/fill content is vacuous until M5 (inline Pyodide tests cover judging)
Task 6: minor (deferred): FILL_BLANK duplicated in Python and TS (plan-mandated); no check that lines/template+answers reproduce solution (solution is derived from them at build time); redundant local compare in check_code_exercise
Task 6: complete (commits 5737a75..f901d43, review clean)
Task 7: dispatched (BASE f901d43, haiku)
Task 7: implementer DONE (commit e6c868b, agent ae9e15d0b167a6d78, vitest 393); review dispatched (sonnet, agent a91537eddbead3539)
Task 7: review: spec ✅, Approved
Task 7: ⚠️ resolved: lesson-embedded questions get their owner lesson in `lessons` (toChoiceQuestion default, Task 5 schema); lessonStatuses/nextLessonId callers move to path functions in Task 9
Task 7: minor (deferred): weak slot tests (recent cap 2, due order can be masked by filler, l1+l2 test selects all), no test for retry-over-help precedence or flagged concept fall-through, determinism test single seed; help item always last in order (UI shows it as item 5)
Task 7: minor (deferred): progress.ts imports REVIEW_SIZE from reviewSet.ts (plan-mandated); reviewBundle shares module-level exercise objects
Task 7: complete (commits f901d43..e6c868b, review clean)
Task 8: dispatched (BASE e6c868b, sonnet)
Task 8: implementer DONE (commit 5df976a, agent ac2ebf1a3e0cf7874, vitest 402); review dispatched (sonnet, agent a1054c651606a1e7d)
Task 8: review: spec ✅, Needs fixes — Important (plan-mandated): parsons/fill lose stored hints/fails/solution on lesson remount (mastery s inflated; XP/xu already protected by the reducer's stored-stats merge)
Task 8: Ruling: fix it — add initialStats to PuzzleExerciseView and pass it from ItemView in lessons, mirroring CodeExerciseView; spec 5.9 s values must reflect hints/solution — cost if wrong: one extra prop and test
Task 8: minor (deferred): submit/hint/solution flow duplicated between PuzzleExerciseView and CodeExerciseView (plan-mandated); parsons focus stays on position after a swap (key=index), no aria-live; lines/blanks editable while judging; tests do not assert no HintShown outside lessons or event fields from puzzles; ItemView relies on caller keying
Task 8: fix round 1 dispatched (resume ac2ebf1a3e0cf7874, FIX_BASE 5df976a)
Task 8: fix round 1 done (commit 7eb513a); scoped re-review dispatched (sonnet, agent a22fe33c25076f95b)
Task 8: carry to Task 10: the plan's full ItemView replacement lacks `initialStats` on PuzzleExerciseView — Task 10 must keep the Task 8 fix (pass initialStats in lessons)
Task 8: fix round 1/5 (1 addressed, 0 open — puzzle initialStats; commits 5df976a..7eb513a)
Task 8: complete (commits e6c868b..7eb513a, review clean)
Task 9: dispatched (BASE 7eb513a, sonnet)
Task 9: implementer DONE (commit 9cbcb65, agent a0b94af00f144a598, vitest 414); review dispatched (sonnet)
Task 9: controller ran existing e2e at 9cbcb65: 8 passed; review agent ac6641e9e2553c951
Task 9: review: spec ✅, Approved; ⚠️ content IDs verified by content:validate (controller e2e build ran content build); 5-item station covered by ReviewScreen test
Task 9: minor (deferred, consider before merge): drained robot with no completed lesson shows "Sạc cho Robo" leading to an empty review page, and demotes "Học tiếp" (plan-mandated) — candidate for the final fix wave
Task 9: minor (deferred): empty station pays base reward (plan-mandated, theoretical); no direct SessionScreen test; MapScreen label fallback; no route test for #/review with nothing learned
Task 9: complete (commits 7eb513a..9cbcb65, review clean)
Task 10: dispatched (BASE 9cbcb65, sonnet; carries the Task 8 initialStats note)
Task 10: implementer DONE (commit dca87c3, agent ab438bb27755223ad, vitest 420; initialStats kept on both views); review dispatched (sonnet)
Task 10: review: spec ✅, Approved; ⚠️ resolved: parseHash("#/practice/x") covered by Task 9 routing test; buildPracticeSet size/level covered by Task 7 tests
Task 10: minor (deferred): test title "a right answer or a practice set..." covers only the practice half (plan text); no tests for card-less/unknown concept, card cleared after an accepted submit, #/practice route in AppRoutes; hard-coded card colours (plan-mandated)
Task 10: complete (commits 9cbcb65..dca87c3, review clean)
Task 11: dispatched (BASE dca87c3, haiku)
Task 11: implementer DONE (commit 99d3dd6, agent a43dd5f2ddea2cc53, vitest 423); review dispatched (sonnet)
Task 11: review: spec ✅, Approved; ⚠️ resolved: restored assertions match the M2 ledger list (Quay lại disabled, Thẻ 2/2, Bài tập n/2, Hoàn thành disabled; #/lesson/khong-co)
Task 11: minor (deferred): midnight test covers only the first firing (no reschedule/unmount assertion); no DST-day test (Vietnam has no DST)
Task 11: complete (commits dca87c3..99d3dd6, review clean)
Task 12: dispatched (BASE 99d3dd6, haiku)
Task 12: implementer DONE (commit 026e866, agent a3db0986b8caf0b08; npm run check green: vitest 423, pytest 21, content valid, e2e 10); review dispatched (sonnet, agent ab179963f20e0bfe6)
Task 12: review: spec ✅, Approved; ⚠️ run output verified (controller saw npm run check green in report; e2e also green at Task 9); trailer per Task 1 ruling
Task 12: minor (deferred): e2e startApp skips heading waits; "Trạm ôn" row picked with .first(); no assertion that l3 was locked before the station
Task 12: complete (commits 99d3dd6..026e866, review clean)
Final review: dispatched (MERGE_BASE 62405cb for M3a code; chore commit 76d873d packaged separately; opus)
Final review: With fixes — 1 critical, 1 important, 9 minor (agent a2cf011af2cd437c4, opus)
Final: Ruling: fix Critical 1 — review answers count toward correctRun/Vui (spec 5.6 does not exclude reviews), drained message names the empty stat (new pet.drainedVui), recharge button only when a lesson is done — the milestone's recharge loop must lift the robot out of "Hết pin" — cost if wrong: Vui rises a little faster than planned
Final: Ruling: fix Important 2 — misconception card stays inline; practice links move to the result screen after a lesson or session and only for concepts with a non-empty practice set — spec 5.9 step 2 kept without stranding the child or dropping the lesson/station — cost if wrong: practice is one click further away
Final: Ruling: fix cheap minors 3 (retry through available), 4 (drop non-concept misconceptions), 9 (free review done title) and the BackupScreen flake — cost if wrong: none
Final: Ruling: defer minor 5 (free review XP/points cap) to the maintainer as a plan question; 6 (robot may shrink after update) as a STATUS note; 7 (meta not checked on import) and 8 (damaged IndexedDB state has only "Tải lại") to M4 with PIN reset and parent settings; 10 (meta.schemaVersion stays 1) nit; 11 (parsons keyboard focus) to the M3b/M6 UI polish — cost if wrong: rare edge cases stay until then
Final: open question for the maintainer: should a completed recharge review guarantee Vui >= 1 (spec gap: "Hết pin" covers both stats, recharging covers Pin)
Final: fix wave dispatched (FIX_BASE 026e866, opus, brief final-fix-brief.md)
Final: fix wave done (commits 026e866..3edb436: aae44e4, 71c2f27, 6374440, c247da8, 60d2109, 3edb436); fixer reports npm run check green (vitest 437, pytest 21, e2e 10); scoped re-review dispatched (sonnet)
Final: re-review — F1..F6 ADDRESSED, no new Critical/Important
Final: parked — ResultView calls buildPracticeSet with Math.random on every render — Ruling: only emptiness is used and it does not depend on rng; tidy later — cost if wrong: a little wasted work per render
Final: parked — onMisconception fires for a concept without card text, so a practice link can appear without a card — Ruling: no current concept lacks a card; M5 content keeps cards mandatory by rule 8 — cost if wrong: an unexplained practice link for such a concept
Final: complete (commits 62405cb..3edb436)
