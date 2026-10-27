# Thiết kế lại giao diện Py-Pet

Ngày: 2026-10-27. Trạng thái: chờ người bảo trì duyệt.

Liên quan: spec chính `docs/superpowers/specs/2026-10-06-py-pet-design.md` (mục 8 Giao diện, 9 Khu phụ huynh, 10 Xử lý lỗi). Tài liệu này chỉ đổi cách trình bày và cách đi lại giữa các màn hình. Luật chơi, dữ liệu và nội dung giữ nguyên như spec chính. Những chỗ tài liệu này đổi hành vi được ghi rõ là "Đổi hành vi".

Mockup (mở bằng trình duyệt, cần mạng để tải font mẫu): `docs/superpowers/specs/ui-revamp-mockups/`

- `1-landing.html`: 3 hướng cho landing page. Người bảo trì chọn hướng C "Nhãn dán đậm".
- `2-room.html`: Phòng của Robo với 2 cách đặt menu. Người bảo trì chọn B "Thanh bên trái".
- `3-other-screens.html`: Bản đồ học, Bài học (bài code), Cửa hàng, Sổ thành tích, Khu phụ huynh (Tổng quan), Chào hỏi.

Số liệu trong mockup chỉ để minh họa. Trong mockup Phòng của Robo, Robo ở dạng 3 nhưng bài tiếp theo thuộc giai đoạn 4; app thật hiện đúng dạng theo giai đoạn (`formOf` trong `src/game/look.ts`).

## 1. Mục đích

Giao diện hiện tại dùng nhiều nút xếp thành hàng (Phòng robot có 8 nút), thanh tiêu đề màu tối, góc bo tròn và kiểu trình bày của 1 trang tài liệu. Người bảo trì muốn 1 giao diện hiện đại, tông sáng, không bo tròn, có landing page dẫn tới bài học và hướng dẫn, và gom các nút đi lại vào menu.

## 2. Mục tiêu, ngoài phạm vi, điều phải tránh

Mục tiêu:

1. 1 hệ thống thiết kế chung (màu, chữ, viền, bóng, biểu tượng, thành phần) theo phong cách "Nhãn dán đậm": nền kem sáng, viền đen 2px, bóng đổ cứng không làm mờ, màu tươi, góc vuông.
2. Landing page có 3 nút: Bắt đầu học, Hướng dẫn, Khu phụ huynh.
3. Thanh bên trái cố định thay cho hàng nút ở Phòng robot.
4. Các màn hình làm bài có khung "tập trung", không có thanh bên.
5. Mọi màn hình trong `src/ui/` và trang `public/huong-dan.html` theo cùng hệ thống.

Ngoài phạm vi:

- Đổi luật chơi, cấu trúc `GameState`, nội dung bài học, từ điển lỗi.
- Vẽ lại Robo, phụ kiện, đồ trang trí và cảnh phòng (xem mục 9).
- Bản tiếng Anh của trang Hướng dẫn.
- Giao diện cho điện thoại. App vẫn nhắm tới laptop (spec chính mục 1).

Điều phải tránh (làm vậy là thất bại dù chạy được):

- Góc bo tròn ở bất kỳ thành phần giao diện nào (nút, thẻ, ô nhập, tab, thanh, banner, menu).
- App gọi mạng, kể cả để tải font.
- Chữ không đạt độ tương phản WCAG AA.
- Trẻ phải mở menu ẩn mới tìm được Bản đồ học, Cửa hàng hoặc Sổ thành tích.
- Mất chức năng đang có hoặc làm đỏ `npm run check`.

## 3. Ràng buộc

- Không gọi mạng (CLAUDE.md). Font tự chứa trong repo dưới dạng `woff2`, có bộ ký tự tiếng Việt.
- Mọi chuỗi giao diện đi qua `t(key)`; `src/i18n/vi.ts` và `src/i18n/en.ts` cùng khóa và cùng placeholder.
- App chạy được dưới đường dẫn con `/py-pet/` (e2e `e2e/subpath.spec.ts`), nên mọi URL tới font và tài nguyên phải là đường dẫn tương đối.
- Giữ hành vi giảm chuyển động hiện có (`prefers-reduced-motion`).
- Giữ các vùng bắt lỗi theo màn hình (`ErrorBoundary`, `ItemBoundary`) và các màn hình lỗi của spec chính mục 10.
- `npm run check` phải xanh sau mỗi mốc.

## 4. Quyết định của người bảo trì (2026-10-27)

