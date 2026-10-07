---
id: s4.long-nhau.l5
title: { vi: "Kim tự tháp", en: "Pyramids" }
exercises:
  - id: s4.long-nhau.l5.ex1
    type: code
    concepts: [leading-spaces]
    prompt:
      vi: "Robo vẽ 1 tam giác dựa vào lề phải. Ô Dữ liệu nhập có 1 dòng: số hàng n, là số nguyên không âm. Hàng thứ i có n - i dấu cách ở đầu hàng, rồi i dấu * viết liền nhau. Ví dụ với n là 4, hàng 1 có 3 dấu cách rồi 1 dấu *, còn hàng 4 không có dấu cách nào. Hình này có dấu cách ở đầu hàng, nên các dấu * thẳng hàng ở bên phải, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo draws a triangle that leans on the right edge. The Input data box has 1 line: the number of rows n, an integer that is not negative. Row i has n - i spaces at the start of the row, then i * signs next to each other. For example, with n equal to 4, row 1 has 3 spaces and then 1 *, and row 4 has no spaces at all. This shape has spaces at the start of the rows, so the * signs line up on the right, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(1, n + 1):
          print(" " * (n - i) + "*" * i)
    tests:
      - input: "4"
        output: "   *\n  **\n ***\n****"
      - input: "1"
        output: "*"
        hidden: true
      - input: "0"
        output: ""
        hidden: true
      - input: "6"
        output: "     *\n    **\n   ***\n  ****\n *****\n******"
        hidden: true
    common_wrong:
      - test: 0
        output: "    *\n   **\n  ***\n ****"
        misconception: leading-spaces
        sample: |
          n = int(input())
          for i in range(1, n + 1):
              print(" " * (n - i), "*" * i)
      - test: 0
        output: " *\n  **\n   ***\n    ****"
        misconception: leading-spaces
        sample: |
          n = int(input())
          for i in range(1, n + 1):
              print(" " * i + "*" * i)
    hints:
      - { vi: "Mỗi hàng là 1 chuỗi dấu cách nối với 1 chuỗi dấu *. Hàng thứ i cần \" \" * (n - i) và \"*\" * i. Con nối 2 chuỗi bằng dấu +, vì dấu phẩy thêm 1 dấu cách thừa ở giữa.", en: "Each row is a string of spaces joined to a string of * signs. Row i needs \" \" * (n - i) and \"*\" * i. Join the 2 strings with +, because a comma adds an extra space between them." }
      - { vi: "Chương trình có 3 dòng: n = int(input()), rồi for i in range(1, n + 1):, rồi print(\" \" * (n - i) + \"*\" * i) thụt lề 4 dấu cách.", en: "The program has 3 lines: n = int(input()), then for i in range(1, n + 1):, then print(\" \" * (n - i) + \"*\" * i) indented by 4 spaces." }
    test_eligible: true
  - id: s4.long-nhau.l5.ex2
    type: code
    concepts: [leading-spaces, row-col-pattern]
    prompt:
      vi: "Robo vẽ 1 kim tự tháp. Ô Dữ liệu nhập có 1 dòng: số hàng n, là số nguyên không âm. Hàng thứ i có n - i dấu cách ở đầu hàng, rồi 2 * i - 1 dấu * viết liền nhau. Ví dụ với n là 3, hàng 1 có 2 dấu cách rồi 1 dấu *, hàng 2 có 1 dấu cách rồi 3 dấu *, hàng 3 không có dấu cách và có 5 dấu *. Hình có dấu cách ở đầu hàng, đúng như phần Ví dụ. Nếu n là 0, Robo không in ra gì."
      en: "Robo draws a pyramid. The Input data box has 1 line: the number of rows n, an integer that is not negative. Row i has n - i spaces at the start of the row, then 2 * i - 1 * signs next to each other. For example, with n equal to 3, row 1 has 2 spaces and then 1 *, row 2 has 1 space and then 3 * signs, and row 3 has no spaces and 5 * signs. The shape has spaces at the start of the rows, exactly as in the Example. If n is 0, Robo prints nothing."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(1, n + 1):
          print(" " * (n - i) + "*" * (2 * i - 1))
    tests:
      - input: "3"
        output: "  *\n ***\n*****"
      - input: "1"
        output: "*"
        hidden: true
      - input: "0"
        output: ""
        hidden: true
      - input: "5"
        output: "    *\n   ***\n  *****\n *******\n*********"
        hidden: true
    common_wrong:
      - test: 0
        output: "  *\n **\n***"
        misconception: row-col-pattern
        sample: |
          n = int(input())
          for i in range(1, n + 1):
              print(" " * (n - i) + "*" * i)
      - test: 0
        output: "   *\n  ***\n *****"
        misconception: leading-spaces
        sample: |
          n = int(input())
          for i in range(1, n + 1):
              print(" " * (n - i), "*" * (2 * i - 1))
    hints:
      - { vi: "Số dấu * ở các hàng là 1, 3, 5, ..., mỗi hàng thêm 2 dấu *, nên hàng thứ i có 2 * i - 1 dấu *. Số dấu cách ở đầu hàng giảm dần, từ n - 1 ở hàng 1 xuống 0 ở hàng n.", en: "The numbers of * signs on the rows are 1, 3, 5, ..., 2 more on each row, so row i has 2 * i - 1 * signs. The number of spaces at the start of a row goes down, from n - 1 on row 1 to 0 on row n." }
      - { vi: "Chương trình có 3 dòng: n = int(input()), rồi for i in range(1, n + 1):, rồi print(\" \" * (n - i) + \"*\" * (2 * i - 1)) thụt lề 4 dấu cách.", en: "The program has 3 lines: n = int(input()), then for i in range(1, n + 1):, then print(\" \" * (n - i) + \"*\" * (2 * i - 1)) indented by 4 spaces." }
    test_eligible: true
  - id: s4.long-nhau.l5.q1
    type: predict
    concepts: [leading-spaces]
    code: |
      for i in range(1, 4):
          print("." * (3 - i), "*" * i)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "..*\n.**\n***", misconception: leading-spaces }
      - { text: ".. *\n. **\n***", misconception: leading-spaces }
      - { text: ".. *\n. **\n ***", correct: true }
      - { text: ". *\n.. **\n... ***", misconception: row-col-pattern }
    explanation:
      vi: "Dấu phẩy trong print luôn thêm 1 dấu cách giữa 2 giá trị, kể cả khi giá trị đầu là chuỗi rỗng. Ở hàng 3, \".\" * 0 là chuỗi rỗng, nhưng vẫn có 1 dấu cách trước ***. Số dấu chấm là 3 - i, nên giảm dần: 2, 1, 0."
      en: "A comma in print always adds 1 space between 2 values, even when the first value is an empty string. On row 3, \".\" * 0 is an empty string, but there is still 1 space before ***. The number of dots is 3 - i, so it goes down: 2, 1, 0."
  - id: s4.long-nhau.l5.q2
    type: mcq
    concepts: [leading-spaces, row-col-pattern]
    prompt:
      vi: "Robo vẽ 1 kim tự tháp có 5 hàng, hàng dưới cùng không có dấu cách ở đầu. Hàng thứ i có bao nhiêu dấu cách ở đầu và bao nhiêu dấu *?"
      en: "Robo draws a pyramid with 5 rows, and the bottom row has no spaces at the start. How many spaces at the start and how many * signs does row i have?"
    choices:
      - { vi: "i dấu cách và 2 * i - 1 dấu *", en: "i spaces and 2 * i - 1 * signs", misconception: leading-spaces }
      - { vi: "5 - i dấu cách và 2 * i - 1 dấu *", en: "5 - i spaces and 2 * i - 1 * signs", correct: true }
      - { vi: "5 - i dấu cách và i dấu *", en: "5 - i spaces and i * signs", misconception: row-col-pattern }
      - { vi: "5 - i dấu cách và 2 * i dấu *", en: "5 - i spaces and 2 * i * signs", misconception: row-col-pattern }
    explanation:
      vi: "Hàng dưới cùng là hàng 5 và không có dấu cách, nên số dấu cách là 5 - i: hàng 1 có 4, hàng 5 có 0. Đỉnh tháp có 1 dấu *, và mỗi hàng thêm 2 dấu *, nên số dấu * là 1, 3, 5, 7, 9, tức là 2 * i - 1. Với i dấu *, hình là 1 tam giác lệch, không phải kim tự tháp."
      en: "The bottom row is row 5 and has no spaces, so the number of spaces is 5 - i: row 1 has 4, and row 5 has 0. The top has 1 *, and each row adds 2 more, so the numbers of * signs are 1, 3, 5, 7, 9, that is, 2 * i - 1. With i * signs, the shape is a leaning triangle, not a pyramid."
