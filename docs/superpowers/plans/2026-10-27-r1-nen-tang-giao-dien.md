# R1 – Nền tảng giao diện mới: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App có hệ thống thiết kế "Nhãn dán đậm" (màu, font tự chứa, góc vuông, viền 2px, bóng cứng, biểu tượng), 3 khung trang (Landing, khung có thanh bên, khung tập trung), thanh bên trái thay hàng nút, Landing có 3 nút, Chào hỏi 4 bước, Phòng robot bố cục mới, và thanh bên chế độ phụ huynh.

**Architecture:** CSS chia thành `src/styles/tokens.css`, `base.css`, `shell.css`, được `src/styles.css` import ở đầu. Font Lexend và JetBrains Mono (bản variable của Fontsource) được chép vào `public/fonts/` bằng `tools/copy_fonts.mjs` như cách chép Pyodide; `public/fonts.css` khai báo `@font-face`. Khung trang là component trong `src/ui/shell/`; `AppRoutes` chọn khung theo route; `ParentScreen` tự dựng khung của nó để đổi thanh bên sang chế độ phụ huynh. Không đổi `GameState`, `SCHEMA_VERSION`, luật chơi hay nội dung.

**Tech Stack:** Như hiện tại; thêm devDependencies `@fontsource-variable/lexend` và `@fontsource-variable/jetbrains-mono` (5.3.0, giấy phép SIL OFL 1.1).

**Spec:** `docs/superpowers/specs/2026-10-27-ui-revamp-design.md` (mục 1 đến 6, 7.1 đến 7.3, 7.10 phần thanh bên, 10, 11, 12 mốc R1). Hành vi luật chơi vẫn theo `docs/superpowers/specs/2026-10-06-py-pet-design.md`. Mockup: `docs/superpowers/specs/ui-revamp-mockups/` (`1-landing.html` hướng C, `2-room.html` phương án B, `3-other-screens.html` mục 5 và 6).

## Global Constraints

- Phạm vi R1: tài liệu thiết kế mục 12 dòng R1. Ngoài phạm vi (để R2, R3): trình bày lại Bản đồ học, bài học, trạm ôn, kiểm tra, kết quả, hoạt cảnh tiến hóa, Cửa hàng, Sổ thành tích, Sao lưu, nội dung 5 tab phụ huynh, trang Hướng dẫn, màn hình lỗi. Các màn hình đó chỉ đổi những gì token và lớp CSS chung kéo theo.
- `border-radius: 0` cho mọi thành phần giao diện. Hình vẽ (Robo, phụ kiện, đồ trang trí, vật trong cảnh phòng, hoạt cảnh tiến hóa) giữ nguyên.
- Màu theo bảng mục 5.1 của tài liệu thiết kế, gồm `--primary: #2f5bea` và `--danger: #b42318`. Mọi cặp chữ và nền mới đạt WCAG AA.
- App không gọi mạng; font chỉ tải từ `public/fonts/`. Mọi URL tương đối để chạy dưới `/py-pet/`.
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder (test `src/i18n/i18n.test.ts`).
- Tìm phần tử trong test theo vai trò và tên truy cập. Tên truy cập của link "Học tiếp", "Ôn tập", "Sạc cho {tên}" giữ đúng chữ đó (nhiều test unit và e2e dùng).
- Giữ `prefers-reduced-motion`: hiệu ứng dịch nút và chuyển tiếp mới tắt khi bật giảm chuyển động.
- Mỗi task chạy `npx vitest run` cho các file liên quan và `npm run lint`, `npm run typecheck`. E2E được sửa ở Task 8; từ Task 4 tới Task 8, e2e đỏ là dự kiến.
- Commit message kết thúc bằng trailer theo hướng dẫn attribution của phiên đang chạy.

## Review Focus

1. Mở app khi chưa có hồ sơ bằng 1 hash sâu (ví dụ `#/shop`, `#/lesson/x`) phải ra Landing, không ra màn hình lỗi hay màn hình trắng. Test: Task 4.
2. Tạo hồ sơ xong khi đang ở `#/welcome` phải vào Phòng robot, không quay lại Landing. Test: Task 4.
3. Phím Enter ở mỗi bước Chào hỏi đi tiếp (hoặc báo lỗi đúng bước), không gửi form sớm. Test: Task 5.
4. Khu phụ huynh tự khóa sau 5 phút thì thanh bên trở lại chế độ thường (không còn các tab phụ huynh). Test: Task 7.
5. Font tải được dưới `/py-pet/` và không có yêu cầu 4xx nào. Test: Task 8 (`e2e/subpath.spec.ts`).

Kiểm bằng mắt khi người bảo trì thử app (không có test tự động): thanh bên thu còn biểu tượng ở cửa sổ rộng 800px; tên con 30 ký tự và tên robot 20 ký tự không làm vỡ hàng tiêu đề Phòng robot; viền tiêu điểm thấy rõ khi dùng phím Tab.

## Quyết định thiết kế

Theo mục 13 của tài liệu thiết kế. Các quyết định thêm khi lập kế hoạch:

1. **Thanh trên của khung tập trung trong R1** chỉ có "Về phòng", trạng thái Python, chip Pin và chip xu. Tên bài và ô bước thêm ở R2 khi các màn hình làm bài được trình bày lại (tránh tiêu đề trùng với tiêu đề của màn hình).
2. **Chip chuỗi ngày và xu** hiện đúng chuỗi `room.streak` và `room.xu` hiện có ("Chuỗi: 6 ngày", "Xu: 120"). Chip Pin dùng khóa mới `focus.pin` ("Pin: {n}/{max}").
3. **Thẻ Mục tiêu** giữ các chuỗi `room.today`, `room.week`, `room.weekOff`, `room.freezes` hiện có, thêm hàng ô vuông `aria-hidden` bên cạnh.
4. **Dòng "Đang đeo" và "Trong phòng"** giữ chuỗi `room.wearing`, `room.decor` hiện có.
5. **Link "Về phòng" riêng của từng màn hình** (`<a href="#/">{t("nav.room")}</a>`) bị bỏ ở các màn hình nằm trong khung (thanh bên hoặc thanh trên đã có lối về). Nút "Về phòng" gọi `onExit` (màn hình kết quả, kiểm tra tiến hóa) giữ nguyên.
6. **Tab của khu phụ huynh** thành các mục của thanh bên nhưng giữ vai trò ARIA `tab` trong 1 `tablist` dọc; số đếm có `aria-hidden="true"` để tên tab không đổi.
7. **Sau khi tạo hồ sơ**, `GameRoot` đặt hash về `#/` rồi mở game.
8. **Thanh bên thu gọn** từ 760px đến 1099px bằng CSS: chữ của mục thành chú thích nổi khi rê chuột hoặc có tiêu điểm, vẫn là tên truy cập.

---

### Task 1: Font, token và lớp CSS chung

**Files:** Create `tools/copy_fonts.mjs`, `public/fonts.css`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/shell.css` (rỗng, các task sau thêm vào). Modify `package.json` (devDependencies, script `fonts:copy`, `dev` và `build` gọi `fonts:copy` ngay sau `pyodide:copy`), `.gitignore` (thêm `public/fonts/`), `index.html` (thêm `<link rel="stylesheet" href="/fonts.css">`), `src/styles.css`.

- `npm install -D @fontsource-variable/lexend@5.3.0 @fontsource-variable/jetbrains-mono@5.3.0`.
- `tools/copy_fonts.mjs` theo mẫu `tools/copy_pyodide.mjs`: chép vào `public/fonts/` các file `files/<tên>-{latin,latin-ext,vietnamese}-wght-normal.woff2` của 2 gói và file `LICENSE` của mỗi gói (đặt tên `LICENSE-lexend.txt`, `LICENSE-jetbrains-mono.txt`); thiếu file thì báo lỗi và thoát 1.
- `public/fonts.css`: 6 khối `@font-face` (family `"Lexend"` với `font-weight: 100 900`, family `"JetBrains Mono"` với `font-weight: 100 800`, `font-display: swap`), `src: url("./fonts/<file>.woff2") format("woff2")`, `unicode-range` chép từ `index.css` của từng gói cho đúng subset.
- `src/styles/tokens.css`: các biến của mục 5.1 tài liệu thiết kế trên `:root`, thêm `--font-ui: "Lexend", system-ui, sans-serif`, `--font-mono: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`, `--border-w: 2px`, `--shadow-sm: 2px 2px 0 var(--ink)`, `--shadow: 3px 3px 0 var(--ink)`, `--shadow-card: 4px 4px 0 var(--ink)`, `--shadow-lg: 6px 6px 0 var(--ink)`. Các tên cũ còn được CSS hiện có dùng (`--text`, `--muted`, `--border`, `--surface`, `--success`, `--code-text`, `--mono`, `--radius`, `--stat-*`) trỏ sang giá trị mới (`--text: var(--ink)`, `--radius: 0`, `--code-bg: #fffdf6`, `--code-text: var(--ink)`, `--border: var(--ink)`) để màn hình chưa trình bày lại vẫn đọc được.
- `src/styles/base.css`: `.runner-failed` thành banner đỏ nhạt (viền 2px, bóng `--shadow-card`, giữ Robo, tiêu đề và nút "Thử lại"); `body` (nền `--bg`, chữ `--ink`, `--font-ui`); `button` và `.button` (dùng cho cả `<a>`): kiểu phụ, viền 2px, bóng `--shadow`, chữ đậm 700; `.primary`, `.mint`, `.small`; trạng thái hover, active, disabled theo mục 5.3; `:focus-visible` outline 3px `--primary` cách 2px; `input`, `textarea`, `select` vuông viền 2px; `.chip` và `.chip-streak`, `.chip-xu`, `.chip-pin`; `.card` và `.card-title` (nhãn chữ hoa 13px, giãn 0,08em); `.squares` (hàng ô 16px, `.on` tô `--yellow`); `.banner` và `.banner-danger` theo mục 5.5; `.icon` (nét `currentColor`, không tô) và `.icon-solid` (tô `currentColor`); `@media (prefers-reduced-motion: reduce)` tắt transform và transition của nút. Giữ selector `a.button`, `button.primary`, `a.button.primary` vì code hiện có dùng.
- `src/styles.css`: dòng đầu là 3 `@import` (`./styles/tokens.css`, `./styles/base.css`, `./styles/shell.css`); bỏ khối `:root`, `button`, `.app-header`, `.app-title`, `.lang-switch` cũ, `.banners`, `.banner`, `a.button` cũ đã chuyển sang file mới; đổi mọi `border-radius` của thành phần giao diện thành 0 (giữ các dòng thuộc hình vẽ: chi tiết trong `.room-scene` trừ khung của chính `.room-scene`, vòng sáng của hoạt cảnh tiến hóa). Khối code tối (`.code-block`, `.parsons-line`, `.fill-template`, `.bubble pre`) đổi sang nền `--code-bg`, chữ `--ink`, viền 2px.