1. Giao diện tông sáng, hiện đại, tránh nét bo tròn.
2. Gom các nút đi lại thành menu.
3. Có landing page giới thiệu Robo với 3 nút: Bắt đầu học, Hướng dẫn, Khu phụ huynh. Người mở link lần đầu thấy trang này.
4. Phong cách: hướng C "Nhãn dán đậm" (`1-landing.html`).
5. Menu: phương án B "Thanh bên trái" (`2-room.html`).
6. Claude chủ động đề xuất các màn hình còn lại (`3-other-screens.html` và mục 7).

## 5. Hệ thống thiết kế

### 5.1. Màu

Đặt thành biến CSS trong `:root` của `src/styles.css`, thay các biến hiện có.

| Biến | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#fff8e8` | Nền trang (kem) |
| `--surface` | `#ffffff` | Nền thẻ, thanh bên, ô nhập |
| `--ink` | `#141414` | Chữ chính, viền, bóng đổ |
| `--muted` | `#555555` | Chữ phụ (7,0:1 trên nền kem) |
| `--primary` | `#2f5bea` | Nút chính, mục đang làm, thanh Lớn lên. Chữ trắng trên nền này đạt 5,5:1 |
| `--yellow` | `#ffd43b` | Mục đang chọn ở thanh bên, logo, chữ được tô, tab trên mã nguồn |
| `--mint` | `#9be3c0` | Bài đã xong, mục đang chọn trong khu phụ huynh |
| `--mint-soft` | `#c9f0dc` | Nút phụ màu xanh (Ôn tập, Khu phụ huynh) |
| `--mint-bg` | `#eefaf3` | Nền thanh bên của khu phụ huynh |
| `--pink` | `#ff9fb8` | Kiểm tra chủ đề, thảm trong phòng |
| `--coral` | `#ff6b6b` | Test sai, số đếm việc cần xem |
| `--danger` | `#b42318` | Chữ báo lỗi (6,2:1 trên nền kem; màu cũ `#d33a3a` chỉ đạt 4,47:1) |
| `--stat-pin` | `#2fbf71` | Thanh Pin |
| `--stat-vui` | `#ff6fa5` | Thanh Vui |
| `--chip-streak` | `#ffe0cc` | Chip chuỗi ngày |
| `--chip-xu` | `#fff1a8` | Chip xu, thẻ cảnh báo vàng |
| `--code-bg` | `#fffdf6` | Nền trình soạn code và khối code |

Mockup dùng `#3d6bff` cho màu chính; màu này chỉ đạt 4,4:1 với chữ trắng nên bản thật dùng `#2f5bea`. Mọi cặp chữ và nền mới phải được kiểm tra đạt AA (4,5:1 cho chữ thường, 3:1 cho chữ từ 18,66px đậm trở lên). Số đếm trên nền `--coral` dùng chữ `--ink`, không dùng chữ trắng.

### 5.2. Chữ

- Chữ giao diện: Lexend, các độ đậm 400, 600, 700, 800.
- Code, nhãn nhỏ dạng mã (ví dụ "BÀI TẬP CODE"): JetBrains Mono, độ đậm 400 và 600.
- Cả 2 font dùng giấy phép SIL OFL. File `woff2` (bộ Latin và Vietnamese) đặt trong `public/fonts/`, khai báo bằng `@font-face` với `font-display: swap`. Font dự phòng: `system-ui` và `ui-monospace`.
- Cỡ chữ: tiêu đề màn hình 30px đậm 800; tiêu đề thẻ 13px chữ hoa, giãn chữ 0,08em; chữ thường 16px; chữ phụ 13px; code 15px.

### 5.3. Hình khối

- `border-radius: 0` cho mọi thành phần giao diện. Bỏ biến `--radius` hoặc đặt bằng 0.
- Viền: 2px `--ink`.
- Bóng đổ cứng, không làm mờ: 2px 2px 0 cho nút nhỏ, 3px 3px 0 cho nút và mục đang chọn, 4px 4px 0 cho thẻ, 6px 6px 0 cho cảnh phòng và menu nổi.
- Nút khi rê chuột: dịch lên trái 1px, bóng tăng 1px. Khi nhấn: dịch xuống phải 2px, bóng còn 1px. Khi tắt: độ mờ 0,45 và không có bóng. Khi bật giảm chuyển động: không dịch, không chuyển tiếp.
- Viền tiêu điểm bàn phím: outline 3px `--primary`, cách 2px. Không dùng bóng đổ thay cho viền tiêu điểm.

### 5.4. Biểu tượng

