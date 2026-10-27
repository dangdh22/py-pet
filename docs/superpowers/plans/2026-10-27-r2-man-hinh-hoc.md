# R2 – Màn hình học: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Các màn hình học theo hệ thống "Nhãn dán đậm": thanh trên của khung tập trung có tên màn hình và ô bước, Bản đồ học dạng tab giai đoạn và hàng ô, thẻ lý thuyết, mọi dạng bài, theme CodeMirror sáng, trạm ôn, ôn tập, bài luyện, kiểm tra, màn hình kết quả và hoạt cảnh tiến hóa.

**Architecture:** Màn hình làm bài đặt tiêu đề của nó vào thanh trên bằng `FocusTitle` (portal vào 1 ô trống của `FocusLayout`; ngoài `FocusLayout` thì hiện ngay tại chỗ, nên test của từng màn hình vẫn thấy tiêu đề). Bản đồ học tách phần tính toán thuần (`mapModel`) khỏi phần vẽ. Theme CodeMirror nằm trong `src/ui/editorTheme.ts` với bảng màu xuất ra để test độ tương phản. CSS mới nằm trong `src/styles/study.css` và `src/styles/map.css`; mỗi task xóa các quy tắc cũ trong `src/styles.css` mà nó thay thế. Không đổi `GameState`, `SCHEMA_VERSION`, luật chơi, chấm bài hay nội dung.

**Tech Stack:** Như hiện tại; thêm dependency trực tiếp `@lezer/highlight` (1.2.5, bản đang có sẵn qua `codemirror`).

**Spec:** `docs/superpowers/specs/2026-10-27-ui-revamp-design.md` (mục 5, 6.1, 7.4, 7.5, 7.6, 10, 11, 12 mốc R2, 13). Hành vi vẫn theo `docs/superpowers/specs/2026-10-06-py-pet-design.md` (mục 4.2, 7.2, 8.2). Mockup: `docs/superpowers/specs/ui-revamp-mockups/3-other-screens.html` mục 1 (bản đồ) và mục 2 (bài code). Kế hoạch R1: `docs/superpowers/plans/2026-10-27-r1-nen-tang-giao-dien.md`.

## Global Constraints

- Phạm vi R2: tài liệu thiết kế mục 12 dòng R2. Ngoài phạm vi (R3): Cửa hàng, Sổ thành tích, Sao lưu, nội dung 5 tab khu phụ huynh, trang Hướng dẫn, màn hình lỗi (`.crash`, `UnsupportedBrowser`, `SecondTabScreen`), gallery, các quy tắc CSS cũ không thuộc màn hình học, helper id tab phụ huynh.
- Màu dùng token trong `src/styles/tokens.css` (gồm `--on-primary`, `--chip-pin`, `--shadow-press` thêm ở lượt sửa cuối của R1); không viết cứng màu mới trong CSS trừ bảng `EDITOR_COLORS` của Task 3 và các giá trị ghi rõ trong kế hoạch này.
- Không thêm logic chấm bài hay dữ liệu mới (tài liệu thiết kế 7.5). Không thêm kéo thả cho bài sắp xếp dòng.
- `border-radius: 0` cho mọi thành phần giao diện. Robo, phụ kiện và vòng sáng của hoạt cảnh tiến hóa giữ nguyên.
- Mọi cặp chữ và nền mới đạt WCAG AA (4,5:1; chữ từ 18,66px đậm: 3:1). Trạng thái không chỉ thể hiện bằng màu (bản đồ, kết quả test, lựa chọn trắc nghiệm).
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder. Khóa không còn dùng thì xóa ở cả 2 file.
- Tìm phần tử trong test theo vai trò và tên truy cập. Giữ đúng các tên mà test unit và e2e đang dùng: link "Học tiếp", link "Về phòng" (thanh trên), nút "Về phòng" (kết quả), "Chạy thử", "Nộp bài", "Tiếp", "Quay lại", "Hoàn thành", "Kiểm tra", "Chọn đáp án này", "Nộp bài kiểm tra", "Bỏ qua", "Xem lời giải", vùng "Kết quả", textbox "Trình soạn code" và "Dữ liệu nhập (Input)", list "Kết quả chấm", chữ "Thẻ n/m", "Bài tập n/m", "Câu n/m", tên radio đúng bằng chữ của lựa chọn.
- Giữ `prefers-reduced-motion`: mọi chuyển tiếp mới tắt khi bật giảm chuyển động.
- Mỗi task chạy `npx vitest run` cho các file liên quan, `npm run lint`, `npm run typecheck`. E2E được sửa ở Task 7; từ Task 2 tới Task 7, e2e đỏ là dự kiến.
- Commit message kết thúc bằng trailer theo hướng dẫn attribution của phiên đang chạy.

## Review Focus

1. Màn hình làm bài bị lỗi giao diện vẫn còn thanh trên với link "Về phòng", và tiêu đề cũ trong thanh trên biến mất. Test: Task 1.
2. Mỗi giai đoạn của 1 route học có đúng 1 `h1`: lúc làm bài (thanh trên), ở màn hình kết quả (thẻ kết quả), và sau khi bấm "Học tiếp" sang bài sau. Test: Task 6.
3. Trong bài kiểm tra, lựa chọn đã chọn không lộ đúng hay sai qua biểu tượng, lớp CSS hay mô tả truy cập. Test: Task 5.
4. Cửa sổ rộng 800px: thanh trên của bài học vẫn cao 60px và trang không cuộn ngang. Test: Task 7.
5. Tab mặc định của bản đồ là giai đoạn chứa bước tiếp theo; học hết thì là giai đoạn cuối; giai đoạn không có kiểm tra tiến hóa không có thẻ tiến hóa và vẫn "đã qua" khi xong các chủ đề. Test: Task 2.

Kiểm bằng mắt khi người bảo trì thử app (không có test tự động): ô điền chỗ trống cao bằng dòng code; tên bài dài bị cắt bằng dấu "…" trong thanh trên; hàng ô của 1 chủ đề dài tự xuống dòng mà đường nối vẫn đúng; màu cú pháp dễ đọc; hoạt cảnh tiến hóa trên nền mới.

## Quyết định thiết kế

Theo mục 13 của tài liệu thiết kế. Các quyết định Claude chốt khi lập kế hoạch (người bảo trì xem lại):

