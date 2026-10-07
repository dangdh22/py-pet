---
id: s2.bien.l4
title: { vi: "Biến chứa chữ, biến chứa số", en: "Text and number variables" }
exercises:
  - id: s2.bien.l4.ex1
    type: code
    concepts: [str-vs-int, var-assign]
    prompt:
      vi: "Code bên phải đã có biến ten và biến tuoi. Hãy viết thêm 3 lệnh print để in ra 3 dòng như phần Ví dụ. Ở dòng cuối, dùng phép tính tuoi + 1 để Python tự tính tuổi năm sau."
      en: "The code on the right already has the variables ten and tuoi. Write 3 print statements to print the 3 lines in the Example. On the last line, use the calculation tuoi + 1 so that Python works out the age next year."
    starter: |
      ten = "Robo"
      tuoi = 2
      # Viết 3 lệnh print ở dưới dòng này
    solution: |
      ten = "Robo"
      tuoi = 2
      print("Tên:", ten)
      print("Tuổi:", tuoi)
      print("Năm sau:", tuoi + 1)
    tests:
      - output: |
          Tên: Robo
          Tuổi: 2
          Năm sau: 3
    common_wrong:
      - output: |
          Tên: ten
          Tuổi: tuoi
          Năm sau: 3
        misconception: var-assign
        sample: |
          ten = "Robo"
          tuoi = 2
          print("Tên:", "ten")
          print("Tuổi:", "tuoi")
          print("Năm sau:", tuoi + 1)
    hints:
      - { vi: "Mỗi lệnh print có 2 giá trị ngăn cách bằng dấu phẩy: 1 chuỗi trong dấu nháy, rồi 1 biến hoặc 1 phép tính không có dấu nháy.", en: "Each print statement has 2 values separated by a comma: a string in quotes, then a variable or a calculation with no quotes." }
      - { vi: "Dòng đầu là print(\"Tên:\", ten). Dòng cuối là print(\"Năm sau:\", tuoi + 1).", en: "The first line is print(\"Tên:\", ten). The last line is print(\"Năm sau:\", tuoi + 1)." }
    test_eligible: true
  - id: s2.bien.l4.ex2
    type: code
    concepts: [str-vs-int]
    prompt:
      vi: "Robo ăn 5 cục pin buổi sáng và 3 cục pin buổi chiều. Code bên phải in ra 53, sai rồi. Hãy sửa 2 lệnh gán để Python cộng 2 số và in ra đúng dòng như phần Ví dụ."
      en: "Robo eats 5 batteries in the morning and 3 batteries in the afternoon. The code on the right prints 53, which is wrong. Fix the 2 assignments so that Python adds the 2 numbers and prints the line in the Example."
    starter: |
      pin_sang = "5"
      pin_chieu = "3"
      print("Tổng số pin:", pin_sang + pin_chieu)
    solution: |
      pin_sang = 5
      pin_chieu = 3
      print("Tổng số pin:", pin_sang + pin_chieu)
    tests:
      - output: "Tổng số pin: 8"
    common_wrong:
      - output: "Tổng số pin: 53"
        misconception: str-vs-int
        sample: |
          pin_sang = "5"
          pin_chieu = "3"
          print("Tổng số pin:", pin_sang + pin_chieu)
    hints:
      - { vi: "\"5\" và \"3\" nằm trong dấu nháy nên là chuỗi. Dấu + giữa 2 chuỗi chỉ nối chúng lại thành 53.", en: "\"5\" and \"3\" are inside quotes, so they are strings. + between 2 strings only joins them into 53." }
      - { vi: "Bỏ dấu nháy ở 2 dòng gán: pin_sang = 5 và pin_chieu = 3.", en: "Remove the quotes on the 2 assignment lines: pin_sang = 5 and pin_chieu = 3." }
    test_eligible: true
  - id: s2.bien.l4.q1
    type: predict
    concepts: [str-vs-int]
    code: |
      a = 4
      b = "4"
      print(a + a)
      print(b + b)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "8\n44", correct: true }
      - { text: "8\n8", misconception: str-vs-int }
      - { text: "44\n44", misconception: str-vs-int }
      - { text: "44\n8", misconception: str-vs-int }
    explanation:
      vi: "Biến a chứa số 4, nên a + a là phép cộng và ra 8. Biến b chứa chuỗi \"4\", nên b + b nối 2 chuỗi lại thành 44."
      en: "The variable a holds the number 4, so a + a is an addition: 8. The variable b holds the string \"4\", so b + b joins the 2 strings into 44."
  - id: s2.bien.l4.q2
    type: predict
    concepts: [str-vs-int]
    code: |
      n = "7"
      print(type(n))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "<class 'str'>", correct: true }
      - { text: "<class 'int'>", misconception: str-vs-int }
      - { text: "7", misconception: str-vs-int }
      - { text: "<class 'n'>", misconception: var-assign }
    explanation:
      vi: "\"7\" nằm trong dấu nháy nên biến n chứa 1 chuỗi, dù bên trong chuỗi chỉ có chữ số. type() cho biết loại dữ liệu của giá trị trong biến: str là chuỗi."
      en: "\"7\" is inside quotes, so the variable n holds a string, even though the string has only a digit. type() tells the kind of data of the value in the variable: str means string."
---
Biến có thể chứa **chuỗi** hoặc **số nguyên**. Nhìn vào lệnh gán là biết: chuỗi có dấu nháy, số thì không có.

```python run
ten = "Robo"
tuoi = 2
print(ten)
print(tuoi)
```

Biến `ten` chứa chuỗi "Robo". Biến `tuoi` chứa số 2.
---
Dấu `+` làm việc khác nhau tùy theo thứ nằm trong hộp:

- Hai biến chứa **số**: dấu `+` là phép **cộng**.
- Hai biến chứa **chuỗi**: dấu `+` **nối** 2 chuỗi lại, như con đã học ở giai đoạn 1.

```python run
so_1 = 3
so_2 = 2
print(so_1 + so_2)
chu_1 = "3"
chu_2 = "2"
print(chu_1 + chu_2)
```

Dòng 3 in ra 5, còn dòng 6 in ra 32. Chuỗi "3" chỉ là chữ số để đọc, không phải số để tính.
---
Muốn in chữ cùng với biến chứa số, con dùng **dấu phẩy**:

```python run
tuoi = 11
print("Tuổi:", tuoi)
print("Năm sau:", tuoi + 1)
```

Đừng dùng dấu `+` để nối chuỗi với số. Python sẽ báo lỗi **TypeError**, vì không biết nên cộng hay nên nối. Bấm Chạy thử để xem:

```python run expect-error
tuoi = 11
print("Tuổi: " + tuoi)
```
---
Muốn biết biến đang chứa loại dữ liệu gì, con dùng **type()**. Đặt tên biến vào trong ngoặc, rồi in kết quả ra:

```python run
tuoi = 11
ten = "Robo"
so = "11"
print(type(tuoi))
print(type(ten))
print(type(so))
```

Con chỉ cần nhìn chữ nằm trong dấu nháy đơn: **int** là số nguyên, **str** là chuỗi. Biến `so` chứa "11" có dấu nháy, nên nó là str, không phải int.
