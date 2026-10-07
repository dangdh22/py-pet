# Nội dung giai đoạn 1 "Khởi động": bảng tổng hợp để phụ huynh duyệt

Cập nhật: 2026-10-07. Các con số trong file này được đếm bằng máy từ nội dung của ứng dụng, không đếm tay.

Giai đoạn 1 dạy con những bước đầu tiên với Python: in chữ ra màn hình, chuỗi, chú thích, đọc thông báo lỗi, và in nhiều giá trị trên 1 dòng. Con chưa học biến, `input()`, `if`, vòng lặp hay hàm tự viết.

## Cách đọc bảng

| Từ trong bảng | Nghĩa |
|---|---|
| Bài học | 1 bài ngắn (5 đến 10 phút), gồm vài thẻ lý thuyết rồi vài bài tập |
| Thẻ lý thuyết | 1 màn hình giải thích 1 ý, có ví dụ để con bấm Chạy thử |
| Bài viết code | Con tự viết hoặc sửa code để in ra đúng kết quả |
| Câu đoán kết quả | Con đọc 1 đoạn code rồi chọn kết quả nó in ra (4 lựa chọn) |
| Câu trắc nghiệm | Câu hỏi 4 lựa chọn về kiến thức hoặc về cách viết code |
| Bài sắp xếp dòng | Con xếp các dòng code bị xáo trộn theo đúng thứ tự |
| Bài điền chỗ trống | Con điền 1 đến 3 chỗ trống trong code |
| Ngân hàng câu hỏi | Các câu hỏi thêm, dùng cho trạm ôn và bài kiểm tra |
| Trạm ôn | Chặng ôn 5 câu, mở ra sau 2 đến 3 bài học |
| Kiểm tra chủ đề | Bài kiểm tra cuối mỗi chủ đề: 8 câu hỏi và 2 bài viết code |
| Khái niệm | 1 ý quan trọng mà con hay hiểu nhầm. Mỗi khái niệm có 1 thẻ "Hiểu lầm thường gặp", 1 gợi ý cho phụ huynh, và bài luyện 3 mức |
| Bài luyện mức 1, 2, 3 | Khi con hay sai 1 khái niệm, ứng dụng cho con luyện thêm: mức 1 là câu hỏi, mức 2 là bài sắp xếp dòng hoặc điền chỗ trống, mức 3 là bài viết code |

## Chủ đề 1: Làm quen với chương trình (`s1.lam-quen`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s1.lam-quen.l1` | Chương trình là gì? | Biết chương trình là danh sách lệnh, viết được lệnh `print` đầu tiên | 2 |
| `s1.lam-quen.l2` | Dấu nháy và chữ hoa, chữ thường | Biết chữ cần in phải nằm trong dấu nháy, và Python phân biệt chữ hoa với chữ thường | 2 |
| `s1.lam-quen.l3` | Lệnh chạy từ trên xuống | Biết máy tính chạy từng lệnh từ trên xuống, mỗi `print` in 1 dòng, `print()` in 1 dòng trống | 2 |
| `s1.lam-quen.l4` | Khi máy tính không hiểu | Tìm số dòng và tên lỗi trong thông báo lỗi để tự sửa | 2 |
| `s1.lam-quen.l5` | AI là gì? | Hiểu AI là chương trình học từ rất nhiều ví dụ, có thể sai nên cần kiểm tra lại | 2 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 4 | 0 | |
| Câu đoán kết quả | 3 | | 5 |
| Câu trắc nghiệm | 3 | | 8 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 4 | |

Ngân hàng câu hỏi: 13 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 19, trong đó 7 câu về AI.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `run-order` | Lệnh chạy lần lượt từ trên xuống | 2 / 1 / 1 |
| `print-call` | Lệnh print cần dấu ngoặc tròn | 3 / 2 / 2 |
| `string-quotes` | Chữ cần in phải nằm trong dấu nháy | 4 / 1 / 3 |
| `case-sensitive` | Python phân biệt chữ hoa và chữ thường | 4 / 1 / 1 |
| `read-error` | Đọc thông báo lỗi | 3 / 1 / 1 |
| `ai-basics` | AI là gì (khái niệm AI: chỉ có câu hỏi, không có bài code) | 7 / 0 / 0 |

