# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m5a-noi-dung-giai-doan-1.md

Branch feat/m5a-noi-dung-giai-doan-1 from main b0b75b9, plan commit f3fc083. Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable). Baseline npm run check on main: Vitest 619, pytest 21, e2e 14.
Maintainer instruction 2026-10-06: run M4, M5, M6 in turn, merge to main per milestone, record decisions to revisit in docs/superpowers/DECISIONS.md; 2026-10-06 later: "M5 ... nếu đã dừng thì restart lại". The M5a plan was not reviewed by the maintainer (continuous run).

## Pre-flight scan

Task 1 code was prototyped (branch proto-m5a): new tests fail on main code and pass with the change; Vitest 622. Tasks 2-6 are content written from requirements (no prototype).

| Tasks | Shared file / interface | Finding |
|---|---|---|
| 1 / 2 | coverage.ts AI rule / ai-basics practice | T2 relies on AI concepts needing level 1 only. Consistent. |
| 3 / 4 / 5 | content/stage-1/stage.yaml | Each appends its topic in order. Consistent. |
| 3 | e2e/exam.spec.ts | Topic 2 lesson 1 title "Chuỗi là gì?" fixed in the plan table and used by the e2e. Consistent. Map lists 2 "Kiểm tra chủ đề" items: snippet uses .first(). |
| 2-5 | concept IDs | Fixed per topic in the plan, unique (checked against existing content: none collide). |
| 4 | content/errors/errors.yaml | Only T4 may add entries. |
| 5 / 6 | "no warnings" | T5 expects zero warnings after stage 1 is complete; T6 re-checks. Consistent. |
| each content task | rules 2 (no untaught knowledge) | Order of topics fixed; later topics may use earlier ones. |

