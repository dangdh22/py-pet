# Nội dung giai đoạn 2 "Dữ liệu": bảng tổng hợp để phụ huynh duyệt

Cập nhật: 2026-10-07. Các con số trong file này được đếm bằng máy từ nội dung của ứng dụng, không đếm tay.

Giai đoạn 2 dạy con làm việc với dữ liệu: cất giá trị vào biến, tính toán, đọc dữ liệu người dùng gõ vào, đổi chữ thành số và số thành chữ, rồi in kết quả cho gọn gàng. Con vẫn chưa học `if`, vòng lặp hay hàm tự viết.

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
| Ô Dữ liệu nhập | Ô nằm dưới chỗ viết code. Con gõ vào đây những gì người dùng sẽ gõ cho chương trình, mỗi giá trị 1 dòng |
| Test ẩn | Khi con nộp bài có dữ liệu nhập, ứng dụng chấm thêm với dữ liệu khác mà con không thấy trước, để con không in sẵn đáp án |

## Điểm mới ở giai đoạn 2 mà bố mẹ nên biết

| Điểm mới | Giải thích |
|---|---|
| `input()` luôn để trống ngoặc | Nếu con viết chữ vào trong ngoặc, như `input("Tên: ")`, chữ đó bị in ra và bị tính vào kết quả khi chấm, nên bài bị chấm sai. Bài học giải thích điều này ở chủ đề 3 |
| Số thực viết bằng dấu chấm | Python viết ba phẩy năm là 3.5, không viết 3,5. Đây là cách viết của máy tính, không phải lỗi chính tả |
| `round()` chọn số chẵn | Khi 1 số nằm đúng giữa 2 số nguyên, Python chọn số chẵn: `round(2.5)` ra 2, `round(3.5)` ra 4. Điều này khác cách làm tròn ở môn Toán, nhưng đúng với Python. Xin bố mẹ đừng sửa thành 3 |
| Số thực có chữ số lạ ở cuối | `0.1 + 0.2` in ra 0.30000000000000004. Máy tính lưu số thực gần đúng, nên đây không phải lỗi của con. Chủ đề 5 dạy cách in gọn bằng `:.2f` |

## Chủ đề 1: Biến (`s2.bien`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s2.bien.l1` | Biến là gì? | Biết biến là chiếc hộp có tên để cất 1 giá trị, dấu `=` là lệnh gán, và tên biến viết không có dấu nháy | 4 |
| `s2.bien.l2` | Đặt tên biến | Đặt tên biến đúng quy tắc (chữ cái, chữ số, dấu gạch dưới, không có dấu cách, không bắt đầu bằng chữ số), chọn tên có nghĩa, không đặt trùng tên lệnh | 4 |
| `s2.bien.l3` | Thay giá trị của biến | Gán lại biến, dùng giá trị cũ để tính giá trị mới như `xu = xu + 3`, và gán biến trước khi dùng | 4 |
| `s2.bien.l4` | Biến chứa chữ, biến chứa số | Phân biệt biến chứa chuỗi "5" với biến chứa số 5, xem loại dữ liệu bằng `type()` | 4 |
| `s2.bien.l5` | Dữ liệu là gì? | Hiểu dữ liệu là những gì máy tính ghi lại, và AI cần dữ liệu nhiều, đa dạng, có nhãn đúng | 2 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 5 | 3 | |
| Câu đoán kết quả | 7 | | 8 |
| Câu trắc nghiệm | 4 | | 15 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 3 | |

Ngân hàng câu hỏi: 23 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 34, trong đó 6 câu về AI.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `var-assign` | Dấu = là gán, không phải so sánh | 6 / 1 / 3 |
| `var-name-rules` | Quy tắc đặt tên biến | 7 / 1 / 1 |
| `var-reassign` | Biến giữ giá trị gán sau cùng | 5 / 2 / 2 |
| `var-before-use` | Phải gán biến trước khi dùng | 3 / 1 / 1 |
| `str-vs-int` | Biến chứa chuỗi "5" khác biến chứa số 5 | 7 / 1 / 2 |
| `ai-data` | AI cần dữ liệu tốt (khái niệm AI: chỉ có câu hỏi, không có bài code) | 6 / 0 / 0 |

## Chủ đề 2: Phép tính // % ** (`s2.phep-tinh`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s2.phep-tinh.l1` | Cộng, trừ, nhân, chia | Tính với biến bằng `+ - * /`, biết phép `/` luôn cho ra số thực (6 / 2 ra 3.0), và phép nhân luôn cần dấu `*` | 4 |
| `s2.phep-tinh.l2` | Chia lấy phần nguyên // | Dùng `//` để lấy phần nguyên của phép chia, biết `//` không làm tròn, và không chia được cho 0 | 3 |
| `s2.phep-tinh.l3` | Chia lấy dư % | Dùng `%` để lấy số dư, nhận ra số chẵn, số lẻ bằng `% 2` và chữ số hàng đơn vị bằng `% 10` | 4 |
| `s2.phep-tinh.l4` | Lũy thừa ** và thứ tự phép tính | Tính lũy thừa bằng `**` (không dùng `^`), biết thứ tự phép tính, và dùng ngoặc tròn để làm phép nào trước | 4 |
| `s2.phep-tinh.l5` | Giải bài toán bằng phép tính | Giải bài toán theo 3 bước: cất số liệu vào biến, tính, rồi in kết quả, như đổi phút ra giờ hay tính chu vi | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 3 | |
| Câu đoán kết quả | 10 | | 5 |
| Câu trắc nghiệm | 0 | | 11 |
| Bài sắp xếp dòng | 0 | 1 | |
| Bài điền chỗ trống | 0 | 4 | |