1 bộ biểu tượng SVG nội tuyến, khung 18 × 18, nét 2px, đầu nét vuông, góc nhọn, không tô (trừ chip chuỗi ngày và xu). Bộ tối thiểu: nhà, bản đồ, túi mua sắm, cúp, đĩa lưu, dấu hỏi, ổ khóa, mũi tên quay lại, nút chạy, dấu tích, biểu đồ, cảnh báo, danh sách, quà, thanh trượt cài đặt, ngọn lửa (chuỗi ngày), hình thoi (xu). Biểu tượng luôn đi kèm chữ hoặc có `aria-label`; biểu tượng trang trí có `aria-hidden="true"`.

### 5.5. Thành phần

| Thành phần | Mô tả |
|---|---|
| Nút | 3 kiểu: chính (`--primary`, chữ trắng), phụ (trắng), xanh (`--mint-soft`). 2 cỡ: thường và nhỏ. Viền 2px, bóng cứng |
| Thẻ | Nền trắng, viền 2px, bóng 4px; tiêu đề thẻ kiểu nhãn chữ hoa |
| Chip | Ô nhỏ viền 2px, chữ đậm 14px, có biểu tượng: chuỗi ngày, xu, Pin |
| Tab | Hàng ô liền nhau viền 2px; tab đang chọn nền `--ink` chữ trắng (tab giai đoạn) hoặc nền trắng nổi lên trên đường kẻ (tab Cửa hàng). Theo mẫu ARIA `tablist` |
| Thanh chỉ số | Pin và Vui: số ô vuông bằng `STAT_MAX` (hiện là 5; mockup vẽ 10 ô chỉ để minh họa) trong khung viền 2px. Lớn lên: 1 thanh liền màu `--primary`. Giữ `role` và nhãn của `StatBar` hiện tại |
| Ô bước | Hàng ô vuông 16px: đen là đã xong, `--primary` là đang làm, trắng là chưa làm |
| Ô nhập | Viền 2px, không bo góc, nền trắng; khi có lỗi viền `--danger` và có dòng chữ báo lỗi |
| Banner | Dải ngang ở đầu vùng nội dung, viền dưới 2px; vàng (nhắc nhở), đỏ nhạt (lỗi), có nút hành động bên phải |
| Bong bóng Robo | Ô viền 2px, bóng 3px, có đuôi tam giác đặc màu `--ink` |

## 6. Bố cục và điều hướng

### 6.1. 3 khung trang

1. **Khung landing:** thanh trên (logo, các link Trang chủ, Bài học, Hướng dẫn, Khu phụ huynh, VI | EN) và phần giới thiệu. Không có thanh bên.
2. **Khung có thanh bên:** thanh bên trái rộng 220px và vùng nội dung. Dùng cho Phòng robot, Bản đồ học, Cửa hàng, Sổ thành tích, Sao lưu và Khu phụ huynh.
3. **Khung tập trung:** thanh trên cao 60px, gồm nút "Về phòng", tên bài, các ô bước (nếu màn hình có bước), và bên phải là chip Pin, chip xu. Không có thanh bên. Dùng cho các route trong `STUDY_ROUTES` của `src/ui/AppRoutes.tsx` (lesson, review, practice, topicTest, evolution, remedial, assigned) và màn hình Chào hỏi. Đổi hành vi: hiện tại các màn hình này có thanh tiêu đề chung; bản mới bỏ thanh đó để con tập trung. Nút "Về phòng" làm đúng việc mà `onExit` đang làm.

Thanh tiêu đề tối hiện tại (`Header.tsx`) bị bỏ. Trạng thái Python (đang tải, sẵn sàng) chuyển xuống 1 dòng nhỏ ở đáy thanh bên và vào thanh trên của khung tập trung. Nút VI/EN chuyển vào thanh bên (khung có thanh bên), thanh trên (khung landing) và bước 1 của Chào hỏi.

### 6.2. Thanh bên trái

Từ trên xuống:

1. Logo "Py-Pet" (ô vàng "Py" và chữ), link tới `#/welcome`.
2. Nhóm chính: Phòng Robo (`#/`), Bản đồ học (`#/map`), Cửa hàng (`#/shop`), Sổ thành tích (`#/achievements`).
3. Đường kẻ phân nhóm.
4. Nhóm phụ: Sao lưu (`#/backup`), Hướng dẫn (`huong-dan.html`, mở trong cùng tab).
5. Đáy: dòng trạng thái Python, nút VI | EN, nút "Khu phụ huynh" nền `--mint-soft` có biểu tượng ổ khóa (`#/parent`).

Mục ứng với route hiện tại có nền `--yellow`, viền và bóng 3px, và `aria-current="page"`. Thanh bên là `<nav>` có nhãn.

