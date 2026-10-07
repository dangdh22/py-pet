---
id: s2.dinh-dang.l5
title: { vi: "In hóa đơn mua hàng", en: "Printing a receipt" }
exercises:
  - id: s2.dinh-dang.l5.ex1
    type: code
    concepts: [format-two-decimals, fstring-expression]
    prompt:
      vi: "Robo bán trái cây và in hóa đơn cho khách. Ô Dữ liệu nhập có 3 dòng, đều là số thực: số kg khách mua, giá 1 kg và số tiền khách đưa (tính bằng nghìn đồng). Hãy đọc 3 số vào 3 biến so_kg, gia và tien_dua, rồi in ra 3 dòng như phần Ví dụ: thành tiền, số tiền khách đưa và tiền thừa. Mọi số đều có đúng 2 chữ số sau dấu chấm."
      en: "Robo sells fruit and prints a receipt for each customer. The Input data box has 3 lines, all decimal numbers: the kg the customer buys, the price of 1 kg, and the money the customer gives (in thousands of dong). Read the 3 numbers into the 3 variables so_kg, gia and tien_dua, then print the 3 lines in the Example: the total, the money given, and the change. Every number has exactly 2 digits after the dot."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so_kg = float(input())
      gia = float(input())
      tien_dua = float(input())
      thanh_tien = so_kg * gia
      print(f"Thành tiền: {thanh_tien:.2f} nghìn đồng")
      print(f"Khách đưa: {tien_dua:.2f} nghìn đồng")
      print(f"Tiền thừa: {tien_dua - thanh_tien:.2f} nghìn đồng")
    tests:
      - input: "2.5\n30\n100"
        output: |
          Thành tiền: 75.00 nghìn đồng
          Khách đưa: 100.00 nghìn đồng
          Tiền thừa: 25.00 nghìn đồng
      - input: "1.2\n45.5\n60"
        output: |
          Thành tiền: 54.60 nghìn đồng
          Khách đưa: 60.00 nghìn đồng
          Tiền thừa: 5.40 nghìn đồng
        hidden: true
    common_wrong:
      - output: |
          Thành tiền: 75.0 nghìn đồng
          Khách đưa: 100.0 nghìn đồng
          Tiền thừa: 25.0 nghìn đồng
        misconception: format-two-decimals
        sample: |
          so_kg = float(input())
          gia = float(input())
          tien_dua = float(input())
          thanh_tien = so_kg * gia
          print(f"Thành tiền: {thanh_tien} nghìn đồng")
          print(f"Khách đưa: {tien_dua} nghìn đồng")
          print(f"Tiền thừa: {tien_dua - thanh_tien} nghìn đồng")
    hints:
      - { vi: "Đọc 3 số bằng float(input()). Tính thành tiền bằng so_kg * gia, và tiền thừa bằng tien_dua trừ thành tiền. Mỗi dòng in là 1 chuỗi f, với :.2f sau mỗi số.", en: "Read the 3 numbers with float(input()). Work out the total with so_kg * gia, and the change with tien_dua minus the total. Each print line is an f-string, with :.2f after each number." }
      - { vi: "Ba dòng đầu đọc so_kg, gia và tien_dua bằng float(input()). Dòng 4 là thanh_tien = so_kg * gia. Dòng in đầu tiên là print(f\"Thành tiền: {thanh_tien:.2f} nghìn đồng\"). Hai dòng in sau làm tương tự với tien_dua và tien_dua - thanh_tien.", en: "The first 3 lines read so_kg, gia and tien_dua with float(input()). Line 4 is thanh_tien = so_kg * gia. The first print line is print(f\"Thành tiền: {thanh_tien:.2f} nghìn đồng\"). Do the other 2 print lines the same way with tien_dua and tien_dua - thanh_tien." }
    test_eligible: true
  - id: s2.dinh-dang.l5.ex2
    type: code
    concepts: [fstring-expression, format-two-decimals]
    prompt:
      vi: "Robo mua vở. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số quyển vở (số nguyên), dòng 2 là giá 1 quyển (số thực, tính bằng nghìn đồng). Hãy đọc 2 số vào 2 biến so_vo và gia, rồi in ra 1 dòng như phần Ví dụ. Giá 1 quyển và số tiền phải trả đều có đúng 2 chữ số sau dấu chấm."
      en: "Robo buys notebooks. The Input data box has 2 lines: line 1 is the number of notebooks (an integer), and line 2 is the price of 1 notebook (a decimal number, in thousands of dong). Read the 2 numbers into the 2 variables so_vo and gia, then print 1 line as in the Example. The price of 1 notebook and the total to pay both have exactly 2 digits after the dot."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so_vo = int(input())
      gia = float(input())
      print(f"{so_vo} quyển vở x {gia:.2f} = {so_vo * gia:.2f} nghìn đồng")
    tests:
      - input: "3\n12.5"
        output: "3 quyển vở x 12.50 = 37.50 nghìn đồng"
      - input: "4\n8"
        output: "4 quyển vở x 8.00 = 32.00 nghìn đồng"
        hidden: true
    common_wrong:
      - output: "3.00 quyển vở x 12.50 = 37.50 nghìn đồng"
        misconception: format-two-decimals
        sample: |
          so_vo = int(input())
          gia = float(input())
          print(f"{so_vo:.2f} quyển vở x {gia:.2f} = {so_vo * gia:.2f} nghìn đồng")
    hints:
      - { vi: "Đọc số quyển bằng int(input()) và giá bằng float(input()). Số quyển in bình thường, chỉ giá và số tiền mới cần :.2f. Phép nhân so_vo * gia đặt ngay trong ngoặc nhọn.", en: "Read the number of notebooks with int(input()) and the price with float(input()). The number of notebooks is printed as usual: only the price and the total need :.2f. Put the multiplication so_vo * gia right inside the curly brackets." }
      - { vi: "Hai dòng đầu là so_vo = int(input()) và gia = float(input()). Dòng 3 là print(f\"{so_vo} quyển vở x {gia:.2f} = {so_vo * gia:.2f} nghìn đồng\").", en: "The first 2 lines are so_vo = int(input()) and gia = float(input()). Line 3 is print(f\"{so_vo} quyển vở x {gia:.2f} = {so_vo * gia:.2f} nghìn đồng\")." }
  - id: s2.dinh-dang.l5.q1
    type: mcq
    concepts: [format-two-decimals]
    code: |
      x = input()
      print(f"{x:.2f}")
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: 2.5. Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "The Input data box has 1 line: 2.5. What happens when this code runs?"
    choices:
      - { text: "2.50", misconception: input-str }
      - { text: "2.5", misconception: format-two-decimals }
      - { vi: "Báo lỗi ValueError ở dòng 2", en: "A ValueError on line 2", correct: true, error: true }
      - { vi: "Báo lỗi ValueError ở dòng 1", en: "A ValueError on line 1", error: true, misconception: input-str }
    explanation:
      vi: "Dòng 1 đọc chuỗi \"2.5\" mà không có lỗi, vì input() đọc được mọi dòng. Nhưng x vẫn là chuỗi, mà :.2f chỉ dùng được với số. Vì vậy Python báo lỗi ValueError ở dòng 2. Con sửa bằng cách đọc x = float(input())."
      en: "Line 1 reads the string \"2.5\" with no error, because input() can read any line. But x is still a string, and :.2f only works with numbers. So Python shows a ValueError on line 2. Fix it by reading x = float(input())."
  - id: s2.dinh-dang.l5.q2
    type: predict
    concepts: [fstring-expression, format-two-decimals]
    code: |
      n = 3
      p = 2.5
      print(f"{n} x {p:.2f} = {n * p:.2f}")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "3 x 2.5 = 7.5", misconception: format-two-decimals }
      - { text: "3 x 2.50 = 7.50", correct: true }
      - { text: "3.00 x 2.50 = 7.50", misconception: format-two-decimals }
      - { text: "3 x 2.50 = 3 x 2.50", misconception: fstring-expression }
    explanation:
      vi: "{n} không có :.2f, nên in bình thường là 3. {p:.2f} in 2.5 thành 2.50. {n * p:.2f} tính 3 * 2.5 ra 7.5, rồi in thành 7.50. Dấu x và dấu = nằm ngoài ngoặc nhọn, nên được in y nguyên."
      en: "{n} has no :.2f, so it prints as usual: 3. {p:.2f} prints 2.5 as 2.50. {n * p:.2f} works out 3 * 2.5 as 7.5, then prints it as 7.50. The x and = signs are outside the curly brackets, so they are printed as they are."
