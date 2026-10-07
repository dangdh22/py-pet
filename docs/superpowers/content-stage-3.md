# Nội dung giai đoạn 3 "Rẽ nhánh": bảng tổng hợp để phụ huynh duyệt

Cập nhật: 2026-10-07. Các con số trong file này được đếm bằng máy từ nội dung của ứng dụng, không đếm tay.

Giai đoạn 3 dạy con viết chương trình biết tự quyết định: so sánh 2 giá trị, rồi chọn việc cần làm bằng `if`, `else` và `elif`, nối nhiều điều kiện bằng `and`, `or`, `not`, và giải vài bài toán quen thuộc như số chẵn, số lớn nhất, năm nhuận. Con vẫn chưa học vòng lặp, danh sách hay hàm tự viết.

## Cách đọc bảng

| Từ trong bảng | Nghĩa |
|---|---|
| Bài học | 1 bài ngắn (5 đến 10 phút), gồm vài thẻ lý thuyết rồi vài bài tập |
| Thẻ lý thuyết | 1 màn hình giải thích 1 ý, có ví dụ để con bấm Chạy thử |
| Bài viết code | Con tự viết hoặc sửa code để in ra đúng kết quả |
| Câu đoán kết quả | Con đọc 1 đoạn code rồi chọn kết quả nó in ra (4 lựa chọn) |
| Câu trắc nghiệm | Câu hỏi 4 lựa chọn về kiến thức hoặc về cách viết code |
| Bài sắp xếp dòng | Con xếp các dòng code bị xáo trộn theo đúng thứ tự (ở giai đoạn này, dòng nào cũng giữ sẵn phần thụt lề của nó) |
| Bài điền chỗ trống | Con điền 1 đến 3 chỗ trống trong code |
| Ngân hàng câu hỏi | Các câu hỏi thêm, dùng cho trạm ôn và bài kiểm tra |
| Trạm ôn | Chặng ôn 5 câu, mở ra sau 2 đến 3 bài học |
| Kiểm tra chủ đề | Bài kiểm tra cuối mỗi chủ đề: 8 câu hỏi và 2 bài viết code |
| Khái niệm | 1 ý quan trọng mà con hay hiểu nhầm. Mỗi khái niệm có 1 thẻ "Hiểu lầm thường gặp", 1 gợi ý cho phụ huynh, và bài luyện 3 mức |
| Bài luyện mức 1, 2, 3 | Khi con hay sai 1 khái niệm, ứng dụng cho con luyện thêm: mức 1 là câu hỏi, mức 2 là bài sắp xếp dòng hoặc điền chỗ trống, mức 3 là bài viết code |
| Ô Dữ liệu nhập | Ô nằm dưới chỗ viết code. Con gõ vào đây những gì người dùng sẽ gõ cho chương trình, mỗi giá trị 1 dòng |
| Test ẩn | Khi con nộp bài có dữ liệu nhập, ứng dụng chấm thêm với dữ liệu khác mà con không thấy trước, để con không in sẵn đáp án |
| Nhánh | 1 khối lệnh chỉ chạy trong 1 trường hợp, như khối của `if` hay khối của `else` |
| Ranh giới | Con số nằm ngay chỗ câu trả lời đổi, như 5 điểm khi luật là "từ 5 điểm trở lên là Đạt" |

## Điểm mới ở giai đoạn 3 mà bố mẹ nên biết

| Điểm mới | Giải thích |
|---|---|
| Thụt lề là 1 phần của code | Các dòng nằm trong `if` phải lùi vào đúng 4 dấu cách. Với `if` nằm trong `if`, dòng bên trong lùi vào 8 dấu cách. Thụt lề sai làm chương trình báo lỗi hoặc chạy sai, nên khi sửa ví dụ, xin giữ nguyên các dấu cách ở đầu dòng |
| Dấu `=` và dấu `==` khác nhau | `=` cất 1 giá trị vào biến, còn `==` hỏi 2 giá trị có bằng nhau không. Đây là lỗi con hay gặp nhất ở giai đoạn này |
| `True` và `False` viết hoa chữ đầu | Viết `true` hay `TRUE` là sai, Python báo lỗi |
| `"10" < "9"` ra True | Khi 2 số còn là chữ (chưa đổi bằng `int()`), Python so từng ký tự như xếp tên trong từ điển, nên "10" đứng trước "9". Kết quả này đúng với Python, xin bố mẹ đừng sửa |
| `n == 1 or 2` luôn đúng | Cách viết giống lời nói này làm điều kiện luôn đúng, dù n là số nào. Bài học dạy con viết đủ `n == 1 or n == 2`. Kết quả "luôn đúng" là đúng với Python |
| Con phải tự thử ở ranh giới | Bài học dạy con thử chương trình với số đúng ở ranh giới, như 20 khi luật là "dưới 20". Khi chấm bài, ứng dụng cũng thử ở mọi nhánh và mọi ranh giới, kể cả bằng test ẩn |
| Lời báo lỗi bằng tiếng Anh | Bài học trích nguyên lời báo lỗi của Python, như `SyntaxError: expected ':'`, rồi giải thích nghĩa bằng tiếng Việt. Xin giữ nguyên phần tiếng Anh vì con sẽ thấy đúng câu đó trên màn hình |
| Chưa dùng `max()` | Bài "Số lớn nhất" cố ý dùng `if` để con luyện so sánh. Xin đừng thêm `max()` hay `min()` vào ví dụ |