Khi ở trong khu phụ huynh (đã nhập PIN), thanh bên chuyển sang **chế độ phụ huynh**: nền `--mint-bg`, nhãn "Khu phụ huynh" có ổ khóa, 5 mục ứng với 5 tab của spec chính mục 9 (Tổng quan, Con cần hỗ trợ, Tiến độ, Phần thưởng, Cài đặt), mục đang chọn nền `--mint`. Mục "Con cần hỗ trợ" có số khái niệm cần hỗ trợ, mục "Phần thưởng" có số yêu cầu chờ duyệt (ẩn khi bằng 0). Đáy có dòng "Tự khóa sau 5 phút không dùng" và nút "Khóa và quay lại": khóa khu phụ huynh rồi về Phòng robot. Hành vi tự khóa giữ nguyên.

### 6.3. Route

| Hash | Có hồ sơ | Chưa có hồ sơ |
|---|---|---|
| `#/` | Phòng robot (như hiện tại) | Landing |
| `#/welcome` | Landing | Landing |
| các route khác | Như hiện tại | Landing |

Đổi hành vi: hiện tại khi chưa có hồ sơ, app hiện ngay màn hình Chào hỏi. Bản mới hiện Landing trước; nút "Bắt đầu học" mở Chào hỏi.

Trên Landing:

- Thanh trên: "Trang chủ" là `#/welcome` (trang đang mở); "Bài học" làm đúng việc của nút "Bắt đầu học"; "Hướng dẫn" và "Khu phụ huynh" làm đúng việc của 2 nút cùng tên.
- "Bắt đầu học": có hồ sơ thì về `#/`; chưa có thì mở Chào hỏi.
- "Hướng dẫn": mở `huong-dan.html`.
- "Khu phụ huynh": có hồ sơ thì mở `#/parent` (màn hình nhập PIN). Chưa có hồ sơ thì hiện 1 thẻ giải thích ngay trên Landing: khu phụ huynh có sau khi tạo hồ sơ, bố mẹ đặt mã PIN ở bước cuối của Chào hỏi; thẻ có nút "Bắt đầu" (mở Chào hỏi) và link tới mục "Dành cho bố mẹ" của trang Hướng dẫn (`huong-dan.html#bo-me`).

### 6.4. Màn hình hẹp

- Từ 1100px trở lên: thanh bên đầy đủ 220px.
- Từ 760px đến dưới 1100px: thanh bên thu lại còn 64px, chỉ hiện biểu tượng; chữ của mục vẫn là tên truy cập (`aria-label`) và hiện thành chú thích khi rê chuột hoặc khi có tiêu điểm.
- Dưới 760px: không phải mục tiêu, nhưng trang không được vỡ bố cục hoặc cuộn ngang ở vùng nội dung.

## 7. Từng màn hình

### 7.1. Landing

Theo hướng C trong `1-landing.html`. Bên trái: tiêu đề "Nuôi Robo bằng Python." (chữ "Python" tô nền vàng), 1 đoạn giới thiệu, 3 nút dọc rộng 330px: "Bắt đầu học" (nút chính, mũi tên), "Hướng dẫn" (nút phụ, chữ phụ "cho con và bố mẹ"), "Khu phụ huynh" (nút xanh, chữ phụ "cần mã PIN"). Bên phải: Robo đứng trong khối màu `--mint` có bóng 6px, bong bóng "Chào bạn! Mình là Robo.", và 1 cửa sổ code nhỏ `robo.py` nghiêng nhẹ, có 2 dòng code và 1 dòng kết quả. Robo vẽ bằng `Robot` hiện có. Mọi chữ có bản Việt và Anh.

### 7.2. Chào hỏi

Đổi hành vi: thay 1 form bằng 4 bước, mỗi bước 1 câu hỏi (`3-other-screens.html`, mục 6).

1. Ngôn ngữ (Tiếng Việt, English). Chọn xong thì giao diện đổi ngay.
2. Tên của con.
3. Tên robot.
4. Mã PIN của bố mẹ và nhập lại mã PIN.

Bên trái: nền `--mint`, Robo dạng 1 và 1 câu Robo nói cho mỗi bước. Bên phải: 4 ô bước, "Bước n/4", câu hỏi, ô nhập lớn, dòng giải thích, nút "Quay lại" và "Tiếp" (bước 4 là "Bắt đầu"). Phím Enter bằng "Tiếp". Kiểm tra và thông báo lỗi giữ như hiện tại (`onboarding.error*`), lỗi hiện ở bước có lỗi. Cách lưu hồ sơ giữ nguyên.

### 7.3. Phòng robot

Theo phương án B trong `2-room.html`.

