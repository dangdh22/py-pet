---
id: s4.chu-so.l3
title: { vi: "Ước số", en: "Divisors" }
exercises:
  - id: s4.chu-so.l3.ex1
    type: code
    concepts: [divisor-loop]
    prompt:
      vi: "Robo tìm mọi ước của 1 số. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên lớn hơn 0. Hãy dùng vòng lặp for để in ra mọi ước của n, từ nhỏ đến lớn, mỗi ước 1 dòng, đúng như phần Ví dụ. Nhớ rằng 1 và chính n cũng là ước của n."
      en: "Robo finds every divisor of a number. The Input data box has 1 line: a number n, an integer greater than 0. Use a for loop to print every divisor of n, from the smallest to the largest, one divisor on each line, exactly as in the Example. Remember that 1 and n itself are divisors of n too."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(1, n + 1):
          if n % i == 0:
              print(i)
    tests:
      - input: "12"
        output: |
          1
          2
          3
          4
          6
          12
      - input: "1"
        output: "1"
        hidden: true
      - input: "7"
        output: |
          1
          7
        hidden: true
      - input: "36"
        output: |
          1
          2
          3
          4
          6
          9
          12
          18
          36
        hidden: true
    common_wrong:
      - test: 0
        output: |
          1
          2
          3
          4
          6
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          for i in range(1, n):
              if n % i == 0:
                  print(i)
    hints:
      - { vi: "Cho i chạy từ 1 đến n, có cả n, nên con dùng range(1, n + 1). Mỗi lần lặp, nếu n chia hết cho i, tức là n % i == 0, thì i là 1 ước của n và con in i ra.", en: "Let i go from 1 to n, n included, so use range(1, n + 1). On each pass, if n can be divided by i, that is n % i == 0, then i is a divisor of n and you print i." }
      - { vi: "Chương trình có 4 dòng: n = int(input()), rồi for i in range(1, n + 1):, rồi if n % i == 0: thụt lề 4 dấu cách, và print(i) thụt lề 8 dấu cách.", en: "The program has 4 lines: n = int(input()), then for i in range(1, n + 1):, then if n % i == 0: indented by 4 spaces, and print(i) indented by 8 spaces." }
    test_eligible: true
  - id: s4.chu-so.l3.ex2
    type: code
    concepts: [divisor-loop, count-if]
    prompt:
      vi: "Robo đếm xem 1 số có bao nhiêu ước. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên lớn hơn 0. Hãy dùng vòng lặp for và 1 biến đếm, rồi in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo counts how many divisors a number has. The Input data box has 1 line: a number n, an integer greater than 0. Use a for loop and a counter variable, then print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      dem = 0
      for i in range(1, n + 1):
          if n % i == 0:
              dem += 1
      print("Số", n, "có", dem, "ước")
    tests:
      - input: "12"
        output: "Số 12 có 6 ước"
      - input: "1"
        output: "Số 1 có 1 ước"
        hidden: true
      - input: "13"
        output: "Số 13 có 2 ước"
        hidden: true
      - input: "36"
        output: "Số 36 có 9 ước"
        hidden: true
      - input: "60"
        output: "Số 60 có 12 ước"
        hidden: true
    common_wrong:
      - test: 0
        output: "Số 12 có 5 ước"
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          dem = 0
          for i in range(1, n):
              if n % i == 0:
                  dem += 1
          print("Số", n, "có", dem, "ước")
      - test: 0
        output: "Số 12 có 28 ước"
        misconception: count-if
        sample: |
          n = int(input())
          dem = 0
          for i in range(1, n + 1):
              if n % i == 0:
                  dem += i
          print("Số", n, "có", dem, "ước")
    hints:
      - { vi: "Đặt dem = 0 trước vòng lặp. Cho i chạy từ 1 đến n bằng range(1, n + 1). Chỉ khi n % i == 0, con mới cộng thêm 1 vào dem, nên dòng dem += 1 nằm trong khối của if.", en: "Set dem = 0 before the loop. Let i go from 1 to n with range(1, n + 1). Only when n % i == 0 do you add 1 to dem, so the line dem += 1 goes inside the if block." }
      - { vi: "Chương trình: n = int(input()), dem = 0, for i in range(1, n + 1):, if n % i == 0: thụt lề 4 dấu cách, dem += 1 thụt lề 8 dấu cách. Cuối cùng, sát lề trái: print(\"Số\", n, \"có\", dem, \"ước\").", en: "The program: n = int(input()), dem = 0, for i in range(1, n + 1):, if n % i == 0: indented by 4 spaces, dem += 1 indented by 8 spaces. Last, at the left edge: print(\"Số\", n, \"có\", dem, \"ước\")." }
    test_eligible: true
  - id: s4.chu-so.l3.q1
    type: predict
    concepts: [divisor-loop]
    code: |
      n = 10
      for i in range(1, n):
          if n % i == 0:
              print(i)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1\n2\n5\n10", misconception: range-stop-excluded }
      - { text: "2\n5", misconception: divisor-loop }
      - { text: "1\n3\n7\n9", misconception: divisible-check }
      - { text: "1\n2\n5", correct: true }
    explanation:
      vi: "range(1, n) là range(1, 10), cho i từ 1 đến 9, không có 10. Trong các số đó, 10 chia hết cho 1, 2 và 5, nên đoạn code in ra 1, 2, 5. Số 10 cũng là ước của 10, nhưng i không bao giờ bằng 10. Muốn có cả n, con dùng range(1, n + 1)."
      en: "range(1, n) is range(1, 10), which gives i from 1 to 9, without 10. Of those numbers, 10 can be divided by 1, 2 and 5, so the code prints 1, 2, 5. 10 is also a divisor of 10, but i is never 10. To include n, use range(1, n + 1)."
  - id: s4.chu-so.l3.q2
    type: mcq
    concepts: [divisor-loop]
    prompt:
      vi: "Trong vòng lặp for i in range(1, n + 1):, điều kiện nào đúng khi và chỉ khi i là ước của n?"
      en: "In the loop for i in range(1, n + 1):, which condition is True exactly when i is a divisor of n?"
    choices:
      - { text: "i % n == 0", misconception: divisor-loop }
      - { text: "n % i == 0", correct: true }
      - { text: "n // i == 0", misconception: floor-div }
      - { text: "n % i != 0", misconception: divisible-check }
    explanation:
      vi: "i là ước của n khi n chia cho i không dư, tức là n % i == 0. Viết ngược thành i % n == 0 là hỏi n có phải ước của i không. n // i == 0 chỉ đúng khi i lớn hơn n. Còn n % i != 0 nghĩa là n không chia hết cho i."
      en: "i is a divisor of n when n divided by i leaves no remainder, that is n % i == 0. Writing it the other way round, i % n == 0, asks whether n is a divisor of i. n // i == 0 is True only when i is greater than n. And n % i != 0 means n cannot be divided by i."
