# R3 – Các màn hình còn lại: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cửa hàng, Sổ thành tích, Sao lưu, màn hình PIN và 5 mục của khu phụ huynh, các màn hình lỗi, trang `#/gallery` và trang `public/huong-dan.html` theo hệ thống "Nhãn dán đậm"; tab của khu phụ huynh và tab Cửa hàng theo đúng mẫu ARIA `tablist`.

**Architecture:** Các trang trong khung có thanh bên dùng chung hàng tiêu đề `PageHead` và lớp `.page`. Phím của tab (mũi tên, Home, End) do 1 hàm thuần `tabKeyTarget` tính, dùng chung cho tab Cửa hàng và tab phụ huynh. Màn hình lỗi dùng chung `ErrorCard` (Robo dạng 1 hết pin, tiêu đề, giải thích, nút). CSS của R3 nằm trong 3 file mới `src/styles/pages.css`, `parent.css`, `errors.css`, chỉ dùng token (không có mã màu hex); mỗi task xóa các quy tắc cũ trong `src/styles.css` mà nó thay thế. Không đổi `GameState`, `SCHEMA_VERSION`, luật chơi hay nội dung.

**Tech Stack:** Như hiện tại, không thêm dependency.

**Spec:** `docs/superpowers/specs/2026-10-27-ui-revamp-design.md` (mục 5, 6.2, 7.7 đến 7.11, 8, 10, 11, 12 mốc R3, 13). Hành vi vẫn theo `docs/superpowers/specs/2026-10-06-py-pet-design.md` (mục 5.12, 8.2, 9, 10). Mockup: `docs/superpowers/specs/ui-revamp-mockups/3-other-screens.html` mục 3 (cửa hàng), 4 (sổ thành tích), 5 (tổng quan phụ huynh). Kế hoạch trước: `2026-10-27-r1-nen-tang-giao-dien.md`, `2026-10-27-r2-man-hinh-hoc.md`. Việc R1 để lại: `docs/superpowers/ledgers/r1-sdd-ledger.md` (Task 7 minor: id tab phụ huynh, roving tabindex, tên tablist, `h1` của màn hình PIN).

## Global Constraints

- Phạm vi R3: tài liệu thiết kế mục 12 dòng R3, trừ "dọn CSS cũ" chung: R3 chỉ xóa quy tắc của màn hình R3 (cửa hàng, sổ thành tích, huy hiệu, sao lưu, khu phụ huynh, màn hình lỗi, gallery). Việc dọn chung làm sau khi gộp R2 và R3.
- Phối hợp với R2 (đang chạy song song trên `feat/ui-revamp`): không sửa `MapScreen`, `mapModel`, `LessonScreen`, `CardView`, `CodeExerciseView`, `CodeEditor`, `editorTheme`, `OutputPanel`, `TestResultList`, `PuzzleExerciseView`, `QuestionCard`, `ItemView`, `ReviewScreen`, `SessionScreen`, `PracticeScreen`, `AssignedPracticeScreen`, `RemedialScreen`, `ExamRunner`, `ExamCodeView`, `TopicTestScreen`, `EvolutionTestScreen`, `ResultView`, `EvolutionShow`, `RobotBubble`, `MisconceptionHelp`, `src/ui/shell/FocusLayout.tsx`, `FocusTitle.tsx`, `Squares.tsx`, `src/styles/study.css`, `src/styles/map.css`, `e2e/lesson.spec.ts`, `review.spec.ts`, `exam.spec.ts`. Tránh sửa `src/ui/AppRoutes.test.tsx` và `e2e/progress.spec.ts` (R2 đang sửa): test mới của R3 nằm trong file mới.
- Khóa i18n mới đặt cạnh các khóa cùng nhóm (`shop.*`, `achievements.*`, `backup.*`, `parent.*`, `overview.*`, `app.*`), không dồn ở cuối file.
- Màu dùng token trong `src/styles/tokens.css`; màu nhạt mới tạo bằng `color-mix(in srgb, var(--token) n%, var(--surface))` như `map.css` của R2. 3 file CSS mới không có mã hex và không có `border-radius` khác 0 (test ở Task 1).
- `border-radius: 0` cho mọi thành phần giao diện. Robo, phụ kiện và đồ trang trí giữ nguyên nét vẽ.
- Mọi cặp chữ và nền mới đạt WCAG AA (4,5:1; chữ từ 18,66px đậm: 3:1). Trạng thái không chỉ thể hiện bằng màu (món đang đeo, huy hiệu chưa có, ngày nghỉ trên biểu đồ).
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder. Khóa không còn dùng thì xóa ở cả 2 file. Trang `huong-dan.html` và `#/gallery` không qua i18n (như hiện tại).
- Tìm phần tử trong test theo vai trò và tên truy cập. Giữ đúng các tên mà test unit và e2e đang dùng: nút "Mua {món}", "Dùng {món}", "Đeo {món}", "Tháo {món}", "Đổi {phần thưởng}", tab "Đồ cho {tên}", "Phần thưởng từ bố mẹ", "Tổng quan", "Con cần hỗ trợ", "Tiến độ", "Phần thưởng", "Cài đặt", ô "Mã PIN", nút "Mở", "Quên mã PIN?", "Xác nhận", "Xuất file sao lưu", "Nhập dữ liệu (thay dữ liệu hiện tại)", "Hủy", "Tải về", "Tải lại trang", "Khóa và quay lại", ô "Chọn file .pypet", chữ "Con có {n} xu", "Có {n}", "Nhận ngày {day}", "Chưa có", các chữ cảnh báo `overview.*`, "Không có cảnh báo.", "Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.". Món trong cửa hàng và huy hiệu vẫn là `li`.
- Giữ `prefers-reduced-motion`: mọi chuyển tiếp mới tắt khi bật giảm chuyển động.
- Mỗi task chạy `npx vitest run` cho các file liên quan, `npm run lint`, `npm run typecheck`. E2E chạy ở Task 7. Trước mỗi lần chạy e2e, kiểm `lsof -nP -iTCP:4173 -iTCP:4174 -sTCP:LISTEN`; cổng bận thì chờ, không dùng lại server của session khác (chạy `CI=1 npx playwright test` để Playwright không dùng lại server đang chạy). Dev server của R3 dùng cổng 5190.
- Không merge, không push. Commit message kết thúc bằng trailer theo hướng dẫn attribution của phiên đang chạy.

## Review Focus