1. **Tiêu đề trong thanh trên** là `h1` của trang và do `FocusTitle` đặt vào. `h1` là dòng "Bài n · {tên bài}"; tên chủ đề là dòng chữ nhỏ phía trên (khác mockup, nơi tên chủ đề đậm hơn), vì `h1` phải là tên bài. Màn hình làm bài không còn `h1` riêng. Màn hình kết quả không đặt `FocusTitle`; tiêu đề của thẻ kết quả là `h1`.
2. **Ô bước** có ở mọi màn hình làm bài (bước của bài học; câu của trạm ôn, bài luyện, kiểm tra), kèm chữ tiến độ hiện có ("Thẻ 1/4", "Bài tập 1/2", "Câu 2/5") để trạng thái không chỉ bằng màu. Dưới 1100px, thanh trên ẩn hàng ô và chữ của trạng thái Python (giữ ô màu), giữ chữ tiến độ.
3. **Bản đồ:** tab giai đoạn kích hoạt theo tiêu điểm (phím mũi tên, Home, End, `tabindex` lưu động); chỉ vẽ bảng của tab đang chọn. Tên truy cập của ô là "{tên bước}: {trạng thái}" qua `aria-label`; ô chưa mở là `<span role="link" aria-disabled="true">`, không nhận tiêu điểm. Chú giải có `aria-hidden="true"` (trạng thái đã nằm trong tên ô). Chủ đề chưa mở: chữ màu `--muted` và hàng ô mờ, không làm mờ chữ bằng `opacity` (giữ AA). Chữ `map.next` đổi thành "Tiếp theo".
4. **Trạng thái "mở được nhưng chưa làm"** của mục 7.4 không có trong `nodeStatuses` (bước sau bước tiếp theo luôn bị khóa), nên bản đồ chỉ có 3 trạng thái. Màu nền theo loại (vàng, hồng) chỉ dùng cho hình trong chú giải.
5. **Thẻ đề** không có tên bài tập (nội dung không có trường này); thẻ có nhãn loại bài ("BÀI TẬP CODE", "SẮP XẾP DÒNG CODE", "ĐIỀN CHỖ TRỐNG", "ĐOÁN KẾT QUẢ", "TRẮC NGHIỆM").
6. **Nút gợi ý** ghi "Gợi ý {n}/{tổng}" với n là số của gợi ý sẽ mở; mở hết thì nút ẩn như hiện tại (đã xem lời giải vẫn mở được gợi ý, như hiện tại). **Nút "Xem lời giải"** luôn hiện nhưng tắt cho tới khi sai 3 lần, kèm chữ phụ "sau 3 lần sai", và ẩn sau khi đã xem. Đã giải đúng thì cả 2 nút ẩn (bài code thêm trạng thái `solved` cho việc này, như bài sắp xếp đang có).
7. **So sánh kết quả:** test hiện bị sai đầu tiên mở phần so sánh ngay dưới dòng của nó; các test hiện bị sai khác để phần so sánh trong `<details>` đóng ("Xem so sánh"). "Mong đợi" và "Code của con in ra" nằm cạnh nhau.
8. **Dấu đúng sai của lựa chọn:** biểu tượng `check` hoặc `cross` mới trong khối lựa chọn, chữ cho trình đọc màn hình qua `aria-describedby` trỏ tới 1 `span.sr-only` đặt ngoài `<label>`, để tên của radio không đổi.
9. **Màu của trình soạn code:** từ khóa `#b03a0a`, chuỗi `#146c34`, số `#7e22ce`, hàm và lớp `#1d4ed8`, chú thích `#555555` nghiêng, chữ thường `--ink`; nền dòng lỗi `#ffecec` (màu `--danger-bg` làm 3 màu cú pháp dưới 4,5:1) với vạch trái 4px `--coral` vẽ bằng `box-shadow: inset`; số dòng `#6b6455` trên `#f6efdc`. Cỡ chữ của trình soạn 16px (spec chính 4.5 cần chữ lớn), khối code 15px.
10. **Hoạt cảnh tiến hóa:** nền `--ink` thay cho nền xanh đậm, dòng phụ kiện mới màu `--yellow`, dòng "đang lớn lên" màu `#d6d6d6`, nút "Bỏ qua" là nút vuông nền trắng, bóng vàng, viền tiêu điểm vàng.
11. **Thông báo trong khung tập trung** (không tìm thấy, chưa mở, chưa có câu để ôn) dùng chung `StudyNotice`: 1 thẻ giữa trang thay cho lớp `.room` cũ.
12. **Mục tiêu ngày** dùng chung `GoalSquares` (chuyển từ `RoomScreen`); khi có ít nhất 1 điểm thì ít nhất 1 ô được tô (sửa minor R1 Task 6).

---

### Task 1: Thanh trên có tiêu đề và ô bước, thông báo dạng thẻ

**Files:** Create `src/ui/shell/FocusTitle.tsx`, `src/ui/shell/Squares.tsx`, `src/ui/StudyNotice.tsx`, `src/styles/study.css`. Modify `src/ui/shell/FocusLayout.tsx`, `src/ui/shell/layout.test.tsx`, `src/content/lookup.ts`, `src/content/lookup.test.ts`, `src/ui/LessonScreen.tsx`, `src/ui/LessonScreen.test.tsx`, `src/ui/SessionScreen.tsx`, `src/ui/ExamRunner.tsx`, `src/ui/RoomScreen.tsx`, `src/ui/RoomScreen.test.tsx`, `src/ui/ReviewScreen.tsx`, `src/ui/PracticeScreen.tsx`, `src/ui/AssignedPracticeScreen.tsx`, `src/ui/RemedialScreen.tsx`, `src/ui/EvolutionTestScreen.tsx` (chỉ nhánh `remedialFirst`), `src/ui/AppRoutes.tsx` (`Notice`), `src/ui/AppRoutes.test.tsx`, `src/styles/base.css`, `src/styles/shell.css`, `src/styles.css`, i18n.

**Interfaces:**
- Produces (`Squares.tsx`): `type StepState = "done" | "current" | "todo"`; `stepStates(count: number, current: number, isDone: (index: number) => boolean): StepState[]` (vị trí `current` là `"current"`; vị trí nhỏ hơn `current` hoặc `isDone` là `"done"`; còn lại `"todo"`); `StepSquares({ steps }: { steps: readonly StepState[] })` vẽ `<span className="squares steps" aria-hidden="true">` với mỗi ô là `<span className={state} />`; `GoalSquares({ done, goal }: { done: number; goal: number })` (chuyển nguyên từ `Squares` của `RoomScreen`, tối đa 10 ô, lớp `on`).
- Produces: `FocusTitle({ title, kicker, progress, steps }: { title: string; kicker?: string; progress?: string; steps?: readonly StepState[] })`; `FocusSlotContext` (React context `HTMLElement | null | undefined`, mặc định `undefined`).
- Produces: `StudyNotice({ message, children }: { message: string; children?: ReactNode })`.
- Produces: `lessonPlace(bundle: ContentBundle, lessonId: string): { stage: Stage; topic: Topic; number: number } | undefined` (`number` là thứ tự của bài trong chủ đề, tính từ 1).
- Produces CSS: `.study-page` (`main` của bài học, trạm ôn, bài luyện, kiểm tra), `.study-nav` (hàng nút Quay lại / Tiếp), `.kicker` trong `base.css` (JetBrains Mono 12px, đậm 700, chữ hoa, giãn 0,08em, màu `--primary`).

