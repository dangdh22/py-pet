---
id: s4.for-range.l3
title: { vi: "range(a, b) và bước nhảy", en: "range(a, b) and steps" }
exercises:
  - id: s4.for-range.l3.ex1
    type: code
    concepts: [range-stop-excluded, range-start-step]
    prompt:
      vi: "Robo đếm từ a đến b. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số a, dòng 2 là số b, đều là số nguyên. Hãy in ra các số từ a đến b, có cả số b, mỗi số 1 dòng. Cuối cùng, luôn in ra dòng Hết, như phần Ví dụ. Nếu a lớn hơn b, Robo chỉ in ra Hết."
      en: "Robo counts from a to b. The Input data box has 2 lines: line 1 is the number a, and line 2 is the number b, both integers. Print the numbers from a to b, including b, one number on each line. At the end, always print the line Hết, as in the Example. If a is greater than b, Robo prints only Hết."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      a = int(input())
      b = int(input())
      for i in range(a, b + 1):
          print(i)
      print("Hết")
    tests:
      - input: "3\n7"
        output: |
          3
          4
          5
          6
          7
          Hết
      - input: "5\n5"
        output: |
          5
          Hết
        hidden: true
      - input: "8\n6"
        output: "Hết"
        hidden: true
      - input: "10\n13"
        output: |
          10
          11
          12
          13
          Hết
        hidden: true
    common_wrong:
      - test: 0
        output: |
          3
          4
          5
          6
          Hết
        misconception: range-stop-excluded
        sample: |
          a = int(input())
          b = int(input())
          for i in range(a, b):
              print(i)
          print("Hết")
    hints:
      - { vi: "range(a, b) bắt đầu từ a nhưng dừng trước b, nên thiếu số b. Muốn có cả b, con cho range dừng ở số ngay sau b.", en: "range(a, b) starts at a but stops before b, so b is missing. To include b, make the range stop at the number right after b." }
      - { vi: "Dòng for là for i in range(a, b + 1):. Bên trong vòng lặp là print(i). Dòng print(\"Hết\") sát lề trái.", en: "The for line is for i in range(a, b + 1):. Inside the loop is print(i). The line print(\"Hết\") starts at the left edge." }
    test_eligible: true
  - id: s4.for-range.l3.ex2
    type: code
    concepts: [range-start-step]
    prompt:
      vi: "Robo phóng tên lửa. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy đếm ngược từ n về 1, mỗi số 1 dòng, rồi in ra dòng Phóng!, như phần Ví dụ. Nếu n là 0, Robo chỉ in ra Phóng!."
      en: "Robo launches a rocket. The Input data box has 1 line: a number n, an integer that is not negative. Count down from n to 1, one number on each line, then print the line Phóng!, as in the Example. If n is 0, Robo prints only Phóng!."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(n, 0, -1):
          print(i)
      print("Phóng!")
    tests:
      - input: "5"
        output: |
          5
          4
          3
          2
          1
          Phóng!
      - input: "1"
        output: |
          1
          Phóng!
        hidden: true
      - input: "0"
        output: "Phóng!"
        hidden: true
      - input: "8"
        output: |
          8
          7
          6
          5
          4
          3
          2
          1
          Phóng!
        hidden: true
    common_wrong:
      - test: 0
        output: "Phóng!"
        misconception: range-start-step
        sample: |
          n = int(input())
          for i in range(n, 0):
              print(i)
          print("Phóng!")
      - test: 0
        output: |
          5
          4
          3
          2
          Phóng!
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          for i in range(n, 1, -1):
              print(i)
          print("Phóng!")
    hints:
      - { vi: "Đếm ngược thì bước nhảy là -1. range dừng trước số thứ hai, nên muốn có số 1 thì số thứ hai phải là 0.", en: "To count down, the step is -1. range stops before its second number, so to include 1, the second number must be 0." }
      - { vi: "Dòng for là for i in range(n, 0, -1):. Bên trong vòng lặp là print(i). Dòng print(\"Phóng!\") sát lề trái.", en: "The for line is for i in range(n, 0, -1):. Inside the loop is print(i). The line print(\"Phóng!\") starts at the left edge." }
    test_eligible: true
  - id: s4.for-range.l3.q1
    type: predict
    concepts: [range-start-step]
    code: |
      for i in range(1, 10, 3):
          print(i)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "3\n6\n9", misconception: range-start-step }
      - { text: "1\n4\n7", correct: true }
      - { text: "1\n4\n7\n10", misconception: range-stop-excluded }
      - { text: "1\n2\n3", misconception: range-start-step }
    explanation:
      vi: "range(1, 10, 3) bắt đầu từ 1, mỗi lần cộng thêm bước nhảy 3: 1, 4, 7. Số tiếp theo là 10, nhưng range dừng trước 10, nên 10 không có mặt. Số 3 là bước nhảy, không phải số lần lặp và không phải số bắt đầu."
      en: "range(1, 10, 3) starts at 1 and adds the step 3 each time: 1, 4, 7. The next number would be 10, but range stops before 10, so 10 is not there. The number 3 is the step, not the number of passes and not the start."
  - id: s4.for-range.l3.q2
    type: mcq
    concepts: [range-start-step, range-stop-excluded]
    prompt:
      vi: "Robo muốn biến i lần lượt là 3, 2, 1. Dòng for nào viết đúng?"
      en: "Robo wants the variable i to be 3, then 2, then 1. Which for line is written correctly?"
    choices:
      - { text: "for i in range(3, 1, -1):", misconception: range-stop-excluded }
      - { text: "for i in range(3, 0):", misconception: range-start-step }
      - { text: "for i in range(3, 0, -1):", correct: true }
      - { text: "for i in range(1, 4, -1):", misconception: range-start-step }
    explanation:
      vi: "Đếm ngược cần bắt đầu từ 3 và có bước nhảy -1. range dừng trước số thứ hai, nên muốn có số 1 thì số thứ hai là 0. Không có bước -1, range(3, 0) không cho số nào. range(1, 4, -1) cũng không cho số nào, vì đi lùi từ 1 thì không bao giờ tới 4."
      en: "Counting down needs to start at 3 with a step of -1. range stops before its second number, so to include 1 the second number is 0. Without the step -1, range(3, 0) gives no numbers. range(1, 4, -1) gives no numbers either, because going down from 1 never reaches 4."
