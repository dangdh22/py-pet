# Nội dung giai đoạn 4 "Vòng lặp": bảng tổng hợp để phụ huynh duyệt

Cập nhật: 2026-10-07. Các con số trong file này được đếm bằng máy từ nội dung của ứng dụng, không đếm tay.

Giai đoạn 4 dạy con bảo máy tính làm 1 việc nhiều lần: lặp đúng số lần bằng `for` và `range`, lặp đến khi 1 điều kiện sai bằng `while`, cộng dồn và đếm trong vòng lặp, vẽ hình bằng dấu `*` với vòng lặp lồng nhau, và giải các bài toán về chữ số, ước số, số nguyên tố với `break` và `continue`. Con vẫn chưa học danh sách hay hàm tự viết.

## Cách đọc bảng

| Từ trong bảng | Nghĩa |
|---|---|
| Bài học | 1 bài ngắn (5 đến 10 phút), gồm vài thẻ lý thuyết rồi vài bài tập |
| Thẻ lý thuyết | 1 màn hình giải thích 1 ý, có ví dụ để con bấm Chạy thử |
| Bài viết code | Con tự viết hoặc sửa code để in ra đúng kết quả |
| Câu đoán kết quả | Con đọc 1 đoạn code rồi chọn kết quả nó in ra (4 lựa chọn) |
| Câu trắc nghiệm | Câu hỏi 4 lựa chọn về kiến thức hoặc về cách viết code |
| Bài sắp xếp dòng | Con xếp các dòng code bị xáo trộn theo đúng thứ tự (dòng nào cũng giữ sẵn phần thụt lề của nó) |
| Bài điền chỗ trống | Con điền 1 đến 3 chỗ trống trong code |
| Ngân hàng câu hỏi | Các câu hỏi thêm, dùng cho trạm ôn và bài kiểm tra |
| Trạm ôn | Chặng ôn 5 câu, mở ra sau 2 đến 3 bài học |
| Kiểm tra chủ đề | Bài kiểm tra cuối mỗi chủ đề: 8 câu hỏi và 2 bài viết code |
| Khái niệm | 1 ý quan trọng mà con hay hiểu nhầm. Mỗi khái niệm có 1 thẻ "Hiểu lầm thường gặp", 1 gợi ý cho phụ huynh, và bài luyện 3 mức |
| Bài luyện mức 1, 2, 3 | Khi con hay sai 1 khái niệm, ứng dụng cho con luyện thêm: mức 1 là câu hỏi, mức 2 là bài sắp xếp dòng hoặc điền chỗ trống, mức 3 là bài viết code |
| Ô Dữ liệu nhập | Ô nằm dưới chỗ viết code. Con gõ vào đây những gì người dùng sẽ gõ cho chương trình, mỗi giá trị 1 dòng |
| Test ẩn | Khi con nộp bài, ứng dụng chấm thêm với dữ liệu khác mà con không thấy trước, để con không in sẵn đáp án |
| Vòng lặp | Đoạn code làm đi làm lại 1 khối lệnh, viết bằng `for` hoặc `while` |
| Lần lặp | 1 lần khối lệnh của vòng lặp được chạy. `for i in range(3):` có 3 lần lặp |
| Biến của vòng lặp | Biến như `i` trong `for i in range(3):`. Mỗi lần lặp, `for` tự cho nó 1 giá trị mới: 0, rồi 1, rồi 2 |
| Biến đếm | Biến bắt đầu từ 0 và cộng thêm 1 mỗi khi gặp 1 thứ cần đếm, như `dem += 1` |
| Biến tích lũy | Biến cộng dồn qua các lần lặp, như tổng điểm. Biến đếm là 1 biến tích lũy |
| Vòng ngoài, vòng trong | Khi 1 vòng lặp nằm trong 1 vòng lặp khác (vòng lặp lồng nhau), vòng bên ngoài là vòng ngoài, vòng bên trong là vòng trong |