- `FocusLayout`: thứ tự trong `header.focus-bar`: link "Về phòng", `<div className="focus-title-slot" ref={setSlot} />`, `RunnerStatus`, chip. Bọc toàn bộ bằng `FocusSlotContext.Provider value={slot}` (`slot` là state, `null` cho tới khi ô được gắn).
- `FocusTitle`: nội dung gồm `<div className="focus-title">` (`<p className="focus-kicker">` nếu có `kicker`, rồi `<h1>{title}</h1>`), `StepSquares` nếu có `steps`, `<span className="focus-progress">` nếu có `progress`. Context `undefined` (không có khung): vẽ tại chỗ trong `<div className="focus-title-inline">`. `null`: không vẽ gì. Có phần tử: `createPortal` vào phần tử đó.
- `LessonScreen`: bỏ `.lesson-top`; `FocusTitle` với `title` = `t("focus.lessonTitle", { n, title })` khi `lessonPlace` tìm thấy bài (ngược lại chỉ tên bài), `kicker` = tên chủ đề theo `uiLang`, `progress` = chuỗi `lesson.cardOf` / `lesson.exerciseOf` hiện có, `steps` = `stepStates(steps.length, index, (i) => doneSteps.has(i))`. Tên bài lấy từ prop `lesson`.
- `SessionScreen` và `ExamRunner`: bỏ `.lesson-top`; `FocusTitle` với `title`, `progress` = `review.itemOf` khi có câu, `steps` = `stepStates(items.length, index, (i) => results[i] !== undefined)` (ExamRunner dùng `answers[i]`) khi có ít nhất 1 câu.
- `main` của 3 màn hình trên đổi lớp `lesson` thành `study-page`, `nav.lesson-nav` thành `nav.study-nav`.
- `StudyNotice`: `<main className="study-notice"><div className="card"><p>{message}</p>{children}</div></main>`. Dùng cho 4 trạng thái rỗng (`review.empty` của ôn tập tự do, `practice.empty`/`practice.notFound`, `assigned.notFound`, `remedial.none`), nhánh `remedialFirst` (con là link `button primary` hiện có) và `Notice` của `AppRoutes` (con là link `href="#/map"` lớp `button`, chữ `room.map`).
- `GoalSquares`: `filled = done > 0 && goal > 0 ? max(1, floor(done * shown / goal)) : 0`, không vượt `shown`.
- CSS (`study.css`, được `src/styles.css` import ngay sau `shell.css`): `.study-page` rộng tối đa 1240px, giữa trang, đệm 24px; `.study-nav` 2 nút ở 2 đầu; `.study-notice .card` rộng tối đa 560px, cách trên 48px. Trong `shell.css`: `.focus-title-slot` co giãn (`flex: 1; min-width: 0`), `h1` 16px đậm 700 một dòng, tràn thì "…"; `.focus-kicker` 13px `--muted`; `.squares.steps .done` nền `--ink`, `.current` nền `--primary`; `@media (max-width: 1099px)` ẩn `.focus-bar .squares` và ẩn chữ của `.focus-bar .runner-status` (giữ ô màu, chữ vẫn cho trình đọc màn hình). `src/styles.css`: xóa `.room`, `.home, .lesson`, `.lesson-top`, `.lesson-nav`; đổi `.lesson .card` thành `.study-page .card`.
- i18n mới (vi / en): `focus.lessonTitle` "Bài {n} · {title}" / "Lesson {n} · {title}".

**Test:**
1. `layout.test.tsx`: `FocusLayout` chứa `<FocusTitle title="Bài 1 · Bài thử" kicker="Chủ đề thử" progress="Thẻ 1/2" steps={["current", "todo"]} />`: trong `banner` có `heading` cấp 1 "Bài 1 · Bài thử", chữ "Chủ đề thử" và "Thẻ 1/2"; `.squares.steps` trong `banner` có `aria-hidden="true"` và 2 ô lớp `current`, `todo`; toàn trang có đúng 1 `heading` cấp 1.
2. `FocusTitle` không có `FocusLayout`: `heading` cấp 1 hiện tại chỗ.
3. Review Focus 1: `<FocusLayout><ErrorBoundary><FocusTitle title="X" /><Boom /></ErrorBoundary></FocusLayout>` (chặn `console.error`): có `alert` "Robo bị trục trặc rồi.", có link "Về phòng", không có `heading` "X".
4. `stepStates(4, 2, (i) => i === 3)` → `["done", "done", "current", "done"]`; `stepStates(0, 0, () => false)` → `[]`.
5. `lookup.test.ts`: `lessonPlace(testBundle(), "t.l2")` → `topic.id` "t.topic", `number` 2; id lạ → `undefined`.
6. `LessonScreen.test.tsx`: `heading` cấp 1 "Bài 1 · Bài thử" và chữ "Chủ đề thử"; sau 1 lần "Tiếp", lớp các ô của `.squares.steps` là `["done", "current", "todo", "todo"]`. Các test hiện có (chữ "Thẻ 1/2", "Bài tập 1/2") giữ nguyên.
7. `RoomScreen.test.tsx`: thêm test kế hoạch tuần 28 bài, đã xong 1 bài → 10 ô, 1 ô `on`. 2 test ô vuông hiện có giữ nguyên.
8. `AppRoutes.test.tsx`: hash `#/lesson/t.l1` → trong `banner` có `heading` cấp 1 "Bài 1 · Bài thử"; hash `#/lesson/khong-co` → chữ "Không tìm thấy bài học này." và link "Bản đồ học" href `#/map` nằm trong `main`, không có phần tử lớp `room`. Các test thông báo hiện có giữ nguyên.

- [ ] Commit `feat(ui): the focus bar shows the screen title and the step squares`.

### Task 2: Bản đồ học

**Files:** Create `src/ui/mapModel.ts` (+ `mapModel.test.ts`), `src/styles/map.css`. Modify `src/ui/MapScreen.tsx`, `src/ui/MapScreen.test.tsx`, `src/test/examBundle.ts` (thêm `twoStageBundle()`), `src/styles.css` (import `map.css`; xóa `.map`, `.map-path`, `.map-node`, `.node-*`), i18n.

