# Trạng thái dự án Py-Pet

Cập nhật lần cuối: 2026-10-28.

## Các mốc

| Mốc | Nội dung (spec 12.3) | Trạng thái |
|---|---|---|
| M1 | Lát cắt dọc: bài học, chạy Python bằng Pyodide, chấm bài, từ điển lỗi | Xong, đã merge vào `main` |
| M2 | Vòng chơi pet: IndexedDB, XP/xu, Pin/Vui, chuỗi ngày, Phòng robot, Bản đồ học, màn hình kết quả, sao lưu/nhập file `.pypet`, màn hình chào hỏi | Xong, đã merge vào `main` và push (commit `0e188b4`) |
| M3a | Điểm thành thạo, bậc thang, cờ "Cần hỗ trợ", hộp Leitner, trạm ôn, sạc Pin bằng ôn tập, bài `parsons` và `fill`, thẻ "Hiểu lầm thường gặp" và bài luyện, GameState version 2 | Xong, đã merge vào `main` và push (2026-10-06). Người bảo trì chưa thử bằng mắt |
| M3b | Kiểm tra chủ đề, kiểm tra tiến hóa (đạt 80%), bộ ôn tập trọng tâm, tiến hóa robot, ưu tiên "Học tiếp", GameState version 3 | Xong, đã merge vào `main` và push (2026-10-06). Người bảo trì chưa thử bằng mắt |
| M4a | Cửa hàng (Pin, Vui, phụ kiện, đồ trang trí, quà chuỗi ngày), luật phần thưởng thật, chế độ nghỉ, thời gian học, huy hiệu và Sổ thành tích, bài luyện phụ huynh giao, GameState version 4 | Xong, đã merge vào `main` và push (2026-10-06). Người bảo trì chưa thử bằng mắt |
| M4b | Khu phụ huynh (PIN, tổng quan, con cần hỗ trợ, tiến độ, duyệt thưởng, cài đặt), đặt lại PIN, các cài đặt (*) có tác dụng, việc chuyển từ M3a | Xong, đã merge vào `main` và push (2026-10-06). Người bảo trì chưa thử bằng mắt |
| M5a | Nội dung giai đoạn 1 (4 chủ đề, 19 bài, kể cả bài "AI là gì?"), điểm kiểm tra trong `[0, max]`, xáo thứ tự lựa chọn theo câu hỏi | Xong, đã merge vào `main` và push (2026-10-07). Phụ huynh chưa duyệt lời văn (`docs/superpowers/content-stage-1.md`) |
| M5b | Nội dung giai đoạn 2 "Dữ liệu" (5 chủ đề, 25 bài), nhận ra lỗi dùng biến trước khi gán, không ghi hiểu lầm của giai đoạn chưa tới | Xong, đã merge vào `main` và push (2026-10-07). Phụ huynh chưa duyệt lời văn (`docs/superpowers/content-stage-2.md`) |
| M5c | Nội dung giai đoạn 3 "Rẽ nhánh" (5 chủ đề, 22 bài), nhận ra dấu `=` trong điều kiện | Xong, đã merge vào `main` và push (2026-10-07). Phụ huynh chưa duyệt lời văn (`docs/superpowers/content-stage-3.md`) |
| M5d | Nội dung giai đoạn 4 "Vòng lặp" (5 chủ đề, 28 bài), luật 8 và 9 của spec 3.9 thành lỗi khi build nội dung, nhận ra `+=` khi biến chưa được gán | Xong, đã merge vào `main` và push (2026-10-07). Phụ huynh chưa duyệt lời văn (`docs/superpowers/content-stage-4.md`) |
| M6a | Hình robot 4 dạng × 3 cỡ × 5 trạng thái, 10 phụ kiện trên người Robo, cảnh phòng (đồ trang trí, buồn ngủ, hết pin cạnh ổ sạc, bãi biển), thanh Pin/Vui/Lớn lên, hoạt cảnh tiến hóa toàn màn hình, Sổ thành tích có hình, trang `#/gallery` ở bản dev | Xong, đã merge vào `main` và push (2026-10-07). Người bảo trì chưa thử bằng mắt (mở `#/gallery` khi chạy `npm run dev`) |
| M6b | CI/CD (GitHub Actions chạy `npm run check`, deploy GitHub Pages khi push vào `main`), ESLint, trình duyệt không hỗ trợ, Pyodide khởi động lỗi hoặc treo (120 giây) có nút Thử lại, bài lỗi lúc chạy bỏ qua được và không tính điểm, bài luyện mở theo khái niệm đã học, khu phụ huynh hiện tên bài và hiểu lầm hay gặp, mục lỗi số thực, danh sách kiểm tra thủ công | Xong, đã merge vào `main` và push (2026-10-07). Người bảo trì cần bật GitHub Pages (README mục "CI và deploy") |
| R1 | Thiết kế lại giao diện, nền tảng: màu, font tự chứa, biểu tượng, thành phần vuông, 3 khung trang, thanh bên (cả chế độ phụ huynh), Landing, Chào hỏi 4 bước, Phòng robot | Xong trên nhánh `feat/ui-revamp`, merge vào `main` cùng R3 (2026-10-28), chưa push |
| R2 | Thiết kế lại giao diện, màn hình học: Bản đồ học, thẻ lý thuyết, mọi dạng bài, theme CodeMirror sáng, trạm ôn, ôn tập, bài luyện, kiểm tra, kết quả, hoạt cảnh tiến hóa | Xong trên nhánh `feat/ui-revamp`, merge vào `main` cùng R3 (2026-10-28), chưa push |
| R3 | Thiết kế lại giao diện, màn hình còn lại: Cửa hàng, Sổ thành tích, Sao lưu, màn hình PIN và 5 mục khu phụ huynh, màn hình lỗi, gallery, trang Hướng dẫn | Xong, người bảo trì đã thử bằng mắt và merge vào `main` (2026-10-28), chưa push |
| R4 | Dọn CSS sau R1 đến R3: `src/styles.css` chỉ còn `@import`, màu chỉ lấy từ token, thành phần dùng chung vào `base.css`, lớp trang có tiền tố, 1 hook phím tab dùng chung (`useRovingTabs`), Esc ẩn chú thích nổi (WCAG 1.4.13), các sửa nhỏ còn hoãn từ R1 đến R3, e2e cho Esc và cửa sổ thấp | Xong trên nhánh `feat/r4-don-css`. Review cuối cả phần sẽ push (R1 đến R4, 3 reviewer) và 1 đợt sửa đã xong (2026-10-28); chưa merge, chưa push |