Scan clean; no rulings needed.
Task 1: implementer haiku, commit b33771b; tree identical to prototype; review dispatched (sonnet)
Task 1: minor (deferred, fix at final review): the "Spec 5.4-5.6" JSDoc of completeTopicTest now sits above the new testScore helper (plan-mandated layout) — move it down
Task 1: minor (deferred): testScore assumes a sane max (NaN or <= 0 not guarded; callers pass the paper size)
Task 1: complete (commits f3fc083..b33771b, review clean; tree identical to prototype whose full suite was 622)
Task 2: implementer sonnet, commit 64a0733. Vitest 628 (content-driven tests count items; plan totals are not exact for content tasks — record actual counts). Concern raised: lesson l1 has no AI theory card although the AI questions cite it.
Task 2: Ruling: add a lesson s1.lam-quen.l5 "AI là gì?" (05-ai-la-gi.md) at the end of topic 1 (2-3 cards: AI is a program that learns from many examples, AI in daily life, AI can be wrong and people check it; 2 new mcq exercises; no code exercise, an AI lesson exception to rule 3); point the AI bank questions' `lessons` to l5 (metadata, not an ID); no change to the cards of l1-l4 because 6 e2e specs click through exactly 2 cards. Task 3's e2e change walks the new lesson too. Cost if wrong: one extra lesson (19 in stage 1).
Task 2: review approved; minors to fix in the fix round with the ruling: joke distractors b9/b11, b9 wording, p5 second hint, p3 prompt quote types. Deferred: p2-p5 blanks are short (level 2, acceptable); b11 close to b2.
Task 2: fix round 1 dispatched (lesson l5 "AI là gì?", exam.spec walks l5, polish).
Task 2: fix rounds 1-2 committed d4e8317, e58eea0 (lesson l5, polish, b12/b13; review.spec reads the station size from the page). Vitest 631, e2e 14. Scoped re-review dispatched.
Task 2: fix rounds 1-2/5 (5 addressed, 0 open; commits d4e8317, e58eea0). Re-review clean.
Task 2: minor (deferred, fix at final review): e2e/review.spec.ts reads the station size with >= 4 and a stale comment — restore an exact 5
Task 2: minor (deferred): b13 distractors tagged case-sensitive (concept is about names); l5.q1 correct choice is the longest
Task 2: complete (commits b33771b..e58eea0, review clean after 2 fix rounds)
Task 3: implementer opus, commit 2f243ca; npm run check green (Vitest 671: the Pyodide parity test adds 1 test per content item; e2e 14); no content warnings left. Concerns carried: nested double quotes give CPython's "Perhaps you forgot a comma?" and the missing-comma entry gives wrong advice -> Task 4 adds an errors.yaml entry; lesson s1.chuoi.l3 already shows "4"+"4" -> Task 5 builds on it. Review dispatched (sonnet).
Task 3: minor (deferred, fix at final review): escaped quotes \" \' taught in s1.chuoi.l2 card 3 but practised only in b5 — add 1 practice item that needs them; b12 choice print("-" + 10) wrongly tagged string-repeat; l5 card 1 "chữ đầu" -> "chữ cái đầu"
Task 3: minor (deferred): several distractors use the string-repeat tag loosely (l4.q2, b10)
Task 3: e2e test name without the lesson count (topic 1 has 5 lessons now): accepted.
Task 3: complete (commits e58eea0..2f243ca, review clean)
Task 4: implementer opus, commit 64d4c8e; validate ok, no warnings, Vitest 703, pytest 21. Error dictionary: new entry quote-inside-string (Pyodide 3.14 message "Is this intended to be part of the string?") before missing-comma; missing-comma text widened (3.13 message); name-similar hint widened; parity test error count 28 -> 29 (src/content/parity.pyodide.test.ts, outside the brief's file list, needed). Implementer rules updated: the app runs CPython 3.14 in Pyodide. Review dispatched (sonnet).
Task 4: minor (deferred, code): name-similar tags a typo such as pirnt as the case-sensitive misconception (M3a behaviour)
Task 4: Ruling: Important — the new quote-inside-string entry (3.14 "Is this intended to be part of the string?") also fires for a name between strings (print("Tên:" ten "tuổi")), where its quote-first advice and quote-inside tag are wrong. Fix: neutral opening ("a string ended, then text outside quotes"), both causes side by side (a quote inside the string, or a missing comma or + before a name), no misconception tag. Also Minors: drop the 3.13-only "quên dấu )" clause from missing-comma and open it with the comma; b5/b12 lessons -> l3; "giống như tạm tắt công tắc". Fix after Task 5's implementer commits. Cost if wrong: none.
Task 4: minor (deferred): several questions test "SyntaxError, nothing printed" with similar code (b8, b11, l3.q1, l4.q2); validator checks entry samples on CPython 3.13 only (parity test covers 3.14) -> STATUS note
Task 5: implementer opus, commit 751f35a; validate ok, no warnings at all, Vitest 746. Concerns -> Task 4 fix round (errors.yaml owner): concat-str advice names str()/int() (untaught in stage 1) — lead with the comma; sep/end before the values ("positional argument follows keyword argument") gets only syntax-other — add an entry. Review dispatched (sonnet).
Task 5: minor (deferred, Task 6 batch): parent_tip of number-vs-text and end-param have 3 sentences (rule 7: 1-2); b11 choices 2 and 3 are valid code but tagged with misconceptions; odd distractors l3.q2 1""2""3, l4.q2 3=3 tag, b7 "B", b12 "A B -"; l3.q3/b11/b12 repeat the same idea
Task 5: minor (deferred, UI): mcq choice text not in a monospace font (b8 differs by one space)
Task 5: non-run code block in s1.print-nhieu.l3 card 4 renders as plain code (CardSegment code with run false) — fine.
Task 5: complete (commits 64d4c8e..751f35a, review clean)
Task 4: fix round 1/5 (5 addressed, 0 open — quote-inside-string neutral without a tag, missing-comma comma-first without the ")" clause, concat-str comma-first, new keyword-before-value entry (tag named-option-order kept: it is that misconception), b5/b12 lessons, wording; commit 3beeb22; controller read the errors.yaml diff in place of a re-review). Vitest 747.
Task 4: minor (deferred): s1.print-nhieu.c5 starter (sep=:) falls back to syntax-other
Task 4: complete (commits 2f243ca..64d4c8e + fix 3beeb22, review clean after 1 fix round)
Container restarted during Task 6 (no Task 6 changes survived; tree clean at 3beeb22). Branch pushed to origin as a backup. Task 6 re-dispatched.
Task 6: implementer opus, commits d43510d, 64f91b7; npm run check green (Vitest 748, e2e 14), 0 warnings. Concern: 92 of 95 questions had the correct answer first and the app shows choices in file order; topics 2-4 rebalanced in content, topic 1 left (e2e). Review dispatched (sonnet).
Task 6: review approved (every moved choice intact; all minors done; summary counts verified by an independent recount).
Task 6: minor (deferred): b11/l3.q3 still overlap a little; c5 hint 1 dense; summary end section mentions npm/id for the maintainer; number-vs-text tip first sentence long
Task 6: complete (commits 3beeb22..64f91b7, review clean)
Task 7: implementer haiku, commit 7062e14; code identical to the prototype (controller designed it and saw the new test fail without the change); npm run check green (Vitest 750, e2e 14). No separate task review: the final whole-branch review covers it.
Task 7: complete (commits a2b3eac..7062e14)
Final review (opus): ready to merge with fixes. Important 1: missing-comma gives comma advice for print(Xin chào Robo) on 3.14 (first exercise). Minors 2-6: practice lists ahead of teaching, card text after concat-str change, JSDoc, unterminated-string apostrophe, mcq code choices not monospace. Triage: T2 review.spec and T3 minors already done in Task 6.
Final review: Ruling: fix wave = items 1-6 plus the name-similar case-sensitive tag (only for case-only differences), because topic 3 exercises start from `pirnt` and would lower case-sensitive mastery for every child. Cost if wrong: none.
Final fix wave: commits bd664b0, aeb4a15 (missing-comma quotes first, unterminated-string apostrophe, practice lists, card text, JSDoc, mcq code choices monospace, case-sensitive tag only for case changes). Scoped re-review: all 7 addressed, no new breakage. npm run check: Vitest 753, pytest 21, e2e 14, 0 warnings.