**Interfaces:**
- Consumes: `pathNodes`, `nodeStatuses`, `nextNode`, `PathNode`, `NodeStatus` (`src/game/path.ts`); `nodeRoute`, `routeToHash`; `formatScore` (`ExamRunner.tsx`); `Icon`.
- Produces: `twoStageBundle(): ContentBundle` (giai đoạn "x" của `examBundle()` rồi giai đoạn "t" của `testBundle()`, lỗi của `examBundle()`).
- Produces (`mapModel.ts`):
  - `interface MapNodeView { node: PathNode; status: NodeStatus; number: number | null }` (`number`: thứ tự bài học trong chủ đề, tính từ 1; trạm ôn và kiểm tra là `null`).
  - `interface MapTopicView { topic: Topic; number: number; nodes: MapNodeView[]; lessonsDone: number; lessonCount: number; test: TopicTestRecord | undefined; open: boolean }` (`open`: có ít nhất 1 ô không `locked`).
  - `interface MapStageView { stage: Stage; number: number; topics: MapTopicView[]; evolution: MapNodeView | null; passed: boolean; bestPass: EvolutionAttempt | undefined }` (`passed`: mọi ô của giai đoạn, kể cả kiểm tra tiến hóa nếu có, là `done`; `bestPass`: lần thi cuối có `stage === number` và `passed`).
  - `mapModel(bundle: ContentBundle, state: GameState): { stages: MapStageView[]; current: number }` (`current`: chỉ số giai đoạn chứa `nextNode`; không còn bước nào thì giai đoạn cuối; không có giai đoạn thì 0).

- `MapScreen` theo mục 1 của mockup, trong `<main className="map-page">`: hàng tiêu đề `h1` `map.title` và chú giải `aria-hidden="true"` (5 mục: `map.done`, `map.next`, `map.review`, `map.legendTest`, `map.locked`, mỗi mục 1 ô mẫu đúng hình và màu).
- `<div role="tablist" aria-label={t("map.stages")}>`: mỗi giai đoạn 1 `button role="tab"` (`id="map-tab-<stageId>"`, `aria-selected`, `aria-controls="map-panel"`, `tabIndex` 0 cho tab đang chọn và -1 cho tab khác), nội dung `<span>{n}</span> {tên giai đoạn}`; giai đoạn `passed` thêm icon `check` và `aria-describedby` trỏ tới 1 `span.sr-only` chung có chữ `map.stagePassed`. Phím ArrowRight/ArrowLeft (vòng), Home, End đổi tab và chuyển tiêu điểm. Mặc định chọn `current`.
- `<section role="tabpanel" id="map-panel" aria-labelledby=...>`: mỗi chủ đề 1 hàng: bên trái `<p className="kicker">` `map.topicKicker`, `h2` tên chủ đề, dòng `map.lessonsDone` và, nếu có `test`, " · " + `map.testBest` (điểm `best` qua `formatScore`); bên phải `<ol className="map-track" aria-label={tên chủ đề}>` các ô. Chủ đề `!open` có lớp `map-topic-locked`.
- Ô: `<li>` chứa link `href={routeToHash(nodeRoute(node))}` (hoặc `<span role="link" aria-disabled="true">` khi `locked`) với `aria-label={t("map.nodeName", { step, status: t(`map.${status}`) })}`; `step` = tên bài, `map.review` hoặc `map.topicTest`. Mặt ô (`aria-hidden`): `done` icon `check`, `locked` icon `lock`, còn lại số thứ tự (bài học), trống (trạm ôn) hoặc `map.testShort` (kiểm tra). Ô `next` có nhãn `map.next` nổi phía trên (`aria-hidden`). Tên bước hiện thành chú thích khi `:hover` hoặc `:focus-visible` (như nhãn của thanh bên thu gọn).
- Thẻ tiến hóa (khi `evolution` khác `null`) ở cuối bảng, viền nét đứt: `h2` `map.evoTitle`; `locked`: `map.evoLocked` và chữ `map.locked` có icon `lock`; `next`: `map.evoOpen` và link lớp `button primary` `map.evoStart` tới `#/evolution/<stageId>`; `done`: `map.evoPassed` (từ `bestPass`, có icon `check`), không có `bestPass` thì `map.done`. `percent` = `state.settings.passPercent`, `name` = tên robot.
- CSS (`map.css`) theo mockup: ô 44px viền 2px; trạm ôn 34px xoay 45 độ (mặt xoay ngược lại); kiểm tra rộng 56px; `done` nền `--mint`; `next` nền `--primary`, chữ trắng, vòng ngoài `0 0 0 4px var(--bg), 0 0 0 6px var(--primary)`; `locked` kẻ sọc xám, icon màu `--muted`. Đường nối vẽ bằng `::after` của mỗi `li` trừ ô cuối, nên hàng ô tự xuống dòng (`flex-wrap`, khoảng cách dòng đủ cho nhãn "Tiếp theo") mà đường vẫn đúng. Tab đang chọn nền `--ink` chữ trắng.
- i18n (vi / en): đổi `map.next` thành "Tiếp theo" / "Next". Mới: `map.stages` "Các giai đoạn" / "Stages"; `map.stagePassed` "Con đã qua giai đoạn này" / "You passed this stage"; `map.topicKicker` "Chủ đề {n}" / "Topic {n}"; `map.lessonsDone` "{done}/{total} bài" / "{done}/{total} lessons"; `map.testBest` "kiểm tra {score}/{max}" / "test {score}/{max}"; `map.nodeName` "{step}: {status}" / "{step}: {status}"; `map.testShort` "KT" / "Test"; `map.legendTest` "Kiểm tra" / "Test"; `map.evoTitle` "Kiểm tra tiến hóa · Giai đoạn {n}" / "Evolution test · Stage {n}"; `map.evoLocked` "Mở khi con xong mọi chủ đề của giai đoạn này. Đạt từ {percent}% thì {name} tiến hóa." / "It opens when you finish every topic of this stage. Score {percent}% or more and {name} evolves."; `map.evoOpen` "Đạt từ {percent}% thì {name} tiến hóa." / "Score {percent}% or more and {name} evolves."; `map.evoStart` "Làm bài kiểm tra" / "Take the test"; `map.evoPassed` "Đã đạt: {score}/{max} điểm." / "Passed: {score}/{max} points.". Xóa `map.evolution`.