Tài liệu:

- Spec (bắt buộc tuân theo): `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch đã chạy: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`, `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`, `docs/superpowers/plans/2026-10-06-m3a-on-tap-thanh-thao.md`, `docs/superpowers/plans/2026-10-06-m3b-kiem-tra-tien-hoa.md`, `docs/superpowers/plans/2026-10-06-m4a-cua-hang-nghi.md`, `docs/superpowers/plans/2026-10-06-m4b-khu-phu-huynh.md`, `docs/superpowers/plans/2026-10-06-m5a-noi-dung-giai-doan-1.md`, `docs/superpowers/plans/2026-10-07-m5b-noi-dung-giai-doan-2.md`, `docs/superpowers/plans/2026-10-07-m5c-noi-dung-giai-doan-3.md`, `docs/superpowers/plans/2026-10-07-m5d-noi-dung-giai-doan-4.md`, `docs/superpowers/plans/2026-10-07-m6a-hinh-robot.md`, `docs/superpowers/plans/2026-10-07-m6b-ci-loi.md`
- Thiết kế lại giao diện: tài liệu thiết kế `docs/superpowers/specs/2026-10-27-ui-revamp-design.md` (mockup trong `docs/superpowers/specs/ui-revamp-mockups/`); kế hoạch `docs/superpowers/plans/2026-10-27-r1-nen-tang-giao-dien.md`, `docs/superpowers/plans/2026-10-27-r2-man-hinh-hoc.md`, `docs/superpowers/plans/2026-10-27-r3-man-hinh-con-lai.md`, `docs/superpowers/plans/2026-10-28-r4-don-css.md`; ledger `docs/superpowers/ledgers/r1-sdd-ledger.md`, `docs/superpowers/ledgers/r2-sdd-ledger.md`, `docs/superpowers/ledgers/r3-sdd-ledger.md`, `docs/superpowers/ledgers/r4-sdd-ledger.md` (gồm review cuối trước khi push và các finding đã hoãn)
- Sổ ghi (ledger) của từng mốc, gồm mọi phán quyết và finding nhỏ đã hoãn: `docs/superpowers/ledgers/m1-sdd-ledger.md`, `docs/superpowers/ledgers/m2-sdd-ledger.md`, `docs/superpowers/ledgers/m3a-sdd-ledger.md`, `docs/superpowers/ledgers/m3b-sdd-ledger.md`, `docs/superpowers/ledgers/m4a-sdd-ledger.md`, `docs/superpowers/ledgers/m4b-sdd-ledger.md`, `docs/superpowers/ledgers/m5a-sdd-ledger.md`, `docs/superpowers/ledgers/m5b-sdd-ledger.md`, `docs/superpowers/ledgers/m5c-sdd-ledger.md`, `docs/superpowers/ledgers/m5d-sdd-ledger.md`, `docs/superpowers/ledgers/m6a-sdd-ledger.md`, `docs/superpowers/ledgers/m6b-sdd-ledger.md`
- Quyết định Claude tự chốt khi chạy liên tục các mốc, cần người bảo trì xem lại: `docs/superpowers/DECISIONS.md`