**Test:** `npm run fonts:copy` tạo đủ 6 file `woff2` và 2 file giấy phép; `npm run build` thành công và `dist/fonts.css`, `dist/fonts/*.woff2` có mặt, `dist/index.html` trỏ tới `fonts.css` bằng đường dẫn tương đối (`./fonts.css`); `npx vitest run` xanh (chưa đổi giao diện nào).

- [ ] Commit `feat(ui): design tokens, self-hosted fonts and the shared square components`.

### Task 2: Biểu tượng và khung trang

**Files:** Create `src/ui/icons.tsx` (+ `icons.test.tsx`), `src/ui/shell/RunnerStatus.tsx`, `src/ui/shell/UiLangSwitch.tsx`, `src/ui/shell/Chips.tsx`, `src/ui/shell/SideNav.tsx`, `src/ui/shell/RailLayout.tsx`, `src/ui/shell/FocusLayout.tsx`, `src/ui/shell/layout.test.tsx`. Modify `src/ui/shell.test.tsx` (bỏ `describe("Header")`), `src/styles/shell.css`, `src/i18n/vi.ts`, `src/i18n/en.ts`.

**Interfaces:**
- Produces: `type IconName = "home" | "map" | "shop" | "trophy" | "save" | "help" | "lock" | "back" | "next" | "play" | "check" | "chart" | "alert" | "list" | "gift" | "sliders" | "flame" | "coin"`; `Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string })`.
- Produces: `RunnerStatus()`, `RunnerAlert()` (hiện `RunnerFailedPanel` khi `runner.status === "failed"`, ngược lại `null`), `UiLangSwitch()`, `StreakChip()`, `XuChip()`, `PinChip()`.
- Produces: `type RailItem = "room" | "map" | "shop" | "achievements" | "backup" | "parent"`; `SideNav({ current }: { current: RailItem | null })`; `RailLayout({ nav, mode = "child", children }: { nav: ReactNode; mode?: "child" | "parent"; children: ReactNode })`; `FocusLayout({ children }: { children: ReactNode })`.

- `Icon`: `<svg className={"icon" + (solid ? " icon-solid" : "") + ...} data-icon={name} width={size} height={size} viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d=... /></svg>`; `flame` và `coin` là `solid`. Đường vẽ (khung 18 × 18, nét vuông, góc nhọn):

  | Tên | `d` |
  |---|---|
  | home | `M2 9 L9 2 L16 9 M4 7.5 V16 H14 V7.5` |
  | map | `M1 4 L6 2 L12 4 L17 2 V14 L12 16 L6 14 L1 16 Z M6 2 V14 M12 4 V16` |
  | shop | `M2 6 H16 V16 H2 Z M6 6 V3 H12 V6` |
  | trophy | `M4 2 H14 V7 L9 10 L4 7 Z M9 10 V14 M5 16 H13` |
  | save | `M2 2 H14 L16 4 V16 H2 Z M5 2 V7 H12 V2 M5 16 V11 H13 V16` |
  | help | `M2 2 H16 V16 H2 Z M7 7 Q7 4.5 9 4.5 Q11 4.5 11 6.5 Q11 8 9 9 V11 M9 13 V14` |
  | lock | `M3 8 H15 V16 H3 Z M6 8 V4 H12 V8` |
  | back | `M10 3 L4 9 L10 15 M4 9 H16` |
  | next | `M8 3 L14 9 L8 15 M14 9 H2` |
  | play | `M5 3 L14 9 L5 15 Z` |
  | check | `M3 9 L7 13 L15 5` |
  | chart | `M2 16 H16 M4 16 V9 M8 16 V4 M12 16 V11` |
  | alert | `M9 2 L16 15 H2 Z M9 7 V11 M9 13 V14` |
  | list | `M2 3 H16 M2 9 H12 M2 15 H8` |
  | gift | `M2 7 H16 V10 H2 Z M3 10 V16 H15 V10 M9 7 V16 M9 7 L6 3 M9 7 L12 3` |
  | sliders | `M2 5 H16 M2 13 H16 M6 3 V7 M12 11 V15` |
  | flame | `M9 1 L14 8 L12 16 L6 16 L4 8 L7 10 Z` |
  | coin | `M9 2 L16 9 L9 16 L2 9 Z` |