## Chủ đề 1: So sánh và bool (`s3.so-sanh`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s3.so-sanh.l1` | Phép so sánh | Dùng `> < >= <=` để so sánh số và biến, biết mỗi phép so sánh chỉ cho ra True (đúng) hoặc False (sai) | 4 |
| `s3.so-sanh.l2` | Bằng == và khác != | Dùng `==` để hỏi bằng nhau và `!=` để hỏi khác nhau, phân biệt `==` với dấu `=` của lệnh gán | 4 |
| `s3.so-sanh.l3` | So sánh chuỗi | So sánh chuỗi bằng `==` (chữ hoa, chữ thường và dấu cách đều phải giống hệt), biết chuỗi chữ số được so từng ký tự nên phải đổi bằng `int()` trước khi so sánh số | 4 |
| `s3.so-sanh.l4` | Kiểu bool | Biết True và False là kiểu dữ liệu bool, viết hoa chữ đầu, không có dấu nháy, và cất được kết quả so sánh vào biến | 4 |
| `s3.so-sanh.l5` | Quy tắc cố định và học từ dữ liệu | Hiểu chương trình làm theo quy tắc do người viết, còn AI tự tìm ra quy tắc từ rất nhiều ví dụ có nhãn và vẫn có thể sai | 2 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 3 | |
| Câu đoán kết quả | 5 | | 10 |
| Câu trắc nghiệm | 5 | | 10 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 3 | |

Ngân hàng câu hỏi: 20 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 30, trong đó 5 câu về AI.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `compare-ops` | Phép so sánh cho ra True hoặc False | 7 / 1 / 4 |
| `eq-vs-assign` | Dấu == để hỏi bằng nhau, dấu = để gán | 5 / 1 / 3 |
| `str-equality` | So sánh chuỗi phân biệt chữ hoa, chữ thường và dấu cách | 4 / 1 / 2 |
| `compare-str-num` | Chuỗi chữ số được so sánh theo từng ký tự, không như số | 5 / 1 / 2 |
| `bool-value` | True và False viết hoa chữ đầu, có kiểu bool | 5 / 2 / 2 |
| `ai-rules-vs-data` | Quy tắc cố định và học từ dữ liệu (khái niệm AI: chỉ có câu hỏi, không có bài code) | 5 / 0 / 0 |

## Chủ đề 2: if và else (`s3.if-else`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s3.if-else.l1` | Lệnh if | Viết `if điều_kiện:` với dấu hai chấm ở cuối, biết khối lệnh thụt lề bên dưới chỉ chạy khi điều kiện đúng | 4 |
| `s3.if-else.l2` | Khối lệnh và thụt lề | Biết mọi dòng thụt lề cùng 4 dấu cách thuộc 1 khối lệnh, dòng sát lề trái sau khối luôn chạy, và nhận ra lỗi thiếu thụt lề hay thụt lề lệch | 4 |
| `s3.if-else.l3` | Nhánh else | Dùng `else:` (không có điều kiện) cho trường hợp điều kiện sai, biết mỗi lần chạy chỉ đúng 1 trong 2 nhánh chạy | 3 |
| `s3.if-else.l4` | Điều kiện từ dữ liệu nhập | Đổi số nhập bằng `int(input())` trước khi so sánh, còn câu trả lời bằng chữ thì so sánh luôn với 1 chuỗi | 4 |
| `s3.if-else.l5` | Robo quyết định | Giải bài toán theo 3 bước: đọc dữ liệu, so sánh bằng `if`, in câu trả lời ở mỗi nhánh; thử cả số ở ranh giới | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 11 | 3 | |
| Câu đoán kết quả | 5 | | 7 |
| Câu trắc nghiệm | 4 | | 7 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 3 | |

Ngân hàng câu hỏi: 14 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 23.

