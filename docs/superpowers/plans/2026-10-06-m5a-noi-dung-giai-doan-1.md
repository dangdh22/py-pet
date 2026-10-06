# M5a – Nội dung giai đoạn 1: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giai đoạn 1 "Khởi động" có đủ 4 chủ đề của spec 12.1 (khoảng 18 bài học): làm quen với chương trình (đã có, bổ sung bài luyện mức 2 và câu hỏi AI), `print` và chuỗi, chú thích và đọc thông báo lỗi, `print` nhiều giá trị (`sep`, `end`). Ngân hàng câu hỏi của giai đoạn đủ cho đề tiến hóa (ít nhất 30 câu, ít nhất 3 câu AI, ít nhất 3 bài code dùng trong đề); mọi khái niệm có thẻ hiểu lầm, gợi ý cho phụ huynh và bài luyện đủ mức. `npm run content:build` không còn dòng "Cảnh báo:" nào.

**Architecture:** Gần như toàn bộ là nội dung trong `content/stage-1/` (định dạng của spec 3 và M1–M3: file bài học `.md` có phần đầu YAML, `topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml`). 2 thay đổi code nhỏ ở Task 1: bản ghi kiểm tra giữ điểm trong `[0, max]` và quy đổi điểm cao nhất khi cỡ đề đổi (nội dung mới làm đề kiểm tra chủ đề đủ cỡ hơn); khái niệm AI chỉ cần bài luyện mức 1 (kiến thức AI không có bài sắp xếp code hay bài viết code). Nội dung được soạn theo yêu cầu trong kế hoạch, không chép từ bản nháp: mỗi task nội dung tự kiểm bằng `npm run content:validate` và test hiện có.