Ngân hàng câu hỏi: 16 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 26.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `div-float` | Phép / luôn cho ra số thực | 5 / 1 / 2 |
| `floor-div` | Phép // lấy phần nguyên | 6 / 2 / 3 |
| `modulo` | Phép % lấy số dư | 8 / 1 / 3 |
| `power-op` | Phép ** là lũy thừa | 5 / 1 / 2 |
| `precedence` | Thứ tự phép tính | 6 / 1 / 3 |

## Chủ đề 3: Nhập dữ liệu với input() (`s2.input`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s2.input.l1` | input() là gì? | Dùng `input()` để đọc 1 dòng người dùng gõ, biết gõ dữ liệu vào ô Dữ liệu nhập, và biết bài nộp được chấm cả bằng test ẩn | 3 |
| `s2.input.l2` | Để trống ngoặc của input() | Biết chữ trong ngoặc của `input()` là lời nhắc, bị in ra và bị tính vào kết quả, nên luôn viết `input()` để trống | 3 |
| `s2.input.l3` | input() luôn trả về chuỗi | Biết `input()` luôn đưa lại chuỗi, nên dấu `+` nối chứ không cộng; làm quen với công thức `int(input())` | 4 |
| `s2.input.l4` | Đọc nhiều dòng | Biết mỗi lần gọi `input()` đọc 1 dòng mới, theo thứ tự từ trên xuống, và hiểu lỗi EOFError khi thiếu dòng | 4 |
| `s2.input.l5` | Chương trình biết trò chuyện | Viết chương trình hỏi rồi trả lời, chạy đúng với mọi dữ liệu nhập chứ không chỉ với dữ liệu ở phần Ví dụ | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 2 | |
| Câu đoán kết quả | 0 | | 1 |
| Câu trắc nghiệm | 10 | | 10 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 2 | |

Ngân hàng câu hỏi: 11 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 21.

Ở chủ đề này, nhiều câu hỏi cho biết ô Dữ liệu nhập có gì rồi hỏi kết quả, nên được xếp vào loại câu trắc nghiệm.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `input-str` | input() luôn trả về chuỗi | 6 / 1 / 3 |
| `input-prompt` | Để trống ngoặc của input() khi làm bài | 5 / 1 / 3 |
| `input-one-line` | Mỗi lần gọi input() đọc 1 dòng | 5 / 1 / 3 |
| `input-order` | Dữ liệu được đọc theo thứ tự gõ | 5 / 2 / 4 |

## Chủ đề 4: Ép kiểu (`s2.ep-kieu`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s2.ep-kieu.l1` | Đổi chuỗi thành số nguyên với int() | Dùng `int()` để đổi chuỗi chữ số thành số nguyên rồi tính, và nhớ cất số mới vào biến | 4 |
| `s2.ep-kieu.l2` | Số thực và float() | Viết số thực bằng dấu chấm, dùng `float()` để đọc số có phần thập phân | 3 |
| `s2.ep-kieu.l3` | Đổi số thành chuỗi với str() | Dùng `str()` để nối số với chữ bằng dấu `+`, và biết khi nào dùng dấu phẩy thì gọn hơn | 3 |
| `s2.ep-kieu.l4` | int() cắt bỏ phần thập phân | Biết `int()` cắt bỏ phần thập phân chứ không làm tròn, và báo lỗi ValueError với chuỗi có dấu chấm hay chữ cái | 3 |
| `s2.ep-kieu.l5` | Máy tính bỏ túi của Robo | Viết máy tính bỏ túi: đọc 2 số, in tổng, hiệu, tích, thương, và chọn `int()` hay `float()` cho phù hợp | 4 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 10 | 3 | |
| Câu đoán kết quả | 6 | | 6 |
| Câu trắc nghiệm | 4 | | 7 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 3 | |

Ngân hàng câu hỏi: 13 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 23.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `int-convert` | int() đổi chuỗi thành số nguyên | 5 / 1 / 4 |
| `float-convert` | Số thực dùng dấu chấm và float() | 6 / 1 / 4 |
| `str-convert` | str() đổi số thành chuỗi để nối | 5 / 1 / 3 |
| `int-truncate` | int() cắt bỏ phần thập phân | 3 / 1 / 3 |
| `int-invalid` | int() không đổi được chuỗi có dấu chấm hay chữ cái | 4 / 1 / 1 |

