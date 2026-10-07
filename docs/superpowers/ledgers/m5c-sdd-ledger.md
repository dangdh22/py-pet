# SDD ledger — plan: docs/superpowers/plans/2026-10-07-m5c-noi-dung-giai-doan-3.md

Branch feat/m5c-noi-dung-giai-doan-3 from main 3ff8e52, plan commit 7487b84. Spec reachable. Baseline npm run check on main: Vitest 932, pytest 21, e2e 14, 0 warnings.
Maintainer instruction 2026-10-06: run M4, M5, M6 in turn, merge to main per milestone, record decisions in docs/superpowers/DECISIONS.md. Plan not reviewed by the maintainer (continuous run).
Process change from M5b: content minors from task reviews are batched into Task 6 (task-6-minors.md); Important findings get a fix round in the task.

## Pre-flight scan

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 2-5 | content/stage-3/stage.yaml | T1 creates; later tasks append in order. Consistent. |
| 1-5 | concept IDs | Fixed per task; checked against stages 1-2 (grep: no collision for compare-ops, eq-vs-assign, compare-str-num, str-equality, bool-value, ai-rules-vs-data, if-colon, indent-block, after-block, else-branch, convert-before-compare, elif-chain, condition-order, boundary-check, elif-vs-if, and-both, or-either, or-misuse, not-flip, chained-compare, divisible-check, max-by-compare, leap-year-rule, nested-if). |
| 1-5 | errors.yaml + parity count | Sequential tasks; existing entries missing-colon, indent-*, assign-in-condition cover most stage-3 errors. |
| 2 / 5 | indentation | T2 teaches 4 spaces; T5 nested if uses 8. Consistent. |

Scan clean; no rulings needed.
Task 1: implementer opus, commits 44b1dc7, 31479cc; validate ok, 0 warnings, Vitest 972; new entries assign-in-call, compare-str-int, print-unknown-option (count 37). Review dispatched (sonnet).
Task 1: review: 1 Important (c1 starter uses untaught chained assignment) + minors. Ruling: the Important is fixed first in Task 6 (Task 2's implementer is on the branch; one content fix pass), like M5b Task 5. Minors in task-6-minors.md.
Task 1: complete (commits 7487b84..31479cc; Important carried into Task 6 by ruling)
Task 2: implementer opus, commits 5719021, d3aefaf; validate ok, 0 warnings, Vitest 1008. Dictionary: missing-colon text drops for/while/elif mentions (M5d must add for/while back when loops arrive), tagged if-colon; indent entries tagged indent-block, indent-unexpected text fixed; assign-in-condition tagged eq-vs-assign; compare-str-int retagged convert-before-compare. Review dispatched (sonnet).
Task 2: carry to M5d: missing-colon and indent texts must cover for/while again when stage 4 adds loops.
Task 2: review: 2 Important (compare-str-int retag misdirects topic-1 children; l4.q2 has 2 defensible answers) + minors. Ruling: both Important fixed first in Task 6 (one content fix pass; Task 3 on the branch).
Task 2: complete (commits 31479cc..d3aefaf; Important carried into Task 6 by ruling)
Task 3: implementer opus, commit c8b48d1; validate ok, 0 warnings, Vitest 1038; new entry elif-after-else (count 38). Review dispatched (sonnet).
Task 3: review approved; minors moved to task-6-minors.md.
Task 3: complete (commits d3aefaf..c8b48d1, review clean)
Task 4: implementer opus, commits 494bbcf, b564743; validate ok, 0 warnings, Vitest 1069; dictionary unchanged. Review dispatched (sonnet).
Task 4: review approved; minors moved to task-6-minors.md.
Task 4: complete (commits c8b48d1..b564743, review clean)
Task 5: implementer opus, commits 0d5cf7e, a88685a; validate ok, 0 warnings, Vitest 1100; indent-expected text now 'thêm 4 dấu cách so với dòng {header}'. Review dispatched (sonnet).
Task 5: review: 1 Important (largest-of-3 card overgeneralises when strict > fails) + minors. Ruling: fixed first in Task 6 with the other carried Important items.
Task 5: complete (commits b564743..a88685a; Important carried into Task 6 by ruling)
Task 6: implementer opus, commits f86a7be, 90120b2, 6f3dfc0, 8241506; npm run check green (Vitest 1100, pytest 21, e2e 14, 0 warnings). All 4 carried Important items and all minors applied. No separate task review: the final whole-branch review covers Task 6 explicitly (as in M5b).
Task 6: complete (commits a88685a..8241506)
Final review (opus): ready to merge with fixes. Important: (1) = in if/elif with an expression or inside and/or not recognised (3.14 message without ":=", or plain invalid syntax); (2) assign-in-call gives == advice to stage-1 children printing an equation. Minors: indent-unexpected tag, else-if hint, not.md explanation, near-twin cards, DECISIONS lines, print-unknown-option tag (accepted), indent-expected empty-block edge (noted).
Final review: Ruling: fix both Important now, including the small app check for a lone = in a condition (same reasoning as M5b's app fix); Minors 1-5 in the same wave; DECISIONS by the controller. Carry to M5d: missing-colon/indent texts and if-colon tag for for/while lines; check-based routing of else lines to else-branch.
Final fix wave: commits 36a91ce, 184942b. Scoped re-review: all 6 addressed; 2 minors: => and =< counted as a lone = (controller fixed it: regex excludes = followed by < or >, tests RED/GREEN, commit after a60307a); keyword argument in a condition (end="") counts as lone = (very unlikely, fails safe: accepted).