- Hàng tiêu đề: "Phòng của {tên robot}", lời chào "Chào {tên con}!", chip chuỗi ngày và chip xu ở góc phải.
- Cột trái: cảnh phòng trong khung viền 2px, bóng 6px; lời Robo (thông điệp `pet.*`) là bong bóng trong cảnh. Dưới cảnh là các nhãn "Đang đeo" và "Trong phòng".
- Cột phải rộng 320px đến 360px, từ trên xuống:
  1. Thẻ "Học tiếp" (nút chính cỡ lớn): nhãn "BÀI TIẾP THEO", chữ "Học tiếp", và tên bước tiếp theo kèm tên giai đoạn. Đổi hành vi: hiện tại nút không ghi tên bài. Tên lấy từ bước của `nextStep` (`src/game/path.ts`): tên bài học, hoặc "Trạm ôn", "Kiểm tra chủ đề: {chủ đề}", "Kiểm tra tiến hóa", "Bài luyện bố mẹ giao", "Ôn tập trọng tâm". Khi học hết bài: thẻ hiện `room.allDone` thay cho nút.
  2. Nút "Ôn tập" (nút xanh) có chữ phụ "5 câu, sạc Pin cho Robo"; chỉ hiện khi đã có bài học xong, như hiện tại.
  3. Thẻ "Robo hôm nay": 3 thanh Pin, Vui, Lớn lên.
  4. Thẻ "Mục tiêu": hôm nay (ô vuông theo điểm), tuần này (ô vuông theo số bài) hoặc "Tuần này là tuần nghỉ", thẻ giữ chuỗi.
- Hết pin và đã có bài xong: thẻ chính đổi thành "Sạc cho {tên robot}" và mở trạm ôn như hiện tại; "Học tiếp" thành nút phụ ngay dưới.
- Banner sao lưu và các banner khác nằm ở đầu vùng nội dung (mục 8).

### 7.4. Bản đồ học

Theo `3-other-screens.html`, mục 1.

- Tiêu đề "Bản đồ học" và chú giải 5 trạng thái ở bên phải.
- Hàng tab giai đoạn (tablist); mặc định mở giai đoạn hiện tại; giai đoạn đã qua có dấu tích.
- Mỗi chủ đề là 1 hàng: bên trái là "CHỦ ĐỀ n", tên chủ đề, số bài đã xong và điểm kiểm tra chủ đề nếu có; bên phải là 1 đường thẳng nối các ô theo thứ tự của lộ trình.
- Hình của ô theo loại bước: bài học (ô vuông có số thứ tự), trạm ôn (hình thoi), kiểm tra chủ đề (ô rộng có chữ "KT"). Màu của ô theo trạng thái: đã xong (nền `--mint`, dấu tích), tiếp theo (nền `--primary`, vòng viền ngoài, nhãn "Tiếp theo" phía trên), mở được nhưng chưa làm (nền theo loại: trắng cho bài học, vàng cho trạm ôn, `--pink` cho kiểm tra), chưa mở (kẻ sọc xám, ổ khóa). Trạng thái "tiếp theo" áp dụng cho mọi loại bước. Trạng thái không chỉ thể hiện bằng màu: mỗi trạng thái có biểu tượng hoặc chữ riêng.
- Ô mở được là link; ô chưa mở có `aria-disabled`. Tên truy cập của mỗi ô gồm tên bước và trạng thái. Tên bước hiện thành chú thích khi rê chuột hoặc có tiêu điểm.
- Chủ đề chưa mở hiện mờ.
- Cuối tab là thẻ viền nét đứt "Kiểm tra tiến hóa · Giai đoạn n" với điều kiện mở và kết quả khi đạt.

### 7.5. Bài học và các màn hình làm bài (khung tập trung)

Bài code theo `3-other-screens.html`, mục 2.

