---
id: s4.chu-so.l2
title: { vi: "Tổng và số lượng chữ số", en: "Sum and count of digits" }
exercises:
  - id: s4.chu-so.l2.ex1
    type: code
    concepts: [digit-split, accumulator-init]
    prompt:
      vi: "Robo cộng các chữ số của 1 số. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy dùng vòng lặp while để tính tổng các chữ số của n, rồi in ra đúng 1 dòng như phần Ví dụ, trong đó có cả số n lúc đầu."
      en: "Robo adds up the digits of a number. The Input data box has 1 line: a number n, an integer that is not negative. Use a while loop to work out the sum of the digits of n, then print exactly 1 line as in the Example, with the starting number n in it too."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      n = so
      tong = 0
      while n > 0:
          tong += n % 10
          n = n // 10
      print("Tổng các chữ số của", so, "là", tong)
    tests:
      - input: "345"
        output: "Tổng các chữ số của 345 là 12"
      - input: "0"
        output: "Tổng các chữ số của 0 là 0"
        hidden: true
      - input: "7"
        output: "Tổng các chữ số của 7 là 7"
        hidden: true
      - input: "99999"
        output: "Tổng các chữ số của 99999 là 45"
        hidden: true
      - input: "1001"
        output: "Tổng các chữ số của 1001 là 2"
        hidden: true
    common_wrong:
      - test: 0
        output: "Tổng các chữ số của 0 là 12"
        misconception: digit-split
        sample: |
          n = int(input())
          tong = 0
          while n > 0:
              tong += n % 10
              n = n // 10
          print("Tổng các chữ số của", n, "là", tong)
    hints:
      - { vi: "Vòng lặp làm n nhỏ dần về 0, nên con chép số lúc đầu sang 1 biến khác trước vòng lặp, như so = int(input()) rồi n = so. Đặt tong = 0 trước vòng lặp. Mỗi lần lặp, cộng n % 10 vào tong, rồi bỏ chữ số đó bằng n = n // 10.", en: "The loop makes n smaller until it is 0, so copy the starting number into another variable before the loop, such as so = int(input()) and then n = so. Set tong = 0 before the loop. On each pass, add n % 10 to tong, then drop that digit with n = n // 10." }
      - { vi: "Sau 3 dòng so = int(input()), n = so và tong = 0, con viết while n > 0:, rồi 2 dòng thụt lề 4 dấu cách: tong += n % 10 và n = n // 10. Cuối cùng, sát lề trái: print(\"Tổng các chữ số của\", so, \"là\", tong).", en: "After the 3 lines so = int(input()), n = so and tong = 0, write while n > 0:, then 2 lines indented by 4 spaces: tong += n % 10 and n = n // 10. Last, at the left edge: print(\"Tổng các chữ số của\", so, \"là\", tong)." }
    test_eligible: true
  - id: s4.chu-so.l2.ex2
    type: code
    concepts: [digit-split, count-if]
    prompt:
      vi: "Robo đếm xem 1 số có bao nhiêu chữ số. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy dùng vòng lặp while và 1 biến đếm, rồi in ra đúng 1 dòng như phần Ví dụ. Số 0 có 1 chữ số."
      en: "Robo counts how many digits a number has. The Input data box has 1 line: a number n, an integer that is not negative. Use a while loop and a counter variable, then print exactly 1 line as in the Example. The number 0 has 1 digit."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      n = so
      dem = 0
      while n > 0:
          dem += 1
          n = n // 10
      if dem == 0:
          dem = 1
      print("Số", so, "có", dem, "chữ số")
    tests:
      - input: "2024"
        output: "Số 2024 có 4 chữ số"
      - input: "0"
        output: "Số 0 có 1 chữ số"
        hidden: true
      - input: "5"
        output: "Số 5 có 1 chữ số"
        hidden: true
      - input: "10"
        output: "Số 10 có 2 chữ số"
        hidden: true
      - input: "1000000"
        output: "Số 1000000 có 7 chữ số"
        hidden: true
    common_wrong:
      - test: 1
        output: "Số 0 có 0 chữ số"
        misconception: digit-split
        sample: |
          so = int(input())
          n = so
          dem = 0
          while n > 0:
              dem += 1
              n = n // 10
          print("Số", so, "có", dem, "chữ số")
    hints:
      - { vi: "Chép số lúc đầu sang biến n để vòng lặp làm việc với n. Mỗi lần lặp bỏ đi 1 chữ số, nên biến đếm tăng thêm 1. Với số 0, vòng lặp không chạy lần nào, nên sau vòng lặp, dem vẫn là 0: con dùng if để đặt dem = 1.", en: "Copy the starting number into the variable n so that the loop works on n. Each pass drops 1 digit, so the counter goes up by 1. For the number 0, the loop runs 0 times, so after the loop dem is still 0: use if to set dem = 1." }
      - { vi: "Chương trình: so = int(input()), n = so, dem = 0, rồi while n > 0: với 2 dòng dem += 1 và n = n // 10. Sau vòng lặp: if dem == 0: với dem = 1 thụt lề 4 dấu cách, rồi print(\"Số\", so, \"có\", dem, \"chữ số\").", en: "The program: so = int(input()), n = so, dem = 0, then while n > 0: with the 2 lines dem += 1 and n = n // 10. After the loop: if dem == 0: with dem = 1 indented by 4 spaces, then print(\"Số\", so, \"có\", dem, \"chữ số\")." }
    test_eligible: true
  - id: s4.chu-so.l2.q1
    type: predict
    concepts: [digit-split]
    code: |
      n = 4096
      total = 0
      while n > 0:
          total += n % 10
          n = n // 10
      print(n, total)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "0 19", correct: true }
      - { text: "4096 19", misconception: digit-split }
      - { text: "0 4", misconception: plus-equals }
      - { text: "0 15", misconception: digit-split }
    explanation:
      vi: "total cộng lần lượt các chữ số 6, 9, 0 và 4, nên total là 19. Chữ số 0 cũng được cộng, vì vòng lặp chỉ dừng khi cả n là 0. Mỗi lần lặp, n = n // 10 làm n nhỏ đi, nên sau vòng lặp n là 0, không còn là 4096."
      en: "total adds the digits 6, 9, 0 and 4 in turn, so total is 19. The digit 0 is added too, because the loop stops only when the whole of n is 0. On each pass, n = n // 10 makes n smaller, so after the loop n is 0, not 4096 any more."
  - id: s4.chu-so.l2.q2
    type: mcq
    concepts: [digit-split]
    code: |
      n = int(input())
      count = 0
      while n > 0:
          count += 1
          n = n // 10
      print(count)
    prompt:
      vi: "Đoạn code muốn in ra số chữ số của n. Với số nào trong ô Dữ liệu nhập thì đoạn code in ra kết quả sai?"
      en: "This code is meant to print how many digits n has. With which number in the Input data box does the code print a wrong result?"
    choices:
      - { text: "10", misconception: digit-split }
      - { text: "100000", misconception: digit-split }
      - { text: "0", correct: true }
      - { text: "9", misconception: off-by-one }
    explanation:
      vi: "Với 0, điều kiện n > 0 sai ngay từ đầu, nên vòng lặp không chạy lần nào và đoạn code in ra 0. Nhưng số 0 có 1 chữ số. Với 10, vòng lặp chạy 2 lần (n là 10, rồi 1), nên in đúng 2. Chữ số 0 bên trong hay ở cuối số vẫn được đếm."
      en: "With 0, the condition n > 0 is False from the start, so the loop runs 0 times and the code prints 0. But the number 0 has 1 digit. With 10, the loop runs 2 times (n is 10, then 1), so it prints the right answer, 2. A digit 0 inside or at the end of a number is still counted."