1. Bàn phím trên tab Cửa hàng và tab phụ huynh: chỉ tab đang chọn nằm trong thứ tự phím Tab; mũi tên, Home, End đổi tab và chuyển tiêu điểm; panel có tên là tên tab. Test: Task 1, Task 4.
2. Bấm "Xem" ở 1 thẻ cảnh báo của Tổng quan: mục đổi, thanh bên chọn đúng mục, tiêu điểm về `h1` (nút "Xem" vừa biến mất, tiêu điểm không rơi về `body`), và khu vẫn tự khóa sau 5 phút. Test: Task 4.
3. Lỗi giao diện trong 1 mục phụ huynh: trang vẫn có đúng 1 `h1` (tên mục), tiêu đề của thẻ lỗi là `h2`, thanh bên phụ huynh còn. Lỗi trong khung có thanh bên: thẻ lỗi có `h1` và trang có đúng 1 `h1`. Test: Task 6.
4. Cửa sổ rộng 800px: Cửa hàng, Sổ thành tích, Sao lưu và Tổng quan phụ huynh không cuộn ngang và `h1` thấy được. Test: Task 7.
5. Trang Hướng dẫn mở dưới `/py-pet/`: font Lexend tải được, link "Mở app" về app, mục `#bo-me` (Landing trỏ tới) còn. Test: Task 7.

Kiểm bằng mắt khi người bảo trì thử app (không có test tự động): lưới 5 cột của Cửa hàng với lý do dài ("Xu đang được giữ cho phần thưởng chờ duyệt"); chú thích ngày nhận huy hiệu không bị cắt ở mép phải; biểu đồ 7 ngày khi mọi ngày là 0 phút; nút chọn file của Sao lưu; trang Hướng dẫn trên cửa sổ hẹp.

## Quyết định thiết kế

Theo mục 13 của tài liệu thiết kế. Các quyết định Claude chốt khi lập kế hoạch (người bảo trì xem lại):

1. **CSS của R3** nằm trong `src/styles/pages.css` (khung trang con, bảng, ô PIN, Cửa hàng, Sổ thành tích, Sao lưu), `parent.css` (màn hình PIN, khu phụ huynh) và `errors.css` (màn hình lỗi), import trong `src/styles.css` ngay sau `map.css`. Khối `.parent`, `.parent-gate` cuối `shell.css` chuyển sang `parent.css`.
2. **Tab Cửa hàng và tab phụ huynh** kích hoạt theo tiêu điểm (như tab giai đoạn của bản đồ, R2 quyết định 3): mũi tên đổi tab ngay. Tab Cửa hàng ngang (ArrowLeft, ArrowRight), tab phụ huynh dọc (ArrowUp, ArrowDown); cả 2 vòng và có Home, End. Tablist phụ huynh có tên "Các mục của khu phụ huynh"; id tab lấy từ `parentTabId`.
3. **Lý do của nút tắt trong Cửa hàng** ("Chưa đủ xu", "Pin đã đầy"…) là 1 dòng chữ đậm đủ tương phản ngay trên hàng nút, gắn vào nút bằng `aria-describedby`; nút giữ chữ "Mua", "Dùng". Khác mockup (lý do nằm trên nút): nút tắt mờ 0,45 nên chữ trên nút không đạt AA, và món Pin, Vui có 2 nút với 2 lý do khác nhau.
4. **Ô hình trong Cửa hàng:** Pin và Vui dùng `StatIcon`; phụ kiện và đồ trang trí dùng `ItemIcon` (hình vuông cắt từ `AccessoryArt` và `DecorArt`, đã có test "mỗi món có hình"). Dòng tác dụng: Pin, Vui ghi chỉ số tăng; phụ kiện ghi chỗ đeo; đồ trang trí ghi "Đặt trong phòng". Màu nền ô hình theo nhóm: Pin `--chip-pin`, Vui hồng nhạt, phụ kiện xanh nhạt, trang trí `--chip-xu`, phần thưởng `--chip-streak`.
5. **Huy hiệu:** ô ký hiệu là số hoặc chữ ngắn không cần dịch (bảng ở Task 2), riêng "Đạt kiểm tra chủ đề" và "Đạt kế hoạch tuần" dùng biểu tượng `trophy`, `chart`. Huy hiệu đã có nhận tiêu điểm (`tabIndex` 0) để chú thích ngày nhận hiện được bằng bàn phím; huy hiệu chưa có màu xám, thêm biểu tượng ổ khóa và chữ "Chưa có" cho trình đọc màn hình.
6. **Sổ thành tích** xếp theo mockup: các dạng Robo, huy hiệu, 2 thẻ số. Dạng hiện tại là `formOf(state.pet.stage)` (đã tốt nghiệp thì dạng 4) và ghi "Giai đoạn n · hiện tại".
7. **Sao lưu:** bảng bản sao lưu tự động vẫn chỉ hiện sau khi nhập PIN (như hiện tại); cột "Ngày", "Hồ sơ" và nút "Tải về".
8. **Tổng quan:** thẻ cảnh báo đổi thưởng, cần hỗ trợ và đồng hồ bị chỉnh lùi có nút "Xem" chuyển tới mục Phần thưởng, Con cần hỗ trợ, Cài đặt; thẻ nhắc sao lưu có link "Xem" tới `#/backup` (rời khu phụ huynh thì khu khóa, như mọi lối ra). Đỏ nhạt cho khái niệm cần hỗ trợ, vàng cho các thẻ khác. Biểu đồ ghi thứ trong tuần dưới cột (T2…CN) và số phút trên cột; câu đầy đủ "{ngày}: {n} phút" vẫn có cho trình đọc màn hình.
9. **Hàng tiêu đề khu phụ huynh** ghi "Hồ sơ của {tên con}" bên phải ở mọi mục (mockup chỉ vẽ ở Tổng quan).
10. **Màn hình lỗi:** tiêu đề mới cho 3 màn hình chưa có tiêu đề: lỗi giao diện "Robo gặp sự cố", tab thứ 2 "Mở Py-Pet ở 1 tab thôi nhé", lỗi tải hồ sơ "Chưa mở được hồ sơ"; câu giải thích giữ chuỗi hiện có. Thẻ lỗi trong khung dùng `h1` (màn hình bị lỗi không còn `h1`), riêng lỗi trong 1 mục phụ huynh dùng `h2`. Lớp `.crash` không còn dùng; quy tắc `.lesson-done, .crash` trong `src/styles.css` để nguyên vì R2 sửa dòng đó, việc dọn chung sẽ xóa.
11. **Trang Hướng dẫn** chỉ có tông sáng (bỏ chế độ tối, như app), font qua `./fonts.css`, token chép vào CSS nội tuyến, thanh trên có logo và nút "Mở app", mục lục là lưới thẻ link tới từng phần.
12. **Trang gallery** giữ style nội tuyến (bản build không mang CSS của gallery), chỉ đổi sang token mới và cỡ tiêu đề mới.

---

### Task 1: Khung trang con và Cửa hàng