---
Để vẽ 1 tam giác dựa vào **lề phải**, mỗi hàng cần vài **dấu cách ở đầu hàng**. Dấu cách không nhìn thấy được, nên trước tiên con vẽ bằng dấu chấm thay cho dấu cách:

```python run
n = 4
for i in range(1, n + 1):
    print("." * (n - i) + "*" * i)
```

Hàng thứ i có n - i dấu chấm rồi i dấu `*`, nên hàng nào cũng dài đúng n ký tự. Khi hình đã đúng, con đổi dấu chấm thành dấu cách:

```python run
n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * i)
```
---
**Kim tự tháp** có đỉnh ở giữa. Con đếm từng hàng với n là 4: hàng 1 có 3 dấu cách và 1 dấu `*`, hàng 2 có 2 dấu cách và 3 dấu `*`, hàng 3 có 1 dấu cách và 5 dấu `*`, hàng 4 có 7 dấu `*`.

```python run
n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
```

Số dấu cách vẫn là n - i. Mỗi hàng thêm 2 dấu `*`, nên hàng thứ i có 2 * i - 1 dấu `*`.
---
Con nối dấu cách với dấu `*` bằng dấu **+**, không dùng dấu phẩy. Dấu phẩy trong print luôn thêm 1 dấu cách ở giữa, nên hình bị lệch:

```python run
print("." * 2, "*")
print("." * 2 + "*")
```

Dòng 1 in ra .. * với 1 dấu cách thừa. Khi chấm bài, Robo so sánh cả dấu cách ở đầu dòng, nên dấu cách thừa ở đầu làm bài bị sai. Còn dấu cách ở cuối dòng thì Robo bỏ qua, nên con không cần in dấu cách sau dấu `*` cuối cùng.
---
Robo cũng vẽ được kim tự tháp bằng vòng lặp lồng. Trong vòng ngoài có 2 vòng trong, chạy lần lượt: vòng thứ nhất in các dấu cách, vòng thứ hai in các dấu `*`, rồi `print()` xuống dòng.

```python run
n = 3
for i in range(1, n + 1):
    for j in range(n - i):
        print(" ", end="")
    for j in range(2 * i - 1):
        print("*", end="")
    print()
```

Cả 2 cách đều cho cùng 1 hình. Con chọn cách nào con thấy dễ hiểu hơn.