- Thanh trên: "Về phòng", tên chủ đề, "Bài n · {tên bài}", ô bước của bài, chip Pin, chip xu.
- Bài code chia đôi (khoảng 45:55). Trái: thẻ đề gồm nhãn "BÀI TẬP CODE", tên bài, đề, bảng 2 cột "Dữ liệu nhập" và "Kết quả mong đợi", nút "Gợi ý n/3", nút "Xem lời giải" (tắt cho tới khi được phép, như hiện tại); Robo nhỏ ở góc dưới trái và bong bóng giải thích lỗi (`RobotBubble`). Phải: trình soạn code, ô "Dữ liệu nhập", vùng "Kết quả" của "Chạy thử" (`OutputPanel`, giữ tên vùng hiện tại), vùng "Kết quả test · n/m đúng", nút "Chạy thử" và "Nộp bài". Mỗi test là 1 dòng có ô màu và chữ trạng thái hiện có (Đúng, Sai, Quá thời gian, Lỗi). Phần so sánh của spec chính 4.2 giữ nguyên: "Mong đợi" cạnh "Code của con in ra", tô dòng đầu tiên khác nhau; phần này mở ngay dưới dòng test sai đầu tiên. Không thêm logic chấm bài hay dữ liệu mới: dòng "Hết số in 2 lần" trong mockup chỉ để minh họa.
- Trình soạn code (CodeMirror) dùng 1 theme sáng mới: nền `--code-bg`, viền 2px, tab tên file `main.py` nền vàng, cột số dòng màu nhạt, màu cú pháp đạt AA trên nền sáng. Dòng lỗi (`cm-error-line`) có nền đỏ nhạt và viền trái `--coral`.
- Thẻ lý thuyết: 1 thẻ giữa màn hình, rộng tối đa 760px. Khối code ví dụ và vùng kết quả dùng nền sáng `--code-bg` và chữ JetBrains Mono, thay cho nền tối hiện tại.
- Sắp xếp dòng code: mỗi dòng là 1 khối viền 2px, bóng 3px; khối đang kéo hoặc đang chọn nền vàng.
- Điền chỗ trống: ô điền vuông, viền 2px, trong khối code sáng.
- Trắc nghiệm và đoán kết quả: mỗi lựa chọn là 1 khối rộng hết thẻ; đang chọn nền vàng; đúng nền `--mint`; sai nền đỏ nhạt; mỗi trạng thái có thêm biểu tượng.
- Trạm ôn, ôn tập, bài luyện, ôn tập trọng tâm, bài luyện do bố mẹ giao: thẻ câu hỏi giữa màn hình, có nút VI/EN dạng tab vuông như spec chính 8.2 mục 4.
- Kiểm tra chủ đề và kiểm tra tiến hóa: như trên, thêm số câu "Câu n/m" trên thanh trên; kết quả chỉ hiện ở cuối, như hiện tại.

### 7.6. Màn hình kết quả và hoạt cảnh tiến hóa

- Kết quả: 1 thẻ giữa màn hình; hàng chip lớn "+n XP" (`--primary`), "+n xu" (`--chip-xu`), "Pin +n", "Vui +n"; ô vuông mục tiêu ngày; chuỗi ngày; nút chính "Học tiếp" và nút phụ "Về phòng" (giữ thứ tự ưu tiên như `ResultView.tsx` hiện tại). Khi chưa đạt kiểm tra tiến hóa: lời động viên, danh sách khái niệm cần ôn dạng thẻ nhỏ, nút chính "Bắt đầu ôn tập trọng tâm".
- Hoạt cảnh tiến hóa: giữ hoạt cảnh của `EvolutionShow`; chỉ đổi nền, chữ và nút theo hệ thống mới.

### 7.7. Cửa hàng

Theo `3-other-screens.html`, mục 3. Tiêu đề và chip "Con có n xu". 2 tab: "Đồ cho {tên robot}" và "Phần thưởng từ bố mẹ". Tab 1 chia 3 nhóm (Pin và Vui, Phụ kiện, Trang trí phòng), mỗi nhóm là lưới thẻ vuông 5 cột: ô hình (nền màu nhạt theo nhóm), tên, tác dụng hoặc vị trí đeo, giá có biểu tượng xu, 1 nút (Mua, Dùng, Đeo, Tháo). Món đang đeo có viền ngoài `--primary` và nhãn "Đang đeo". Món không mua được hiện lý do trên nút tắt (ví dụ "Chưa đủ xu", "Pin đã đầy", các khóa `shop.*` hiện có). Ô hình dùng hình phụ kiện và đồ trang trí hiện có (`AccessoryArt`, `DecorArt`) thay cho biểu tượng tạm trong mockup. Tab 2 là danh sách thẻ phần thưởng với giá, giới hạn mỗi tuần và nút đổi, như hiện tại.

### 7.8. Sổ thành tích

Theo `3-other-screens.html`, mục 4. Hàng 4 dạng Robo (dạng hiện tại có viền `--primary`; dạng chưa đạt mờ trên nền kẻ sọc); lưới 17 huy hiệu ô vuông (chưa có thì xám, có thì hiện ngày nhận khi rê chuột hoặc có tiêu điểm); 2 thẻ số "khái niệm đã vững" và "khái niệm đang luyện". Không hiện điểm yếu chi tiết (spec chính 8.2 mục 7).

### 7.9. Sao lưu

Khung có thanh bên. 2 thẻ cạnh nhau: "Xuất file sao lưu" (ngày sao lưu gần nhất, nút chính) và "Nhập file sao lưu" (bước PIN, chọn file, xem trước hồ sơ, xác nhận). Bên dưới là bảng bản sao lưu tự động: viền 2px, mỗi dòng có nút "Tải về". Thông báo của `backup.*` giữ nguyên.