## Điểm mới ở giai đoạn 4 mà bố mẹ nên biết

| Điểm mới | Giải thích |
|---|---|
| Thụt lề quyết định dòng nào được lặp lại | Mọi dòng thụt lề 4 dấu cách dưới dòng `for` hay `while` được lặp lại; dòng sát lề trái chỉ chạy 1 lần, sau vòng lặp. Với vòng lặp lồng nhau, dòng của vòng trong thụt lề 8 dấu cách. Khi sửa ví dụ, xin giữ nguyên các dấu cách ở đầu dòng |
| `range(5)` cho 0, 1, 2, 3, 4 | `range` bắt đầu từ 0 và dừng trước số cuối, nên không có số 5, nhưng vẫn đủ 5 số. Muốn có 1 đến 5, con viết `range(1, 6)`. Kết quả này đúng với Python, xin bố mẹ đừng sửa |
| Vòng lặp không bao giờ dừng | Nếu điều kiện của `while` đúng mãi, vòng lặp chạy không dừng. Py-Pet tự dừng chương trình sau khoảng 2 giây, hoặc ngay khi chương trình in ra quá nhiều, rồi giải thích cho con. Máy tính không bị hỏng gì |
| Con phải thử 0 lần, 1 lần và nhiều lần lặp | Bài học dạy con thử chương trình với n bằng 0 (vòng lặp không chạy lần nào), n bằng 1, và n lớn hơn. Khi chấm bài, ứng dụng cũng thử cả 3 trường hợp này khi đề cho phép, kể cả bằng test ẩn |
| Viết gọn `tong += so` | `tong += so` nghĩa là `tong = tong + so`. Dấu `+` đứng trước dấu `=`. Viết ngược thành `=+` thì Python không báo lỗi nhưng tính sai |
| Dấu cách ở đầu dòng được tính khi vẽ hình | Khi chấm bài vẽ hình, ứng dụng so sánh cả dấu cách ở đầu dòng (kim tự tháp có dấu cách ở đầu, và đề nói rõ điều này), nhưng bỏ qua dấu cách ở cuối dòng |
| Chưa dùng `sum()`, `max()`, `min()`, `len()` | Các bài tính tổng, tìm số lớn nhất, đếm ký tự cố ý dùng vòng lặp và biến tích lũy để con luyện cách nghĩ. Xin đừng thêm các lệnh này vào ví dụ, kể cả nhắc tên |
| `break` và `continue` chỉ dùng trong vòng lặp | `break` thoát khỏi vòng lặp gần nhất, `continue` bỏ qua phần còn lại của 1 lần lặp. Viết chúng ngoài vòng lặp thì Python báo lỗi `SyntaxError: 'break' outside loop` |
| 1 không phải là số nguyên tố | Số nguyên tố là số lớn hơn 1 chỉ có 2 ước: 1 và chính nó. Đây là quy định của toán học, và chương trình của con phải xử lý riêng số 1 |
| Lời báo lỗi bằng tiếng Anh | Bài học trích nguyên lời báo lỗi của Python, như `NameError: name 'tong' is not defined` hay `ZeroDivisionError`, rồi giải thích nghĩa bằng tiếng Việt. Xin giữ nguyên phần tiếng Anh vì con sẽ thấy đúng câu đó trên màn hình |