---
Muốn cộng các chữ số của 1 số, con ghép cách tách chữ số với 1 **biến tích lũy**. Mỗi lần lặp, cộng chữ số vừa tách vào tong:

```python run
n = 2025
tong = 0
while n > 0:
    tong += n % 10
    n = n // 10
print("Tổng các chữ số:", tong)
```

tong lần lượt là 5, 7, 7 và 9: Robo cộng 5 + 2 + 0 + 2 = 9. Dòng `tong = 0` nằm trước vòng lặp, như mọi biến tích lũy.
---
Muốn **đếm số chữ số**, con dùng 1 biến đếm: mỗi lần lặp bỏ đi 1 chữ số, nên biến đếm tăng thêm 1.

```python run
n = 2025
dem = 0
while n > 0:
    dem += 1
    n = n // 10
print("Số chữ số:", dem)
```

Với n = 0, vòng lặp không chạy lần nào, nên dem là 0, dù số 0 có 1 chữ số. Con thêm 2 dòng sau vòng lặp: `if dem == 0:` và `dem = 1` thụt lề 4 dấu cách.
---
Sau vòng lặp, n đã thành 0. Nếu con in n ra, Robo in sai số lúc đầu:

```python run
n = 345
tong = 0
while n > 0:
    tong += n % 10
    n = n // 10
print("Tổng các chữ số của", n, "là", tong)
```

Muốn giữ số lúc đầu, con cất nó vào 1 biến khác, rồi để vòng lặp làm việc với **bản sao** n:

```python run
so = 345
n = so
tong = 0
while n > 0:
    tong += n % 10
    n = n // 10
print("Tổng các chữ số của", so, "là", tong)
```

Bây giờ Robo in đúng: Tổng các chữ số của 345 là 12.
