# Checklist kiểm thử thủ công trước khi phát hành

Dùng trước bản phát hành đầu tiên và trước mỗi bản sau (spec 11.6). Làm theo thứ tự các phần. Ghi mỗi mục là Đạt hoặc Không đạt kèm ghi chú, và ghi ngày kiểm thử (YYYY-MM-DD), tên máy, trình duyệt.

Phần 1 đến 3 do người bảo trì làm trước. Phần 4 làm cùng học sinh. Phần 5 ghi lại để sửa sau buổi dùng thử.

## 1. Chuẩn bị

- [ ] `npm run check` xanh trên commit sẽ phát hành; CI trên GitHub cũng xanh
- [ ] Bản deploy trên GitHub Pages (`https://<owner>.github.io/py-pet/`) mở được; Settings → Pages → Source đã chọn **GitHub Actions**
- [ ] Mở bản deploy trong cửa sổ ẩn danh, không có hồ sơ cũ: chạy được từ màn hình chào đến bài đầu tiên
- [ ] Máy dùng thử có kết nối mạng ổn định ở lần mở đầu tiên (Pyodide nặng khoảng 10 MB); ghi lại thời gian từ lúc mở trang đến "Robo sẵn sàng"
- [ ] Đã chọn người ngồi cùng học sinh và đã nói trước: người lớn chỉ quan sát, không gõ hộ, không gợi ý trước khi con tự thử

## 2. Máy và trình duyệt

- [ ] Chrome bản mới nhất trên macOS
- [ ] Edge bản mới nhất trên Windows (nếu có máy)
- [ ] Laptop màn hình 13 inch: màn hình bài tập chia đôi không bị tràn ngang, đọc được không cần thu nhỏ trang
- [ ] Laptop màn hình 15 inch: bố cục không bị trống lệch
- [ ] Trình duyệt cũ hoặc không hỗ trợ (hoặc tắt WebAssembly): hiện màn hình "Trình duyệt này chưa chạy được Py-Pet" với lời khuyên dùng Chrome hoặc Edge, không để trang trắng

## 3. Gõ tiếng Việt trong trình soạn code

- [ ] Bộ gõ tiếng Việt của macOS (Telex): gõ `print("Xin chào Robo")`, nộp bài 1 được chấm đúng
- [ ] Unikey hoặc EVKey (Telex) trên Windows: gõ như trên, được chấm đúng
- [ ] Gõ dấu xong rồi xóa lùi: không còn ký tự dấu thừa
- [ ] Gõ tiếng Việt trong ô Input: chương trình đọc đúng chữ có dấu
- [ ] Dán dấu nháy cong từ Word vào code: có giải thích riêng về dấu nháy cong

## 4. Buổi dùng thử với học sinh (1 buổi, 30 đến 45 phút)

Bấm đồng hồ, ghi lại mốc thời gian của từng việc.

- [ ] Con tự tạo hồ sơ (tên, PIN của bố mẹ) mà không cần hỏi; bố mẹ ghi PIN lại
- [ ] Con tự học bài 1 đến hết, không cần hỏi người lớn cách bấm nút nào
- [ ] Con đọc lời giải thích lỗi của Robo khi gõ sai và tự sửa được ít nhất 1 lần
- [ ] Con tự làm tiếp ít nhất 1 bài nữa hoặc 1 trạm ôn nếu còn thời gian
- [ ] Phòng robot sau buổi học: XP, xu, mục tiêu hôm nay tăng đúng; con hiểu Robo cần gì
- [ ] Cuối buổi, người lớn mở Khu phụ huynh bằng PIN: thấy thời gian học và tiến độ của buổi vừa rồi; tên bài hiện bằng tên, không phải mã

## 5. Việc cần ghi trong buổi dùng thử

Ghi từng việc vào 1 dòng, kèm giờ và bài đang làm. Không sửa ngay trong buổi.

- Chỗ con dừng lại quá 1 phút, hỏi lại, hoặc bấm nhầm
- Câu chữ con không hiểu (đề bài, lời Robo, tên nút)
- Lời giải thích lỗi nào của Robo con thấy khó hiểu, hoặc không đúng với lỗi con gặp (chép lại code con gõ)
- Bài nào hiện "Bài này đang bị lỗi, con bỏ qua nhé" (ghi tên bài; cũng xem Nhật ký lỗi trong Khu phụ huynh)
- Lần nào Robo khởi động chậm hoặc hiện "Robo chưa khởi động được"; bấm "Thử lại" có chạy được không
- Chỗ con thấy vui, thích, muốn làm tiếp
- Hỏi con 3 câu: Lời giải thích lỗi của Robo có dễ hiểu không? Phần nào chán nhất? Con muốn Robo làm thêm gì?

Sau buổi dùng thử: gom ghi chú thành danh sách việc cần sửa, phân loại thành lỗi, nội dung chưa rõ, và ý tưởng, rồi đưa vào mốc sau.

## 6. Hành vi chạy code

- [ ] Lần đầu mở trang: hiện "Robo đang khởi động..." rồi "Robo sẵn sàng" (trên mạng tốt thường trong vòng 15 giây)
- [ ] Ngắt mạng trước khi mở trang lần đầu (hoặc chặn `pyodide.asm.wasm` trong DevTools): hiện khung "Robo chưa khởi động được" kèm nút "Thử lại"; bật lại mạng, bấm "Thử lại" thì chạy được ví dụ
- [ ] Bấm "Chạy thử" nhiều lần liên tiếp thật nhanh: kết quả không bị lẫn, không treo
- [ ] Vòng lặp vô hạn: sau khoảng 2 giây có thông báo dừng, sau đó chạy tiếp được
- [ ] Viết `input("Nhập: ")` trong bài có Input rồi nộp: có giải thích về chữ trong input()

## 7. Lưu trữ và vòng chơi

- [ ] Lần đầu mở: màn hình chào hỏi; sau khi tạo hồ sơ, tải lại trang vẫn vào thẳng Phòng robot
- [ ] Học xong 1 bài: Phòng robot hiện XP, xu, mục tiêu hôm nay tăng; tải lại trang không mất
- [ ] Đang làm dở bài code, tải lại trang: code đang viết vẫn còn
- [ ] Mở thêm 1 tab Py-Pet: tab thứ 2 chỉ báo "đang mở ở tab khác"
- [ ] Chế độ ẩn danh của Chrome: app vẫn học được (nếu bị chặn thì phải có banner)
- [ ] Xuất file sao lưu, nhập lại trên Edge hoặc máy khác: đúng tên học sinh, xu, bài đã xong
- [ ] Nhập file bằng PIN sai: không nhập được
- [ ] Đổi giờ máy lùi 2 ngày rồi học: chuỗi ngày không tăng
- [ ] Không học 3 ngày liền (hoặc chỉnh giờ máy tiến 4 ngày): Pin và Vui giảm 2, robot buồn ngủ