- `RunnerStatus`, `UiLangSwitch`, `RunnerAlert` lấy nguyên logic và chuỗi của `Header.tsx` (trạng thái `runner.loading`/`runner.ready`; nhóm `app.uiLanguage` với 2 nút VI, EN có `aria-pressed`). `Header.tsx` bị xóa ở Task 4.
- Chip: `StreakChip` = `Icon flame` + `t("room.streak", { days: displayStreak(state, today) })`; `XuChip` = `Icon coin` + `t("room.xu", { xu })`; `PinChip` = `t("focus.pin", { n: state.pet.pin, max: STAT_MAX })`.
- `SideNav`: `<nav aria-label={t("rail.label")} className="side-nav">` gồm, theo thứ tự: link logo `href="#/welcome"` (ô "Py" và chữ `app.title`; tên truy cập "Py-Pet"); nhóm chính: Phòng Robo (`#/`, `rail.room`, icon home), Bản đồ học (`#/map`, `room.map`, map), Cửa hàng (`#/shop`, `room.shop`, shop), Sổ thành tích (`#/achievements`, `room.achievements`, trophy); đường kẻ; Sao lưu (`#/backup`, `room.backup`, save), Hướng dẫn (`huong-dan.html`, `rail.guide`, help); đáy: `RunnerStatus`, `UiLangSwitch`, link Khu phụ huynh (`#/parent`, `room.parent`, lock, lớp `button mint`). Mục bằng `current` có `aria-current="page"`. Chữ của mục nằm trong `<span className="side-nav-label">`.
- `RailLayout`: `<div className="rail-layout" data-mode={mode}>{nav}<div className="rail-main"><RunnerAlert /><Banners />{children}</div></div>`.
- `FocusLayout`: `<div className="focus-layout"><header className="focus-bar">` link `href="#/"` lớp `button small` (icon back + `nav.room`), `RunnerStatus`, `<span className="focus-chips"><PinChip /><XuChip /></span></header><RunnerAlert /><Banners />{children}</div>`.
- `shell.css`: bố cục theo mockup `2-room.html` phương án B: thanh bên rộng 220px, nền trắng, viền phải 2px, cao bằng màn hình (`position: sticky; top: 0; height: 100vh`); mục đang ở nền `--yellow`, viền 2px, bóng `--shadow`; chế độ `data-mode="parent"` nền `--mint-bg`, mục đang chọn nền `--mint`. Thanh trên của khung tập trung cao 60px, nền trắng, viền dưới 2px. `@media (max-width: 1099px)`: thanh bên 64px, `.side-nav-label` thành chú thích nổi (ẩn, hiện khi mục `:hover` hoặc `:focus-visible`), logo chỉ còn ô "Py".
- i18n mới (vi / en): `rail.label` "Menu chính" / "Main menu"; `rail.room` "Phòng Robo" / "Robo's room"; `rail.guide` "Hướng dẫn" / "Guide"; `focus.pin` "Pin: {n}/{max}" / "Battery: {n}/{max}".

**Test** (`src/ui/shell/layout.test.tsx`; chuyển 5 test của `describe("Header")` trong `src/ui/shell.test.tsx` sang đây, viết lại với `RunnerStatus`, `RunnerAlert`, `UiLangSwitch`, và xóa `describe("Header")` ở file cũ):
1. `Icon` của mọi tên có `aria-hidden="true"`, `data-icon` đúng và 1 `path` có `d` khác rỗng; `flame` có lớp `icon-solid`.
2. `SideNav current="map"`: link "Bản đồ học" có `aria-current="page"`, các link khác không có; href: "Phòng Robo" `#/`, "Bản đồ học" `#/map`, "Cửa hàng" `#/shop`, "Sổ thành tích" `#/achievements`, "Sao lưu" `#/backup`, "Hướng dẫn" `huong-dan.html`, "Khu phụ huynh" `#/parent`, "Py-Pet" `#/welcome`; có "Robo sẵn sàng" và nhóm "Ngôn ngữ giao diện".
3. `RailLayout` với `Banners` (game không lưu được) hiện banner "notPersistent" trong `.rail-main`.
4. `FocusLayout`: link "Về phòng" href `#/`; thấy "Pin: 4/5" và "Xu: 0" với state ban đầu (Pin ban đầu là 4); không có `nav` "Menu chính".

- [ ] Commit `feat(ui): icons, side menu, rail layout and focus layout`.

### Task 3: Landing

**Files:** Create `src/ui/LandingScreen.tsx` (+ `LandingScreen.test.tsx`). Modify `src/styles/shell.css`, i18n.

**Interfaces:**
- Consumes: `Icon`, `UiLangSwitch` (Task 2); `Robot` (hiện có).
- Produces: `LandingScreen({ onStart }: { onStart?: () => void })`. Có `onStart` nghĩa là chưa có hồ sơ. Không dùng `useGame`.

- Bố cục theo hướng C của `1-landing.html`. Thanh trên `<nav aria-label={t("landing.navLabel")}>`: logo (ô "Py", `app.title`), link "Trang chủ" (`#/welcome`), "Bài học", "Hướng dẫn" (`huong-dan.html`), "Khu phụ huynh", `UiLangSwitch`. Phần chính `<main className="landing">`: `h1` gồm `landing.titleA` + `<mark>Python</mark>` + `landing.titleB` (vi: "Nuôi Robo bằng " … "."; en: "Raise Robo with " … "."); đoạn `landing.lead`; 3 hành động dọc.
- Hành động khi có hồ sơ (`onStart` không có): link "Bắt đầu học" `#/` (lớp `button primary`, icon next); link "Hướng dẫn" `huong-dan.html` (chữ phụ `landing.guideHint`); link "Khu phụ huynh" `#/parent` (lớp `button mint`, chữ phụ `landing.parentHint`). Thanh trên: "Bài học" là link `#/`, "Khu phụ huynh" là link `#/parent`.
- Khi chưa có hồ sơ: "Bắt đầu học" và "Bài học" là nút gọi `onStart`; "Khu phụ huynh" (cả 2 chỗ) là nút mở thẻ giải thích `role="region"` có tên `landing.parentInfoTitle`, chứa `landing.parentInfoText`, nút "Bắt đầu" (`landing.parentInfoStart`, gọi `onStart`) và link `huong-dan.html#bo-me` (`landing.parentInfoGuide`).
- Chữ phụ của nút nằm trong `<small aria-hidden="true">` để tên truy cập của nút đúng bằng "Bắt đầu học", "Hướng dẫn", "Khu phụ huynh".
- Bên phải: khối `--mint` có `Robot` dạng 3, `mood="happy"`, `size={190}`; bong bóng `landing.robotHello`; cửa sổ code `robo.py` (`aria-hidden="true"`) với 2 dòng `landing.code1`, `landing.code2` và 1 dòng kết quả `landing.codeOutput`.
- i18n mới (vi / en): `landing.navLabel` "Trang giới thiệu" / "Welcome page"; `landing.home` "Trang chủ" / "Home"; `landing.lessons` "Bài học" / "Lessons"; `landing.titleA` "Nuôi Robo bằng " / "Raise Robo with "; `landing.titleB` "." / "."; `landing.lead` "Mỗi bài code đúng là 1 bữa ăn cho Robo. Học đều mỗi ngày, Robo sẽ lớn và tiến hóa qua 4 dạng." / "Each correct program is a meal for Robo. Learn every day and Robo grows through 4 forms."; `landing.start` "Bắt đầu học" / "Start learning"; `landing.guide` "Hướng dẫn" / "Guide"; `landing.guideHint` "cho con và bố mẹ" / "for children and parents"; `landing.parent` "Khu phụ huynh" / "Parent area"; `landing.parentHint` "cần mã PIN" / "needs the PIN"; `landing.robotHello` "Chào bạn! Mình là Robo." / "Hi! I am Robo."; `landing.code1` `ten = "Robo"` / `name = "Robo"`; `landing.code2` `print("Xin chào,", ten)` / `print("Hello,", name)`; `landing.codeOutput` "Xin chào, Robo" / "Hello, Robo"; `landing.parentInfoTitle` "Khu phụ huynh" / "Parent area"; `landing.parentInfoText` "Khu phụ huynh có sau khi tạo hồ sơ. Bố mẹ đặt mã PIN ở bước cuối của phần chào hỏi." / "The parent area opens after the profile is created. A parent sets the PIN in the last step of the welcome."; `landing.parentInfoStart` "Bắt đầu" / "Start"; `landing.parentInfoGuide` "Đọc phần dành cho bố mẹ" / "Read the part for parents".