## Chủ đề 1: for và range (`s4.for-range`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s4.for-range.l1` | Lặp lại với for | Viết `for i in range(3):` với dấu hai chấm ở cuối, biết cả khối thụt lề được lặp lại và dòng sát lề trái chỉ chạy 1 lần, sau vòng lặp | 4 |
| `s4.for-range.l2` | range(n) đếm từ 0 | Biết `range(n)` cho n số từ 0 đến n - 1, `range(0)` không có số nào, và đọc n từ ô Dữ liệu nhập | 3 |
| `s4.for-range.l3` | range(a, b) và bước nhảy | Dùng `range(a, b)` để bắt đầu từ a, thêm bước nhảy như `range(0, 11, 2)`, và đếm ngược bằng bước nhảy âm như `range(10, 0, -1)` | 4 |
| `s4.for-range.l4` | Dùng i trong phép tính | Dùng biến của vòng lặp trong phép tính, như in bảng nhân, và in `i + 1` để đếm từ 1 | 3 |
| `s4.for-range.l5` | for qua từng ký tự | Cho `for` đi qua từng ký tự của 1 chuỗi (kể cả dấu cách), và đếm ký tự bằng 1 biến đếm | 3 |
| `s4.for-range.l6` | Học có giám sát và không giám sát | Hiểu AI học có giám sát từ ví dụ có nhãn, còn AI học không giám sát tự xếp những thứ giống nhau vào nhóm, rồi người đặt tên cho nhóm | 2 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 9 | 4 | |
| Câu đoán kết quả | 5 | | 6 |
| Câu trắc nghiệm | 7 | | 10 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 5 | |

Ngân hàng câu hỏi: 16 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 28, trong đó 6 câu về AI.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `for-repeat` | Vòng lặp for lặp lại cả khối lệnh thụt lề | 6 / 1 / 4 |
| `range-stop-excluded` | range không có số dừng | 6 / 1 / 4 |
| `range-start-step` | Số bắt đầu và bước nhảy của range | 6 / 2 / 3 |
| `loop-variable` | Biến của vòng lặp đổi giá trị mỗi lần lặp | 4 / 1 / 4 |
| `for-over-string` | for đi qua từng ký tự của chuỗi | 4 / 2 / 3 |
| `ai-supervised` | Học có giám sát và không giám sát (khái niệm AI: chỉ có câu hỏi, không có bài code) | 6 / 0 / 0 |

## Chủ đề 2: Vòng lặp while (`s4.while`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s4.while.l1` | Lặp khi điều kiện còn đúng | Viết `while điều_kiện:`, biết Python kiểm tra điều kiện trước mỗi lần lặp, và khối lệnh không chạy lần nào nếu điều kiện sai ngay từ đầu | 4 |
| `s4.while.l2` | Vòng lặp không dừng | Biết mỗi lần lặp phải thay đổi biến trong điều kiện, nếu không vòng lặp chạy mãi; biết Py-Pet tự dừng chương trình và cách sửa | 3 |
| `s4.while.l3` | Nhập đến khi gặp 0 | Đọc các số đến khi gặp 0: đọc số đầu tiên trước vòng lặp, đọc số tiếp theo ở cuối khối lệnh, và không xử lý số 0 | 3 |
| `s4.while.l4` | while hay for? | Chọn `for` khi biết trước số lần lặp, `while` khi chỉ biết lúc nào dừng; viết lại 1 vòng lặp `for` bằng `while`, và tránh lặp thừa hoặc thiếu 1 lần | 3 |
| `s4.while.l5` | Heo đất của Robo | Đếm số tuần tiết kiệm đến khi đủ tiền, chọn đúng `<` hay `<=`, và thử khi đã có sẵn đủ tiền (0 lần lặp) | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 8 | 3 | |
| Câu đoán kết quả | 2 | | 4 |
| Câu trắc nghiệm | 7 | | 9 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 5 | |

Ngân hàng câu hỏi: 13 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 22.

Ở chủ đề này và các chủ đề sau, nhiều câu hỏi cho biết ô Dữ liệu nhập có gì rồi hỏi kết quả, hoặc hỏi cách sửa 1 đoạn code, nên được xếp vào loại câu trắc nghiệm.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `while-check-first` | while kiểm tra điều kiện trước mỗi lần lặp | 7 / 1 / 4 |
| `while-update` | Vòng lặp while phải thay đổi biến để dừng | 5 / 2 / 4 |
| `sentinel-input` | Dừng khi gặp giá trị đặc biệt | 4 / 2 / 3 |
| `while-vs-for` | Chọn while hay for | 4 / 1 / 2 |
| `off-by-one` | Lặp thừa hoặc thiếu 1 lần | 5 / 1 / 5 |

