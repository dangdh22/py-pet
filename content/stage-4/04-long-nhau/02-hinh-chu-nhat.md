---
id: s4.long-nhau.l2
title: { vi: "Hình chữ nhật bằng *", en: "A rectangle of *" }
exercises:
  - id: s4.long-nhau.l2.ex1
    type: code
    concepts: [print-end-newline]
    prompt:
      vi: "Robo vẽ 1 hình chữ nhật bằng dấu *. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số hàng n, dòng 2 là số dấu * trên mỗi hàng m, đều là số nguyên không âm. Hãy in ra n hàng, mỗi hàng có đúng m dấu * viết liền nhau, không có dấu cách ở đầu hàng, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo draws a rectangle with the sign *. The Input data box has 2 lines: line 1 is the number of rows n, and line 2 is the number of * signs on each row m, both integers that are not negative. Print n rows, each row with exactly m * signs written next to each other and no spaces at the start of the row, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      m = int(input())
      for hang in range(n):
          for cot in range(m):
              print("*", end="")
          print()
    tests:
      - input: "3\n5"
        output: |
          *****
          *****
          *****
      - input: "1\n1"
        output: "*"
        hidden: true
      - input: "0\n4"
        output: ""
        hidden: true
      - input: "4\n2"
        output: |
          **
          **
          **
          **
        hidden: true
      - input: "2\n7"
        output: |
          *******
          *******
        hidden: true
    common_wrong:
      - test: 0
        output: "***************"
        misconception: print-end-newline
        sample: |
          n = int(input())
          m = int(input())
          for hang in range(n):
              for cot in range(m):
                  print("*", end="")
    hints:
      - { vi: "Đọc n và m bằng int(input()). Vòng lặp chạy n lần, mỗi lần vẽ 1 hàng. Con có thể vẽ 1 hàng bằng print(\"*\" * m), hoặc bằng vòng trong in từng dấu * với end=\"\", rồi print() để xuống dòng.", en: "Read n and m with int(input()). The loop runs n times and draws 1 row each time. You can draw a row with print(\"*\" * m), or with an inner loop that prints each * with end=\"\", followed by print() to start a new line." }
      - { vi: "Cách ngắn nhất có 4 dòng: n = int(input()), m = int(input()), for hang in range(n):, rồi print(\"*\" * m) thụt lề 4 dấu cách.", en: "The shortest way has 4 lines: n = int(input()), m = int(input()), for hang in range(n):, then print(\"*\" * m) indented by 4 spaces." }
    test_eligible: true
  - id: s4.long-nhau.l2.ex2
    type: code
    concepts: [print-end-newline, nested-inner-full]
    prompt:
      vi: "Robo vẽ 1 thanh sô-cô-la bằng 1 ký tự. Ô Dữ liệu nhập có 3 dòng: dòng 1 là số hàng n, dòng 2 là số ô trên mỗi hàng m, dòng 3 là ký tự để vẽ. Code bên phải in mỗi ký tự trên 1 dòng riêng, vì 1 dòng đặt sai chỗ. Hãy sửa code để in ra n hàng, mỗi hàng có m ký tự viết liền nhau, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo draws a chocolate bar with one character. The Input data box has 3 lines: line 1 is the number of rows n, line 2 is the number of squares on each row m, and line 3 is the character to draw with. The code on the right prints each character on its own line, because 1 line is in the wrong place. Fix the code to print n rows, each row with m characters written next to each other, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      n = int(input())
      m = int(input())
      ky_tu = input()
      for hang in range(n):
          for o in range(m):
              print(ky_tu, end="")
              print()
    solution: |
      n = int(input())
      m = int(input())
      ky_tu = input()
      for hang in range(n):
          for o in range(m):
              print(ky_tu, end="")
          print()
    tests:
      - input: "2\n4\n#"
        output: |
          ####
          ####
      - input: "1\n1\no"
        output: "o"
        hidden: true
      - input: "3\n3\n@"
        output: |
          @@@
          @@@
          @@@
        hidden: true
      - input: "0\n6\n#"
        output: ""
        hidden: true
      - input: "4\n5\n="
        output: |
          =====
          =====
          =====
          =====
        hidden: true
    common_wrong:
      - test: 0
        output: "########"
        misconception: print-end-newline
        sample: |
          n = int(input())
          m = int(input())
          ky_tu = input()
          for hang in range(n):
              for o in range(m):
                  print(ky_tu, end="")
      - test: 0
        output: "\n####\n####"
        misconception: print-end-newline
        sample: |
          n = int(input())
          m = int(input())
          ky_tu = input()
          for hang in range(n):
              print()
              for o in range(m):
                  print(ky_tu, end="")
    hints:
      - { vi: "Dòng print() đang thụt lề 8 dấu cách, nên nó nằm trong vòng trong và xuống dòng sau mỗi ký tự. Con cần xuống dòng 1 lần sau mỗi hàng, tức là sau khi vòng trong đã chạy xong.", en: "The line print() is indented by 8 spaces, so it is inside the inner loop and starts a new line after every character. You need a new line once after each row, that is, after the inner loop is done." }
      - { vi: "Xóa 4 dấu cách ở đầu dòng print(), để nó thụt lề 4 dấu cách, thẳng hàng với dòng for o in range(m):.", en: "Delete 4 spaces at the start of the line print(), so that it is indented by 4 spaces, lined up with the line for o in range(m):." }
    test_eligible: true
  - id: s4.long-nhau.l2.q1
    type: predict
    concepts: [print-end-newline]
    code: |
      for i in range(2):
          for j in range(3):
              print(j, end="")
          print()
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "012012", misconception: print-end-newline }
      - { text: "0\n1\n2\n0\n1\n2", misconception: print-end-newline }
      - { text: "012\n012", correct: true }
      - { text: "123\n123", misconception: range-stop-excluded }
    explanation:
      vi: "Vòng trong in 0, 1, 2 liền nhau, vì end=\"\" không xuống dòng. Sau đó print() để trống chỉ in 1 ký tự xuống dòng, nên hàng sau bắt đầu ở dòng mới. Vòng ngoài chạy 2 lần, nên có 2 dòng 012."
      en: "The inner loop prints 0, 1, 2 next to each other, because end=\"\" does not start a new line. Then the empty print() prints just 1 new-line character, so the next row starts on a new line. The outer loop runs 2 times, so there are 2 lines of 012."
  - id: s4.long-nhau.l2.q2
    type: mcq
    concepts: [print-end-newline]
    code: |
      for i in range(3):
          for j in range(5):
              print("*", end="")
          print()
    prompt:
      vi: "Trong đoạn code vẽ hình chữ nhật này, dòng 4 làm việc gì?"
      en: "In this code that draws a rectangle, what does line 4 do?"
    choices:
      - { vi: "Kết thúc hàng vừa vẽ, để hàng sau ở dòng mới", en: "It ends the row just drawn, so the next row is on a new line", correct: true }
      - { vi: "In ra 1 dòng trống ở giữa 2 hàng dấu *", en: "It prints an empty line between 2 rows of * signs", misconception: print-end-newline }
      - { vi: "In thêm 1 dấu * ở cuối mỗi hàng", en: "It prints 1 more * at the end of each row", misconception: print-end-newline }
      - { vi: "Không làm gì, vì trong ngoặc tròn không có gì", en: "Nothing, because there is nothing inside the round brackets", misconception: print-end-newline }
    explanation:
      vi: "Vòng trong in 5 dấu * với end=\"\", nên Python vẫn đang in tiếp ở cuối hàng đó. print() để trống chỉ in 1 ký tự xuống dòng: nó kết thúc hàng này, chứ không tạo thêm 1 dòng trống. Thiếu dòng 4, cả 15 dấu * nằm trên cùng 1 dòng."
      en: "The inner loop prints 5 * signs with end=\"\", so Python is still printing at the end of that row. An empty print() prints just 1 new-line character: it ends this row and does not add an empty line. Without line 4, all 15 * signs would be on the same line."
