# Quyết định cần xem lại

File này ghi các quyết định Claude tự chốt khi chạy liên tục các mốc M3b đến M6 (người bảo trì yêu cầu ngày 2026-10-06: "chạy implement, push, rồi lần lượt plan và implement các phần tiếp theo; các quyết định cần chú ý note down lại để revisit sau"). Mỗi mục ghi: quyết định, lý do, cái giá nếu sai, và nơi sửa.

Quyết định đã có người bảo trì duyệt nằm trong `STATUS.md` và kế hoạch của từng mốc; file này chỉ chứa các điểm chưa được duyệt.

## Chung

- **Bỏ qua bước thử bằng mắt giữa các mốc.** `CLAUDE.md` yêu cầu người bảo trì thử app (`npm run dev`) trước khi merge. Người bảo trì yêu cầu chạy liên tục, nên mỗi mốc được merge và push khi `npm run check` xanh và review cuối sạch. Giá nếu sai: lỗi giao diện chỉ thấy khi nhìn bằng mắt sẽ tích lũy qua nhiều mốc. Việc cần làm: thử lần lượt từng mốc theo danh sách trong `STATUS.md`.

## M3b

Các quyết định thiết kế 1–13 trong `docs/superpowers/plans/2026-10-06-m3b-kiem-tra-tien-hoa.md` đã được người bảo trì xem qua khi duyệt kế hoạch (người bảo trì trả lời "Chạy implement"). Các điểm dưới đây phát sinh khi chạy và chưa được duyệt.

1. **Trong bài kiểm tra, "Chạy thử" hiện giải thích lỗi như trong bài học** (lệch khỏi kế hoạch, Task 6). Lý do: nếu không, code lỗi trông như "không có đầu ra" và con nộp bài sai mà không biết. Điểm vẫn chỉ hiện ở cuối bài. Giá nếu sai: bài kiểm tra dễ hơn ý định một chút. Nơi sửa: `src/ui/ExamCodeView.tsx` (`handleRun`).
2. **Bài kiểm tra tiến hóa đã đạt không làm lại được**: nút trên bản đồ báo "{tên robot} đã tiến hóa ở giai đoạn này rồi!". Lần thi chưa đạt cho giai đoạn cũ không mở bộ ôn tập. Lý do: tránh chúc mừng giả và tránh bộ ôn tập thừa chiếm nút "Học tiếp". Giá nếu sai: con không ôn lại được bằng đề tiến hóa cũ (vẫn ôn bằng trạm ôn và ôn tập tự do).
3. **Chưa đạt mà không có bài nào để ôn**: màn hình hiện nút "Thi lại" thay cho "Bắt đầu ôn tập trọng tâm".
4. **Robot trông nhỏ lại sau khi tiến hóa**: thanh "Lớn lên" của giai đoạn mới bắt đầu từ 0 (quyết định 5 của kế hoạch) và hình robot theo dạng để dành cho M6. Cần người bảo trì nhìn Phòng robot ngay sau khi tiến hóa.
5. **Chuyển sang M4**: chuỗi "chưa đạt 80%" đang ghi cứng 80%; khi phụ huynh chỉnh được ngưỡng đạt (M4) cần thêm placeholder. Bản ghi kiểm tra chủ đề chưa giới hạn điểm trong `[0, max]` và giữ `best` khi `max` đổi (cần xử lý trước khi M5 đổi cỡ đề).
6. **Dòng trailer của commit** ghi model của subagent viết commit đó (Haiku, Sonnet hoặc Opus), không viết lại lịch sử.

## M4a

Người bảo trì chưa duyệt kế hoạch M4a; Claude tự chốt theo yêu cầu chạy liên tục. Chi tiết trong mục "Quyết định thiết kế" của `docs/superpowers/plans/2026-10-06-m4a-cua-hang-nghi.md`.

1. **Chia M4 thành M4a (luật chơi và màn hình của con) và M4b (khu phụ huynh).** Mọi dữ liệu mới của M4 vào GameState version 4 một lần. Giá nếu sai: không đáng kể.
2. **Giá và danh mục cửa hàng** (dầu nhớt 15, pin sạc nhanh 30, quả bóng 15, phụ kiện 40–120, đồ trang trí 40–90 xu; 4 phụ kiện chỉ là quà chuỗi ngày). Là ước tính; sửa trong `src/game/shop.ts` sau khi phụ huynh xem số xu trung bình/ngày.
3. **Đồ chơi tăng Vui +1** theo spec 5.6. Quyết định M3a "Vui chỉ tăng khi trả lời đúng" được hiểu là cho việc sạc bằng ôn tập. Cần xác nhận; nếu sai thì bỏ món "Quả bóng" hoặc đổi tác dụng.
4. **Đổi thưởng thật:** con chỉ xin được khi số xu chưa bị giữ đủ giá; giới hạn tuần tính cả yêu cầu đang chờ; duyệt mà con thiếu xu thì yêu cầu vẫn chờ.
5. **Chế độ nghỉ:** thêm sự kiện hủy lịch nghỉ (spec không có); kế hoạch tuần = làm tròn lên `mục tiêu × số ngày không nghỉ / 7`.
6. **Thời gian học:** phút đầu khi mở màn hình học được tính cả khi con chỉ đọc; sau đó cần thao tác trong 60 giây.
7. **16 huy hiệu** do Claude đặt (spec không liệt kê). Sửa danh sách trong `src/game/badges.ts`.
8. **Phụ kiện chỉ hiện bằng chữ** trong Phòng robot cho tới M6.

9. **Xu đang được giữ cho phần thưởng chờ duyệt thì không tiêu được trong cửa hàng** (phát sinh khi review cuối). Nút Mua báo "Xu đang được giữ cho phần thưởng chờ duyệt". Con chưa tự hủy được yêu cầu; phụ huynh từ chối thì xu được nhả ra.
10. **Huy hiệu "Kiên trì"** (spec 5.9 có nhắc) được thêm: nhận khi đúng sau ít nhất 3 lần nộp sai. Mục 7 ở trên ghi "spec không liệt kê" là chưa đúng: spec nhắc đúng 1 huy hiệu này.
11. **Tắt chế độ nghỉ** cũng kết thúc khoảng nghỉ đã lên lịch đang diễn ra hôm nay.
12. **Tuần nghỉ trọn** (kế hoạch tuần bằng 0): Phòng robot hiện "Tuần này là tuần nghỉ"; con học trong tuần đó không được thưởng tuần. Cần người bảo trì xác nhận cách thưởng.
13. **Các trường hợp kiểm tra bằng tay ở bản sau:** con thấy ngày dạng 2026-10-06 trong Sổ thành tích (chưa đổi sang 06/10/2026).