## Quyết định của người bảo trì ở M3a

- M3 chia làm M3a và M3b. Test và e2e dùng bộ nội dung mẫu; luật 8 của spec 3.9 chỉ cảnh báo tới M5 (từ M5d là lỗi).
- Vui chỉ tăng khi con trả lời đúng (3 câu đúng liên tiếp, kể cả trong trạm ôn); lượt sạc không tự cộng Vui.
- Ôn tập tự do không giới hạn mỗi ngày (mỗi lượt có XP, Pin +2, 1 điểm hoạt động, không có xu).

## Quyết định của người bảo trì ở M3b

- Kiểm tra chủ đề gồm 8 câu và 2 bài code. Đề tiến hóa rút theo số câu đang có (luật 9 chỉ cảnh báo tới M5; từ M5d là lỗi). Khi tiến hóa chỉ cần màn hình chúc mừng đơn giản.
- Ngày 2026-10-06 người bảo trì yêu cầu chạy liên tục: implement M3b, push, rồi lần lượt plan và implement M4, M5, M6, merge vào `main` theo từng mốc, ghi các quyết định cần xem lại vào `docs/superpowers/DECISIONS.md`.

## Bản đầu đã đủ các mốc M1 đến M6. Việc tiếp theo

- Người bảo trì: thử app bằng mắt (`npm run dev`, trang `#/gallery` ở bản dev), duyệt lời văn nội dung (`docs/superpowers/content-stage-1.md` đến `-4.md`), xem lại `docs/superpowers/DECISIONS.md`, bật GitHub Pages, rồi cho học sinh dùng thử theo `docs/manual-test-checklist.md` (spec 11.6).

## Thiết kế lại giao diện (R1 đến R3) đã xong. Việc tiếp theo

1. (Đã xong ở R4 trên nhánh `feat/r4-don-css`, chưa merge; kế hoạch `docs/superpowers/plans/2026-10-28-r4-don-css.md`.) Dọn CSS chung: các quy tắc cũ còn lại trong `src/styles.css`; 1 hook tab dùng chung cho Cửa hàng, khu phụ huynh và Bản đồ học (Bản đồ chưa bỏ qua Alt, Ctrl, Cmd khi bấm mũi tên); chú thích nổi của huy hiệu và ô bản đồ đóng được bằng Esc (WCAG 1.4.13); chuyển các quy tắc dùng chung (`.table`, `.table-scroll`, `.tag`, `.link-button`, `button.danger`, ô chọn file) vào `src/styles/base.css` và thêm tiền tố cho các lớp trang (`.form`, `.forms`, `.badge`, `.big`, `.page`). Danh sách đủ ở cuối `docs/superpowers/ledgers/r3-sdd-ledger.md` và các dòng `minor (deferred)` của ledger R1, R2, R3.
2. Phụ huynh duyệt lời văn các câu đã sửa trong trang Hướng dẫn (mục "Trang Hướng dẫn: câu đã sửa ở mốc R3" bên dưới).
3. Người bảo trì xem lại các quyết định Claude tự chốt: mục 13 của tài liệu thiết kế và mục "Quyết định thiết kế" của 3 kế hoạch R1, R2, R3.
4. Push `main` khi người bảo trì yêu cầu (push vào `main` sẽ deploy GitHub Pages).

## Việc tồn đọng cho bản sau

