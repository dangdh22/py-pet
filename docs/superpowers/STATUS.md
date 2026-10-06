# Trạng thái dự án Py-Pet

Cập nhật lần cuối: 2026-10-06.

## Các mốc

| Mốc | Nội dung (spec 12.3) | Trạng thái |
|---|---|---|
| M1 | Lát cắt dọc: bài học, chạy Python bằng Pyodide, chấm bài, từ điển lỗi | Xong, đã merge vào `main` |
| M2 | Vòng chơi pet: IndexedDB, XP/xu, Pin/Vui, chuỗi ngày, Phòng robot, Bản đồ học, màn hình kết quả, sao lưu/nhập file `.pypet`, màn hình chào hỏi | Xong, đã merge vào `main` và push (commit `0e188b4`) |
| M3a | Điểm thành thạo, bậc thang, cờ "Cần hỗ trợ", hộp Leitner, trạm ôn, sạc Pin bằng ôn tập, bài `parsons` và `fill`, thẻ "Hiểu lầm thường gặp" và bài luyện, GameState version 2 | Xong, đã merge vào `main` và push (2026-10-06). Người bảo trì chưa thử bằng mắt |
| M3b | Kiểm tra chủ đề, kiểm tra tiến hóa (đạt 80%), bộ ôn tập trọng tâm, tiến hóa robot, ưu tiên "Học tiếp" | **Việc tiếp theo** |
| M4 | Khu phụ huynh, cửa hàng, phần thưởng thật, chế độ nghỉ, đặt lại PIN, chỉnh mục tiêu, đo thời gian học | Chưa làm |
| M5 | Thêm nội dung giai đoạn 1 đến 4 | Chưa làm |
| M6 | Hình robot 4 dạng, hoạt cảnh | Chưa làm |

Tài liệu:

- Spec (bắt buộc tuân theo): `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch đã chạy: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`, `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`, `docs/superpowers/plans/2026-10-06-m3a-on-tap-thanh-thao.md`
- Sổ ghi (ledger) của từng mốc, gồm mọi phán quyết và finding nhỏ đã hoãn: `docs/superpowers/ledgers/m1-sdd-ledger.md`, `docs/superpowers/ledgers/m2-sdd-ledger.md`, `docs/superpowers/ledgers/m3a-sdd-ledger.md`

## Quyết định của người bảo trì ở M3a

- M3 chia làm M3a và M3b. Test và e2e dùng bộ nội dung mẫu; luật 8 của spec 3.9 chỉ cảnh báo tới M5.
- Vui chỉ tăng khi con trả lời đúng (3 câu đúng liên tiếp, kể cả trong trạm ôn); lượt sạc không tự cộng Vui.
- Ôn tập tự do không giới hạn mỗi ngày (mỗi lượt có XP, Pin +2, 1 điểm hoạt động, không có xu).

## Việc chuyển sang M3b và sau đó

1. Robot có thể nhỏ lại 1 cỡ sau khi cập nhật lên M3a: tổng XP tối đa của giai đoạn 1 tăng từ 112 lên 142 vì có 2 trạm ôn. Hồi lại sau khi làm trạm ôn.
2. M4: kiểm tra `meta` khi nhập file (PIN, `activeProfileId`); màn hình dữ liệu IndexedDB hỏng cần lối xuất file và ghi nhật ký lỗi; đặt lại PIN.
3. Giao diện: focus bàn phím của nút ↑ ↓ trong parsons (dòng đổi chỗ nhưng focus ở lại vị trí cũ); khóa sửa khi đang chấm.
4. Khi xuất file mà đọc kho lỗi, file chỉ chứa hồ sơ đang dùng. Xử lý khi có giao diện nhiều hồ sơ.

Các finding nhỏ khác đã hoãn nằm trong 3 file ledger (tìm dòng `minor (deferred)` và `parked`).

## Môi trường

- Máy phát triển ban đầu dùng Node 24.18, npm 12.2, Python 3.14.2 với `pytest` (trong `.venv`), Chromium của Playwright. `package.json` không khai báo `engines`; phiên bản Node tối thiểu chưa được kiểm tra.
- npm 12 chặn script cài đặt của esbuild/fsevents và in cảnh báo; cảnh báo này vô hại.
- Cài lần đầu: xem `README.md` mục "Cài đặt lần đầu".
- Phiên cloud (kiểm tra 2026-10-06): Node 22.22.0, npm 10.9.4, Python 3.13. npm in cảnh báo `EBADENGINE` (jsdom 30 cần Node 22.22.2 trở lên) nhưng `npm run check` vẫn xanh. Hook SessionStart tự cài môi trường; e2e dùng Chromium có sẵn qua `PW_CHROMIUM_PATH` (xem `CLAUDE.md`).
- `npm run check` phải xanh trước mọi merge: typecheck, Vitest (437 test sau M3a), pytest (21), kiểm tra nội dung, Playwright e2e (10).
