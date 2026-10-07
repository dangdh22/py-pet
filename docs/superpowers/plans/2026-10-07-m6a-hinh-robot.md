# M6a – Hình robot, phòng và hoạt cảnh tiến hóa: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Robo có 4 dạng tiến hóa (Viên nang, Sơ sinh, Bé con, Thiếu niên), mỗi dạng 3 cỡ và 5 trạng thái (Vui vẻ, Bình thường, Buồn ngủ, Hết pin, Đi nghỉ), vẽ bằng SVG (spec 8.4). Mỗi lần tiến hóa Robo có thêm linh kiện (ăng-ten, tay, màn hình ngực). Phụ kiện con mua hoặc được tặng hiện trên người Robo; đồ trang trí hiện trong phòng. Phòng robot có cảnh riêng cho buồn ngủ, hết pin (Robo nằm cạnh ổ sạc) và đi nghỉ (bãi biển) (spec 8.3). Thanh Pin, Vui, Lớn lên là thanh thật (spec 8.2.1). Khi đạt kiểm tra tiến hóa có hoạt cảnh toàn màn hình (spec 8.2.5). Sổ thành tích, cửa hàng có hình. Robo không còn nhỏ lại sau khi tiến hóa (STATUS mục 1, DECISIONS M3b mục 4, M4a mục 8).

**Architecture:** Không đổi `GameState` (version 4) và `SCHEMA_VERSION`. Hình robot là hàm thuần của dữ liệu đã có: `src/game/look.ts` tính `RobotLook` (dạng, cỡ, trạng thái, phụ kiện) từ `GameState`, bundle và ngày. `src/ui/robot/` chứa các phần vẽ SVG: thân theo dạng, mắt và miệng theo trạng thái, phụ kiện theo chỗ đeo, đồ trang trí, cảnh phòng. `Robot` nhận thêm `form` và `equipped`; `PetRobot` đọc từ `useGame()` để mọi màn hình trong `GameProvider` vẽ đúng Robo của con. `EvolutionShow` là hoạt cảnh toàn màn hình. Trang `#/gallery` chỉ có ở bản dev (`import.meta.env.DEV`) để người bảo trì và reviewer xem mọi tổ hợp.

**Tech Stack:** Như M5. Không thêm thư viện. Hoạt cảnh bằng CSS `@keyframes`, luôn có `prefers-reduced-motion`.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md` (8.2, 8.3, 8.4, 5.6, 5.12).

## Global Constraints

- Phạm vi M6a: spec 8.4, 8.3, 8.2.1 (thanh Pin, Vui, Lớn lên), 8.2.5 (hoạt cảnh tiến hóa), 8.2.6–8.2.7 (hình trong cửa hàng và Sổ thành tích), DECISIONS M3b mục 4 và M4a mục 8.
- Ngoài phạm vi M6a (đừng làm): CI/CD, lint, xử lý lỗi spec 10, e2e mới ngoài Task 7 (M6b); nội dung bài học; âm thanh (ngoài bản đầu).
- Không đổi `GAME_STATE_VERSION` (4) và `SCHEMA_VERSION` (4). Không thêm trường vào `GameState`.
- Giữ nguyên cho test và e2e: `<svg role="img" aria-label="Robo">` và `data-mood`; thêm `data-form` và `data-size`. Các chuỗi đang có trong e2e (`Robo sẵn sàng`, `Học tiếp`, `Xu: 3`, `Robo đang đi nghỉ…`) không đổi.
- Mọi chuỗi giao diện đi qua `t(key)`; `vi.ts` và `en.ts` cùng khóa, cùng placeholder. Mô tả hình cho trình đọc màn hình (khi cần) cũng qua `t`.
- Mọi hoạt cảnh có quy tắc `@media (prefers-reduced-motion: reduce)` tắt chuyển động; khi tắt, màn hình vẫn hiện trạng thái cuối và vẫn bấm được.
- Hình vẽ bằng SVG viết tay trong code (không file ảnh, không font ngoài, không gọi mạng). Màu lấy từ biến CSS hoặc hằng số trong `src/ui/robot/palette.ts`.
- Mỗi task vẽ phải tự xem hình: chạy `npm run dev` hoặc `vite preview`, mở `#/gallery` bằng Playwright (Chromium tại `PW_CHROMIUM_PATH`), chụp ảnh vào `.superpowers/sdd/<plan>/shots/` (thư mục bị git bỏ qua) và xem lại ảnh trước khi báo xong. Báo cáo ghi đường dẫn ảnh.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy.
- Mốc xanh trước khi bắt đầu: `npm run check` sau M5d. Sau M6a: Vitest tăng, pytest 21, e2e 15. Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e.

