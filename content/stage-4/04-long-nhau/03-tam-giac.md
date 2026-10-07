---
id: s4.long-nhau.l3
title: { vi: "Tam giác", en: "Triangles" }
exercises:
  - id: s4.long-nhau.l3.ex1
    type: code
    concepts: [row-col-pattern]
    prompt:
      vi: "Robo vẽ 1 tam giác bằng dấu *. Ô Dữ liệu nhập có 1 dòng: số hàng n, là số nguyên không âm. Hàng thứ nhất có 1 dấu *, hàng thứ hai có 2 dấu *, và cứ thế đến hàng thứ n có n dấu *. Các dấu * viết liền nhau, không có dấu cách ở đầu hàng, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo draws a triangle with the sign *. The Input data box has 1 line: the number of rows n, an integer that is not negative. The first row has 1 *, the second row has 2 * signs, and so on up to row n with n * signs. The * signs are written next to each other, with no spaces at the start of a row, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(1, n + 1):
          print("*" * i)
    tests:
      - input: "4"
        output: |
          *
          **
          ***
          ****
      - input: "1"
        output: "*"
        hidden: true
      - input: "0"
        output: ""
        hidden: true
      - input: "6"
        output: |
          *
          **
          ***
          ****
          *****
          ******
        hidden: true
    common_wrong:
      - test: 0
        output: "\n*\n**\n***"
        misconception: row-col-pattern
        sample: |
          n = int(input())
          for i in range(n):
              print("*" * i)
      - test: 0
        output: |
          *
          **
          ***
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          for i in range(1, n):
              print("*" * i)
    hints:
      - { vi: "Hàng thứ i có i dấu *, nên mỗi lần lặp con in \"*\" * i. Các hàng đánh số từ 1 đến n, có cả n, nên i phải đi từ 1 đến n.", en: "Row i has i * signs, so on each pass print \"*\" * i. The rows are numbered from 1 to n, including n, so i must go from 1 to n." }
      - { vi: "Chương trình có 3 dòng: n = int(input()), rồi for i in range(1, n + 1):, rồi print(\"*\" * i) thụt lề 4 dấu cách.", en: "The program has 3 lines: n = int(input()), then for i in range(1, n + 1):, then print(\"*\" * i) indented by 4 spaces." }
    test_eligible: true
  - id: s4.long-nhau.l3.ex2
    type: code
    concepts: [row-col-pattern, range-start-step]
    prompt:
      vi: "Robo vẽ 1 cầu trượt bằng dấu #, là 1 tam giác ngược. Ô Dữ liệu nhập có 1 dòng: số hàng n, là số nguyên không âm. Hàng thứ nhất có n dấu #, mỗi hàng sau ít hơn hàng trước 1 dấu #, và hàng cuối cùng có 1 dấu #. Các dấu # viết liền nhau, không có dấu cách ở đầu hàng, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo draws a slide with the sign #, as an upside-down triangle. The Input data box has 1 line: the number of rows n, an integer that is not negative. The first row has n # signs, each row after it has 1 # fewer than the row before, and the last row has 1 #. The # signs are written next to each other, with no spaces at the start of a row, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(n, 0, -1):
          print("#" * i)
    tests:
      - input: "4"
        output: |
          ####
          ###
          ##
          #
      - input: "1"
        output: "#"
        hidden: true
      - input: "0"
        output: ""
        hidden: true
      - input: "5"
        output: |
          #####
          ####
          ###
          ##
          #
        hidden: true
    common_wrong:
      - test: 0
        output: |
          ####
          ###
          ##
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          for i in range(n, 1, -1):
              print("#" * i)
      - test: 0
        output: ""
        misconception: range-start-step
        sample: |
          n = int(input())
          for i in range(n, 0):
              print("#" * i)
    hints:
      - { vi: "Số dấu # giảm dần từ n xuống 1, nên i đếm ngược với bước nhảy -1. range dừng trước số thứ hai, nên muốn có hàng 1 dấu # thì số thứ hai phải là 0.", en: "The number of # signs goes down from n to 1, so i counts down with a step of -1. range stops before its second number, so to get the row with 1 #, the second number must be 0." }
      - { vi: "Chương trình có 3 dòng: n = int(input()), rồi for i in range(n, 0, -1):, rồi print(\"#\" * i) thụt lề 4 dấu cách.", en: "The program has 3 lines: n = int(input()), then for i in range(n, 0, -1):, then print(\"#\" * i) indented by 4 spaces." }
    test_eligible: true
  - id: s4.long-nhau.l3.q1
    type: predict
    concepts: [row-col-pattern, nested-inner-full]
    code: |
      for i in range(1, 4):
          for j in range(1, i + 1):
              print(j, end="")
          print()
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "123\n123\n123", misconception: row-col-pattern }
      - { text: "1\n22\n333", misconception: loop-variable }
      - { text: "1\n12\n123", correct: true }
      - { text: "12\n123\n1234", misconception: range-stop-excluded }
    explanation:
      vi: "Vòng trong chạy từ 1 đến i, nên số lần lặp của nó thay đổi theo i: hàng 1 có 1 số, hàng 2 có 2 số, hàng 3 có 3 số. Mỗi hàng in giá trị của j, nên hàng nào cũng bắt đầu từ 1. range(1, i + 1) dừng trước i + 1, nên số lớn nhất của hàng là i."
      en: "The inner loop runs from 1 to i, so how many times it runs changes with i: row 1 has 1 number, row 2 has 2 numbers, row 3 has 3 numbers. Each row prints the value of j, so every row starts at 1. range(1, i + 1) stops before i + 1, so the biggest number in a row is i."
  - id: s4.long-nhau.l3.q2
    type: mcq
    concepts: [row-col-pattern, range-start-step]
    prompt:
      vi: "Robo muốn vẽ 1 tam giác ngược có 5 hàng: hàng đầu có 5 dấu *, hàng cuối có 1 dấu *. Bên dưới dòng for là print(\"*\" * i). Dòng for nào viết đúng?"
      en: "Robo wants to draw an upside-down triangle with 5 rows: the first row has 5 * signs and the last row has 1 *. Under the for line is print(\"*\" * i). Which for line is written correctly?"
    choices:
      - { text: "for i in range(5, 0, -1):", correct: true }
      - { text: "for i in range(5, 1, -1):", misconception: range-stop-excluded }
      - { text: "for i in range(5):", misconception: row-col-pattern }
      - { text: "for i in range(5, 0):", misconception: range-start-step }
    explanation:
      vi: "Số dấu * ở mỗi hàng là i, nên i phải đi từ 5 xuống 1. Đếm ngược cần bước nhảy -1, và range dừng trước số thứ hai, nên số thứ hai là 0. range(5, 1, -1) thiếu hàng có 1 dấu *. range(5) đếm lên từ 0, nên hàng đầu là 1 dòng trống. range(5, 0) không có số nào."
      en: "The number of * signs on a row is i, so i must go from 5 down to 1. Counting down needs a step of -1, and range stops before its second number, so the second number is 0. range(5, 1, -1) misses the row with 1 *. range(5) counts up from 0, so the first row is an empty line. range(5, 0) has no numbers at all."
