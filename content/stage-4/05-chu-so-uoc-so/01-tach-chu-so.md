---
id: s4.chu-so.l1
title: { vi: "Tách từng chữ số", en: "Splitting digits" }
exercises:
  - id: s4.chu-so.l1.ex1
    type: code
    concepts: [digit-split]
    prompt:
      vi: "Robo đọc 1 số từ phải sang trái. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy dùng vòng lặp while với n % 10 và n // 10 để in ra từng chữ số của n, bắt đầu từ chữ số hàng đơn vị, mỗi chữ số 1 dòng, đúng như phần Ví dụ. Nếu n là 0, Robo in ra 0."
      en: "Robo reads a number from right to left. The Input data box has 1 line: a number n, an integer that is not negative. Use a while loop with n % 10 and n // 10 to print each digit of n, starting from the ones digit, one digit on each line, exactly as in the Example. If n is 0, Robo prints 0."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      if n == 0:
          print(0)
      while n > 0:
          print(n % 10)
          n = n // 10
    tests:
      - input: "345"
        output: |
          5
          4
          3
      - input: "7"
        output: "7"
        hidden: true
      - input: "0"
        output: "0"
        hidden: true
      - input: "1020"
        output: |
          0
          2
          0
          1
        hidden: true
      - input: "90000"
        output: |
          0
          0
          0
          0
          9
        hidden: true
    common_wrong:
      - test: 0
        output: |
          345
          34
          3
        misconception: digit-split
        sample: |
          n = int(input())
          if n == 0:
              print(0)
          while n > 0:
              print(n)
              n = n // 10
    hints:
      - { vi: "Mỗi lần lặp, n % 10 cho chữ số cuối cùng, rồi n = n // 10 bỏ chữ số đó đi. Vòng lặp chạy trong khi n > 0. Với n là 0, vòng lặp không chạy lần nào, nên con thêm 1 lệnh if trước vòng lặp để in ra 0.", en: "On each pass, n % 10 gives the last digit, then n = n // 10 drops that digit. The loop runs while n > 0. When n is 0, the loop runs 0 times, so add an if statement before the loop to print 0." }
      - { vi: "Sau dòng n = int(input()), con viết if n == 0: với print(0) thụt lề 4 dấu cách. Tiếp theo là while n > 0:, rồi 2 dòng thụt lề 4 dấu cách: print(n % 10) và n = n // 10.", en: "After the line n = int(input()), write if n == 0: with print(0) indented by 4 spaces. Next comes while n > 0:, then 2 lines indented by 4 spaces: print(n % 10) and n = n // 10." }
    test_eligible: true
  - id: s4.chu-so.l1.ex2
    type: code
    concepts: [digit-split, off-by-one]
    prompt:
      vi: "Robo muốn biết chữ số đầu tiên, tức là chữ số bên trái nhất, của 1 số. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy dùng vòng lặp while và phép // 10 để bỏ dần chữ số hàng đơn vị, cho đến khi n chỉ còn 1 chữ số. In ra đúng 1 dòng như phần Ví dụ. Với n là 0, chữ số đầu tiên là 0."
      en: "Robo wants to know the first digit of a number, that is, its leftmost digit. The Input data box has 1 line: a number n, an integer that is not negative. Use a while loop and the // 10 operation to drop the ones digit again and again, until n has only 1 digit left. Print exactly 1 line as in the Example. When n is 0, the first digit is 0."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      while n >= 10:
          n = n // 10
      print("Chữ số đầu tiên là", n)
    tests:
      - input: "4721"
        output: "Chữ số đầu tiên là 4"
      - input: "7"
        output: "Chữ số đầu tiên là 7"
        hidden: true
      - input: "0"
        output: "Chữ số đầu tiên là 0"
        hidden: true
      - input: "10"
        output: "Chữ số đầu tiên là 1"
        hidden: true
      - input: "90210"
        output: "Chữ số đầu tiên là 9"
        hidden: true
    common_wrong:
      - test: 0
        output: "Chữ số đầu tiên là 0"
        misconception: off-by-one
        sample: |
          n = int(input())
          while n > 0:
              n = n // 10
          print("Chữ số đầu tiên là", n)
    hints:
      - { vi: "n còn từ 2 chữ số trở lên khi n >= 10. Trong khi điều kiện đó đúng, con bỏ chữ số hàng đơn vị bằng n = n // 10. Đừng dùng điều kiện n > 0: khi đó Robo bỏ cả chữ số cuối cùng, và n thành 0.", en: "n still has 2 or more digits when n >= 10. While that is True, drop the ones digit with n = n // 10. Do not use the condition n > 0: then Robo drops the last digit too, and n becomes 0." }
      - { vi: "Chương trình có 4 dòng: n = int(input()), rồi while n >= 10:, rồi n = n // 10 thụt lề 4 dấu cách, và cuối cùng là print(\"Chữ số đầu tiên là\", n) sát lề trái.", en: "The program has 4 lines: n = int(input()), then while n >= 10:, then n = n // 10 indented by 4 spaces, and last print(\"Chữ số đầu tiên là\", n) at the left edge." }
    test_eligible: true
  - id: s4.chu-so.l1.q1
    type: predict
    concepts: [digit-split]
    code: |
      n = 2024
      while n > 0:
          print(n % 10, end="")
          n = n // 10
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "2024", misconception: digit-split }
      - { text: "4202", correct: true }
      - { text: "4\n2\n0\n2", misconception: end-param }
      - { text: "42", misconception: digit-split }
    explanation:
      vi: "n % 10 cho chữ số hàng đơn vị, nên Robo in các chữ số từ phải sang trái: 4, 2, 0, rồi 2. Chữ số 0 vẫn được in, vì vòng lặp chỉ dừng khi cả số n là 0, không phải khi gặp chữ số 0. end=\"\" làm các chữ số nằm liền nhau trên 1 dòng: 4202."
      en: "n % 10 gives the ones digit, so Robo prints the digits from right to left: 4, 2, 0, then 2. The digit 0 is printed too, because the loop stops only when the whole number n is 0, not when it meets a digit 0. end=\"\" keeps the digits next to each other on 1 line: 4202."
  - id: s4.chu-so.l1.q2
    type: mcq
    concepts: [digit-split, while-update]
    code: |
      n = 52
      while n > 0:
          print(n % 10)
          n // 10
    prompt:
      vi: "Đoạn code chạy thế nào?"
      en: "How does this code run?"
    choices:
      - { vi: "In ra 2, rồi 5, rồi dừng", en: "It prints 2, then 5, then stops", misconception: digit-split }
      - { vi: "Báo lỗi SyntaxError ở dòng 4, vì dòng đó không có dấu =", en: "It gives a SyntaxError on line 4, because that line has no = sign", error: true, misconception: var-assign }
      - { vi: "Không in gì, vì điều kiện sai ngay từ đầu", en: "It prints nothing, because the condition is False from the start", misconception: while-check-first }
      - { vi: "In ra số 2 hết dòng này đến dòng khác, không dừng", en: "It prints 2 line after line, without stopping", correct: true }
    explanation:
      vi: "Dòng 4 tính n // 10 ra 5, nhưng không cất kết quả vào đâu, nên n vẫn là 52. Python không báo lỗi, vì 1 phép tính đứng 1 mình vẫn là dòng hợp lệ. Vì n không đổi, điều kiện n > 0 đúng mãi, và Robo in số 2 không dừng. Con phải viết n = n // 10."
      en: "Line 4 works out n // 10 as 5, but does not store the result anywhere, so n stays 52. Python gives no error, because a calculation on its own is still a valid line. Since n never changes, the condition n > 0 stays True, and Robo prints 2 without stopping. You must write n = n // 10."
