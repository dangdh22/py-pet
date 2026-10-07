---
id: s4.chu-so.l4
title: { vi: "Thoát vòng lặp với break", en: "Leaving a loop with break" }
exercises:
  - id: s4.chu-so.l4.ex1
    type: code
    concepts: [break-nearest, divisor-loop]
    prompt:
      vi: "Robo tìm ước nhỏ nhất lớn hơn 1 của 1 số. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên lớn hơn 1. Hãy cho i chạy từ 2 đến n, và dùng break để dừng vòng lặp ngay khi gặp ước đầu tiên. In ra đúng 1 dòng như phần Ví dụ."
      en: "Robo looks for the smallest divisor of a number that is greater than 1. The Input data box has 1 line: a number n, an integer greater than 1. Let i go from 2 to n, and use break to stop the loop as soon as you meet the first divisor. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(2, n + 1):
          if n % i == 0:
              print("Ước nhỏ nhất lớn hơn 1 của", n, "là", i)
              break
    tests:
      - input: "91"
        output: "Ước nhỏ nhất lớn hơn 1 của 91 là 7"
      - input: "2"
        output: "Ước nhỏ nhất lớn hơn 1 của 2 là 2"
        hidden: true
      - input: "1000"
        output: "Ước nhỏ nhất lớn hơn 1 của 1000 là 2"
        hidden: true
      - input: "97"
        output: "Ước nhỏ nhất lớn hơn 1 của 97 là 97"
        hidden: true
      - input: "49"
        output: "Ước nhỏ nhất lớn hơn 1 của 49 là 7"
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Ước nhỏ nhất lớn hơn 1 của 91 là 7
          Ước nhỏ nhất lớn hơn 1 của 91 là 13
          Ước nhỏ nhất lớn hơn 1 của 91 là 91
        misconception: break-nearest
        sample: |
          n = int(input())
          for i in range(2, n + 1):
              if n % i == 0:
                  print("Ước nhỏ nhất lớn hơn 1 của", n, "là", i)
    hints:
      - { vi: "Dùng range(2, n + 1), vì n luôn là ước của chính nó, nên vòng lặp chắc chắn gặp ít nhất 1 ước. Khi n % i == 0, con in ra rồi viết break, để Robo không in thêm các ước lớn hơn.", en: "Use range(2, n + 1): n is always a divisor of itself, so the loop is sure to meet at least 1 divisor. When n % i == 0, print the line and then write break, so that Robo does not print the bigger divisors too." }
      - { vi: "Sau dòng for i in range(2, n + 1):, con viết if n % i == 0: thụt lề 4 dấu cách. Trong khối của if, thụt lề 8 dấu cách, có 2 dòng: print(\"Ước nhỏ nhất lớn hơn 1 của\", n, \"là\", i) và break.", en: "After the line for i in range(2, n + 1):, write if n % i == 0: indented by 4 spaces. Inside the if block, indented by 8 spaces, there are 2 lines: print(\"Ước nhỏ nhất lớn hơn 1 của\", n, \"là\", i) and break." }
    test_eligible: true
  - id: s4.chu-so.l4.ex2
    type: code
    concepts: [prime-check, break-nearest]
    prompt:
      vi: "Robo kiểm tra 1 số có phải là số nguyên tố không. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên từ 1 đến 10000. Hãy tìm ước nhỏ nhất lớn hơn 1 của n bằng vòng lặp for và break, rồi in ra đúng 1 dòng như phần Ví dụ: n là số nguyên tố, hoặc n không phải là số nguyên tố. Nhớ rằng 1 không phải là số nguyên tố."
      en: "Robo checks whether a number is a prime number. The Input data box has 1 line: a number n, an integer from 1 to 10000. Find the smallest divisor of n that is greater than 1 with a for loop and break, then print exactly 1 line as in the Example: n là số nguyên tố (n is a prime number), or n không phải là số nguyên tố (n is not a prime number). Remember that 1 is not a prime number."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      uoc = n
      for i in range(2, n):
          if n % i == 0:
              uoc = i
              break
      if n > 1 and uoc == n:
          print(n, "là số nguyên tố")
      else:
          print(n, "không phải là số nguyên tố")
    tests:
      - input: "13"
        output: "13 là số nguyên tố"
      - input: "1"
        output: "1 không phải là số nguyên tố"
        hidden: true
      - input: "2"
        output: "2 là số nguyên tố"
        hidden: true
      - input: "49"
        output: "49 không phải là số nguyên tố"
        hidden: true
      - input: "7919"
        output: "7919 là số nguyên tố"
        hidden: true
      - input: "100"
        output: "100 không phải là số nguyên tố"
        hidden: true
    common_wrong:
      - test: 1
        output: "1 là số nguyên tố"
        misconception: prime-check
        sample: |
          n = int(input())
          uoc = n
          for i in range(2, n):
              if n % i == 0:
                  uoc = i
                  break
          if uoc == n:
              print(n, "là số nguyên tố")
          else:
              print(n, "không phải là số nguyên tố")
      - test: 3
        output: "49 là số nguyên tố"
        misconception: prime-check
        sample: |
          n = int(input())
          for i in range(2, n):
              if n % i == 0:
                  print(n, "không phải là số nguyên tố")
                  break
              else:
                  print(n, "là số nguyên tố")
                  break
    hints:
      - { vi: "Trước vòng lặp, đặt uoc = n. Cho i chạy từ 2 đến n - 1 bằng range(2, n): gặp ước nào thì gán uoc = i rồi break. Sau vòng lặp, n là số nguyên tố khi n > 1 và uoc vẫn là n. Chỉ kết luận sau vòng lặp, khi đã thử xong.", en: "Before the loop, set uoc = n. Let i go from 2 to n - 1 with range(2, n): when you meet a divisor, set uoc = i and then break. After the loop, n is a prime number when n > 1 and uoc is still n. Decide only after the loop, once every number has been tried." }
      - { vi: "Chương trình: n = int(input()), uoc = n, for i in range(2, n):, trong đó if n % i == 0: với 2 dòng uoc = i và break. Sau vòng lặp, sát lề trái: if n > 1 and uoc == n: in ra là số nguyên tố, else: in ra không phải là số nguyên tố.", en: "The program: n = int(input()), uoc = n, for i in range(2, n):, inside it if n % i == 0: with the 2 lines uoc = i and break. After the loop, at the left edge: if n > 1 and uoc == n: print là số nguyên tố, else: print không phải là số nguyên tố." }
    test_eligible: true
  - id: s4.chu-so.l4.q1
    type: predict
    concepts: [break-nearest]
    code: |
      for i in range(1, 10):
          if i * i > 20:
              break
          print(i)
      print("end")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1\n2\n3\n4\n5\nend", misconception: break-nearest }
      - { text: "1\n2\n3\n4", misconception: break-nearest }
      - { text: "1\n2\n3\n4\nend", correct: true }
      - { text: "1\n2\n3\n4\n6\n7\n8\n9\nend", misconception: break-nearest }
    explanation:
      vi: "Với i từ 1 đến 4, i * i là 1, 4, 9, 16, đều không lớn hơn 20, nên Robo in i. Khi i là 5, 5 * 5 = 25 > 20, nên break chạy ngay, trước dòng print(i): số 5 không được in. break thoát hẳn vòng lặp, không chạy tiếp với 6, 7, 8, 9. Chương trình không dừng: Python chạy tiếp dòng sau vòng lặp và in end."
      en: "For i from 1 to 4, i * i is 1, 4, 9, 16, none greater than 20, so Robo prints i. When i is 5, 5 * 5 = 25 > 20, so break runs at once, before the line print(i): 5 is not printed. break leaves the loop for good, so it does not go on with 6, 7, 8, 9. The program does not stop: Python goes on with the line after the loop and prints end."
  - id: s4.chu-so.l4.q2
    type: mcq
    concepts: [break-nearest]
    code: |
      for a in range(3):
          for b in range(5):
              if b == 2:
                  break
              print(a, b)
    prompt:
      vi: "Đoạn code in ra bao nhiêu dòng?"
      en: "How many lines does this code print?"
    choices:
      - { text: "6", correct: true }
      - { text: "2", misconception: break-nearest }
      - { text: "15", misconception: break-nearest }
      - { text: "9", misconception: break-nearest }
    explanation:
      vi: "break nằm trong vòng lặp bên trong, nên nó chỉ thoát khỏi vòng lặp của b. Với mỗi a, Robo in 2 dòng (b là 0 và 1), rồi gặp b == 2 thì break, và vòng lặp của a chạy tiếp. a có 3 giá trị, nên có 3 x 2 = 6 dòng. Dòng có b là 2 không được in, vì break chạy trước print."
      en: "break is in the inner loop, so it leaves only the loop of b. For each a, Robo prints 2 lines (b is 0 and 1), then meets b == 2 and breaks, and the loop of a goes on. a has 3 values, so there are 3 x 2 = 6 lines. No line with b equal to 2 is printed, because break runs before print."