---
Ở giai đoạn 1, con đã biết `"*" * 5` lặp lại chuỗi "*" 5 lần. Đặt lệnh đó trong 1 vòng lặp, Robo vẽ được 1 **hình chữ nhật**:

```python run
for hang in range(3):
    print("*" * 5)
```

Số lần lặp là số **hàng**: 3 hàng. Số sau dấu nhân là số dấu * trên mỗi hàng: 5 dấu *. Con thử đổi 2 số này rồi bấm Chạy thử.
---
Robo cũng vẽ được từng dấu * một, bằng 2 vòng lặp lồng nhau. Vòng trong in các dấu * của 1 hàng với `end=""`, để chúng nằm liền nhau trên cùng dòng. Sau vòng trong, `print()` để trống kết thúc hàng đó:

```python run
for hang in range(3):
    for cot in range(5):
        print("*", end="")
    print()
```

Dòng `print()` thụt lề 4 dấu cách, nên nó chạy 1 lần sau mỗi hàng. Cách này dài hơn, nhưng ở các bài sau, nó giúp con vẽ những hình mà mỗi hàng có nhiều ký tự khác nhau.
---
Vị trí của `print()` rất quan trọng. Nếu thiếu `print()`, Python không bao giờ xuống dòng, nên mọi dấu * nằm trên 1 dòng, và chữ Hết dính ngay sau chúng:

```python run
for hang in range(2):
    for cot in range(4):
        print("*", end="")
print("Hết")
```

Nếu `print()` thụt lề 8 dấu cách, nó nằm trong vòng trong và xuống dòng sau mỗi dấu *, nên mỗi dấu * nằm trên 1 dòng riêng. Con thử thêm dòng print() vào đoạn code trên ở 2 chỗ đó để xem.
---
Trong bài tập, con đọc số hàng và số cột bằng `input()`. Nếu quên `int()`, biến chỉ là 1 chuỗi, và Python không nhân được 1 chuỗi với 1 chuỗi khác:

```python run expect-error
m = "5"  # giống như m = input() khi con gõ 5
print("*" * m)
```

Python báo lỗi TypeError: can't multiply sequence by non-int of type 'str'. Nếu n là chuỗi, `range(n)` cũng báo lỗi TypeError. Con luôn viết `n = int(input())` để có 1 số nguyên.
