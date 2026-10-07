# M6b SDD ledger

Plan: docs/superpowers/plans/2026-10-07-m6b-ci-loi.md. Branch feat/m6b-ci-loi. Base 8d40a15 (main after M6a); plan commit 8616b84.

Task 1: implementer sonnet, commits a672210, 999cb85; eslint 10.12 (plan said 9; accepted), react-hooks v7 incl. compiler rules all error, 4 line-level exhaustive-deps disables with reasons; useItem renamed consumeItem. Review (sonnet), Task 2 (sonnet) and Task 5 (sonnet) dispatched.
Task 1 review (sonnet): Approved, 0 Critical/Important. Minors parked: eslint.config map drops rule options; ParentHelp duplicate comment; worker globals permissive.
Task 2: implementer sonnet, commit cbd6c68; ci.yml, deploy.yml, subpath Playwright project + tools/serve_subpath.mjs; e2e 16. Push with workflows succeeded. Review (sonnet) and Task 3 (sonnet) dispatched.
Task 5: implementer sonnet, commit ccd10ac; conceptsMet + availableItems by concepts; 3 M5d items restored to level 3; Vitest 1383. Review (sonnet) dispatched.
Task 2 review (sonnet): Approved, 0 Critical/Important. Minors to Task 7: html reporter in CI (playwright-report not produced) or reword README; serve_subpath URIError/stream error handling.
Task 5 review (sonnet): Approved, 0 Critical/Important; verified on real content (95 concepts all have items from first-teaching lesson; 0.1 ms per call). Minors parked: comment on invariant test; sequential lessons in c5 test.
Task 3: implementer sonnet, commit 486285b; start timeout 60 s, indexedDB check, browserLang, UnsupportedBrowser, failed panel under header; Vitest 1393, e2e 16. Review (sonnet) and Task 4 (sonnet) dispatched.
Task 3 review (sonnet): Approved, 0 Critical/Important. Ruling: raise start timeout to 120 s (slow school networks; 10 MB wasm), guard the indexedDB getter (a throw counts as present, MemoryStore fallback handles it), panel text colour — batched into Task 7.
Task 4: implementer sonnet, commit 1a67021; ItemBoundary in LessonScreen, SessionScreen, ExamRunner; skipped lesson last step still completes lesson; Vitest 1402, e2e 16. Review (sonnet) and Task 6 (sonnet) dispatched.
Task 4 review (sonnet): Approved, 0 Critical/Important. Ruling: a broken item must not cost the child: exclude skipped items from exam max/score/wrongConcepts and from session total (perfect review still reachable). Batched into Task 7; DECISIONS M6b item 5 updated then.
Task 6: implementer sonnet, commit 7963b36; topMisconceptions(attempts, lookup, n); exercise labels by position; float-not-integer (floor-div), 43 entries; Vitest 1408, e2e 16. Stray /e.yaml (temp copy of errors.yaml outside repo) left: removal blocked by safety check; told user. Review (sonnet) and Task 7 (sonnet) dispatched.
Task 6 review (sonnet): Approved, 0 Critical/Important. Minors parked: parent card may show a later-stage misconception name (useful for parents; no change); comment on findConcept non-null.
Task 7: implementer sonnet, commits 5f708e9, f33e828, a3d643a; all minors applied; skipped items excluded from grading; worker posts init-failed on unhandledrejection during init (beyond brief; final review to judge); e2e 17; Vitest 1414. Final review (opus) dispatched 8d40a15..HEAD.
Final review (opus): With fixes. Important 1: late ready after init-failed leaves status ready with rejected promise. Fix wave (sonnet) for I1, M1-M4, M6. Parked: M5 deploy not gated on CI, M7 content-error log dedupe, M8 worker failInit unit test, M9 /e.yaml.
Re-review (sonnet): all addressed. Controller: restored spec title 'Robo chưa khởi động được' (spec 10 wording wins over final-review Minor 6).