**Test:**
1. `mapModel.test.ts`, `testBundle()` ban đầu: 1 giai đoạn, `current` 0; chủ đề 1: ô `t.l1` `next` số 1, `t.l2` `locked` số 2, `lessonsDone` 0, `lessonCount` 2, `open` true; `evolution` null; `passed` false.
2. `reviewBundle()` với `r.l1`, `r.l2` xong: ô trạm ôn `next` với `number` null; `r.l3` có `number` 3.
3. `examBundle()` với 2 bài xong, `topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] }`, `pet.stage` 2 và 1 lần thi `{ stage: 1, score: 7, max: 7, passed: true, ... }`: `passed` true, `evolution.status` "done", `bestPass.score` 7, chủ đề có `test.best` 6.
4. Review Focus 5, `twoStageBundle()`: ban đầu `current` 0 và chủ đề của giai đoạn 2 có `open` false; giai đoạn 1 xong hết (như test 3) → `current` 1; thêm `t.l1`, `t.l2` xong → `current` 1 (giai đoạn cuối), giai đoạn 2 có `evolution` null và `passed` true.
5. `MapScreen.test.tsx` (viết lại): `heading` "Bản đồ học"; `tablist` "Các giai đoạn" có 1 `tab` "1 Giai đoạn thử" `aria-selected="true"`; link "Bài thử: Tiếp theo" href `#/lesson/t.l1`; `getByRole("link", { name: "Bài thử 2: Chưa mở" })` có `aria-disabled="true"` và không có `href`; thấy "Chủ đề 1", `heading` cấp 2 "Chủ đề thử", "0/2 bài".
6. `t.l1` xong: link "Bài thử: Đã xong" vẫn có href; link "Bài thử 2: Tiếp theo".
7. `reviewBundle()` với `r.l1`, `r.l2` xong: tên các link trong `list` "Chủ đề ôn" theo thứ tự là "Bài r.l1: Đã xong", "Bài r.l2: Đã xong", "Trạm ôn: Tiếp theo", "Bài r.l3: Chưa mở"; "Trạm ôn: Tiếp theo" href `#/review/r.r1`.
8. `examBundle()` với 2 bài xong: link "Kiểm tra chủ đề: Tiếp theo" href `#/topic-test/x.t`; `heading` cấp 2 "Kiểm tra tiến hóa · Giai đoạn 1"; chữ "Mở khi con xong mọi chủ đề của giai đoạn này. Đạt từ 80% thì Robo tiến hóa."; không có link "Làm bài kiểm tra". Thêm kiểm tra chủ đề xong → link "Làm bài kiểm tra" href `#/evolution/x`. Đạt như test 3 → "Đã đạt: 7/7 điểm.".
9. `twoStageBundle()` ban đầu: focus tab "1 Giai đoạn thi", nhấn ArrowRight → tab "2 Giai đoạn thử" `aria-selected="true"` và có tiêu điểm, bảng có link "Bài thử: Chưa mở"; nhấn Home → tab 1 được chọn. Giai đoạn 1 xong: tab 2 được chọn sẵn, tab 1 có mô tả truy cập "Con đã qua giai đoạn này".
10. `lang: "en"`: link "Test lesson: Next".

- [ ] Commit `feat(map): stage tabs and topic rows of square nodes`.

### Task 3: Theme sáng của trình soạn code, thẻ lý thuyết, bong bóng Robo

**Files:** Create `src/ui/editorTheme.ts` (+ `editorTheme.test.ts`), `src/test/contrast.ts`, `src/ui/CodeEditor.test.tsx`. Modify `package.json`, `package-lock.json`, `src/ui/CodeEditor.tsx`, `src/ui/CardView.tsx`, `src/ui/CardView.test.tsx`, `src/ui/CodeExample.tsx`, `src/ui/OutputPanel.tsx`, `src/ui/RobotBubble.tsx`, `src/ui/MisconceptionHelp.tsx`, `src/styles/study.css`, `src/styles.css` (xóa `.code-editor`, `.cm-error-line`, `.robot-bubble`, `.bubble`, `.bubble-hint`, `.output`, `.misconception-card`, `.study-page .card`).

**Interfaces:**
- Produces: `EDITOR_COLORS` (`as const`): `{ background: "#fffdf6", gutterBackground: "#f6efdc", gutterText: "#6b6455", activeLine: "#f8f1de", selection: "#dbe4ff", errorLine: "#ffecec", syntax: { keyword: "#b03a0a", string: "#146c34", number: "#7e22ce", function: "#1d4ed8", comment: "#555555", text: "#141414" } }`; `editorTheme: Extension`.
- Produces: `contrastRatio(foreground: string, background: string): number` (công thức độ sáng tương đối của WCAG 2.x, màu dạng `#rrggbb`).
- Produces CSS: `.box` (khung trắng viền 2px) và `.box-head` (dải đầu nền `#f6efdc`, chữ 12px đậm, chữ hoa, viền dưới 2px) cho tab `main.py`, vùng Kết quả, ô Dữ liệu nhập, vùng Kết quả test.

- `npm install @lezer/highlight@1.2.5`.
- `editorTheme` = `[EditorView.theme({...}, { dark: false }), syntaxHighlighting(HighlightStyle.define([...]))]`: nền, chữ `--font-mono` 16px, rãnh số dòng (viền phải 2px `#efe6cf`), dòng hiện tại, vùng chọn theo `EDITOR_COLORS`; `"&.cm-focused"` outline 3px `--primary` cách 2px; `".cm-line.cm-error-line"` nền `errorLine` và `box-shadow: inset 4px 0 0 var(--coral)` (đặt sau `.cm-activeLine` để thắng khi con trỏ ở dòng lỗi). Màu cú pháp: `keyword`, `controlKeyword`, `definitionKeyword`, `operatorKeyword`, `moduleKeyword` → keyword (đậm 600); `string`, `special(string)` → string; `number`, `bool`, `null` → number; `function(variableName)`, `function(propertyName)`, `className` → function; `comment` → comment (nghiêng).
- `CodeEditor`: `<div className="code-editor box"><div className="code-editor-tab box-head" aria-hidden="true"><span>main.py</span></div><div ref={host} /></div>`; tab chữ đậm trên nền `--yellow`, viền phải 2px; thêm `editorTheme` vào extensions; khung có bóng `--shadow-card`. Chữ "main.py" là hằng `EDITOR_FILE_NAME`, không qua i18n.
- `CardView`: `<div className="card theory-card">` (rộng tối đa 760px, giữa, chữ 17px, dòng 1,6). `CodeExample`: nút "Chạy thử" có icon `play` trước chữ. `OutputPanel`: thêm lớp `box`, dải `<div className="box-head" aria-hidden="true">` chữ `code.output`; `pre` nền `--code-bg`, JetBrains Mono 15px.
- `RobotBubble`: giữ `role="status"`, lớp `robot-bubble`, Robo 56px; `.bubble` viền 2px, bóng `--shadow`, đuôi tam giác đặc màu `--ink` chỉ về Robo (bên trái); `pre` của lỗi gốc nền `--code-bg`.
- `MisconceptionHelp`: nút lớp `small`; thẻ `.misconception-card` thành `card` nền `--chip-xu`.