## Chủ đề 2: print và chuỗi (`s1.chuoi`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s1.chuoi.l1` | Chuỗi là gì? | Biết chuỗi là dãy ký tự trong dấu nháy, được in y nguyên, kể cả dấu cách và chữ số | 4 |
| `s1.chuoi.l2` | Dấu nháy bên trong chuỗi | In được câu có dấu nháy bên trong: đổi loại dấu nháy bao ngoài, hoặc dùng `\"` và `\'` | 3 |
| `s1.chuoi.l3` | Nối chuỗi bằng dấu + | Nối chuỗi bằng dấu `+` và nhớ dấu `+` không tự thêm dấu cách | 3 |
| `s1.chuoi.l4` | Lặp chuỗi bằng dấu * | Lặp chuỗi bằng dấu `*` để vẽ đường kẻ, biết phép `*` làm trước phép `+` | 3 |
| `s1.chuoi.l5` | Xuống dòng với \n | Dùng `\n` để in nhiều dòng chỉ bằng 1 lệnh `print` | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 5 | 4 | |
| Câu đoán kết quả | 7 | | 12 |
| Câu trắc nghiệm | 3 | | 5 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 6 | |

Ngân hàng câu hỏi: 17 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 27.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `string-exact` | Chuỗi được in y nguyên | 5 / 1 / 2 |
| `quote-inside` | Dấu nháy bên trong chuỗi | 5 / 2 / 2 |
| `concat-no-space` | Dấu + không tự thêm dấu cách | 4 / 2 / 2 |
| `string-repeat` | Lặp chuỗi bằng dấu * | 5 / 2 / 3 |
| `newline-escape` | \n là ký tự xuống dòng | 5 / 2 / 2 |

## Chủ đề 3: Chú thích và đọc thông báo lỗi (`s1.chu-thich-loi`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s1.chu-thich-loi.l1` | Chú thích bằng dấu # | Viết chú thích bằng dấu `#`, biết dấu `#` nằm trong dấu nháy thì được in ra | 3 |
| `s1.chu-thich-loi.l2` | Tắt tạm 1 dòng lệnh | Tắt tạm 1 dòng lệnh bằng dấu `#` để thử nghiệm và để tìm lỗi | 3 |
| `s1.chu-thich-loi.l3` | Đọc thông báo lỗi | Phân biệt lỗi cú pháp (không dòng nào chạy) với lỗi khi chạy (dừng ở dòng lỗi) | 4 |
| `s1.chu-thich-loi.l4` | Những lỗi hay gặp | Nhận ra lỗi thiếu dấu đóng, dấu nháy lồng nhau, gõ sai tên lệnh, và sửa từng lỗi một | 4 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 4 | 3 | |
| Câu đoán kết quả | 7 | | 7 |
| Câu trắc nghiệm | 1 | | 7 |
| Bài sắp xếp dòng | 0 | 1 | |
| Bài điền chỗ trống | 0 | 5 | |

Ngân hàng câu hỏi: 14 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 22.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `comment-hash` | Python bỏ qua chú thích | 7 / 1 / 2 |
| `hash-in-string` | Dấu # trong chuỗi không phải chú thích | 4 / 2 / 1 |
| `syntax-error-nothing-runs` | Lỗi cú pháp: không dòng nào được chạy | 3 / 1 / 2 |
| `runtime-error-stops` | Lỗi khi chạy: dừng tại dòng lỗi | 5 / 1 / 2 |
| `bracket-pairs` | Ngoặc và dấu nháy đi thành cặp | 4 / 2 / 2 |