## Review Focus

1. Robo không bao giờ nhỏ đi sau khi tiến hóa: cỡ nhỏ nhất của dạng sau lớn hơn cỡ lớn nhất của dạng trước. Test: Task 1.
2. Mọi tổ hợp 4 dạng × 3 cỡ × 5 trạng thái × phụ kiện vẽ được, không chồng sai chỗ, không mất `aria-label`. Test: Task 2, Task 3 (gallery và test snapshot thuộc tính).
3. Trạng thái phòng đúng thứ tự spec 5.6: đi nghỉ trước, rồi hết pin, buồn ngủ, vui, bình thường. Nút "Sạc cho Robo" vẫn mở trạm ôn. Test: Task 4.
4. Hoạt cảnh tiến hóa không chặn con: có nút bỏ qua, tôn trọng `prefers-reduced-motion`, kết thúc ở màn hình chúc mừng cũ (điểm, xu, Vui, "Học tiếp"). Test: Task 5.
5. Không đổi dữ liệu đã lưu; file sao lưu cũ mở được như trước. Test: các test backup hiện có.

## Quyết định thiết kế

Spec để ngỏ các điểm sau; kế hoạch chốt như dưới đây (chưa được người bảo trì duyệt, ghi trong `docs/superpowers/DECISIONS.md` mục M6a).

1. **Dạng = `min(pet.stage, 4)`.** Giai đoạn 1 là Viên nang, 2 Sơ sinh, 3 Bé con, 4 Thiếu niên. Đạt kiểm tra tiến hóa giai đoạn 4 (`pet.stage` = 5) vẫn là Thiếu niên, thêm huy hiệu ngôi sao vàng trên màn hình ngực ("đã học xong giai đoạn 4"); hoạt cảnh vẫn chạy với dòng "Robo đã học xong cả 4 giai đoạn!".
2. **Linh kiện theo dạng:** Viên nang chỉ có thân tròn liền đầu và màn hình mặt; Sơ sinh có thêm ăng-ten; Bé con có thêm 2 tay; Thiếu niên có thêm màn hình ngực và thân cao hơn. Hoạt cảnh nói tên linh kiện mới.
3. **Cỡ:** 3 cỡ trong mỗi dạng vẫn theo `growthSize` (XP trong giai đoạn). Kích thước điểm ảnh tăng đơn điệu theo (dạng, cỡ): dạng 1: 96/104/112; dạng 2: 120/128/136; dạng 3: 144/152/160; dạng 4: 168/176/184. Ở màn hình khác phòng, Robo dùng kích thước riêng của màn hình đó và chỉ đổi hình theo dạng.
4. **Trạng thái:** 5 trạng thái của spec là `happy`, `neutral`, `sleepy`, `drained`, `vacation`; `sad` và `thinking` là 2 nét mặt phụ cho bong bóng giải thích, giữ như cũ. Buồn ngủ: mắt khép hờ, miệng ngáp, chữ "Z" bay. Hết pin: Robo nằm nghiêng cạnh ổ sạc, biểu tượng pin rỗng. Đi nghỉ: kính râm.
5. **Phụ kiện:** mỗi chỗ đeo (đầu, mặt, cổ) có điểm neo theo dạng. Khi đi nghỉ, kính râm của trạng thái thay cho phụ kiện ở mặt (chỉ trong lúc đi nghỉ). Viên nang không có cổ: phụ kiện cổ đeo ở mép dưới màn hình mặt.
6. **Đồ trang trí** có chỗ cố định trong phòng (chậu cây trái, đèn ngủ phải, tranh trên tường, thảm dưới Robo, kệ sách trái sau chậu cây). Ở cảnh bãi biển, đồ trang trí không hiện.
7. **Hoạt cảnh tiến hóa** (khoảng 4 giây): màn tối, dạng cũ rung và sáng dần, chớp trắng, dạng mới hiện ra với tên linh kiện mới, rồi tới màn hình chúc mừng hiện có. Nút "Bỏ qua" luôn có. Khi `prefers-reduced-motion`, bỏ qua thẳng tới màn hình chúc mừng có hình dạng mới.
8. **Trang `#/gallery`** chỉ có ở bản dev, không có trong `npm run build`; không có khóa i18n riêng (trang dành cho người lớn, chữ tiếng Anh cố định được phép vì không tới tay học sinh).
9. **Hình trong cửa hàng và Sổ thành tích:** mỗi phụ kiện và đồ trang trí có hình nhỏ 40×40; Sổ thành tích hiện 4 dạng, dạng chưa đạt là bóng xám có dấu "?".