---
Số i là **ước** của n khi n chia cho i không dư, tức là `n % i == 0`. Ví dụ: 12 viên kẹo chia đều cho 3 bạn thì vừa hết, nên 3 là ước của 12. Muốn tìm mọi ước của n, Robo thử từng số i từ 1 đến n:

```python run
n = 12
for i in range(1, n + 1):
    if n % i == 0:
        print(i, "là ước của", n)
```

12 có 6 ước: 1, 2, 3, 4, 6 và 12. Số nào cũng chia hết cho 1 và cho chính nó, nên 1 và n luôn là ước của n. Vì vậy con dùng `range(1, n + 1)`, để i đi tới cả n.
---
Nếu con dùng `range(n)`, i bắt đầu từ 0. Ở lần lặp đầu tiên, Python phải tính `n % 0`, và phép chia lấy dư cho 0 cũng là chia cho 0:

```python run expect-error
n = 12
for i in range(n):
    if n % i == 0:
        print(i)
```

Lời báo lỗi là ZeroDivisionError. Không ai chia được 12 viên kẹo cho 0 bạn, nên số 0 không bao giờ là ước. Khi tìm ước, con luôn bắt đầu từ 1.
---
Muốn **đếm ước**, con dùng 1 biến đếm, và chỉ tăng nó khi `n % i == 0`:

```python run
n = 12
dem = 0
for i in range(1, n + 1):
    if n % i == 0:
        dem += 1
print("Số", n, "có", dem, "ước")
```

Thử đổi n thành 7 rồi bấm Chạy thử: 7 chỉ có 2 ước là 1 và 7. Số 1 thì chỉ có 1 ước, là chính nó.