**Test:**
1. Có hồ sơ: link "Bắt đầu học" href `#/`; trong `main`, link "Khu phụ huynh" href `#/parent`; link "Hướng dẫn" href `huong-dan.html`; có `heading` cấp 1 chứa "Python"; có `img` "Robo".
2. Chưa có hồ sơ: bấm nút "Bắt đầu học" gọi `onStart` 1 lần; bấm nút "Khu phụ huynh" trong `main` hiện vùng "Khu phụ huynh" có nút "Bắt đầu" (gọi `onStart`) và link href `huong-dan.html#bo-me`.
3. Bấm "EN" đổi sang "Start learning".

- [ ] Commit `feat(ui): the landing page with Start learning, Guide and Parent area`.

### Task 4: Route và khung theo màn hình

**Files:** Modify `src/ui/routing.ts` (+ test hiện có của routing nếu có), `src/ui/AppRoutes.tsx`, `src/ui/GameRoot.tsx`, `src/ui/AppRoutes.test.tsx`, `src/ui/MapScreen.tsx`, `src/ui/MapScreen.test.tsx`, `src/ui/ShopScreen.tsx`, `src/ui/AchievementsScreen.tsx`, `src/ui/BackupScreen.tsx`, `src/ui/ReviewScreen.tsx`, `src/ui/RemedialScreen.tsx`, `src/ui/PracticeScreen.tsx`, `src/ui/AssignedPracticeScreen.tsx`, `src/ui/EvolutionTestScreen.tsx`. Delete `src/ui/Header.tsx`.

**Interfaces:**
- Consumes: `SideNav`, `RailLayout`, `FocusLayout`, `RailItem` (Task 2); `LandingScreen` (Task 3).
- Produces: `Route` thêm `{ name: "welcome" }`; `parseHash("#/welcome")` → `{ name: "welcome" }`; `routeToHash({ name: "welcome" })` → `"#/welcome"`.

- `AppRoutes`: route `welcome` → `<LandingScreen />` không khung. Route trong `STUDY_ROUTES` → màn hình (kể cả `Notice`) trong `<FocusLayout>`. Route `parent` → `<ParentScreen />` không khung (Task 7 cho nó tự dựng khung; trong task này bọc tạm bằng `<RailLayout nav={<SideNav current="parent" />}>` bên trong `ParentScreen` cho cả 2 trạng thái). Còn lại (`home`, `map`, `shop`, `achievements`, `backup`) → `<RailLayout nav={<SideNav current={...} />}>` với `home` → `"room"`. `ErrorBoundary key={routeToHash(route)}` nằm trong khung, bọc màn hình. Bỏ `<Header />` và `<Banners />` khỏi `AppRoutes` (khung đã có).
- `GameRoot`: bỏ `Header` ở 3 trạng thái. Đang tải: `<main className="app-loading"><p>{t("app.loading")}</p></main>`. Lỗi tải: giữ nội dung, bỏ `Header`. Chưa có hồ sơ: state `onboarding` (mặc định `false`); `false` → `<LandingScreen onStart={() => setOnboarding(true)} />` với mọi hash; `true` → `<OnboardingScreen ... onBack={() => setOnboarding(false)} />` (prop `onBack` thêm ở Task 5; trong task này chưa truyền). `onCreated`: `window.location.hash = "#/"` rồi `setLoaded(loaded)`.
- Bỏ link `nav.room` riêng ở: `MapScreen` (dòng `<a href="#/">`), `ShopScreen`, `AchievementsScreen`, `BackupScreen`, `ReviewScreen`, `RemedialScreen`, `PracticeScreen`, `AssignedPracticeScreen`, `EvolutionTestScreen` (dòng 80, link). Giữ các `<button onClick={onExit}>{t("nav.room")}</button>`. `ParentScreen` để Task 7.

