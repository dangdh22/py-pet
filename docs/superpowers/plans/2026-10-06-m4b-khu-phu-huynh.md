# M4b – Khu phụ huynh: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phụ huynh vào khu riêng bằng mã PIN (tự khóa sau 5 phút), xem tổng quan (cảnh báo, số phút học 7 ngày, giai đoạn, kế hoạch tuần, chuỗi ngày, xu), xem con cần hỗ trợ ở đâu (kèm bài làm thật, gợi ý kèm con, giao bài luyện, đánh dấu đã kèm), xem tiến độ chi tiết, duyệt phần thưởng và sửa danh sách, đổi cài đặt (chế độ nghỉ, mục tiêu, ngưỡng (*), ngôn ngữ, đổi PIN, xóa hồ sơ, nhật ký). Quên PIN thì đặt lại được và việc đặt lại luôn hiện trong khu phụ huynh. Làm xong các việc chuyển từ M3a: kiểm tra `meta` khi nhập file, lối xuất dữ liệu khi IndexedDB hỏng, focus bàn phím của bài sắp xếp, khóa sửa khi đang chấm.

**Architecture:** Mọi luật và dữ liệu đã có từ M4a (GameState version 4); M4b không đổi version. Các cài đặt (*) bắt đầu có tác dụng: `isPass` nhận ngưỡng đạt, `recordResult` nhận ngưỡng "Cần hỗ trợ", `RunnerTimeout` truyền giới hạn thời gian chạy code, `GameProvider` đặt ngôn ngữ câu hỏi mặc định. `SettingsChanged` đi qua `cleanSettings` (giới hạn từng số). `GameStore` có thêm `attemptsFor`; `AppMeta` có `pinResetAt`. `GameApi` có `setPin`, `attemptsFor`, `eraseAll`, `pinResetAt`, `errorLog`. Giao diện: `ParentScreen` (cửa PIN, đặt lại PIN, tự khóa, 5 tab `ParentOverview`, `ParentHelp`, `ParentProgress`, `ParentRewards`, `ParentSettings`); số liệu cho phụ huynh là hàm thuần trong `src/game/parentStats.ts`.

**Tech Stack:** Như M4a. Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md`

## Global Constraints

- Phạm vi M4b: spec 9 (khu phụ huynh), 6.3 (đặt lại PIN), 6.5 (kiểm tra file nhập), 10 (dữ liệu hỏng, nhật ký lỗi), 5 (*) (các giá trị phụ huynh chỉnh được), 7.2 (`questionLanguage`), và các việc chuyển từ M3a/M3b trong `STATUS.md`.
- Ngoài phạm vi M4b (đừng làm): hình robot, phụ kiện vẽ trên robot, hoạt cảnh (M6); nội dung mới (M5); giao diện nhiều hồ sơ (ngoài bản đầu).
- Không đổi `GAME_STATE_VERSION` (4) và `SCHEMA_VERSION` (4). `AppMeta.pinResetAt` là trường mới của meta, mặc định `null`; meta đọc từ kho cũ hoặc file cũ được bổ sung giá trị mặc định.
- Luật chơi là hàm thuần nhận `now` từ ngoài. ID của bài luyện được giao và của phần thưởng mới do giao diện tạo.
- Con số của spec: khu phụ huynh tự khóa sau 5 phút không thao tác hoặc khi rời khu; số phút học 7 ngày, ngày nghỉ màu xám; khái niệm đang luyện là điểm 40 đến 70; PIN 4 đến 6 chữ số; nhật ký lỗi 50 mục.
- Giới hạn cài đặt (phải nằm trong giới hạn của schema M4a): mục tiêu ngày 1–10, kế hoạch tuần 0–50, ngày vắng được miễn 0–7, ngưỡng đạt 50–100%, ngưỡng "Cần hỗ trợ" 30–90%, thời gian chạy code 1–10 giây.
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder.
- Không gọi mạng.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy.
- Mốc xanh trước khi bắt đầu: `npm run check` sau M4a (Vitest 574, pytest 21, e2e 12). Sau M4b: Vitest 610, pytest 21, e2e 14. Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e.

## Review Focus

1. Khu phụ huynh không mở được khi không có PIN đúng; tự khóa sau 5 phút; đặt lại PIN luôn để lại dấu vết thấy được. Test: Task 3 (`ParentScreen gate`).
2. Nhập file không bao giờ làm mất PIN của máy (file không có PIN giữ PIN hiện tại) và không nhận file có `meta` hỏng hoặc không có hồ sơ. Test: Task 2.
3. Phụ huynh không làm hỏng dữ liệu bằng số ngoài giới hạn (ngưỡng, thời gian chạy code). Test: Task 1 (`cleanSettings`), Task 7.
4. Bằng chứng trong "Con cần hỗ trợ" là bài làm thật của con, đúng khái niệm. Test: Task 4.
5. Dữ liệu hỏng vẫn xuất được để không mất trước khi phụ huynh xử lý. Test: Task 8.

## Quyết định thiết kế

Spec để ngỏ các điểm sau; kế hoạch chốt như dưới đây (chưa được người bảo trì duyệt, ghi trong `docs/superpowers/DECISIONS.md`).

1. **Duyệt phần thưởng bằng PIN** = duyệt bên trong khu phụ huynh (đã mở bằng PIN); không hỏi PIN lần nữa cho mỗi yêu cầu.
2. **Đặt lại PIN** không cần PIN cũ (spec 6.3 chỉ yêu cầu ghi lại). Lúc đặt lại được lưu ở `meta.pinResetAt` và khu phụ huynh luôn hiện dòng "Mã PIN đã được đặt lại lúc …". Đổi PIN từ trong khu phụ huynh không bị coi là đặt lại.
3. **Bằng chứng** trong "Con cần hỗ trợ": 3 lượt làm gần nhất của các bài thuộc khái niệm (lượt làm code: code của con và số test qua; câu hỏi: đáp án con chọn, đúng hay sai). Đầu ra so với đầu ra mong đợi chưa được lưu trong lịch sử làm bài nên chưa hiện (để dành cho bản sau).
4. **Giao thêm bài luyện** lấy 2 bài theo mức bậc thang hiện tại (như bài luyện của M3a); không có bài phù hợp thì nút bị tắt.
5. **Tiến độ chi tiết** hiện theo chủ đề (bài đã học, thành thạo trung bình của các khái niệm đã có điểm, điểm cao nhất của kiểm tra chủ đề), lịch sử kiểm tra tiến hóa, và mỗi bài học (đã xong chưa; số lần nộp sai, gợi ý, đã xem lời giải của từng bài code). Thời gian học từng bài và ngôn ngữ câu hỏi từng bài chưa hiện.
6. **Số xu trung bình/ngày** = xu kiếm được (không tính tiêu) trong 14 ngày gần nhất chia 14.
7. **Xóa hồ sơ** cần gõ đúng tên của con; xóa toàn bộ dữ liệu trên máy (hồ sơ, cài đặt, PIN) và app quay về màn hình chào hỏi.
8. **File nhập** phải có ít nhất 1 hồ sơ và `meta` đúng dạng (PIN đúng dạng hoặc `null`); hồ sơ đang dùng không có trong file thì lấy hồ sơ đầu tiên; file không có PIN thì giữ PIN của máy.
9. **Dữ liệu hỏng khi mở app:** ghi nhật ký lỗi loại `load-failed` và có nút "Xuất dữ liệu để gửi hỗ trợ" (file JSON thô, không phải `.pypet`, vì state hỏng không nhập lại được).
10. **Ngôn ngữ giao diện** trong Cài đặt dùng chung cơ chế với nút VI/EN ở đầu trang.

---

## File Structure

```
src/game/
  settings.ts     SETTING_LIMITS, cleanSettings
  parentStats.ts  minutesByDay, averageXuPerDay, accuracyPercent, conceptsNeedingHelp, conceptsPractising
  (sửa) apply.ts, mastery.ts, rewards.ts, realRewards.ts  ngưỡng của phụ huynh, giới hạn giá và số lần đổi
src/storage/      (sửa) AppMeta.pinResetAt, attemptsFor, kiểm tra meta khi nhập, ErrorLogEntry "load-failed"
src/ui/
  format.ts              formatDateTime
  ParentScreen.tsx       cửa PIN, đặt lại PIN, tự khóa, 5 tab
  ParentOverview.tsx     tab Tổng quan
  ParentHelp.tsx         tab Con cần hỗ trợ
  ParentProgress.tsx     tab Tiến độ
  ParentRewards.tsx      tab Phần thưởng
  ParentSettings.tsx     tab Cài đặt
  (sửa) GameProvider, contexts (RunnerTimeout), GameRoot (xuất dữ liệu hỏng), PuzzleExerciseView,
        TopicTestScreen, EvolutionTestScreen, routing, AppRoutes, RoomScreen, styles.css
e2e/parent.spec.ts
```

## Cách đọc các khối `diff`

Khối `diff` trong kế hoạch là thay đổi chính xác so với code ngay trước task đó (dòng `-` bỏ, dòng `+` thêm). Có thể sửa bằng tay hoặc lưu khối vào file rồi chạy `git apply <file>`. Khối có tiêu đề "thay toàn bộ file" hoặc "tạo file" là nội dung đầy đủ của file.

---

### Task 1: Cài đặt của phụ huynh có tác dụng

**Files:**
- Create: `src/game/settings.ts`
- Modify: `src/game/apply.ts`, `src/game/mastery.ts`, `src/game/rewards.ts`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/test/render.tsx`, `src/ui/contexts.tsx`, `src/ui/GameProvider.tsx`, `src/ui/TopicTestScreen.tsx`, `src/ui/EvolutionTestScreen.tsx`
- Test: `src/game/settings.test.ts`, `src/ui/GameProvider.test.tsx`

**Interfaces:**
- Consumes: `GameSettings` có `passPercent`, `helpPercent`, `runSeconds`, `questionLang` (M4a); `RunnerApi.run(code, stdin, timeoutMs?)`; `useLang().setQuestionLang`.
- Produces:
  - `SETTING_LIMITS` (giới hạn từng số), `NumberSetting`, `cleanSettings(current, patch): GameSettings` (số làm tròn và kẹp trong giới hạn; giá trị không phải số hoặc ngôn ngữ lạ giữ giá trị cũ).
  - `SettingsChanged` đi qua `cleanSettings`.
  - `isPass(score, max, percent = 80)`; `recordResult(m, s, source, helpAccuracy = 0.6)`; `recordMisconception(m, helpAccuracy = 0.6)`.
  - `RunnerTimeout({ seconds })`: runner bên trong dùng `seconds * 1000` khi nơi gọi không tự đưa giới hạn. `GameProvider` bọc con trong `RunnerTimeout` và đặt ngôn ngữ câu hỏi mặc định từ `settings.questionLang`.
  - `exam.notPassed` có placeholder `{percent}`.
  - `fakeRunner().calls[i].timeoutMs` chỉ có khi nơi gọi đưa giới hạn.

- [ ] **Step 1: Viết test thất bại**

`src/game/settings.test.ts` (tạo file):

```ts
import { describe, expect, test } from "vitest";
import { at, run } from "../test/gameSteps";
import { apply } from "./apply";
import { emptyMastery, recordResult } from "./mastery";
import { isPass } from "./rewards";
import { cleanSettings } from "./settings";
import { DEFAULT_SETTINGS, initialGameState } from "./state";

describe("cleanSettings", () => {
  test("keeps numbers whole and inside their limits", () => {
    expect(
      cleanSettings(DEFAULT_SETTINGS, { dailyGoal: 0, weeklyTarget: 99, graceDays: 2.6, passPercent: 40, runSeconds: 3 }),
    ).toEqual({ ...DEFAULT_SETTINGS, dailyGoal: 1, weeklyTarget: 50, graceDays: 3, passPercent: 50, runSeconds: 3 });
  });

  test("a value that is not a number or not a language keeps the old one", () => {
    const bad = { helpPercent: Number.NaN, uiLang: "fr", questionLang: "de" } as unknown as Parameters<typeof cleanSettings>[1];
    expect(cleanSettings(DEFAULT_SETTINGS, bad)).toEqual(DEFAULT_SETTINGS);
  });

  test("SettingsChanged uses it", () => {
    const state = apply(initialGameState("2026-10-06"), { type: "SettingsChanged", patch: { passPercent: 120 } }, at("2026-10-06"));
    expect(state.settings.passPercent).toBe(100);
  });
});

describe("the parent's numbers take effect", () => {
  test("the pass mark of the tests", () => {
    expect(isPass(18, 24)).toBe(false);
    expect(isPass(18, 24, 75)).toBe(true);
    const start = initialGameState("2026-10-06");
    start.settings.passPercent = 70;
    const state = run(start, [["2026-10-06", { type: "TopicTestCompleted", topicId: "t", score: 10, max: 14, items: [] }]]);
    expect(state.progress.topicTests.t!.passed).toBe(true);
  });

  test("the help threshold of a concept", () => {
    let m = emptyMastery();
    for (const s of [1, 1, 1, 0, 0]) m = recordResult(m, s, "lesson", 0.7);
    expect(m.needsHelp).toBe(true);
    let n = emptyMastery();
    for (const s of [1, 1, 1, 0, 0]) n = recordResult(n, s, "lesson");
    expect(n.needsHelp).toBe(false);
  });
});
```

`src/ui/GameProvider.test.tsx`:

```diff
diff --git a/src/ui/GameProvider.test.tsx b/src/ui/GameProvider.test.tsx
index 29b5c8e..f27d165 100644
--- a/src/ui/GameProvider.test.tsx
+++ b/src/ui/GameProvider.test.tsx
@@ -11,7 +11,8 @@ import type { AppMeta, ProfileBundle } from "../storage/types";
 import { hashPin } from "../storage/pin";
 import { sampleBackupPayload } from "../test/backupSample";
 import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
-import { useLogError } from "./contexts";
+import { fakeRunner, okResult } from "../test/render";
+import { useLogError, useRunner } from "./contexts";
 import { DRAFT_SAVE_DELAY_MS, useGame } from "./GameProvider";
 
 afterEach(() => {
@@ -379,3 +380,26 @@ describe("GameProvider import race", () => {
     );
   });
 });
+
+describe("the parent's settings in the app", () => {
+  test("code runs with the time limit and questions start in the default question language", async () => {
+    const state = initialGameState(TODAY);
+    state.settings.runSeconds = 5;
+    state.settings.questionLang = "both";
+    const runner = fakeRunner(() => okResult(""));
+    function Probe() {
+      const { run } = useRunner();
+      const { questionLang } = useLang();
+      return (
+        <>
+          <p>{questionLang}</p>
+          <button onClick={() => void run("x", "")}>run</button>
+        </>
+      );
+    }
+    await renderWithGame(<Probe />, { state, runner });
+    expect(await screen.findByText("both")).toBeInTheDocument();
+    await userEvent.click(screen.getByRole("button", { name: "run" }));
+    expect(runner.calls.at(-1)).toMatchObject({ code: "x", timeoutMs: 5000 });
+  });
+});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/settings.test.ts src/ui/GameProvider.test.tsx`
Expected: FAIL: chưa có `./settings`; `isPass` chưa nhận ngưỡng; runner chưa nhận giới hạn thời gian.

- [ ] **Step 3: Viết code**

`src/game/settings.ts` (tạo file):

```ts
import type { GameSettings } from "./state";

/** Spec 5 (*) and 9.5: the range a parent can set for each number. */
export const SETTING_LIMITS = {
  dailyGoal: { min: 1, max: 10 },
  weeklyTarget: { min: 0, max: 50 },
  graceDays: { min: 0, max: 7 },
  passPercent: { min: 50, max: 100 },
  helpPercent: { min: 30, max: 90 },
  runSeconds: { min: 1, max: 10 },
} as const satisfies Partial<Record<keyof GameSettings, { min: number; max: number }>>;

export type NumberSetting = keyof typeof SETTING_LIMITS;

/** Whole numbers inside their limits; a value that is not a number keeps the old one. */
export function cleanSettings(current: GameSettings, patch: Partial<GameSettings>): GameSettings {
  const next = { ...current, ...patch };
  for (const key of Object.keys(SETTING_LIMITS) as NumberSetting[]) {
    const { min, max } = SETTING_LIMITS[key];
    const value = Number(next[key]);
    next[key] = Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : current[key];
  }
  if (next.uiLang !== "vi" && next.uiLang !== "en") next.uiLang = current.uiLang;
  if (!["vi", "en", "both"].includes(next.questionLang)) next.questionLang = current.questionLang;
  return next;
}
```

Các file còn lại:

```diff
diff --git a/src/game/apply.ts b/src/game/apply.ts
index 8a65bce..d774cb8 100644
--- a/src/game/apply.ts
+++ b/src/game/apply.ts
@@ -27,6 +27,7 @@ import {
   type RewardItem,
 } from "./state";
 import { cleanCatalog, freeXu, requestBlock, trimRequests } from "./realRewards";
+import { cleanSettings } from "./settings";
 import { findShopItem, isConsumable, MAX_CONSUMABLES, STREAK_GIFTS } from "./shop";
 import { cancelVacation, pruneVacations, scheduleVacation, toggleVacation, weekTarget, workDaysBetween } from "./vacation";
 import { changeXu } from "./wallet";
@@ -121,7 +122,7 @@ export function apply(state: GameState, event: GameEvent, now: Date): GameState
     case "DayRollover":
       break;
     case "SettingsChanged":
-      next.settings = { ...next.settings, ...event.patch };
+      next.settings = cleanSettings(next.settings, event.patch);
       break;
     case "LessonCompleted":
       completeLesson(next, event.lessonId, today, rollback);
@@ -289,16 +290,21 @@ function statsFor(s: GameState, exerciseId: string): ExerciseStats {
   return (all[exerciseId] ??= { fails: 0, hints: 0, viewedSolution: false });
 }
 
+/** The parent's "needs help" share of right answers (spec 5.9 (*)). */
+function helpAccuracy(s: GameState): number {
+  return s.settings.helpPercent / 100;
+}
+
 function updateMastery(s: GameState, conceptId: string, change: (m: ConceptMastery) => ConceptMastery): void {
   s.mastery[conceptId] = change(s.mastery[conceptId] ?? emptyMastery());
 }
 
 function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
   const source = e.source ?? "lesson";
-  for (const id of e.misconceptions ?? []) updateMastery(s, id, recordMisconception);
+  for (const id of e.misconceptions ?? []) updateMastery(s, id, (m) => recordMisconception(m, helpAccuracy(s)));
   if (e.accepted) {
     const score = solvedScore(e.failedSubmitsBefore, e.hintsUsed, e.viewedSolution);
-    for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
+    for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source, helpAccuracy(s)));
     if (!e.viewedSolution) delete s.retry[e.exerciseId];
   }
   // A review station or a test pays as a whole (ReviewCompleted, TopicTestCompleted, EvolutionTestCompleted), not per
@@ -343,8 +349,8 @@ function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudg
 function answerQuestion(s: GameState, e: Extract<GameEvent, { type: "QuestionAnswered" }>, today: string): void {
   const source = e.source ?? "lesson";
   const score = e.correct ? MASTERY.score.firstTry : MASTERY.score.wrong;
-  for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
-  if (!e.correct && e.misconception) updateMastery(s, e.misconception, recordMisconception);
+  for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source, helpAccuracy(s)));
+  if (!e.correct && e.misconception) updateMastery(s, e.misconception, (m) => recordMisconception(m, helpAccuracy(s)));
   s.reviews[e.questionId] = reviewCard(s.reviews[e.questionId], e.correct, today);
   if (source === "review" || source === "test") {
     // No XP for a review or test answer, but it counts for the correct run that raises Vui.
@@ -388,7 +394,7 @@ function raiseVui(s: GameState): void {
 /** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
 function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
   const previous = s.progress.topicTests[e.topicId];
-  const passed = isPass(e.score, e.max);
+  const passed = isPass(e.score, e.max, s.settings.passPercent);
   s.progress.topicTests[e.topicId] = {
     attempts: (previous?.attempts ?? 0) + 1,
     best: Math.max(previous?.best ?? 0, e.score),
@@ -412,7 +418,7 @@ function completeEvolutionTest(
   e: Extract<GameEvent, { type: "EvolutionTestCompleted" }>,
   now: Date,
 ): void {
-  const passed = isPass(e.score, e.max);
+  const passed = isPass(e.score, e.max, s.settings.passPercent);
   s.progress.evolutionTests.push({
     at: now.toISOString(),
     stage: e.stage,
diff --git a/src/game/mastery.ts b/src/game/mastery.ts
index a36edaa..d99ccfa 100644
--- a/src/game/mastery.ts
+++ b/src/game/mastery.ts
@@ -31,14 +31,22 @@ export function solvedScore(failedSubmitsBefore: number, hintsUsed: number, view
 
 const round2 = (n: number) => Math.round(n * 100) / 100;
 
-function shouldFlag(m: ConceptMastery): boolean {
+function shouldFlag(m: ConceptMastery, helpAccuracy: number): boolean {
   const right = m.recent.filter((s) => s >= MASTERY.rightFrom).length;
-  const lowAccuracy = m.recent.length >= MASTERY.helpMinResults && right / m.recent.length < MASTERY.helpAccuracy;
+  const lowAccuracy = m.recent.length >= MASTERY.helpMinResults && right / m.recent.length < helpAccuracy;
   return lowAccuracy || m.misconceptions >= MASTERY.helpMisconceptions || m.reviewMisses >= MASTERY.helpReviewMisses;
 }
 
-/** Adds 1 result s (0 to 1) to a concept: score, ladder, recent results and the help flag. */
-export function recordResult(current: ConceptMastery, s: number, source: ResultSource): ConceptMastery {
+/**
+ * Adds 1 result s (0 to 1) to a concept: score, ladder, recent results and the help flag. `helpAccuracy` is the
+ * parent's "needs help" share of right answers (spec 5.9 (*)).
+ */
+export function recordResult(
+  current: ConceptMastery,
+  s: number,
+  source: ResultSource,
+  helpAccuracy: number = MASTERY.helpAccuracy,
+): ConceptMastery {
   const m: ConceptMastery = { ...current, recent: [...current.recent, s].slice(-MASTERY.recent) };
   m.score = round2(Math.min(100, Math.max(0, m.score + MASTERY.rate * (s * 100 - m.score))));
   const right = s >= MASTERY.rightFrom;
@@ -56,15 +64,15 @@ export function recordResult(current: ConceptMastery, s: number, source: ResultS
     m.needsHelp = false;
     m.misconceptions = 0;
     m.reviewMisses = 0;
-  } else if (shouldFlag(m)) {
+  } else if (shouldFlag(m, helpAccuracy)) {
     m.needsHelp = true;
   }
   return m;
 }
 
 /** Counts 1 sighting of the misconception that belongs to this concept. */
-export function recordMisconception(current: ConceptMastery): ConceptMastery {
+export function recordMisconception(current: ConceptMastery, helpAccuracy: number = MASTERY.helpAccuracy): ConceptMastery {
   const m = { ...current, misconceptions: current.misconceptions + 1 };
-  if (shouldFlag(m)) m.needsHelp = true;
+  if (shouldFlag(m, helpAccuracy)) m.needsHelp = true;
   return m;
 }
diff --git a/src/game/rewards.ts b/src/game/rewards.ts
index 50dd6cb..06892da 100644
--- a/src/game/rewards.ts
+++ b/src/game/rewards.ts
@@ -39,7 +39,10 @@ export const CORRECT_RUN_FOR_VUI = 3;
 /** A test is passed from this share of its points (spec 5.11; the parent can change it in M4). */
 export const PASS_RATIO = 0.8;
 
-/** True when `score` reaches PASS_RATIO of `max`. The tolerance keeps 11.2 of 14 a pass despite float rounding. */
-export function isPass(score: number, max: number): boolean {
-  return max > 0 && score >= max * PASS_RATIO - 1e-9;
+/**
+ * True when `score` reaches `percent` of `max` (the parent's pass mark, spec 5.11 (*)). The tolerance keeps 11.2 of
+ * 14 a pass at 80% despite float rounding.
+ */
+export function isPass(score: number, max: number, percent: number = PASS_RATIO * 100): boolean {
+  return max > 0 && score >= (max * percent) / 100 - 1e-9;
 }
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index e229b71..674f61c 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -121,7 +121,7 @@ export const en: Record<MessageKey, string> = {
   "exam.topicDone": "Test finished!",
   "exam.score": "You got {score} of {max} points.",
   "exam.passed": "You passed!",
-  "exam.notPassed": "You did not reach 80% this time. Let us review a little more.",
+  "exam.notPassed": "You did not reach {percent}% this time. Let us review a little more.",
   "exam.locked": "This test is not open yet. Finish the lessons before it first.",
   "exam.notFound": "This test does not exist.",
   "exam.empty": "This test has no questions yet.",
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index cf9e08a..216b396 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -119,7 +119,7 @@ export const vi = {
   "exam.topicDone": "Xong bài kiểm tra!",
   "exam.score": "Con được {score}/{max} điểm.",
   "exam.passed": "Con đã đạt!",
-  "exam.notPassed": "Lần này chưa đạt 80%, con ôn thêm nhé.",
+  "exam.notPassed": "Lần này chưa đạt {percent}%, con ôn thêm nhé.",
   "exam.locked": "Bài kiểm tra này chưa mở. Con học các bài trước đã nhé.",
   "exam.notFound": "Không tìm thấy bài kiểm tra này.",
   "exam.empty": "Chưa có câu hỏi cho bài kiểm tra này.",
diff --git a/src/test/render.tsx b/src/test/render.tsx
index c5fb22a..8aa7053 100644
--- a/src/test/render.tsx
+++ b/src/test/render.tsx
@@ -26,7 +26,8 @@ export function errorResult(
 }
 
 export interface FakeRunner extends RunnerApi {
-  calls: { code: string; stdin: string }[];
+  /** Each run; `timeoutMs` only when the caller gave one. */
+  calls: { code: string; stdin: string; timeoutMs?: number }[];
   retry: Mock<() => void>;
 }
 
@@ -34,13 +35,13 @@ export function fakeRunner(
   impl: (code: string, stdin: string) => RunResult | Promise<RunResult>,
   status: RunnerStatus = "ready",
 ): FakeRunner {
-  const calls: { code: string; stdin: string }[] = [];
+  const calls: FakeRunner["calls"] = [];
   return {
     status,
     calls,
     retry: vi.fn(),
-    run: async (code, stdin) => {
-      calls.push({ code, stdin });
+    run: async (code, stdin, timeoutMs) => {
+      calls.push(timeoutMs === undefined ? { code, stdin } : { code, stdin, timeoutMs });
       return impl(code, stdin);
     },
   };
diff --git a/src/ui/EvolutionTestScreen.tsx b/src/ui/EvolutionTestScreen.tsx
index d54de09..262f704 100644
--- a/src/ui/EvolutionTestScreen.tsx
+++ b/src/ui/EvolutionTestScreen.tsx
@@ -80,7 +80,7 @@ function EvolutionAttempt({
     );
   }
   if (grade) {
-    return isPass(grade.score, grade.max) ? (
+    return isPass(grade.score, grade.max, game.state.settings.passPercent) ? (
       <EvolutionPassed before={before} after={game.state} grade={grade} onExit={onExit} />
     ) : (
       <EvolutionFailed after={game.state} grade={grade} stageId={stage.id} onRetake={onRetake} onExit={onExit} />
@@ -92,7 +92,7 @@ function EvolutionAttempt({
       items={items}
       onFinish={(answers) => {
         const result = gradePaper(items, answers);
-        const remedial = isPass(result.score, result.max)
+        const remedial = isPass(result.score, result.max, game.state.settings.passPercent)
           ? []
           : buildRemedialSet(bundle, game.state, result.wrongConcepts, rng);
         game.dispatch({
diff --git a/src/ui/GameProvider.tsx b/src/ui/GameProvider.tsx
index c675caa..676c682 100644
--- a/src/ui/GameProvider.tsx
+++ b/src/ui/GameProvider.tsx
@@ -24,7 +24,7 @@ import {
   type LoadedGame,
   type StoredProfile,
 } from "../storage/types";
-import { ErrorLogContext, type LogError } from "./contexts";
+import { ErrorLogContext, RunnerTimeout, type LogError } from "./contexts";
 
 export const BACKUP_REMINDER_DAYS = 7;
 export const DRAFT_SAVE_DELAY_MS = 400;
@@ -68,7 +68,7 @@ export interface GameProviderProps {
 }
 
 export function GameProvider({ store, loaded, clock, onReplaced, children }: GameProviderProps) {
-  const { uiLang, setUiLang } = useLang();
+  const { uiLang, setUiLang, setQuestionLang } = useLang();
   const profile = loaded.profile;
   const [state, setState] = useState<GameState>(loaded.state);
   const stateRef = useRef<GameState>(loaded.state);
@@ -150,6 +150,10 @@ export function GameProvider({ store, loaded, clock, onReplaced, children }: Gam
     if (uiLang !== saved) dispatch({ type: "SettingsChanged", patch: { uiLang } });
   }, [uiLang, setUiLang, dispatch]);
 
+  // The parent's default question language (spec 7.2); each question can still switch with VI/EN.
+  const questionLang = state.settings.questionLang;
+  useEffect(() => setQuestionLang(questionLang), [questionLang, setQuestionLang]);
+
   const draftFor = useCallback((itemId: string) => drafts.current.get(itemId), []);
 
   const saveDraft = useCallback(
@@ -277,7 +281,9 @@ export function GameProvider({ store, loaded, clock, onReplaced, children }: Gam
 
   return (
     <GameContext.Provider value={api}>
-      <ErrorLogContext.Provider value={logError}>{children}</ErrorLogContext.Provider>
+      <ErrorLogContext.Provider value={logError}>
+        <RunnerTimeout seconds={state.settings.runSeconds}>{children}</RunnerTimeout>
+      </ErrorLogContext.Provider>
     </GameContext.Provider>
   );
 }
diff --git a/src/ui/TopicTestScreen.tsx b/src/ui/TopicTestScreen.tsx
index e5e73f3..627605d 100644
--- a/src/ui/TopicTestScreen.tsx
+++ b/src/ui/TopicTestScreen.tsx
@@ -18,7 +18,8 @@ export function TopicTestScreen({ topic, onExit, rng = Math.random }: { topic: T
   const [grade, setGrade] = useState<ExamGrade | null>(null);
 
   if (grade) {
-    const verdict = t(isPass(grade.score, grade.max) ? "exam.passed" : "exam.notPassed");
+    const percent = game.state.settings.passPercent;
+    const verdict = isPass(grade.score, grade.max, percent) ? t("exam.passed") : t("exam.notPassed", { percent });
     return (
       <ResultView
         before={before}
diff --git a/src/ui/contexts.tsx b/src/ui/contexts.tsx
index fad74f3..8aabd68 100644
--- a/src/ui/contexts.tsx
+++ b/src/ui/contexts.tsx
@@ -40,6 +40,16 @@ export function AppProviders({
   );
 }
 
+/** Runs code with the parent's time limit (spec 9.5) unless a caller gives its own. */
+export function RunnerTimeout({ seconds, children }: { seconds: number; children: ReactNode }) {
+  const runner = useRunner();
+  const value = useMemo<RunnerApi>(
+    () => ({ ...runner, run: (code, stdin, timeoutMs) => runner.run(code, stdin, timeoutMs ?? seconds * 1000) }),
+    [runner, seconds],
+  );
+  return <RunnerContext.Provider value={value}>{children}</RunnerContext.Provider>;
+}
+
 function required<T>(value: T | null, name: string): T {
   if (value === null) throw new Error(`${name} must be used inside <AppProviders>`);
   return value;
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/settings.ts src/game/settings.test.ts src/game/apply.ts src/game/mastery.ts src/game/rewards.ts src/i18n/vi.ts src/i18n/en.ts src/test/render.tsx src/ui/contexts.tsx src/ui/GameProvider.tsx src/ui/GameProvider.test.tsx src/ui/TopicTestScreen.tsx src/ui/EvolutionTestScreen.tsx
git commit -m "feat(game): the parent's pass mark, help threshold, run time and question language take effect

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Đặt lại PIN, tra lượt làm bài, xóa dữ liệu, kiểm tra file nhập

**Files:**
- Modify: `src/storage/types.ts`, `src/storage/backup.ts`, `src/storage/dexieStore.ts`, `src/storage/memoryStore.ts`, `src/ui/GameProvider.tsx`
- Test: `src/storage/backup.test.ts`, `src/storage/store.test.ts`, `src/ui/GameProvider.test.tsx`

**Interfaces:**
- Consumes: `hashPin`, `verifyPin`; `GameStore.replaceAll`; bảng `attempts` có chỉ mục `[profileId+itemId]`.
- Produces:
  - `ErrorLogEntry.kind` thêm `"load-failed"`; `AppMeta.pinResetAt: string | null` (`emptyMeta()` cho `null`).
  - `GameStore.attemptsFor(profileId, itemIds): Promise<AttemptRecord[]>` (cũ trước; Dexie và Memory).
  - `decodeBackup` từ chối file không có hồ sơ hoặc `meta` sai dạng; hồ sơ đang dùng không có trong file thì lấy hồ sơ đầu tiên; `meta.pinResetAt` thiếu thì là `null`.
  - `GameApi` thêm `pinResetAt`, `errorLog`, `setPin(pin, reset)`, `attemptsFor(itemIds)`, `eraseAll()`. Nhập file không có PIN giữ PIN của máy.

- [ ] **Step 1: Viết test thất bại**

```diff
diff --git a/src/storage/backup.test.ts b/src/storage/backup.test.ts
index 6d70ff2..3b93b0f 100644
--- a/src/storage/backup.test.ts
+++ b/src/storage/backup.test.ts
@@ -160,4 +160,20 @@ describe("backup file", () => {
     newerState.profiles[0]!.state.version = GAME_STATE_VERSION + 1;
     expect(await decodeBackup(await encodeBackup(newerState))).toEqual({ ok: false, reason: "damaged" });
   });
+
+  test("checks the shared data: a file without profiles or with a broken PIN is damaged", async () => {
+    const empty = { ...sampleBackupPayload(), profiles: [] };
+    expect(await decodeBackup(await encodeBackup(empty))).toEqual({ ok: false, reason: "damaged" });
+    const badPin = sampleBackupPayload();
+    (badPin.meta as unknown as { pin: unknown }).pin = { salt: "", hash: "x", iterations: 1 };
+    expect(await decodeBackup(await encodeBackup(badPin))).toEqual({ ok: false, reason: "damaged" });
+  });
+
+  test("an active profile that is not in the file becomes its first profile", async () => {
+    const payload = sampleBackupPayload();
+    payload.meta.activeProfileId = "someone-else";
+    const result = await decodeBackup(await encodeBackup(payload));
+    expect(result.ok && result.payload.meta.activeProfileId).toBe(payload.profiles[0]!.profile.id);
+    expect(result.ok && result.payload.meta.pinResetAt).toBeNull();
+  });
 });
diff --git a/src/storage/store.test.ts b/src/storage/store.test.ts
index a84cb7d..aee97b3 100644
--- a/src/storage/store.test.ts
+++ b/src/storage/store.test.ts
@@ -62,6 +62,24 @@ describe.each(stores)("%s", (_name, makeStore) => {
     expect(bundle!.attempts.filter((a) => a.itemId === "ex2")).toHaveLength(1);
   });
 
+  test("attemptsFor returns the attempts of the given items, oldest first", async () => {
+    const store = await makeStore();
+    await store.createProfile(profile, initialGameState("2026-10-06"));
+    const state = initialGameState("2026-10-06");
+    await store.saveState("p1", state, codeAttempt("ex1", 1));
+    await store.saveState("p1", state, codeAttempt("ex2", 2));
+    await store.saveState("p1", state, codeAttempt("ex3", 3));
+    await store.saveState("p1", state, codeAttempt("ex1", 4));
+    const found = await store.attemptsFor("p1", ["ex1", "ex3"]);
+    expect(found.map((a) => [a.itemId, a.at.slice(-7, -5)])).toEqual([
+      ["ex1", "01"],
+      ["ex3", "03"],
+      ["ex1", "04"],
+    ]);
+    expect(await store.attemptsFor("p1", [])).toEqual([]);
+    expect(await store.attemptsFor("p2", ["ex1"])).toEqual([]);
+  });
+
   test("drafts are saved per item and loaded with the profile", async () => {
     const store = await makeStore();
     await store.createProfile(profile, initialGameState("2026-10-06"));
diff --git a/src/ui/GameProvider.test.tsx b/src/ui/GameProvider.test.tsx
index f27d165..164081f 100644
--- a/src/ui/GameProvider.test.tsx
+++ b/src/ui/GameProvider.test.tsx
@@ -403,3 +403,43 @@ describe("the parent's settings in the app", () => {
     expect(runner.calls.at(-1)).toMatchObject({ code: "x", timeoutMs: 5000 });
   });
 });
+
+describe("PIN, attempts and erasing", () => {
+  function Api({ onApi }: { onApi(api: ReturnType<typeof useGame>): void }) {
+    onApi(useGame());
+    return null;
+  }
+
+  test("a reset PIN replaces the old one and records when", async () => {
+    let api!: ReturnType<typeof useGame>;
+    const { store } = await renderWithGame(<Api onApi={(a) => (api = a)} />, { meta: { pin: await hashPin("1111") } });
+    await act(() => api.setPin("2222", true));
+    expect(await api.checkPin("2222")).toBe(true);
+    expect(await api.checkPin("1111")).toBe(false);
+    expect(api.pinResetAt).toBe(FIXED_NOW.toISOString());
+    expect((await store.readMeta()).pinResetAt).toBe(FIXED_NOW.toISOString());
+    await act(() => api.setPin("3333", false));
+    expect(api.pinResetAt).toBe(FIXED_NOW.toISOString());
+  });
+
+  test("importing a file without a PIN keeps this device's PIN", async () => {
+    let api!: ReturnType<typeof useGame>;
+    const pin = await hashPin("1111");
+    const { store } = await renderWithGame(<Api onApi={(a) => (api = a)} />, { meta: { pin } });
+    const payload = sampleBackupPayload();
+    payload.meta.pin = null;
+    await act(() => api.importBackup(payload));
+    expect((await store.readMeta()).pin).toEqual(pin);
+  });
+
+  test("eraseAll empties the store and asks the app to start again", async () => {
+    let api!: ReturnType<typeof useGame>;
+    const onReplaced = vi.fn();
+    const { store } = await renderWithGame(<Api onApi={(a) => (api = a)} />, { onReplaced });
+    await act(() => api.eraseAll());
+    expect(onReplaced).toHaveBeenCalledOnce();
+    expect(await store.loadActive()).toBeNull();
+    expect(await store.exportProfiles()).toEqual([]);
+  });
+});
+
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/storage src/ui/GameProvider.test.tsx`
Expected: FAIL: chưa có `attemptsFor`, `setPin`, `eraseAll`; file không có hồ sơ vẫn được nhận.

- [ ] **Step 3: Viết code**

```diff
diff --git a/src/storage/backup.ts b/src/storage/backup.ts
index 009d79b..8dc74d5 100644
--- a/src/storage/backup.ts
+++ b/src/storage/backup.ts
@@ -56,8 +56,20 @@ const profileBundleSchema = z.object({
   drafts: z.array(z.object({ profileId: z.string(), itemId: z.string(), code: z.string() })),
 });
 