---
range có thể bắt đầu từ 1 số khác 0. Với `range(1, 6)`, số thứ nhất là chỗ **bắt đầu**, số thứ hai là chỗ **dừng**:

```python run
for i in range(1, 6):
    print(i)
```

Python in ra 1, 2, 3, 4, 5. Giống như range(n), range(a, b) dừng **trước** b, nên không có số 6.
---
Con có thể thêm số thứ ba: **bước nhảy**. Bước nhảy là số được cộng thêm sau mỗi lần lặp. Robo nhảy cóc, mỗi lần 2 bậc:

```python run
for i in range(0, 11, 2):
    print("Robo đứng ở bậc", i)
```

i lần lượt là 0, 2, 4, 6, 8, 10. Số 11 là chỗ dừng, nên Python dừng sau số 10.
---
Bước nhảy là số âm thì range **đếm ngược**. Robo đếm ngược để phóng tên lửa:

```python run
for i in range(10, 0, -1):
    print(i)
print("Phóng!")
```

i đi từ 10 xuống 1. range vẫn dừng trước số thứ hai, nên không có số 0.
---
Nếu số bắt đầu lớn hơn số dừng mà không có bước nhảy âm, range không có số nào. Khi đó vòng lặp không chạy lần nào:

```python run
for i in range(5, 1):
    print(i)
print("Robo chưa đếm được số nào")
```

Muốn đếm từ 5 xuống 2, con viết `range(5, 1, -1)`. Con thử sửa dòng 1 rồi bấm Chạy thử.
