# SDD ledger — plan: docs/superpowers/plans/2026-10-07-m5b-noi-dung-giai-doan-2.md

Branch feat/m5b-noi-dung-giai-doan-2 from main 4fb40d2, plan commit 120866d. Spec reachable. Baseline npm run check on main: Vitest 753, pytest 21, e2e 14, 0 warnings.
Maintainer instruction 2026-10-06: run M4, M5, M6 in turn, merge to main per milestone, record decisions in docs/superpowers/DECISIONS.md. Plan not reviewed by the maintainer (continuous run).

## Pre-flight scan

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 2-5 | content/stage-2/stage.yaml | T1 creates it; each later task appends its topic in order. Consistent. |
| 1-5 | concept IDs | Fixed per task; checked against stage 1 (no collision). `int-invalid` (T4) equals an error-entry ID; the plan tells T4 what to do if the validator objects. |
| 1-5 | content/errors/errors.yaml + parity count | Any task may add entries; tasks run one after another, so counts do not race. |
| 3 / 4 | input() then int() | T3 may show int(input()) as a formula; T4 explains it. Consistent with rule 1. |
| 5 / 6 | 0 warnings | T5 completes the stage; T6 re-checks. |

Scan clean; no rulings needed.
Task 1: implementer opus, commits 9b3b546, 4955c67; validate ok, 0 warnings (stage 2 bank already 34, AI 6, test code 8), Vitest 790. Error dictionary: new assign-to-literal (tag var-assign), syntax-other widened (names with spaces); parity count 31. Review dispatched (sonnet).
Task 1: minor (deferred, final review: code): name-undefined is tagged string-quotes, so a NameError for a variable used before assignment records string-quotes, not var-before-use; not-callable text says "hàm" (untaught)
Task 1: review approved; 9 minors moved to task-6-minors.md (answer positions, filler distractors, near-duplicates, long cards/tips, if/for mention, assign-to-literal if sentence, p2, b12 lesson, tags).
Task 1: ⚠ assign-to-literal is tagged var-assign (a stage-2 concept) and shared with stage 1: a stage-1 child typing 5 = x would get var-assign recorded -> final review.
Task 1: complete (commits 120866d..4955c67, review clean)
Task 2: implementer opus, commit 3bdc786; validate ok, 0 warnings, Vitest 826; dictionary unchanged. Review dispatched (sonnet).
Task 2: review approved; 4 minors moved to task-6-minors.md.
Task 2: complete (commits 4955c67..3bdc786, review clean)
Task 3: implementer opus, commit 6235ca9; validate ok, 0 warnings, Vitest 846; eof text says "ô Dữ liệu nhập" and is tagged input-one-line. Review dispatched (sonnet).
Task 3: Ruling: the app's judge reports the misconception id "input-prompt" (src/runner/judge.ts INPUT_PROMPT_MISCONCEPTION), so the plan's concept ID input-empty-prompt is wrong: rename the concept to input-prompt (not yet published) in the fix round; the common_wrong entries added as a workaround may stay. Task 4 may extend concat-str with the int() fix for numbers read by input(). Cost if wrong: none.
Task 3: review approved; minors moved to task-6-minors.md (with the input-prompt rename first).
Task 3: complete (commits 3bdc786..6235ca9, review clean)
Task 4: implementer opus, commit f2d0650; validate ok, 0 warnings, Vitest 882; dictionary: concat-str int() advice, int-invalid reworded and tagged, new float-invalid (count 32), unsupported-operand int() hint (accepted by the controller). Review dispatched (sonnet).
Task 4: review approved; minors moved to task-6-minors.md. ⚠ error entries tagged with stage-2 concepts (int-invalid, float-convert, var-assign, input-one-line) can fire for a child who has not reached them -> final review: confirm the app handles a misconception concept that is not yet unlocked.
Task 4: complete (commits 6235ca9..f2d0650, review clean)
Task 5: implementer opus, commits c7fff08, f6e0685; validate ok, 0 warnings, Vitest 922; new entry format-code-str (count 33). Concern: c2 (test_eligible) relies on round-half-even. Review dispatched (sonnet).
Task 5: review approved with 1 Important (l2.q2 explanation refers to choices by position; the UI shuffles) -> Ruling: fixed first in Task 6 together with a stage-wide check for positional references (one content fix pass). Minors moved to task-6-minors.md.
Task 5: complete (commits f2d0650..f6e0685; Important carried into Task 6 by ruling)
Task 6: implementer opus, commits 5adda59, d503cec; npm run check green (Vitest 920, pytest 21, e2e 14, 0 warnings). Partial: <class 'str'> not backticked in an explanation (plain text); optional alignment exercise not added. No separate task review: the final whole-branch review covers Task 6 explicitly (controller ruling, saves one cycle; M5a's Task 6 review found only minors).
Task 6: complete (commits f6e0685..d503cec)
Final review (opus): ready to merge with fixes. Important: NameError for a variable used before assignment records string-quotes (name-undefined tag). Minors: stage-2 tags fire for stage-1 children (parent alert, mastery 0 on unstarted topic), stale input-prompt comments, l5.ex1 float compare on integer outputs, // wording, DECISIONS rename line.
Final review: Ruling: the plan's "no app code" scope was the controller's own decision; fix the NameError diagnosis (new check assigned-in-code + entry name-before-assign) and the stage filter for misconceptions now, before stage 3 adds more tagged entries. Cost if wrong: small app change in M5b.
Final fix wave: commits 9f5ab00, 3a22ae8, a8d7782 (name-before-assign + assigned-in-code check, stage filter for code-judged misconceptions, comments, l5.ex1/ex2 exact compare, // wording). Scoped re-review: all 5 addressed; 1 latent minor: choice-path QuestionAnswered misconception unfiltered.
Final fix wave: controller closed the latent minor itself (commit after a8d7782: choice misconception filtered by isConceptReached in ItemView and ExamRunner, test RED without the change, GREEN with it). Reported here instead of a second fix wave.