**Tech Stack:** Như M4b. Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md` (chính: mục 3, 4.3, 7, 12.1)

## Global Constraints

- Phạm vi M5a: nội dung giai đoạn 1 và 2 thay đổi code của Task 1. Ngoài phạm vi (đừng làm): giai đoạn 2–4 (M5b–M5d), biến luật 8 và 9 thành lỗi (cuối M5d), hình robot (M6), sửa giao diện.
- ID đã phát hành không được đổi (spec 3.8): mọi ID trong `content/stage-1/01-lam-quen/` giữ nguyên; chỉ thêm ID mới.
- Không đổi `GAME_STATE_VERSION` (4) và `SCHEMA_VERSION` (4). Không sinh lại file mẫu `src/storage/fixtures/*.pypet`.
- Sau mỗi task nội dung: `npm run content:validate` qua (CPython chạy lời giải, test, ví dụ `run`, `predict`, `common_wrong`); `npx vitest run` và `npm run typecheck` qua.
- Không gọi mạng. Không dùng Gemini.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy.
- Mốc xanh trước khi bắt đầu: `npm run check` sau M4b (Vitest 619, pytest 21, e2e 14). Sau M5a: Vitest 622, pytest 21, e2e 14. Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e.

## Quy tắc soạn nội dung (mọi task nội dung)

Người đọc là học sinh lớp 6 (11 tuổi) ở Việt Nam, mới học lập trình lần đầu. Phụ huynh sẽ duyệt và chỉnh lời văn sau (spec 3.10), nhưng bản nháp phải dùng được ngay.

1. **Lời văn:** tiếng Việt chuẩn, câu ngắn, mỗi câu 1 ý, gọi học sinh là "con", giọng thân thiện như trong `content/stage-1/01-lam-quen/`. Từ chuyên môn lần đầu xuất hiện thì in đậm và giải thích bằng ví dụ đời thường. Không dùng từ lóng, không dùng emoji. Ví dụ trong bài dùng robot "Robo" như chủ đề 1.
2. **Chỉ dùng kiến thức đã học:** giai đoạn 1 chưa có biến, `input()`, `if`, vòng lặp, hàm tự viết. Code trong bài chỉ dùng `print`, chuỗi, số nguyên, phép `+` và `*` trên chuỗi, phép tính số đơn giản (`+ - *`), chú thích `#`, `sep`, `end`. Chủ đề sau được dùng kiến thức của chủ đề trước, không ngược lại.
3. **Bài học** (file `NN-ten-bai.md`, spec 3.3): 2 đến 4 thẻ lý thuyết, mỗi thẻ 1 ý, có ít nhất 1 ví dụ ` ```python run` (ví dụ cố ý gây lỗi dùng ` ```python run expect-error`). Mỗi bài có 2 đến 4 bài tập trong phần đầu YAML: ít nhất 1 bài `code` và ít nhất 1 câu `predict` hoặc `mcq`; được thêm `parsons`, `fill`. Bài làm được trong 5 đến 10 phút.
4. **Bài `code`:** đề nói rõ đầu ra cần in (đầu ra mong đợi hiện ở phần Ví dụ). `starter` là dòng chú thích hướng dẫn, hoặc code có lỗi cho bài "sửa lỗi"; `starter` không được qua toàn bộ test. 2 gợi ý, gợi ý sau cụ thể hơn gợi ý trước. Thêm `common_wrong` (có `sample` chạy ra đúng đầu ra sai, gắn `misconception`) khi có lỗi sai điển hình của khái niệm. Mỗi chủ đề có ít nhất 3 bài `code` có `test_eligible: true`; các bài này có đủ `prompt.en` và gợi ý có `en`.
5. **Câu `predict`/`mcq`** (spec 3.5): đủ `vi` và `en` cho đề, lựa chọn chữ, giải thích; lựa chọn là đầu ra của code dùng `text`. 4 lựa chọn, đúng 1 lựa chọn đúng; lựa chọn sai điển hình gắn `misconception` (ID khái niệm có thẻ hiểu lầm); lựa chọn "báo lỗi" có `error: true`. Code trong câu hỏi dùng chuỗi trung tính (tiếng Anh ngắn, số, ký hiệu), không in chuỗi tiếng Việt, để 1 đoạn code dùng chung cho 2 ngôn ngữ. Câu `predict` phải có đúng 1 lựa chọn khớp đầu ra thật (validator chạy code). Mỗi câu ghi `lessons` (bài học đầu tiên dạy đủ kiến thức để trả lời) và `concepts`.
6. **`questions.yaml`** của mỗi chủ đề mới: ít nhất 10 câu `predict`/`mcq` (ID `<topic>.b1`, `b2`, ...), trộn câu đọc code và câu kiến thức, phủ mọi khái niệm của chủ đề. Tổng câu hỏi của chủ đề (trong bài học và ngân hàng) ít nhất 14.
7. **`concepts.yaml`** (spec 3.6): 4 đến 6 khái niệm, ID tiếng Anh không dấu, duy nhất trong toàn bộ nội dung (kiểm tra bằng `grep -rn "id: <id>" content/`). Mỗi khái niệm có `name` (vi, en), `misconception_card` (Markdown tiếng Việt, 2 đến 4 câu, nêu hiểu lầm hay gặp rồi sửa lại, có ví dụ code ngắn), `parent_tip` (1 đến 2 câu, 1 hoạt động ngoài đời không cần máy tính), `practice`: `level1` ít nhất 2 câu `predict`/`mcq`, `level2` ít nhất 1 bài `parsons`/`fill`, `level3` ít nhất 1 bài `code`. Bài luyện phải gắn khái niệm đó trong `concepts`.
8. **`practice.yaml`:** bài `parsons`/`fill` (ID `<topic>.p1`, `p2`, ...) và bài `code` thêm (ID `<topic>.c1`, ...) không thuộc bài học nào, dùng cho bậc thang mức 2–3. Bài `parsons` có ít nhất 3 dòng khác nhau và chỉ 1 thứ tự đúng ra đầu ra mong đợi; bài `fill` có 1 đến 3 chỗ trống `___`.
9. **`topic.yaml`:** `id`, `title` (vi, en), danh sách bài học, trạm ôn sau mỗi 2 đến 3 bài (`reviews`, ID `<topic>.r1`, `r2`). Không ghi `test` (mặc định 8 câu và 2 bài code).
10. **Từ điển lỗi** (`content/errors/errors.yaml`): chỉ thêm mục mới khi bài học cố ý cho học sinh gặp 1 lỗi mà từ điển chưa giải thích được (chạy thử code lỗi trong ứng dụng hoặc bằng validator). Mục mới đặt trước mục chung của cùng loại lỗi và có `sample`.
11. **Không chép** nội dung có bản quyền (thư mục `ref/` không có trong phiên cloud và không được dùng).

## Review Focus

1. Điểm kiểm tra không vượt `max`, không âm, và điểm cao nhất được quy đổi khi cỡ đề đổi. Test: Task 1.
2. Nội dung đúng về Python: mọi đầu ra trong lời văn, giải thích và lựa chọn khớp với CPython (validator kiểm phần chạy được; reviewer đọc phần lời văn).
3. Phù hợp học sinh lớp 6: chỉ dùng kiến thức đã học (quy tắc 2), lời văn ngắn, rõ, không gây hiểu sai.
4. `npm run content:build` không còn "Cảnh báo:" cho giai đoạn 1 sau Task 6.

## Quyết định thiết kế

Spec chỉ nêu tên chủ đề và số bài ước tính; kế hoạch chốt như dưới đây (chưa được người bảo trì duyệt, ghi trong `docs/superpowers/DECISIONS.md`).

1. **M5 chia theo giai đoạn** thành M5a–M5d, mỗi phần 1 kế hoạch, 1 nhánh, merge vào `main` sau khi xong (spec 12.3: mỗi giai đoạn soạn, kiểm tra, phụ huynh duyệt).
2. **Dàn ý giai đoạn 1** (3 chủ đề mới, 14 bài, tổng 18 bài với chủ đề 1): xem Task 3–5. Thứ tự chủ đề theo spec 12.1.
3. **Khái niệm AI chỉ cần bài luyện mức 1** (không có bài sắp xếp code hay bài viết code về kiến thức AI). Luật 8 của spec 3.9 được hiểu theo cách này.
4. **Điểm cao nhất của kiểm tra chủ đề được quy đổi** theo cỡ đề mới khi cỡ đề đổi (ví dụ 6/6 thành 14/14), để con không bị coi là tụt điểm vì nội dung có thêm câu.
5. **Luật 8 và 9 vẫn là cảnh báo** cho tới cuối M5d (giai đoạn 2–4 chưa có nội dung).
6. **E2E "thi tiến hóa chưa đạt → ôn → thi lại"** vẫn kiểm bằng test tích hợp jsdom: đi hết 18 bài trong Playwright quá chậm cho `npm run check`.
7. **Câu hỏi AI thêm vào chủ đề 1** (khái niệm `ai-basics` đã có), không tạo khái niệm AI mới cho giai đoạn 1.

---

## File Structure

```
src/game/apply.ts, apply.test.ts           (sửa, Task 1) điểm kiểm tra trong [0, max], quy đổi điểm cao nhất
tools/content/coverage.ts, buildBundle.test.ts  (sửa, Task 1) khái niệm AI chỉ cần mức 1
content/stage-1/
  stage.yaml                (sửa) thêm 3 chủ đề
  01-lam-quen/              (sửa, Task 2) thêm practice.yaml, câu AI, danh sách bài luyện
  02-chuoi/                 (mới, Task 3) print và chuỗi, 5 bài
  03-chu-thich-loi/         (mới, Task 4) chú thích và đọc thông báo lỗi, 4 bài
  04-print-nhieu/           (mới, Task 5) in nhiều giá trị, sep và end, 5 bài
content/errors/errors.yaml  (có thể sửa, Task 4) chỉ khi cần mục mới
e2e/exam.spec.ts            (sửa, Task 3) sau kiểm tra chủ đề 1 là chủ đề 2
docs/superpowers/content-stage-1.md  (mới, Task 6) bảng tổng hợp nội dung để phụ huynh duyệt
```

Mỗi thư mục chủ đề mới có: `topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml` và các file bài học `NN-ten-bai.md`. Xem chủ đề 1 (`content/stage-1/01-lam-quen/`) làm mẫu định dạng; test `tools/content/buildBundle.test.ts` có mẫu `parsons`, `fill` và `practice.yaml`.

---

### Task 1: Điểm kiểm tra trong [0, max]; khái niệm AI chỉ cần mức 1

**Files:**
- Modify: `src/game/apply.ts`, `tools/content/coverage.ts`
- Test: `src/game/apply.test.ts`, `tools/content/buildBundle.test.ts`

**Interfaces:**
- Consumes: `TopicTestRecord` (`src/game/state.ts`), `isPass`, `contentWarnings`.
- Produces:
  - `TopicTestCompleted` và `EvolutionTestCompleted` ghi điểm đã giới hạn trong `[0, max]` (điểm không phải số thành 0) và xét đạt trên điểm đó.
  - Điểm cao nhất của kiểm tra chủ đề làm ở đề cỡ khác được quy đổi theo cỡ đề mới, làm tròn 2 chữ số, không vượt `max`.
  - `contentWarnings`: khái niệm có `ai: true` chỉ cần `practice.level1`.

- [ ] **Step 1: Viết test thất bại**

```diff
diff --git a/src/game/apply.test.ts b/src/game/apply.test.ts
index 9933ac8..ad9f325 100644
--- a/src/game/apply.test.ts
+++ b/src/game/apply.test.ts
@@ -578,6 +578,29 @@ describe("tests", () => {
     expect(again.progress.topicTests.t1!.best).toBe(14);
   });
 
+  test("a test score stays inside [0, max]", () => {
+    const start = initialGameState("2026-10-06");
+    const high = apply(start, topicTest(20), at("2026-10-06"));
+    expect(high.progress.topicTests.t1).toMatchObject({ best: 14, max: 14, passed: true });
+    const low = apply(start, topicTest(-3), at("2026-10-06"));
+    expect(low.progress.topicTests.t1).toMatchObject({ best: 0, passed: false });
+    const nan = apply(start, evolution(Number.NaN), at("2026-10-06"));
+    expect(nan.progress.evolutionTests[0]).toMatchObject({ score: 0, passed: false });
+    const over = apply(start, evolution(30), at("2026-10-06"));
+    expect(over.progress.evolutionTests[0]).toMatchObject({ score: 24, passed: true });
+  });
+
+  test("a best score from a paper of another size is rescaled to the new paper", () => {
+    const start = initialGameState("2026-10-06");
+    const small = apply(start, topicTest(6, 6), at("2026-10-06"));
+    const bigger = apply(small, topicTest(4, 14), at("2026-10-07"));
+    expect(bigger.progress.topicTests.t1).toMatchObject({ best: 14, max: 14, attempts: 2, passed: true });
+    const half = apply(apply(start, topicTest(3, 6), at("2026-10-06")), topicTest(5, 14), at("2026-10-07"));
+    expect(half.progress.topicTests.t1).toMatchObject({ best: 7, max: 14 });
+    const thirds = apply(apply(start, topicTest(1, 3), at("2026-10-06")), topicTest(0, 14), at("2026-10-07"));
+    expect(thirds.progress.topicTests.t1?.best).toBe(4.67);
+  });
+
   test("a failed evolution test opens the focused review set and takes nothing away", () => {
     const start = initialGameState("2026-10-06");
     start.pet.xp = 120;
diff --git a/tools/content/buildBundle.test.ts b/tools/content/buildBundle.test.ts
index 3e5f3c1..e55482e 100644
--- a/tools/content/buildBundle.test.ts
+++ b/tools/content/buildBundle.test.ts
@@ -316,6 +316,25 @@ describe("buildBundle", () => {
     );
   });
 
+  test("an AI concept needs practice at level 1 only", () => {
+    const concepts = [
+      "concepts:",
+      "  - id: print-call",
+      "    name: { vi: Lệnh print }",
+      "  - { id: ai-x, name: { vi: A }, ai: true, misconception_card: C, parent_tip: T, practice: { level1: [s1.a.b1] } }",
+      "  - { id: ai-y, name: { vi: B }, ai: true, misconception_card: C, parent_tip: T }",
+      "",
+    ].join("\n");
+    const tree = minimalTree({ "stage-1/01-a/concepts.yaml": concepts });
+    tree["stage-1/01-a/questions.yaml"] = (tree["stage-1/01-a/questions.yaml"] as string).replace(
+      "    type: mcq\n",
+      "    type: mcq\n    concepts: [ai-x]\n",
+    );
+    const warnings = contentWarnings(buildBundle(writeTree(tree)));
+    expect(warnings.filter((w) => w.startsWith("ai-x"))).toEqual([]);
+    expect(warnings).toContain("ai-y: thiếu bài luyện level1");
+  });
+
   test("warns when a bank is too small for its tests (spec 3.9 rule 9)", () => {
     const bundle = buildBundle(writeTree(minimalTree()));
     expect(contentWarnings(bundle).slice(1)).toEqual([
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/game/apply.test.ts tools/content/buildBundle.test.ts`
Expected: FAIL: 3 test mới (`a test score stays inside [0, max]`, `a best score from a paper of another size is rescaled to the new paper`, `an AI concept needs practice at level 1 only`).

- [ ] **Step 3: Viết code**

```diff
diff --git a/src/game/apply.ts b/src/game/apply.ts
index d774cb8..b956707 100644
--- a/src/game/apply.ts
+++ b/src/game/apply.ts
@@ -25,6 +25,7 @@ import {
   type GameSettings,
   type GameState,
   type RewardItem,
+  type TopicTestRecord,
 } from "./state";
 import { cleanCatalog, freeXu, requestBlock, trimRequests } from "./realRewards";
 import { cleanSettings } from "./settings";
@@ -392,12 +393,28 @@ function raiseVui(s: GameState): void {
 }
 
 /** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
+/** A test score inside [0, max]; a score that is not a number counts as 0. */
+function testScore(score: number, max: number): number {
+  return Number.isFinite(score) ? Math.min(max, Math.max(0, score)) : 0;
+}
+
+/**
+ * The best score of earlier papers on the scale of a paper worth `max` (spec 6.7: new content can change the size of
+ * a topic test, so a best score of 6 of 6 becomes 14 of 14, not 6 of 14).
+ */
+function rescaledBest(previous: TopicTestRecord | undefined, max: number): number {
+  if (!previous || previous.max <= 0) return 0;
+  if (previous.max === max) return previous.best;
+  return Math.round(((previous.best * max) / previous.max) * 100) / 100;
+}
+
 function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
   const previous = s.progress.topicTests[e.topicId];
