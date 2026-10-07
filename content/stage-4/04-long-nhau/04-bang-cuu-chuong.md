---
id: s4.long-nhau.l4
title: { vi: "Bảng cửu chương", en: "Times tables" }
exercises:
  - id: s4.long-nhau.l4.ex1
    type: code
    concepts: [nested-inner-full, fstring-expression]
    prompt:
      vi: "Robo in các bảng cửu chương, từ bảng a đến bảng b. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số a, dòng 2 là số b, đều là số nguyên dương. Với mỗi bảng, hãy in ra dòng Bảng nhân cùng với số của bảng, rồi 10 dòng nhân từ nhân 1 đến nhân 10, rồi 1 dòng trống, đúng như phần Ví dụ. Hãy dùng chuỗi f để in các dòng. Nếu a lớn hơn b, Robo không in ra gì."
      en: "Robo prints the times tables, from table a to table b. The Input data box has 2 lines: line 1 is the number a, and line 2 is the number b, both positive integers. For each table, print the line Bảng nhân with the number of the table, then 10 lines from times 1 to times 10, then 1 empty line, exactly as in the Example. Use f-strings to print the lines. If a is greater than b, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      a = int(input())
      b = int(input())
      for so in range(a, b + 1):
          print(f"Bảng nhân {so}")
          for i in range(1, 11):
              print(f"{so} x {i} = {so * i}")
          print()
    tests:
      - input: "2\n3"
        output: |
          Bảng nhân 2
          2 x 1 = 2
          2 x 2 = 4
          2 x 3 = 6
          2 x 4 = 8
          2 x 5 = 10
          2 x 6 = 12
          2 x 7 = 14
          2 x 8 = 16
          2 x 9 = 18
          2 x 10 = 20

          Bảng nhân 3
          3 x 1 = 3
          3 x 2 = 6
          3 x 3 = 9
          3 x 4 = 12
          3 x 5 = 15
          3 x 6 = 18
          3 x 7 = 21
          3 x 8 = 24
          3 x 9 = 27
          3 x 10 = 30
      - input: "5\n5"
        output: |
          Bảng nhân 5
          5 x 1 = 5
          5 x 2 = 10
          5 x 3 = 15
          5 x 4 = 20
          5 x 5 = 25
          5 x 6 = 30
          5 x 7 = 35
          5 x 8 = 40
          5 x 9 = 45
          5 x 10 = 50
        hidden: true
      - input: "4\n3"
        output: ""
        hidden: true
      - input: "7\n9"
        output: |
          Bảng nhân 7
          7 x 1 = 7
          7 x 2 = 14
          7 x 3 = 21
          7 x 4 = 28
          7 x 5 = 35
          7 x 6 = 42
          7 x 7 = 49
          7 x 8 = 56
          7 x 9 = 63
          7 x 10 = 70

          Bảng nhân 8
          8 x 1 = 8
          8 x 2 = 16
          8 x 3 = 24
          8 x 4 = 32
          8 x 5 = 40
          8 x 6 = 48
          8 x 7 = 56
          8 x 8 = 64
          8 x 9 = 72
          8 x 10 = 80

          Bảng nhân 9
          9 x 1 = 9
          9 x 2 = 18
          9 x 3 = 27
          9 x 4 = 36
          9 x 5 = 45
          9 x 6 = 54
          9 x 7 = 63
          9 x 8 = 72
          9 x 9 = 81
          9 x 10 = 90
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Bảng nhân 2
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}

          Bảng nhân 3
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
          {so} x {i} = {so * i}
        misconception: fstring-prefix
        sample: |
          a = int(input())
          b = int(input())
          for so in range(a, b + 1):
              print(f"Bảng nhân {so}")
              for i in range(1, 11):
                  print("{so} x {i} = {so * i}")
              print()
      - test: 0
        output: |
          Bảng nhân 2
          2 x 1 = 2
          2 x 2 = 4
          2 x 3 = 6
          2 x 4 = 8
          2 x 5 = 10
          2 x 6 = 12
          2 x 7 = 14
          2 x 8 = 16
          2 x 9 = 18

          Bảng nhân 3
          3 x 1 = 3
          3 x 2 = 6
          3 x 3 = 9
          3 x 4 = 12
          3 x 5 = 15
          3 x 6 = 18
          3 x 7 = 21
          3 x 8 = 24
          3 x 9 = 27
        misconception: range-stop-excluded
        sample: |
          a = int(input())
          b = int(input())
          for so in range(a, b + 1):
              print(f"Bảng nhân {so}")
              for i in range(1, 10):
                  print(f"{so} x {i} = {so * i}")
              print()
    hints:
      - { vi: "Vòng ngoài đi qua các bảng, từ a đến b, có cả b. Trong vòng ngoài, con in dòng Bảng nhân, rồi vòng trong in 10 dòng nhân, rồi print() để có 1 dòng trống. Trong chuỗi f, phép nhân viết ngay trong ngoặc nhọn: {so * i}.", en: "The outer loop goes through the tables, from a to b, including b. Inside the outer loop, print the line Bảng nhân, then the inner loop prints the 10 lines, then print() gives 1 empty line. In an f-string, the multiplication goes right inside the curly brackets: {so * i}." }
      - { vi: "Sau 2 dòng đọc a và b là for so in range(a, b + 1):. Thụt lề 4 dấu cách: print(f\"Bảng nhân {so}\") và for i in range(1, 11):. Thụt lề 8 dấu cách: print(f\"{so} x {i} = {so * i}\"). Cuối cùng, thụt lề 4 dấu cách: print().", en: "After the 2 lines that read a and b comes for so in range(a, b + 1):. Indented by 4 spaces: print(f\"Bảng nhân {so}\") and for i in range(1, 11):. Indented by 8 spaces: print(f\"{so} x {i} = {so * i}\"). Last, indented by 4 spaces: print()." }
    test_eligible: true
  - id: s4.long-nhau.l4.ex2
    type: code
    concepts: [print-end-newline, nested-inner-full]
    prompt:
      vi: "Robo in 1 bảng nhân dạng lưới. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy in ra n hàng. Hàng thứ i có n số: i nhân 1, i nhân 2, và cứ thế đến i nhân n. Các số trên 1 hàng cách nhau đúng 1 dấu cách, và không có dấu cách ở đầu hàng, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo prints a times table as a grid. The Input data box has 1 line: a number n, an integer that is not negative. Print n rows. Row i has n numbers: i times 1, i times 2, and so on up to i times n. The numbers on a row are separated by exactly 1 space, with no space at the start of the row, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(1, n + 1):
          for j in range(1, n + 1):
              print(i * j, end=" ")
          print()
    tests:
      - input: "3"
        output: |
          1 2 3
          2 4 6
          3 6 9
      - input: "1"
        output: "1"
        hidden: true
      - input: "0"
        output: ""
        hidden: true
      - input: "5"
        output: |
          1 2 3 4 5
          2 4 6 8 10
          3 6 9 12 15
          4 8 12 16 20
          5 10 15 20 25
        hidden: true
    common_wrong:
      - test: 0
        output: "1 2 3 2 4 6 3 6 9"
        misconception: print-end-newline
        sample: |
          n = int(input())
          for i in range(1, n + 1):
              for j in range(1, n + 1):
                  print(i * j, end=" ")
      - test: 0
        output: |
          0 0 0
          0 1 2
          0 2 4
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          for i in range(n):
              for j in range(n):
                  print(i * j, end=" ")
              print()
    hints:
      - { vi: "Vòng ngoài đi qua các hàng i, vòng trong đi qua các cột j, cả 2 đều từ 1 đến n. Trong vòng trong, con in i * j với end=\" \" để các số nằm trên cùng 1 hàng. Sau vòng trong, print() để xuống dòng.", en: "The outer loop goes through the rows i, and the inner loop goes through the columns j, both from 1 to n. Inside the inner loop, print i * j with end=\" \" so that the numbers stay on the same row. After the inner loop, print() starts a new line." }
      - { vi: "Sau n = int(input()) là for i in range(1, n + 1):, rồi for j in range(1, n + 1): thụt lề 4 dấu cách. Thụt lề 8 dấu cách: print(i * j, end=\" \"). Cuối cùng, thụt lề 4 dấu cách: print().", en: "After n = int(input()) comes for i in range(1, n + 1):, then for j in range(1, n + 1): indented by 4 spaces. Indented by 8 spaces: print(i * j, end=\" \"). Last, indented by 4 spaces: print()." }
    test_eligible: true
  - id: s4.long-nhau.l4.q1
    type: predict
    concepts: [nested-inner-full]
    code: |
      for a in range(2, 4):
          for b in range(1, 3):
              print(f"{a}x{b}={a * b}")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "2x1=2\n3x1=3\n2x2=4\n3x2=6", misconception: nested-inner-full }
      - { text: "2x1=2\n2x2=4\n3x1=3\n3x2=6", correct: true }
      - { text: "2x1=2\n2x2=4\n2x3=6\n3x1=3\n3x2=6\n3x3=9", misconception: range-stop-excluded }
      - { text: "2x1=2\n3x2=6", misconception: nested-inner-full }
    explanation:
      vi: "Khi a là 2, vòng trong chạy hết: b là 1 rồi 2, nên in ra 2x1=2 và 2x2=4. Sau đó a mới là 3, và vòng trong lại chạy từ đầu. range(1, 3) dừng trước 3, nên b chỉ là 1 và 2. Trong chuỗi f, Python thay {a * b} bằng kết quả của phép nhân."
      en: "When a is 2, the inner loop runs all the way: b is 1 and then 2, so it prints 2x1=2 and 2x2=4. Only then does a become 3, and the inner loop runs again from the start. range(1, 3) stops before 3, so b is only 1 and 2. In the f-string, Python puts the result of the multiplication in place of {a * b}."
  - id: s4.long-nhau.l4.q2
    type: mcq
    concepts: [fstring-expression, fstring-prefix]
    prompt:
      vi: "Trong vòng lặp lồng, a là 3 và b là 4. Robo muốn in ra đúng dòng 3 x 4 = 12. Lệnh nào viết đúng?"
      en: "Inside nested loops, a is 3 and b is 4. Robo wants to print exactly the line 3 x 4 = 12. Which statement is written correctly?"
    choices:
      - { text: "print(f\"{a} x {b} = {a} * {b}\")", misconception: fstring-expression }
      - { text: "print(\"{a} x {b} = {a * b}\")", misconception: fstring-prefix }
      - { text: "print(f\"a x b = a * b\")", misconception: fstring-expression }
      - { text: "print(f\"{a} x {b} = {a * b}\")", correct: true }
    explanation:
      vi: "Trong chuỗi f, chỉ phần nằm trong ngoặc nhọn mới được Python tính: {a * b} thành 12. Viết {a} * {b} thì Python in ra 3 * 4, vì dấu * nằm ngoài ngoặc nhọn. Thiếu chữ f trước dấu nháy, Python in ra nguyên cả ngoặc nhọn. Không có ngoặc nhọn, Python in ra đúng các chữ a và b."
      en: "In an f-string, Python works out only what is inside the curly brackets: {a * b} becomes 12. With {a} * {b}, Python prints 3 * 4, because the * is outside the curly brackets. Without the f before the quote, Python prints the curly brackets as they are. Without curly brackets, Python prints the letters a and b themselves."
