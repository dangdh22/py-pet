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


## M4b

Người bảo trì chưa duyệt kế hoạch M4b; Claude tự chốt theo yêu cầu chạy liên tục. Chi tiết trong mục "Quyết định thiết kế" của `docs/superpowers/plans/2026-10-06-m4b-khu-phu-huynh.md`.

1. **Duyệt phần thưởng không hỏi PIN lần nữa**: duyệt trong khu phụ huynh (đã mở bằng PIN) được coi là "duyệt bằng PIN" của spec 5.5.
2. **Đặt lại PIN không cần PIN cũ** và không có câu hỏi bảo mật; chỉ để lại dấu vết "Mã PIN đã được đặt lại lúc …" luôn hiện trong khu phụ huynh. Giá nếu sai: con biết lối "Quên mã PIN?" thì tự mở được khu phụ huynh (bố mẹ sẽ thấy dấu vết). Nơi sửa: `src/ui/ParentScreen.tsx` (`ParentGate`).
3. **Bằng chứng "Con cần hỗ trợ"** chỉ có code của con, số test qua, đáp án đã chọn; chưa có đầu ra so với đầu ra mong đợi (lịch sử làm bài chưa lưu đầu ra).
4. **Giới hạn phụ huynh chỉnh được**: mục tiêu ngày 1–10, kế hoạch tuần 0–50, ngày vắng được miễn 0–7, ngưỡng đạt 50–100%, ngưỡng "Cần hỗ trợ" 30–90%, thời gian chạy code 1–10 giây; giá phần thưởng tối đa 100000 xu, tối đa 50 lần mỗi tuần. Các con số này do Claude đặt. Nơi sửa: `src/game/settings.ts`, `src/game/realRewards.ts`.
5. **Xóa hồ sơ** xóa toàn bộ dữ liệu trên máy (gồm PIN), không chỉ hồ sơ của con, vì bản đầu chỉ có 1 hồ sơ.
6. **Xu trung bình/ngày** tính trên 14 ngày, chỉ tính xu kiếm được.
7. **Dữ liệu hỏng** được xuất dưới dạng JSON thô (không phải `.pypet`), vì state hỏng không nhập lại được.
8. **Tự khóa** sau 5 phút không có phím, chạm hoặc cuộn; chỉ di chuột không tính là thao tác.
9. **Ngưỡng đạt của phụ huynh áp dụng cho cả kiểm tra chủ đề**, không chỉ kiểm tra tiến hóa (spec 9.5 chỉ nói "ngưỡng đạt tiến hóa", spec 5.5 ghi kiểm tra chủ đề đạt từ 80% không có (*)). Giá nếu sai: hạ ngưỡng thì con cũng dễ nhận 20 xu của kiểm tra chủ đề hơn. Nơi sửa: `src/game/apply.ts` (`completeTopicTest`), `src/ui/TopicTestScreen.tsx`.
10. **Giao thêm bài luyện** lấy 2 bài theo mức bậc thang hiện tại; nút bị tắt khi khái niệm đã có bài được giao chưa làm xong.
11. **Tiến độ chi tiết chưa có thời gian học từng bài và ngôn ngữ câu hỏi từng bài** (spec 9.3 có). Lịch sử làm bài chưa lưu 2 thông tin này theo bài.
12. **Quy tắc nhập file**: file phải có ít nhất 1 hồ sơ và `meta` đúng dạng; hồ sơ đang dùng không có trong file thì lấy hồ sơ đầu tiên; file không có PIN thì giữ PIN của máy; dấu vết đặt lại PIN giữ mốc muộn nhất giữa máy và file.
13. **Hệ quả gộp của mục 2 và mục 5**: ai biết lối "Quên mã PIN?" cũng xóa được toàn bộ dữ liệu bằng cách gõ đúng tên của con, và việc xóa không giữ bản sao lưu tự động. Bố mẹ nên xuất file `.pypet` định kỳ. Nơi sửa nếu muốn an toàn hơn: giữ 1 bản sao lưu tự động khi xóa (`eraseAll` trong `src/ui/GameProvider.tsx`).
14. **File xuất khi dữ liệu hỏng** không chứa mã băm PIN và các bản sao lưu tự động (file này để gửi hỗ trợ).
15. **Thẻ "Con cần hỗ trợ"** chỉ hiện số lần mắc lỗi hiểu sai, chưa hiện nội dung "hiểu lầm hay gặp" (spec 9.2). Để dành cho bản sau.

## M5a

Người bảo trì chưa duyệt kế hoạch M5a; Claude tự chốt theo yêu cầu chạy liên tục. Chi tiết trong mục "Quyết định thiết kế" của `docs/superpowers/plans/2026-10-06-m5a-noi-dung-giai-doan-1.md`.