**Test:**
1. `editorTheme.test.ts`: mọi màu trong `EDITOR_COLORS.syntax` có `contrastRatio` ≥ 4,5 với `background`, `activeLine`, `errorLine` và `selection`; `gutterText` ≥ 4,5 với `gutterBackground`; `contrastRatio("#ffffff", "#2f5bea")` gần bằng 5,52 (`toBeCloseTo(5.52, 1)`).
2. `CodeEditor.test.tsx` (CodeMirror thật, như các test `AppRoutes` đang dựng `ExamCodeView`): có `textbox` "Trình soạn code"; `.code-editor-tab` có chữ "main.py" và `aria-hidden="true"`; `errorLine={1}` → có đúng 1 `.cm-error-line`; render lại với `errorLine={null}` → 0; gõ chữ gọi `onChange`.
3. `CardView.test.tsx`: thẻ có lớp `theory-card`; nút "Chạy thử" chứa `svg[data-icon="play"]`. Test hiện có giữ nguyên.

- [ ] Commit `feat(ui): light code editor theme, theory cards and Robo's bubble`.

### Task 4: Bài code chia đôi và kết quả test

**Files:** Create `src/ui/ExampleTable.tsx`, `src/ui/ExerciseHelp.tsx`, `src/ui/TestResultList.test.tsx`. Modify `src/ui/CodeExerciseView.tsx`, `src/ui/CodeExerciseView.test.tsx`, `src/ui/ExamCodeView.tsx`, `src/ui/ExamCodeView.test.tsx`, `src/ui/TestResultList.tsx`, `src/ui/PuzzleExerciseView.tsx` (chỉ đổi chỗ import hằng số), `src/ui/LessonScreen.test.tsx`, `src/styles/study.css`, `src/styles.css` (xóa `.exercise-split`, `.exercise-left, .exercise-right`, `.input-label*`, `.exercise-actions`, `.test-results*`, `.diff`, `.diff-line`, `.exercise-left pre`, `.diff pre`; chuyển `.hint` và `.exam-answered` sang `study.css`), i18n.

**Interfaces:**
- Consumes: `CodeEditor`, `OutputPanel`, `RobotBubble`, `.box`, `.box-head` (Task 3); `.kicker` (Task 1); `Icon`.
- Produces: `ExampleTable({ input, output }: { input: string; output: string })`: `<div className="example-table">`, mỗi cột là `<div>` gồm `<span className="example-label">` rồi ngay sau là `<pre>` (giá trị đã `trimEnd()`); cột "Dữ liệu nhập" (`judge.input`) chỉ có khi `input !== ""`, cột "Kết quả mong đợi" (`exercise.expectedOutput`) luôn có.
- Produces: `ExerciseHelp({ hints, shown, onHint, failedSubmits, solution, solutionShown, onShowSolution, finished = false }: { hints: LocalizedText[]; shown: number; onHint(): void; failedSubmits: number; solution: string; solutionShown: boolean; onShowSolution(): void; finished?: boolean })`; `FAILED_SUBMITS_BEFORE_SOLUTION = 3` chuyển từ `CodeExerciseView.tsx` sang file này.

- `ExerciseHelp`: các gợi ý đã mở như hiện tại (`<p className="hint">` "Gợi ý n: …"); nút `small` `hint.button` (n = `shown + 1`, total = số gợi ý) khi `shown < hints.length && !finished`; nút `small` "Xem lời giải" khi `!solutionShown && !finished`, `disabled` khi `failedSubmits < 3`, lúc đó có `<small aria-hidden="true">` `solution.after`; khối lời giải như hiện tại.
- `CodeExerciseView` theo mục 2 của mockup, `.exercise-split` 2 cột 45:55 (dưới 900px 1 cột):
  - Trái `<section className="card problem-card">` (cột dọc): `<p className="kicker">` `exercise.kindCode`, đề, `ExampleTable` của test hiện đầu tiên, `ExerciseHelp`, `RobotBubble` ở cuối thẻ (`margin-top: auto`).
  - Phải `<section className="ide">`: `CodeEditor`; hàng `.io` 2 cột: `<label className="box input-box">` (`<span className="box-head">` `code.inputLabel` rồi `textarea` JetBrains Mono), cột kết quả (`code.running`, `OutputPanel`, `TestResultList`); hàng nút căn phải: "Chạy thử" (icon `play`), "Nộp bài" (`primary`).
  - State mới `solved` (đặt `true` khi `accepted`, không đặt lại) truyền vào `finished`. Chấm bài, phản hồi, nháp, thống kê giữ nguyên.
- `ExamCodeView`: cùng bố cục; trái có `LangSwitch`, `Prompt`, `ExampleTable`; không có `ExerciseHelp` và không có vùng kết quả test; thông báo `exam.submitted` dưới hàng nút.
- `TestResultList`: `<div className="box test-box">` gồm `<div className="box-head">` `judge.summary` (`passed` = `result.passedCount`, `total` = `result.total`) và `<ol aria-label={t("judge.results")}>`. Mỗi dòng: `<span className="test-mark" aria-hidden="true" />` (vuông 14px viền 2px; đúng `--stat-pin`, sai `--coral`, chưa chạy xám), tên test, ":", chữ trạng thái như hiện tại. Test hiện, đã chạy, bị sai đầu tiên: phần so sánh mở ngay dưới dòng; các test hiện, đã chạy, bị sai khác: phần so sánh trong `<details>` đóng với `<summary>` `judge.showDiff`. Phần so sánh: "Dữ liệu nhập" (nếu có) ở trên; dưới là 2 cột "Mong đợi" và "Code của con in ra", mỗi cột `DiffLines` như hiện tại (dòng khác đầu tiên nền `--danger-bg`).
- i18n mới (vi / en): `exercise.kindCode` "Bài tập code" / "Code exercise"; `judge.summary` "Kết quả test · {passed}/{total} đúng" / "Test results · {passed}/{total} pass"; `judge.showDiff` "Xem so sánh" / "Show the comparison"; `hint.button` "Gợi ý {n}/{total}" / "Hint {n}/{total}"; `solution.after` "sau {n} lần sai" / "after {n} wrong submits".