**Test** (sửa `AppRoutes.test.tsx`, `MapScreen.test.tsx`):
1. `App` lần đầu: thấy "Đang mở hồ sơ...", rồi Landing (nút "Bắt đầu học"); bấm "Bắt đầu học" thấy heading "Chào mừng đến với Py-Pet!" (thay test "first run" cũ; bỏ kiểm trạng thái Python ở màn hình này).
2. `App` chưa có hồ sơ, `window.location.hash = "#/shop"` → thấy Landing, không thấy "Cửa hàng" dạng heading.
3. `App` chưa có hồ sơ, hash `#/welcome`, tạo hồ sơ qua Chào hỏi → `window.location.hash` là `#/` và thấy heading "Phòng của Robo".
4. `App` có hồ sơ, hash `#/welcome` → Landing có link "Bắt đầu học" href `#/`.
5. `AppRoutes` ở `#/`: có `nav` "Menu chính", link "Phòng Robo" có `aria-current="page"`; ở `#/lesson/t.l1`: không có `nav` "Menu chính", có link "Về phòng".
6. `MapScreen.test`: bỏ kiểm link "Về phòng".
- Các test hiện có của `AppRoutes.test.tsx` tìm link điều hướng trong phòng vẫn chạy (link nằm trong thanh bên).

- [ ] Commit `feat(ui): pick the landing, rail or focus layout by route`.

### Task 5: Chào hỏi 4 bước

**Files:** Modify `src/ui/OnboardingScreen.tsx`, `src/ui/OnboardingScreen.test.tsx`, `src/ui/GameRoot.tsx` (truyền `onBack`), `src/ui/AppRoutes.test.tsx` (các test `App` đi qua Chào hỏi ở Task 4 chuyển sang 4 bước), `src/styles/shell.css`, `src/styles.css` (bỏ khối `.onboarding` cũ, giữ phần `.backup` dùng chung), i18n.

**Interfaces:**
- Produces: `OnboardingProps` thêm `onBack?: () => void`.

- Bố cục theo `3-other-screens.html` mục 6: cột trái nền `--mint` có logo, bong bóng `onboarding.say{step}` và `Robot` dạng 1 `mood="happy"` `size={200}`; cột phải: `h1` `onboarding.title`, 4 ô bước (`aria-hidden`), chữ `onboarding.step` ("Bước {n}/{total}"), nội dung bước, nút "Quay lại" và "Tiếp" (bước 4: "Bắt đầu").
- 1 `<form>` cho mỗi bước; `onSubmit` = đi tiếp, nên Enter đi tiếp. Bước 1: nhóm `onboarding.language` với 2 nút `type="button"` như hiện có. Bước 2: ô `onboarding.childName` (maxLength 30), chữ phụ `onboarding.nameHelp`; đi tiếp khi tên rỗng sau `trim()` → `onboarding.errorName`. Bước 3: ô `onboarding.robotName` (mặc định "Robo", maxLength 20). Bước 4: 2 ô PIN như hiện có, chữ phụ `onboarding.pinHelp`; "Bắt đầu" kiểm PIN rồi lưu đúng như hàm `submit` hiện có.
- Lỗi hiện `role="alert"` ở bước có lỗi; đổi bước thì xóa lỗi. Ô nhập của bước mới nhận tiêu điểm khi bước đổi.
- "Quay lại" ở bước 1 gọi `onBack` (ẩn nếu không có `onBack`); bước 2 đến 4 lùi 1 bước, giữ giá trị đã nhập.
- i18n mới (vi / en): `onboarding.step` "Bước {n}/{total}" / "Step {n}/{total}"; `onboarding.next` "Tiếp" / "Next"; `onboarding.back` "Quay lại" / "Back"; `onboarding.say1` "Chào bạn! Bạn muốn dùng ngôn ngữ nào?" / "Hi! Which language do you want?"; `onboarding.say2` "Mình nên gọi bạn là gì?" / "What should I call you?"; `onboarding.say3` "Bạn muốn đặt tên mình là gì?" / "What name do you give me?"; `onboarding.say4` "Cuối cùng, nhờ bố mẹ đặt mã PIN nhé!" / "Last step: ask a parent to set the PIN!"; `onboarding.nameHelp` "Robo sẽ gọi con bằng tên này." / "Robo will call you by this name."; `onboarding.pinHelp` "Mã PIN dùng để vào Khu phụ huynh và nhập file sao lưu." / "The PIN opens the parent area and imports backup files.".

**Test** (viết lại `OnboardingScreen.test.tsx`; helper `goThrough(name, pin, again)` bấm "Tiếp" qua các bước):
1. Tạo hồ sơ qua 4 bước với "  An  " và "2468": `onCreated` 1 lần, hồ sơ, `uiLang` "vi", tuần, PIN, `requestPersist` như test cũ; thấy "Bước 1/4" ở đầu và "Bước 4/4" ở bước cuối.
2. Bấm "English" ở bước 1 → heading "Welcome to Py-Pet!", đi qua các bước bằng "Next", nút cuối "Start", `uiLang` "en", tên robot rỗng → "Robo".
3. Bước 2 tên rỗng, bấm "Tiếp" → alert "Con hãy nhập tên nhé." và vẫn "Bước 2/4".
4. Bước 4 PIN "12" → "Mã PIN phải gồm 4 đến 6 chữ số."; PIN khác nhau → "Hai mã PIN chưa giống nhau."; `onCreated` không được gọi.
5. Nhập tên rồi nhấn Enter trong ô tên → "Bước 3/4" (Review Focus 3).
6. "Quay lại" ở bước 3 về bước 2 và ô tên còn giá trị; "Quay lại" ở bước 1 gọi `onBack`.
7. Lưu thất bại → alert "Chưa lưu được hồ sơ. Bố mẹ thử lại nhé." và nút "Bắt đầu" bật lại.

