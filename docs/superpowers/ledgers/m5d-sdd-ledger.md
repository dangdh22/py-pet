# SDD ledger — plan: docs/superpowers/plans/2026-10-07-m5d-noi-dung-giai-doan-4.md

Branch feat/m5d-noi-dung-giai-doan-4 from main fe26db0, plan commit 431295e. Spec reachable. Baseline npm run check on main: Vitest 1109, pytest 21, e2e 14, 0 warnings.
Maintainer instruction 2026-10-06: run M4, M5, M6 in turn, merge to main per milestone, record decisions in docs/superpowers/DECISIONS.md. Plan not reviewed by the maintainer (continuous run).
Process (as M5c): content minors and Important items found by task reviews are batched into Task 6 (task-6-minors.md) unless they block the next task; Task 7 (code) gets a normal review.

## Pre-flight scan

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 2-5 | content/stage-4/stage.yaml | T1 creates; later tasks append in order. Consistent. |
| 1-5 | concept IDs | Fixed per task; grep against stages 1-3 shows no collision. |
| 1, 2 | errors.yaml missing-colon / indent texts | T1 adds for, T2 adds while (carry from M5c). |
| 5 / 7 | 0 warnings, then rules 8-9 as errors | T7 runs after the stage is complete (after T6). Consistent. |

Scan clean; no rulings needed.
Task 1: implementer opus, commits cd10997, 0443b43; validate ok (1 expected bank warning), Vitest 1147; missing-colon names for lines, if-colon tag kept (card only talks about if: Task 6/final review). Review dispatched (sonnet).
Task 1: review approved after 1 Important (missing-colon text names for to children of stages 1-3): Ruling: Task 2's implementer, who is editing the same entry to add while, hedges both loop keywords (message sent); Task 6 verifies. Minors in task-6-minors.md.
Task 1: complete (commits 431295e..0443b43)
Task 2: implementer opus, commits 139f54d, a8e613d; validate ok, 0 warnings, Vitest 1178; missing-colon hedges for/while (Task 1 Important resolved); timeout-while reworded and tagged while-update. Review dispatched (sonnet).
Task 2 review (sonnet): Approved, 0 Critical/Important, 7 minors batched into task-6-minors.md. l2 endless-loop card claims verified against src/runner and src/explain.
Task 3: implementer opus, commits 6970695, f1fed09; validate ok, 0 warnings, Vitest 1221; += taught in l1. Controller fix (code): isAssignedInCode accepts augmented assignment (tong += i without tong = 0 got name-undefined "put in quotes"); test added. Review dispatched (sonnet) on a8e613d..HEAD.
Task 3 review (sonnet): Approved, 0 Critical/Important; c3bc7a9 regex verified (25 cases). 5 minors batched into task-6-minors.md (1 is a controller test addition).
Task 4: implementer opus, commits 50ed65b, 77c4b7b; validate ok (88 lessons, 41 error entries: +repeat-str-by-str, +str-not-integer tagged input-str), Vitest 1261. Review dispatched (sonnet) on 38a844f..77c4b7b. Task 5 dispatched (opus) in parallel.
Task 4 review (sonnet): Approved, 0 Critical/Important; all 29 solutions re-run in python3; whitespace vs compare.ts verified; hidden n=0 tests show only 'Test ẩn: Sai'. 9 minors batched into task-6-minors.md.
Task 5: implementer opus, commits fc4dbea, e1e3f43; content:build 0 warnings; Vitest 1306; +loop-keyword-outside entry (42 entries). Review dispatched (sonnet) on 77c4b7b..e1e3f43; Task 7 dispatched (sonnet) in parallel.
Task 7: implementer sonnet, commit 940aba8; buildBundle skipCoverage flag for tiny-tree tests; single ContentError listing all gaps; Vitest 1308. Review dispatched (sonnet).
Task 5 review (sonnet): Approved, 0 Critical/Important; all solutions/samples/predicts re-run in python3. 8 minors batched.
Task 7 review (sonnet): Approved, 0 Critical/Important. Minors: test helper duplication (problemsOf/problemsOfChecked), triple build in 1 test, STATUS.md:30,36 stale 'warning until M5' (fix at milestone end). Test minors go to final-review fix wave if any.
Task 6: implementer opus, commits 847e959, 52e49cc, c09f50a; minors applied (2 skipped with reason); l6.ex3 moved to practice c6, new b16; npm run check green (Vitest 1309, pytest 21, e2e 14). Final review dispatched (opus) fe26db0..c09f50a.
Final review (opus): With fixes. I1 (3 level-3 practice items reachable before their lesson) fixed by controller; M1 (str-not-integer range mention), M2 (retag l1 choices), M4 (DECISIONS note on 6-lesson topics), M6 (name-before-assign "gần đầu chương trình"), M7 (Robo dừng) fixed. Ruling: no separate re-review; changes are list removals and wording, verified by content:validate and Vitest 1309. Parked: M3 (float in range -> suggest //), M5 (STATUS rule 8/9 lines, fix at close), M8 (test helper duplication), engine fix to open practice by completed lesson.