**Test:**
1. `TestResultList.test.tsx` với 1 `JudgeResult` sai có 3 test (test 1 hiện, `expected` "1\n2", `actual` "1\n3", `firstDiffLine` 1; test 2 hiện, sai; test 3 ẩn, sai): thấy "Kết quả test · 0/3 đúng"; list "Kết quả chấm" có 3 `listitem`, mỗi dòng có `.test-mark` `aria-hidden`; dòng 1 có "Mong đợi" và "Code của con in ra" không nằm trong `details`, `.diff-line` của dòng 1 có chữ "2\n" và "3\n"; dòng 2 có `details` không `open`, `summary` "Xem so sánh", chứa "Mong đợi"; dòng 3 có "Test ẩn" và không có "Mong đợi".
2. `CodeExerciseView.test.tsx`: thấy "Bài tập code"; test `fixtureCodeExercise` có `input` rỗng → không có chữ "Dữ liệu nhập" trong `.example-table`; bài có `input` "5" → có. Các nút gợi ý: "Gợi ý 1/2", rồi "Gợi ý 2/2", rồi không còn nút gợi ý (thay test "hints appear one by one" và các chỗ dùng "Gợi ý", "Gợi ý tiếp"; test "starts from the saved stats" tìm "Gợi ý 2/2"). "Xem lời giải" `disabled` và có chữ "sau 3 lần sai" sau 2 lần nộp sai, bật sau lần thứ 3 (thay kiểm "không có nút"). Nộp đúng → không còn nút "Gợi ý 1/2" và "Xem lời giải".
3. `LessonScreen.test.tsx`: nút "Gợi ý" thành "Gợi ý 1/2".
4. `ExamCodeView.test.tsx`: các test hiện có giữ nguyên (gồm kiểm không có chữ khớp `/Đúng hết|Chính xác|test/` sau khi nộp); thêm: không có nút tên bắt đầu bằng "Gợi ý" và không có "Xem lời giải".

- [ ] Commit `feat(lesson): the code exercise in a split layout with the test results box`.

### Task 5: Sắp xếp dòng, điền chỗ trống, trắc nghiệm

**Files:** Modify `src/ui/icons.tsx`, `src/ui/icons.test.tsx`, `src/ui/PuzzleExerciseView.tsx`, `src/ui/PuzzleExerciseView.test.tsx`, `src/ui/QuestionCard.tsx`, `src/ui/QuestionCard.test.tsx`, `src/styles/base.css` (`.lang-switch`), `src/styles/study.css`, `src/styles.css` (xóa `.puzzle`, `.parsons-*`, `.fill-template*`, `.question-card*`, `.choice*`), i18n.

**Interfaces:**
- Consumes: `ExampleTable`, `ExerciseHelp`, `FAILED_SUBMITS_BEFORE_SOLUTION` (Task 4); `TestResultList`, `RobotBubble`; `.kicker`.
- Produces: `IconName` thêm `"cross"` với `d` = `M4 4 L14 14 M14 4 L4 14`.

- `PuzzleExerciseView`: `<div className="card puzzle-card">` gồm `.kicker` (`exercise.kindParsons` hoặc `exercise.kindFill`), đề, `ExampleTable`, phần làm bài, `ExerciseHelp` (`finished={solved}`), nút "Nộp bài" `primary`, `code.running`, `RobotBubble`, `TestResultList`. Logic và thứ tự xử lý giữ nguyên.
- Sắp xếp dòng: mỗi `li` là 1 khối viền 2px, bóng `--shadow`, nền `--code-bg`; `li:focus-within` nền `--yellow` (khối "đang chọn"); 2 nút ↑ ↓ lớp `small` giữ `aria-label`, `data-dir` và cách giữ tiêu điểm hiện tại.
- Điền chỗ trống: `.fill-template` là khối code sáng viền 2px; `input` trong đó vuông, viền 2px, đệm `0 4px`, cao `1.6em`, cùng font và cỡ chữ với code, `vertical-align: baseline` (sửa minor R1: ô cao hơn dòng).
- `QuestionCard`: `<div className="card question-card">` (rộng tối đa 760px, giữa); hàng đầu có `.kicker` (`question.kindPredict` hoặc `question.kindMcq`) bên trái và `LangSwitch` bên phải; đề; khối code; `fieldset` các lựa chọn.
  - Mỗi lựa chọn là `<label>` rộng hết thẻ, viền 2px: lớp `choice`, thêm `choice-selected` (nền `--yellow`) khi đang chọn, ở cả chế độ kiểm tra; sau "Kiểm tra" (không phải `exam`): đáp án đúng thêm `choice-correct` (nền `--mint`) và icon `check`, lựa chọn sai đã chọn thêm `choice-wrong` (nền `--danger-bg`) và icon `cross`; icon nằm cuối `label`.
  - Lựa chọn có dấu: radio có `aria-describedby` trỏ tới `<span className="sr-only" id=...>` đặt ngay sau `label` (ngoài `label`) với chữ `question.markCorrect` hoặc `question.markWrong`; `id` từ `useId()` + chỉ số.
  - Chế độ `exam`: không có lớp đúng sai, không có icon, không có `aria-describedby`.
- `.lang-switch` (dùng chung với thanh bên): nút chưa chọn khi `:hover` nền `--bg` (minor R1).
- i18n mới (vi / en): `exercise.kindParsons` "Sắp xếp dòng code" / "Put the lines in order"; `exercise.kindFill` "Điền chỗ trống" / "Fill in the blanks"; `question.kindPredict` "Đoán kết quả" / "Predict the output"; `question.kindMcq` "Trắc nghiệm" / "Multiple choice"; `question.markCorrect` "Đáp án đúng" / "Right answer"; `question.markWrong` "Con chọn câu này, chưa đúng" / "Your choice, not right". Xóa `exercise.example`, `hint.show`, `hint.next`.

**Test:**
1. `icons.test.tsx`: thêm `"cross"` vào danh sách.
2. `QuestionCard.test.tsx`: predict có "Đoán kết quả", mcq có "Trắc nghiệm"; chọn "Lỗi" → `label` của nó có lớp `choice-selected`; chọn "Lỗi" rồi "Kiểm tra" → `label` "Lỗi" có `choice-wrong` và `svg[data-icon="cross"]`, `label` "A" có `choice-correct` và `svg[data-icon="check"]`; radio "Lỗi" có mô tả truy cập "Con chọn câu này, chưa đúng", radio "A" có "Đáp án đúng"; tên 2 radio vẫn là "Lỗi" và "A".
3. Review Focus 3, `exam`: chọn "Lỗi", bấm "Chọn đáp án này" → `label` "Lỗi" có `choice-selected`; trong `fieldset` không có `[data-icon="check"]`, `[data-icon="cross"]`, `.choice-correct`, `.choice-wrong`; cả 2 radio có mô tả truy cập rỗng (`toHaveAccessibleDescription("")`).
4. `PuzzleExerciseView.test.tsx`: parsons có "Sắp xếp dòng code", fill có "Điền chỗ trống"; nút gợi ý "Gợi ý" thành "Gợi ý 1/1"; giải đúng → không có nút "Xem lời giải". `lineTexts` và các test hiện có giữ nguyên.

- [ ] Commit `feat(lesson): square puzzle rows, fill blanks and choice blocks with marks`.

### Task 6: Màn hình kết quả và hoạt cảnh tiến hóa