---

## File Structure

```
src/game/
  look.ts            FORM_COUNT, formOf, robotPixelSize, robotLook, RobotLook
src/ui/robot/
  palette.ts         màu dùng chung
  bodies.tsx         FormBody: thân theo dạng (viewBox chung 0 0 64 72)
  faces.tsx          Face: mắt và miệng theo trạng thái
  accessories.tsx    AccessoryArt, ACCESSORY_ANCHORS theo dạng, ItemIcon
  decor.tsx          DecorArt, ItemIcon cho đồ trang trí
  RoomScene.tsx      cảnh phòng, ổ sạc, bãi biển, đồ trang trí, Robo
src/ui/
  Robot.tsx          (sửa) props form, equipped, data-form, data-size
  PetRobot.tsx       Robo của con: đọc dạng và phụ kiện từ useGame()
  StatBar.tsx        thanh Pin, Vui, Lớn lên
  EvolutionShow.tsx  hoạt cảnh tiến hóa toàn màn hình
  GalleryScreen.tsx  trang dev #/gallery
  (sửa) RoomScreen, EvolutionTestScreen, AchievementsScreen, ShopScreen, ResultView, RobotBubble, routing, AppRoutes
src/styles.css       (sửa) cảnh phòng, thanh, hoạt cảnh, reduced-motion
e2e/robot.spec.ts    phòng hết pin bằng file sao lưu dựng sẵn
```

### Task 1: Dáng của Robo là hàm thuần

**Files:** Create `src/game/look.ts`, `src/game/look.test.ts`. Modify `src/ui/names.ts` (lấy `FORM_COUNT` từ `look.ts`), `src/ui/RoomScreen.tsx` (dùng `robotPixelSize`, xóa `ROBOT_SIZES`).

**Interfaces:**

```ts
export const FORM_COUNT = 4;
export type RobotForm = 1 | 2 | 3 | 4;
export type RobotState = "happy" | "neutral" | "sleepy" | "drained" | "vacation";
export interface RobotLook {
  form: RobotForm;
  graduated: boolean;          // pet.stage > FORM_COUNT
  size: GrowthSize;            // 1 | 2 | 3
  state: RobotState;
  equipped: string[];          // id phụ kiện đang đeo, theo thứ tự head, face, neck; bỏ id không có trong SHOP_ITEMS
}
export function formOf(stage: number): RobotForm;           // clamp 1..4
export function robotPixelSize(form: RobotForm, size: GrowthSize): number; // 96 + 24*(form-1) + 8*(size-1)
export function robotLook(bundle: ContentBundle, state: GameState, today: string): RobotLook;
```

`robotLook` dùng `roomCondition`, `stageXp`, `stageXpMax(currentStage(...))`, `growthSize`. Ánh xạ `normal` → `neutral`.