## Chủ đề 3: Tổng, đếm, lớn nhất (`s4.tong-dem`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s4.tong-dem.l1` | Cộng dồn | Tính tổng bằng 1 biến tích lũy gán giá trị ban đầu trước vòng lặp, và viết gọn bằng `tong += so` | 4 |
| `s4.tong-dem.l2` | Đếm | Đếm những lần điều kiện đúng bằng `dem += 1` nằm trong khối của `if`, kể cả đếm ký tự trong 1 chuỗi | 4 |
| `s4.tong-dem.l3` | Lớn nhất, nhỏ nhất | Tìm số lớn nhất và nhỏ nhất bằng cách bắt đầu từ số đầu tiên (không bắt đầu từ 0), rồi so sánh với từng số còn lại | 3 |
| `s4.tong-dem.l4` | Trung bình | Tính trung bình bằng tổng chia cho số lượng, và kiểm tra số lượng lớn hơn 0 trước khi chia | 4 |
| `s4.tong-dem.l5` | Đọc n số | Đọc dữ liệu dạng "dòng đầu là n, n dòng sau là các số" bằng `for`, dùng nhiều biến tích lũy trong 1 vòng lặp, và xử lý n bằng 0 | 4 |
| `s4.tong-dem.l6` | Thống kê điểm của lớp | Lên kế hoạch trước, trong và sau vòng lặp để tính trung bình, cao nhất, thấp nhất, số bạn đạt; thử với nhiều bộ dữ liệu | 4 |

Trạm ôn: sau bài 2 và sau bài 4.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 12 | 4 | |
| Câu đoán kết quả | 7 | | 8 |
| Câu trắc nghiệm | 5 | | 4 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 4 | |

Ngân hàng câu hỏi: 12 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 24.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `accumulator-init` | Gán giá trị ban đầu trước vòng lặp | 6 / 1 / 5 |
| `plus-equals` | Phép += cộng thêm vào biến | 3 / 1 / 2 |
| `count-if` | Đếm khi điều kiện đúng | 6 / 1 / 5 |
| `running-max` | Tìm lớn nhất bắt đầu từ số đầu tiên | 5 / 2 / 5 |
| `average-zero-count` | Trung bình: không chia cho 0 | 6 / 1 / 4 |

## Chủ đề 4: Vòng lặp lồng và vẽ hình (`s4.long-nhau`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s4.long-nhau.l1` | Vòng lặp trong vòng lặp | Viết 1 vòng lặp trong 1 vòng lặp khác, biết vòng trong chạy hết mỗi lần vòng ngoài chạy (3 × 4 = 12 lần, không phải 3 + 4), và đọc thụt lề 4 hay 8 dấu cách | 3 |
| `s4.long-nhau.l2` | Hình chữ nhật bằng * | Vẽ hình chữ nhật bằng `"*" * m` hoặc bằng vòng trong với `end=""`, rồi `print()` để xuống dòng đúng 1 lần sau mỗi hàng | 4 |
| `s4.long-nhau.l3` | Tam giác | Vẽ tam giác theo quy luật "hàng thứ i có i dấu `*`" với `range(1, n + 1)`, và tam giác ngược bằng bước nhảy -1 | 4 |
| `s4.long-nhau.l4` | Bảng cửu chương | In nhiều bảng nhân bằng vòng lặp lồng, thêm dòng tiêu đề và dòng trống cho mỗi bảng, và in bảng nhân dạng lưới | 3 |
| `s4.long-nhau.l5` | Kim tự tháp | Vẽ tam giác dựa lề phải và kim tự tháp với dấu cách ở đầu hàng (thử trước bằng dấu chấm), nối chuỗi bằng `+` thay vì dấu phẩy | 4 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 10 | 4 | |
| Câu đoán kết quả | 5 | | 7 |
| Câu trắc nghiệm | 5 | | 5 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 3 | |