**Files:** Create `src/ui/ResultView.test.tsx`. Modify `src/ui/ResultView.tsx`, `src/ui/EvolutionTestScreen.tsx`, `src/ui/EvolutionTestScreen.test.tsx`, `src/ui/AppRoutes.test.tsx`, `src/styles/study.css`, `src/styles.css` (xóa `.lesson-done` khỏi `.lesson-done, .crash` và giữ `.crash`; xóa `.room-actions`, `.result-rewards`, `.evolution-done`; đổi màu `.evolution-show`, `.evo-from`, `.evo-part`, `.evo-skip`), i18n.

**Interfaces:**
- Consumes: `GoalSquares` (Task 1); `Icon`; `PetRobot`.
- Produces: `RewardChips({ xp = 0, xu = 0, pin = 0, vui = 0 }: { xp?: number; xu?: number; pin?: number; vui?: number })` xuất từ `ResultView.tsx`: `<ul className="reward-chips" aria-label={t("result.rewards")}>` với 1 `<li className="chip chip-big chip-…">` cho mỗi giá trị lớn hơn 0 (chuỗi `result.xp`, `result.xu`, `result.pin`, `result.vui` như hiện tại); tất cả bằng 0 thì trả `null`.

- `ResultView`: `<main className="result-page"><section className="card result-card">` giữa trang, rộng tối đa 560px: `PetRobot` vui 96px, `h1` `title`, `message`, `RewardChips` (XP nền `--primary` chữ `--on-primary`; xu `--chip-xu`; Pin `--chip-pin`; Vui `--chip-streak`; chữ 18px đậm 800), dòng `room.today` cạnh `GoalSquares` (`todayPoints` trên `dailyGoal`), chip `chip chip-streak` có icon `flame` và chữ `room.streak`, hàng hành động `<div className="result-actions">`: link `button primary` "Học tiếp" (nếu có), các link `button` "Luyện thêm: …", nút "Về phòng" (`onExit`). Thứ tự ưu tiên giữ như hiện tại (tài liệu thiết kế 13.17).
- `EvolutionPassed`: cùng thẻ; `div.evolve` với `PetRobot` 200px như hiện tại; `h1` nhận tiêu điểm như hiện tại; điểm; `RewardChips xu={xu} vui={vui}`; hàng hành động như `ResultView`.
- `EvolutionFailed`: cùng thẻ; `h1` `evolution.failTitle` (đổi từ `h2`); `evolution.failBody`; điểm; `h2` `evolution.weakTitle` với `<ul className="concept-chips">` mỗi khái niệm 1 `li` lớp `chip`; hàng hành động: link `button primary` "Bắt đầu ôn tập trọng tâm" hoặc "Thi lại" như hiện tại, nút "Về phòng".
- `EvolutionShow`: logic và cấu trúc giữ nguyên; CSS theo Quyết định 10 (`.evolution-show` nền `var(--ink)`, `.evo-skip` nền trắng chữ `--ink` viền 2px trắng bóng `3px 3px 0 var(--yellow)`, `:focus-visible` outline 3px `--yellow`).
- i18n mới (vi / en): `result.rewards` "Phần thưởng" / "Rewards".

**Test:**
1. `ResultView.test.tsx`: `after` hơn `before` 28 XP, 8 xu, 1 Pin → list "Phần thưởng" có 3 `listitem` "+28 XP", "+8 xu", "Pin +1"; `heading` cấp 1 bằng `title`; thấy "Mục tiêu hôm nay: 1/2" và "Chuỗi: 0 ngày"; link "Học tiếp" có lớp `primary` và đứng trước nút "Về phòng" trong thứ tự tài liệu (`compareDocumentPosition`); nút "Về phòng" không có lớp `primary`. `after` bằng `before` → không có list "Phần thưởng".
2. `EvolutionTestScreen.test.tsx`: "Robo đã tiến hóa!" và "Lần này chưa đạt" là `heading` cấp 1; "Khái niệm k1" nằm trong `li` lớp `chip`. Test hiện có giữ nguyên (tiêu điểm, `data-size` 200, "+100 xu", link).
3. Review Focus 2, `AppRoutes.test.tsx` (runner trả "Hi\n"): từ phòng bấm "Học tiếp" → đúng 1 `heading` cấp 1, tên "Bài 1 · Bài thử"; làm hết bài `t.l1` (2 thẻ, nộp bài code, chọn "A", "Kiểm tra", "Hoàn thành") → đúng 1 `heading` cấp 1, tên "Hoàn thành bài học!"; bấm link "Học tiếp" → đúng 1 `heading` cấp 1, tên "Bài 2 · Bài thử 2".

- [ ] Commit `feat(ui): result cards with reward chips and the restyled evolution show`.

### Task 7: E2E và kiểm tra toàn bộ

**Files:** Modify `e2e/review.spec.ts`, `e2e/exam.spec.ts`, `e2e/progress.spec.ts`, `e2e/lesson.spec.ts`, `src/styles.css` (chỉ khi còn quy tắc chết của màn hình học).

- Bản đồ: các chỗ `getByRole("listitem").filter({ hasText })` với "Đã xong" / "Bài tiếp theo" đổi sang link theo tên: `review.spec.ts` dòng 51-52 ("Trạm ôn: Đã xong" `.first()`, "Lệnh chạy từ trên xuống: Tiếp theo"), `exam.spec.ts` dòng 91-92 ("Kiểm tra chủ đề: Đã xong" `.first()`, "Chuỗi là gì?: Tiếp theo"), `progress.spec.ts` dòng 32 ("Chương trình là gì?: Đã xong").
- `lesson.spec.ts` "explains an error…": thêm `page.locator(".code-editor-tab")` có chữ "main.py"; `box-shadow` tính được của `.cm-error-line` chứa `rgb(255, 107, 107)`.
- Review Focus 4, test mới trong `lesson.spec.ts`: `page.setViewportSize({ width: 800, height: 700 })`, `startApp`, bấm "Học tiếp": `heading` cấp 1 thấy được; `boundingBox` của `.focus-bar` cao 60; `boundingBox` của `h1` và của chip "Xu: 0" nằm trọn trong hộp của `.focus-bar` (trên, dưới) và mép phải không quá 800; `document.documentElement.scrollWidth <= window.innerWidth`.
- Rà `src/styles.css`: mọi selector của màn hình học còn lại phải có phần tử dùng trong `src/ui/` (tìm bằng `grep`); xóa selector không còn dùng (ví dụ `.lesson-list a`, `.badge-done`).

**Test:** `npm run check` xanh (lint, typecheck, Vitest, pytest, content, Playwright).

- [ ] Commit `test(e2e): map links by name and the focus bar at 800 px`.
