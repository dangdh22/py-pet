# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m3b-kiem-tra-tien-hoa.md

Branch feat/m3b-kiem-tra-tien-hoa, plan commit 661b49e. Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable).
Maintainer instruction 2026-10-06: implement, then push; then plan and implement M4, M5, M6 in turn, merging to main per milestone; note decisions to revisit.

## Pre-flight scan

The plan was generated from a prototype (branch proto-m3b) and replayed task by task on a clean worktree from bf9a405: after each task tsc clean and the whole Vitest suite green (T1 439, T2 442, T3 452, T4 458, T5 469, T6 473, T7 477, T8 486); after T9 npm run check green (Vitest 486, pytest 21, e2e 11). Final tree identical to the prototype.

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 8 | src/ui/AppRoutes.test.tsx | T1 edits the older-app test + import; T8 adds imports and a describe at the end. No overlap. |
| 2 / 3,5,8 | lookup.ts (topicTestId, evolutionTestId, topicQuestions, topicTestCode, findTopic, findStage) | Produced in T2, consumed later. Consistent. |
| 3 / 4,5,6,7,8 | examBundle, ExamItem/ExamAnswer, buildRemedialSet | Consistent. |
| 4 / 6,7,8 | ResultSource "test", events | Consistent. |
| 5 / 6 | src/i18n/vi.ts, en.ts | T5 adds 3 keys, T6 adds 23 keys at different positions. No overlap. |
| 5 / 7,8 | routing (remedial route), nextStep, stepRoute | Consistent. |
| 6 / 8 | src/styles.css | T6 appends header + .exam-answered; T8 appends from .evolution-done. Consistent. |
| 6 / 7,8 | i18n evolution.*, remedial.* keys added in T6, used in T7/T8 | Consistent. |
| each task | tests vs code inside the task | Replay shows each task's tests pass with its code only. |

Scan clean; no rulings needed.

