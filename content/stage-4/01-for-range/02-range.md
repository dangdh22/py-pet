---
id: s4.for-range.l2
title: { vi: "range(n) đếm từ 0", en: "range(n) counts from 0" }
exercises:
  - id: s4.for-range.l2.ex1
    type: code
    concepts: [range-stop-excluded, loop-variable]
    prompt:
      vi: "Robo tập đếm. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy đọc n, rồi dùng vòng lặp for để in ra các số từ 0 đến n - 1, mỗi số 1 dòng. Cuối cùng, luôn in ra dòng Robo đếm xong, đúng như phần Ví dụ. Nếu n là 0, Robo chỉ in ra Robo đếm xong."
      en: "Robo is practising counting. The Input data box has 1 line: a number n, an integer that is not negative. Read n, then use a for loop to print the numbers from 0 to n - 1, one number on each line. At the end, always print the line Robo đếm xong, exactly as in the Example. If n is 0, Robo prints only Robo đếm xong."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(n):
          print(i)
      print("Robo đếm xong")
    tests:
      - input: "4"
        output: |
          0
          1
          2
          3
          Robo đếm xong
      - input: "1"
        output: |
          0
          Robo đếm xong
        hidden: true
      - input: "0"
        output: "Robo đếm xong"
        hidden: true
      - input: "7"
        output: |
          0
          1
          2
          3
          4
          5
          6
          Robo đếm xong
        hidden: true
    common_wrong:
      - test: 0
        output: |
          4
          4
          4
          4
          Robo đếm xong
        misconception: loop-variable
        sample: |
          n = int(input())
          for i in range(n):
              print(n)
          print("Robo đếm xong")
    hints:
      - { vi: "Đọc n bằng n = int(input()), rồi viết for i in range(n):. range(n) cho các số từ 0 đến n - 1, và mỗi lần lặp, biến i giữ 1 số trong đó. Bên trong vòng lặp, con in i chứ không in n.", en: "Read n with n = int(input()), then write for i in range(n):. range(n) gives the numbers from 0 to n - 1, and on each pass the variable i holds one of them. Inside the loop, print i, not n." }
      - { vi: "Chương trình có 4 dòng: n = int(input()), rồi for i in range(n):, rồi print(i) thụt lề 4 dấu cách, và cuối cùng là print(\"Robo đếm xong\") sát lề trái.", en: "The program has 4 lines: n = int(input()), then for i in range(n):, then print(i) indented by 4 spaces, and last print(\"Robo đếm xong\") at the left edge." }
    test_eligible: true
  - id: s4.for-range.l2.q1
    type: predict
    concepts: [range-stop-excluded, loop-variable]
    code: |
      for i in range(4):
          print(i)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1\n2\n3\n4", misconception: range-stop-excluded }
      - { text: "0\n1\n2\n3\n4", misconception: range-stop-excluded }
      - { text: "i\ni\ni\ni", misconception: loop-variable }
      - { text: "0\n1\n2\n3", correct: true }
    explanation:
      vi: "range(4) bắt đầu từ 0 và dừng trước 4, nên cho 4 số: 0, 1, 2, 3. Mỗi lần lặp, i giữ 1 số trong đó, và print(i) in ra giá trị của i. i không có dấu nháy, nên Python không in ra chữ i."
      en: "range(4) starts at 0 and stops before 4, so it gives 4 numbers: 0, 1, 2, 3. On each pass, i holds one of them, and print(i) prints the value of i. i has no quotes, so Python does not print the letter i."
  - id: s4.for-range.l2.q2
    type: mcq
    concepts: [range-stop-excluded]
    prompt:
      vi: "Trong vòng lặp for i in range(6):, biến i lần lượt nhận những số nào?"
      en: "In the loop for i in range(6):, which numbers does the variable i take, one after another?"
    choices:
      - { vi: "Từ 1 đến 6", en: "From 1 to 6", misconception: range-stop-excluded }
      - { vi: "Từ 0 đến 5", en: "From 0 to 5", correct: true }
      - { vi: "Từ 0 đến 6", en: "From 0 to 6", misconception: range-stop-excluded }
      - { vi: "Từ 1 đến 5", en: "From 1 to 5", misconception: range-stop-excluded }
    explanation:
      vi: "range(6) bắt đầu từ 0 và dừng ngay trước 6, nên i nhận 0, 1, 2, 3, 4, 5. Đó là đủ 6 số, nên vòng lặp chạy 6 lần, nhưng số 6 không có mặt."
      en: "range(6) starts at 0 and stops just before 6, so i takes 0, 1, 2, 3, 4, 5. That is 6 numbers, so the loop runs 6 times, but the number 6 is not there."
---
Trong dòng `for i in range(5):`, **i** là 1 biến. Mỗi lần lặp, Python tự cho i 1 số mới. Con in i ra để xem:

```python run
for i in range(5):
    print(i)
```

Python in ra 0, 1, 2, 3, 4, mỗi số 1 dòng. Lần lặp đầu tiên, i là 0. Lần lặp sau, i là 1, và cứ thế tăng dần.
---
`range(5)` **bắt đầu từ 0** và **dừng trước 5**, nên không có số 5. Từ 0 đến 4 vẫn là đủ 5 số, vì vậy vòng lặp chạy đúng 5 lần.

```python run
for i in range(3):
    print("Lần lặp có i =", i)
print("Không có lần lặp nào với i = 3")
```

Con nhớ: `range(n)` cho n số, từ 0 đến n - 1.
---
Số trong ngoặc của range có thể là 1 biến. Khi n bằng 0, range(0) không có số nào, nên vòng lặp không chạy lần nào:

```python run
n = 4
for i in range(n):
    print("Bước", i)
print("Robo dừng lại")
```

Con thử đổi n thành 1, rồi thành 0. Với n bằng 0, Python chỉ in ra Robo dừng lại. Trong bài tập, con đọc n từ ô Dữ liệu nhập bằng `n = int(input())`, rồi viết `for i in range(n):`.