---
Ở giai đoạn 2, con đã biết: `n % 10` cho **chữ số hàng đơn vị** của n, còn `n // 10` bỏ chữ số đó đi. Mã tủ đồ của Robo là 345. Robo lấy từng chữ số như sau:

```python run
n = 345
print(n % 10)
n = n // 10
print(n % 10)
n = n // 10
print(n % 10)
```

Mỗi lần, Robo lấy chữ số cuối bằng `n % 10`, rồi bỏ nó đi bằng `n = n // 10`: n lần lượt là 345, 34, rồi 3. Hai dòng ấy được lặp lại, nên con đặt chúng trong 1 vòng lặp.
---
Số có bao nhiêu chữ số thì lặp bấy nhiêu lần, và con không cần biết trước số đó. Con dùng `while n > 0:` để **tách từng chữ số**:

```python run
n = 345
while n > 0:
    print(n % 10)
    n = n // 10
print("Hết chữ số")
```

Sau lần lặp thứ 3, n là 3 // 10, tức là 0. Lúc này n > 0 sai, nên vòng lặp dừng. Các chữ số được in **từ phải sang trái**: 5, 4, rồi 3.
---
Với n = 0, điều kiện n > 0 sai ngay từ đầu, nên vòng lặp không chạy lần nào. Nhưng số 0 vẫn có 1 chữ số là 0! Con xử lý riêng số 0 bằng 1 lệnh if trước vòng lặp:

```python run
n = 0
if n == 0:
    print(0)
while n > 0:
    print(n % 10)
    n = n // 10
print("Hết chữ số")
```

Python in ra 0, rồi Hết chữ số. Khi thử chương trình tách chữ số, con nhớ thử cả số 0.
---
Dòng `n = n // 10` phải có phần `n =`. Nếu con chỉ viết `n // 10`, Python tính ra 34 nhưng không cất vào đâu, nên n vẫn là 345:

```python
n = 345
while n > 0:
    print(n % 10)
    n // 10
```

Python không báo lỗi, nhưng n không bao giờ đổi, nên Robo in số 5 mãi và Py-Pet phải dừng chương trình. Dấu `=` cất kết quả mới vào n, để n nhỏ dần về 0.