### 7.10. Khu phụ huynh

- Màn hình PIN: thẻ giữa vùng nội dung với ô PIN, nút "Mở", link "Quên mã PIN?". Luồng đặt lại PIN giữ nguyên.
- Sau khi mở: thanh bên chế độ phụ huynh (mục 6.2). 5 tab hiện tại thành 5 mục của thanh bên; nội dung từng tab giữ như hiện tại, chỉ trình bày lại theo hệ thống.
- Tổng quan theo `3-other-screens.html`, mục 5: các thẻ cảnh báo (vàng cho yêu cầu đổi thưởng và nhắc sao lưu, đỏ nhạt cho khái niệm cần hỗ trợ), mỗi thẻ có nút "Xem" chuyển tới mục tương ứng; biểu đồ cột số phút học 7 ngày (cột vuông `--primary`, ngày nghỉ kẻ sọc xám); 4 thẻ số: giai đoạn, kế hoạch tuần, chuỗi ngày, xu.
- Con cần hỗ trợ, Tiến độ, Phần thưởng, Cài đặt: dùng thẻ, bảng viền 2px, ô nhập vuông và nút theo mục 5.5. Không có mockup riêng; người làm áp dụng hệ thống.

### 7.11. Trang Hướng dẫn

`public/huong-dan.html` vẫn là trang tĩnh tiếng Việt. Nội dung giữ nguyên, trừ các câu tả cách đi lại trong app mà bản mới làm sai: chỗ hiện trạng thái "Robo sẵn sàng", các bước "Bắt đầu lần đầu" (thêm Landing, Chào hỏi 4 bước), cách vào Khu phụ huynh và bảng các tab trong mục "Dành cho bố mẹ" (thành các mục của thanh bên). Người làm sửa các câu này cho đúng với app và ghi danh sách câu đã sửa vào `docs/superpowers/STATUS.md` để phụ huynh duyệt lời văn. Trình bày lại theo hệ thống: dùng chung font trong `public/fonts/` và cùng giá trị màu (chép vào CSS nội tuyến của trang, vì trang không đi qua Vite). Thêm thanh trên có logo và nút "Mở app" (link `./`). Mục lục các phần dạng thẻ.

## 8. Banner và màn hình lỗi

- Banner (nhắc sao lưu, IndexedDB bị chặn, ghi dữ liệu thất bại) theo thành phần Banner ở mục 5.5, nằm ở đầu vùng nội dung của mọi khung.
- `RunnerFailedPanel` ("Robo chưa khởi động được") thành banner đỏ nhạt có nút "Thử lại"; tiêu đề giữ đúng chữ của spec.
- Trình duyệt không hỗ trợ, mở app ở 2 tab, lỗi giao diện bất ngờ: 1 thẻ giữa trang nền kem, Robo dạng 1 ở trạng thái hết pin, tiêu đề, giải thích, các nút như hiện tại.
- Trang `#/gallery` (chỉ có ở bản dev): dùng nền và chữ mới; không cần thanh bên.

## 9. Robo và cảnh phòng

Hình Robo, phụ kiện, đồ trang trí, cửa sổ, ổ sạc và bãi biển (`src/ui/robot/`) giữ nguyên, kể cả các nét bo tròn của nhân vật. Quy tắc "không bo tròn" áp dụng cho giao diện, không áp dụng cho nhân vật. Cảnh phòng chỉ đổi khung (viền 2px, bóng 6px, góc vuông) và có thể chỉnh màu tường và sàn cho hợp bảng màu mới. Các trạng thái của spec chính mục 8.3 giữ nguyên.

## 10. Trợ năng

- Mọi cặp chữ và nền đạt WCAG AA (mục 5.1).
- Viền tiêu điểm rõ trên mọi thành phần tương tác (mục 5.3).
- `<nav>` có nhãn cho thanh bên và thanh trên của landing; `aria-current="page"` cho mục đang ở.
- Tab giai đoạn, tab Cửa hàng và nút VI/EN theo mẫu ARIA tương ứng.
- Trạng thái không chỉ thể hiện bằng màu (bản đồ, kết quả test, lựa chọn trắc nghiệm).
- Giảm chuyển động: tắt hiệu ứng dịch nút và mọi chuyển tiếp mới, như các hoạt cảnh hiện có.

## 11. Kiểm thử