-/** Checks every profile of a migrated payload and upgrades its state. Null when a profile is damaged. */
+const metaSchema = z.object({
+  pin: z.object({ salt: z.string().min(1), hash: z.string().min(1), iterations: z.number().int().positive() }).nullable(),
+  activeProfileId: z.string().nullable(),
+  lastBackupAt: z.string().nullable(),
+  errorLog: z.array(z.object({ at: z.string(), kind: z.string(), detail: z.string() })),
+});
+
+/**
+ * Checks every profile of a migrated payload and upgrades its state, and checks the shared data (PIN shape, active
+ * profile). Null when something is damaged or there is no profile. An active profile that is not in the file becomes
+ * its first profile.
+ */
 function checkProfiles(payload: BackupPayload): BackupPayload | null {
+  if (payload.profiles.length === 0 || !metaSchema.safeParse(payload.meta).success) return null;
   const profiles: BackupPayload["profiles"] = [];
   for (const bundle of payload.profiles as unknown[]) {
     if (!profileBundleSchema.safeParse(bundle).success) return null;
@@ -71,7 +83,10 @@ function checkProfiles(payload: BackupPayload): BackupPayload | null {
     }
     profiles.push({ ...checked, state });
   }
-  return { ...payload, profiles };
+  const ids = profiles.map((p) => p.profile.id);
+  const active = payload.meta.activeProfileId;
+  const activeProfileId = active !== null && ids.includes(active) ? active : (ids[0] as string);
+  return { ...payload, meta: { ...payload.meta, pinResetAt: payload.meta.pinResetAt ?? null, activeProfileId }, profiles };
 }
 
 /** The active profile as the app holds it in memory: newer than the store when a write failed. */
diff --git a/src/storage/dexieStore.ts b/src/storage/dexieStore.ts
index c470744..e1c39b0 100644
--- a/src/storage/dexieStore.ts
+++ b/src/storage/dexieStore.ts
@@ -137,4 +137,13 @@ export class DexieStore implements GameStore {
       await this.db.drafts.bulkPut(profiles.flatMap((p) => p.drafts));
     });
   }
+
+  async attemptsFor(profileId: string, itemIds: string[]): Promise<AttemptRecord[]> {
+    if (itemIds.length === 0) return [];
+    const rows = await this.db.attempts
+      .where("[profileId+itemId]")
+      .anyOf(itemIds.map((itemId) => [profileId, itemId]))
+      .toArray();
+    return rows.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
+  }
 }
diff --git a/src/storage/memoryStore.ts b/src/storage/memoryStore.ts
index 41b4f84..288968a 100644
--- a/src/storage/memoryStore.ts
+++ b/src/storage/memoryStore.ts
@@ -92,4 +92,9 @@ export class MemoryStore implements GameStore {
     this.drafts = new Map(profiles.flatMap((p) => p.drafts).map((d) => [draftKey(d.profileId, d.itemId), clone(d)]));
     this.nextAttemptId = Math.max(0, ...this.attempts.map((a) => a.id ?? 0)) + 1;
   }
+
+  async attemptsFor(profileId: string, itemIds: string[]): Promise<AttemptRecord[]> {
+    const wanted = new Set(itemIds);
+    return clone(this.attempts.filter((a) => a.profileId === profileId && wanted.has(a.itemId)));
+  }
 }