- [ ] Commit `feat(ui): the welcome asks 1 question per step`.

### Task 6: Phòng robot bố cục mới

**Files:** Create `src/ui/nextStepLabel.ts` (+ `nextStepLabel.test.ts`). Modify `src/ui/RoomScreen.tsx`, `src/ui/RoomScreen.test.tsx`, `src/styles/shell.css` (hoặc `src/styles.css` phần `.room`), i18n.

**Interfaces:**
- Consumes: `StreakChip`, `XuChip`, `Icon` (Task 2); `nextStep`, `NextStep` (`src/game/path.ts`); `translate` (`src/i18n/translate.ts`).
- Produces: `nextStepLabel(bundle: ContentBundle, step: NextStep, lang: Lang): string`.

- `nextStepLabel`: `assigned` → `room.nextAssigned`; `remedial` → `remedial.title`; node `lesson` → `pick(findLesson(bundle, id).title, lang)` (không tìm thấy thì trả `id`); `review` → `review.title`; `topicTest` → `exam.topicTitle` với `topic` = tên chủ đề theo `lang`; `evolution` → `exam.evolutionTitle`. Dùng `translate(lang, ...)`.
- `RoomScreen` theo `2-room.html` phương án B, bỏ `<nav className="room-actions">`:
  - Hàng tiêu đề: `h1` `room.title`, `room.greeting`, bên phải `StreakChip` và `XuChip`.
  - Cột trái: `RoomScene` như hiện có (khung viền 2px, bóng `--shadow-lg`, góc vuông), dòng `room.wearing` và `room.decor` như hiện có.
  - Cột phải: thẻ chính, nút Ôn tập, thẻ `room.statsTitle` với 3 `StatBar` như hiện có, thẻ `room.goalsTitle` với `room.today` + ô vuông (`todayPoints` trên `dailyGoal`), `room.week` + ô vuông (`weekLessons` trên `weekTarget`) hoặc `room.weekOff`, `room.freezes`.
  - Thẻ chính khi có `next` và không `recharge`: `<a className="next-card" href={routeToHash(stepRoute(next))} aria-describedby={id}>` gồm `<span aria-hidden="true">` `room.nextKicker`, chữ `room.continue`, `<span id={id} aria-hidden="true">` `room.nextIn` với `step` = `nextStepLabel(...)`, `stage` = tên giai đoạn hiện tại theo `uiLang` (không có giai đoạn thì chỉ hiện `step`), và icon next. `id` từ `useId()`. Tên truy cập của link là "Học tiếp".
  - `recharge`: thẻ chính là link "Sạc cho {tên}" (`room.recharge`, href `#/review`); "Học tiếp" thành link `button` thường ngay dưới (nếu có `next`).
  - Không có `next`: thẻ chính là `<p>` `room.allDone`.
  - Nút Ôn tập (khi `canReview && condition !== "drained"`): link `button mint` href `#/review`, chữ "Ôn tập" và `<small aria-hidden="true">` `room.reviewHint`.
- i18n mới (vi / en): `room.nextKicker` "Bài tiếp theo" / "Next step"; `room.nextIn` "{step} · {stage}" / "{step} · {stage}"; `room.nextAssigned` "Bài luyện bố mẹ giao" / "Practice from your parents"; `room.reviewHint` "5 câu, sạc Pin cho {name}" / "5 questions, charges {name}"; `room.statsTitle` "{name} hôm nay" / "{name} today"; `room.goalsTitle` "Mục tiêu" / "Goals".

**Test:**
1. `nextStepLabel.test.ts`: với `testBundle()` bài đầu → đúng `pick(title, "vi")` của bài đó; với `reviewBundle()` node trạm ôn → "Trạm ôn"; với `examBundle()` node kiểm tra chủ đề → "Kiểm tra chủ đề: " + tên chủ đề, node tiến hóa → "Kiểm tra tiến hóa"; `{ kind: "remedial" }` → "Ôn tập trọng tâm"; `{ kind: "assigned", id: "p1" }` → "Bài luyện bố mẹ giao"; `lang` "en" trả bản tiếng Anh.
2. `RoomScreen.test.tsx`: giữ các kiểm hiện có về tiêu đề, lời chào, Robo, thanh chỉ số, cảnh, mục tiêu, chuỗi, thẻ giữ chuỗi, xu, link "Học tiếp", "Ôn tập", "Sạc cho Robo"; bỏ kiểm link "Bản đồ học", "Sao lưu", "Cửa hàng", "Sổ thành tích", "Khu phụ huynh" (đã ở test `SideNav`). Thêm: link "Học tiếp" có mô tả truy cập (`toHaveAccessibleDescription`) bằng `nextStepLabel` của bài đầu + " · " + tên giai đoạn; khi học hết bài thấy `room.allDone` và không có link "Học tiếp".

- [ ] Commit `feat(ui): the room shows the next step, the stats and the goals in cards`.

### Task 7: Thanh bên chế độ phụ huynh

**Files:** Create `src/ui/shell/ParentNav.tsx`. Modify `src/ui/ParentScreen.tsx`, `src/ui/ParentScreen.test.tsx`, `src/styles/shell.css`, `src/styles.css` (bỏ `.parent-top`, `.tabs` của khu phụ huynh), i18n.