**Files:** Create `src/ui/tabKeys.ts` (+ `tabKeys.test.ts`), `src/ui/shell/PageHead.tsx`, `src/styles/pages.css`, `src/styles/parent.css`, `src/styles/errors.css` (2 file sau chỉ có chú thích đầu file; Task 4 và Task 6 viết tiếp). Modify `src/styles.css` (3 dòng `@import` ngay sau `map.css`; xóa `.tabs`, `.tabs [aria-selected="true"]`, `.shop-items`, `.shop-item`, `.shop-name`, `.item-icon`, `.item-icon-pin`, `.item-icon-vui`, `.shop-price, .shop-detail`, `.shop-actions`, `.shop-actions > span` cùng chú thích của chúng; đổi `.achievements, .shop` thành `.achievements`), `src/styles/tokens.test.ts`, `src/ui/ShopScreen.tsx`, `src/ui/ShopScreen.test.tsx`, i18n.

**Interfaces:**
- Produces: `tabKeyTarget(key: string, index: number, count: number, orientation: "horizontal" | "vertical"): number | null` — ngang: ArrowRight +1, ArrowLeft −1; dọc: ArrowDown +1, ArrowUp −1; cả 2 vòng; Home → 0; End → `count - 1`; phím khác (kể cả mũi tên của hướng kia) → `null`.
- Produces: `PageHead({ title, children }: { title: string; children?: ReactNode })` → `<div className="page-head"><h1>{title}</h1>{children && <div className="page-head-side">{children}</div>}</div>`.
- Produces CSS (`pages.css`): `.page` (`main` của trang con: rộng tối đa 1180px, giữa, đệm `24px 32px 40px`; dưới 900px `16px 20px 32px`), `.page-head` (flex, 2 đầu, xuống dòng được, cách dưới 18px; `h1` 30px đậm 800, giãn chữ −0,01em, `margin: 0`), `.page-head-side` (flex, gap 10px, chữ 14px `--muted`), `.section-title` (`h2` dạng nhãn: 13px đậm 700, chữ hoa, giãn 0,08em, `--muted`, `margin: 22px 0 10px`), `.page-tabs` (hàng tab vuông: đường kẻ dưới 2px; tab 15px đậm 700, viền 2px trong suốt, không bóng, không dịch khi rê hoặc nhấn; tab chọn nền `--surface`, viền `--ink`, không viền dưới, `margin-bottom: -2px` để nổi lên trên đường kẻ).

- `tokens.test.ts`: thêm test đọc `pages.css`, `parent.css`, `errors.css`: không khớp `/#[0-9a-f]{3,8}\b/i`, và mọi `border-radius` (nếu có) là `0`.
- `ShopScreen` theo mục 3 của mockup, trong `<main className="page shop">`:
  - `PageHead` `shop.title`, bên phải `<span className="chip chip-xu"><Icon name="coin" />{shop.balance}</span>`.
  - `<div role="tablist" aria-label={t("shop.tabsLabel")} className="page-tabs">` 2 nút `role="tab"`: `id` `shop-tab-robot` / `shop-tab-rewards`, `aria-selected`, `aria-controls="shop-panel"`, `tabIndex` 0 cho tab chọn và −1 cho tab kia, `onKeyDown` dùng `tabKeyTarget(…, "horizontal")`: đổi tab, chuyển tiêu điểm, `preventDefault`.
  - `<section role="tabpanel" id="shop-panel" aria-labelledby={id tab chọn}>`.
  - Tab 1: 3 nhóm, mỗi nhóm `h2.section-title` (`shop.consumables`, `shop.accessories`, `shop.decor`) và `<ul className="shop-grid">`.
  - Mỗi món là `<li className="shop-card">` (thêm `wearing` khi đang đeo): `<div className="shop-pic shop-pic-{pin|vui|accessory|decor}" aria-hidden="true">` với `StatIcon` (cỡ 48) hoặc `ItemIcon` (cỡ 54); `<span className="shop-name">`; `<span className="shop-detail">` (Pin, Vui: `result.pin`/`result.vui`; phụ kiện: `shop.slotHead`/`shop.slotFace`/`shop.slotNeck` theo `item.slot`; trang trí: `shop.decorDetail`); món đang đeo thêm `<span className="tag">` `shop.wearing`; Pin, Vui thêm `<span className="shop-have">` `shop.have`; mỗi lý do là `<p className="shop-reason" id={…}>` (id từ `useId()`), nút bị lý do đó chặn có `aria-describedby` trỏ tới nó; hàng cuối `.shop-row`: bên trái giá (`<span className="shop-price"><Icon name="coin" size={14} />{shop.price}</span>`), hoặc `shop.owned` khi đã có, hoặc `shop.gift` với món quà chưa có; bên phải các nút lớp `small` như hiện tại (giữ `aria-label` "{động từ} {tên món}" và logic `disabled`).
  - Tab 2: phần thưởng là `<ul className="shop-grid">` các `li.shop-card` (ô hình `shop-pic-reward` có `Icon gift`, tên, `rewards.limit`, giá, lý do như trên, nút "Đổi"); `rewards.asked` như hiện tại; "Chờ bố mẹ duyệt" (`rewards.pendingTitle`, kèm `rewards.freeXu`) và "Đã đổi trước đây" mỗi phần là `<section className="card">` có `h2` và danh sách như hiện tại.
- CSS (`pages.css`) theo mockup: `.shop-grid` 5 cột từ 1100px, 3 cột từ 760px, 2 cột dưới 760px, gap 16px; `.shop-card` nền trắng, viền 2px, bóng `--shadow-card`, cột dọc; `.shop-pic` cao 84px, viền dưới 2px, giữa; nền theo Quyết định 4 (Vui `color-mix(in srgb, var(--stat-vui) 20%, var(--surface))`, phụ kiện `color-mix(in srgb, var(--primary) 12%, var(--surface))`); tên 14px đậm 700; chi tiết 12px `--muted`; giá 14px đậm 800 có coin `--icon-coin`; `.wearing` outline 3px `--primary` cách −1px; `.tag` 11px đậm 700, viền 2px, nền `--primary`, chữ `--on-primary`; `.shop-reason` 12px đậm 600 màu `--danger`.
- i18n mới (vi / en): `shop.tabsLabel` "Các ngăn của cửa hàng" / "Shop sections"; `shop.wearing` "Đang đeo" / "Wearing"; `shop.slotHead` "Đeo ở đầu" / "Goes on the head"; `shop.slotFace` "Đeo ở mặt" / "Goes on the face"; `shop.slotNeck` "Đeo ở cổ" / "Goes on the neck"; `shop.decorDetail` "Đặt trong phòng" / "Goes in the room".