diff --git a/src/storage/types.ts b/src/storage/types.ts
index 16bf753..f79253d 100644
--- a/src/storage/types.ts
+++ b/src/storage/types.ts
@@ -56,7 +56,7 @@ export interface PinHash {
 
 export interface ErrorLogEntry {
   at: string;
-  kind: "unknown-python-error" | "ui-crash";
+  kind: "unknown-python-error" | "ui-crash" | "load-failed";
   detail: string;
 }
 
@@ -67,6 +67,8 @@ export interface AppMeta {
   lastBackupAt: string | null;
   errorLog: ErrorLogEntry[];
   autoBackups: string[];
+  /** When the PIN was last reset without the old one (spec 6.3: the parent area shows it), or null. */
+  pinResetAt: string | null;
 }
 
 export interface ProfileBundle {
@@ -94,10 +96,20 @@ export interface GameStore {
   saveDraft(profileId: string, itemId: string, code: string): Promise<void>;
   exportProfiles(): Promise<ProfileBundle[]>;
   replaceAll(meta: AppMeta, profiles: ProfileBundle[]): Promise<void>;
+  /** The saved attempts of these items for a profile, oldest first (spec 9.2: the evidence for a parent). */
+  attemptsFor(profileId: string, itemIds: string[]): Promise<AttemptRecord[]>;
 }
 
 export function emptyMeta(): AppMeta {
-  return { schemaVersion: SCHEMA_VERSION, activeProfileId: null, pin: null, lastBackupAt: null, errorLog: [], autoBackups: [] };
+  return {
+    schemaVersion: SCHEMA_VERSION,
+    activeProfileId: null,
+    pin: null,
+    lastBackupAt: null,
+    errorLog: [],
+    autoBackups: [],
+    pinResetAt: null,
+  };
 }
 
 export function appendErrorLog(log: ErrorLogEntry[], entry: ErrorLogEntry): ErrorLogEntry[] {
diff --git a/src/ui/GameProvider.tsx b/src/ui/GameProvider.tsx
index 676c682..87138c2 100644
--- a/src/ui/GameProvider.tsx
+++ b/src/ui/GameProvider.tsx
@@ -11,7 +11,7 @@ import {
   type ActiveSnapshot,
   type BackupPayload,
 } from "../storage/backup";
-import { verifyPin } from "../storage/pin";
+import { hashPin, verifyPin } from "../storage/pin";
 import {
   appendErrorLog,
   AUTO_BACKUPS,
@@ -45,6 +45,15 @@ export interface GameApi {
   importBackup(payload: BackupPayload): Promise<void>;
   /** The encoded automatic backups, newest first. */
   autoBackups(): Promise<string[]>;
+  /** When the PIN was last reset without the old one (spec 6.3), or null. */
+  pinResetAt: string | null;
+  errorLog: ErrorLogEntry[];
+  /** Sets a new PIN; `reset` marks that the old one was not given (spec 6.3). */
+  setPin(pin: string, reset: boolean): Promise<void>;
+  /** The saved attempts of these items for this profile, oldest first. */
+  attemptsFor(itemIds: string[]): Promise<AttemptRecord[]>;
+  /** Deletes every profile and setting on this device; the app starts again (spec 9.5). */
+  eraseAll(): Promise<void>;
 }
 
 const GameContext = createContext<GameApi | null>(null);
@@ -239,7 +248,9 @@ export function GameProvider({ store, loaded, clock, onReplaced, children }: Gam
         const existing = await store.readMeta();
         const autoBackups = [current, ...existing.autoBackups].slice(0, AUTO_BACKUPS);
         const activeProfileId = payload.meta.activeProfileId ?? payload.profiles[0]?.profile.id ?? null;
-        await store.replaceAll({ ...emptyMeta(), ...payload.meta, activeProfileId, autoBackups }, payload.profiles);
+        // A file without a PIN keeps this device's PIN, so importing never leaves the parent area open.
+        const pin = payload.meta.pin ?? existing.pin;
+        await store.replaceAll({ ...emptyMeta(), ...payload.meta, pin, activeProfileId, autoBackups }, payload.profiles);
       });
       queue.current = run.catch(() => {});
       try {
@@ -255,6 +266,33 @@ export function GameProvider({ store, loaded, clock, onReplaced, children }: Gam
 
   const autoBackups = useCallback(async () => (await store.readMeta()).autoBackups, [store]);
 
+  const setPin = useCallback(
+    async (pin: string, reset: boolean) => {
+      const hash = await hashPin(pin);
+      const patch: Partial<AppMeta> = reset ? { pin: hash, pinResetAt: clock().toISOString() } : { pin: hash };
+      await store.writeMeta(patch);
+      setMeta((current) => ({ ...current, ...patch }));
+    },
+    [clock, store],
+  );
+
+  const attemptsFor = useCallback((itemIds: string[]) => store.attemptsFor(profile.id, itemIds), [store, profile.id]);
+
+  const eraseAll = useCallback(async () => {
+    replacing.current = true;
+    for (const timer of draftTimers.current.values()) clearTimeout(timer);
+    draftTimers.current.clear();
+    const run = queue.current.then(() => store.replaceAll(emptyMeta(), []));
+    queue.current = run.catch(() => {});
+    try {
+      await run;
+    } catch (error) {
+      replacing.current = false;
+      throw error;
+    }
+    onReplaced();
+  }, [store, onReplaced]);
+
   const today = localDay(clock());
   const reference = meta.lastBackupAt ?? profile.createdAt;
   const needsBackupReminder = daysBetween(localDay(new Date(reference)), today) >= BACKUP_REMINDER_DAYS;
@@ -275,8 +313,33 @@ export function GameProvider({ store, loaded, clock, onReplaced, children }: Gam
       checkPin,
       importBackup,
       autoBackups,
+      pinResetAt: meta.pinResetAt ?? null,
+      errorLog: meta.errorLog,
+      setPin,
+      attemptsFor,
+      eraseAll,
     }),
-    [profile, state, today, store.persistent, writeFailed, meta.lastBackupAt, needsBackupReminder, dispatch, draftFor, saveDraft, exportBackup, checkPin, importBackup, autoBackups],
+    [
+      profile,
+      state,
+      today,
+      store.persistent,
+      writeFailed,
+      meta.lastBackupAt,
+      meta.pinResetAt,
+      meta.errorLog,
+      needsBackupReminder,
+      dispatch,
+      draftFor,
+      saveDraft,
+      exportBackup,
+      checkPin,
+      importBackup,
+      autoBackups,
+      setPin,
+      attemptsFor,
+      eraseAll,
+    ],
   );
 
   return (
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage/types.ts src/storage/backup.ts src/storage/backup.test.ts src/storage/dexieStore.ts src/storage/memoryStore.ts src/storage/store.test.ts src/ui/GameProvider.tsx src/ui/GameProvider.test.tsx
git commit -m "feat(storage): PIN reset record, attempts lookup, erase all and stricter import checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Cửa PIN, đặt lại PIN, tự khóa và tab Tổng quan

**Files:**
- Create: `src/game/parentStats.ts`, `src/ui/format.ts`, `src/ui/ParentScreen.tsx`, `src/ui/ParentOverview.tsx`
- Modify: `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`, `src/ui/routing.ts`, `src/ui/AppRoutes.tsx`, `src/ui/RoomScreen.tsx`
- Test: `src/game/parentStats.test.ts`, `src/ui/ParentScreen.test.tsx`, `src/ui/routing.test.ts`, `src/ui/RoomScreen.test.tsx`

**Interfaces:**
- Consumes: `checkPin`, `setPin`, `pinResetAt` (Task 2); `isVacationDay`, `weekTarget`, `PRACTISING_FROM` (M4a); `MASTERY`.
- Produces:
  - `parentStats.ts`: `DayMinutes { day; minutes; vacation }`, `minutesByDay(state, today, days = 7)`, `averageXuPerDay(state, today, days = 14)` (chỉ tính xu kiếm được), `accuracyPercent(m)` (phần trăm hoặc `null`), `conceptsNeedingHelp(state)`, `conceptsPractising(state)` (điểm 40 đến 70, không bị cờ), cả hai xếp yếu trước.
  - `formatDateTime(iso)`: `YYYY-MM-DD HH:MM` theo giờ máy.
  - Route `{ name: "parent" }` ↔ `#/parent`; nút "Khu phụ huynh" trong Phòng robot.
  - `ParentScreen`: cửa PIN; "Quên mã PIN?" đặt PIN mới (4–6 chữ số, nhập 2 lần) và mở khu; `LOCK_AFTER_MS = 5 * 60_000` (kiểm tra mỗi 10 giây, mọi phím, chạm, cuộn tính là thao tác); nút "Khóa"; dòng "Mã PIN đã được đặt lại lúc …" khi `pinResetAt` có giá trị; 5 tab (ở task này chỉ tab Tổng quan có nội dung; Task 4–7 thêm các tab còn lại).
  - `ParentOverview`: cảnh báo (yêu cầu chờ duyệt, khái niệm cần hỗ trợ, đồng hồ bị chỉnh lùi), số phút học 7 ngày (ngày nghỉ màu xám), giai đoạn, kế hoạch tuần, chuỗi ngày, xu và xu trung bình/ngày.

- [ ] **Step 1: Viết test thất bại**

`src/game/parentStats.test.ts` (tạo file):

```ts
import { describe, expect, test } from "vitest";
import { emptyMastery } from "./mastery";
import { accuracyPercent, averageXuPerDay, conceptsNeedingHelp, conceptsPractising, minutesByDay } from "./parentStats";
import { initialGameState } from "./state";

describe("parent statistics", () => {
  test("minutes of the last 7 days, with the vacation days", () => {
    const state = initialGameState("2026-10-06");
    state.activity.seconds = { "2026-09-29": 600, "2026-09-30": 90, "2026-10-06": 1500 };
    state.vacation.ranges = [{ start: "2026-10-02", end: "2026-10-03" }];
    expect(minutesByDay(state, "2026-10-06")).toEqual([
      { day: "2026-09-30", minutes: 2, vacation: false },
      { day: "2026-10-01", minutes: 0, vacation: false },
      { day: "2026-10-02", minutes: 0, vacation: true },
      { day: "2026-10-03", minutes: 0, vacation: true },
      { day: "2026-10-04", minutes: 0, vacation: false },
      { day: "2026-10-05", minutes: 0, vacation: false },
      { day: "2026-10-06", minutes: 25, vacation: false },
    ]);
  });

  test("xu earned per day over 14 days; spending does not count", () => {
    const state = initialGameState("2026-10-14");
    state.wallet.history = [
      { day: "2026-09-30", delta: 500, reason: "streak", ref: "30" },
      { day: "2026-10-01", delta: 100, reason: "evolution", ref: "1" },
      { day: "2026-10-10", delta: 40, reason: "code", ref: "e" },
      { day: "2026-10-12", delta: -60, reason: "shop", ref: "tranh" },
    ];
    expect(averageXuPerDay(state, "2026-10-14")).toBe(10);
  });

  test("accuracy and the concept lists", () => {
    expect(accuracyPercent({ ...emptyMastery(), recent: [1, 0.6, 0.3, 0] })).toBe(50);
    expect(accuracyPercent(emptyMastery())).toBeNull();
    const state = initialGameState("2026-10-06");
    state.mastery = {
      b: { ...emptyMastery(), score: 30, needsHelp: true },
      a: { ...emptyMastery(), score: 30, needsHelp: true },
      c: { ...emptyMastery(), score: 55 },
      d: { ...emptyMastery(), score: 45, needsHelp: true },
      e: { ...emptyMastery(), score: 80 },
    };
    expect(conceptsNeedingHelp(state).map(([id]) => id)).toEqual(["a", "b", "d"]);
    expect(conceptsPractising(state).map(([id]) => id)).toEqual(["c"]);
  });
});
```

`src/ui/ParentScreen.test.tsx` (tạo file):

```tsx
// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { hashPin } from "../storage/pin";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { LOCK_AFTER_MS, ParentScreen } from "./ParentScreen";

afterEach(() => {
  vi.useRealTimers();
});

async function openWith(pin: string) {
  await userEvent.type(screen.getByLabelText("Mã PIN"), pin);
  await userEvent.click(screen.getByRole("button", { name: "Mở" }));
}

describe("ParentScreen gate", () => {
  test("a wrong PIN keeps it locked; the right one opens it", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("9999");
    expect(await screen.findByRole("alert")).toHaveTextContent("Mã PIN chưa đúng.");
    await userEvent.clear(screen.getByLabelText("Mã PIN"));
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Khóa" }));
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
  });

  test("a forgotten PIN is reset, and the area then shows when", async () => {
    const { store } = await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await userEvent.click(screen.getByRole("button", { name: "Quên mã PIN?" }));
    await userEvent.type(screen.getByLabelText("Mã PIN mới (4 đến 6 chữ số)"), "12");
    await userEvent.click(screen.getByRole("button", { name: "Đặt mã PIN mới" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Mã PIN phải gồm 4 đến 6 chữ số.");
    await userEvent.type(screen.getByLabelText("Mã PIN mới (4 đến 6 chữ số)"), "34");
    await userEvent.type(screen.getByLabelText("Nhập lại mã PIN mới"), "1234");
    await userEvent.click(screen.getByRole("button", { name: "Đặt mã PIN mới" }));
    expect(await screen.findByText(/^Mã PIN đã được đặt lại lúc 2026-10-06 09:00\.$/)).toBeInTheDocument();
    expect((await store.readMeta()).pinResetAt).toBe(FIXED_NOW.toISOString());
  });

  test("locks itself after 5 minutes without use", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(LOCK_AFTER_MS + 10_000);
    });
    expect(screen.getByText("Khu phụ huynh đã tự khóa sau 5 phút không dùng.")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
  });
});

describe("ParentOverview", () => {
  test("alerts, study minutes, stage, week plan, streak and xu", async () => {
    const state = initialGameState(TODAY);
    state.wallet.xu = 70;
    state.wallet.history = [{ day: TODAY, delta: 140, reason: "code", ref: "e" }];
    state.activity.seconds = { [TODAY]: 900 };
    state.vacation.ranges = [{ start: "2026-10-03", end: "2026-10-04" }];
    state.mastery = { k1: { ...emptyMastery(), needsHelp: true } };
    state.rewards.requests = [
      { id: "q", rewardId: "r", name: "Kem", price: 30, at: FIXED_NOW.toISOString(), status: "pending", decidedAt: null },
    ];
    state.warnings = [{ at: FIXED_NOW.toISOString(), kind: "clock-rollback" }];
    await renderWithGame(<ParentScreen />, { state, meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() } });
    await openWith("1234");
    expect(await screen.findByText("1 yêu cầu đổi thưởng chờ duyệt")).toBeInTheDocument();
    expect(screen.getByText("1 khái niệm con cần hỗ trợ")).toBeInTheDocument();
    expect(screen.getByText("Đồng hồ máy bị chỉnh lùi 1 lần")).toBeInTheDocument();
    expect(screen.getByText("2026-10-06: 15 phút")).toBeInTheDocument();
    expect(screen.getByText("2026-10-03: nghỉ")).toBeInTheDocument();
    expect(screen.getByText("Giai đoạn 1: Giai đoạn thử")).toBeInTheDocument();
    expect(screen.getByText("Xu: 70, trung bình 10 xu/ngày (14 ngày)")).toBeInTheDocument();
  });

  test("no alerts", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() } });
    await openWith("1234");
    expect(await screen.findByText("Không có cảnh báo.")).toBeInTheDocument();
  });
});
```

```diff
diff --git a/src/ui/RoomScreen.test.tsx b/src/ui/RoomScreen.test.tsx
index 08922c4..735df1c 100644
--- a/src/ui/RoomScreen.test.tsx
+++ b/src/ui/RoomScreen.test.tsx
@@ -131,6 +131,7 @@ describe("RoomScreen", () => {
     expect(screen.getByText("Trong phòng: Chậu cây, Bức tranh")).toBeInTheDocument();
     expect(screen.getByRole("link", { name: "Cửa hàng" })).toHaveAttribute("href", "#/shop");
     expect(screen.getByRole("link", { name: "Sổ thành tích" })).toHaveAttribute("href", "#/achievements");
+    expect(screen.getByRole("link", { name: "Khu phụ huynh" })).toHaveAttribute("href", "#/parent");
   });
 
   test("practice from the parents comes first", async () => {
diff --git a/src/ui/routing.test.ts b/src/ui/routing.test.ts
index 52931ff..c0f361c 100644
--- a/src/ui/routing.test.ts
+++ b/src/ui/routing.test.ts
@@ -71,7 +71,12 @@ describe("test routes", () => {
 
 describe("M4a routes", () => {
   test("parse and round-trip", () => {
-    for (const route of [{ name: "assigned", id: "p 1" }, { name: "shop" }, { name: "achievements" }] as const) {
+    for (const route of [
+      { name: "assigned", id: "p 1" },
+      { name: "shop" },
+      { name: "achievements" },
+      { name: "parent" },
+    ] as const) {
       expect(parseHash(routeToHash(route))).toEqual(route);
     }
     expect(routeToHash({ name: "assigned", id: "p1" })).toBe("#/assigned/p1");
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/parentStats.test.ts src/ui/ParentScreen.test.tsx src/ui/routing.test.ts src/ui/RoomScreen.test.tsx`
Expected: FAIL: chưa có `./parentStats`, `./ParentScreen`, route `parent`.

- [ ] **Step 3: Viết code**

`src/game/parentStats.ts` (tạo file):

```ts
import { addDays } from "./dates";
import { MASTERY } from "./mastery";
import { PRACTISING_FROM } from "./badges";
import type { ConceptMastery, GameState } from "./state";
import { isVacationDay } from "./vacation";

export interface DayMinutes {
  day: string;
  minutes: number;
  vacation: boolean;
}

/** Spec 9.1: minutes of study for the last `days` days, oldest first, with the vacation days marked. */
export function minutesByDay(state: GameState, today: string, days = 7): DayMinutes[] {
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return {
      day,
      minutes: Math.round((state.activity.seconds[day] ?? 0) / 60),
      vacation: isVacationDay(state, day),
    };
  });
}

/** Spec 5.5: xu earned per day over the last `days` days, for the parent to price rewards. Spending is left out. */
export function averageXuPerDay(state: GameState, today: string, days = 14): number {
  const from = addDays(today, -days + 1);
  const earned = state.wallet.history
    .filter((entry) => entry.delta > 0 && entry.day >= from && entry.day <= today)
    .reduce((sum, entry) => sum + entry.delta, 0);
  return Math.round(earned / days);
}

/** The share of right results among the latest ones, in percent, or null without results. */
export function accuracyPercent(m: ConceptMastery): number | null {
  if (m.recent.length === 0) return null;
  const right = m.recent.filter((s) => s >= MASTERY.rightFrom).length;
  return Math.round((right / m.recent.length) * 100);
}

/** Spec 9.2: concepts flagged "needs help", weakest first. */
export function conceptsNeedingHelp(state: GameState): [string, ConceptMastery][] {
  return Object.entries(state.mastery)
    .filter(([, m]) => m.needsHelp)
    .sort((a, b) => a[1].score - b[1].score || a[0].localeCompare(b[0]));
}

/** Spec 9.2: concepts being practised (score 40 to 70) and not flagged, weakest first. */
export function conceptsPractising(state: GameState): [string, ConceptMastery][] {
  return Object.entries(state.mastery)
    .filter(([, m]) => !m.needsHelp && m.score >= PRACTISING_FROM && m.score <= MASTERY.clearHelpAbove)
    .sort((a, b) => a[1].score - b[1].score || a[0].localeCompare(b[0]));
}
```

`src/ui/format.ts` (tạo file):

```ts
import { localDay } from "../game/dates";

/** A moment as "YYYY-MM-DD HH:MM" in local time, the same in every language. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${localDay(date)} ${hours}:${minutes}`;
}
```

`src/ui/ParentScreen.tsx` (tạo file):

```tsx
import { useEffect, useState, type FormEvent } from "react";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { isValidPin } from "../storage/pin";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";
import { ParentOverview } from "./ParentOverview";

/** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
export const LOCK_AFTER_MS = 5 * 60_000;
const LOCK_CHECK_MS = 10_000;

type Tab = "overview";

const TABS: { id: Tab; label: MessageKey }[] = [{ id: "overview", label: "parent.tabOverview" }];

export function ParentScreen() {
  const [open, setOpen] = useState(false);
  const [autoLocked, setAutoLocked] = useState(false);
  if (!open) {
    return (
      <ParentGate
        autoLocked={autoLocked}
        onOpen={() => {
          setOpen(true);
          setAutoLocked(false);
        }}
      />
    );
  }
  return (
    <ParentArea
      onLock={(auto) => {
        setOpen(false);
        setAutoLocked(auto);
      }}
    />
  );
}

function ParentGate({ autoLocked, onOpen }: { autoLocked: boolean; onOpen(): void }) {
  const { t } = useLang();
  const game = useGame();
  const [mode, setMode] = useState<"pin" | "reset">("pin");
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function check(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const ok = await game.checkPin(pin);
    setBusy(false);
    if (ok) onOpen();
    else setError("backup.pinWrong");
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (!isValidPin(pin)) return setError("onboarding.errorPin");
    if (pin !== again) return setError("onboarding.errorPinMatch");
    setBusy(true);
    await game.setPin(pin, true);
    setBusy(false);
    onOpen();
  }

  return (
    <main className="parent-gate">
      <h1>{t("parent.title")}</h1>
      {autoLocked && <p>{t("parent.autoLocked")}</p>}
      {mode === "pin" ? (
        <form onSubmit={check}>
          <p>{t("parent.pinPrompt")}</p>
          <label>
            {t("backup.pinLabel")}
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </label>
          <button className="primary" type="submit" disabled={busy || pin === ""}>
            {t("parent.open")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setPin("");
              setError(null);
            }}
          >
            {t("parent.forgot")}
          </button>
        </form>
      ) : (
        <form onSubmit={reset}>
          <h2>{t("parent.resetTitle")}</h2>
          <p>{t("parent.resetNote")}</p>
          <label>
            {t("parent.newPin")}
            <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </label>
          <label>
            {t("parent.newPinAgain")}
            <input type="password" inputMode="numeric" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
          </label>
          <button className="primary" type="submit" disabled={busy}>
            {t("parent.resetSave")}
          </button>
        </form>
      )}
      {error && <p role="alert">{t(error)}</p>}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}

function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
  const { t } = useLang();
  const game = useGame();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    let last = Date.now();
    const onInput = () => {
      last = Date.now();
    };
    const events = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
    for (const name of events) window.addEventListener(name, onInput, { passive: true });
    const timer = setInterval(() => {
      if (Date.now() - last >= LOCK_AFTER_MS) onLock(true);
    }, LOCK_CHECK_MS);
    return () => {
      clearInterval(timer);
      for (const name of events) window.removeEventListener(name, onInput);
    };
  }, [onLock]);

  return (
    <main className="parent">
      <div className="parent-top">
        <h1>{t("parent.title")}</h1>
        <button onClick={() => onLock(false)}>{t("parent.lock")}</button>
      </div>
      {game.pinResetAt && (
        <p role="alert" className="banner">
          {t("parent.resetAt", { time: formatDateTime(game.pinResetAt) })}
        </p>
      )}
      <div role="tablist" className="tabs">
        {TABS.map((item) => (
          <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>
            {t(item.label)}
          </button>
        ))}
      </div>
      {tab === "overview" && <ParentOverview />}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
```

`src/ui/ParentOverview.tsx` (tạo file):

```tsx
import { pick } from "../i18n/lang";
import { weekStart } from "../game/dates";
import { averageXuPerDay, conceptsNeedingHelp, minutesByDay } from "../game/parentStats";
import { currentStage, displayStreak, weekLessons } from "../game/progress";
import { weekTarget } from "../game/vacation";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";

/** Spec 9.1: alerts, 7 days of study minutes (vacation days grey), stage, week plan, streak, xu. */
export function ParentOverview() {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const { state, today } = game;
  const pending = state.rewards.requests.filter((r) => r.status === "pending").length;
  const help = conceptsNeedingHelp(state).length;
  const alerts: string[] = [];
  if (pending > 0) alerts.push(t("overview.pendingRewards", { n: pending }));
  if (help > 0) alerts.push(t("overview.needsHelp", { n: help }));
  if (game.needsBackupReminder) alerts.push(t("banner.backupReminder"));
  if (state.warnings.length > 0) alerts.push(t("overview.clock", { n: state.warnings.length }));
  const days = minutesByDay(state, today);
  const most = Math.max(30, ...days.map((d) => d.minutes));
  const stage = currentStage(bundle, state);
  return (
    <section className="parent-overview">
      <h2>{t("overview.alerts")}</h2>
      {alerts.length === 0 ? (
        <p>{t("overview.noAlerts")}</p>
      ) : (
        <ul className="alerts">
          {alerts.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <h2>{t("overview.minutesTitle")}</h2>
      <ul className="minutes-chart">
        {days.map((d) => (
          <li key={d.day} className={d.vacation ? "minutes-day minutes-vacation" : "minutes-day"}>
            <span className="minutes-bar" style={{ width: `${(d.minutes / most) * 100}%` }} aria-hidden="true" />
            <span>{d.vacation ? t("overview.vacationDay", { day: d.day }) : t("overview.minutes", { day: d.day, n: d.minutes })}</span>
          </li>
        ))}
      </ul>
      {stage && <p>{t("overview.stage", { n: state.pet.stage, title: pick(stage.title, uiLang) })}</p>}
      <p>{t("room.week", { done: weekLessons(state, today), target: weekTarget(state, weekStart(today)) })}</p>
      <p>{t("room.streak", { days: displayStreak(state, today) })}</p>
      <p>{t("overview.xu", { xu: state.wallet.xu, avg: averageXuPerDay(state, today) })}</p>
    </section>
  );
}
```

Các file còn lại:

```diff
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index 674f61c..ca038a7 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -268,4 +268,32 @@ export const en: Record<MessageKey, string> = {
   "shop.vuiFull": "Joy is full",
   "shop.noneLeft": "None left",
   "rewards.freeXu": "Coins not reserved: {xu}",
+  "room.parent": "Parent area",
+  "parent.title": "Parent area",
+  "parent.pinPrompt": "Enter the PIN to open the parent area.",
+  "parent.open": "Open",
+  "parent.forgot": "Forgot the PIN?",
+  "parent.resetTitle": "Reset the PIN",
+  "parent.resetNote": "The reset is recorded and always shown in the parent area.",
+  "parent.newPin": "New PIN (4 to 6 digits)",
+  "parent.newPinAgain": "Enter the new PIN again",
+  "parent.resetSave": "Set the new PIN",
+  "parent.resetAt": "The PIN was reset at {time}.",
+  "parent.lock": "Lock",
+  "parent.autoLocked": "The parent area locked itself after 5 minutes without use.",
+  "parent.tabOverview": "Overview",
+  "parent.tabHelp": "Needs help",
+  "parent.tabProgress": "Progress",
+  "parent.tabRewards": "Rewards",
+  "parent.tabSettings": "Settings",
+  "overview.alerts": "Alerts",
+  "overview.noAlerts": "No alerts.",
+  "overview.pendingRewards": "{n} reward requests waiting",
+  "overview.needsHelp": "{n} concepts where your child needs help",
+  "overview.clock": "The device clock was set back {n} times",
+  "overview.minutesTitle": "Minutes of study, last 7 days",
+  "overview.minutes": "{day}: {n} min",
+  "overview.vacationDay": "{day}: vacation",
+  "overview.stage": "Stage {n}: {title}",
+  "overview.xu": "Coins: {xu}, on average {avg} a day (14 days)",
 };
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index 216b396..c48f993 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -266,6 +266,34 @@ export const vi = {
   "shop.vuiFull": "Vui đã đầy",
   "shop.noneLeft": "Chưa có món này",
   "rewards.freeXu": "Xu chưa bị giữ: {xu}",
+  "room.parent": "Khu phụ huynh",
+  "parent.title": "Khu phụ huynh",
+  "parent.pinPrompt": "Bố mẹ nhập mã PIN để vào khu phụ huynh.",
+  "parent.open": "Mở",
+  "parent.forgot": "Quên mã PIN?",
+  "parent.resetTitle": "Đặt lại mã PIN",
+  "parent.resetNote": "Việc đặt lại được ghi lại và luôn hiện trong khu phụ huynh.",
+  "parent.newPin": "Mã PIN mới (4 đến 6 chữ số)",
+  "parent.newPinAgain": "Nhập lại mã PIN mới",
+  "parent.resetSave": "Đặt mã PIN mới",
+  "parent.resetAt": "Mã PIN đã được đặt lại lúc {time}.",
+  "parent.lock": "Khóa",
+  "parent.autoLocked": "Khu phụ huynh đã tự khóa sau 5 phút không dùng.",
+  "parent.tabOverview": "Tổng quan",
+  "parent.tabHelp": "Con cần hỗ trợ",
+  "parent.tabProgress": "Tiến độ",
+  "parent.tabRewards": "Phần thưởng",
+  "parent.tabSettings": "Cài đặt",
+  "overview.alerts": "Cảnh báo",
+  "overview.noAlerts": "Không có cảnh báo.",
+  "overview.pendingRewards": "{n} yêu cầu đổi thưởng chờ duyệt",
+  "overview.needsHelp": "{n} khái niệm con cần hỗ trợ",
+  "overview.clock": "Đồng hồ máy bị chỉnh lùi {n} lần",
+  "overview.minutesTitle": "Số phút học 7 ngày qua",
+  "overview.minutes": "{day}: {n} phút",
+  "overview.vacationDay": "{day}: nghỉ",
+  "overview.stage": "Giai đoạn {n}: {title}",
+  "overview.xu": "Xu: {xu}, trung bình {avg} xu/ngày (14 ngày)",
 } as const;
 
 export type MessageKey = keyof typeof vi;
diff --git a/src/styles.css b/src/styles.css
index eef2197..122acb7 100644
--- a/src/styles.css
+++ b/src/styles.css
@@ -166,3 +166,13 @@ a.button.primary { background: var(--primary); border-color: var(--primary); col
 .badge-locked { color: var(--muted); }
 .form-locked { color: var(--muted); }
 .condition-vacation { background: #e6f6ff; }
+
+/* M4b: parent area */
+.parent-top { display: flex; justify-content: space-between; align-items: center; }
+.parent-gate form { display: grid; gap: 8px; max-width: 360px; }
+.alerts { color: #8a4b00; }
+.minutes-chart { list-style: none; padding: 0; display: grid; gap: 4px; max-width: 480px; }
+.minutes-day { position: relative; padding: 2px 8px; }
+.minutes-bar { position: absolute; inset: 0 auto 0 0; background: #d8e3ff; border-radius: 4px; z-index: -1; }
+.minutes-vacation { color: var(--muted); }
+.minutes-vacation .minutes-bar { background: #e5e5e5; }
diff --git a/src/ui/AppRoutes.tsx b/src/ui/AppRoutes.tsx
index 71ed0bd..6769603 100644
--- a/src/ui/AppRoutes.tsx
+++ b/src/ui/AppRoutes.tsx
@@ -14,6 +14,7 @@ import { useGame } from "./GameProvider";
 import { Header } from "./Header";
 import { LessonScreen } from "./LessonScreen";
 import { MapScreen } from "./MapScreen";
+import { ParentScreen } from "./ParentScreen";
 import { PracticeScreen } from "./PracticeScreen";
 import { RemedialScreen } from "./RemedialScreen";
 import { ReviewScreen } from "./ReviewScreen";
@@ -49,6 +50,8 @@ export function AppRoutes() {
     screen = <ShopScreen />;
   } else if (route.name === "achievements") {
     screen = <AchievementsScreen />;
+  } else if (route.name === "parent") {
+    screen = <ParentScreen />;
   } else if (route.name === "assigned") {
     screen = <AssignedPracticeScreen key={route.id} id={route.id} onExit={goHome} />;
   } else if (route.name === "backup") {
diff --git a/src/ui/RoomScreen.tsx b/src/ui/RoomScreen.tsx
index 0d67f43..154c387 100644
--- a/src/ui/RoomScreen.tsx
+++ b/src/ui/RoomScreen.tsx
@@ -113,6 +113,9 @@ export function RoomScreen() {
         <a className="button" href={routeToHash({ name: "achievements" })}>
           {t("room.achievements")}
         </a>
+        <a className="button" href={routeToHash({ name: "parent" })}>
+          {t("room.parent")}
+        </a>
         <a className="button" href="#/backup">
           {t("room.backup")}
         </a>
diff --git a/src/ui/routing.ts b/src/ui/routing.ts
index a660a4b..e1be412 100644
--- a/src/ui/routing.ts
+++ b/src/ui/routing.ts
@@ -15,7 +15,9 @@ export type Route =
   /** Practice a parent gave (spec 9.2). */
   | { name: "assigned"; id: string }
   | { name: "shop" }
-  | { name: "achievements" };
+  | { name: "achievements" }
+  /** Spec 9: behind the PIN. */
+  | { name: "parent" };
 
 function decode(raw: string): string {
   try {
@@ -32,6 +34,7 @@ export function parseHash(hash: string): Route {
   if (hash === "#/remedial") return { name: "remedial" };
   if (hash === "#/shop") return { name: "shop" };
   if (hash === "#/achievements") return { name: "achievements" };
+  if (hash === "#/parent") return { name: "parent" };
   const match = /^#\/(lesson|review|practice|topic-test|evolution|assigned)\/(.+)$/.exec(hash);
   if (!match) return { name: "home" };
   const id = decode(match[2] as string);
@@ -71,6 +74,8 @@ export function routeToHash(route: Route): string {
       return "#/shop";
     case "achievements":
       return "#/achievements";
+    case "parent":
+      return "#/parent";
     case "map":
       return "#/map";
     case "backup":
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/parentStats.ts src/game/parentStats.test.ts src/ui/format.ts src/ui/ParentScreen.tsx src/ui/ParentScreen.test.tsx src/ui/ParentOverview.tsx src/i18n/vi.ts src/i18n/en.ts src/styles.css src/ui/routing.ts src/ui/routing.test.ts src/ui/AppRoutes.tsx src/ui/RoomScreen.tsx src/ui/RoomScreen.test.tsx
git commit -m "feat(ui): the parent area behind the PIN, PIN reset, auto-lock and the overview

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Tab Con cần hỗ trợ

**Files:**
- Create: `src/ui/ParentHelp.tsx`
- Modify: `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`, `src/ui/ParentScreen.tsx`
- Test: `src/ui/ParentHelp.test.tsx`

**Interfaces:**
- Consumes: `conceptsNeedingHelp`, `conceptsPractising`, `accuracyPercent`, `formatDateTime` (Task 3); `GameApi.attemptsFor` (Task 2); `buildPracticeSet` (M3a); sự kiện `PracticeAssigned`, `SupportGiven` (M4a); `Concept.parentTip`.
- Produces:
  - `EVIDENCE_COUNT = 3`.
  - `ParentHelp({ newId?, rng? })`: mỗi khái niệm cần hỗ trợ có điểm thành thạo, tỉ lệ đúng, số lần mắc lỗi hiểu sai, bậc thang, ngày kèm gần nhất; 3 lượt làm gần nhất của các bài thuộc khái niệm (code của con và số test qua, hoặc đáp án con chọn, đúng hay sai); gợi ý kèm con; "Giao thêm bài luyện" (tắt khi không có bài phù hợp hoặc vừa giao); "Đã kèm con"; sau đó danh sách khái niệm đang luyện.
  - `ParentScreen` hiện `ParentHelp` ở tab "Con cần hỗ trợ".

- [ ] **Step 1: Viết test thất bại**

`src/ui/ParentHelp.test.tsx` (tạo file):

```tsx
// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { MemoryStore } from "../storage/memoryStore";
import { renderWithGame, testProfile, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { ParentHelp } from "./ParentHelp";

const bundle = reviewBundle();
bundle.stages[0]!.topics[0]!.concepts[0]!.parentTip = "Cùng con đọc to từng dòng code.";

function helpState() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["r.l1", "r.l2"];
  state.mastery = {
    c1: { ...emptyMastery(), score: 32.4, needsHelp: true, misconceptions: 3, recent: [1, 0, 0, 0], level: 2 },
    c2: { ...emptyMastery(), score: 55 },
  };
  return state;
}

describe("ParentHelp", () => {
  test("nothing flagged", async () => {
    await renderWithGame(<ParentHelp />, { bundle });
    expect(screen.getByText("Hiện không có khái niệm nào cần hỗ trợ.")).toBeInTheDocument();
  });

  test("a flagged concept: numbers, real work, tip, practice and coached", async () => {
    const store = new MemoryStore({ persistent: true });
    const state = helpState();
    await store.createProfile(testProfile(), state);
    await store.saveState("p1", state, {
      profileId: "p1",
      itemId: "r.q1",
      at: "2026-10-05T03:00:00.000Z",
      kind: "choice",
      choiceIndex: 1,
      correct: false,
      lang: "vi",
    });
    await store.saveState("p1", state, {
      profileId: "p1",
      itemId: "r.l1.ex1",
      at: "2026-10-05T04:00:00.000Z",
      kind: "code",
      code: 'print("Hi"',
      status: "error",
      passedCount: 0,
      total: 2,
      misconceptions: [],
    });
    await renderWithGame(<ParentHelp newId={() => "p-1"} rng={seededRng(1)} />, { bundle, state, store });
    const card = screen.getByRole("heading", { name: "Khái niệm c1" }).closest("article") as HTMLElement;
    expect(within(card).getByText("Điểm thành thạo: 32")).toBeInTheDocument();
    expect(within(card).getByText("Tỷ lệ đúng gần đây: 25%")).toBeInTheDocument();
    expect(within(card).getByText("Hiểu lầm gặp: 3 lần")).toBeInTheDocument();
    expect(within(card).getByText("Mức bậc thang: 2")).toBeInTheDocument();
    expect(await within(card).findByText(/: qua 0\/2 test$/)).toBeInTheDocument();
    expect(within(card).getByText('print("Hi"')).toBeInTheDocument();
    expect(within(card).getByText(/: chọn "Sai" \(sai\)$/)).toBeInTheDocument();
    expect(within(card).getByText("Cùng con đọc to từng dòng code.")).toBeInTheDocument();
    await userEvent.click(within(card).getByRole("button", { name: "Giao thêm bài luyện" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã giao bài luyện. Con sẽ thấy ở nút Học tiếp.");
    await waitFor(async () => expect((await store.loadActive())!.state.assigned).toMatchObject([{ id: "p-1", conceptId: "c1" }]));
    await userEvent.click(within(card).getByRole("button", { name: "Đánh dấu đã kèm con" }));
    await waitFor(async () => expect((await store.loadActive())!.state.mastery.c1!.needsHelp).toBe(false));
    expect(screen.getByText("Khái niệm c2: 55 điểm")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/ParentHelp.test.tsx`
Expected: FAIL: chưa có `./ParentHelp`.

- [ ] **Step 3: Viết code**

`src/ui/ParentHelp.tsx` (tạo file):

```tsx
import { useEffect, useState } from "react";
import { allExercises, findConcept, findItem } from "../content/lookup";
import { isChoiceQuestion } from "../content/types";
import { accuracyPercent, conceptsNeedingHelp, conceptsPractising } from "../game/parentStats";
import type { Rng } from "../game/random";
import { buildPracticeSet } from "../game/reviewSet";
import type { ConceptMastery } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import type { AttemptRecord } from "../storage/types";
import { useContent } from "./contexts";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

/** Attempts shown per concept, newest first. */
export const EVIDENCE_COUNT = 3;

/**
 * Spec 9.2: each concept that needs help, with its numbers, the child's real recent work, the tip for the parent,
 * "assign more practice" and "mark as coached"; then the concepts being practised.
 */
export function ParentHelp({ newId = () => crypto.randomUUID(), rng = Math.random }: { newId?: () => string; rng?: Rng }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { state } = useGame();
  const flagged = conceptsNeedingHelp(state);
  const practising = conceptsPractising(state);
  const name = (id: string) => {
    const concept = findConcept(bundle, id);
    return concept ? pick(concept.name, uiLang) : id;
  };
  return (
    <section className="parent-help">
      {flagged.length === 0 ? (
        <p>{t("help.none")}</p>
      ) : (
        flagged.map(([id, m]) => <HelpCard key={id} conceptId={id} mastery={m} newId={newId} rng={rng} />)
      )}
      {practising.length > 0 && (
        <>
          <h2>{t("help.practising")}</h2>
          <ul>
            {practising.map(([id, m]) => (
              <li key={id}>{t("help.practisingItem", { name: name(id), n: Math.round(m.score) })}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function HelpCard({
  conceptId,
  mastery,
  newId,
  rng,
}: {
  conceptId: string;
  mastery: ConceptMastery;
  newId(): string;
  rng: Rng;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const concept = findConcept(bundle, conceptId);
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  const [assigned, setAssigned] = useState(false);
  // The set is drawn when the parent clicks; its size does not depend on the draw.
  const canPractice = buildPracticeSet(bundle, game.state, conceptId, rng).length > 0;
  const accuracy = accuracyPercent(mastery);

  useEffect(() => {
    let alive = true;
    const ids = allExercises(bundle)
      .filter((item) => item.concepts.includes(conceptId))
      .map((item) => item.id);
    game.attemptsFor(ids).then(
      (found) => alive && setAttempts(found.slice(-EVIDENCE_COUNT).reverse()),
      () => alive && setAttempts([]),
    );
    return () => {
      alive = false;
    };
    // The evidence is read once per card.
  }, [bundle, conceptId]);

  function describe(attempt: AttemptRecord): string {
    const time = formatDateTime(attempt.at);
    if (attempt.kind === "code") return t("help.codeResult", { time, passed: attempt.passedCount, total: attempt.total });
    const item = findItem(bundle, attempt.itemId);
    const choice = item && isChoiceQuestion(item) ? item.choices[attempt.choiceIndex] : undefined;
    const text = choice ? pick(choice.text, uiLang) : String(attempt.choiceIndex + 1);
    return t(attempt.correct ? "help.choiceRight" : "help.choiceWrong", { time, choice: text });
  }

  return (
    <article className="help-card">
      <h2>{concept ? pick(concept.name, uiLang) : conceptId}</h2>
      <ul className="help-numbers">
        <li>{t("help.score", { n: Math.round(mastery.score) })}</li>
        <li>{accuracy === null ? t("help.noResults") : t("help.accuracy", { n: accuracy })}</li>
        <li>{t("help.misconceptions", { n: mastery.misconceptions })}</li>
        <li>{t("help.level", { n: mastery.level })}</li>
        {mastery.coachedAt && <li>{t("help.coached", { day: mastery.coachedAt })}</li>}
      </ul>
      <h3>{t("help.evidence")}</h3>
      {attempts !== null && attempts.length === 0 && <p>{t("help.noEvidence")}</p>}
      {attempts !== null && attempts.length > 0 && (
        <ul className="help-evidence">
          {attempts.map((attempt) => (
            <li key={`${attempt.itemId}-${attempt.at}`}>
              <span>{describe(attempt)}</span>
              {attempt.kind === "code" && (
                <pre className="code-block">
                  <code>{attempt.code}</code>
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
      {concept?.parentTip && (
        <>
          <h3>{t("help.tip")}</h3>
          <p className="help-tip">{concept.parentTip}</p>
        </>
      )}
      <div className="help-actions">
        <button
          disabled={!canPractice || assigned}
          onClick={() => {
            const items = buildPracticeSet(bundle, game.state, conceptId, rng).map((item) => item.id);
            game.dispatch({ type: "PracticeAssigned", id: newId(), conceptId, items });
            setAssigned(true);
          }}
        >
          {t("help.assign")}
        </button>
        <button onClick={() => game.dispatch({ type: "SupportGiven", conceptId })}>{t("help.markCoached")}</button>
      </div>
      {!canPractice && <p>{t("help.noPractice")}</p>}
      {assigned && <p role="status">{t("help.assigned")}</p>}
    </article>
  );
}
```

Các file còn lại:

```diff
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index ca038a7..f4f68bf 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -296,4 +296,23 @@ export const en: Record<MessageKey, string> = {
   "overview.vacationDay": "{day}: vacation",
   "overview.stage": "Stage {n}: {title}",
   "overview.xu": "Coins: {xu}, on average {avg} a day (14 days)",
+  "help.none": "No concept needs help right now.",
+  "help.score": "Mastery: {n}",
+  "help.accuracy": "Recent accuracy: {n}%",
+  "help.noResults": "No recent results",
+  "help.misconceptions": "Misconception seen: {n} times",
+  "help.level": "Ladder level: {n}",
+  "help.coached": "Coached on {day}",
+  "help.evidence": "Recent work",
+  "help.noEvidence": "No saved work yet.",
+  "help.codeResult": "{time}: {passed} of {total} tests passed",
+  "help.choiceRight": "{time}: chose \"{choice}\" (right)",
+  "help.choiceWrong": "{time}: chose \"{choice}\" (wrong)",
+  "help.tip": "How to help",
+  "help.assign": "Assign more practice",
+  "help.assigned": "Practice assigned. Your child sees it under Continue.",
+  "help.noPractice": "No practice fits the lessons done so far.",
+  "help.markCoached": "Mark as coached",
+  "help.practising": "Practising (mastery 40 to 70)",
+  "help.practisingItem": "{name}: {n} points",
 };
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index c48f993..e1c6881 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -294,6 +294,25 @@ export const vi = {
   "overview.vacationDay": "{day}: nghỉ",
   "overview.stage": "Giai đoạn {n}: {title}",
   "overview.xu": "Xu: {xu}, trung bình {avg} xu/ngày (14 ngày)",
+  "help.none": "Hiện không có khái niệm nào cần hỗ trợ.",
+  "help.score": "Điểm thành thạo: {n}",
+  "help.accuracy": "Tỷ lệ đúng gần đây: {n}%",
+  "help.noResults": "Chưa có kết quả gần đây",
+  "help.misconceptions": "Hiểu lầm gặp: {n} lần",
+  "help.level": "Mức bậc thang: {n}",
+  "help.coached": "Đã kèm con ngày {day}",
+  "help.evidence": "Bài làm gần đây",
+  "help.noEvidence": "Chưa có bài làm được lưu.",
+  "help.codeResult": "{time}: qua {passed}/{total} test",
+  "help.choiceRight": "{time}: chọn \"{choice}\" (đúng)",
+  "help.choiceWrong": "{time}: chọn \"{choice}\" (sai)",
+  "help.tip": "Gợi ý kèm con",
+  "help.assign": "Giao thêm bài luyện",
+  "help.assigned": "Đã giao bài luyện. Con sẽ thấy ở nút Học tiếp.",
+  "help.noPractice": "Chưa có bài luyện phù hợp với bài con đã học.",
+  "help.markCoached": "Đánh dấu đã kèm con",
+  "help.practising": "Đang luyện (điểm 40 đến 70)",
+  "help.practisingItem": "{name}: {n} điểm",
 } as const;
 
 export type MessageKey = keyof typeof vi;
diff --git a/src/styles.css b/src/styles.css
index 122acb7..7066922 100644
--- a/src/styles.css
+++ b/src/styles.css
@@ -176,3 +176,7 @@ a.button.primary { background: var(--primary); border-color: var(--primary); col
 .minutes-bar { position: absolute; inset: 0 auto 0 0; background: #d8e3ff; border-radius: 4px; z-index: -1; }
 .minutes-vacation { color: var(--muted); }
 .minutes-vacation .minutes-bar { background: #e5e5e5; }
+.help-card { border: 1px solid #dde3ef; border-radius: var(--radius); padding: 12px 16px; margin: 12px 0; }
+.help-numbers { display: flex; flex-wrap: wrap; gap: 16px; list-style: none; padding: 0; }
+.help-tip { background: #fff8ea; padding: 8px 12px; border-radius: var(--radius); }
+.help-actions { display: flex; gap: 8px; }
diff --git a/src/ui/ParentScreen.tsx b/src/ui/ParentScreen.tsx
index a8432ed..042aebb 100644
--- a/src/ui/ParentScreen.tsx
+++ b/src/ui/ParentScreen.tsx
@@ -4,15 +4,19 @@ import type { MessageKey } from "../i18n/vi";
 import { isValidPin } from "../storage/pin";
 import { formatDateTime } from "./format";
 import { useGame } from "./GameProvider";
+import { ParentHelp } from "./ParentHelp";
 import { ParentOverview } from "./ParentOverview";
 
 /** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
 export const LOCK_AFTER_MS = 5 * 60_000;
 const LOCK_CHECK_MS = 10_000;
 
-type Tab = "overview";
+type Tab = "overview" | "help";
 
-const TABS: { id: Tab; label: MessageKey }[] = [{ id: "overview", label: "parent.tabOverview" }];
+const TABS: { id: Tab; label: MessageKey }[] = [
+  { id: "overview", label: "parent.tabOverview" },
+  { id: "help", label: "parent.tabHelp" },
+];
 
 export function ParentScreen() {
   const [open, setOpen] = useState(false);
@@ -160,6 +164,7 @@ function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
         ))}
       </div>
       {tab === "overview" && <ParentOverview />}
+      {tab === "help" && <ParentHelp />}
       <a href="#/">{t("nav.room")}</a>
     </main>
   );
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/ParentHelp.tsx src/ui/ParentHelp.test.tsx src/i18n/vi.ts src/i18n/en.ts src/styles.css src/ui/ParentScreen.tsx
git commit -m "feat(ui): the needs-help tab with real work, the parent tip, assigned practice and coached

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Tab Tiến độ

**Files:**
- Create: `src/ui/ParentProgress.tsx`
- Modify: `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/ui/ParentScreen.tsx`
- Test: `src/ui/ParentProgress.test.tsx`

**Interfaces:**
- Consumes: `formatScore` (M3b `ExamRunner`); `formatDateTime` (Task 3); `progress.topicTests`, `progress.evolutionTests`, `progress.exerciseStats`.
- Produces:
  - `ParentProgress()`: bảng theo chủ đề (bài đã học/tổng số bài, thành thạo trung bình của các khái niệm đã có điểm, điểm cao nhất của kiểm tra chủ đề), lịch sử kiểm tra tiến hóa, và chi tiết từng bài học (đã xong chưa; mỗi bài code: số lần nộp sai, số gợi ý, đã xem lời giải).
  - `ParentScreen` hiện `ParentProgress` ở tab "Tiến độ".

- [ ] **Step 1: Viết test thất bại**

`src/ui/ParentProgress.test.tsx` (tạo file):

```tsx
// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { ParentProgress } from "./ParentProgress";

test("topics, evolution tests and lesson details", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1"];
  state.mastery = { k1: { ...emptyMastery(), score: 60 }, k2: { ...emptyMastery(), score: 41 } };
  state.progress.topicTests["x.t"] = { attempts: 2, best: 4.5, max: 6, passed: false, lastItems: [] };
  state.progress.evolutionTests = [
    { at: "2026-10-05T03:00:00.000Z", stage: 1, score: 3, max: 7, passed: false, items: [], wrongConcepts: [] },
  ];
  state.progress.exerciseStats = { "x.l1.ex1": { fails: 2, hints: 1, viewedSolution: true } };
  await renderWithGame(<ParentProgress />, { bundle: examBundle(), state });
  const row = screen.getByRole("row", { name: /Chủ đề thi/ });
  expect(within(row).getAllByRole("cell").map((cell) => cell.textContent)).toEqual(["Chủ đề thi", "1/2", "51", "4,5/6"]);
  expect(screen.getByText(/: giai đoạn 1, 3\/7 điểm, chưa đạt$/)).toBeInTheDocument();
  expect(screen.getByText("x.l1.ex1: 2 lần nộp sai, 1 gợi ý, đã xem lời giải")).toBeInTheDocument();
});

test("nothing yet", async () => {
  await renderWithGame(<ParentProgress />, { bundle: examBundle() });
  expect(screen.getAllByText("Chưa có")).toHaveLength(2);
  expect(screen.getByText("Chưa thi lần nào.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/ParentProgress.test.tsx`
Expected: FAIL: chưa có `./ParentProgress`.

- [ ] **Step 3: Viết code**

`src/ui/ParentProgress.tsx` (tạo file):

```tsx
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import type { GameState } from "../game/state";
import type { Topic } from "../content/types";
import { useContent } from "./contexts";
import { formatScore } from "./ExamRunner";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

/** The average mastery of a topic's concepts that have a record, or null. */
function topicMastery(topic: Topic, state: GameState): number | null {
  const scores = topic.concepts.map((c) => state.mastery[c.id]?.score).filter((s): s is number => s !== undefined);
  return scores.length === 0 ? null : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Spec 9.3: a table by topic, the evolution test history, and the details of each lesson. */
export function ParentProgress() {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { state } = useGame();
  const topics = bundle.stages.flatMap((stage) => stage.topics);
  const done = new Set(state.progress.completedLessons);
  const stats = state.progress.exerciseStats ?? {};
  return (
    <section className="parent-progress">
      <h2>{t("progress.topicsTitle")}</h2>
      <table>
        <thead>
          <tr>
            <th>{t("progress.topic")}</th>
            <th>{t("progress.lessons")}</th>
            <th>{t("progress.mastery")}</th>
            <th>{t("progress.topicTest")}</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => {
            const mastery = topicMastery(topic, state);
            const record = state.progress.topicTests[topic.id];
            return (
              <tr key={topic.id}>
                <td>{pick(topic.title, uiLang)}</td>
                <td>
                  {t("progress.count", {
                    done: topic.lessons.filter((lesson) => done.has(lesson.id)).length,
                    total: topic.lessons.length,
                  })}
                </td>
                <td>{mastery === null ? t("progress.none") : mastery}</td>
                <td>
                  {record
                    ? t("progress.count", { done: formatScore(record.best, uiLang), total: record.max })
                    : t("progress.none")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>{t("progress.evolutionTitle")}</h2>
      {state.progress.evolutionTests.length === 0 ? (
        <p>{t("progress.evolutionNone")}</p>
      ) : (
        <ul>
          {state.progress.evolutionTests.map((attempt) => (
            <li key={attempt.at}>
              {t("progress.evolutionItem", {
                time: formatDateTime(attempt.at),
                stage: attempt.stage,
                score: formatScore(attempt.score, uiLang),
                max: attempt.max,
                verdict: t(attempt.passed ? "progress.passed" : "progress.failed"),
              })}
            </li>
          ))}
        </ul>
      )}

      <h2>{t("progress.lessonsTitle")}</h2>
      <ul className="lesson-details">
        {topics.flatMap((topic) =>
          topic.lessons.map((lesson) => (
            <li key={lesson.id}>
              <strong>{pick(lesson.title, uiLang)}</strong>{" "}
              {t(done.has(lesson.id) ? "progress.lessonDone" : "progress.lessonNotDone")}
              <ul>
                {lesson.exercises
                  .filter((exercise) => stats[exercise.id])
                  .map((exercise) => {
                    const s = stats[exercise.id]!;
                    const parts = [t("progress.fails", { n: s.fails }), t("progress.hints", { n: s.hints })];
                    if (s.viewedSolution) parts.push(t("progress.solution"));
                    return (
                      <li key={exercise.id}>
                        {exercise.id}: {parts.join(", ")}
                      </li>
                    );
                  })}
              </ul>
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
```

Các file còn lại:

```diff
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index f4f68bf..0501d75 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -315,4 +315,22 @@ export const en: Record<MessageKey, string> = {
   "help.markCoached": "Mark as coached",
   "help.practising": "Practising (mastery 40 to 70)",
   "help.practisingItem": "{name}: {n} points",
+  "progress.topicsTitle": "By topic",
+  "progress.topic": "Topic",
+  "progress.lessons": "Lessons done",
+  "progress.mastery": "Average mastery",
+  "progress.topicTest": "Topic test (best)",
+  "progress.count": "{done}/{total}",
+  "progress.none": "None yet",
+  "progress.evolutionTitle": "Evolution tests",
+  "progress.evolutionNone": "No evolution test yet.",
+  "progress.evolutionItem": "{time}: stage {stage}, {score} of {max} points, {verdict}",
+  "progress.passed": "passed",
+  "progress.failed": "not passed",
+  "progress.lessonsTitle": "Lessons",
+  "progress.lessonDone": "Done",
+  "progress.lessonNotDone": "Not yet",
+  "progress.fails": "{n} wrong submits",
+  "progress.hints": "{n} hints",
+  "progress.solution": "saw the solution",
 };
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index e1c6881..6f3c617 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -313,6 +313,24 @@ export const vi = {
   "help.markCoached": "Đánh dấu đã kèm con",
   "help.practising": "Đang luyện (điểm 40 đến 70)",
   "help.practisingItem": "{name}: {n} điểm",
+  "progress.topicsTitle": "Theo chủ đề",
+  "progress.topic": "Chủ đề",
+  "progress.lessons": "Bài đã học",
+  "progress.mastery": "Thành thạo trung bình",
+  "progress.topicTest": "Kiểm tra chủ đề (cao nhất)",
+  "progress.count": "{done}/{total}",
+  "progress.none": "Chưa có",
+  "progress.evolutionTitle": "Lịch sử kiểm tra tiến hóa",
+  "progress.evolutionNone": "Chưa thi lần nào.",
+  "progress.evolutionItem": "{time}: giai đoạn {stage}, {score}/{max} điểm, {verdict}",
+  "progress.passed": "đạt",
+  "progress.failed": "chưa đạt",
+  "progress.lessonsTitle": "Chi tiết bài học",
+  "progress.lessonDone": "Đã xong",
+  "progress.lessonNotDone": "Chưa học",
+  "progress.fails": "{n} lần nộp sai",
+  "progress.hints": "{n} gợi ý",
+  "progress.solution": "đã xem lời giải",
 } as const;
 
 export type MessageKey = keyof typeof vi;
diff --git a/src/ui/ParentScreen.tsx b/src/ui/ParentScreen.tsx
index 042aebb..01dfe5c 100644
--- a/src/ui/ParentScreen.tsx
+++ b/src/ui/ParentScreen.tsx
@@ -6,16 +6,18 @@ import { formatDateTime } from "./format";
 import { useGame } from "./GameProvider";
 import { ParentHelp } from "./ParentHelp";
 import { ParentOverview } from "./ParentOverview";
+import { ParentProgress } from "./ParentProgress";
 
 /** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
 export const LOCK_AFTER_MS = 5 * 60_000;
 const LOCK_CHECK_MS = 10_000;
 
-type Tab = "overview" | "help";
+type Tab = "overview" | "help" | "progress";
 
 const TABS: { id: Tab; label: MessageKey }[] = [
   { id: "overview", label: "parent.tabOverview" },
   { id: "help", label: "parent.tabHelp" },
+  { id: "progress", label: "parent.tabProgress" },
 ];
 
 export function ParentScreen() {
@@ -165,6 +167,7 @@ function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
       </div>
       {tab === "overview" && <ParentOverview />}
       {tab === "help" && <ParentHelp />}
+      {tab === "progress" && <ParentProgress />}
       <a href="#/">{t("nav.room")}</a>
     </main>
   );
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/ParentProgress.tsx src/ui/ParentProgress.test.tsx src/i18n/vi.ts src/i18n/en.ts src/ui/ParentScreen.tsx
git commit -m "feat(ui): the progress tab by topic, evolution tests and lesson details

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Tab Phần thưởng và giới hạn giá

**Files:**
- Create: `src/ui/ParentRewards.tsx`
- Modify: `src/game/realRewards.ts`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`, `src/ui/ParentScreen.tsx`
- Test: `src/ui/ParentRewards.test.tsx`, `src/game/realRewards.test.ts`

**Interfaces:**
- Consumes: sự kiện `RewardApproved`, `RewardRejected`, `RewardsEdited` (M4a); `averageXuPerDay` (Task 3); `formatDateTime`.
- Produces:
  - `REWARD_MAX_PRICE = 100_000`, `REWARD_MAX_PER_WEEK = 50`; `cleanCatalog` kẹp giá và số lần đổi mỗi tuần trong giới hạn này (số lớn không còn làm hỏng state khi kiểm tra schema).
  - `REWARD_HISTORY_SHOWN = 20`.
  - `ParentRewards({ newId? })`: yêu cầu chờ duyệt (Duyệt / Từ chối; báo khi con chưa đủ xu), xu trung bình/ngày để định giá, sửa danh sách (tên, giá, số lần mỗi tuần, thêm, xóa, lưu), lịch sử 20 yêu cầu gần nhất.
  - `ParentScreen` hiện `ParentRewards` ở tab "Phần thưởng".

- [ ] **Step 1: Viết test thất bại**

`src/ui/ParentRewards.test.tsx` (tạo file):

```tsx
// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { ParentRewards } from "./ParentRewards";

const at = FIXED_NOW.toISOString();

function stateWithRequests() {
  const state = initialGameState(TODAY);
  state.wallet.xu = 60;
  state.wallet.history = [{ day: TODAY, delta: 140, reason: "code", ref: "e" }];
  state.rewards.catalog = [{ id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 }];
  state.rewards.requests = [
    { id: "q1", rewardId: "ice", name: "Kem", price: 30, at, status: "pending", decidedAt: null },
    { id: "q2", rewardId: "park", name: "Đi công viên", price: 100, at, status: "pending", decidedAt: null },
    { id: "q0", rewardId: "ice", name: "Kem", price: 30, at, status: "rejected", decidedAt: at },
  ];
  return state;
}

describe("ParentRewards", () => {
  test("approves a request the child can pay and rejects another", async () => {
    const { store } = await renderWithGame(<ParentRewards />, { state: stateWithRequests() });
    expect(screen.getByRole("button", { name: "Duyệt Đi công viên" })).toBeDisabled();
    expect(screen.getByText("Con chưa đủ xu (đang có 60 xu)")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Duyệt Kem" }));
    await userEvent.click(screen.getByRole("button", { name: "Từ chối Đi công viên" }));
    expect(screen.getByText("Không có yêu cầu nào.")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.wallet.xu).toBe(30));
    expect(screen.getByText(/: Kem \(30 xu\), đã duyệt$/)).toBeInTheDocument();
    expect(screen.getByText(/: Đi công viên \(100 xu\), đã từ chối$/)).toBeInTheDocument();
    expect(screen.getByText("Con kiếm trung bình 10 xu/ngày trong 14 ngày qua.")).toBeInTheDocument();
  });

  test("edits and saves the reward list", async () => {
    const { store } = await renderWithGame(<ParentRewards newId={() => "new"} />, { state: stateWithRequests() });
    await userEvent.click(screen.getByRole("button", { name: "Thêm phần thưởng" }));
    const rows = screen.getAllByRole("listitem").filter((li) => li.closest("ol"));
    const fresh = rows.at(-1) as HTMLElement;
    await userEvent.type(within(fresh).getByLabelText("Tên"), "Đọc truyện");
    await userEvent.clear(within(fresh).getByLabelText("Giá (xu)"));
    await userEvent.type(within(fresh).getByLabelText("Giá (xu)"), "40");
    await userEvent.click(within(rows[0] as HTMLElement).getByRole("button", { name: "Xóa" }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu danh sách" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã lưu danh sách.");
    await waitFor(async () =>
      expect((await store.loadActive())!.state.rewards.catalog).toEqual([
        { id: "new", name: "Đọc truyện", price: 40, weeklyLimit: 1 },
      ]),
    );
  });
});
```

`src/game/realRewards.test.ts`:

```diff
diff --git a/src/game/realRewards.test.ts b/src/game/realRewards.test.ts
index ee7ea25..d0391a9 100644
--- a/src/game/realRewards.test.ts
+++ b/src/game/realRewards.test.ts
@@ -1,7 +1,14 @@
 import { describe, expect, test } from "vitest";
 import { at, run } from "../test/gameSteps";
 import { apply, type GameEvent } from "./apply";
-import { cleanCatalog, freeXu, REWARD_HISTORY_LIMIT, requestBlock } from "./realRewards";
+import {
+  cleanCatalog,
+  freeXu,
+  REWARD_HISTORY_LIMIT,
+  REWARD_MAX_PER_WEEK,
+  REWARD_MAX_PRICE,
+  requestBlock,
+} from "./realRewards";
 import { initialGameState, type GameState, type RewardItem } from "./state";
 
 const MONDAY = "2026-10-05";
@@ -16,6 +23,14 @@ function withRewards(xu: number): GameState {
 
 const ask = (requestId: string, rewardId: string): GameEvent => ({ type: "RewardRequested", requestId, rewardId });
 
+describe("reward limits", () => {
+  test("a price or a weekly limit above the maximum is brought down", () => {
+    expect(cleanCatalog([{ id: "a", name: "Xe đạp", price: 1e300, weeklyLimit: 999 }])).toEqual([
+      { id: "a", name: "Xe đạp", price: REWARD_MAX_PRICE, weeklyLimit: REWARD_MAX_PER_WEEK },
+    ]);
+  });
+});
+
 describe("RewardsEdited", () => {
   test("cleans the parent's list", () => {
     expect(
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/ParentRewards.test.tsx src/game/realRewards.test.ts`
Expected: FAIL: chưa có `./ParentRewards`, `REWARD_MAX_PRICE`.

- [ ] **Step 3: Viết code**

`src/game/realRewards.ts`:

```diff
diff --git a/src/game/realRewards.ts b/src/game/realRewards.ts
index 6674902..7feb688 100644
--- a/src/game/realRewards.ts
+++ b/src/game/realRewards.ts
@@ -6,6 +6,10 @@ export const REWARD_HISTORY_LIMIT = 100;
 
 export type RequestBlock = "xu" | "limit";
 
+/** The largest price and weekly limit a parent can set (larger numbers would not fit the saved state). */
+export const REWARD_MAX_PRICE = 100_000;
+export const REWARD_MAX_PER_WEEK = 50;
+
 /** Xu still free to ask with: the balance minus the pending requests. */
 export function freeXu(state: GameState): number {
   const pending = state.rewards.requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.price, 0);
@@ -43,8 +47,8 @@ export function cleanCatalog(catalog: RewardItem[]): RewardItem[] {
     clean.push({
       id: item.id,
       name,
-      price: Math.max(0, Math.floor(item.price)),
-      weeklyLimit: Math.max(0, Math.floor(item.weeklyLimit)),
+      price: Math.min(REWARD_MAX_PRICE, Math.max(0, Math.floor(item.price))),
+      weeklyLimit: Math.min(REWARD_MAX_PER_WEEK, Math.max(0, Math.floor(item.weeklyLimit))),
     });
   }
   return clean;
```

`src/ui/ParentRewards.tsx` (tạo file):

```tsx
import { useState } from "react";
import { averageXuPerDay } from "../game/parentStats";
import { REWARD_MAX_PER_WEEK, REWARD_MAX_PRICE } from "../game/realRewards";
import type { RewardItem } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

/** Decided requests shown in the history. */
export const REWARD_HISTORY_SHOWN = 20;

/** Spec 9.4: approve or reject requests, keep the reward list, see the daily xu average and the history. */
export function ParentRewards({ newId = () => crypto.randomUUID() }: { newId?: () => string }) {
  const { t } = useLang();
  const game = useGame();
  const { state, today } = game;
  const pending = state.rewards.requests.filter((r) => r.status === "pending");
  const decided = state.rewards.requests
    .filter((r) => r.status !== "pending")
    .slice(-REWARD_HISTORY_SHOWN)
    .reverse();
  const [rows, setRows] = useState<RewardItem[]>(() => state.rewards.catalog);
  const [saved, setSaved] = useState(false);
  const edit = (index: number, patch: Partial<RewardItem>) => {
    setSaved(false);
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="parent-rewards">
      <h2>{t("rewardsTab.pending")}</h2>
      {pending.length === 0 ? (
        <p>{t("rewardsTab.noPending")}</p>
      ) : (
        <ul className="requests">
          {pending.map((r) => {
            const short = state.wallet.xu < r.price;
            return (
              <li key={r.id}>
                <span>{t("rewardsTab.request", { name: r.name, price: r.price, time: formatDateTime(r.at) })}</span>
                <button
                  className="primary"
                  disabled={short}
                  aria-label={`${t("rewardsTab.approve")} ${r.name}`}
                  onClick={() => game.dispatch({ type: "RewardApproved", requestId: r.id })}
                >
                  {t("rewardsTab.approve")}
                </button>
                <button
                  aria-label={`${t("rewardsTab.reject")} ${r.name}`}
                  onClick={() => game.dispatch({ type: "RewardRejected", requestId: r.id })}
                >
                  {t("rewardsTab.reject")}
                </button>
                {short && <span>{t("rewardsTab.notEnough", { xu: state.wallet.xu })}</span>}
              </li>
            );
          })}
        </ul>
      )}

      <h2>{t("rewardsTab.listTitle")}</h2>
      <p>{t("rewardsTab.average", { avg: averageXuPerDay(state, today) })}</p>
      <ol className="reward-rows">
        {rows.map((row, index) => (
          <li key={row.id}>
            <label>
              {t("rewardsTab.name")}
              <input value={row.name} onChange={(e) => edit(index, { name: e.target.value })} />
            </label>
            <label>
              {t("rewardsTab.price")}
              <input type="number" min={0} max={REWARD_MAX_PRICE} value={row.price} onChange={(e) => edit(index, { price: Number(e.target.value) })} />
            </label>
            <label>
              {t("rewardsTab.limit")}
              <input
                type="number"
                min={0}
                max={REWARD_MAX_PER_WEEK}
                value={row.weeklyLimit}
                onChange={(e) => edit(index, { weeklyLimit: Number(e.target.value) })}
              />
            </label>
            <button
              onClick={() => {
                setSaved(false);
                setRows((current) => current.filter((_, i) => i !== index));
              }}
            >
              {t("rewardsTab.remove")}
            </button>
          </li>
        ))}
      </ol>
      <button
        onClick={() => {
          setSaved(false);
          setRows((current) => [...current, { id: newId(), name: "", price: 50, weeklyLimit: 1 }]);
        }}
      >
        {t("rewardsTab.add")}
      </button>
      <button
        className="primary"
        onClick={() => {
          game.dispatch({ type: "RewardsEdited", catalog: rows });
          setSaved(true);
        }}
      >
        {t("rewardsTab.save")}
      </button>
      {saved && <p role="status">{t("rewardsTab.saved")}</p>}

      {decided.length > 0 && (
        <>
          <h2>{t("rewardsTab.historyTitle")}</h2>
          <ul>
            {decided.map((r) => (
              <li key={r.id}>
                {t("rewardsTab.historyItem", {
                  time: formatDateTime(r.decidedAt ?? r.at),
                  name: r.name,
                  price: r.price,
                  status: t(r.status === "approved" ? "rewardsTab.approvedStatus" : "rewardsTab.rejectedStatus"),
                })}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
```

Các file còn lại:

```diff
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index 0501d75..4a4264e 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -333,4 +333,23 @@ export const en: Record<MessageKey, string> = {
   "progress.fails": "{n} wrong submits",
   "progress.hints": "{n} hints",
   "progress.solution": "saw the solution",
+  "rewardsTab.pending": "Requests waiting",
+  "rewardsTab.noPending": "No requests.",
+  "rewardsTab.request": "{name} · {price} coins · {time}",
+  "rewardsTab.approve": "Approve",
+  "rewardsTab.reject": "Reject",
+  "rewardsTab.notEnough": "Not enough coins yet (has {xu})",
+  "rewardsTab.listTitle": "Reward list",
+  "rewardsTab.name": "Name",
+  "rewardsTab.price": "Price (coins)",
+  "rewardsTab.limit": "Times a week",
+  "rewardsTab.remove": "Remove",
+  "rewardsTab.add": "Add a reward",
+  "rewardsTab.save": "Save the list",
+  "rewardsTab.saved": "List saved.",
+  "rewardsTab.average": "Your child earned {avg} coins a day over the last 14 days.",
+  "rewardsTab.historyTitle": "History",
+  "rewardsTab.historyItem": "{time}: {name} ({price} coins), {status}",
+  "rewardsTab.approvedStatus": "approved",
+  "rewardsTab.rejectedStatus": "rejected",
 };
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index 6f3c617..60b2993 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -331,6 +331,25 @@ export const vi = {
   "progress.fails": "{n} lần nộp sai",
   "progress.hints": "{n} gợi ý",
   "progress.solution": "đã xem lời giải",
+  "rewardsTab.pending": "Yêu cầu chờ duyệt",
+  "rewardsTab.noPending": "Không có yêu cầu nào.",
+  "rewardsTab.request": "{name} · {price} xu · {time}",
+  "rewardsTab.approve": "Duyệt",
+  "rewardsTab.reject": "Từ chối",
+  "rewardsTab.notEnough": "Con chưa đủ xu (đang có {xu} xu)",
+  "rewardsTab.listTitle": "Danh sách phần thưởng",
+  "rewardsTab.name": "Tên",
+  "rewardsTab.price": "Giá (xu)",
+  "rewardsTab.limit": "Số lần mỗi tuần",
+  "rewardsTab.remove": "Xóa",
+  "rewardsTab.add": "Thêm phần thưởng",
+  "rewardsTab.save": "Lưu danh sách",
+  "rewardsTab.saved": "Đã lưu danh sách.",
+  "rewardsTab.average": "Con kiếm trung bình {avg} xu/ngày trong 14 ngày qua.",
+  "rewardsTab.historyTitle": "Lịch sử",
+  "rewardsTab.historyItem": "{time}: {name} ({price} xu), {status}",
+  "rewardsTab.approvedStatus": "đã duyệt",
+  "rewardsTab.rejectedStatus": "đã từ chối",
 } as const;
 
 export type MessageKey = keyof typeof vi;
diff --git a/src/styles.css b/src/styles.css
index 7066922..468211f 100644
--- a/src/styles.css
+++ b/src/styles.css
@@ -180,3 +180,7 @@ a.button.primary { background: var(--primary); border-color: var(--primary); col
 .help-numbers { display: flex; flex-wrap: wrap; gap: 16px; list-style: none; padding: 0; }
 .help-tip { background: #fff8ea; padding: 8px 12px; border-radius: var(--radius); }
 .help-actions { display: flex; gap: 8px; }
+.requests li, .reward-rows li { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 4px 0; }
+.reward-rows input { width: 10em; }
+.parent-progress table { border-collapse: collapse; }
+.parent-progress th, .parent-progress td { border: 1px solid #dde3ef; padding: 4px 8px; text-align: left; }
diff --git a/src/ui/ParentScreen.tsx b/src/ui/ParentScreen.tsx
index 01dfe5c..77e6645 100644
--- a/src/ui/ParentScreen.tsx
+++ b/src/ui/ParentScreen.tsx
@@ -7,17 +7,19 @@ import { useGame } from "./GameProvider";
 import { ParentHelp } from "./ParentHelp";
 import { ParentOverview } from "./ParentOverview";
 import { ParentProgress } from "./ParentProgress";
+import { ParentRewards } from "./ParentRewards";
 
 /** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
 export const LOCK_AFTER_MS = 5 * 60_000;
 const LOCK_CHECK_MS = 10_000;
 
-type Tab = "overview" | "help" | "progress";
+type Tab = "overview" | "help" | "progress" | "rewards";
 
 const TABS: { id: Tab; label: MessageKey }[] = [
   { id: "overview", label: "parent.tabOverview" },
   { id: "help", label: "parent.tabHelp" },
   { id: "progress", label: "parent.tabProgress" },
+  { id: "rewards", label: "parent.tabRewards" },
 ];
 
 export function ParentScreen() {
@@ -168,6 +170,7 @@ function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
       {tab === "overview" && <ParentOverview />}
       {tab === "help" && <ParentHelp />}
       {tab === "progress" && <ParentProgress />}
+      {tab === "rewards" && <ParentRewards />}
       <a href="#/">{t("nav.room")}</a>
     </main>
   );
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/ParentRewards.tsx src/ui/ParentRewards.test.tsx src/game/realRewards.ts src/game/realRewards.test.ts src/i18n/vi.ts src/i18n/en.ts src/styles.css src/ui/ParentScreen.tsx
git commit -m "feat(ui): the rewards tab: approve requests and edit the list, with price and limit maximums

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Tab Cài đặt

**Files:**
- Create: `src/ui/ParentSettings.tsx`
- Modify: `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/styles.css`, `src/ui/ParentScreen.tsx`
- Test: `src/ui/ParentSettings.test.tsx`

**Interfaces:**
- Consumes: `SETTING_LIMITS` (Task 1); `setPin`, `eraseAll`, `errorLog` (Task 2); sự kiện `VacationToggled`, `VacationScheduled`, `VacationCancelled`, `SettingsChanged`; `useLang().setUiLang`; `downloadText`.
- Produces:
  - `ParentSettings()` gồm 5 phần:
    1. Chế độ nghỉ: bật/tắt ngay, đặt lịch nghỉ (từ ngày, đến ngày), danh sách lịch đã đặt, hủy lịch.
    2. Mục tiêu và ngưỡng: mục tiêu ngày, kế hoạch tuần, ngày vắng được miễn, ngưỡng đạt, ngưỡng "Cần hỗ trợ", thời gian chạy code; ô số có `min`/`max` từ `SETTING_LIMITS`; lưu bằng `SettingsChanged` (luật chơi vẫn kẹp lại).
    3. Ngôn ngữ: giao diện (chung cơ chế với nút VI/EN) và câu hỏi mặc định (VI, EN, cả hai).
    4. Dữ liệu: đổi PIN (`setPin(pin, false)`, không ghi là đặt lại), xóa hồ sơ (nút chỉ bật khi gõ đúng tên của con, rồi `eraseAll()`).
    5. Nhật ký: cảnh báo đồng hồ, nhật ký lỗi và nút xuất nhật ký lỗi (JSON).
  - `ParentScreen` hiện `ParentSettings` ở tab "Cài đặt".

- [ ] **Step 1: Viết test thất bại**

`src/ui/ParentSettings.test.tsx` (tạo file):

```tsx
// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { initialGameState } from "../game/state";
import { hashPin } from "../storage/pin";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { downloadText } from "./download";
import { ParentSettings } from "./ParentSettings";

vi.mock("./download", () => ({ downloadText: vi.fn() }));

const section = (heading: string) => screen.getByRole("heading", { name: heading }).parentElement as HTMLElement;

describe("ParentSettings", () => {
  test("starts and ends a vacation, schedules one and cancels it", async () => {
    const { store } = await renderWithGame(<ParentSettings />);
    const vacation = section("Chế độ nghỉ");
    await userEvent.click(within(vacation).getByRole("button", { name: "Bật chế độ nghỉ ngay" }));
    expect(within(vacation).getByText("Đang nghỉ từ 2026-10-06.")).toBeInTheDocument();
    await userEvent.click(within(vacation).getByRole("button", { name: "Tắt chế độ nghỉ" }));
    expect(within(vacation).getByText("Không nghỉ.")).toBeInTheDocument();
    fireEvent.change(within(vacation).getByLabelText("Từ ngày"), { target: { value: "2026-10-01" } });
    fireEvent.change(within(vacation).getByLabelText("Đến ngày"), { target: { value: "2026-10-09" } });
    await userEvent.click(within(vacation).getByRole("button", { name: "Lên lịch nghỉ" }));
    expect(within(vacation).getByRole("alert")).toHaveTextContent("Ngày bắt đầu phải từ hôm nay");
    fireEvent.change(within(vacation).getByLabelText("Từ ngày"), { target: { value: "2026-10-12" } });
    fireEvent.change(within(vacation).getByLabelText("Đến ngày"), { target: { value: "2026-10-16" } });
    await userEvent.click(within(vacation).getByRole("button", { name: "Lên lịch nghỉ" }));
    expect(within(vacation).getByText(/^2026-10-12 đến 2026-10-16/)).toBeInTheDocument();
    await waitFor(async () =>
      expect((await store.loadActive())!.state.vacation.ranges).toEqual([{ start: "2026-10-12", end: "2026-10-16" }]),
    );
    await userEvent.click(within(vacation).getByRole("button", { name: "Hủy" }));
    await waitFor(async () => expect((await store.loadActive())!.state.vacation.ranges).toEqual([]));
  });

  test("saves goals and limits inside their ranges, and the question language", async () => {
    const { store } = await renderWithGame(<ParentSettings />);
    const goals = section("Mục tiêu và ngưỡng");
    await userEvent.clear(within(goals).getByLabelText("Mục tiêu mỗi ngày (điểm hoạt động)"));
    await userEvent.type(within(goals).getByLabelText("Mục tiêu mỗi ngày (điểm hoạt động)"), "3");
    await userEvent.clear(within(goals).getByLabelText("Ngưỡng đạt kiểm tra (%)"));
    await userEvent.type(within(goals).getByLabelText("Ngưỡng đạt kiểm tra (%)"), "30");
    await userEvent.click(within(goals).getByRole("button", { name: "Lưu cài đặt" }));
    expect(within(goals).getByRole("status")).toHaveTextContent("Đã lưu cài đặt.");
    await userEvent.selectOptions(screen.getByLabelText("Ngôn ngữ câu hỏi mặc định"), "both");
    await waitFor(async () =>
      expect((await store.loadActive())!.state.settings).toMatchObject({ dailyGoal: 3, passPercent: 50, questionLang: "both" }),
    );
  });

  test("changes the PIN without marking a reset", async () => {
    const { store } = await renderWithGame(<ParentSettings />, { meta: { pin: await hashPin("1111") } });
    const data = section("Dữ liệu");
    await userEvent.type(within(data).getByLabelText("Mã PIN mới (4 đến 6 chữ số)"), "2468");
    await userEvent.type(within(data).getByLabelText("Nhập lại mã PIN mới"), "2468");
    await userEvent.click(within(data).getByRole("button", { name: "Đổi mã PIN" }));
    expect(await within(data).findByText("Đã đổi mã PIN.")).toBeInTheDocument();
    expect((await store.readMeta()).pinResetAt).toBeNull();
  });

  test("deletes everything only after the child's name is typed", async () => {
    const onReplaced = vi.fn();
    const { store } = await renderWithGame(<ParentSettings />, { onReplaced });
    const button = screen.getByRole("button", { name: "Xóa hết dữ liệu" });
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Tên của con"), "An");
    await userEvent.click(button);
    await waitFor(() => expect(onReplaced).toHaveBeenCalledOnce());
    expect(await store.loadActive()).toBeNull();
  });

  test("shows the clock warnings and exports the error log", async () => {
    const state = initialGameState(TODAY);
    state.warnings = [{ at: FIXED_NOW.toISOString(), kind: "clock-rollback" }];
    const errorLog = [{ at: FIXED_NOW.toISOString(), kind: "ui-crash" as const, detail: "Boom" }];
    await renderWithGame(<ParentSettings />, { state, meta: { errorLog } });
    expect(screen.getByText("2026-10-06 09:00: đồng hồ máy bị chỉnh lùi")).toBeInTheDocument();
    expect(screen.getByText("2026-10-06 09:00 · ui-crash · Boom")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xuất nhật ký lỗi" }));
    expect(downloadText).toHaveBeenCalledWith("py-pet-error-log-2026-10-06.json", JSON.stringify(errorLog, null, 2));
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/ParentSettings.test.tsx`
Expected: FAIL: chưa có `./ParentSettings`.

- [ ] **Step 3: Viết code**

`src/ui/ParentSettings.tsx` (tạo file):

```tsx
import { useState, type FormEvent } from "react";
import { SETTING_LIMITS, type NumberSetting } from "../game/settings";
import type { GameSettings } from "../game/state";
import type { Lang, QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { isValidPin } from "../storage/pin";
import { downloadText } from "./download";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

const NUMBER_FIELDS: { key: NumberSetting; label: MessageKey }[] = [
  { key: "dailyGoal", label: "settings.dailyGoal" },
  { key: "weeklyTarget", label: "settings.weeklyTarget" },
  { key: "graceDays", label: "settings.graceDays" },
  { key: "passPercent", label: "settings.passPercent" },
  { key: "helpPercent", label: "settings.helpPercent" },
  { key: "runSeconds", label: "settings.runSeconds" },
];

const QUESTION_LANGS: { value: QuestionLang; label: MessageKey }[] = [
  { value: "vi", label: "question.langVi" },
  { value: "en", label: "question.langEn" },
  { value: "both", label: "question.langBoth" },
];

/** Spec 9.5: vacation, goals and limits (*), languages, data (backup, PIN, delete) and the logs. */
export function ParentSettings() {
  return (
    <section className="parent-settings">
      <VacationSettings />
      <NumberSettings />
      <LanguageSettings />
      <DataSettings />
      <Logs />
    </section>
  );
}

function VacationSettings() {
  const { t } = useLang();
  const game = useGame();
  const { state, today } = game;
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [bad, setBad] = useState(false);
  const upcoming = state.vacation.ranges.filter((range) => range.end >= today);
  function schedule(event: FormEvent) {
    event.preventDefault();
    if (start === "" || end === "" || start < today || start > end) return setBad(true);
    setBad(false);
    game.dispatch({ type: "VacationScheduled", start, end });
    setStart("");
    setEnd("");
  }
  const on = state.vacation.since !== null;
  return (
    <div>
      <h2>{t("settings.vacationTitle")}</h2>
      <p>{on ? t("settings.vacationOn", { day: state.vacation.since as string }) : t("settings.vacationOff")}</p>
      <button onClick={() => game.dispatch({ type: "VacationToggled", on: !on })}>
        {t(on ? "settings.vacationStop" : "settings.vacationStart")}
      </button>
      {/* noValidate: the app checks the dates and shows its own message. */}
      <form onSubmit={schedule} className="settings-row" noValidate>
        <label>
          {t("settings.scheduleFrom")}
          <input type="date" value={start} min={today} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          {t("settings.scheduleTo")}
          <input type="date" value={end} min={today} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button type="submit">{t("settings.schedule")}</button>
      </form>
      {bad && <p role="alert">{t("settings.scheduleBad")}</p>}
      {upcoming.length > 0 && (
        <ul>
          {upcoming.map((range) => (
            <li key={`${range.start}-${range.end}`}>
              {t("settings.scheduled", { start: range.start, end: range.end })}{" "}
              <button onClick={() => game.dispatch({ type: "VacationCancelled", start: range.start })}>
                {t("settings.cancel")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NumberSettings() {
  const { t } = useLang();
  const game = useGame();
  const [values, setValues] = useState<Record<NumberSetting, string>>(
    () =>
      Object.fromEntries(NUMBER_FIELDS.map(({ key }) => [key, String(game.state.settings[key])])) as Record<
        NumberSetting,
        string
      >,
  );
  const [saved, setSaved] = useState(false);
  function save(event: FormEvent) {
    event.preventDefault();
    const patch: Partial<GameSettings> = {};
    for (const { key } of NUMBER_FIELDS) patch[key] = Number(values[key]);
    game.dispatch({ type: "SettingsChanged", patch });
    setSaved(true);
  }
  return (
    // noValidate: values outside the limits are brought inside them (cleanSettings).
    <form onSubmit={save} noValidate>
      <h2>{t("settings.goalsTitle")}</h2>
      {NUMBER_FIELDS.map(({ key, label }) => (
        <label key={key} className="settings-row">
          {t(label)}
          <input
            type="number"
            min={SETTING_LIMITS[key].min}
            max={SETTING_LIMITS[key].max}
            value={values[key]}
            onChange={(e) => {
              setSaved(false);
              setValues((current) => ({ ...current, [key]: e.target.value }));
            }}
          />
        </label>
      ))}
      <button className="primary" type="submit">
        {t("settings.save")}
      </button>
      {saved && <p role="status">{t("settings.saved")}</p>}
    </form>
  );
}

function LanguageSettings() {
  const { t, uiLang, setUiLang } = useLang();
  const game = useGame();
  return (
    <div>
      <h2>{t("settings.langTitle")}</h2>
      <label className="settings-row">
        {t("settings.uiLang")}
        {/* The game saves the interface language when it changes (GameProvider). */}
        <select value={uiLang} onChange={(e) => setUiLang(e.target.value as Lang)}>
          <option value="vi">{t("onboarding.langVi")}</option>
          <option value="en">{t("onboarding.langEn")}</option>
        </select>
      </label>
      <label className="settings-row">
        {t("settings.questionLang")}
        <select
          value={game.state.settings.questionLang}
          onChange={(e) =>
            game.dispatch({ type: "SettingsChanged", patch: { questionLang: e.target.value as QuestionLang } })
          }
        >
          {QUESTION_LANGS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function DataSettings() {
  const { t } = useLang();
  const game = useGame();
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [pinMessage, setPinMessage] = useState<MessageKey | null>(null);
  const [name, setName] = useState("");
  async function changePin(event: FormEvent) {
    event.preventDefault();
    if (!isValidPin(pin)) return setPinMessage("onboarding.errorPin");
    if (pin !== again) return setPinMessage("onboarding.errorPinMatch");
    await game.setPin(pin, false);
    setPin("");
    setAgain("");
    setPinMessage("settings.pinChanged");
  }
  return (
    <div>
      <h2>{t("settings.dataTitle")}</h2>
      <a className="button" href="#/backup">
        {t("settings.backupLink")}
      </a>
      <form onSubmit={changePin}>
        <h3>{t("settings.changePin")}</h3>
        <label className="settings-row">
          {t("parent.newPin")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} />
        </label>
        <label className="settings-row">
          {t("parent.newPinAgain")}
          <input type="password" inputMode="numeric" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
        </label>
        <button type="submit">{t("settings.changePin")}</button>
        {pinMessage && <p role="status">{t(pinMessage)}</p>}
      </form>
      <h3>{t("settings.erase")}</h3>
      <p>{t("settings.eraseNote")}</p>
      <label className="settings-row">
        {t("settings.eraseConfirm")}
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button className="danger" disabled={name.trim() !== game.profile.childName} onClick={() => void game.eraseAll()}>
        {t("settings.eraseButton")}
      </button>
    </div>
  );
}

function Logs() {
  const { t } = useLang();
  const game = useGame();
  const { warnings } = game.state;
  return (
    <div>
      <h2>{t("settings.logsTitle")}</h2>
      <h3>{t("settings.warnings")}</h3>
      {warnings.length === 0 ? (
        <p>{t("settings.noEntries")}</p>
      ) : (
        <ul>
          {warnings.map((warning) => (
            <li key={warning.at}>{t("settings.warningItem", { time: formatDateTime(warning.at) })}</li>
          ))}
        </ul>
      )}
      <h3>{t("settings.errors")}</h3>
      {game.errorLog.length === 0 ? (
        <p>{t("settings.noEntries")}</p>
      ) : (
        <>
          <ul className="error-log">
            {game.errorLog.map((entry, i) => (
              <li key={`${entry.at}-${i}`}>
                {formatDateTime(entry.at)} · {entry.kind} · {entry.detail}
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              downloadText(`py-pet-error-log-${game.today}.json`, JSON.stringify(game.errorLog, null, 2))
            }
          >
            {t("settings.exportLog")}
          </button>
        </>
      )}
    </div>
  );
}
```

Các file còn lại:

```diff
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index 4a4264e..99db016 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -352,4 +352,41 @@ export const en: Record<MessageKey, string> = {
   "rewardsTab.historyItem": "{time}: {name} ({price} coins), {status}",
   "rewardsTab.approvedStatus": "approved",
   "rewardsTab.rejectedStatus": "rejected",
+  "settings.vacationTitle": "Vacation mode",
+  "settings.vacationOn": "On vacation since {day}.",
+  "settings.vacationOff": "Not on vacation.",
+  "settings.vacationStart": "Start a vacation now",
+  "settings.vacationStop": "End the vacation",
+  "settings.scheduleFrom": "From",
+  "settings.scheduleTo": "To",
+  "settings.schedule": "Schedule a vacation",
+  "settings.scheduleBad": "The start must be today or later and not after the end.",
+  "settings.scheduled": "{start} to {end}",
+  "settings.cancel": "Cancel",
+  "settings.goalsTitle": "Goals and limits",
+  "settings.dailyGoal": "Daily goal (activity points)",
+  "settings.weeklyTarget": "Week plan (lessons)",
+  "settings.graceDays": "Absent days without a penalty",
+  "settings.passPercent": "Test pass mark (%)",
+  "settings.helpPercent": "\"Needs help\" below (% right)",
+  "settings.runSeconds": "Code run time limit (seconds)",
+  "settings.save": "Save the settings",
+  "settings.saved": "Settings saved.",
+  "settings.langTitle": "Languages",
+  "settings.uiLang": "Interface language",
+  "settings.questionLang": "Default question language",
+  "settings.dataTitle": "Data",
+  "settings.backupLink": "Back up and import",
+  "settings.changePin": "Change the PIN",
+  "settings.pinChanged": "PIN changed.",
+  "settings.erase": "Delete the profile",
+  "settings.eraseNote": "All progress, settings and the PIN on this device are deleted. Export a backup first. Type your child's name to confirm.",
+  "settings.eraseConfirm": "Your child's name",
+  "settings.eraseButton": "Delete everything",
+  "settings.logsTitle": "Logs",
+  "settings.warnings": "Clock warnings",
+  "settings.warningItem": "{time}: the device clock was set back",
+  "settings.errors": "Error log",
+  "settings.noEntries": "No entries.",
+  "settings.exportLog": "Export the error log",
 };
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index 60b2993..a7081b4 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -350,6 +350,43 @@ export const vi = {
   "rewardsTab.historyItem": "{time}: {name} ({price} xu), {status}",
   "rewardsTab.approvedStatus": "đã duyệt",
   "rewardsTab.rejectedStatus": "đã từ chối",
+  "settings.vacationTitle": "Chế độ nghỉ",
+  "settings.vacationOn": "Đang nghỉ từ {day}.",
+  "settings.vacationOff": "Không nghỉ.",
+  "settings.vacationStart": "Bật chế độ nghỉ ngay",
+  "settings.vacationStop": "Tắt chế độ nghỉ",
+  "settings.scheduleFrom": "Từ ngày",
+  "settings.scheduleTo": "Đến ngày",
+  "settings.schedule": "Lên lịch nghỉ",
+  "settings.scheduleBad": "Ngày bắt đầu phải từ hôm nay và không sau ngày kết thúc.",
+  "settings.scheduled": "{start} đến {end}",
+  "settings.cancel": "Hủy",
+  "settings.goalsTitle": "Mục tiêu và ngưỡng",
+  "settings.dailyGoal": "Mục tiêu mỗi ngày (điểm hoạt động)",
+  "settings.weeklyTarget": "Kế hoạch tuần (bài học)",
+  "settings.graceDays": "Số ngày vắng được miễn",
+  "settings.passPercent": "Ngưỡng đạt kiểm tra (%)",
+  "settings.helpPercent": "Ngưỡng \"Cần hỗ trợ\" (% câu đúng)",
+  "settings.runSeconds": "Giới hạn thời gian chạy code (giây)",
+  "settings.save": "Lưu cài đặt",
+  "settings.saved": "Đã lưu cài đặt.",
+  "settings.langTitle": "Ngôn ngữ",
+  "settings.uiLang": "Ngôn ngữ giao diện",
+  "settings.questionLang": "Ngôn ngữ câu hỏi mặc định",
+  "settings.dataTitle": "Dữ liệu",
+  "settings.backupLink": "Sao lưu và nhập file",
+  "settings.changePin": "Đổi mã PIN",
+  "settings.pinChanged": "Đã đổi mã PIN.",
+  "settings.erase": "Xóa hồ sơ",
+  "settings.eraseNote": "Mọi tiến độ, cài đặt và mã PIN trên máy này sẽ bị xóa. Hãy xuất file sao lưu trước. Gõ tên của con để xác nhận.",
+  "settings.eraseConfirm": "Tên của con",
+  "settings.eraseButton": "Xóa hết dữ liệu",
+  "settings.logsTitle": "Nhật ký",
+  "settings.warnings": "Cảnh báo đồng hồ",
+  "settings.warningItem": "{time}: đồng hồ máy bị chỉnh lùi",
+  "settings.errors": "Nhật ký lỗi",
+  "settings.noEntries": "Chưa có mục nào.",
+  "settings.exportLog": "Xuất nhật ký lỗi",
 } as const;
 
 export type MessageKey = keyof typeof vi;
diff --git a/src/styles.css b/src/styles.css
index 468211f..ca56166 100644
--- a/src/styles.css
+++ b/src/styles.css
@@ -184,3 +184,7 @@ a.button.primary { background: var(--primary); border-color: var(--primary); col
 .reward-rows input { width: 10em; }
 .parent-progress table { border-collapse: collapse; }
 .parent-progress th, .parent-progress td { border: 1px solid #dde3ef; padding: 4px 8px; text-align: left; }
+.settings-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 6px 0; }
+.parent-settings h2 { margin-top: 24px; }
+button.danger { background: #c62828; border-color: #c62828; color: #fff; }
+button.danger:disabled { opacity: 0.5; }
diff --git a/src/ui/ParentScreen.tsx b/src/ui/ParentScreen.tsx
index 77e6645..f115419 100644
--- a/src/ui/ParentScreen.tsx
+++ b/src/ui/ParentScreen.tsx
@@ -8,18 +8,20 @@ import { ParentHelp } from "./ParentHelp";
 import { ParentOverview } from "./ParentOverview";
 import { ParentProgress } from "./ParentProgress";
 import { ParentRewards } from "./ParentRewards";
+import { ParentSettings } from "./ParentSettings";
 
 /** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
 export const LOCK_AFTER_MS = 5 * 60_000;
 const LOCK_CHECK_MS = 10_000;
 
-type Tab = "overview" | "help" | "progress" | "rewards";
+type Tab = "overview" | "help" | "progress" | "rewards" | "settings";
 
 const TABS: { id: Tab; label: MessageKey }[] = [
   { id: "overview", label: "parent.tabOverview" },
   { id: "help", label: "parent.tabHelp" },
   { id: "progress", label: "parent.tabProgress" },
   { id: "rewards", label: "parent.tabRewards" },
+  { id: "settings", label: "parent.tabSettings" },
 ];
 
 export function ParentScreen() {
@@ -171,6 +173,7 @@ function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
       {tab === "help" && <ParentHelp />}
       {tab === "progress" && <ParentProgress />}
       {tab === "rewards" && <ParentRewards />}
+      {tab === "settings" && <ParentSettings />}
       <a href="#/">{t("nav.room")}</a>
     </main>
   );
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/ParentSettings.tsx src/ui/ParentSettings.test.tsx src/i18n/vi.ts src/i18n/en.ts src/styles.css src/ui/ParentScreen.tsx
git commit -m "feat(ui): the settings tab: vacation, goals and limits, languages, PIN, erase and logs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Việc chuyển từ M3a: bài sắp xếp, dữ liệu hỏng

**Files:**
- Modify: `src/ui/PuzzleExerciseView.tsx`, `src/ui/GameRoot.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`
- Test: `src/ui/PuzzleExerciseView.test.tsx`, `src/ui/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `ErrorLogEntry` kind `"load-failed"` (Task 2); `GameStore.appendErrorLog`, `readMeta`, `exportProfiles`; `downloadText`.
- Produces:
  - Bài sắp xếp dòng: sau khi chuyển 1 dòng, focus đi theo dòng đó (nút cùng hướng, hoặc nút kia khi nút cùng hướng bị tắt); khi đang chấm, nút chuyển dòng và ô điền đều bị tắt.
  - Mở app gặp dữ liệu hỏng hoặc không đọc được: ghi nhật ký lỗi `load-failed` (ghi hỏng thì bỏ qua) và hiện nút "Xuất dữ liệu để gửi hỗ trợ" (file `py-pet-data-YYYY-MM-DD.json`, JSON thô). Dữ liệu của app mới hơn thì không hiện nút.
  - Khóa i18n `app.exportRaw`, `app.exportRawFailed`.

- [ ] **Step 1: Viết test thất bại**

```diff
diff --git a/src/ui/AppRoutes.test.tsx b/src/ui/AppRoutes.test.tsx
index 3456d53..fec9f09 100644
--- a/src/ui/AppRoutes.test.tsx
+++ b/src/ui/AppRoutes.test.tsx
@@ -181,6 +181,19 @@ describe("App", () => {
     expect((await store.loadActive())?.state.version).toBe(99);
   });
 
+  test("a damaged profile is logged and its data can be exported as it is", async () => {
+    const store = new MemoryStore({ persistent: true });
+    const damaged = { ...initialGameState(TODAY), wallet: "lots" } as unknown as GameState;
+    await store.createProfile(testProfile(), damaged);
+    render(<App bundle={testBundle()} runnerClient={makeClient().client} store={store} clock={() => FIXED_NOW} />);
+    expect(await screen.findByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
+    await waitFor(async () => expect((await store.readMeta()).errorLog).toMatchObject([{ kind: "load-failed" }]));
+    await userEvent.click(screen.getByRole("button", { name: "Xuất dữ liệu để gửi hỗ trợ" }));
+    const [fileName, text] = vi.mocked(downloadText).mock.calls.at(-1)!;
+    expect(fileName).toBe("py-pet-data-2026-10-06.json");
+    expect(JSON.parse(text).profiles[0].state.wallet).toBe("lots");
+  });
+
   test("shows the other-tab message when the tab does not own the lock", async () => {
     render(<App bundle={testBundle()} runnerClient={makeClient().client} store={new MemoryStore()} ownsTab={false} />);
     expect(screen.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeInTheDocument();
diff --git a/src/ui/PuzzleExerciseView.test.tsx b/src/ui/PuzzleExerciseView.test.tsx
index 8bd397e..653e9c2 100644
--- a/src/ui/PuzzleExerciseView.test.tsx
+++ b/src/ui/PuzzleExerciseView.test.tsx
@@ -69,6 +69,29 @@ describe("PuzzleExerciseView: parsons", () => {
   });
 });
 
+describe("PuzzleExerciseView: keyboard and judging", () => {
+  test("the focus follows the moved line", async () => {
+    renderWithApp(<PuzzleExerciseView exercise={reviewParsons} onComplete={() => {}} rng={seededRng(1)} />, {
+      runner: echoRunner(),
+    });
+    screen.getByRole("button", { name: "Đưa dòng 2 lên" }).focus();
+    await userEvent.keyboard("{Enter}");
+    expect(lineTexts()).toEqual(['print("Hi")', 'print("Bye")']);
+    // Line 1 cannot go up any more, so its "down" button keeps the focus.
+    expect(screen.getByRole("button", { name: "Đưa dòng 1 xuống" })).toHaveFocus();
+  });
+
+  test("lines and blanks cannot change while the code is being judged", async () => {
+    let finish!: () => void;
+    const runner = fakeRunner(() => new Promise((resolve) => (finish = () => resolve(okResult("")))));
+    renderWithApp(<PuzzleExerciseView exercise={reviewParsons} onComplete={() => {}} rng={seededRng(1)} />, { runner });
+    await userEvent.click(submit());
+    expect(screen.getByRole("button", { name: "Đưa dòng 2 lên" })).toBeDisabled();
+    finish();
+    await waitFor(() => expect(screen.getByRole("button", { name: "Đưa dòng 2 lên" })).toBeEnabled());
+  });
+});
+
 describe("PuzzleExerciseView: saved stats", () => {
   test("restores hints, fails and the solution, and reports them on the next judged submit", async () => {
     const onComplete = vi.fn();
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/PuzzleExerciseView.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL: focus không theo dòng; chưa có nút xuất dữ liệu.

- [ ] **Step 3: Viết code**

`src/ui/GameRoot.tsx` (thay toàn bộ file):

```tsx
import { useEffect, useState } from "react";
import { localDay } from "../game/dates";
import { StateFormatError, upgradeGameState, type StateProblem } from "../game/migrate";
import { useLang } from "../i18n/LangProvider";
import type { GameStore, LoadedGame } from "../storage/types";
import { AppRoutes } from "./AppRoutes";
import { GameProvider } from "./GameProvider";
import { Header } from "./Header";
import { downloadText } from "./download";
import { OnboardingScreen } from "./OnboardingScreen";
import { Robot } from "./Robot";

export function GameRoot({ store, clock, onReplaced }: { store: GameStore; clock: () => Date; onReplaced(): void }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState<LoadedGame | null | undefined>(undefined);
  const [loadProblem, setLoadProblem] = useState<StateProblem | "unreadable" | null>(null);

  useEffect(() => {
    let alive = true;
    store.loadActive().then(
      (result) => {
        if (!alive) return;
        if (result === null) {
          setLoaded(null);
          return;
        }
        try {
          // Data saved by an older app is upgraded here; the first event writes it back.
          setLoaded({ ...result, state: upgradeGameState(result.state) });
        } catch (error) {
          const problem = error instanceof StateFormatError ? error.problem : "damaged";
          setLoadProblem(problem);
          logLoadFailure(store, clock, `${problem}: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
      (error: unknown) => {
        if (!alive) return;
        setLoadProblem("unreadable");
        logLoadFailure(store, clock, `unreadable: ${error instanceof Error ? error.message : String(error)}`);
      },
    );
    return () => {
      alive = false;
    };
  }, [store]);

  if (loadProblem !== null) {
    return (
      <>
        <Header />
        <main className="crash" role="alert">
          <Robot mood="sad" size={80} />
          <p>{t(loadProblem === "newer-version" ? "app.newerData" : "app.crash")}</p>
          <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
          {loadProblem !== "newer-version" && <RawExport store={store} clock={clock} />}
        </main>
      </>
    );
  }
  if (loaded === undefined) {
    return (
      <>
        <Header />
        <main className="room">
          <p>{t("app.loading")}</p>
        </main>
      </>
    );
  }
  if (loaded === null) {
    return (
      <>
        <Header />
        <OnboardingScreen store={store} clock={clock} onCreated={setLoaded} />
      </>
    );
  }
  return (
    <GameProvider store={store} loaded={loaded} clock={clock} onReplaced={onReplaced}>
      <AppRoutes />
    </GameProvider>
  );
}

/** Spec 10: a load failure goes to the error log, which the parent area shows. A failed write is ignored. */
function logLoadFailure(store: GameStore, clock: () => Date, detail: string): void {
  store.appendErrorLog({ at: clock().toISOString(), kind: "load-failed", detail }).catch(() => {});
}

/**
 * The saved data as it is, damaged state included, so a parent can keep it or send it for support before
 * anything is lost. It is plain JSON, not a .pypet file: a damaged state cannot be imported.
 */
function RawExport({ store, clock }: { store: GameStore; clock: () => Date }) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  async function exportRaw() {
    setFailed(false);
    try {
      const data = { exportedAt: clock().toISOString(), meta: await store.readMeta(), profiles: await store.exportProfiles() };
      downloadText(`py-pet-data-${localDay(clock())}.json`, JSON.stringify(data, null, 2));
    } catch {
      setFailed(true);
    }
  }
  return (
    <>
      <button onClick={() => void exportRaw()}>{t("app.exportRaw")}</button>
      {failed && <p>{t("app.exportRawFailed")}</p>}
    </>
  );
}
```

Các file còn lại:

```diff
diff --git a/src/i18n/en.ts b/src/i18n/en.ts
index 99db016..212565f 100644
--- a/src/i18n/en.ts
+++ b/src/i18n/en.ts
@@ -389,4 +389,6 @@ export const en: Record<MessageKey, string> = {
   "settings.errors": "Error log",
   "settings.noEntries": "No entries.",
   "settings.exportLog": "Export the error log",
+  "app.exportRaw": "Export the data for support",
+  "app.exportRawFailed": "The data could not be exported.",
 };
diff --git a/src/i18n/vi.ts b/src/i18n/vi.ts
index a7081b4..0eb7c40 100644
--- a/src/i18n/vi.ts
+++ b/src/i18n/vi.ts
@@ -387,6 +387,8 @@ export const vi = {
   "settings.errors": "Nhật ký lỗi",
   "settings.noEntries": "Chưa có mục nào.",
   "settings.exportLog": "Xuất nhật ký lỗi",
+  "app.exportRaw": "Xuất dữ liệu để gửi hỗ trợ",
+  "app.exportRawFailed": "Chưa xuất được dữ liệu.",
 } as const;
 
 export type MessageKey = keyof typeof vi;
diff --git a/src/ui/PuzzleExerciseView.tsx b/src/ui/PuzzleExerciseView.tsx
index 5b8dc0c..9c6adf8 100644
--- a/src/ui/PuzzleExerciseView.tsx
+++ b/src/ui/PuzzleExerciseView.tsx
@@ -1,4 +1,4 @@
-import { Fragment, useEffect, useState } from "react";
+import { Fragment, useEffect, useRef, useState } from "react";
 import { fillTemplate } from "../content/exercise";
 import { FILL_BLANK, type FillExercise, type ParsonsExercise } from "../content/types";
 import { isPseudoError, problemFromOutcome } from "../explain/problem";
@@ -60,12 +60,26 @@ export function PuzzleExerciseView({
     if (initialStats?.viewedSolution) onComplete("viewed-solution");
   }, []);
 
+  const linesRef = useRef<HTMLOListElement>(null);
+  /** The line whose button keeps the focus after a move, so the keyboard follows the moved line. */
+  const [focusLine, setFocusLine] = useState<{ index: number; dir: "up" | "down" } | null>(null);
+
+  useEffect(() => {
+    if (!focusLine) return;
+    const row = linesRef.current?.querySelectorAll("li")[focusLine.index];
+    const wanted = row?.querySelector<HTMLButtonElement>(`button[data-dir="${focusLine.dir}"]`);
+    const other = row?.querySelector<HTMLButtonElement>(`button[data-dir="${focusLine.dir === "up" ? "down" : "up"}"]`);
+    (wanted && !wanted.disabled ? wanted : other)?.focus();
+    setFocusLine(null);
+  }, [focusLine]);
+
   function move(index: number, step: -1 | 1) {
     setLines((current) => {
       const next = [...current];
       [next[index], next[index + step]] = [next[index + step] as string, next[index] as string];
       return next;
     });
+    setFocusLine({ index: index + step, dir: step === -1 ? "up" : "down" });
   }
 
   async function handleSubmit() {
@@ -126,16 +140,22 @@ export function PuzzleExerciseView({
         </div>
       )}
       {exercise.type === "parsons" ? (
-        <ol className="parsons-lines" aria-label={t("parsons.lines")}>
+        <ol className="parsons-lines" aria-label={t("parsons.lines")} ref={linesRef}>
           {lines.map((line, i) => (
             <li key={i}>
               <pre className="parsons-line">{line}</pre>
-              <button aria-label={t("parsons.up", { n: i + 1 })} disabled={solved || i === 0} onClick={() => move(i, -1)}>
+              <button
+                data-dir="up"
+                aria-label={t("parsons.up", { n: i + 1 })}
+                disabled={busy || solved || i === 0}
+                onClick={() => move(i, -1)}
+              >
                 ↑
               </button>
               <button
+                data-dir="down"
                 aria-label={t("parsons.down", { n: i + 1 })}
-                disabled={solved || i === lines.length - 1}
+                disabled={busy || solved || i === lines.length - 1}
                 onClick={() => move(i, 1)}
               >
                 ↓
@@ -152,7 +172,7 @@ export function PuzzleExerciseView({
                   <input
                     aria-label={t("fill.blank", { n: i })}
                     value={blanks[i - 1]}
-                    disabled={solved}
+                    disabled={busy || solved}
                     spellCheck={false}
                     size={Math.max(4, (blanks[i - 1] ?? "").length + 1)}
                     onChange={(event) => {
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/PuzzleExerciseView.tsx src/ui/PuzzleExerciseView.test.tsx src/ui/GameRoot.tsx src/ui/AppRoutes.test.tsx src/i18n/vi.ts src/i18n/en.ts
git commit -m "fix(ui): parsons focus follows the moved line, no edits while judging, export damaged data

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: E2E và kiểm tra toàn bộ

**Files:**
- Create: `e2e/parent.spec.ts`

**Interfaces:**
- Consumes: toàn bộ Task 1–8.
- Produces: 2 e2e:
  - `the parent adds a reward, the child asks for it, the parent approves it with the PIN`;
  - `the parent switches the vacation on and the room shows it`.

- [ ] **Step 1: Viết test e2e**

`e2e/parent.spec.ts` (tạo file):

```ts
import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}

async function openParentArea(page: Page) {
  await page.getByRole("link", { name: "Khu phụ huynh" }).click();
  await page.getByLabel("Mã PIN").fill("1234");
  await page.getByRole("button", { name: "Mở" }).click();
  await expect(page.getByRole("tab", { name: "Tổng quan" })).toBeVisible();
}

test("the parent adds a reward, the child asks for it, the parent approves it with the PIN", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type('print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("link", { name: "Py-Pet" }).click();
  await expect(page.getByText("Xu: 8")).toBeVisible();

  await openParentArea(page);
  await page.getByRole("tab", { name: "Phần thưởng" }).click();
  await page.getByRole("button", { name: "Thêm phần thưởng" }).click();
  await page.getByLabel("Tên").fill("Đọc truyện cùng bố");
  await page.getByLabel("Giá (xu)").fill("5");
  await page.getByRole("button", { name: "Lưu danh sách" }).click();
  await expect(page.getByText("Đã lưu danh sách.")).toBeVisible();
  await page.getByRole("button", { name: "Khóa" }).click();
  await page.getByRole("link", { name: "Về phòng" }).click();

  await page.getByRole("link", { name: "Cửa hàng" }).click();
  await page.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }).click();
  await page.getByRole("button", { name: "Đổi Đọc truyện cùng bố" }).click();
  await expect(page.getByText("Chờ bố mẹ duyệt")).toBeVisible();
  await page.getByRole("link", { name: "Về phòng" }).click();

  await openParentArea(page);
  await expect(page.getByText("1 yêu cầu đổi thưởng chờ duyệt")).toBeVisible();
  await page.getByRole("tab", { name: "Phần thưởng" }).click();
  await page.getByRole("button", { name: "Duyệt Đọc truyện cùng bố" }).click();
  await expect(page.getByText("Không có yêu cầu nào.")).toBeVisible();
  await page.getByRole("link", { name: "Về phòng" }).click();
  await expect(page.getByText("Xu: 3")).toBeVisible();
});

test("the parent switches the vacation on and the room shows it", async ({ page }) => {
  await startApp(page);
  await openParentArea(page);
  await page.getByRole("tab", { name: "Cài đặt" }).click();
  await page.getByRole("button", { name: "Bật chế độ nghỉ ngay" }).click();
  await expect(page.getByText(/^Đang nghỉ từ \d{4}-\d{2}-\d{2}\.$/)).toBeVisible();
  await page.getByRole("link", { name: "Về phòng" }).click();
  await expect(page.getByText("Robo đang đi nghỉ. Con vẫn học được nếu muốn!")).toBeVisible();
  await expect(page.getByRole("img", { name: "Robo" }).first()).toHaveAttribute("data-mood", "vacation");
});
```

- [ ] **Step 2: Chạy e2e**

Run: `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; npx playwright test e2e/parent.spec.ts`
Expected: 2 passed. Nếu thất bại, đọc `test-results/*/error-context.md`.

- [ ] **Step 3: Chạy kiểm tra toàn bộ**

Run: `npm run check`
Expected: typecheck không lỗi; Vitest 610 passed; pytest 21 passed; kiểm tra nội dung qua (có các dòng "Cảnh báo:" như trước); Playwright 14 passed.

- [ ] **Step 4: Commit**

```bash
git add e2e/parent.spec.ts
git commit -m "test(e2e): the parent approves a reward with the PIN and switches the vacation on

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