1. (Đã xong ở M6a) Robo không còn nhỏ lại sau khi tiến hóa: cỡ theo dạng tiến hóa và tăng đơn điệu.
2. Khi xuất file mà đọc kho lỗi, file chỉ chứa hồ sơ đang dùng. Xử lý khi có giao diện nhiều hồ sơ.
3. App chạy Python 3.14 (Pyodide), còn `content:validate` chạy CPython 3.13: thông báo lỗi có thể khác. Test `src/content/parity.pyodide.test.ts` chạy mọi mục nội dung và mẫu từ điển lỗi trong Pyodide; khi soạn nội dung về lỗi, kiểm thông báo trong Pyodide.
4. E2E luồng "thi tiến hóa chưa đạt → ôn trọng tâm → thi lại đạt" (spec 11 mục 5) đang được kiểm tra bằng test tích hợp jsdom; đi hết 19 bài của giai đoạn 1 trong Playwright quá chậm cho `npm run check` (DECISIONS M5a mục 6).
5. Khu phụ huynh: đã có hiểu lầm hay gặp và tên bài (M6b). Còn thiếu đầu ra so với đầu ra mong đợi (cần lưu thêm dữ liệu, tăng `SCHEMA_VERSION`), thời gian học và ngôn ngữ câu hỏi từng bài.

6. (Đã xong ở M6b) Bài luyện mở khi mọi khái niệm của nó đã gặp trong 1 bài học đã xong.
7. Bài "viết lại bằng while" và các bài yêu cầu `break`, `continue`, `+=` chỉ được chấm theo đầu ra; chưa có kiểu kiểm tra "phải dùng" 1 cú pháp (DECISIONS M5d mục 6).
8. (Đã xong ở M6b) Mục lỗi `float-not-integer` khuyên dùng `//`.
9. Deploy không chờ CI của cùng commit (DECISIONS M6b mục 2); nhật ký `content-error` chưa gộp lỗi trùng; logic `failInit` của worker chỉ có e2e kiểm tra.

Các finding nhỏ khác đã hoãn nằm trong các file ledger (tìm dòng `minor (deferred)` và `parked`).

## Trang Hướng dẫn: câu đã sửa ở mốc R3 (chờ phụ huynh duyệt lời văn)

`public/huong-dan.html` được trình bày lại theo kiểu mới (thanh trên có nút "Mở app", mục lục dạng thẻ). Nội dung giữ nguyên, trừ các câu tả cách đi lại trong app mà bản mới làm sai. Mỗi dòng dưới đây ghi tên phần, câu cũ và câu mới (1 câu mới được thêm không có câu cũ). Phụ huynh xem lại lời văn của các câu này.

1. Chuẩn bị, mục 3: "Khi đầu trang hiện Robo sẵn sàng là con bắt đầu được." → "Khi dòng Robo sẵn sàng hiện ở đáy menu bên trái (hoặc ở thanh trên khi con làm bài) là con bắt đầu được."
2. Bắt đầu lần đầu, bước 1: "Mở trang Py-Pet." → "Mở trang Py-Pet. Lần đầu mở, app hiện trang giới thiệu có 3 nút: Bắt đầu học, Hướng dẫn và Khu phụ huynh. Bấm Bắt đầu học."
3. Bắt đầu lần đầu, bước 2: "Chọn ngôn ngữ: Tiếng Việt hoặc English." → "App mở phần chào hỏi gồm 4 bước, mỗi bước 1 câu hỏi. Bấm Tiếp để sang bước sau, bấm Quay lại để về bước trước. Bước 1: chọn ngôn ngữ, Tiếng Việt hoặc English."
4. Bắt đầu lần đầu, bước 3: "Nhập tên của con và đặt tên cho robot." → "Bước 2: nhập tên của con. Bước 3: đặt tên cho robot (tên có sẵn là Robo)."
5. Bắt đầu lần đầu, bước 4: "Bố mẹ đặt mã PIN gồm 4 đến 6 chữ số. Mã PIN dùng để vào Khu phụ huynh, duyệt phần thưởng và nhập file sao lưu." → "Bước 4: bố mẹ đặt mã PIN gồm 4 đến 6 chữ số và nhập lại lần nữa. Mã PIN dùng để vào Khu phụ huynh, duyệt phần thưởng và nhập file sao lưu."
6. Một buổi học, đoạn mới đầu phần (không có câu cũ): "Ở Phòng của Robo và các trang khác của con, menu bên trái có các mục Phòng Robo, Bản đồ học, Cửa hàng, Sổ thành tích, Sao lưu và Hướng dẫn. Khi con làm bài, menu này ẩn đi để con tập trung. Thanh trên lúc đó có nút Về phòng, tên bài đang làm, các ô bước, trạng thái của Python, Pin và xu."
7. Dành cho bố mẹ, đoạn đầu: "Vào Khu phụ huynh từ Phòng của Robo bằng mã PIN. Khu này tự khóa sau 5 phút không thao tác." → "Bấm nút Khu phụ huynh ở đáy menu bên trái (hoặc ở trang giới thiệu, khi đã có hồ sơ), rồi nhập mã PIN để vào. Khu này tự khóa sau 5 phút không thao tác. Bấm Khóa và quay lại ở đáy menu để khóa ngay và về Phòng của Robo. Trong khu này, menu bên trái có 5 mục:"
8. Dành cho bố mẹ, tiêu đề cột đầu của bảng: "Tab" → "Mục".
9. Dành cho bố mẹ, câu cuối: "Quên mã PIN thì bấm Quên mã PIN? ở cửa vào." → "Quên mã PIN thì bấm Quên mã PIN? ở màn hình nhập PIN."
10. Dữ liệu và sao lưu, mục 2: "Mỗi tuần, vào Sao lưu và bấm Xuất file sao lưu để lưu file .pypet." → "Mỗi tuần, vào Sao lưu ở menu bên trái và bấm Xuất file sao lưu để lưu file .pypet."
11. Dữ liệu và sao lưu, mục 3 (đổi máy): "Đổi máy hoặc trình duyệt: mở Py-Pet trên máy mới, vào Sao lưu, nhập file .pypet bằng mã PIN." → "Đổi máy hoặc trình duyệt: mở Py-Pet trên máy mới và tạo hồ sơ trước, theo các bước ở phần Bắt đầu lần đầu. Sau đó vào Sao lưu ở menu bên trái và nhập file .pypet bằng mã PIN vừa đặt. Dữ liệu trong file thay dữ liệu hiện tại của máy mới."
12. Chân trang: "Py-Pet bản đầu, cập nhật 2026-10-07." → "Py-Pet bản đầu, cập nhật 2026-10-27."

