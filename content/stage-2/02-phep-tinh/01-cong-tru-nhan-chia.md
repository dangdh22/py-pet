---
id: s2.phep-tinh.l1
title: { vi: "Cộng, trừ, nhân, chia", en: "Add, subtract, multiply, divide" }
exercises:
  - id: s2.phep-tinh.l1.ex1
    type: code
    concepts: [div-float]
    prompt:
      vi: "Code bên phải đã có 2 biến so_1 và so_2. Hãy viết 4 lệnh print để in ra tổng, hiệu, tích và thương của 2 số, như phần Ví dụ. Đừng tự tính: ở mỗi dòng, hãy viết phép tính với 2 biến."
      en: "The code on the right already has 2 variables, so_1 and so_2. Write 4 print statements to print the sum, the difference, the product and the quotient of the 2 numbers, as in the Example. Do not work out the answers yourself: on each line, write a calculation with the 2 variables."
    starter: |
      so_1 = 12
      so_2 = 4
      # Viết 4 lệnh print ở dưới dòng này
    solution: |
      so_1 = 12
      so_2 = 4
      print("Tổng:", so_1 + so_2)
      print("Hiệu:", so_1 - so_2)
      print("Tích:", so_1 * so_2)
      print("Thương:", so_1 / so_2)
    tests:
      - output: |
          Tổng: 16
          Hiệu: 8
          Tích: 48
          Thương: 3.0
    hints:
      - { vi: "Mỗi lệnh print có 1 chuỗi và 1 phép tính với 2 biến, ngăn cách bằng dấu phẩy. Phép chia dùng dấu /.", en: "Each print statement has 1 string and 1 calculation with the 2 variables, separated by a comma. Division uses the / sign." }
      - { vi: "Dòng đầu là print(\"Tổng:\", so_1 + so_2). Ba dòng sau làm tương tự với dấu -, dấu * và dấu /.", en: "The first line is print(\"Tổng:\", so_1 + so_2). Do the other 3 lines the same way with -, * and /." }
    test_eligible: true
  - id: s2.phep-tinh.l1.ex2
    type: code
    concepts: [read-error]
    prompt:
      vi: "Chu vi hình vuông bằng 4 nhân cạnh. Code bên phải viết phép nhân giống môn Toán nên Python báo lỗi. Hãy sửa dòng 2 để in ra đúng dòng như phần Ví dụ."
      en: "The perimeter of a square is 4 times its side. The code on the right writes the multiplication as in maths class, so Python shows an error. Fix line 2 to print the line in the Example."
    starter: |
      canh = 5
      print("Chu vi hình vuông:", 4canh)
    solution: |
      canh = 5
      print("Chu vi hình vuông:", 4 * canh)
    tests:
      - output: "Chu vi hình vuông: 20"
    hints:
      - { vi: "Python báo SyntaxError ở dòng 2. Ở môn Toán, con viết 4a nghĩa là 4 nhân a. Python thì cần có dấu nhân.", en: "Python shows a SyntaxError on line 2. In maths class, 4a means 4 times a. Python needs a multiplication sign." }
      - { vi: "Sửa 4canh thành 4 * canh.", en: "Change 4canh to 4 * canh." }
    test_eligible: true
  - id: s2.phep-tinh.l1.q1
    type: predict
    concepts: [div-float]
    code: |
      n = 8
      print(n / 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "4", misconception: div-float }
      - { text: "4.0", correct: true }
      - { text: "4,0", misconception: div-float }
      - { text: "n / 2", misconception: var-assign }
    explanation:
      vi: "Phép / luôn cho ra số thực, kể cả khi chia hết. 8 chia 2 được 4, nên Python in ra 4.0. Python viết phần thập phân sau dấu chấm, không dùng dấu phẩy."
      en: "/ always gives a float, even when the division has no remainder. 8 divided by 2 is 4, so Python prints 4.0. Python writes the decimal part after a dot, not after a comma."
  - id: s2.phep-tinh.l1.q2
    type: predict
    concepts: [div-float]
    code: |
      print(type(10 / 5))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "<class 'int'>", misconception: div-float }
      - { text: "2.0", misconception: div-float }
      - { text: "<class 'float'>", correct: true }
      - { text: "<class 'str'>", misconception: str-vs-int }
    explanation:
      vi: "10 / 5 ra 2.0. Kết quả của phép / luôn là số thực, và type() cho biết đó là float. Lệnh print in ra loại dữ liệu, không in ra giá trị 2.0."
      en: "10 / 5 gives 2.0. The result of / is always a float, and type() says it is float. The print statement prints the kind of data, not the value 2.0."
---
Ở giai đoạn 1, con đã tính với số, như `3 * 4`. Bây giờ con tính với **biến**. Python lấy giá trị trong biến ra rồi tính. Con cũng có thể cất kết quả vào 1 biến mới.

```python run
pin_sang = 5
pin_chieu = 3
tong = pin_sang + pin_chieu
print("Tổng:", tong)
print("Hơn nhau:", pin_sang - pin_chieu)
print("Gấp đôi buổi sáng:", pin_sang * 2)
```

Dòng 3 tính 5 + 3 ra 8, rồi cất 8 vào biến `tong`.
---
Phép **chia** dùng dấu `/` (dấu gạch chéo).

```python run
keo = 7
ban = 2
print(keo / ban)
```

Python in ra 3.5, nghĩa là ba phẩy năm. Python viết phần lẻ sau **dấu chấm**, ở chỗ con quen viết dấu phẩy. Số có phần lẻ như vậy gọi là **số thực**.
---
Kết quả của dấu `/` **luôn là số thực**, kể cả khi chia hết. Hãy xem:

```python run
print(6 / 2)
print(type(6 / 2))
```

6 chia 2 được 3, nhưng Python in ra **3.0**. Lệnh type() cho biết đây là **float**, tên Python dùng cho số thực. Số 3.0 có giá trị bằng 3, chỉ là được viết theo kiểu số thực.
---
Ở môn Toán, con viết `4a` nghĩa là 4 nhân a. Python không hiểu cách viết đó: phép nhân **luôn phải có dấu** `*`. Bấm Chạy thử để xem:

```python run expect-error
canh = 5
print(4canh)
```

Python báo lỗi SyntaxError ở dòng 2. Con sửa thành `4 * canh` là đúng, và Python in ra 20. Chữ x cũng không phải dấu nhân trong Python.