---
Ở chủ đề đầu tiên, Robo đã in bảng nhân của 1 số bằng 1 vòng lặp. Với 2 vòng lặp lồng nhau, Robo in được nhiều bảng: vòng ngoài chọn số của bảng, vòng trong đi từ nhân 1 đến nhân 10.

```python run
for so in range(2, 4):
    for i in range(1, 11):
        print(f"{so} x {i} = {so * i}")
```

Con nhớ: trong **chuỗi f**, phép tính viết được ngay trong ngoặc nhọn, như `{so * i}`, và Python in ra kết quả của phép tính.
---
Để dễ đọc, mỗi bảng có 1 dòng tiêu đề ở trên và 1 dòng trống ở dưới. 2 dòng này thụt lề 4 dấu cách: chúng nằm trong vòng ngoài nhưng ngoài vòng trong, nên chạy 1 lần cho mỗi bảng.

```python run
for so in range(2, 4):
    print(f"Bảng nhân {so}")
    for i in range(1, 6):
        print(f"{so} x {i} = {so * i}")
    print()
```

Ở đây, dòng trước `print()` đã xuống dòng rồi, nên `print()` tạo ra 1 **dòng trống**. Còn sau các lệnh in với `end=""`, `print()` chỉ kết thúc hàng đang in dở.
---
Robo còn in được bảng nhân dạng **lưới**: hàng i, cột j là số i * j. Vòng trong in các số của 1 hàng với `end=" "`, để mỗi số có 1 dấu cách ở sau:

```python run
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end=" ")
    print()
```

Cuối mỗi hàng có 1 dấu cách thừa, nhưng con không nhìn thấy nó. Khi chấm bài, Robo bỏ qua dấu cách ở cuối mỗi dòng, nên dấu cách này không làm bài của con bị sai.
