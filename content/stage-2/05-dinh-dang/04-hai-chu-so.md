---
id: s2.dinh-dang.l4
title: { vi: "In đúng 2 chữ số thập phân", en: "Exactly 2 decimal places" }
exercises:
  - id: s2.dinh-dang.l4.ex1
    type: code
    concepts: [format-two-decimals]
    prompt:
      vi: "Robo đo chiều cao của con. Ô Dữ liệu nhập có 1 dòng: chiều cao tính bằng mét, là số thực có dấu chấm. Hãy đọc số đó vào biến chieu_cao, rồi in ra chiều cao với đúng 2 chữ số sau dấu chấm, như phần Ví dụ."
      en: "Robo measures your height. The Input data box has 1 line: the height in metres, a decimal number with a dot. Read the number into the variable chieu_cao, then print the height with exactly 2 digits after the dot, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      chieu_cao = float(input())
      print(f"Chiều cao: {chieu_cao:.2f} m")
    tests:
      - input: "1.4"
        output: "Chiều cao: 1.40 m"
      - input: "1.456"
        output: "Chiều cao: 1.46 m"
        hidden: true
    common_wrong:
      - output: "Chiều cao: 1.4 m"
        misconception: format-two-decimals
        sample: |
          chieu_cao = float(input())
          print(f"Chiều cao: {round(chieu_cao, 2)} m")
    hints:
      - { vi: "Đọc chiều cao bằng float(input()). round() không thêm số 0 vào cuối, nên con dùng :.2f ngay sau tên biến, bên trong ngoặc nhọn.", en: "Read the height with float(input()). round() does not add a 0 at the end, so use :.2f right after the variable name, inside the curly brackets." }
      - { vi: "Dòng 1 là chieu_cao = float(input()). Dòng 2 là print(f\"Chiều cao: {chieu_cao:.2f} m\").", en: "Line 1 is chieu_cao = float(input()). Line 2 is print(f\"Chiều cao: {chieu_cao:.2f} m\")." }
    test_eligible: true
  - id: s2.dinh-dang.l4.ex2
    type: code
    concepts: [format-two-decimals, fstring-expression]
    prompt:
      vi: "Robo rót đều nước từ 1 bình vào 3 cốc. Ô Dữ liệu nhập có 1 dòng: số lít nước trong bình, là số nguyên. Hãy đọc số đó vào biến lit, rồi in ra số lít nước trong mỗi cốc, với đúng 2 chữ số sau dấu chấm, như phần Ví dụ."
      en: "Robo pours the water from 1 jug equally into 3 cups. The Input data box has 1 line: the litres of water in the jug, an integer. Read the number into the variable lit, then print the litres of water in each cup, with exactly 2 digits after the dot, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      lit = int(input())
      print(f"Mỗi cốc: {lit / 3:.2f} lít")
    tests:
      - input: "2"
        output: "Mỗi cốc: 0.67 lít"
      - input: "3"
        output: "Mỗi cốc: 1.00 lít"
        hidden: true
    common_wrong:
      - test: 1
        output: "Mỗi cốc: 1.0 lít"
        misconception: format-two-decimals
        sample: |
          lit = int(input())
          print(f"Mỗi cốc: {round(lit / 3, 2)} lít")
    hints:
      - { vi: "Đọc số lít bằng int(input()), rồi chia cho 3 ngay trong ngoặc nhọn. Viết :.2f ngay sau phép chia, để luôn có đủ 2 chữ số, kể cả khi chia hết.", en: "Read the litres with int(input()), then divide by 3 right inside the curly brackets. Write :.2f right after the division, so there are always 2 digits, even when it divides exactly." }
      - { vi: "Dòng 1 là lit = int(input()). Dòng 2 là print(f\"Mỗi cốc: {lit / 3:.2f} lít\").", en: "Line 1 is lit = int(input()). Line 2 is print(f\"Mỗi cốc: {lit / 3:.2f} lít\")." }
    test_eligible: true
  - id: s2.dinh-dang.l4.q1
    type: predict
    concepts: [format-two-decimals]
    code: |
      x = 7
      print(f"{x:.2f}")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "7.00", correct: true }
      - { text: "7", misconception: format-two-decimals }
      - { text: "7.0", misconception: format-two-decimals }
      - { vi: "Báo lỗi ValueError ở dòng 2, vì 7 là số nguyên", en: "A ValueError on line 2, because 7 is an integer", error: true }
    explanation:
      vi: ":.2f in số theo kiểu số thực, với đúng 2 chữ số sau dấu chấm. Số nguyên 7 cũng in được như vậy, không có lỗi. Python thêm số 0 cho đủ 2 chữ số, nên in ra 7.00."
      en: ":.2f prints the number as a decimal number, with exactly 2 digits after the dot. The integer 7 can be printed this way too, with no error. Python adds zeros to make 2 digits, so it prints 7.00."
  - id: s2.dinh-dang.l4.q2
    type: predict
    concepts: [format-two-decimals]
    code: |
      a = 0.1 + 0.2
      print(a, f"{a:.2f}")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "0.3 0.30", misconception: format-two-decimals }
      - { text: "0.3 0.3", misconception: format-two-decimals }
      - { text: "0.30000000000000004 0.3", misconception: format-two-decimals }
      - { text: "0.30000000000000004 0.30", correct: true }
    explanation:
      vi: "Máy tính lưu số thực gần đúng, nên 0.1 + 0.2 in ra 0.30000000000000004, có 1 chữ số 4 lạ ở cuối. :.2f làm tròn khi in và luôn in đủ 2 chữ số sau dấu chấm, nên in ra 0.30."
      en: "The computer stores decimal numbers almost exactly, but not quite, so 0.1 + 0.2 prints 0.30000000000000004, with a strange 4 at the end. :.2f rounds when it prints and always prints 2 digits after the dot, so it prints 0.30."