**Test:**
1. `tabKeys.test.ts`: ngang `("ArrowRight", 0, 2)` → 1, `("ArrowRight", 1, 2)` → 0, `("ArrowLeft", 0, 2)` → 1, `("Home", 1, 2)` → 0, `("End", 0, 5)` → 4, `("ArrowDown", 0, 2)` → `null`; dọc `("ArrowDown", 4, 5)` → 0, `("ArrowUp", 0, 5)` → 4, `("ArrowRight", 0, 5)` → `null`; `("a", 0, 5, "vertical")` → `null`.
2. `tokens.test.ts`: test mới xanh với 3 file mới.
3. `ShopScreen.test.tsx` (các test hiện có giữ nguyên): đúng 1 `heading` cấp 1 "Cửa hàng"; `tablist` "Các ngăn của cửa hàng": tab "Đồ cho Robo" `aria-selected="true"`, `tabIndex` 0, tab kia −1; `tabpanel` có tên "Đồ cho Robo".
4. Review Focus 1: focus tab "Đồ cho Robo", nhấn ArrowRight → tab "Phần thưởng từ bố mẹ" được chọn, có tiêu điểm, panel có "Bố mẹ chưa đặt phần thưởng nào."; nhấn Home → tab 1 được chọn và có tiêu điểm.
5. `heading` cấp 2 "Pin và Vui", "Phụ kiện", "Trang trí phòng"; `row("Kính râm")` có "Đeo ở mặt" và "60 xu"; `row("Chậu cây")` có "Đặt trong phòng".
6. Mua rồi đeo "Kính râm" → `row("Kính râm")` có lớp `wearing` và chữ "Đang đeo"; bấm "Tháo Kính râm" → không còn lớp và chữ đó.
7. Ít xu: nút "Mua Kệ sách" `disabled` và có mô tả truy cập "Chưa đủ xu" (`toHaveAccessibleDescription`); Pin đầy: nút "Dùng {món Pin}" có mô tả "Pin đã đầy".

- [ ] Commit `feat(shop): square item cards in a 5-column grid and keyboard tabs`.

### Task 2: Sổ thành tích

**Files:** Modify `src/ui/AchievementsScreen.tsx`, `src/ui/AchievementsScreen.test.tsx`, `src/styles/pages.css`, `src/styles.css` (xóa `.badges`, `.badge`, `.badge-earned`, `.badge-locked`, `.achievements`, `.forms` kể cả `@media (max-width: 480px)`, `.form`, `.form-reached`, `.form-picture`, `.form-picture svg`, `.form-name`, `.form-locked`, `.form-locked .form-name`, `.form-locked .form-picture svg`, `.form-locked .form-picture::after` cùng chú thích), i18n.

**Interfaces:**
- Consumes: `PageHead`, `.page`, `.section-title` (Task 1); `BADGES`, `BadgeId`, `masteredConcepts`, `practisingConcepts`; `formOf`; `Icon`; `Robot`.
- Produces (trong `AchievementsScreen.tsx`): `BADGE_LOOK: Record<BadgeId, { mark: { text: string } | { icon: IconName }; group: "lessons" | "streak" | "practice" | "test" | "concepts" | "evolution" }>`:

  | Huy hiệu | Ký hiệu | Nhóm |
  |---|---|---|
  | first-lesson, lessons-10, lessons-25, lessons-50 | "1", "10", "25", "50" | lessons |
  | streak-3, streak-7, streak-14, streak-30 | "3", "7", "14", "30" | streak |
  | perfect-review, persistence | "5/5", "+" | practice |
  | topic-test, week-plan | icon `trophy`, icon `chart` | test |
  | concepts-5, concepts-10 | "5", "10" | concepts |
  | evolution-2, evolution-3, evolution-4 | "II", "III", "IV" | evolution |

- `AchievementsScreen` theo mục 4 của mockup, trong `<main className="page achievements">`, `PageHead` `achievements.title`, rồi 3 phần theo thứ tự:
  - Các dạng: `h2.section-title` `achievements.forms`, ngay sau là `<ol className="forms">` 4 `li` (`data-form`, lớp `form form-reached` hoặc `form form-locked`, thêm `form-current` cho dạng hiện tại theo Quyết định 6): `<span className="form-stage" aria-hidden="true">` chứa `Robot` cỡ 100 như hiện tại (dạng chưa đạt vẫn có dấu "?" vẽ bằng CSS), tên (`form.n` hoặc `achievements.locked` như hiện tại), `<small>` `achievements.formStage` hoặc, với dạng hiện tại, `achievements.formCurrent`.
  - Huy hiệu: `h2.section-title` `achievements.badgesCount` (`n` = số huy hiệu đã có, `total` = 17), `<ul className="badges">` mỗi huy hiệu 1 `li` lớp `badge badge-{group}` thêm `badge-earned` hoặc `badge-locked`: `<span className="badge-mark" aria-hidden="true">` (chữ hoặc `Icon`; huy hiệu chưa có thêm `Icon lock` nhỏ ở góc), `<span className="badge-name">`, rồi `<span className="badge-day">` `achievements.earned` (đã có; `li` có `tabIndex={0}`) hoặc `<span className="sr-only">` `achievements.locked` (chưa có).
  - 2 thẻ số: `<div className="concept-counts">` 2 `div.card`, mỗi thẻ `<span className="big">{n}</span>` và chữ `achievements.masteredLabel` / `achievements.practisingLabel`.
- CSS (`pages.css`): `.forms` 4 cột (2 cột dưới 760px), thẻ trắng viền 2px bóng 4px, giữa; `.form-stage` cao 120px, viền 2px, nền `color-mix(in srgb, var(--primary) 12%, var(--surface))`, Robo đứng ở đáy; `.form-locked .form-stage` kẻ sọc xám (`repeating-linear-gradient(45deg, var(--surface) 0 8px, color-mix(in srgb, var(--ink) 10%, var(--surface)) 8px 16px)`), hình xám mờ như hiện tại; `.form-current` outline 3px `--primary` cách −1px. `.badges` lưới `repeat(auto-fill, minmax(96px, 1fr))`, gap 10px; `.badge` viền 2px nền trắng, chữ 12px đậm 600, giữa; `.badge-mark` vuông 40px viền 2px chữ đậm 800, nền theo nhóm (lessons `--mint`, streak `--chip-streak`, practice `--chip-xu`, test `--pink`, concepts `color-mix(in srgb, var(--primary) 20%, var(--surface))`, evolution `--yellow`); `.badge-locked`: nền `--bg`, viền và chữ ký hiệu `--muted`, ô ký hiệu nền trắng, tên `--muted` (7:1). `.badge-day` là chú thích nổi (ẩn kiểu `sr-only`, hiện khi `li:hover` hoặc `li:focus-visible`), như nhãn ô của bản đồ. `.concept-counts` 2 cột, `.big` 34px đậm 800.
- i18n (vi / en): mới `achievements.badgesCount` "Huy hiệu · {n}/{total}" / "Badges · {n}/{total}"; `achievements.formStage` "Giai đoạn {n}" / "Stage {n}"; `achievements.formCurrent` "Giai đoạn {n} · hiện tại" / "Stage {n} · now"; `achievements.masteredLabel` "khái niệm đã vững" / "concepts known well"; `achievements.practisingLabel` "khái niệm đang luyện" / "concepts in practice". Xóa `achievements.badges`, `achievements.concepts`, `achievements.practising`.