## Chủ đề 5: Định dạng đầu ra (`s2.dinh-dang`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s2.dinh-dang.l1` | Chuỗi f | Dùng chuỗi f (chữ f trước dấu nháy, tên biến trong ngoặc nhọn) để in chữ cùng với giá trị của biến | 4 |
| `s2.dinh-dang.l2` | Tính toán trong chuỗi f | Đặt phép tính vào ngoặc nhọn, và biết phần nằm ngoài ngoặc được in y nguyên | 3 |
| `s2.dinh-dang.l3` | Làm tròn với round() | Làm tròn bằng `round()`, giữ đúng số chữ số sau dấu chấm, và biết Python chọn số chẵn khi số nằm đúng giữa | 4 |
| `s2.dinh-dang.l4` | In đúng 2 chữ số thập phân | Dùng `:.2f` để luôn in đủ 2 chữ số sau dấu chấm, và phân biệt `:.2f` với `round()` | 3 |
| `s2.dinh-dang.l5` | In hóa đơn mua hàng | In hóa đơn gọn gàng, thẳng cột, và sửa lỗi khi quên đổi dòng nhập thành số | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 10 | 4 | |
| Câu đoán kết quả | 8 | | 8 |
| Câu trắc nghiệm | 2 | | 5 |
| Bài sắp xếp dòng | 0 | 1 | |
| Bài điền chỗ trống | 0 | 4 | |

Ngân hàng câu hỏi: 13 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 23.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `fstring-prefix` | Chuỗi f cần chữ f trước dấu nháy | 4 / 1 / 2 |
| `fstring-expression` | Phép tính trong ngoặc nhọn được tính | 6 / 1 / 3 |
| `round-digits` | round(x, n) giữ n chữ số sau dấu chấm | 3 / 1 / 3 |
| `round-half-even` | round() chọn số chẵn khi đúng ở giữa | 4 / 1 / 2 |
| `format-two-decimals` | :.2f luôn in đủ 2 chữ số sau dấu chấm | 6 / 1 / 4 |

## Tổng của giai đoạn 2

| Mục | Số lượng |
|---|---|
| Chủ đề | 5 |
| Bài học | 25 |
| Thẻ lý thuyết | 87 |
| Câu đoán kết quả và trắc nghiệm | 127 (59 câu đoán kết quả, 68 câu trắc nghiệm; 51 câu trong bài học, 76 câu trong ngân hàng) |
| Câu về AI | 6 |
| Bài viết code | 56 (41 bài trong bài học, 15 bài luyện thêm), trong đó 45 bài dùng được trong bài kiểm tra |
| Bài viết code có đọc dữ liệu nhập | 36, bài nào cũng có ít nhất 1 test ẩn |
| Bài sắp xếp dòng | 8 |
| Bài điền chỗ trống | 16 |
| Khái niệm | 25 (25 thẻ "Hiểu lầm thường gặp", 25 gợi ý cho phụ huynh) |
| Trạm ôn | 10 |
| Kiểm tra chủ đề | 5 (mỗi bài 8 câu hỏi và 2 bài viết code) |
| Kiểm tra tiến hóa cuối giai đoạn | 1 (15 câu hỏi, trong đó 3 câu về AI, và 3 bài viết code) |
| Bài luyện mức 1 (câu hỏi) | 127 câu khác nhau |
| Bài luyện mức 2 (sắp xếp dòng, điền chỗ trống) | 24 bài |
| Bài luyện mức 3 (viết code) | 55 bài |

Ở bài luyện, 1 câu có thể dùng cho 2 khái niệm, nên tổng ở các bảng chủ đề lớn hơn số câu khác nhau ở bảng này.

## Việc phụ huynh cần duyệt

Mọi lời văn đã viết xong và dùng được ngay. Bố mẹ đọc lại và sửa cho tự nhiên, dễ hiểu với con.

| Việc cần duyệt | Số lượng | Nằm ở đâu |
|---|---|---|
| Lời văn các thẻ lý thuyết | 87 thẻ trong 25 bài | Các file `content/stage-2/<chủ đề>/NN-ten-bai.md`, phần nằm sau dòng `---` thứ hai. Mỗi thẻ cách nhau bằng 1 dòng `---` |
| Thẻ "Hiểu lầm thường gặp" | 25 thẻ | Dòng `misconception_card` trong file `concepts.yaml` của mỗi chủ đề |
| Gợi ý cho phụ huynh (1 hoạt động ở nhà, không cần máy tính) | 25 gợi ý | Dòng `parent_tip` trong file `concepts.yaml` của mỗi chủ đề |

Khi sửa, xin bố mẹ nhớ:

- Chỉ sửa chữ. Không đổi các dòng `id:` và các mã như `s2.bien.l2`, vì ứng dụng dùng các mã này để lưu tiến độ của con.
- Code trong ví dụ phải chạy ra đúng như lời văn mô tả. Sửa xong, người bảo trì chạy `npm run content:validate` để máy kiểm tra lại.
- Trong code, `input()` luôn để trống ngoặc. Khi thêm ví dụ có `input()`, xin đừng viết câu hỏi vào trong ngoặc.
- Kết quả của Python có thể khác cách tính quen thuộc, như `round(2.5)` ra 2 hay `7 / 2` ra 3.5 với dấu chấm. Những chỗ này là đúng, xin giữ nguyên.