**Test (viết trước):**
- `formOf`: 0 hoặc âm → 1; 1..4 giữ nguyên; 5, 9 → 4.
- `robotPixelSize` đơn điệu: với mọi dạng f < 4, `robotPixelSize(f, 3) < robotPixelSize(f + 1, 1)`; bảng đúng 12 giá trị của quyết định 3.
- `robotLook` với state mẫu: stage 5 → form 4, graduated true; đi nghỉ thắng hết pin; `pin = 0` → drained; `equipped` bỏ id lạ và xếp theo chỗ đeo.
- Ngay sau tiến hóa (stage 2, `stageStartXp = xp`): size 1 và `robotPixelSize` lớn hơn cỡ lớn nhất của dạng 1.

- [ ] Viết test, chạy thấy đỏ.
- [ ] Viết `look.ts`; sửa `names.ts`, `RoomScreen.tsx` dùng `robotPixelSize(formOf(stage), size)`.
- [ ] `npx vitest run src/game src/ui/RoomScreen.test.tsx`, `npm run typecheck`.
- [ ] Commit `feat(game): the robot look is a pure function of the state`.

### Task 2: Thân Robo theo 4 dạng và 5 trạng thái

**Files:** Create `src/ui/robot/palette.ts`, `bodies.tsx`, `faces.tsx`, `src/ui/GalleryScreen.tsx`. Modify `src/ui/Robot.tsx`, `src/ui/routing.ts` (+ test), `src/ui/AppRoutes.tsx`, `src/ui/shell.test.tsx`.

**Interfaces:**

```ts
export type RobotMood = RobotState | "sad" | "thinking";
export function Robot(props: {
  mood?: RobotMood;            // mặc định "neutral"
  size?: number;               // chiều rộng điểm ảnh, mặc định 56
  form?: RobotForm;            // mặc định 1
  graduated?: boolean;         // mặc định false
  equipped?: string[];         // mặc định []
}): JSX.Element;
// <svg role="img" aria-label="Robo" data-mood data-form data-size={size} viewBox="0 0 64 72" width={size} height={round(size*72/64)}>
```

Yêu cầu hình:
- viewBox chung `0 0 64 72` cho mọi dạng, chân chạm đáy (y ≈ 70) để Robo đứng trên sàn ở mọi dạng.
- Dạng 1 Viên nang: 1 khối bo tròn (đầu và thân liền), màn hình mặt, 2 chân ngắn. Dạng 2: thêm ăng-ten có đèn đỏ. Dạng 3: thêm 2 tay (giơ lên khi `happy`, buông khi `sleepy`/`drained`). Dạng 4: thân cao hơn, màn hình ngực; `graduated` thêm ngôi sao vàng trên màn hình ngực.
- `faces.tsx`: mắt (và miệng nếu có) cho 7 nét mặt, đặt trong màn hình mặt của từng dạng (màn hình mặt có toạ độ theo dạng, xuất từ `bodies.tsx` dưới dạng `FACE_BOX[form]`). `sleepy`: mắt khép hờ, miệng ngáp tròn, chữ "z" nhỏ cạnh đầu. `drained`: mắt mờ và biểu tượng pin rỗng trên trán hoặc ngực.
- Hình `drained` của `Robot` vẫn đứng (tư thế nằm do `RoomScene` xoay ở Task 4), để màn hình khác không bị lệch.
- `GalleryScreen` (`#/gallery`, chỉ khi `import.meta.env.DEV`): lưới 4 dạng × 7 nét mặt ở cỡ 112, thêm 1 hàng `graduated`, 1 hàng mỗi phụ kiện (Task 3 bổ sung), 1 hàng cảnh phòng (Task 4 bổ sung).