Ở chủ đề này và các chủ đề sau, nhiều câu hỏi cho biết ô Dữ liệu nhập có gì rồi hỏi kết quả, hoặc hỏi cách sửa 1 đoạn code, nên được xếp vào loại câu trắc nghiệm.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `if-colon` | Dòng if kết thúc bằng dấu hai chấm | 5 / 1 / 3 |
| `indent-block` | Khối lệnh thụt lề 4 dấu cách | 4 / 1 / 3 |
| `after-block` | Dòng sát lề trái sau khối lệnh luôn chạy | 6 / 2 / 2 |
| `else-branch` | else không có điều kiện, chạy khi điều kiện sai | 8 / 2 / 8 |
| `convert-before-compare` | Đổi số nhập bằng int() trước khi so sánh | 5 / 1 / 4 |

## Chủ đề 3: Nhiều nhánh với elif (`s3.elif`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s3.elif.l1` | Lệnh elif | Viết chuỗi `if`, `elif`, `else` khi có từ 3 trường hợp trở lên; biết mỗi `elif` có điều kiện riêng, `else` đứng cuối, và chỉ 1 nhánh chạy | 4 |
| `s3.elif.l2` | Thứ tự điều kiện | Biết Python thử từ trên xuống và dừng ở điều kiện đúng đầu tiên, nên phải xếp điều kiện đúng thứ tự (với `>=` thì số lớn trước) | 3 |
| `s3.elif.l3` | Xếp loại điểm | Viết chương trình xếp loại Giỏi, Khá, Trung bình, Cần cố gắng; đọc kỹ "từ", "trên", "dưới", "không quá" để chọn dấu, và thử ở mọi ranh giới | 4 |
| `s3.elif.l4` | elif hay nhiều if? | Phân biệt chuỗi `elif` (chỉ 1 câu trả lời) với nhiều lệnh `if` riêng (nhiều câu trả lời có thể cùng đúng), và chọn cách hợp với bài toán | 3 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 3 | |
| Câu đoán kết quả | 4 | | 6 |
| Câu trắc nghiệm | 4 | | 7 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 2 | |

Ngân hàng câu hỏi: 13 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 21.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `elif-chain` | Chỉ 1 nhánh của chuỗi if, elif, else được chạy | 7 / 2 / 5 |
| `condition-order` | Điều kiện đúng đầu tiên thắng | 5 / 1 / 4 |
| `boundary-check` | Ranh giới: chọn >= hay > | 6 / 1 / 3 |
| `elif-vs-if` | Nhiều lệnh if riêng có thể cùng chạy | 6 / 1 / 3 |

## Chủ đề 4: and, or, not (`s3.logic`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s3.logic.l1` | Cả hai đều đúng: and | Nối 2 điều kiện bằng `and`, biết `and` chỉ đúng khi cả 2 điều kiện đều đúng, và dùng biến bool ngay sau `if` | 3 |
| `s3.logic.l2` | Một trong hai đúng: or | Nối 2 điều kiện bằng `or`, biết `or` đúng khi ít nhất 1 điều kiện đúng, và viết đủ `n == 1 or n == 2` thay vì `n == 1 or 2` | 4 |
| `s3.logic.l3` | Đảo ngược: not | Dùng `not` để đổi True thành False và ngược lại, như `if not troi_mua:`; biết `not a == b` giống `a != b` | 3 |
| `s3.logic.l4` | Kết hợp điều kiện | Viết khoảng giá trị như `20 <= nhiet_do <= 30`, hỏi "nằm ngoài khoảng" bằng `or`, và đặt ngoặc khi có cả `and` lẫn `or` | 4 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 3 | |
| Câu đoán kết quả | 5 | | 7 |
| Câu trắc nghiệm | 3 | | 7 |
| Bài sắp xếp dòng | 0 | 1 | |
| Bài điền chỗ trống | 0 | 3 | |

Ngân hàng câu hỏi: 14 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 22.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `and-both` | and đúng khi cả 2 điều kiện đều đúng | 7 / 1 / 4 |
| `or-either` | or đúng khi ít nhất 1 điều kiện đúng | 5 / 1 / 4 |
| `or-misuse` | Viết đủ phép so sánh ở 2 bên or | 3 / 1 / 2 |
| `not-flip` | not đảo True thành False và ngược lại | 5 / 1 / 3 |
| `chained-compare` | Khoảng giá trị: a <= x <= b | 4 / 1 / 2 |

## Chủ đề 5: Bài toán điều kiện (`s3.bai-toan`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s3.bai-toan.l1` | Chẵn hay lẻ? | Hỏi "chia hết cho k" bằng `n % k == 0` và "không chia hết" bằng `n % k != 0`; giải trò chơi Bùm Chíu | 3 |
| `s3.bai-toan.l2` | Số lớn nhất | Tìm số lớn nhất của 2 rồi 3 số bằng `if` (không dùng `max()`), bằng chuỗi `if`, `elif` hoặc bằng biến `lon_nhat` cập nhật dần; thử cả khi các số bằng nhau | 4 |
| `s3.bai-toan.l3` | Năm nhuận | Viết quy tắc năm nhuận đầy đủ của dương lịch và thử với 4 năm 2024, 2023, 1900, 2000 | 3 |
| `s3.bai-toan.l4` | if lồng nhau | Đặt 1 lệnh `if` bên trong 1 lệnh `if` khác (thụt lề 8 dấu cách), biết mỗi `else` đi với lệnh `if` thẳng hàng với nó, và khi nào dùng `and` cho gọn | 4 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 3 | |
| Câu đoán kết quả | 4 | | 8 |
| Câu trắc nghiệm | 4 | | 5 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 2 | |

