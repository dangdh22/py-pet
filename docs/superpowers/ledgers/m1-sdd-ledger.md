# SDD ledger — plan: docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md

Spec: docs/superpowers/specs/2026-10-06-py-pet-design.md (reachable)
Worktree: .worktrees/m1-lat-cat-doc, branch feat/m1-lat-cat-doc, branched from 29e111e (docs/py-pet-design-spec)

## Pre-flight scan

### Shared files / interfaces between tasks

| Tasks | Producer -> consumer | Finding |
|---|---|---|
| T1 -> T4, T5, T17 | package.json scripts (T1 sets dev/build/typecheck/test; T4 overrides 4 of them; T5 adds content:validate; T17 adds test:e2e, check) | Consistent: later tasks only overwrite/add via npm pkg set. OK |
| T1 -> all TS tasks | vitest.config include src/**/*.test.{ts,tsx} + tools/**/*.test.ts, env node, jsdom pragma | All test files follow it. OK |
| T2 -> T3 | lang.ts Lang/LocalizedText re-exported by content/types.ts | OK |
| T2 -> T11..T15 | MessageKey set (incl. judge.results, question.choices, code.outputTruncated) | Every t() key used in T11-T15 exists in vi.ts/en.ts. OK |
| T3 -> T4 | runtime types (Choice.error, ChoiceQuestion.code null, ErrorEntry.sampleInput) consumed by schema converters | OK |
| T3 -> T10/T16 | lookup.allExercises/allLessons used by parity test | OK |
| T4 -> T5 | JSON bundle camelCase keys (commonWrong, sampleInput, expectError, compare.kind) read by validate_content.py | Matches. OK |
| T4 -> T10/T16 | content/errors/errors.yaml seed (T4) replaced wholly (T10), misconception lines added (T16) | OK; T10 must not add misconception (concepts absent until T16) — plan says so. OK |
| T6 -> T7, T10, T16 | createPyRunner/PyRunner, getPyRunner helper | OK |
| T7 -> T11, T15 | RunnerStatus, RunnerClient.subscribe (calls listener immediately), FakeWorker | OK |
| T8 -> T9 | TestOutcome, ErrorMisconceptionFn imported by explain/types.ts & providers.ts | OK (T9 after T8) |
| T9 -> T11..T13 | problemFromOutcome, isPseudoError, DictionaryProvider, errorMisconceptionFrom | OK |
| T11 -> T12..T15 | AppProviders/RunnerApi/useContent/useRunner, feedback helpers, fixtures (JS-regex named groups), renderWithApp, fakeRunner | OK |
| T12 -> T13, T15 | OutputPanel region label "Kết quả" | OK |
| T13 -> T15 | CodeExerciseView onComplete(outcome) | LessonScreen passes () => markDone(index). OK |
| T14 -> T15 | QuestionCard onAnswered(correct) | OK |
| T15 -> T17 | main.tsx bootstrap, Header group label "Ngôn ngữ giao diện" | OK |
| T16 -> T17 | lesson s1.lam-quen.l1 title "Chương trình là gì?", 2 cards, 2 exercises, ex1 output "Xin chào Robo" | e2e relies on all four. OK |

### Per-task self-consistency

| Task | Finding |
|---|---|
| T1 | Files created = files committed. Smoke test asserts. OK |
| T2 | en placeholders match vi for every key (checked cardOf, exerciseOf, hint.title, judge.test/accepted/partial). OK |
| T3 | Test expectations match parseCard/splitFrontmatter code (traced indices). OK |
| T4 | Tests traced against schema/references/buildBundle (missing-file test uses arrayContaining; stage-10 test renames concept). OK |
| T5 | Expected messages traced against validate_content.py f-strings. OK |
| T6 | Expected values taken from a real Pyodide 314 probe run. OK |
| T7 | Timeout/crash/serialization tests traced against RunnerClient. OK |
| T8 | OK |
| T9 | similar-name expectations traced (Robo/Xin -> null, Print -> print). OK |
| T10 | 27 entries counted; each sample traced to its own entry. OK |
| T11-T15 | Queries traced against rendered labels. OK |
| T13 | CodeEditor contains `// eslint-disable-next-line` although the project has no ESLint — harmless comment, plan-mandated. Note only |
| T16 | 4 code exercises, 6 predict questions; each predict output traced. OK |
| T17 | OK |