**Test** (`AchievementsScreen.test.tsx`; các test về hình, sao vàng, "?" và tên dạng giữ nguyên):
1. Thứ tự `heading` cấp 2: "Các dạng của Robo", "Huy hiệu · 1/17"; 2 thẻ `.concept-counts .card`: thẻ 1 có `.big` "1" và chữ "khái niệm đã vững", thẻ 2 có `.big` "1" và chữ "khái niệm đang luyện" (thay 2 dòng `getByText("Khái niệm …: 1")`).
2. Huy hiệu "Bài học đầu tiên" đã có: `li` có `tabIndex` 0, lớp `badge-earned`, chữ "Nhận ngày 2026-10-01", ký hiệu "1"; "Chuỗi 30 ngày" chưa có: lớp `badge-locked`, không có thuộc tính `tabindex`, có `svg[data-icon="lock"]`, chữ "Chưa có", ký hiệu "30"; "Đạt kiểm tra chủ đề" có `svg[data-icon="trophy"]`.
3. `pet.stage` 2: chỉ `li[data-form="2"]` có lớp `form-current` và chữ "Giai đoạn 2 · hiện tại"; `li[data-form="1"]` có "Giai đoạn 1". Đã tốt nghiệp (`stage` 5): `li[data-form="4"]` có `form-current`.

- [ ] Commit `feat(achievements): Robo's forms, square badges and the 2 concept counts`.

### Task 3: Sao lưu

**Files:** Modify `src/ui/BackupScreen.tsx`, `src/ui/BackupScreen.test.tsx`, `src/styles/pages.css`, `src/styles.css` (xóa `.backup`, `.backup form`, `.backup label`), i18n.

**Interfaces:**
- Consumes: `PageHead`, `.page` (Task 1).
- Produces CSS (`pages.css`, Task 4 và Task 5 dùng lại): `.table` (bảng viền 2px: `border-collapse: collapse`, ô viền 2px `--ink`, đệm `8px 12px`, chữ căn trái, `th` nền `--bg` đậm 700); `.pin-form` (form PIN: lưới gap 12px, rộng tối đa 360px; `label` lưới gap 4px đậm 600; ô nhập rộng hết); `input[type="file"]` có `::file-selector-button` trông như nút phụ (viền 2px, bóng `--shadow-sm`, chữ đậm 700, cách phải 10px).

- `BackupScreen` theo mục 7.9, trong `<main className="page backup-page">`, `PageHead` `backup.title`:
  - `<div className="backup-cards">` 2 cột (1 cột dưới 900px), gap 20px:
    - `<section className="card">`: `h2.card-title` `backup.export`; dòng `backup.lastBackup` hoặc `backup.never`; nút `primary` "Xuất file sao lưu"; `status`/`alert` như hiện tại.
    - `<section className="card">`: `h2.card-title` `backup.import`; bước PIN là `form.pin-form` (lời nhắc, ô "Mã PIN", nút "Xác nhận", `alert` sai PIN); chọn file, lỗi, xem trước và các nút như hiện tại; cảnh báo `backup.tampered` có thêm lớp `banner banner-danger`.
  - Sau khi nhập PIN (điều kiện hiện tại): `<section className="card">` `h2.card-title` `backup.autoTitle`; không có thì `backup.autoNone`; có thì `<table className="table">` với `thead` `backup.autoDate`, `backup.autoProfile`, cột cuối `<th><span className="sr-only">{backup.autoDownload}</span></th>`; mỗi dòng: ngày, tên con, nút `small` "Tải về" (hành vi như hiện tại).
- i18n (vi / en): mới `backup.autoDate` "Ngày" / "Date"; `backup.autoProfile` "Hồ sơ" / "Profile". Xóa `backup.autoItem`.

**Test** (`BackupScreen.test.tsx`; các test hiện có giữ nguyên trừ chỗ ghi dưới đây):
1. Trước PIN: `heading` cấp 1 "Sao lưu", `heading` cấp 2 "Xuất file sao lưu" và "Nhập file sao lưu"; không có `table`.
2. Test "after the PIN, lists the automatic backups and downloads one": thay `findByText("2026-10-05 — Bình")` bằng `findByRole("row", { name: /2026-10-05/ })` chứa `cell` "Bình" và nút "Tải về"; `columnheader` "Ngày" và "Hồ sơ" có mặt.
3. Bước PIN: `form` chứa ô "Mã PIN" có lớp `pin-form`.

- [ ] Commit `feat(backup): export and import cards and a table of automatic backups`.

### Task 4: Màn hình PIN, tab phụ huynh và Tổng quan

**Files:** Modify `src/ui/shell/ParentNav.tsx`, `src/ui/ParentScreen.tsx`, `src/ui/ParentOverview.tsx`, `src/ui/ParentScreen.test.tsx`, `src/styles/parent.css`, `src/styles/shell.css` (chuyển khối `.parent`, `.parent-gate` cuối file sang `parent.css`), `src/styles.css` (xóa `.parent-gate form`, `.alerts`, `.minutes-chart`, `.minutes-day`, `.minutes-bar`, `.minutes-vacation`, `.minutes-vacation .minutes-bar`), i18n.

**Interfaces:**
- Consumes: `tabKeyTarget`, `.page-head`, `.section-title` (Task 1); `.pin-form` (Task 3); `minutesByDay`, `averageXuPerDay`, `conceptsNeedingHelp`, `findConcept`.
- Produces: `parentTabId(tab: ParentTab): string` → `` `parent-tab-${tab}` `` (xuất từ `ParentNav.tsx`, dùng ở `ParentNav` và `aria-labelledby` của panel); `ParentOverview({ onShow }: { onShow(tab: ParentTab): void })`.