**Test (viết trước):**
- `Robot` mặc định vẫn có `role="img"`, tên "Robo", `data-mood="neutral"`, `data-form="1"`.
- Với mỗi dạng: dạng 1 không có phần tử `[data-part="antenna"]`, `[data-part="arms"]`, `[data-part="chest"]`; dạng 2 có antenna; dạng 3 có antenna, arms; dạng 4 có cả 3. `graduated` thêm `[data-part="star"]`.
- `routing`: `#/gallery` → `{ name: "gallery" }` chỉ khi DEV; test bằng `vi.stubEnv` hoặc tham số.
- Ảnh chụp `#/gallery` được xem và ghi trong báo cáo.

- [ ] Test đỏ → vẽ → test xanh → chụp và xem ảnh → `npm run typecheck`, `npx vitest run src/ui`.
- [ ] Commit `feat(ui): Robo has 4 forms with new parts at each evolution`.

### Task 3: Phụ kiện trên người Robo và Robo của con ở mọi màn hình

**Files:** Create `src/ui/robot/accessories.tsx`, `src/ui/PetRobot.tsx` (+ test). Modify `Robot.tsx`, `RoomScreen.tsx`, `ResultView.tsx`, `RobotBubble.tsx`, `EvolutionTestScreen.tsx` (màn hình chưa đạt), `ShopScreen.tsx`, `GalleryScreen.tsx`.

**Interfaces:**

```ts
export const ACCESSORY_ANCHORS: Record<RobotForm, Record<AccessorySlot, { x: number; y: number; w: number }>>;
export function AccessoryArt(props: { id: string; form: RobotForm }): JSX.Element | null; // null cho id lạ
export function ItemIcon(props: { id: string; size?: number }): JSX.Element | null;     // 40×40, cho cửa hàng
export function PetRobot(props: { mood?: RobotMood; size?: number }): JSX.Element;
// PetRobot: form, graduated, equipped từ useGame().state; mood mặc định = robotLook(...).state
```

- 10 phụ kiện của `SHOP_ITEMS` (no-buom, khan-quang, kinh-ram, kinh-tron, mu-luoi-trai, tai-nghe, ghim-sao, ang-ten-vang, ao-choang, vuong-mien) có hình. `ang-ten-vang` ở dạng 1 (chưa có ăng-ten) vẫn hiện như 1 ăng-ten vàng gắn trên đầu. `ao-choang` vẽ sau thân (lớp dưới).
- Thứ tự lớp: phụ kiện cổ sau thân (áo choàng) hoặc trước thân (nơ, khăn, ghim), mặt trên màn hình mặt, đầu trên cùng.
- `mood="vacation"` → không vẽ phụ kiện mặt (kính râm của trạng thái thay).
- `PetRobot` dùng ở mọi chỗ trong `GameProvider`: Phòng, Kết quả, Bong bóng, Tiến hóa chưa đạt. Ngoài `GameProvider` (Onboarding, ErrorBoundary, GameRoot, SecondTab) giữ `Robot` dạng 1.
- Cửa hàng hiện `ItemIcon` bên trái tên mỗi phụ kiện và đồ trang trí (đồ trang trí lấy từ `decor.tsx` ở Task 4; Task 3 tạo `ItemIcon` trả `null` cho đồ trang trí, Task 4 bổ sung).
- `RoomScreen` giữ dòng chữ "Đang đeo: …" (chữ nhỏ dưới Robo) để con đọc được tên món đồ và trình đọc màn hình biết Robo đeo gì.

**Test (viết trước):**
- Mỗi id phụ kiện ở mỗi dạng: `AccessoryArt` trả phần tử có `data-accessory={id}`; id lạ trả `null`.
- `Robot` với `equipped=["kinh-ram"]` và `mood="vacation"`: không có `[data-accessory="kinh-ram"]`.
- `PetRobot` trong `renderWithGame` với `pet.stage = 3` và `equipped = ["vuong-mien"]`: `data-form="3"` và có `[data-accessory="vuong-mien"]`.
- `ShopScreen`: mỗi hàng phụ kiện có 1 `svg` biểu tượng (`aria-hidden="true"`).
- Ảnh gallery hàng phụ kiện ở 4 dạng được xem và ghi trong báo cáo.

- [ ] Test đỏ → làm → test xanh → chụp và xem ảnh.
- [ ] Commit `feat(ui): accessories are drawn on Robo and Robo looks the same on every screen`.