---
Robo đi tìm số nhỏ nhất mà nhân với 7 thì lớn hơn 30. Tìm thấy rồi thì không cần thử tiếp. Lệnh **break** làm việc đó: nó **thoát ngay khỏi vòng lặp**.

```python run
for i in range(1, 10):
    print("Robo thử số", i)
    if i * 7 > 30:
        print("Tìm thấy:", i)
        break
print("Xong")
```

Khi i là 5, 5 * 7 = 35 > 30, nên Python chạy break. Vòng lặp dừng luôn, dù range còn 6, 7, 8 và 9. Python chạy tiếp dòng đầu tiên sau vòng lặp, và in ra Xong.
---
break giúp Robo tìm **ước nhỏ nhất lớn hơn 1** của n. Robo thử i từ 2 trở đi, và dừng ở ước đầu tiên:

```python run
n = 91
for i in range(2, n + 1):
    if n % i == 0:
        print("Ước nhỏ nhất lớn hơn 1 của", n, "là", i)
        break
```

91 có các ước lớn hơn 1 là 7, 13 và 91. Không có break, Robo in cả 3 số. Có break, Robo chỉ in 7 rồi dừng. Vì n chia hết cho chính nó, vòng lặp chắc chắn gặp 1 ước khi n lớn hơn 1.
---
**Số nguyên tố** là số lớn hơn 1 chỉ có 2 ước: 1 và chính nó, như 2, 3, 5, 7, 13. Robo tạm coi ước nhỏ nhất là chính n, rồi thử các số từ 2 đến n - 1. Gặp ước nào thì ghi lại và dừng:

```python run
n = 49
uoc = n
for i in range(2, n):
    if n % i == 0:
        uoc = i
        break
if n > 1 and uoc == n:
    print(n, "là số nguyên tố")
else:
    print(n, "không phải là số nguyên tố")
```

49 chia hết cho 7, nên uoc là 7 và 49 không phải là số nguyên tố. Con chỉ kết luận **sau vòng lặp**, khi đã thử xong. Số 1 chỉ có 1 ước, nên 1 không phải là số nguyên tố: đó là lý do có thêm `n > 1`.
---
Khi 2 vòng lặp lồng nhau, break chỉ thoát khỏi **vòng lặp gần nhất** chứa nó. Robo tìm ước nhỏ nhất lớn hơn 1 của từng số từ 12 đến 15:

```python run
for so in range(12, 16):
    for i in range(2, so + 1):
        if so % i == 0:
            print("Ước nhỏ nhất lớn hơn 1 của", so, "là", i)
            break
print("Xong")
```

break nằm trong vòng lặp của i, nên nó chỉ dừng việc thử i cho số đang xét. Vòng lặp của so vẫn chạy tiếp với số sau, nên Robo in đủ 4 dòng rồi mới in Xong.