Ngân hàng câu hỏi: 12 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 22.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `nested-inner-full` | Vòng trong chạy hết mỗi lần vòng ngoài chạy | 8 / 1 / 5 |
| `print-end-newline` | end="" và print() để xuống dòng trong vòng lặp | 6 / 1 / 3 |
| `row-col-pattern` | Hàng thứ i có i ký tự | 6 / 1 / 4 |
| `leading-spaces` | Dấu cách ở đầu hàng | 5 / 2 / 3 |

## Chủ đề 5: Chữ số, ước số, break và continue (`s4.chu-so`)

| ID bài | Tên bài | Mục tiêu | Số thẻ |
|---|---|---|---|
| `s4.chu-so.l1` | Tách từng chữ số | Tách chữ số từ phải sang trái bằng `n % 10` và `n = n // 10` trong `while n > 0:`, và xử lý riêng số 0 | 4 |
| `s4.chu-so.l2` | Tổng và số lượng chữ số | Cộng các chữ số và đếm số chữ số của 1 số, giữ số lúc đầu trong 1 biến khác vì vòng lặp làm n thành 0 | 3 |
| `s4.chu-so.l3` | Ước số | Tìm và đếm các ước của n bằng `n % i == 0` với i từ 1 đến n (`range(1, n + 1)`, không bắt đầu từ 0) | 3 |
| `s4.chu-so.l4` | Thoát vòng lặp với break | Dùng `break` để dừng ngay khi tìm thấy, tìm ước nhỏ nhất, kiểm tra số nguyên tố, và biết `break` chỉ thoát vòng lặp gần nhất | 4 |
| `s4.chu-so.l5` | Bỏ qua 1 lần lặp với continue | Dùng `continue` để bỏ qua phần còn lại của 1 lần lặp, phân biệt với `break`, và đổi biến trước `continue` trong vòng lặp `while` | 4 |
| `s4.chu-so.l6` | Bài toán số học | Tạo số đảo ngược, kiểm tra số đối xứng, và làm quen với số hoàn hảo | 3 |

Trạm ôn: sau bài 2 và sau bài 5.

| Loại bài tập | Trong bài học | Bài luyện thêm | Ngân hàng câu hỏi |
|---|---|---|---|
| Bài viết code | 12 | 6 | |
| Câu đoán kết quả | 6 | | 7 |
| Câu trắc nghiệm | 5 | | 9 |
| Bài sắp xếp dòng | 0 | 2 | |
| Bài điền chỗ trống | 0 | 4 | |

Ngân hàng câu hỏi: 16 câu. Tổng câu đoán kết quả và trắc nghiệm của chủ đề: 27.

| ID khái niệm | Tên khái niệm | Bài luyện mức 1 / 2 / 3 |
|---|---|---|
| `digit-split` | Tách chữ số bằng % 10 và // 10 | 9 / 2 / 7 |
| `divisor-loop` | Tìm ước: thử i từ 1 đến n | 5 / 1 / 5 |
| `break-nearest` | break thoát khỏi vòng lặp gần nhất | 6 / 1 / 4 |
| `continue-skip` | continue bỏ qua phần còn lại của 1 lần lặp | 4 / 1 / 3 |
| `prime-check` | Kiểm tra số nguyên tố | 3 / 1 / 2 |

## Tổng của giai đoạn 4