Ngân hàng câu hỏi: 13 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 21.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `divisible-check` | Chia hết: n % k == 0 | 6 / 1 / 4 |
| `max-by-compare` | Tìm số lớn nhất bằng phép so sánh | 5 / 1 / 3 |
| `leap-year-rule` | Quy tắc năm nhuận | 6 / 1 / 2 |
| `nested-if` | if lồng nhau và thụt lề 8 dấu cách | 5 / 1 / 3 |

## Tổng của giai đoạn 3

| Mục | Số lượng |
|---|---|
| Chủ đề | 5 |
| Bài học | 22 |
| Thẻ lý thuyết | 78 |
| Câu đoán kết quả và trắc nghiệm | 117 (61 câu đoán kết quả, 56 câu trắc nghiệm; 43 câu trong bài học, 74 câu trong ngân hàng) |
| Câu về AI | 5 |
| Bài viết code | 58 (43 bài trong bài học, 15 bài luyện thêm), bài nào cũng dùng được trong bài kiểm tra |
| Bài viết code có đọc dữ liệu nhập | 58, bài nào cũng có ít nhất 1 test ẩn và có test cho mọi nhánh |
| Bài sắp xếp dòng | 9 |
| Bài điền chỗ trống | 13 |
| Khái niệm | 24 (24 thẻ "Hiểu lầm thường gặp", 24 gợi ý cho phụ huynh) |
| Trạm ôn | 10 |
| Kiểm tra chủ đề | 5 (mỗi bài 8 câu hỏi và 2 bài viết code) |
| Kiểm tra tiến hóa cuối giai đoạn | 1 (15 câu hỏi, trong đó 3 câu về AI, và 3 bài viết code) |
| Bài luyện mức 1 (câu hỏi) | 117 câu khác nhau |
| Bài luyện mức 2 (sắp xếp dòng, điền chỗ trống) | 22 bài |
| Bài luyện mức 3 (viết code) | 58 bài |

Ở bài luyện, 1 câu có thể dùng cho 2 khái niệm, nên tổng ở các bảng chủ đề lớn hơn số câu khác nhau ở bảng này.

## Việc phụ huynh cần duyệt

Mọi lời văn đã viết xong và dùng được ngay. Bố mẹ đọc lại và sửa cho tự nhiên, dễ hiểu với con.

| Việc cần duyệt | Số lượng | Nằm ở đâu |
|---|---|---|
| Lời văn các thẻ lý thuyết | 78 thẻ trong 22 bài | Các file `content/stage-3/<chủ đề>/NN-ten-bai.md`, phần nằm sau dòng `---` thứ hai. Mỗi thẻ cách nhau bằng 1 dòng `---` |
| Thẻ "Hiểu lầm thường gặp" | 24 thẻ | Dòng `misconception_card` trong file `concepts.yaml` của mỗi chủ đề |
| Gợi ý cho phụ huynh (1 hoạt động ở nhà, không cần máy tính) | 24 gợi ý | Dòng `parent_tip` trong file `concepts.yaml` của mỗi chủ đề |

Khi sửa, xin bố mẹ nhớ:

- Chỉ sửa chữ. Không đổi các dòng `id:` và các mã như `s3.elif.l2`, vì ứng dụng dùng các mã này để lưu tiến độ của con.
- Code trong ví dụ phải chạy ra đúng như lời văn mô tả. Sửa xong, người bảo trì chạy `npm run content:validate` để máy kiểm tra lại.
- Giữ nguyên các dấu cách ở đầu dòng code: 4 dấu cách cho mỗi mức thụt lề. Thêm hay bớt dấu cách có thể làm ví dụ báo lỗi hoặc chạy sai.
- Trong code, `input()` luôn để trống ngoặc. Khi thêm ví dụ có `input()`, xin đừng viết câu hỏi vào trong ngoặc.
- Ở giai đoạn này, con chưa học vòng lặp, danh sách, hàm tự viết, `max()` và `min()`. Xin đừng thêm các phần này vào ví dụ, kể cả nhắc tên.
- Kết quả của Python có thể khác cách nghĩ quen thuộc, như `"10" < "9"` ra True hay `n == 1 or 2` luôn đúng. Những chỗ này là đúng, xin giữ nguyên.