---
Robo vẽ 1 **tam giác**. Con đếm số dấu * ở từng hàng: hàng 1 có 1 dấu *, hàng 2 có 2 dấu *, hàng 3 có 3 dấu *. Quy luật là: **hàng thứ i có i dấu** `*`.

```python run
for i in range(1, 5):
    print("*" * i)
```

Các hàng đánh số từ 1 đến 4, nên con dùng `range(1, 5)`. Với n hàng, con dùng `range(1, n + 1)`.
---
Nếu con dùng `range(4)`, i bắt đầu từ 0. Lần lặp đầu tiên in `"*" * 0`, tức là 1 chuỗi rỗng, nên Python in ra 1 dòng trống. Hàng cuối cùng cũng thiếu 1 dấu *:

```python run
for i in range(4):
    print("*" * i)
print("Hết")
```

Kết quả có 1 dòng trống ở trên cùng, và hàng dài nhất chỉ có 3 dấu *. Trước khi viết code, con hãy vẽ hình ra giấy và ghi số dấu * bên cạnh từng hàng.
---
Với 2 vòng lặp lồng nhau, vòng trong chạy i lần: số lần lặp của vòng trong thay đổi theo vòng ngoài.

```python run
for i in range(1, 5):
    for j in range(i):
        print("*", end="")
    print()
```

Khi i là 1, vòng trong in 1 dấu *. Khi i là 4, vòng trong in 4 dấu *. Sau mỗi hàng, `print()` xuống dòng.
---
**Tam giác ngược** có hàng đầu dài nhất. Con cho i đếm ngược bằng bước nhảy -1:

```python run
for i in range(4, 0, -1):
    print("*" * i)
```

i lần lượt là 4, 3, 2, 1. range dừng trước 0, nên không có dòng trống ở cuối. Con thử đổi số 4 thành 6 rồi bấm Chạy thử.