Hai câu dưới đây được sửa ở mốc R4 (review cuối trước khi push), sau khi các câu trên đã được viết:

13. Chuẩn bị, mục 3 (thêm 1 vế vào câu của mục 1 ở trên, vì thanh bên thu gọn dưới 1100 px chỉ còn ô vuông, không còn dòng chữ): "Khi dòng Robo sẵn sàng hiện ở đáy menu bên trái (hoặc ở thanh trên khi con làm bài) là con bắt đầu được." → "Khi dòng Robo sẵn sàng hiện ở đáy menu bên trái (hoặc ở thanh trên khi con làm bài) là con bắt đầu được (trên cửa sổ hẹp chỉ có 1 ô vuông, ô chuyển xanh khi Robo sẵn sàng)."
14. Dữ liệu và sao lưu, mục 3 (đổi máy; thêm 1 câu, vì sau khi nhập mã PIN đổi theo file, xem `GameProvider.tsx`, `payload.meta.pin ?? existing.pin`): "Dữ liệu trong file thay dữ liệu hiện tại của máy mới." → "Dữ liệu trong file thay dữ liệu hiện tại của máy mới. Sau khi nhập, mã PIN là mã PIN trong file (mã của máy cũ)."

## Môi trường

- Máy phát triển ban đầu dùng Node 24.18, npm 12.2, Python 3.14.2 với `pytest` (trong `.venv`), Chromium của Playwright. `package.json` khai báo `engines.node` là `^22.22.2 || ^24.15.0 || >=26.0.0`, theo yêu cầu của jsdom 30 (bản Node tối thiểu để chạy Vitest).
- npm 12 chặn script cài đặt của esbuild/fsevents và in cảnh báo; cảnh báo này vô hại.
- Cài lần đầu: xem `README.md` mục "Cài đặt lần đầu".
- Phiên cloud (kiểm tra 2026-10-06): Node 22.22.0, npm 10.9.4, Python 3.13. npm in cảnh báo `EBADENGINE` (jsdom 30 cần Node 22.22.2 trở lên) nhưng `npm run check` vẫn xanh. Hook SessionStart tự cài môi trường; e2e dùng Chromium có sẵn qua `PW_CHROMIUM_PATH` (xem `CLAUDE.md`).
- `npm run check` phải xanh trước mọi merge: lint, typecheck, Vitest (1833 test sau R4 và đợt sửa cuối trước khi push; số test tăng theo số mục nội dung), pytest (21), kiểm tra nội dung, Playwright e2e (33, gồm 1 test chạy dưới đường dẫn `/py-pet/`). CI trên GitHub chạy cùng lệnh cho mỗi lần push.