Task 1: minor (deferred): no test feeds populated TopicTestRecord/EvolutionAttempt/RemedialSet through gameStateSchema (later tasks' apply/screen tests persist populated records through the store, which validates on load)
Task 1: minor (deferred): EvolutionAttempt.at is z.string() (ISO timestamp, not a day) — matches brief
Task 1: Ruling: commit trailer said "Claude Haiku 4.5"; amended message only to the session's attribution line (b2a295a -> 11c18ed) — attribution guidance names the exact lines — cost if wrong: none, message-only change on an unpushed branch
Task 1: complete (commits 661b49e..11c18ed, review clean)
Task 2: minor (deferred): no test for the <stage>.evolution ID clash claim (only <topic>.test tested)
Task 2: minor (deferred): positive paths of findTopic/findStage/topicQuestions/topicTestCode and AI counting untested in Task 2 (topicQuestions/topicTestCode are exercised by exam.test in Task 3)
Task 2: minor (deferred): buildBundle.test uses contentWarnings(bundle).slice(1), coupled to the fixture's single concept warning; test title "reports a test larger than its AI share allows" is misleading (it checks ai > questions)
Task 2: Ruling: haiku implementers keep writing their own model in Co-Authored-By; rewrite the trailers of the whole branch once with a message filter before merge, instead of per commit — cost if wrong: none, message-only
Task 2: complete (commits 11c18ed..6b691ad, review clean)
Task 3: minor (deferred): gradePaper's points() trusts answer.kind over item type (mismatch impossible from ExamRunner, which builds the answer from the item)
Task 3: minor (deferred): score rounded to 2 decimals before the pass check (19.195 -> 19.2 passes); negligible
Task 3: minor (deferred): short banks: seen "other" questions used before fresh AI top-up; remedial ladder test uses a level-1-only concept; gradePaper multi-concept order and total 0 untested; itemMax/gradePaper lack doc comments
Task 3: complete (commits 6b691ad..fd2817c, review clean)
Task 4: minor (deferred): a failed EvolutionTestCompleted for a stage other than pet.stage still records and opens remedial (UI always passes the node's stage)
Task 4: minor (deferred): TopicTestCompleted score not clamped to [0,max]; best kept across a changed max
Task 4: minor (deferred): no test that the 3 new events are activity events, that a wrong test answer resets correctRun, or that source "test" leaves reviewMisses alone; isPass import out of alphabetical order (plan-mandated, cosmetic)
Task 4: complete (commits fd2817c..33a96b7, review clean)
Task 5: minor (deferred): MapScreen renders an empty evolution <ol> for a stage without an evolution test
Task 5: minor (deferred): ResultView's result.vui line and stepRoute use untested there; progress.ts imports hasTest from path (layering)
Task 5: ⚠️ resolved by controller: new routes topicTest/evolution/remedial fall back to the room until Task 8 adds the screens (intermediate state inside the branch only)
Task 5: complete (commits 33a96b7..f591c92, review clean)
Task 6: Ruling: (plan-mandated Important) ExamCodeView "Chạy thử" showed only stdout, so an error looked like "no output" — show the same error feedback as a lesson run (problemFromOutcome + feedbackForProblem in a RobotBubble, error line marked in the editor); also pass the error-misconception lookup to judge() as lessons do so a test submit records the same misconceptions. Error explanations are the app's normal error reporting, not a hint about the answer; marks stay hidden until the end — cost if wrong: a test is slightly easier than the maintainer intended; revert by dropping the feedback block
Task 6: minor (deferred): judge failure in a test shows app.crash ("reload the page") which loses the paper's in-memory answers; no explicit re-entry guard on submit; no tests for own-stdin run, starter (not draft), VI/EN in exam mode, failed path
Task 6: fix round 1/5 (1 addressed, 0 open — run errors shown in ExamCodeView, misconceptionOf passed to judge, new ExamCodeView.test.tsx with 2 tests; commits 28609ae..508ef48). Expected totals after M3b now Vitest 488 (plan said 486).
Task 6: minor (deferred): ExamCodeView handleRun keeps the previous output visible during a new run
Task 6: complete (commits f591c92..508ef48, review clean after 1 fix round)
Task 7: minor (deferred): no screen-level test that a retake avoids lastItems; RemedialScreen test does not show the practice source; all remedial IDs missing after a content change gives SessionScreen an empty list
Task 7: complete (commits 508ef48..b5fcc9d, review clean)
Task 8: Ruling (supersedes the Task 2 trailer ruling): subagents receive their own attribution guidance naming their own model; keep each commit's trailer as its author agent wrote it, no history rewrite — cost if wrong: cosmetic trailer names
Task 8: minor (deferred, triage at final review): a failed evolution test with an empty remedial set shows no retake link (only "Về phòng"), though "Học tiếp" in the room then opens the retake
Task 8: minor (deferred): a done evolution node is reachable by URL and replays the celebration without rewards; drawEvolutionTest runs even when remedialFirst; failed screen uses lesson-done/h2 vs h1
Task 8: complete (commits b5fcc9d..7089676, review clean)
Task 9: minor (deferred): e2e helpers duplicated across specs; paper size 10 and /14 hardcoded to real content (tripwire for M5); loose "+30 XP" text match
Task 9: complete (commits 7089676..930254d, review clean). npm run check: Vitest 488, pytest 21, e2e 11.
Final review (opus): With fixes. Important: a passed evolution test can be retaken from the done map node (false celebration or a pointless stage-1 review set taking over "Học tiếp").
Final: Ruling: fix wave F1 (done evolution node shows evolution.alreadyDone; failed attempt for a past stage leaves remedial), F2 (empty review set: "Thi lại" link), F3 (judge failure in a test: exam.submitFailed instead of "reload"), F4 (test: source "test" is not a review miss) — cheap and child-facing — cost if wrong: small UI text
Final: deferred to M4 (noted for DECISIONS.md): exam.notPassed hardcodes "80%" (needs {percent} once the threshold is a parent setting); topic test score clamp and changed max before M5 changes sizes; robot looks smaller after evolving until M6 (maintainer visual check)
Final: fix wave F1-F4 done (commits 930254d..efd5b60); F1 done-check made once on opening (EvolutionRoute) and F2 retake remounts a fresh attempt — both judged sound by the scoped re-review. npm run check: Vitest 494, pytest 21, content valid, e2e 11.
Final: re-review clean (all findings addressed, no new breakage). Out of scope: retake link preventDefault swallows ctrl/middle click (trivial).
