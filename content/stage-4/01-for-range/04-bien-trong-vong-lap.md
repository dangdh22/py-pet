---
id: s4.for-range.l4
title: { vi: "Dùng i trong phép tính", en: "Using i in calculations" }
exercises:
  - id: s4.for-range.l4.ex1
    type: code
    concepts: [loop-variable, range-stop-excluded]
    prompt:
      vi: "Robo đọc bảng nhân. Ô Dữ liệu nhập có 1 dòng: 1 số nguyên. Hãy in ra bảng nhân của số đó, từ nhân 1 đến nhân 10, mỗi phép nhân 1 dòng, đúng như phần Ví dụ."
      en: "Robo reads a times table. The Input data box has 1 line: an integer. Print the times table of that number, from times 1 to times 10, one multiplication on each line, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      for i in range(1, 11):
          print(so, "x", i, "=", so * i)
    tests:
      - input: "3"
        output: |
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
      - input: "7"
        output: |
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
        hidden: true
    common_wrong:
      - test: 0
        output: |
          3 x 0 = 0
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
          so = int(input())
          for i in range(10):
              print(so, "x", i, "=", so * i)
    hints:
      - { vi: "Đọc số vào biến so. i phải đi từ 1 đến 10, nên con dùng range(1, 11). Mỗi lần lặp, con in so, chữ x, i, dấu = và kết quả so * i.", en: "Read the number into the variable so. i must go from 1 to 10, so use range(1, 11). On each pass, print so, the letter x, i, the sign = and the result so * i." }
      - { vi: "Chương trình có 3 dòng: so = int(input()), rồi for i in range(1, 11):, rồi print(so, \"x\", i, \"=\", so * i) thụt lề 4 dấu cách.", en: "The program has 3 lines: so = int(input()), then for i in range(1, 11):, then print(so, \"x\", i, \"=\", so * i) indented by 4 spaces." }
    test_eligible: true
  - id: s4.for-range.l4.ex2
    type: code
    concepts: [loop-variable, range-stop-excluded]
    prompt:
      vi: "Robo bán vé xem phim, mỗi vé 25 nghìn đồng. Ô Dữ liệu nhập có 1 dòng: số vé nhiều nhất n, là số nguyên không âm. Hãy in ra dòng Bảng giá vé, rồi in giá của 1 vé, 2 vé, và cứ thế đến n vé, mỗi dòng 1 giá, đúng như phần Ví dụ. Nếu n là 0, Robo chỉ in ra Bảng giá vé."
      en: "Robo sells movie tickets, 25 thousand dong each. The Input data box has 1 line: the largest number of tickets n, an integer that is not negative. Print the line Bảng giá vé, then print the price of 1 ticket, 2 tickets, and so on up to n tickets, one price on each line, exactly as in the Example. If n is 0, Robo prints only Bảng giá vé."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      print("Bảng giá vé")
      for i in range(1, n + 1):
          print(i, "vé:", i * 25, "nghìn đồng")
    tests:
      - input: "4"
        output: |
          Bảng giá vé
          1 vé: 25 nghìn đồng
          2 vé: 50 nghìn đồng
          3 vé: 75 nghìn đồng
          4 vé: 100 nghìn đồng
      - input: "1"
        output: |
          Bảng giá vé
          1 vé: 25 nghìn đồng
        hidden: true
      - input: "0"
        output: "Bảng giá vé"
        hidden: true
      - input: "6"
        output: |
          Bảng giá vé
          1 vé: 25 nghìn đồng
          2 vé: 50 nghìn đồng
          3 vé: 75 nghìn đồng
          4 vé: 100 nghìn đồng
          5 vé: 125 nghìn đồng
          6 vé: 150 nghìn đồng
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Bảng giá vé
          0 vé: 0 nghìn đồng
          1 vé: 25 nghìn đồng
          2 vé: 50 nghìn đồng
          3 vé: 75 nghìn đồng
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          print("Bảng giá vé")
          for i in range(n):
              print(i, "vé:", i * 25, "nghìn đồng")
    hints:
      - { vi: "Số vé đi từ 1 đến n, có cả n, nên con dùng range(1, n + 1). Giá của i vé là i * 25.", en: "The number of tickets goes from 1 to n, including n, so use range(1, n + 1). The price of i tickets is i * 25." }
      - { vi: "Sau 2 dòng n = int(input()) và print(\"Bảng giá vé\"), con viết for i in range(1, n + 1):, rồi print(i, \"vé:\", i * 25, \"nghìn đồng\") thụt lề 4 dấu cách.", en: "After the 2 lines n = int(input()) and print(\"Bảng giá vé\"), write for i in range(1, n + 1):, then print(i, \"vé:\", i * 25, \"nghìn đồng\") indented by 4 spaces." }
    test_eligible: true
  - id: s4.for-range.l4.q1
    type: predict
    concepts: [loop-variable]
    code: |
      for i in range(1, 4):
          print(i * 10)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "10\n20\n30", correct: true }
      - { text: "0\n10\n20", misconception: range-stop-excluded }
      - { text: "10\n10\n10", misconception: loop-variable }
      - { text: "10\n20\n30\n40", misconception: range-stop-excluded }
    explanation:
      vi: "range(1, 4) cho i lần lượt là 1, 2, 3, không có 4. Mỗi lần lặp, i có giá trị mới, nên i * 10 lần lượt là 10, 20, 30."
      en: "range(1, 4) gives i the values 1, 2, 3, without 4. On each pass, i has a new value, so i * 10 is 10, then 20, then 30."
  - id: s4.for-range.l4.q2
    type: mcq
    concepts: [range-stop-excluded, for-repeat]
    code: |
      n = int(input())
      for i in range(n):
          print("hi")
      print("end")
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: 0. Đoạn code in ra gì?"
      en: "The Input data box has 1 line: 0. What is the output of this code?"
    choices:
      - { text: "hi\nend", misconception: range-stop-excluded }
      - { vi: "Không in ra gì", en: "Nothing is printed", misconception: for-repeat }
      - { vi: "Báo lỗi ở dòng 2, vì range(0) không có số nào", en: "An error on line 2, because range(0) has no numbers", error: true, misconception: range-stop-excluded }
      - { text: "end", correct: true }
    explanation:
      vi: "n bằng 0, nên range(0) không có số nào và vòng lặp không chạy lần nào: hi không được in ra. Như vậy không có lỗi. Dòng print(\"end\") sát lề trái, nằm ngoài vòng lặp, nên vẫn chạy 1 lần."
      en: "n is 0, so range(0) has no numbers and the loop runs 0 times: hi is not printed. That is not an error. The line print(\"end\") starts at the left edge and is outside the loop, so it still runs once."
---
Mỗi lần lặp, i có 1 giá trị mới, nên con dùng i trong phép tính để được kết quả khác nhau. Robo xếp gạch thành hình vuông: hình vuông cạnh i cần i * i viên gạch.

```python run
for i in range(1, 5):
    print("Hình vuông cạnh", i, "cần", i * i, "viên gạch")
```

Lần lượt, i là 1, 2, 3, 4, và Python tính i * i là 1, 4, 9, 16.
---
Với 1 vòng lặp, Robo đọc được cả bảng nhân của 1 số:

```python run
so = 3
for i in range(1, 11):
    print(so, "x", i, "=", so * i)
```

so luôn là 3, còn i đi từ 1 đến 10. Con thử đổi so thành 9 để xem bảng nhân 9.
---
Muốn đếm từ 1 cho dễ đọc, con in i + 1 thay cho i:

```python run
n = 3
for i in range(n):
    print("Robo chạy vòng", i + 1)
print("Robo chạy xong", n, "vòng")
```

Trong bài tập, con viết `n = int(input())` thay cho `n = 3`. Khi thử chương trình, con nhớ thử cả n bằng 0 (vòng lặp không chạy lần nào) và n bằng 1 (vòng lặp chạy 1 lần).