- `ParentNav`: `tablist` có `aria-label={t("parent.tabsLabel")}`; tab chọn `tabIndex` 0, tab khác −1; `onKeyDown` dùng `tabKeyTarget(…, "vertical")`: gọi `onTab`, chuyển tiêu điểm tới tab mới (ref theo chỉ số), `preventDefault`.
- `ParentGate` (mục 7.10): `<main className="parent-gate"><section className="card gate-card">`: ô vàng có `Icon lock` (`aria-hidden`), `h1` `parent.title`, `parent.autoLocked` thành `<p role="status" className="gate-note">`, form PIN lớp `pin-form` (lời nhắc, ô "Mã PIN", nút `primary` "Mở"); "Quên mã PIN?" vẫn là `<button type="button">` lớp `link-button` (không viền, không bóng, chữ `--primary` gạch chân). Form đặt lại PIN giữ nội dung, lớp `pin-form`, trong cùng thẻ. Luồng giữ nguyên.
- `ParentArea`: thay `h1` riêng bằng `<div className="page-head">` gồm `h1` (giữ `ref`, `tabIndex={-1}`, tiêu điểm khi mở) và `<p className="page-head-side">` `parent.profileOf` (tên con trong `<b>`). Hàm `show(tab)` đổi tab rồi chuyển tiêu điểm tới `h1` sau khi vẽ lại; truyền vào `ParentOverview onShow`. Panel `aria-labelledby={parentTabId(tab)}`.
- `ParentOverview` theo mục 5 của mockup:
  - `h2.section-title` `overview.alerts`; không có cảnh báo thì `overview.noAlerts`; có thì `<ul className="alert-cards">` mỗi cảnh báo 1 `li.alert-card` (thêm `alert-red` cho khái niệm cần hỗ trợ): `<div><b id={…}>{tiêu đề}</b>{chi tiết && <span>{chi tiết}</span>}</div>` và hành động `small` chữ `overview.show` có `aria-describedby` trỏ tới `b`. Tiêu đề giữ chuỗi hiện có. Thứ tự, chi tiết và hành động: đổi thưởng (chi tiết: các yêu cầu chờ "{tên} · {giá} xu" nối bằng ", "; nút → `onShow("rewards")`), cần hỗ trợ (tên các khái niệm theo `uiLang` nối bằng " · "; nút → `onShow("help")`), nhắc sao lưu (chi tiết `backup.lastBackup` hoặc `backup.never`; link `a.button.small` href `#/backup`), đồng hồ (không chi tiết; nút → `onShow("settings")`).
  - `<div className="overview-grid">` 2 cột `1.4fr 1fr` (1 cột dưới 1100px):
    - Trái `<section className="card">`: `h2.card-title` `overview.minutesTitle`; `<ul className="minutes-chart" aria-labelledby={id h2}>` 7 `li.minutes-day` (thêm `minutes-vacation` ngày nghỉ): `<span className="minutes-value" aria-hidden="true">` (số phút hoặc `overview.vacationShort`), `<span className="minutes-bar" aria-hidden="true" style={{ height }}>` (ngày học: `minutes / most * 100%` với `most` như hiện tại; ngày nghỉ: CSS cố định 10px), `<span className="minutes-label" aria-hidden="true">` `overview.day{n}` với `n = new Date(`${day}T00:00:00Z`).getUTCDay()`, `<span className="sr-only">` `overview.minutes` / `overview.vacationDay` như hiện tại.
    - Phải `<dl className="overview-stats">` 4 `div.card` (`dt` rồi `dd`): `overview.stageLabel` / `overview.stageValue` (`n` = `state.pet.stage`, `title` = tên giai đoạn; bỏ thẻ này khi không có giai đoạn, như hiện tại), `overview.weekLabel` / `overview.weekValue` (`done`, `target` như hiện tại), `overview.streakLabel` / `overview.streakValue`, `overview.xuLabel` / số xu và `<small>` `overview.xuAvg`.
- CSS (`parent.css`): khối chuyển từ `shell.css`; `.gate-card` rộng tối đa 440px, giữa, cách trên 32px, lưới gap 12px; ô ổ khóa 44px viền 2px nền `--yellow`; `.gate-note` nền `--chip-xu` viền 2px đệm `8px 12px`; `.link-button` (không viền, không bóng, không dịch, nền trong suốt, chữ `--primary` gạch chân, đệm 0, `justify-self: start`); `.alert-cards` 2 cột (1 cột dưới 1100px) gap 16px; `.alert-card` flex, viền 2px, bóng 4px, nền `--chip-xu`, `b` 15px, `span` 13px `--ink`, hành động `margin-left: auto`; `.alert-red` nền `--danger-bg`. Biểu đồ: `.minutes-chart` lưới 7 cột cao 190px, căn đáy, viền dưới 2px, không bullet; `li` cột dọc căn đáy; `.minutes-bar` nền `--primary`, viền 2px không viền dưới; `.minutes-vacation .minutes-bar` kẻ sọc xám như `.form-locked` và cao 10px; `.minutes-value` 11px đậm 700; `.minutes-label` 12px `--muted`. `.overview-stats` lưới 2 × 2 gap 12px, `margin: 0`; `dt` 12px `--muted`; `dd` `margin: 2px 0 0`, 20px đậm 800; `dd small` 12px đậm 400 `--muted`, xuống dòng.
- i18n (vi / en): mới `parent.tabsLabel` "Các mục của khu phụ huynh" / "Parent area sections"; `parent.profileOf` "Hồ sơ của {name}" / "Profile of {name}"; `overview.show` "Xem" / "Open"; `overview.vacationShort` "nghỉ" / "off"; `overview.day0` … `overview.day6` "CN", "T2", "T3", "T4", "T5", "T6", "T7" / "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"; `overview.stageLabel` "Giai đoạn" / "Stage"; `overview.stageValue` "{n} · {title}" / "{n} · {title}"; `overview.weekLabel` "Kế hoạch tuần" / "Week plan"; `overview.weekValue` "{done}/{target} bài" / "{done}/{target} lessons"; `overview.streakLabel` "Chuỗi ngày" / "Streak"; `overview.streakValue` "{days} ngày" / "{days} days"; `overview.xuLabel` "Xu" / "Coins"; `overview.xuAvg` "Trung bình {avg} xu/ngày (14 ngày)" / "On average {avg} coins a day (14 days)". Xóa `overview.stage`, `overview.xu`.

**Test** (`ParentScreen.test.tsx`; các test hiện có giữ nguyên trừ test Tổng quan):
1. Màn hình PIN: `heading` cấp 1 "Khu phụ huynh" nằm trong `.gate-card`; nút "Quên mã PIN?" có lớp `link-button`; ô "Mã PIN" nằm trong `form.pin-form`.
2. Mở khu: `tablist` "Các mục của khu phụ huynh"; tab "Tổng quan" `tabIndex` 0, 4 tab khác −1; thấy "Hồ sơ của An".
3. Review Focus 1: focus tab "Tổng quan", ArrowDown → tab "Con cần hỗ trợ" `aria-selected="true"`, có tiêu điểm, `heading` cấp 1 "Con cần hỗ trợ"; ArrowUp 2 lần → "Cài đặt" (vòng); Home → "Tổng quan"; End → "Cài đặt".
4. Test "alerts, study minutes, stage, week plan, streak and xu" (viết lại): 4 chữ cảnh báo như cũ; thẻ đổi thưởng có chi tiết "Kem · 30 xu" và lớp `alert-card`, thẻ cần hỗ trợ có lớp `alert-red`; sr "2026-10-06: 15 phút" và "2026-10-03: nghỉ" còn; `li` của 2026-10-06 có nhãn "T3"; `dt` "Giai đoạn" có `dd` "1 · Giai đoạn thử"; `dt` "Xu" có `dd` chứa "70" và "Trung bình 10 xu/ngày (14 ngày)".
5. Review Focus 2: bấm nút "Xem" trong thẻ đổi thưởng → tab "Phần thưởng" `aria-selected="true"` và `heading` cấp 1 "Phần thưởng" có tiêu điểm; quay lại "Tổng quan", bấm "Xem" của thẻ cần hỗ trợ → `heading` "Con cần hỗ trợ" có tiêu điểm; rồi (fake timers như test tự khóa hiện có) qua 5 phút → thấy "Khu phụ huynh đã tự khóa sau 5 phút không dùng.".
6. `meta.lastBackupAt` cách `FIXED_NOW` 8 ngày (nên `needsBackupReminder` đúng): thẻ "Đã 7 ngày chưa sao lưu." có link "Xem" href `#/backup`; mỗi nút hoặc link "Xem" có mô tả truy cập bằng tiêu đề thẻ của nó.

