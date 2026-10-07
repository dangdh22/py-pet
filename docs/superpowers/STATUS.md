# Trạng thái dự án Py-Pet

Cập nhật lần cuối: 2026-10-07.

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
| M6b | CI/CD (GitHub Actions, GitHub Pages), lint, phần còn thiếu của spec 10, bài luyện mở theo khái niệm đã học, việc chuyển của khu phụ huynh | **Việc tiếp theo** |

Tài liệu:

- Spec (bắt buộc tuân theo): `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch đã chạy: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`, `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`, `docs/superpowers/plans/2026-10-06-m3a-on-tap-thanh-thao.md`, `docs/superpowers/plans/2026-10-06-m3b-kiem-tra-tien-hoa.md`, `docs/superpowers/plans/2026-10-06-m4a-cua-hang-nghi.md`, `docs/superpowers/plans/2026-10-06-m4b-khu-phu-huynh.md`, `docs/superpowers/plans/2026-10-06-m5a-noi-dung-giai-doan-1.md`, `docs/superpowers/plans/2026-10-07-m5b-noi-dung-giai-doan-2.md`, `docs/superpowers/plans/2026-10-07-m5c-noi-dung-giai-doan-3.md`, `docs/superpowers/plans/2026-10-07-m5d-noi-dung-giai-doan-4.md`, `docs/superpowers/plans/2026-10-07-m6a-hinh-robot.md`
- Sổ ghi (ledger) của từng mốc, gồm mọi phán quyết và finding nhỏ đã hoãn: `docs/superpowers/ledgers/m1-sdd-ledger.md`, `docs/superpowers/ledgers/m2-sdd-ledger.md`, `docs/superpowers/ledgers/m3a-sdd-ledger.md`, `docs/superpowers/ledgers/m3b-sdd-ledger.md`, `docs/superpowers/ledgers/m4a-sdd-ledger.md`, `docs/superpowers/ledgers/m4b-sdd-ledger.md`, `docs/superpowers/ledgers/m5a-sdd-ledger.md`, `docs/superpowers/ledgers/m5b-sdd-ledger.md`, `docs/superpowers/ledgers/m5c-sdd-ledger.md`, `docs/superpowers/ledgers/m5d-sdd-ledger.md`, `docs/superpowers/ledgers/m6a-sdd-ledger.md`
- Quyết định Claude tự chốt khi chạy liên tục các mốc, cần người bảo trì xem lại: `docs/superpowers/DECISIONS.md`

## Quyết định của người bảo trì ở M3a

- M3 chia làm M3a và M3b. Test và e2e dùng bộ nội dung mẫu; luật 8 của spec 3.9 chỉ cảnh báo tới M5 (từ M5d là lỗi).
- Vui chỉ tăng khi con trả lời đúng (3 câu đúng liên tiếp, kể cả trong trạm ôn); lượt sạc không tự cộng Vui.
- Ôn tập tự do không giới hạn mỗi ngày (mỗi lượt có XP, Pin +2, 1 điểm hoạt động, không có xu).

## Quyết định của người bảo trì ở M3b

- Kiểm tra chủ đề gồm 8 câu và 2 bài code. Đề tiến hóa rút theo số câu đang có (luật 9 chỉ cảnh báo tới M5; từ M5d là lỗi). Khi tiến hóa chỉ cần màn hình chúc mừng đơn giản.
- Ngày 2026-10-06 người bảo trì yêu cầu chạy liên tục: implement M3b, push, rồi lần lượt plan và implement M4, M5, M6, merge vào `main` theo từng mốc, ghi các quyết định cần xem lại vào `docs/superpowers/DECISIONS.md`.

## Việc chuyển sang M6b và sau đó

1. (Đã xong ở M6a) Robo không còn nhỏ lại sau khi tiến hóa: cỡ theo dạng tiến hóa và tăng đơn điệu.
2. Khi xuất file mà đọc kho lỗi, file chỉ chứa hồ sơ đang dùng. Xử lý khi có giao diện nhiều hồ sơ.
3. App chạy Python 3.14 (Pyodide), còn `content:validate` chạy CPython 3.13: thông báo lỗi có thể khác. Test `src/content/parity.pyodide.test.ts` chạy mọi mục nội dung và mẫu từ điển lỗi trong Pyodide; khi soạn nội dung về lỗi, kiểm thông báo trong Pyodide.
4. E2E luồng "thi tiến hóa chưa đạt → ôn trọng tâm → thi lại đạt" (spec 11 mục 5) đang được kiểm tra bằng test tích hợp jsdom; đi hết 19 bài của giai đoạn 1 trong Playwright quá chậm cho `npm run check` (DECISIONS M5a mục 6).
5. Khu phụ huynh (M4b), để bản sau: thẻ "Con cần hỗ trợ" chưa hiện nội dung hiểu lầm hay gặp và chưa có đầu ra so với đầu ra mong đợi; tab Tiến độ chưa có thời gian học và ngôn ngữ câu hỏi từng bài, và đang hiện ID bài tập thay cho tên. Xem `DECISIONS.md` mục M4b.

6. Bài luyện của 1 chủ đề mở hết khi con xong 1 bài học bất kỳ của chủ đề (`src/game/reviewSet.ts`), nên nội dung phải giữ bài luyện mức 3 trong danh sách của khái niệm đã dạy kiến thức nó cần (DECISIONS M5d mục 7). Sửa ở app: mở bài luyện theo bài học đã xong.
7. Bài "viết lại bằng while" và các bài yêu cầu `break`, `continue`, `+=` chỉ được chấm theo đầu ra; chưa có kiểu kiểm tra "phải dùng" 1 cú pháp (DECISIONS M5d mục 6).
8. Số thực trong `range(n / 2)` hay `"*" * (n / 2)` chỉ nhận lời giải thích chung `type-other`; có thể thêm mục gợi ý dùng `//`.

Các finding nhỏ khác đã hoãn nằm trong các file ledger (tìm dòng `minor (deferred)` và `parked`).

## Môi trường

- Máy phát triển ban đầu dùng Node 24.18, npm 12.2, Python 3.14.2 với `pytest` (trong `.venv`), Chromium của Playwright. `package.json` khai báo `engines.node` là `^22.22.2 || ^24.15.0 || >=26.0.0`, theo yêu cầu của jsdom 30 (bản Node tối thiểu để chạy Vitest).
- npm 12 chặn script cài đặt của esbuild/fsevents và in cảnh báo; cảnh báo này vô hại.
- Cài lần đầu: xem `README.md` mục "Cài đặt lần đầu".
- Phiên cloud (kiểm tra 2026-10-06): Node 22.22.0, npm 10.9.4, Python 3.13. npm in cảnh báo `EBADENGINE` (jsdom 30 cần Node 22.22.2 trở lên) nhưng `npm run check` vẫn xanh. Hook SessionStart tự cài môi trường; e2e dùng Chromium có sẵn qua `PW_CHROMIUM_PATH` (xem `CLAUDE.md`).
- `npm run check` phải xanh trước mọi merge: typecheck, Vitest (1373 test sau M6a; số test tăng theo số mục nội dung), pytest (21), kiểm tra nội dung, Playwright e2e (15).