| Mục | Số lượng |
|---|---|
| Chủ đề | 5 |
| Bài học | 28 |
| Thẻ lý thuyết | 97 |
| Câu đoán kết quả và trắc nghiệm | 123 (57 câu đoán kết quả, 66 câu trắc nghiệm; 54 câu trong bài học, 69 câu trong ngân hàng) |
| Câu về AI | 6 |
| Bài viết code | 72 (51 bài trong bài học, 21 bài luyện thêm), bài nào cũng dùng được trong bài kiểm tra |
| Bài viết code có đọc dữ liệu nhập | 72, bài nào cũng có ít nhất 1 test ẩn, và có test cho 0, 1 và nhiều lần lặp khi đề cho phép (khi đề cố định số lần lặp, như "in 3 lần", hay nói rõ luôn có ít nhất 1 số hoặc 1 ký tự, thì không có test 0 lần) |
| Bài sắp xếp dòng | 10 |
| Bài điền chỗ trống | 21 |
| Khái niệm | 25 (25 thẻ "Hiểu lầm thường gặp", 25 gợi ý cho phụ huynh) |
| Trạm ôn | 10 |
| Kiểm tra chủ đề | 5 (mỗi bài 8 câu hỏi và 2 bài viết code) |
| Kiểm tra tiến hóa cuối giai đoạn | 1 (15 câu hỏi, trong đó 3 câu về AI, và 3 bài viết code) |
| Bài luyện mức 1 (câu hỏi) | 122 câu khác nhau |
| Bài luyện mức 2 (sắp xếp dòng, điền chỗ trống) | 31 bài |
| Bài luyện mức 3 (viết code) | 71 bài |

Ở bài luyện, 1 câu có thể dùng cho 2 khái niệm, nên tổng ở các bảng chủ đề lớn hơn số câu khác nhau ở bảng này.

## Việc phụ huynh cần duyệt

Mọi lời văn đã viết xong và dùng được ngay. Bố mẹ đọc lại và sửa cho tự nhiên, dễ hiểu với con.

| Việc cần duyệt | Số lượng | Nằm ở đâu |
|---|---|---|
| Lời văn các thẻ lý thuyết | 97 thẻ trong 28 bài | Các file `content/stage-4/<chủ đề>/NN-ten-bai.md`, phần nằm sau dòng `---` thứ hai. Mỗi thẻ cách nhau bằng 1 dòng `---` |
| Thẻ "Hiểu lầm thường gặp" | 25 thẻ | Dòng `misconception_card` trong file `concepts.yaml` của mỗi chủ đề |
| Gợi ý cho phụ huynh (1 hoạt động ở nhà, không cần máy tính) | 25 gợi ý | Dòng `parent_tip` trong file `concepts.yaml` của mỗi chủ đề |

Khi sửa, xin bố mẹ nhớ:

- Chỉ sửa chữ. Không đổi các dòng `id:` và các mã như `s4.while.l3`, vì ứng dụng dùng các mã này để lưu tiến độ của con.
- Code trong ví dụ phải chạy ra đúng như lời văn mô tả. Sửa xong, người bảo trì chạy `npm run content:validate` để máy kiểm tra lại.
- Giữ nguyên các dấu cách ở đầu dòng code: 4 dấu cách cho mỗi mức thụt lề, 8 dấu cách cho dòng nằm trong vòng trong. Thêm hay bớt dấu cách có thể làm ví dụ báo lỗi hoặc lặp sai.
- Ví dụ có `while` phải luôn dừng. Khi đổi số trong ví dụ, xin kiểm tra biến trong điều kiện vẫn tiến dần tới chỗ làm điều kiện sai.
- Giữ các từ "vòng lặp", "lần lặp", "biến đếm" như trong bài, để con gặp cùng 1 từ cho cùng 1 ý ở mọi chủ đề.
- Trong code, `input()` luôn để trống ngoặc. Khi thêm ví dụ có `input()`, xin đừng viết câu hỏi vào trong ngoặc.
- Ở giai đoạn này, con chưa học danh sách, hàm tự viết, `sum()`, `max()`, `min()` và `len()`. Xin đừng thêm các phần này vào ví dụ, kể cả nhắc tên.
- Kết quả của Python có thể khác cách nghĩ quen thuộc, như `range(5)` không có số 5, hay `range(5, 1)` không có số nào. Những chỗ này là đúng, xin giữ nguyên.