**Interfaces:**
- Consumes: `RailLayout`, `SideNav`, `Icon` (Task 2); `conceptsNeedingHelp` (`src/game/parentStats.ts`).
- Produces: `type ParentTab = "overview" | "help" | "progress" | "rewards" | "settings"`; `PARENT_TABS: { id: ParentTab; label: MessageKey; icon: IconName }[]` (chuyển từ `ParentScreen`); `ParentNav({ tab, onTab, onLock, helpCount, rewardCount }: { tab: ParentTab; onTab(tab: ParentTab): void; onLock(): void; helpCount: number; rewardCount: number })`.

- `ParentScreen`: khi khóa → `<RailLayout nav={<SideNav current="parent" />}>` + `ParentGate` (bỏ link `nav.room`). Khi mở → `<RailLayout mode="parent" nav={<ParentNav ... />}>` + nội dung: `h1` là tên tab đang chọn, banner `parent.resetAt` nếu có, panel `role="tabpanel"` `id="parent-panel"` `aria-labelledby` tab đang chọn, nội dung tab như hiện có (bỏ hàng tab cũ, nút "Khóa" cũ, link `nav.room`).
- `ParentNav`: `<nav aria-label={t("parent.title")} className="side-nav">` gồm logo (như `SideNav`), nhãn vùng `parent.title` có icon lock, `<div role="tablist" aria-orientation="vertical">` 5 nút `role="tab"` (`id="parent-tab-<id>"`, `aria-selected`, `aria-controls="parent-panel"`, icon: overview `chart`, help `alert`, progress `list`, rewards `gift`, settings `sliders`); tab help có số `helpCount`, tab rewards có số `rewardCount`, số trong `<span className="count" aria-hidden="true">`, ẩn khi bằng 0. Đáy: chữ `parent.autoLockNote` và nút `parent.lockAndLeave` (icon back) gọi `onLock`.
- `onLock` của nút đáy: khóa như nút "Khóa" cũ (`onLock(false)`), rồi `window.location.hash = "#/"`. Tự khóa sau 5 phút giữ nguyên và về trạng thái khóa (thanh bên thường).
- Số đếm: `helpCount = conceptsNeedingHelp(state).length`; `rewardCount` = số yêu cầu đổi thưởng `status === "pending"`.
- i18n: đổi `parent.lock` thành `parent.lockAndLeave` "Khóa và quay lại" / "Lock and go back" (xóa khóa cũ nếu không còn dùng); mới `parent.autoLockNote` "Tự khóa sau 5 phút không dùng" / "Locks itself after 5 minutes without use".

**Test** (sửa `ParentScreen.test.tsx`):
1. PIN đúng mở khu: có `tablist` dọc với 5 `tab`; tab "Tổng quan" `aria-selected="true"`; `heading` cấp 1 "Tổng quan"; không còn link "Menu chính".
2. 1 yêu cầu đổi thưởng đang chờ và 1 khái niệm cần hỗ trợ: tab "Phần thưởng" và "Con cần hỗ trợ" giữ đúng tên truy cập và có số "1" hiện trong tab.
3. Bấm "Khóa và quay lại" → về form PIN và `window.location.hash` là `#/`.
4. Tự khóa sau 5 phút (fake timers như test hiện có) → thấy `nav` "Menu chính" và không còn `tablist` (Review Focus 4).
5. Các test hiện có (sai PIN, đặt lại PIN, hủy, tự khóa sống qua re-render, Tổng quan) chạy với nút mới.

- [ ] Commit `feat(parent): the side menu turns into the parent tabs`.

### Task 8: E2E theo luồng mới

**Files:** Create `e2e/helpers.ts`. Modify mọi file `e2e/*.spec.ts`.

**Interfaces:**
- Produces: `startApp(page: Page, name = "An", pin = "1234"): Promise<void>` (mở `./`, bấm nút "Bắt đầu học" trong `main`, đi qua 4 bước Chào hỏi, chờ heading "Phòng của Robo"); `waitForPython(page: Page): Promise<void>` (chờ "Robo sẵn sàng", timeout 60 000 ms).

- Thay mọi hàm `startApp` riêng trong các spec bằng helper; giữ đúng thứ tự chờ của từng test.
- Link "Py-Pet" dùng để về phòng sau 1 bài (`parent.spec.ts`, `exam.spec.ts`) đổi thành link "Về phòng" của thanh trên. Link "Về phòng" trên trang khu phụ huynh và cửa hàng (`parent.spec.ts`, `shop.spec.ts`) đổi thành link "Phòng Robo" của thanh bên. Nút "Khóa" (nếu có) đổi thành "Khóa và quay lại".
- `e2e/progress.spec.ts` "a second tab": tab thứ 2 vẫn thấy thông báo tab khác.
- `e2e/subpath.spec.ts`: sau khi tới phòng, kiểm `await page.evaluate(() => document.fonts.check('16px "Lexend"'))` là `true` và `missing` rỗng (đã có), và mở `huong-dan.html` không lỗi 4xx.
- `e2e/runner-failed.spec.ts`: khung lỗi vẫn là `alert` có "Robo chưa khởi động được"; sau "Học tiếp" (khung tập trung) vẫn thấy nút "Thử lại".

**Test:** `npm run check` xanh (lint, typecheck, Vitest, pytest, content, Playwright).

- [ ] Commit `test(e2e): start from the landing and the 4-step welcome`.