---
Robo mở 1 sạp trái cây và cần in **hóa đơn** cho khách. Khách cho biết số kg muốn mua, còn Robo biết giá 1 kg (tính bằng nghìn đồng). Trước khi viết code, con lên kế hoạch:

1. Đọc 2 số bằng `float(input())`, vì số kg và giá có thể có phần thập phân.
2. Tính thành tiền: số kg nhân giá 1 kg.
3. In mỗi dòng bằng chuỗi f, với `:.2f` sau mỗi số.

Với 2 dòng 2.5 và 30 trong ô Dữ liệu nhập, chương trình chạy giống đoạn code dưới đây:

```python run
so_kg = float("2.5")  # dòng 1 con gõ
gia = float("30")     # dòng 2 con gõ
print("HÓA ĐƠN CỦA ROBO")
print(f"Số kg: {so_kg:.2f}")
print(f"Giá 1 kg: {gia:.2f} nghìn đồng")
print(f"Thành tiền: {so_kg * gia:.2f} nghìn đồng")
```

Thành tiền 75.00 nghìn đồng nghĩa là 75 nghìn đồng chẵn.
---
Hóa đơn dễ đọc hơn khi các số **thẳng cột**. Con thêm dấu cách vào phần chữ, để mọi số bắt đầu ở cùng 1 chỗ. Nhãn nào ngắn hơn thì thêm nhiều dấu cách hơn:

```python run
so_kg = 2.5
gia = 30
print("-" * 20)
print(f"Số kg:      {so_kg:.2f}")
print(f"Giá 1 kg:   {gia:.2f}")
print(f"Thành tiền: {so_kg * gia:.2f}")
print("-" * 20)
```

Nhãn "Thành tiền:" dài nhất, có 11 ký tự, kể cả dấu hai chấm. Các nhãn ngắn hơn được thêm dấu cách cho đủ 11 ký tự, rồi thêm 1 dấu cách nữa trước số. Dòng `print("-" * 20)` lặp lại dấu gạch 20 lần, như con đã học ở giai đoạn 1.
---
Nếu con quên đổi dòng nhập thành số, biến vẫn chứa chuỗi. Khi đó `:.2f` không dùng được, và Python báo lỗi **ValueError**. Bấm Chạy thử để xem:

```python run expect-error
gia = "30"  # giống như con gõ 30 mà quên float()
print(f"Giá: {gia:.2f}")
```

Lời báo lỗi là Unknown format code 'f' for object of type 'str'. Câu này nghĩa là không in được theo kiểu f (số thực) cho 1 giá trị kiểu str (chuỗi). Cách sửa: đọc bằng `gia = float(input())`, để biến chứa số.