---
Đôi khi con muốn số luôn có **đúng 2 chữ số** sau dấu chấm, như giá tiền 12.50 hay cân nặng 2.00 kg. Trong chuỗi f, con viết **:.2f** ngay sau giá trị, bên trong ngoặc nhọn:

```python run
x = 3.14159
gia = 12.5
print(f"{x:.2f}")
print(f"{gia:.2f}")
print(f"{5:.2f}")
```

Python in ra 3.14, 12.50 và 5.00. Số 2 nghĩa là 2 chữ số sau dấu chấm, còn chữ f ở cuối nghĩa là in theo kiểu số thực. Chữ f này khác chữ f đứng trước dấu nháy: chữ f trước dấu nháy cho biết đây là chuỗi f, còn chữ f trong `:.2f` cho biết in số theo kiểu số thực. Nếu thiếu chữ số, Python thêm số 0 cho đủ. Nếu thừa chữ số, Python làm tròn.
---
`:.2f` khác với `round()`. `round()` làm tròn **con số**, rồi Python in số đó theo cách ngắn nhất, như 5.0 hay 7.1. Còn `:.2f` lo **cách in**, nên luôn in đủ 2 chữ số:

```python run
print(round(5.0, 2), f"{5.0:.2f}")
print(round(7.1, 2), f"{7.1:.2f}")
print(round(3.14159, 2), f"{3.14159:.2f}")
```

Ở dòng 3, 2 cách cho cùng kết quả 3.14. Nhưng với 5.0 và 7.1, `round()` vẫn in ra 5.0 và 7.1, còn `:.2f` in ra 5.00 và 7.10. Khi đề bài cần đúng 2 chữ số sau dấu chấm, con dùng `:.2f`.
---
Máy tính lưu số thực **gần đúng**, giống như con không viết hết được 1 chia 3 thành 0.333... mà phải dừng ở đâu đó. Vì vậy có phép tính cho kết quả hơi lạ:

```python run
tong = 0.1 + 0.2
print(tong)
print(f"{tong:.2f}")
```

Python in ra 0.30000000000000004, rồi 0.30. Chữ số 4 ở cuối không phải lỗi của con. Khi in kết quả cho người khác đọc, như giá tiền hay cân nặng, con dùng `:.2f` để in gọn gàng.
