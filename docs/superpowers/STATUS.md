# Trạng thái dự án Py-Pet

Cập nhật lần cuối: 2026-10-06.

## Các mốc

| Mốc | Nội dung (spec 12.3) | Trạng thái |
|---|---|---|
| M1 | Lát cắt dọc: bài học, chạy Python bằng Pyodide, chấm bài, từ điển lỗi | Xong, đã merge vào `main` |
| M2 | Vòng chơi pet: IndexedDB, XP/xu, Pin/Vui, chuỗi ngày, Phòng robot, Bản đồ học, màn hình kết quả, sao lưu/nhập file `.pypet`, màn hình chào hỏi | Xong, đã merge vào `main` và push (commit `0e188b4`) |
| M3 | Trạm ôn, điểm thành thạo, hộp Leitner, kiểm tra chủ đề, kiểm tra tiến hóa (đạt 80%), tiến hóa robot | **Việc tiếp theo** |
| M4 | Khu phụ huynh, cửa hàng, phần thưởng thật, chế độ nghỉ, đặt lại PIN, chỉnh mục tiêu, đo thời gian học | Chưa làm |
| M5 | Thêm nội dung giai đoạn 1 đến 4 | Chưa làm |
| M6 | Hình robot 4 dạng, hoạt cảnh | Chưa làm |

Tài liệu:

- Spec (bắt buộc tuân theo): `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch đã chạy: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`, `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`
- Sổ ghi (ledger) của từng mốc, gồm mọi phán quyết và finding nhỏ đã hoãn: `docs/superpowers/ledgers/m1-sdd-ledger.md`, `docs/superpowers/ledgers/m2-sdd-ledger.md`

## Việc chuyển sang M3

Đưa các việc này vào kế hoạch M3:

1. Kiểm tra `GameState.version` và chạy migration khi mở app. Hiện chỉ file sao lưu có migration; dữ liệu trong IndexedDB được đọc thẳng.
2. Kiểm tra sâu nội dung file sao lưu khi nhập (ví dụ bằng schema zod). Hiện `decodeBackup` chỉ kiểm tra lớp vỏ; một `state` hỏng vẫn nhập được, sau đó app hiện màn hình lỗi.
3. Lời nhắn của robot khi Pin cạn mà đã học hết bài. Hiện robot vẫn nói "học 1 bài để sạc"; trạm ôn ở M3 nên cho phép sạc lại Pin.
4. Cập nhật Phòng robot lúc nửa đêm khi app vẫn mở (hiện chỉ cập nhật ở sự kiện tiếp theo; phần thưởng vẫn tính đúng).
5. Khôi phục các khẳng định test bị bỏ trong M2: điều kiện chuyển bước trong `LessonScreen.test.tsx` (nút "Quay lại" bị khóa ở thẻ đầu, "Thẻ 2/2", "Bài tập n/2", "Hoàn thành" bị khóa trước khi trả lời), trường hợp bài không tồn tại `#/lesson/khong-co` trong `AppRoutes.test.tsx`.
6. Khi xuất file mà đọc kho lỗi, file chỉ chứa hồ sơ đang dùng. Vô hại khi mỗi máy có 1 hồ sơ; xử lý khi có giao diện nhiều hồ sơ.

Các finding nhỏ khác đã hoãn nằm trong 2 file ledger (tìm dòng `minor (deferred)` và `parked`).

## Môi trường

- Máy phát triển ban đầu dùng Node 24.18, npm 12.2, Python 3.14.2 với `pytest` (trong `.venv`), Chromium của Playwright. `package.json` không khai báo `engines`; phiên bản Node tối thiểu chưa được kiểm tra.
- npm 12 chặn script cài đặt của esbuild/fsevents và in cảnh báo; cảnh báo này vô hại.
- Cài lần đầu: xem `README.md` mục "Cài đặt lần đầu".
- `npm run check` phải xanh trước mọi merge: typecheck, Vitest (336 test sau M2), pytest (17), kiểm tra nội dung, Playwright e2e (8).