1. **M5 chia theo giai đoạn** thành M5a–M5d, mỗi phần merge vào `main` khi xong.
2. **Dàn ý giai đoạn 1** do Claude đặt (spec chỉ nêu tên chủ đề): chủ đề 2 "print và chuỗi" 5 bài, chủ đề 3 "Chú thích và đọc thông báo lỗi" 4 bài, chủ đề 4 "In nhiều giá trị: sep và end" 5 bài; cùng chủ đề 1 là 18 bài. Nơi sửa: `content/stage-1/`.
3. **Nội dung do Claude soạn theo yêu cầu**, chưa qua phụ huynh duyệt (spec 3.10). Bảng tổng hợp để duyệt: `docs/superpowers/content-stage-1.md`.
4. **Khái niệm AI chỉ cần bài luyện mức 1.** Luật 8 của spec 3.9 được hiểu theo cách này. Nơi sửa: `tools/content/coverage.ts`.
5. **Điểm cao nhất của kiểm tra chủ đề được quy đổi** theo cỡ đề mới khi cỡ đề đổi (6/6 thành 14/14). Giá nếu sai: con có thể giữ điểm "cao nhất" mà chưa làm đề mới.
6. **E2E "thi tiến hóa chưa đạt → ôn → thi lại"** vẫn chỉ có test tích hợp jsdom (đi hết 18 bài trong Playwright quá chậm).
7. **Thêm bài 5 "AI là gì?" vào cuối chủ đề 1** (phát sinh khi chạy): câu hỏi AI cần 1 bài dạy về AI; bài có 2 thẻ, không có bài code. Giai đoạn 1 có 19 bài.
8. **Thứ tự lựa chọn được xáo theo ID câu hỏi** khi hiển thị (phát sinh khi chạy, Task 7): đáp án đúng của hầu hết câu hỏi nằm đầu tiên trong file. Thứ tự cố định cho mỗi câu (tải lại không đổi); lịch sử vẫn lưu vị trí trong file.
9. **App chạy Python 3.14 (Pyodide), validator chạy CPython 3.13**: thông báo lỗi có thể khác nhau; mục từ điển lỗi mới được kiểm trong Pyodide bằng test parity. Mục `quote-inside-string` khớp thông báo của 3.14.

## M5b

Người bảo trì chưa duyệt kế hoạch M5b; Claude tự chốt theo yêu cầu chạy liên tục. Chi tiết trong mục "Quyết định thiết kế" của `docs/superpowers/plans/2026-10-07-m5b-noi-dung-giai-doan-2.md`.

1. **Dàn ý giai đoạn 2** do Claude đặt: 5 chủ đề "Biến", "Phép tính // % **", "Nhập dữ liệu với input()", "Ép kiểu", "Định dạng đầu ra", mỗi chủ đề 5 bài (25 bài).
2. **Bài AI "Dữ liệu là gì?"** là bài cuối của chủ đề "Biến".
3. **`round(2.5)` ra `2`** được dạy như 1 hiểu lầm hay gặp.
4. **Không dạy phép chia số âm** ở giai đoạn 2.
5. **`input()` luôn để trống ngoặc** trong bài tập, vì chữ trong ngoặc bị tính vào đầu ra khi chấm (đã có mục từ điển `input-prompt`).
6. **Khái niệm `input-prompt`** (đổi từ `input-empty-prompt` của kế hoạch): trùng mã hiểu lầm mà bộ chấm tự thêm khi con viết chữ trong `input(...)`, nên thẻ hiểu lầm và bài luyện tự xuất hiện.
7. **Sửa 1 phần code của app trong M5b** (kế hoạch ghi chỉ có nội dung): (a) lỗi `NameError` khi dùng biến trước khi gán được nhận ra riêng (mục từ điển `name-before-assign`, check `assigned-in-code`) và ghi hiểu lầm `var-before-use`, không ghi nhầm thành "quên dấu nháy"; (b) hiểu lầm thuộc khái niệm của giai đoạn con chưa tới thì không được ghi vào điểm thành thạo và không hiện thẻ (`isConceptReached` trong `src/content/lookup.ts`). Lý do: nội dung giai đoạn 2 làm 2 lỗi này hay gặp.
8. **Mục từ điển lỗi mới của giai đoạn 2**: `assign-to-literal`, `float-invalid`, `format-code-str`, `name-before-assign` (34 mục).

## M5c

Người bảo trì chưa duyệt kế hoạch M5c; Claude tự chốt theo yêu cầu chạy liên tục. Chi tiết trong mục "Quyết định thiết kế" của `docs/superpowers/plans/2026-10-07-m5c-noi-dung-giai-doan-3.md`.

1. **Dàn ý giai đoạn 3** do Claude đặt: "So sánh và bool" (5 bài, bài 5 là AI), "if và else" (5), "Nhiều nhánh với elif" (4), "and, or, not" (4), "Bài toán điều kiện" (4): 22 bài.
2. **Bài AI "Quy tắc cố định và học từ dữ liệu"** là bài cuối của chủ đề "So sánh và bool".
3. **Chưa dạy `max()`/`min()`** ở giai đoạn 3; bài số lớn nhất dùng `if`.
4. **Test cho mọi nhánh và ranh giới** là quy tắc bắt buộc của bài rẽ nhánh.
5. **So sánh nối (`1 < x < 5`)** được dạy ở chủ đề "and, or, not", cạnh cách viết bằng `and`.
6. **Từ điển lỗi giai đoạn 3**: mục mới `assign-in-call`, `compare-str-int`, `print-unknown-option`, `elif-after-else`, `assign-in-if` (39 mục); các mục `missing-colon`, `indent-expected`, `assign-in-condition` gắn khái niệm giai đoạn 3; `indent-unexpected` không gắn khái niệm (lỗi dễ gặp do vô ý, kể cả ở giai đoạn 1–2). Lời giải thích `missing-colon` chỉ nói về `if`/`elif`/`else`; M5d bổ sung `for`/`while`.
7. **Sửa 1 phần code của app trong M5c** (như M5b mục 7): check `assign-in-if` nhận ra dấu `=` đứng riêng trong điều kiện có `and`/`or` (Python chỉ báo "invalid syntax").
8. **Bỏ ví dụ "thụt lề thừa"** khỏi bài `s3.if-else.l2` (thẻ chỉ còn lỗi thụt lề lệch); từ điển lỗi vẫn giải thích lỗi này.
