---
id: s2.ep-kieu.l5
title: { vi: "Máy tính bỏ túi của Robo", en: "Robo's calculator" }
exercises:
  - id: s2.ep-kieu.l5.ex1
    type: code
    concepts: [int-convert]
    prompt:
      vi: "Làm máy tính bỏ túi của Robo. Ô Dữ liệu nhập có 2 dòng, mỗi dòng 1 số nguyên. Hãy đọc 2 số vào 2 biến a và b, rồi in ra 4 dòng như phần Ví dụ: tổng, hiệu, tích và thương của a và b."
      en: "Make Robo's calculator. The Input data box has 2 lines with 1 integer on each line. Read the 2 numbers into the 2 variables a and b, then print the 4 lines in the Example: the sum, the difference, the product and the quotient of a and b."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      a = int(input())
      b = int(input())
      print("Tổng:", a + b)
      print("Hiệu:", a - b)
      print("Tích:", a * b)
      print("Thương:", a / b)
    tests:
      - input: "12\n4"
        output: |
          Tổng: 16
          Hiệu: 8
          Tích: 48
          Thương: 3.0
      - input: "9\n2"
        output: |
          Tổng: 11
          Hiệu: 7
          Tích: 18
          Thương: 4.5
        hidden: true
    compare: float
    tolerance: 0.001
    hints:
      - { vi: "Đọc mỗi số bằng int(input()). Sau đó viết 4 lệnh print, mỗi lệnh có 1 chuỗi và 1 phép tính với a và b. Phép chia dùng dấu /.", en: "Read each number with int(input()). Then write 4 print statements, each with 1 string and 1 calculation with a and b. Division uses the / sign." }
      - { vi: "Hai dòng đầu là a = int(input()) và b = int(input()). Dòng in đầu tiên là print(\"Tổng:\", a + b). Ba dòng in sau làm tương tự với dấu -, dấu * và dấu /.", en: "The first 2 lines are a = int(input()) and b = int(input()). The first print line is print(\"Tổng:\", a + b). Do the other 3 print lines the same way with -, * and /." }
    test_eligible: true
  - id: s2.ep-kieu.l5.ex2
    type: code
    concepts: [float-convert]
    prompt:
      vi: "Robo đo nhiệt độ ngoài trời 2 lần trong ngày. Ô Dữ liệu nhập có 2 dòng: nhiệt độ buổi sáng và nhiệt độ buổi chiều, đều là số thực có dấu chấm. Hãy đọc 2 số vào 2 biến sang và chieu, rồi in ra nhiệt độ trung bình như phần Ví dụ. Nhiệt độ trung bình bằng tổng 2 nhiệt độ chia cho 2."
      en: "Robo measures the temperature outside 2 times a day. The Input data box has 2 lines: the morning temperature and the afternoon temperature, both decimal numbers with a dot. Read the 2 numbers into the 2 variables sang and chieu, then print the average temperature as in the Example. The average is the sum of the 2 temperatures divided by 2."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      sang = float(input())
      chieu = float(input())
      print("Nhiệt độ trung bình:", (sang + chieu) / 2)
    tests:
      - input: "24.5\n31.5"
        output: "Nhiệt độ trung bình: 28.0"
      - input: "20.25\n26.75"
        output: "Nhiệt độ trung bình: 23.5"
        hidden: true
    compare: float
    tolerance: 0.001
    common_wrong:
      - output: "Nhiệt độ trung bình: 40.25"
        misconception: precedence
        sample: |
          sang = float(input())
          chieu = float(input())
          print("Nhiệt độ trung bình:", sang + chieu / 2)
    hints:
      - { vi: "Đọc mỗi nhiệt độ bằng float(input()). Python làm phép chia trước phép cộng, nên con cần ngoặc tròn để cộng 2 nhiệt độ trước.", en: "Read each temperature with float(input()). Python divides before it adds, so you need round brackets to add the 2 temperatures first." }
      - { vi: "Hai dòng đầu là sang = float(input()) và chieu = float(input()). Dòng in là print(\"Nhiệt độ trung bình:\", (sang + chieu) / 2).", en: "The first 2 lines are sang = float(input()) and chieu = float(input()). The print line is print(\"Nhiệt độ trung bình:\", (sang + chieu) / 2)." }
    test_eligible: true
  - id: s2.ep-kieu.l5.q1
    type: mcq
    concepts: [int-invalid]
    code: |
      a = int(input())
      b = int(input())
      print(a * b)
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: 8 và 2.5. Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "The Input data box has 2 lines: 8 and 2.5. What happens when this code runs?"
    choices:
      - { vi: "Báo lỗi ValueError ở dòng 2", en: "A ValueError on line 2", correct: true, error: true }
      - { text: "20.0", misconception: int-invalid }
      - { text: "16", misconception: int-invalid }
      - { text: "20", misconception: int-invalid }
    explanation:
      vi: "Dòng 1 đổi chuỗi \"8\" thành số 8 mà không có lỗi. Dòng 2 đọc chuỗi \"2.5\", có dấu chấm, nên int() không đổi được và Python báo lỗi ValueError ở dòng 2. int() không tự cắt phần thập phân của 1 chuỗi. Muốn tính với 2.5, con đọc bằng float(input())."
      en: "Line 1 changes the string \"8\" into the number 8 with no error. Line 2 reads the string \"2.5\", which has a dot, so int() cannot change it and Python shows a ValueError on line 2. int() does not drop the decimals of a string by itself. To work with 2.5, read it with float(input())."
  - id: s2.ep-kieu.l5.q2
    type: mcq
    concepts: [float-convert]
    prompt:
      vi: "Con muốn máy tính bỏ túi của Robo tính đúng với cả những số như 1.5 hay 2.25. Con nên đọc mỗi số bằng lệnh nào?"
      en: "You want Robo's calculator to work correctly with numbers such as 1.5 or 2.25 too. Which statement should you use to read each number?"
    choices:
      - { text: "a = input()", misconception: input-str }
      - { text: "a = int(input())", misconception: int-invalid }
      - { text: "a = float(input())", correct: true }
      - { text: "a = int(float(input()))", misconception: int-truncate }
    explanation:
      vi: "float(input()) đổi dòng con gõ thành số thực, nên đọc được cả 1.5 và 2.25. input() chỉ đưa lại chuỗi, nên chưa tính được. int(input()) báo lỗi ValueError với chuỗi có dấu chấm. Còn int(float(input())) cắt mất phần thập phân, nên 1.5 chỉ còn 1."
      en: "float(input()) changes the typed line into a decimal number, so it reads both 1.5 and 2.25. input() only gives back a string, so you cannot calculate with it yet. int(input()) shows a ValueError with a string that has a dot. And int(float(input())) drops the decimal part, so 1.5 becomes just 1."