-  const passed = isPass(e.score, e.max, s.settings.passPercent);
+  const score = testScore(e.score, e.max);
+  const passed = isPass(score, e.max, s.settings.passPercent);
   s.progress.topicTests[e.topicId] = {
     attempts: (previous?.attempts ?? 0) + 1,
-    best: Math.max(previous?.best ?? 0, e.score),
+    best: Math.min(e.max, Math.max(rescaledBest(previous, e.max), score)),
     max: e.max,
     passed: passed || (previous?.passed ?? false),
     lastItems: e.items,
@@ -418,11 +435,12 @@ function completeEvolutionTest(
   e: Extract<GameEvent, { type: "EvolutionTestCompleted" }>,
   now: Date,
 ): void {
-  const passed = isPass(e.score, e.max, s.settings.passPercent);
+  const score = testScore(e.score, e.max);
+  const passed = isPass(score, e.max, s.settings.passPercent);
   s.progress.evolutionTests.push({
     at: now.toISOString(),
     stage: e.stage,
-    score: e.score,
+    score,
     max: e.max,
     passed,
     items: e.items,
diff --git a/tools/content/coverage.ts b/tools/content/coverage.ts
index 4ce3cb4..b663e09 100644
--- a/tools/content/coverage.ts
+++ b/tools/content/coverage.ts
@@ -32,8 +32,8 @@ function testWarnings(bundle: ContentBundle): string[] {
 }
 
 /**
- * Spec 3.9 rule 8: every concept has a misconception card, a parent tip and practice at the 3 levels. The content
- * of M5 completes it, so a gap is a warning for now, not an error.
+ * Spec 3.9 rule 8: every concept has a misconception card, a parent tip and practice at the 3 levels. An AI concept
+ * (knowledge, no code) needs only level 1. The content of M5 completes it, so a gap is a warning for now, not an error.
  */
 export function contentWarnings(bundle: ContentBundle): string[] {
   const warnings: string[] = [];
@@ -41,7 +41,8 @@ export function contentWarnings(bundle: ContentBundle): string[] {
     const missing: string[] = [];
     if (concept.misconceptionCard === null) missing.push("thẻ hiểu lầm");
     if (concept.parentTip === null) missing.push("gợi ý cho phụ huynh");
-    for (const level of ["level1", "level2", "level3"] as const) {
+    const levels = concept.ai ? (["level1"] as const) : (["level1", "level2", "level3"] as const);
+    for (const level of levels) {
       if (concept.practice[level].length === 0) missing.push(`bài luyện ${level}`);
     }
     if (missing.length > 0) warnings.push(`${concept.id}: thiếu ${missing.join(", ")}`);
```

- [ ] **Step 4: Chạy test, xác nhận qua**

Run: `npx vitest run && npm run typecheck`
Expected: PASS (Vitest 622).

- [ ] **Step 5: Commit**

```bash
git add src/game/apply.ts src/game/apply.test.ts tools/content/coverage.ts tools/content/buildBundle.test.ts
git commit -m "fix(game): test scores stay inside [0, max] and a best score follows the paper size; AI concepts need level 1 only

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Hoàn thiện chủ đề 1 "Làm quen với chương trình"

**Files:**
- Create: `content/stage-1/01-lam-quen/practice.yaml`
- Modify: `content/stage-1/01-lam-quen/questions.yaml`, `content/stage-1/01-lam-quen/concepts.yaml`

**Interfaces:**
- Consumes: khái niệm của chủ đề 1 (`run-order`, `print-call`, `string-quotes`, `case-sensitive`, `read-error`, `ai-basics`); quy tắc soạn nội dung ở đầu kế hoạch.
- Produces:
  - `practice.yaml` với bài `parsons`/`fill` `s1.lam-quen.p1`, `p2`, ...: mỗi khái niệm không phải AI có ít nhất 1 bài mức 2 (tổng ít nhất 6 bài).
  - Ít nhất 3 câu `mcq` mới về AI (`s1.lam-quen.b9`, `b10`, `b11`, `concepts: [ai-basics]`, `lessons: [s1.lam-quen.l1]`): AI học từ rất nhiều ví dụ; AI có thể sai và con người cần kiểm tra lại; phân biệt việc dùng AI và việc chỉ làm theo quy tắc cố định. Giai đoạn 1 có ít nhất 5 câu AI.
  - `concepts.yaml`: thêm `level2` cho 5 khái niệm không phải AI và thêm câu AI mới vào `ai-basics.level1`. Không đổi ID, tên, thẻ hay gợi ý đã có.

- [ ] **Step 1: Soạn nội dung** theo quy tắc soạn nội dung 5, 7, 8. Đầu ra của bài `parsons`/`fill` dùng chuỗi ngắn (ví dụ "Robo", "Py", "Pet"). Không đổi bài học và câu hỏi đã có.

- [ ] **Step 2: Kiểm tra**

Run: `npm run content:validate && npm run content:build 2>&1 | grep "Cảnh báo" ; npx vitest run && npm run typecheck`
Expected: validate qua; không còn cảnh báo nào về khái niệm của chủ đề 1 và cảnh báo "có 2 câu AI" không còn (cảnh báo về cỡ ngân hàng của giai đoạn 1 vẫn còn tới Task 5); Vitest 622.

- [ ] **Step 3: Commit**

```bash
git add content/stage-1/01-lam-quen
git commit -m "content(s1): level 2 practice and AI questions for the first topic

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Chủ đề 2 "print và chuỗi"

**Files:**
- Create: `content/stage-1/02-chuoi/` (`topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml`, 5 file bài học)
- Modify: `content/stage-1/stage.yaml` (thêm `02-chuoi` sau `01-lam-quen`), `e2e/exam.spec.ts`

**Interfaces:**
- Consumes: kiến thức chủ đề 1 (print, dấu nháy đơn/kép, chữ hoa/thường, lệnh chạy từ trên xuống, đọc lỗi); quy tắc soạn nội dung.
- Produces:
  - Chủ đề `s1.chuoi`, `title: { vi: "print và chuỗi", en: "print and strings" }`.
  - 5 bài học (ID và tên bài cố định; nội dung theo mục tiêu):

    | File | ID | Tên (vi / en) | Mục tiêu |
    |---|---|---|---|
    | `01-chuoi-la-gi.md` | `s1.chuoi.l1` | Chuỗi là gì? / What is a string? | **Chuỗi** là dãy ký tự trong dấu nháy; dấu cách, dấu câu, chữ số trong chuỗi được in y nguyên; `print()` in 1 dòng trống; `"5"` là chữ, không phải số. |
    | `02-dau-nhay-trong-chuoi.md` | `s1.chuoi.l2` | Dấu nháy bên trong chuỗi / Quotes inside a string | Muốn in dấu `'` thì bao chuỗi bằng `"` và ngược lại; dấu `\"`, `\'` cho trường hợp cần cả 2 loại. |
    | `03-noi-chuoi.md` | `s1.chuoi.l3` | Nối chuỗi bằng dấu + / Joining strings with + | `"Py" + "Pet"` ra `PyPet`; dấu `+` không tự thêm dấu cách; tự đặt dấu cách trong chuỗi. |
    | `04-lap-chuoi.md` | `s1.chuoi.l4` | Lặp chuỗi bằng dấu * / Repeating strings with * | `"ha" * 3` ra `hahaha`; vẽ đường kẻ `"-" * 20`; kết hợp `*` và `+` (`*` làm trước). |
    | `05-xuong-dong.md` | `s1.chuoi.l5` | Xuống dòng với \n / New lines with \n | `\n` trong chuỗi là xuống dòng; in nhiều dòng bằng 1 lệnh `print`; `\n` không in ra 2 ký tự `\` và `n`. |

  - Khái niệm (ID cố định, 5 khái niệm): `string-exact` (chuỗi được in y nguyên, kể cả dấu cách và chữ số), `quote-inside` (dấu nháy bên trong chuỗi), `concat-no-space` (dấu + không tự thêm dấu cách), `string-repeat` (lặp chuỗi bằng *), `newline-escape` (\n là ký tự xuống dòng).
  - Trạm ôn: `s1.chuoi.r1` sau `s1.chuoi.l2`, `s1.chuoi.r2` sau `s1.chuoi.l5`.
  - `stage.yaml`: `topics: [01-lam-quen, 02-chuoi]`.
  - `e2e/exam.spec.ts`: sau kiểm tra chủ đề 1, "Học tiếp" mở bài đầu tiên của chủ đề 2.

- [ ] **Step 1: Soạn nội dung** của chủ đề theo bảng trên và quy tắc soạn nội dung 1–9.

- [ ] **Step 2: Kiểm tra nội dung**

Run: `npm run content:validate && npm run content:build 2>&1 | grep "Cảnh báo"`
Expected: validate qua; không có cảnh báo nào bắt đầu bằng `s1.chuoi` hay ID khái niệm của chủ đề 2.

- [ ] **Step 3: Sửa e2e** `e2e/exam.spec.ts`: đổi tên test thành `after the 4 lessons of the first topic come its test and then the next topic`; thay đoạn từ `await page.getByRole("link", { name: "Học tiếp" }).click();` ngay sau dòng `+30 XP` tới hết test bằng:

```ts
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Chuỗi là gì?" })).toBeVisible();
  await page.getByRole("link", { name: "Py-Pet" }).click();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  // The map lists the topics in order: the first topic test is the one of topic 1.
  await expect(page.getByRole("listitem").filter({ hasText: "Kiểm tra chủ đề" }).first()).toContainText("Đã xong");
  await expect(page.getByRole("listitem").filter({ hasText: "Chuỗi là gì?" })).toContainText("Bài tiếp theo");
});
```

Nếu Playwright báo nhãn không khớp, đọc `src/ui/MapScreen.tsx` và dùng đúng nhãn; giữ ý của 2 kiểm tra trên.

- [ ] **Step 4: Chạy kiểm tra toàn bộ**

Run: `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; npm run check`
Expected: typecheck; Vitest 622; pytest 21; nội dung qua; Playwright 14 passed.

- [ ] **Step 5: Commit**

```bash
git add content/stage-1/02-chuoi content/stage-1/stage.yaml e2e/exam.spec.ts
git commit -m "content(s1): the topic print and strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Chủ đề 3 "Chú thích và đọc thông báo lỗi"

**Files:**
- Create: `content/stage-1/03-chu-thich-loi/` (`topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml`, 4 file bài học)
- Modify: `content/stage-1/stage.yaml`; có thể sửa `content/errors/errors.yaml` (quy tắc soạn nội dung 10)

**Interfaces:**
- Consumes: kiến thức chủ đề 1–2; từ điển lỗi hiện có (`unterminated-string`, `paren-never-closed`, `paren-unmatched`, `print-no-paren`, `smart-quote`, `name-similar`, `name-undefined`, `syntax-other`).
- Produces:
  - Chủ đề `s1.chu-thich-loi`, `title: { vi: "Chú thích và đọc thông báo lỗi", en: "Comments and error messages" }`.
  - 4 bài học:

    | File | ID | Tên (vi / en) | Mục tiêu |
    |---|---|---|---|
    | `01-chu-thich.md` | `s1.chu-thich-loi.l1` | Chú thích bằng dấu # / Comments with # | **Chú thích** là ghi chú cho người đọc; Python bỏ qua mọi thứ từ `#` tới hết dòng; chú thích ở cuối dòng lệnh; `#` nằm trong chuỗi thì được in ra, không phải chú thích. |
    | `02-tat-dong-lenh.md` | `s1.chu-thich-loi.l2` | Tắt tạm 1 dòng lệnh / Turning a line off | Thêm `#` ở đầu dòng để tạm tắt lệnh khi thử nghiệm hoặc tìm lỗi; đoán đầu ra khi có dòng bị tắt. |
    | `03-doc-thong-bao-loi.md` | `s1.chu-thich-loi.l3` | Đọc thông báo lỗi / Reading an error message | Thông báo lỗi có số dòng, tên lỗi, lời giải thích; **lỗi cú pháp** (`SyntaxError`) làm cả chương trình không chạy dòng nào; lỗi khi chạy (`NameError`) làm chương trình dừng ở dòng lỗi, các dòng trước đó đã chạy. |
    | `04-loi-hay-gap.md` | `s1.chu-thich-loi.l4` | Những lỗi hay gặp / Common mistakes | Thiếu dấu nháy, thiếu ngoặc, gõ sai tên lệnh (`pirnt`), quên ngoặc của `print`; sửa từng lỗi một rồi chạy lại; bài code "sửa lỗi" có starter là code lỗi. |

  - Khái niệm (ID cố định, 5 khái niệm): `comment-hash` (Python bỏ qua chú thích), `hash-in-string` (# trong chuỗi không phải chú thích), `syntax-error-nothing-runs` (lỗi cú pháp: không dòng nào chạy), `runtime-error-stops` (lỗi khi chạy: dừng tại dòng lỗi), `bracket-pairs` (ngoặc và dấu nháy phải đi thành cặp).
  - Trạm ôn: `s1.chu-thich-loi.r1` sau `s1.chu-thich-loi.l2`, `s1.chu-thich-loi.r2` sau `s1.chu-thich-loi.l4`.
  - `stage.yaml`: thêm `03-chu-thich-loi`.
  - Câu `predict` về lỗi: lựa chọn đúng có thể là "báo lỗi" (`error: true`, có `vi`/`en`), như `s1.lam-quen.l4.q1`.

- [ ] **Step 1: Soạn nội dung** theo bảng trên và quy tắc soạn nội dung 1–10. Với mỗi ví dụ `run expect-error`, chạy thử trong `npm run dev` không được (phiên cloud), nên kiểm bằng cách: tìm mục từ điển khớp loại lỗi và thông báo của CPython 3.13 (`python3 -c '...'`), và đảm bảo lời giải thích của mục đó đúng với tình huống; nếu không có mục khớp riêng, thêm mục mới (quy tắc 10).

- [ ] **Step 2: Kiểm tra nội dung**

Run: `npm run content:validate && npm run content:build 2>&1 | grep "Cảnh báo" ; npx vitest run`
Expected: validate qua; không có cảnh báo về chủ đề 3 hay khái niệm của nó; Vitest 622 (hoặc hơn nếu thêm mục từ điển có test riêng; ghi số mới trong báo cáo).

- [ ] **Step 3: Commit**

```bash
git add content/stage-1/03-chu-thich-loi content/stage-1/stage.yaml content/errors/errors.yaml
git commit -m "content(s1): the topic comments and error messages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Chủ đề 4 "In nhiều giá trị: sep và end"

**Files:**
- Create: `content/stage-1/04-print-nhieu/` (`topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml`, 5 file bài học)
- Modify: `content/stage-1/stage.yaml`

**Interfaces:**
- Consumes: kiến thức chủ đề 1–3.
- Produces:
  - Chủ đề `s1.print-nhieu`, `title: { vi: "In nhiều giá trị: sep và end", en: "Printing many values: sep and end" }`.
  - 5 bài học:

    | File | ID | Tên (vi / en) | Mục tiêu |
    |---|---|---|---|
    | `01-dau-phay.md` | `s1.print-nhieu.l1` | In nhiều giá trị bằng dấu phẩy / Many values with commas | `print("A", "B")` in `A B`: dấu phẩy ngăn cách các giá trị và Python tự thêm 1 dấu cách giữa chúng; khác với `+`. |
    | `02-so-va-chu.md` | `s1.print-nhieu.l2` | Số và chữ / Numbers and text | Số viết không có dấu nháy; `print(2 + 3)` in `5`, `print("2 + 3")` in `2 + 3`, `print("2" + "3")` in `23`; in kết hợp chữ và số bằng dấu phẩy (`print("Robo có", 4, "bánh xe")`). Chỉ dùng `+`, `-`, `*` với số nguyên. |
    | `03-sep.md` | `s1.print-nhieu.l3` | Tham số sep / The sep option | `sep` thay dấu cách giữa các giá trị: `sep=""`, `sep="-"`, `sep="\n"`; `sep` chỉ đặt giữa các giá trị, không đặt ở đầu hay cuối; viết `sep=...` sau các giá trị. |
    | `04-end.md` | `s1.print-nhieu.l4` | Tham số end / The end option | Mặc định `print` kết thúc bằng xuống dòng; `end=""` hoặc `end=" "` làm lệnh `print` sau in tiếp trên cùng dòng; dùng cả `sep` và `end` trong 1 lệnh. |
    | `05-ve-hinh.md` | `s1.print-nhieu.l5` | Vẽ hình bằng print / Drawing with print | Bài tổng hợp: vẽ khung, bậc thang, lá cờ bằng ký tự, dùng `*`, `+`, dấu phẩy, `sep`, `end`. |

  - Khái niệm (ID cố định, 5 khái niệm): `print-comma-space` (dấu phẩy trong print tự thêm dấu cách), `number-vs-text` (số và chữ số trong dấu nháy khác nhau), `sep-param` (sep chỉ nằm giữa các giá trị), `end-param` (end thay ký tự xuống dòng ở cuối), `named-option-order` (sep/end viết sau các giá trị, có dấu = và giá trị là chuỗi).
  - Trạm ôn: `s1.print-nhieu.r1` sau `s1.print-nhieu.l2`, `s1.print-nhieu.r2` sau `s1.print-nhieu.l5`.
  - `stage.yaml`: `topics: [01-lam-quen, 02-chuoi, 03-chu-thich-loi, 04-print-nhieu]`.

- [ ] **Step 1: Soạn nội dung** theo bảng trên và quy tắc soạn nội dung 1–9. Bài `code` có đầu ra có dấu cách ở cuối dòng cần lưu ý: so sánh đầu ra bỏ dấu cách thừa cuối dòng (spec 3.7), nên đừng ra đề mà đáp án chỉ khác nhau ở dấu cách cuối dòng.

- [ ] **Step 2: Kiểm tra nội dung**

Run: `npm run content:validate && npm run content:build 2>&1 | grep "Cảnh báo" ; npx vitest run`
Expected: validate qua; không còn dòng "Cảnh báo:" nào (giai đoạn 1 đủ ngân hàng câu hỏi, câu AI và bài code cho đề tiến hóa); Vitest 622.

- [ ] **Step 3: Commit**

```bash
git add content/stage-1/04-print-nhieu content/stage-1/stage.yaml
git commit -m "content(s1): the topic printing many values with sep and end

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Rà soát giai đoạn 1 và bảng tổng hợp cho phụ huynh

**Files:**
- Create: `docs/superpowers/content-stage-1.md`
- Modify: nội dung trong `content/stage-1/` nếu rà soát tìm ra lỗi

**Interfaces:**
- Consumes: toàn bộ Task 1–5.
- Produces:
  - Rà soát chéo cả giai đoạn: không bài nào dùng kiến thức chưa học (quy tắc 2); thuật ngữ thống nhất giữa các chủ đề (ví dụ "chuỗi", "dấu nháy", "chú thích", "thông báo lỗi"); câu hỏi không trùng nhau gần như nguyên văn; mỗi khái niệm được dạy ở đúng 1 chủ đề.
  - `docs/superpowers/content-stage-1.md`: bảng tổng hợp để phụ huynh duyệt (spec 3.10): mỗi chủ đề 1 mục gồm danh sách bài (ID, tên, mục tiêu 1 dòng), số bài tập theo loại, số câu ngân hàng, khái niệm (ID, tên); cuối file là tổng của giai đoạn (số bài, số câu `predict`/`mcq`, số câu AI, số bài code `test_eligible`, số bài luyện mỗi mức) và danh sách việc phụ huynh cần duyệt (lời văn thẻ lý thuyết, thẻ hiểu lầm, gợi ý cho phụ huynh).

- [ ] **Step 1: Rà soát và sửa** các lỗi tìm thấy (sửa trong nội dung, không đổi ID).

- [ ] **Step 2: Viết bảng tổng hợp.** Đếm bằng script (ví dụ đọc `src/generated/content.json` sau `npm run content:build`), không đếm tay.

- [ ] **Step 3: Chạy kiểm tra toàn bộ**

Run: `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; npm run check && npm run content:build 2>&1 | grep -c "Cảnh báo"`
Expected: typecheck; Vitest 622; pytest 21; nội dung qua; Playwright 14 passed; số dòng "Cảnh báo" là 0.

- [ ] **Step 4: Commit**

```bash
git add content/stage-1 docs/superpowers/content-stage-1.md
git commit -m "docs: stage 1 content summary for the parents' review

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