- Sửa test đơn vị và e2e hiện có khi cấu trúc hoặc chữ thay đổi; ưu tiên tìm phần tử theo vai trò và tên truy cập.
- Test mới tối thiểu:
  1. Route: `#/` chưa có hồ sơ hiện Landing; có hồ sơ hiện Phòng robot; `#/welcome` luôn hiện Landing; "Bắt đầu học" mở Chào hỏi khi chưa có hồ sơ.
  2. Landing chưa có hồ sơ: "Khu phụ huynh" hiện thẻ giải thích.
  3. Thanh bên có `aria-current` đúng theo từng route; các route của `STUDY_ROUTES` không có thanh bên.
  4. Chào hỏi 4 bước: chuyển bước, quay lại, báo lỗi đúng bước, lưu hồ sơ.
  5. Thẻ "Học tiếp" hiện đúng tên bước tiếp theo cho bài học, trạm ôn, kiểm tra chủ đề, kiểm tra tiến hóa, và hiện `room.allDone` khi hết bài.
  6. Thanh bên chế độ phụ huynh: số đếm, "Khóa và quay lại" khóa khu và về phòng.
  7. Font tải được dưới đường dẫn con `/py-pet/` (mở rộng `e2e/subpath.spec.ts`).
- `npm run check` xanh sau mỗi mốc.

## 12. Gợi ý chia mốc

1. **R1 Nền tảng:** biến màu, font, biểu tượng, thành phần, 3 khung trang, thanh bên (cả chế độ phụ huynh), route mới, Landing, Chào hỏi, Phòng robot, banner.
2. **R2 Học:** Bản đồ học, thẻ lý thuyết, mọi dạng bài, theme CodeMirror sáng, trạm ôn, ôn tập, bài luyện, kiểm tra, kết quả, hoạt cảnh tiến hóa.
3. **R3 Còn lại:** Cửa hàng, Sổ thành tích, Sao lưu, nội dung 5 tab khu phụ huynh, trang Hướng dẫn, màn hình lỗi, trang gallery, dọn CSS cũ.

Mỗi mốc đi theo quy trình trong `CLAUDE.md` (kế hoạch, subagent-driven, thử bằng mắt, merge).

## 13. Quyết định do Claude chốt, cần người bảo trì xem lại

1. Màu chính `#2f5bea` thay cho `#3d6bff` của mockup, để đạt AA.
2. Font Lexend và JetBrains Mono, tự chứa trong `public/fonts/`.
3. Robo, phụ kiện và cảnh phòng giữ nét bo tròn; chỉ giao diện bỏ bo tròn.
4. Trình soạn code và khối code chuyển sang nền sáng.
5. Các màn hình làm bài dùng khung tập trung, không có thanh bên.
6. Landing chỉ hiện ở `#/` khi chưa có hồ sơ; luôn mở được ở `#/welcome` qua logo; "Khu phụ huynh" khi chưa có hồ sơ hiện thẻ giải thích.
7. Chào hỏi chia 4 bước.
8. Thẻ "Học tiếp" hiện tên bước tiếp theo.
9. Chip chuỗi ngày và xu ở góc phải hàng tiêu đề; thẻ giữ chuỗi nằm trong thẻ Mục tiêu.
10. Thanh bên chế độ phụ huynh màu xanh bạc hà, có số đếm và nút "Khóa và quay lại".
11. Trang Hướng dẫn vẫn là trang tĩnh tiếng Việt, chỉ trình bày lại.
12. Thanh bên thu còn biểu tượng từ 760px đến dưới 1100px.
13. Ô bản đồ hiện số thứ tự; tên bước ở chú thích và tên truy cập.
14. Chia 3 mốc R1, R2, R3.
15. Màu báo lỗi đổi sang `#b42318` để đạt AA trên nền kem.
16. Kết quả test giữ chữ trạng thái và phần so sánh của spec chính 4.2; không thêm "lý do sai" mới.
17. Màn hình kết quả giữ "Học tiếp" là nút chính.
18. Trang Hướng dẫn được sửa các câu tả cách đi lại trong app; phụ huynh duyệt lại các câu đó.
19. Trên bản đồ, trạng thái "tiếp theo" áp dụng cho mọi loại bước, hình ô theo loại bước.

## 14. Để người làm quyết định

- Cách tổ chức CSS (giữ 1 file `src/styles.css` hay tách theo vùng), miễn là dùng chung biến màu.
- Cấu trúc component cho khung trang, thanh bên và bộ biểu tượng.
- Các mục của khu phụ huynh có thành route riêng hay vẫn là trạng thái trong `ParentScreen`, miễn là thanh bên chế độ phụ huynh làm đúng mục 6.2 và hành vi tự khóa giữ nguyên.
- Khoảng cách và cỡ chi tiết không ghi trong tài liệu này; lấy mockup làm mốc.
- Màu tường và sàn của cảnh phòng, miễn hợp bảng màu và giữ phân biệt ngày và đêm.