---
Robo muốn có 1 **máy tính bỏ túi**: con gõ 2 số, Robo in ra tổng, hiệu, tích và thương. Trước khi viết code, con lên kế hoạch:

1. Đọc 2 số, đổi mỗi số bằng `int()`.
2. Tính với các phép `+ - * /`.
3. In mỗi kết quả trên 1 dòng, kèm tên phép tính.

Đây là phần đầu của chương trình. Con sẽ viết nốt tích và thương ở bài tập:

```python
a = int(input())
b = int(input())
print("Tổng:", a + b)
print("Hiệu:", a - b)
```

Với 2 dòng 12 và 4 trong ô Dữ liệu nhập, chương trình chạy giống đoạn code dưới đây:

```python run
a = int("12")  # dòng 1 con gõ
b = int("4")   # dòng 2 con gõ
print("Tổng:", a + b)
print("Hiệu:", a - b)
```
---
Muốn tính cả với số thực, như 2.5, con đọc bằng `float(input())` thay cho `int(input())`. Khi đó, mọi kết quả đều là số thực:

```python run
a = float("2.5")  # dòng 1 con gõ
b = float("2")    # dòng 2 con gõ
print("Tổng:", a + b)
print("Tích:", a * b)
```

Python in ra Tổng: 4.5 và Tích: 5.0. Con chọn `int()` khi chỉ cần số nguyên, như số kẹo hay số tuổi. Con chọn `float()` khi số có thể có phần thập phân, như cân nặng hay quãng đường.
---
Trước khi Nộp bài, con hãy thử chương trình với dữ liệu khác. Với 2 số 10 và 3, thương có rất nhiều chữ số sau dấu chấm:

```python run
print("Thương:", 10 / 3)
```

Python in ra 3.3333333333333335. Chữ số 5 ở cuối không phải lỗi của con: máy tính chỉ lưu số thực gần đúng, nên chữ số cuối cùng có thể hơi lạ. Ở chủ đề sau, con sẽ học cách in số thực gọn hơn.
---
Máy tính bỏ túi nào cũng không chia được cho 0. Nếu số thứ hai là 0, Python báo lỗi **ZeroDivisionError** ở phép chia. Bấm Chạy thử để xem:

```python run expect-error
a = int("5")  # dòng 1 con gõ
b = int("0")  # dòng 2 con gõ
print("Tổng:", a + b)
print("Thương:", a / b)
```

Dòng 3 vẫn in ra Tổng: 5, rồi Python dừng ở dòng 4. Khi thử máy tính của Robo, con đừng gõ 0 ở dòng thứ hai.