## Chủ đề 4: In nhiều giá trị: sep và end (`s1.print-nhieu`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s1.print-nhieu.l1` | In nhiều giá trị bằng dấu phẩy | In nhiều giá trị trong 1 lệnh `print` bằng dấu phẩy, biết `print` tự thêm 1 dấu cách | 4 |
| `s1.print-nhieu.l2` | Số và chữ | Phân biệt số (để tính) với chữ số trong dấu nháy (để đọc), in chữ cùng với số bằng dấu phẩy | 4 |
| `s1.print-nhieu.l3` | Tham số sep | Đổi thứ ngăn cách giữa các giá trị bằng `sep` | 4 |
| `s1.print-nhieu.l4` | Tham số end | Đổi thứ in ở cuối bằng `end` để lệnh sau in tiếp trên cùng dòng | 4 |
| `s1.print-nhieu.l5` | Vẽ hình bằng print | Vẽ khung, cầu thang, lá cờ, cái cây bằng ký tự, dùng mọi thứ đã học | 4 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 6 | 5 | |
| Câu đoán kết quả | 9 | | 11 |
| Câu trắc nghiệm | 1 | | 6 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 5 | |

Ngân hàng câu hỏi: 17 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 27.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `print-comma-space` | Dấu phẩy trong print tự thêm dấu cách | 6 / 2 / 3 |
| `number-vs-text` | Số và chữ số trong dấu nháy khác nhau | 6 / 1 / 3 |
| `sep-param` | sep chỉ nằm giữa các giá trị | 5 / 2 / 3 |
| `end-param` | end thay ký tự xuống dòng ở cuối | 7 / 2 / 2 |
| `named-option-order` | Viết sep và end sau các giá trị | 4 / 1 / 2 |

## Tổng của giai đoạn 1

| Mục | Số lượng |
|---|---|
| Chủ đề | 4 |
| Bài học | 19 |
| Thẻ lý thuyết | 60 |
| Câu đoán kết quả và trắc nghiệm | 95 (61 câu đoán kết quả, 34 câu trắc nghiệm; 34 câu trong bài học, 61 câu trong ngân hàng) |
| Câu về AI | 7 |
| Bài viết code | 31, cả 31 bài đều dùng được trong bài kiểm tra |
| Bài sắp xếp dòng | 7 |
| Bài điền chỗ trống | 20 |
| Khái niệm | 21 (21 thẻ "Hiểu lầm thường gặp", 21 gợi ý cho phụ huynh) |
| Trạm ôn | 8 |
| Kiểm tra chủ đề | 4 (mỗi bài 8 câu hỏi và 2 bài viết code) |
| Kiểm tra tiến hóa cuối giai đoạn | 1 (15 câu hỏi, trong đó 3 câu về AI, và 3 bài viết code) |
| Bài luyện mức 1 (câu hỏi) | 92 câu khác nhau |
| Bài luyện mức 2 (sắp xếp dòng, điền chỗ trống) | 27 bài |
| Bài luyện mức 3 (viết code) | 31 bài |

Ở bài luyện, 1 câu có thể dùng cho 2 khái niệm, nên tổng ở các bảng chủ đề lớn hơn số câu khác nhau ở bảng này.

## Việc phụ huynh cần duyệt

Mọi lời văn đã viết xong và dùng được ngay. Bố mẹ đọc lại và sửa cho tự nhiên, dễ hiểu với con.

| Việc cần duyệt | Số lượng | Nằm ở đâu |
|---|---|---|
| Lời văn các thẻ lý thuyết | 60 thẻ trong 19 bài | Các file `content/stage-1/<chủ đề>/NN-ten-bai.md`, phần nằm sau dòng `---` thứ hai. Mỗi thẻ cách nhau bằng 1 dòng `---` |
| Thẻ "Hiểu lầm thường gặp" | 21 thẻ | Dòng `misconception_card` trong file `concepts.yaml` của mỗi chủ đề |
| Gợi ý cho phụ huynh (1 hoạt động ở nhà, không cần máy tính) | 21 gợi ý | Dòng `parent_tip` trong file `concepts.yaml` của mỗi chủ đề |

Khi sửa, xin bố mẹ nhớ:

- Chỉ sửa chữ. Không đổi các dòng `id:` và các mã như `s1.chuoi.l2`, vì ứng dụng dùng các mã này để lưu tiến độ của con.
- Ở chủ đề 1, mỗi bài giữ đúng 2 thẻ (kiểm tra tự động của ứng dụng bấm qua đúng 2 thẻ ở mỗi bài).
- Code trong ví dụ phải chạy ra đúng như lời văn mô tả. Sửa xong, người bảo trì chạy `npm run content:validate` để máy kiểm tra lại.