### Task 4: Cảnh phòng, đồ trang trí và thanh chỉ số

**Files:** Create `src/ui/robot/decor.tsx`, `src/ui/robot/RoomScene.tsx` (+ test), `src/ui/StatBar.tsx` (+ test). Modify `RoomScreen.tsx` (+ test), `styles.css`, `GalleryScreen.tsx`, `accessories.tsx` (`ItemIcon` cho đồ trang trí), i18n.

**Interfaces:**

```ts
export function RoomScene(props: {
  look: RobotLook;
  decor: string[];             // id đồ trang trí đang có
  robotSize: number;
  children?: ReactNode;        // bong bóng lời Robo
}): JSX.Element;
// <div className="room-scene scene-{room|beach}" data-scene="room|beach" data-condition={look.state}>
export function StatBar(props: { label: string; value: number; max: number; tone: "pin" | "vui" | "growth" }): JSX.Element;
// <div role="meter" aria-label={label} aria-valuenow aria-valuemin=0 aria-valuemax>…</div> + chữ "x/5" hoặc "%" giữ nguyên
```

- Cảnh phòng: tường, sàn, cửa sổ (trời tối hơn khi `sleepy` hoặc `drained`), đồ trang trí theo quyết định 6.
- `drained`: ổ sạc cạnh Robo, Robo xoay nằm nghiêng (CSS transform trên khung bọc, không trên `svg` gốc để test vẫn tìm `role="img"`).
- `sleepy`: phòng tối hơn, bong bóng lời Robo có đuôi trỏ về Robo và các chữ "Z" bay (hoạt cảnh, tắt khi reduced-motion).
- `vacation`: bãi biển (trời, biển, cát, ô che nắng), không đồ trang trí, Robo đeo kính râm.
- `happy`: Robo nhún nhẹ (hoạt cảnh, tắt khi reduced-motion).
- Thanh Pin, Vui, Lớn lên thay cho dòng chữ; chữ "Pin: 3/5" vẫn có trong thanh để test và e2e cũ không đổi.
- Dòng "Trong phòng: …" giữ nguyên như dòng "Đang đeo".

**Test (viết trước):**
- `RoomScene` với mỗi trạng thái: `data-scene` đúng (beach chỉ khi vacation); drained có `[data-part="charger"]`; vacation không có `[data-decor]`; room có `[data-decor="chau-cay"]` khi decor có `chau-cay`.
- `StatBar`: `aria-valuenow`, `aria-valuemax`, chữ hiện.
- `RoomScreen` test cũ vẫn xanh (sửa selector nếu cần nhưng giữ nghĩa); nút "Sạc cho Robo" vẫn tới `#/review`.
- Ảnh 5 cảnh phòng (có và không có đồ trang trí) được xem và ghi trong báo cáo.

- [ ] Test đỏ → làm → test xanh → chụp và xem ảnh.
- [ ] Commit `feat(ui): the room shows its scene, decor and stat bars`.

### Task 5: Hoạt cảnh tiến hóa toàn màn hình

**Files:** Create `src/ui/EvolutionShow.tsx` (+ test). Modify `EvolutionTestScreen.tsx` (+ test), `styles.css`, i18n (`evolution.newPart.antenna`, `.arms`, `.chest`, `.graduated`, `evolution.skip`, `evolution.from`).

**Interfaces:**

```ts
export function EvolutionShow(props: {
  from: { form: RobotForm; graduated: boolean };
  to: { form: RobotForm; graduated: boolean };
  equipped: string[];
  robotName: string;
  onDone(): void;               // gọi khi hết hoạt cảnh hoặc bấm Bỏ qua
  reducedMotion?: boolean;      // mặc định đọc matchMedia("(prefers-reduced-motion: reduce)")
}): JSX.Element;
// <div className="evolution-show" role="dialog" aria-modal="true" aria-label={t("evolution.title",{name})}>
```