- [ ] Commit `feat(parent): the PIN card, keyboard tabs and the overview with alert cards and a chart`.

### Task 5: 4 mục còn lại của khu phụ huynh

**Files:** Modify `src/ui/ParentHelp.tsx`, `src/ui/ParentProgress.tsx`, `src/ui/ParentRewards.tsx`, `src/ui/ParentSettings.tsx`, các file test tương ứng, `src/styles/parent.css`, `src/styles.css` (xóa `.help-card`, `.help-numbers`, `.help-tip`, `.help-actions`, `.requests li, .reward-rows li`, `.reward-rows input`, `.parent-progress table`, `.parent-progress th, .parent-progress td`, `.settings-row`, `.parent-settings h2`, `button.danger` và chú thích `/* M4b: parent area */`).

**Interfaces:**
- Consumes: `.table`, `.section-title` (Task 1, 3).

- Nội dung, thứ tự, chuỗi và logic của 4 mục giữ nguyên; chỉ thêm lớp và khung thẻ (mục 7.10):
  - `ParentHelp`: mỗi `article.help-card` thêm lớp `card` (cách nhau 16px); `.help-numbers` là hàng `li` dạng chip (viền 2px, nền `--bg`, 13px đậm 600); `.help-evidence` `pre.code-block` như hiện tại; `.help-tip` là khối nền `--chip-xu` viền 2px; `.help-actions` hàng nút, "Giao thêm bài luyện" thêm lớp `primary`. Danh sách "đang luyện" nằm trong `<section className="card">`.
  - `ParentProgress`: 3 phần, mỗi phần `<section className="card">` có `h2` (bảng chủ đề, lịch sử kiểm tra tiến hóa, chi tiết bài); `table` thêm lớp `table`; danh sách chi tiết bài: tên bài đậm, trạng thái `--muted`, dòng bài tập 14px.
  - `ParentRewards`: 3 phần (yêu cầu chờ duyệt, danh sách phần thưởng, lịch sử) mỗi phần `<section className="card">`; `ul.requests` mỗi `li` là 1 hàng viền 2px nền `--bg` (chữ trái, nút phải); `ol.reward-rows` mỗi `li` là 1 hàng lưới 3 ô nhập (nhãn trên ô) và nút "Xóa"; hàng nút "Thêm phần thưởng", "Lưu danh sách" dưới danh sách.
  - `ParentSettings`: 5 phần (nghỉ, mục tiêu, ngôn ngữ, dữ liệu, nhật ký) mỗi phần `<section className="card">` (thay `div`, `form` mục tiêu nằm trong `section`), cách nhau 16px; `.settings-row` lưới 2 cột (`minmax(12em, 18em) minmax(0, 1fr)`, 1 cột dưới 760px), nhãn đậm 600; `button.danger` nền `--danger`, chữ `--on-primary`; `.error-log` chữ `--font-mono` 13px.
- CSS trong `parent.css`. Không đổi i18n.

**Test** (các test hiện có giữ nguyên):
1. `ParentHelp.test.tsx`: `article` của "Khái niệm c1" có lớp `card`.
2. `ParentProgress.test.tsx`: `table` có lớp `table` và nằm trong 1 phần tử lớp `card`.
3. `ParentRewards.test.tsx`: `heading` cấp 2 của 3 phần mỗi cái nằm trong 1 `section.card`.
4. `ParentSettings.test.tsx`: có 5 `section.card`, mỗi section có đúng 1 `heading` cấp 2.

- [ ] Commit `feat(parent): help, progress, rewards and settings in cards and square tables`.

### Task 6: Màn hình lỗi và trang gallery

**Files:** Create `src/ui/ErrorCard.tsx`, `src/ui/ErrorScreens.test.tsx`. Modify `src/ui/ErrorBoundary.tsx`, `src/ui/UnsupportedBrowser.tsx`, `src/ui/UnsupportedBrowser.test.tsx`, `src/ui/SecondTabScreen.tsx`, `src/ui/GameRoot.tsx`, `src/ui/ParentScreen.tsx` (chỉ `fallback` của `ErrorBoundary` trong panel), `src/ui/ParentScreen.test.tsx`, `src/ui/GalleryScreen.tsx`, `src/styles/errors.css`, `src/styles.css` (xóa `.unsupported h1`; không sửa dòng `.lesson-done, .crash`), i18n.

**Interfaces:**
- Consumes: `Robot`; `RailLayout`, `SideNav` (cho test).
- Produces: `ErrorCard({ title, level = 1, children }: { title: string; level?: 1 | 2; children?: ReactNode })` → `<div className="card error-card"><Robot form={1} mood="drained" size={120} />{level === 1 ? <h1> : <h2>}{title}…{children}</div>`; `CrashFallback({ level = 1 }: { level?: 1 | 2 })` xuất từ `ErrorBoundary.tsx`.

- `CrashFallback`: `<div role="alert" className="error-panel">` + `ErrorCard` `app.crashTitle` với `<p>` `app.crash` và `<div className="error-actions">` các nút như hiện tại ("Tải lại trang", "Xuất file sao lưu" khi có game, `alert` khi xuất lỗi). `ErrorBoundary` dùng `CrashFallback` mặc định như hiện tại.
- `ParentArea`: `ErrorBoundary` trong panel nhận `fallback={<CrashFallback level={2} />}`.
- `UnsupportedBrowser`: `<main className="error-page" role="alert">` + `ErrorCard` tiêu đề `browser.unsupportedTitle`, `<p>` `browser.unsupportedAdvice` (vẫn `translate(lang, …)`, không provider).
- `SecondTabScreen`: `<main className="error-page">` + `ErrorCard` `app.otherTabTitle`, `<p>` `app.otherTab`.
- `GameRoot` lỗi tải: `<main className="error-page" role="alert">` + `ErrorCard` `app.loadFailedTitle`, `<p>` như hiện tại (`app.newerData` hoặc `app.crash`), `error-actions` gồm "Tải lại trang" và `RawExport` như hiện tại.
- CSS (`errors.css`): `.error-page` cao tối thiểu `100vh`, nền `--bg`, lưới `place-items: center`, đệm 24px; `.error-panel` lưới `place-items: center`, đệm `48px 24px`; `.error-card` rộng tối đa 520px, giữa, lưới `justify-items: center` gap 12px, màu chữ `--ink` (thắng `[role="alert"]` của `src/styles.css`); tiêu đề 26px đậm 800, `margin: 0`; `.error-actions` hàng nút giữa, xuống dòng được, gap 10px.
- `GalleryScreen` (style nội tuyến): `main` đệm `24px 32px`; `h1` 30px đậm 800; ô `border: "var(--border-w) solid var(--ink)"`, nền `var(--surface)`; dải tiêu đề cố định viền dưới `var(--border-w) solid var(--ink)`; thay mọi `var(--border)` còn lại bằng `var(--ink)`.
- i18n mới (vi / en), đặt cạnh `app.crash` / `app.otherTab`: `app.crashTitle` "Robo gặp sự cố" / "Robo ran into a problem"; `app.otherTabTitle` "Mở Py-Pet ở 1 tab thôi nhé" / "Use Py-Pet in one tab"; `app.loadFailedTitle` "Chưa mở được hồ sơ" / "The profile did not open".