Rubric-defect scan (tests asserting nothing / verbatim logic duplication): none found. Python and TS output normalization are intentional parallel implementations in 2 languages (Global Constraints require identical rules), not verbatim duplication.

Pre-flight result: no conflicts requiring rulings.

## Model plan
Implementers: haiku for transcription tasks (T2, T3, T5, T6, T7, T8, T9, T10, T12, T14, T16); sonnet for setup/integration (T1, T4, T11, T13, T15, T17). Reviewers: sonnet. Final review: fable.

## Progress
Task 1: dispatched (BASE 29e111e, implementer sonnet)
Task 1: implementer DONE_WITH_CONCERNS (511bc88) — concern: npm blocked esbuild/fsevents install scripts; controller verified `npx tsx -e` runs, treated as observation. Review dispatched (sonnet).
Task 1: ⚠️ resolved by controller — public/pyodide has 5 files, dist/ exists.
Task 1: minor (deferred): package.json "private": "true" is a string (npm pkg set without --json; plan-mandated)
Task 1: minor (deferred): package.json uses caret ranges; lockfile pins exact versions (plan-mandated)
Task 1: minor (deferred): npm init leftovers in package.json (empty description/keywords, directories.doc)
Task 1: complete (commits 29e111e..511bc88, review clean)
Task 2: dispatched (BASE 511bc88, implementer haiku)
Task 2: implementer DONE (8031c49). Review dispatched (sonnet).
Task 2: ⚠️ resolved by controller — commit 8031c49 carries the required trailers.
Task 2: minor (deferred): LangProvider.test.tsx console.error spy never restored (plan-mandated)
Task 2: minor (deferred): translate.ts `name in vars` matches inherited Object.prototype keys; Object.hasOwn safer
Task 2: complete (commits 511bc88..8031c49, review clean)
Task 3: dispatched (BASE 8031c49, implementer haiku)
Task 3: implementer DONE (b0fa5de). Review dispatched (sonnet).
Task 3: ⚠️ resolved by controller — npm run typecheck clean; js-yaml 5 ships its own types.
Task 3: minor (deferred): parseCard swallows an unterminated ```python fence silently (no LessonFormatError)
Task 3: minor (deferred): unknown fence flags (e.g. expect_error typo) silently ignored; ```py / ```Python not treated as Python
Task 3: minor (deferred): fence detection only startsWith("```"); nested/indented/~~~ fences unsupported (document limitation)
Task 3: minor (deferred): parseCard does not normalise CRLF when called directly
Task 3: complete (commits 8031c49..b0fa5de, review clean)
Task 4: dispatched (BASE b0fa5de, implementer sonnet)
Task 4: implementer DONE (29ef48c). Review dispatched (sonnet).
Task 4: ⚠️ resolved by controller — zod/js-yaml/tsx installed in Task 1 (lockfile pinned); CHECK_NAMES exported by Task 3 types.ts; typecheck was clean after Task 3.
Task 4: minor (deferred): buildBundle readdirSync throws raw ENOENT when content dir missing
Task 4: minor (deferred): topic/lesson names joined into paths unchecked; orphan lesson files silently ignored
Task 4: minor (deferred): neutral choice text "" accepted (use min(1))
Task 4: minor (deferred): tolerance with compare exact silently dropped
Task 4: minor (deferred): invalid topic.yaml drops whole topic -> cascading reference noise
Task 4: minor (deferred): unchecked SafeResult cast in Collector.parse
Task 4: minor (deferred): test gaps — ID pattern, invalid YAML, float tolerance, common_wrong range, code in questions.yaml, empty lessons, bad choice shape, duplicate concept
Task 4: complete (commits b0fa5de..29ef48c, review clean)
Task 5: dispatched (BASE 29ef48c, implementer haiku)
Task 5: implementer DONE (fb063ea). Review dispatched (sonnet).
Task 5: ⚠️ resolved by controller — commonWrong[].test is range-checked by Task 4 zod superRefine and tests has min(1), so IndexError/empty-tests cases cannot reach the validator from a built bundle.
Ruling: accept commit trailers naming the subagent's own model (b0fa5de, fb063ea say "Claude Haiku 4.5") instead of rewriting history — each subagent's harness supplies its own attribution, which is the accurate author; no merge has happened — cost if wrong: cosmetic trailer mismatch, fixable by an interactive-free rebase/amend before merge.
Task 5: minor (deferred): PSEUDO_ERROR_TYPES defined but unused in validate_content.py (plan-mandated)
Task 5: minor (deferred): PYTHONIOENCODING ineffective under -I (dead line, harmless)
Task 5: minor (deferred): Python float()/rstrip vs JS Number()/trimEnd differ on edge tokens (nan, inf, 1_000, exotic whitespace) — cross-language parity note for compare.ts
Task 5: minor (deferred): expectError example that times out reported as "chạy không lỗi"
Task 5: minor (deferred): missing/invalid JSON path -> traceback with exit 1; exit code 2 untested
Task 5: minor (deferred): NFC test uses literal combining chars instead of \u escapes (editor could normalise)
Task 5: complete (commits 29ef48c..fb063ea, review clean)
Task 6: dispatched (BASE fb063ea, implementer haiku)
Task 6: implementer DONE (5a5c239). Review dispatched (sonnet).
Task 6: minor (deferred): bare except/except BaseException in child code swallows _OutputLimit -> finite loop reports ok with truncated stdout (add exceeded flag) — candidate for final review triage
Task 6: minor (deferred): sys.exit("msg")/sys.exit(1) reported as ok, message lost
Task 6: minor (deferred): stdout and stderr each have own 100k budget (total 200k)
Task 6: minor (deferred): `as unknown as` cast on run_user_code proxy; proxy not destroyed
Task 6: minor (deferred): formatRawError prints blank indented line when lineText empty
Task 6: minor (deferred): test gaps — error inside user function (deepest frame), stderr limit, BaseException swallow, stream restore after error
Task 6: complete (commits fb063ea..5a5c239, review clean)
Task 7: dispatched (BASE 5a5c239, implementer haiku)
Task 7: implementer DONE (2711663). Review dispatched (sonnet).
Task 7: ⚠️ worker.ts/browser.ts bundling + dynamic import of public pyodide.mjs — deferred by plan to Task 17 e2e (carry to Task 15 build check and Task 17). Trailer ⚠️ covered by the trailer ruling.
Task 7: minor (deferred): retry() while loading leaves old ready pending -> queued runs hang (UI only offers retry when failed) — candidate for final review triage
Task 7: minor (deferred): handlers of a replaced worker not detached/guarded (latent with real Worker)
Task 7: minor (deferred): onerror when status already failed falls into handleCrash and restarts; failed-loading worker not terminated
Task 7: minor (deferred): worker.ts does not post run-failed if runner throws -> misleading timeout
Task 7: minor (deferred): client tests miss late result after timeout, queued run after timeout, run-failed path, unsubscribe
Task 7: minor (deferred): throwing status listener aborts start() before init postMessage
Task 7: complete (commits 5a5c239..2711663, review clean)
Task 8: dispatched (BASE 2711663, implementer haiku)
Task 8: implementer DONE (56db002). Review dispatched (sonnet).
Task 8: minor (deferred): isNumber (JS Number) vs Python float() disagree on 0x10/0b1/Infinity/inf/1_0 tokens in float mode — parity edge case
Task 8: minor (deferred): trimEnd vs rstrip whitespace sets differ slightly
Task 8: minor (deferred): common-wrong match always exact (matches validator) — add comment
Task 8: minor (deferred): judge rejects if RunFn rejects (RunnerCrashError) — UI (Task 13) catches and shows crash feedback, by design
Task 8: minor (deferred): judge test gaps — mixed outcomes, float mode, multi-line float, passing run with prompt adds no misconception
Task 8: complete (commits 2711663..56db002, review clean)
Task 9: dispatched (BASE 56db002, implementer haiku)
Task 9: implementer DONE (bd83971). Review dispatched (sonnet).
Task 9: Ruling: reviewer's Important "commit trailer says Claude Haiku 4.5, plan says Opus 5.5" — not entered into fix loop; covered by the earlier trailer ruling (subagent harness supplies its own accurate attribution; rewriting history mid-plan risks the ledger's commit references) — cost if wrong: trailers normalised at finishing time with a non-interactive rebase.
Task 9: ⚠️ resolved by plan — Task 10 ships smart-quote and input-prompt entries and the Pyodide parity test that matches each sample to its own entry.
Task 9: minor (deferred): explainWithChain does not isolate a rejecting provider (matters when OpenRouter provider is added)
Task 9: minor (deferred): RegExp rebuilt per call (build_content compiles each pattern at build time)
Task 9: minor (deferred): Python keywords counted as candidate names in findSimilarName
Task 9: minor (deferred): while-loop check scans whole file incl. strings/comments
Task 9: minor (deferred): test gaps — regex fall-through same type, while in comment/string, line null -> "?" via provider
Task 9: complete (commits 56db002..bd83971, review clean after ruling)
Task 10: dispatched (BASE bd83971, implementer haiku)
Task 10: implementer DONE (8984397) with deviation: smart-quote regex+sample changed. Review dispatched (sonnet).
Task 10: review Needs fixes (head 8984397) — Critical: smart-quote entry regex+sample changed to straight quotes, real curly quotes fall to syntax-other, raw {char} shown; Important: parity test can't catch it (add YAML-independent assertion — accepted as addition protecting plan Review Focus #5). ⚠️ generated bundle freshness: npm test runs content:build first (resolved).
Task 10: fix round 1/5 dispatched (resumed implementer)
Task 10: fix round 1/5 (1 addressed, 1 open — added parity test vacuous: wrong input, OR assertion, no char check; commits 8984397..5f54af9)
Task 10: fix round 2/5 dispatched (resumed implementer, exact test shape given with \u escapes)
Task 10: fix round 2/5 (1 addressed, 0 open; commits 5f54af9..a3a0e4b)
Task 10: minor (deferred): smart-quote added test uses literal curly chars, not \u escapes (bytes verified correct; an editor could normalise them)
Task 10: minor (deferred): smart-quote entry moved before unterminated-string (deviation from brief order; re-reviewer verified harmless)
Task 10: complete (commits bd83971..a3a0e4b, review clean after 2 fix rounds)
Task 11: dispatched (BASE a3a0e4b, implementer sonnet). Ruling: Task 16 implementer upgraded haiku->sonnet — haiku's editor normalised curly quotes in Task 10; Task 16 is Unicode-heavy YAML content — cost if wrong: slightly higher token cost.
Task 11: implementer DONE (96ab255), deviation: Mock<() => void> type in render.tsx. Review dispatched (sonnet).
Task 11: ⚠️ resolved by controller — message keys are typed MessageKey (typecheck enforces existence; Task 2 parity test enforces vi/en equality). Minor 1 (useRunnerClient race) not real: RunnerClient.subscribe calls the listener immediately with the current status.
Task 11: minor (deferred): Robot aria-label "Robo" hardcoded (robot's name; plan-mandated)
Task 11: minor (deferred): shell.test.tsx console.error spy not restored
Task 11: minor (deferred): Header onClick={runner.retry} passes the click event
Task 11: complete (commits a3a0e4b..96ab255, review clean)
Task 12: dispatched (BASE 96ab255, implementer haiku)
Task 12: implementer DONE (c26392d). Review dispatched (sonnet).
Task 12: ⚠️ resolved by controller — code.* keys exist (typed MessageKey, typecheck clean); Task 9/11 signatures used as defined.
Task 12: minor (deferred): CodeExample keeps stale stdout after a failed re-run (no setStdout(null) on start/catch)
Task 12: minor (deferred): broad catch also hides explain-step bugs as crash message (plan-mandated; consider console.error)
Task 12: minor (deferred): truncation test doesn't assert the cut length; no test for disabled-while-running
Task 12: minor (deferred): slice may split a surrogate pair at the cap
Task 12: complete (commits 96ab255..c26392d, review clean)
Task 13: dispatched (BASE c26392d, implementer sonnet)
Task 13: implementer DONE (317cd9c). Controller removed untracked content/errors/errors.yaml.bak (Task 10 fix-round leftover, content in git history) so Task 16's git add content won't commit it. Review dispatched (sonnet).
Task 13: review Needs fixes (head 317cd9c) — Important (plan-mandated): hidden test's Python error message/raw traceback reaches the robot bubble (can contain hidden input); Important: no tests for input-prompt explanation on submit, repeated clicks while busy, hidden-data absence.
Task 13: Ruling: hidden-test leak fixed against the plan text — spec 4.2 says hidden tests only report pass/fail, spec is the authority. Behaviour: on a failed submit, explain the first failed VISIBLE test if any; if only hidden tests failed, explain pseudo problems (Timeout/OutputLimit/InputPrompt carry no data) normally, but for a real Python error or a plain wrong answer in a hidden test show the judge.partial message with mood sad, no rawError, no error line — cost if wrong: child gets less specific help on hidden-only crashes (still sees which test failed).
Task 13: ⚠️ resolved by controller — LessonScreen (Task 15) keys CodeExerciseView by exercise.id; real editor 4-space/Tab/textbox label covered by Task 17 e2e (typing + auto-indent in loop test); runner.run is a closure from useRunnerClient/fakeRunner.
Task 13: minor (deferred): CodeEditor ariaLabel captured once (stale after language switch)
Task 13: minor (deferred): no ref-based re-entry guard (relies on disabled prop)
Task 13: minor (deferred): two long Feedback literals could be a helper; setState after await without unmount guard
Task 13: fix round 1/5 dispatched (resumed implementer)
Task 13: fix round 1/5 (2 addressed, 0 open; commits 317cd9c..78e8a05)
Task 13: minor (deferred): no test for a hidden pseudo problem (e.g. Timeout on hidden test) being explained
Task 13: complete (commits c26392d..78e8a05, review clean after 1 fix round)
Task 14: dispatched (BASE 78e8a05, implementer haiku)
Task 14: implementer DONE (2d657ed). Review dispatched (sonnet).
Task 14: ⚠️ resolved by plan — styles.css (Task 15) defines question-card/choice/sr-only classes; LessonScreen (Task 15) mounts QuestionCard with key={exercise.id}.
Task 14: minor (deferred): lang seeded once from questionLang (not documented); correctIndex -1 if no correct choice (schema prevents)
Task 14: minor (deferred): test gaps — non-default questionLang, lock after check, explanation follows toggle, missing en in both-mode
Task 14: complete (commits 78e8a05..2d657ed, review clean)
Task 15: dispatched (BASE 2d657ed, implementer sonnet). Ruling: brief Step 5 manual browser check replaced by build + worker-asset check — subagent has no browser; Task 17 Playwright covers the browser — cost if wrong: a dev-server-only issue surfaces in Task 17 instead of here.
Task 15: implementer DONE (7d5561c); build warns main chunk 720 kB. Review dispatched (sonnet).
Task 15: review Needs fixes (head 7d5561c) — Important: parseHash decodeURIComponent throws on malformed hash outside any ErrorBoundary -> blank page.
Task 15: ⚠️ resolved by controller — base "./" set in Task 1 vite.config.ts (reviewed); worker asset seen in dist by implementer; generated content.json produced by every script.
Task 15: minor (deferred): no top-level ErrorBoundary around Header/providers (plan-mandated layout)
Task 15: minor (deferred): empty-steps lesson shows done screen without onComplete (schema requires >=1 card)
Task 15: minor (deferred): build warns main JS chunk 720 kB (CodeMirror etc.; consider code-splitting later)
Task 15: fix round 1/5 dispatched (resumed implementer)
Task 15: fix round 1/5 (1 addressed, 0 open; commits 7d5561c..278b412)
Task 15: complete (commits 2d657ed..278b412, review clean after 1 fix round)
Task 16: Ruling: when replacing src/content/parity.pyodide.test.ts per brief Step 1, keep Task 10's added test 'smart-quote: real curly quotes pasted from Word are recognized (added test)' inside the error-dictionary describe — it protects Review Focus #5; brief predates it — cost if wrong: none (extra passing test). Step 7 manual browser check replaced by Task 17 Playwright (same ruling as Task 15). Dispatched (BASE 278b412, implementer sonnet).
Task 16: implementer DONE (774ff54); RED not recorded (content written first). Review dispatched (sonnet).
Task 16: ⚠️ resolved by controller — npm run content:validate on 774ff54: "1 giai đoạn, 4 bài học, 27 mục lỗi", "Nội dung hợp lệ."; choice text normalisation done by Task 4 schema (reviewed).
Task 16: minor (deferred): parity test doesn't check the error TYPE of predict questions whose answer is an error (both error choices pass)
Task 16: minor (deferred): RED run not recorded for the extended parity test (content written first)
Task 16: complete (commits 278b412..774ff54, review clean)
Task 17: dispatched (BASE 774ff54, implementer sonnet)
Task 17: implementer DONE (f2369e5); npm run check all green, Playwright 5/5 first run. Review dispatched (sonnet).
Task 17: minor (deferred): reuseExistingServer:!CI may reuse a stale preview on 4173 (plan-mandated)
Task 17: minor (deferred): e2e navigation steps duplicated in test 1; ready-check after timeout could use Run-enabled
Task 17: minor (deferred): npm run check runs content:build 4 times; content:validate uses python3 vs test:py .venv
Task 17: complete (commits 774ff54..f2369e5, review clean)
User request: dev server started in worktree on http://localhost:5173/ (background) for manual check of lesson 1.
Final review: dispatched (fable) over 29e111e..f2369e5
User request: dev server stopped (port 5173).
Final review (f2369e5): Ready to merge: Yes. Important: (1) worker.ts async onmessage swallows runner throw -> crash reported as timeout; (2) NameError regex \w ASCII-only + ASCII identifier scan -> Vietnamese names get "lỗi lạ". Minor: TabError entry missing; example output trailing newline; input-prompt pseudo-misconception undocumented; no reload hint after 3 crashes; html lang static; marked output unsanitised. Deferred minors: none must-fix.
Ruling: final fix wave includes Important 1-2 plus cheap minors 3,4,5,6,7 and deferred T7 retry-while-loading guard, T4 neutral choice text min(1), T12 stale stdout — each <10 lines, protects stage 2 content and spec 10 wording — cost if wrong: small extra diff. Excluded: minor 8 (HTML sanitiser — new dependency, content is repo-authored), all other deferred minors (reviewer: can-wait).
Ruling: commit-trailer constraint left unmet by design (11/21 commits carry the subagent's model); not rebasing — reviewer accepts — cost if wrong: cosmetic, fixable by the user before publishing.
Final fix wave: dispatched (BASE f2369e5, sonnet)
Final fix wave: DONE_WITH_CONCERNS (4a29a6c); npm run check green (vitest 193, pytest 17, 28 entries, e2e 5). Concern: F1 worker try/catch not unit-testable; F2 parity not run against old YAML. Scoped re-review dispatched (sonnet).
Final fix wave: re-review clean (10/10 addressed, no new breakage; commits f2369e5..4a29a6c)