- Các bước (CSS, tổng khoảng 4 giây): nền tối phủ toàn màn hình; dạng cũ rung, sáng dần; chớp trắng; dạng mới phóng to rồi về cỡ thường; dòng chữ linh kiện mới (`evolution.newPart.*` theo `to.form`, hoặc `.graduated` khi `to.graduated`). `onDone` gọi bằng sự kiện `animationend` của bước cuối, kèm hẹn giờ dự phòng 6 giây.
- Nút "Bỏ qua" có focus ngay khi mở; Esc cũng bỏ qua.
- `reducedMotion` → gọi `onDone` ngay ở lần render đầu (qua `useEffect`), không hiện lớp phủ.
- `EvolutionPassed` hiện `EvolutionShow` trước, rồi màn hình chúc mừng hiện có với `PetRobot` dạng mới (kích thước 200).

**Test (viết trước):**
- Với `reducedMotion` → `onDone` được gọi, không có `role="dialog"`.
- Bấm "Bỏ qua" → `onDone`; Esc → `onDone`.
- Dòng linh kiện: from 1 → to 2 hiện chữ ăng-ten; from 4 → to 4 graduated hiện chữ "học xong".
- `EvolutionTestScreen` test đạt: sau khi bỏ qua hoạt cảnh, vẫn thấy điểm, xu, "Học tiếp" như trước; Robo có `data-form="2"`.

- [ ] Test đỏ → làm → test xanh → chụp vài khung hình (dùng `page.clock` hoặc tạm dừng animation) và xem.
- [ ] Commit `feat(ui): a full-screen evolution show`.

### Task 6: Sổ thành tích có hình và xem lại toàn bộ hình

**Files:** Modify `AchievementsScreen.tsx` (+ test), `styles.css`, `GalleryScreen.tsx`.

- Sổ thành tích hiện 4 dạng bằng `Robot` cỡ 72: dạng đã đạt có màu và tên; dạng chưa đạt là bóng xám (CSS `filter: grayscale(1) brightness(0.6)`) với dấu "?" và chữ "Chưa có"; nếu `graduated` thì dạng 4 có ngôi sao.
- Rà toàn bộ gallery: các dạng cân đối, phụ kiện đúng chỗ ở mọi dạng, chữ đọc được, màu đủ tương phản (WCAG AA cho chữ). Sửa các lệch nhỏ.

**Test:** test hiện có của Sổ thành tích vẫn xanh; thêm: dạng chưa đạt có `data-form` và class `form-locked`; tên dạng chưa đạt không hiện.

- [ ] Commit `feat(ui): the achievement book shows Robo's forms`.

### Task 7: E2E và kiểm tra toàn bộ

**Files:** Create `e2e/robot.spec.ts`, `e2e/fixtures/drained.pypet` (tạo bằng script nhỏ `tools/make_e2e_backup.ts` từ state mẫu: stage 3, pin 0, có phụ kiện `vuong-mien`, decor `chau-cay`). Modify `docs/superpowers/STATUS.md` không (để bước cuối mốc).

- E2E: chào hỏi → Sao lưu → nhập `drained.pypet` → Phòng: `data-form="3"`, `data-mood="drained"`, có ổ sạc, có vương miện; bấm "Sạc cho Robo" tới trạm ôn.
- `npm run check` xanh; ghi số test mới.

- [ ] Commit `test(e2e): the room of a drained Robo of form 3 from a backup`.

## Việc chuyển sang M6b

- CI/CD (GitHub Actions chạy `npm run check`, deploy GitHub Pages khi merge vào `main`), lint (spec 11.7).
- Spec 10 còn thiếu: bỏ qua bài lỗi lúc chạy và ghi nhật ký `content-error`; màn hình kiểm tra trình duyệt có IndexedDB và song ngữ; hẹn giờ khi Pyodide khởi động treo; khung "Robo chưa khởi động được" rõ hơn.
- STATUS mục 5 (khu phụ huynh: hiểu lầm hay gặp, đầu ra so với mong đợi, thời gian và ngôn ngữ từng bài, tên bài thay ID).
