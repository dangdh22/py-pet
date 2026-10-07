---
id: s2.bien.l1
title: { vi: "Biến là gì?", en: "What is a variable?" }
exercises:
  - id: s2.bien.l1.ex1
    type: code
    concepts: [var-assign]
    prompt:
      vi: "Tạo biến ten và cất chuỗi \"Robo\" vào biến đó. Sau đó dùng biến ten (không có dấu nháy) để in ra 2 dòng như phần Ví dụ."
      en: "Create a variable named ten and store the string \"Robo\" in it. Then use the variable ten (with no quotes) to print the 2 lines in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = "Robo"
      print("Xin chào", ten)
      print(ten, "thích Python")
    tests:
      - output: |
          Xin chào Robo
          Robo thích Python
    common_wrong:
      - output: |
          Xin chào ten
          ten thích Python
        misconception: var-assign
        sample: |
          ten = "Robo"
          print("Xin chào", "ten")
          print("ten", "thích Python")
    hints:
      - { vi: "Dòng đầu là lệnh gán: tên biến, dấu =, rồi chuỗi \"Robo\". Mỗi lệnh print sau đó có biến ten và 1 chuỗi, ngăn cách bằng dấu phẩy.", en: "The first line is an assignment: the variable name, =, then the string \"Robo\". Each print statement after it has the variable ten and 1 string, separated by a comma." }
      - { vi: "Dòng 1 là ten = \"Robo\". Dòng 2 là print(\"Xin chào\", ten). Dòng 3 làm tương tự, nhưng biến ten đứng trước.", en: "Line 1 is ten = \"Robo\". Line 2 is print(\"Xin chào\", ten). Do line 3 the same way, but put the variable ten first." }
    test_eligible: true
  - id: s2.bien.l1.q1
    type: predict
    concepts: [var-assign]
    code: |
      name = "Bo"
      print(name)
      print("name")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "name\nname", misconception: var-assign }
      - { text: "Bo\nname", correct: true }
      - { text: "Bo\nBo", misconception: var-assign }
      - { text: "name\nBo", misconception: var-assign }
    explanation:
      vi: "Ở dòng 2, name không có dấu nháy nên là tên biến: Python in giá trị cất trong biến, là Bo. Ở dòng 3, \"name\" có dấu nháy nên chỉ là 1 chuỗi, và được in y nguyên: name."
      en: "On line 2, name has no quotes, so it is a variable name: Python prints the value stored in the variable, Bo. On line 3, \"name\" has quotes, so it is just a string, and it is printed exactly as it is: name."
  - id: s2.bien.l1.q2
    type: mcq
    concepts: [var-assign]
    code: |
      a = 5
    prompt:
      vi: "Lệnh a = 5 làm gì?"
      en: "What does the statement a = 5 do?"
    choices:
      - { vi: "Kiểm tra xem a có bằng 5 hay không", en: "It checks whether a is equal to 5", misconception: var-assign }
      - { vi: "In ra màn hình dòng chữ a = 5", en: "It prints the text a = 5 on the screen", misconception: var-assign }
      - { vi: "Cất số 5 vào biến a", en: "It stores the number 5 in the variable a", correct: true }
      - { vi: "Cất chữ a vào số 5", en: "It stores the letter a in the number 5", misconception: var-assign }
    explanation:
      vi: "Dấu = là lệnh gán: Python lấy giá trị ở bên phải (số 5) và cất vào biến ở bên trái (a). Lệnh gán không kiểm tra gì và không in gì ra màn hình."
      en: "= is an assignment: Python takes the value on the right (the number 5) and stores it in the variable on the left (a). An assignment does not check anything and does not print anything."
---
Robo cần nhớ nhiều thứ: tên của mình, số pin còn lại, điểm trò chơi. Để nhớ một thứ, chương trình dùng **biến**.

**Biến** giống như một **chiếc hộp có dán tên**. Con cất một thứ vào hộp. Sau đó, con gọi tên hộp để lấy thứ đó ra dùng. Thứ được cất trong hộp gọi là **giá trị** của biến.

```python run
ten = "Robo"
print(ten)
```

Dòng 1 tạo một chiếc hộp tên là `ten` và cất chuỗi "Robo" vào trong. Dòng 2 in ra giá trị nằm trong hộp: Robo.
---
Hãy nhìn kỹ dấu nháy. Tên biến viết **không có dấu nháy**. Khi gặp tên biến, Python mở hộp và lấy giá trị bên trong ra dùng.

```python run
ten = "Robo"
print(ten)
print("ten")
```

- Dòng 2: `ten` không có dấu nháy, nên Python in giá trị trong hộp: **Robo**.
- Dòng 3: `"ten"` có dấu nháy, nên đây chỉ là 1 chuỗi bình thường. Python in y nguyên chữ **ten**.
---
Hộp có thể cất chuỗi, cũng có thể cất số. Một biến dùng được nhiều lần, và con in nó cùng với chữ khác bằng dấu phẩy, như ở giai đoạn 1.

```python run
ten = "Robo"
pin = 5
print("Xin chào, mình là", ten)
print(ten, "còn", pin, "cục pin")
```

Muốn đổi tên robot, con chỉ cần sửa 1 chỗ ở dòng 1. Các lệnh print tự in theo tên mới. Con thử đổi "Robo" thành tên khác rồi bấm Chạy thử nhé.
---
Trong Python, dấu `=` **không** có nghĩa là "bằng" như ở môn Toán. Nó là lệnh **gán**: lấy giá trị ở **bên phải**, rồi cất vào biến ở **bên trái**. Con đọc `tuoi = 11` là "gán 11 cho tuoi", hay "cất 11 vào hộp tuoi".

Vì vậy, tên biến luôn đứng bên trái dấu `=`. Nếu viết ngược lại, Python báo lỗi. Bấm Chạy thử để xem:

```python run expect-error
11 = tuoi
```

Python không cất được gì vào số 11, vì 11 không phải là một chiếc hộp. Con sửa lại thành `tuoi = 11` là đúng.