**Test:**
1. `UnsupportedBrowser.test.tsx`: `img` "Robo" có `data-mood="drained"` và `data-form="1"`; `heading` cấp 1 có chữ như cũ (thay kiểm `sad`).
2. `ErrorScreens.test.tsx`: `RailLayout` + `SideNav` + `ErrorBoundary` bọc 1 component ném lỗi có `h1` (chặn `console.error`): `alert` chứa `heading` cấp 1 "Robo gặp sự cố", chữ "Robo bị trục trặc rồi. Con tải lại trang nhé.", nút "Tải lại trang", `img` "Robo" `data-mood="drained"`; toàn trang có đúng 1 `heading` cấp 1; `nav` "Menu chính" còn (Review Focus 3).
3. `ErrorScreens.test.tsx`: `App` với `ownsTab={false}` → `heading` cấp 1 "Mở Py-Pet ở 1 tab thôi nhé" và chữ "Py-Pet đang mở ở tab khác. Con dùng tab đó nhé."; `App` với store có `loadActive` ném lỗi (như test hiện có trong `AppRoutes.test.tsx`) → `alert` chứa `heading` cấp 1 "Chưa mở được hồ sơ", nút "Tải lại trang" và "Xuất dữ liệu để gửi hỗ trợ".
4. `ParentScreen.test.tsx`, test "a tab that crashes keeps the parent side menu": thêm đúng 1 `heading` cấp 1 (tên mục) và có `heading` cấp 2 "Robo gặp sự cố" (Review Focus 3).

- [ ] Commit `feat(ui): error screens as a card with drained Robo; the gallery in the new look`.

### Task 7: Trang Hướng dẫn, e2e và kiểm tra toàn bộ

**Files:** Create `e2e/pages.spec.ts`. Modify `public/huong-dan.html`, `e2e/subpath.spec.ts`, `docs/superpowers/STATUS.md`, `src/styles.css` (chỉ khi còn quy tắc chết của màn hình R3).

- `huong-dan.html` theo mục 7.11 và Quyết định 11:
  - `<link rel="stylesheet" href="./fonts.css">`; khối `:root` chép giá trị của `src/styles/tokens.css` (`--bg`, `--surface`, `--ink`, `--muted`, `--primary`, `--yellow`, `--mint`, `--mint-soft`, `--chip-xu`, `--stat-pin`, `--stat-vui`, `--code-bg`, font, viền và bóng); bỏ 2 khối chế độ tối; các biến vẽ Robo (`--screen`, `--eye`, `--body`, `--body-dark`, `--light`) giữ nguyên.
  - Thanh trên `<header class="topbar">`: logo (ô "Py" nền vàng và chữ "Py-Pet", link `./`) và link `a.button.primary` "Mở app" href `./`.
  - Mục lục ngay sau phần giới thiệu: `<nav aria-label="Mục lục"><ol class="toc">` mỗi phần 1 thẻ link tới `#muc-tieu`, `#chuan-bi`, `#bat-dau`, `#buoi-hoc`, `#lo-trinh`, `#cham-robo`, `#xu`, `#gap-kho`, `#bo-me`, `#du-lieu`.
  - Trình bày: góc vuông, viền 2px, bóng cứng; `.facts` thành chip vuông; `.tip` nền `--chip-xu` viền 2px; bảng viền 2px; thanh chỉ số vuông có khung; 4 thẻ dạng Robo viền 2px. Giữ mọi `id`, `h1` "Py-Pet: học Python cùng Robo" và hình Robo.
  - Sửa các câu tả cách đi lại cho đúng app mới: chỗ hiện "Robo sẵn sàng" (đáy thanh bên trái, thanh trên khi làm bài); các bước "Bắt đầu lần đầu" (Landing, nút "Bắt đầu học", Chào hỏi 4 bước, nút "Tiếp", "Bắt đầu"); thanh bên trái ở "Một buổi học" (các mục và nút "Về phòng" của thanh trên); cách vào Khu phụ huynh (nút ở đáy thanh bên hoặc trên trang giới thiệu, nút "Khóa và quay lại"); bảng "Tab" thành "Mục" của thanh bên; "Quên mã PIN?" ở màn hình nhập PIN; Sao lưu ở thanh bên trái; đổi máy (tạo hồ sơ trước rồi nhập file bằng mã PIN vừa đặt); ngày cập nhật 2026-10-27.
- `STATUS.md`: thêm mục "Trang Hướng dẫn: câu đã sửa ở mốc R3 (chờ phụ huynh duyệt lời văn)" ngay trước mục "Môi trường": danh sách đánh số, mỗi dòng "câu cũ → câu mới" và tên phần.
- `e2e/subpath.spec.ts` (Review Focus 5), phần mở `huong-dan.html`: có ít nhất 1 `FontFace` family "Lexend" trạng thái `loaded` sau `document.fonts.ready`; link "Mở app" có `href` "./" và bấm vào thì tới trang có nút "Bắt đầu học" hoặc heading "Phòng của Robo"; `heading` "Dành cho bố mẹ" có `id` "bo-me"; không có yêu cầu 4xx.
- `e2e/pages.spec.ts` (Review Focus 4): `page.setViewportSize({ width: 800, height: 700 })`, `startApp`; lần lượt mở "Cửa hàng", "Sổ thành tích", "Sao lưu" (link thanh bên) và Khu phụ huynh (PIN "1234", "Mở"): mỗi trang `heading` cấp 1 thấy được và `document.documentElement.scrollWidth <= window.innerWidth`.
- Rà `src/styles.css`: không còn selector của Cửa hàng, Sổ thành tích, huy hiệu, Sao lưu, khu phụ huynh, màn hình lỗi (trừ `.crash` trong dòng chung với R2, Quyết định 10); không còn quy tắc nào trong 3 file mới trỏ tới lớp không dùng (tìm bằng `grep` trong `src/ui/`).

**Test:** `npm run check` xanh (lint, typecheck, Vitest, pytest, content, Playwright), chạy theo quy tắc cổng ở Global Constraints.

- [ ] Commit `docs(guide): the guide in the new look with the new ways around the app`; `test(e2e): R3 pages at 800 px and the guide under /py-pet/`.
