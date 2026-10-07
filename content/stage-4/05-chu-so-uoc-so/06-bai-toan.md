---
id: s4.chu-so.l6
title: { vi: "Bài toán số học", en: "Number puzzles" }
exercises:
  - id: s4.chu-so.l6.ex1
    type: code
    concepts: [digit-split]
    prompt:
      vi: "Robo viết 1 số theo thứ tự ngược lại. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy dùng vòng lặp while để tạo số đảo ngược của n, rồi in ra đúng 1 dòng như phần Ví dụ. Số 0 ở đầu số đảo ngược bị bỏ đi: số đảo ngược của 120 là 21."
      en: "Robo writes a number in the reverse order. The Input data box has 1 line: a number n, an integer that is not negative. Use a while loop to build the reversed number of n, then print exactly 1 line as in the Example. Zeros at the start of the reversed number are dropped: the reverse of 120 is 21."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      n = so
      dao = 0
      while n > 0:
          dao = dao * 10 + n % 10
          n = n // 10
      print("Số đảo ngược của", so, "là", dao)
    tests:
      - input: "123"
        output: "Số đảo ngược của 123 là 321"
      - input: "0"
        output: "Số đảo ngược của 0 là 0"
        hidden: true
      - input: "7"
        output: "Số đảo ngược của 7 là 7"
        hidden: true
      - input: "1200"
        output: "Số đảo ngược của 1200 là 21"
        hidden: true
      - input: "90817"
        output: "Số đảo ngược của 90817 là 71809"
        hidden: true
    common_wrong:
      - test: 0
        output: "Số đảo ngược của 123 là 6"
        misconception: digit-split
        sample: |
          so = int(input())
          n = so
          dao = 0
          while n > 0:
              dao = dao + n % 10
              n = n // 10
          print("Số đảo ngược của", so, "là", dao)
    hints:
      - { vi: "Giữ số lúc đầu trong biến so, và cho vòng lặp làm việc với n = so. Đặt dao = 0 trước vòng lặp. Mỗi lần lặp, nhân dao với 10 để chừa chỗ cho 1 chữ số mới ở bên phải, rồi cộng thêm n % 10.", en: "Keep the starting number in the variable so, and let the loop work on n = so. Set dao = 0 before the loop. On each pass, multiply dao by 10 to make room for a new digit on the right, then add n % 10." }
      - { vi: "Trong vòng lặp while n > 0:, có 2 dòng thụt lề 4 dấu cách: dao = dao * 10 + n % 10 và n = n // 10. Sau vòng lặp: print(\"Số đảo ngược của\", so, \"là\", dao).", en: "Inside the loop while n > 0:, there are 2 lines indented by 4 spaces: dao = dao * 10 + n % 10 and n = n // 10. After the loop: print(\"Số đảo ngược của\", so, \"là\", dao)." }
    test_eligible: true
  - id: s4.chu-so.l6.ex2
    type: code
    concepts: [digit-split]
    prompt:
      vi: "Số đối xứng là số đọc từ trái sang phải hay từ phải sang trái đều như nhau, như 121 hay 7. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy tạo số đảo ngược của n, rồi so sánh với số lúc đầu, và in ra đúng 1 dòng như phần Ví dụ: n là số đối xứng, hoặc n không phải là số đối xứng."
      en: "A palindrome number reads the same from left to right and from right to left, like 121 or 7. The Input data box has 1 line: a number n, an integer that is not negative. Build the reversed number of n, compare it with the starting number, and print exactly 1 line as in the Example: n là số đối xứng (n is a palindrome number), or n không phải là số đối xứng (n is not a palindrome number)."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      n = so
      dao = 0
      while n > 0:
          dao = dao * 10 + n % 10
          n = n // 10
      if dao == so:
          print(so, "là số đối xứng")
      else:
          print(so, "không phải là số đối xứng")
    tests:
      - input: "12321"
        output: "12321 là số đối xứng"
      - input: "0"
        output: "0 là số đối xứng"
        hidden: true
      - input: "7"
        output: "7 là số đối xứng"
        hidden: true
      - input: "10"
        output: "10 không phải là số đối xứng"
        hidden: true
      - input: "1221"
        output: "1221 là số đối xứng"
        hidden: true
      - input: "1231"
        output: "1231 không phải là số đối xứng"
        hidden: true
    common_wrong:
      - test: 0
        output: "0 không phải là số đối xứng"
        misconception: digit-split
        sample: |
          n = int(input())
          dao = 0
          while n > 0:
              dao = dao * 10 + n % 10
              n = n // 10
          if dao == n:
              print(n, "là số đối xứng")
          else:
              print(n, "không phải là số đối xứng")
    hints:
      - { vi: "Sau vòng lặp, n đã thành 0, nên con phải giữ số lúc đầu trong 1 biến khác, như so. Tạo số đảo ngược như bài trước, rồi dùng if và else để so sánh dao với so.", en: "After the loop, n has become 0, so keep the starting number in another variable, such as so. Build the reversed number as in the last task, then use if and else to compare dao with so." }
      - { vi: "Sau vòng lặp tạo dao, con viết sát lề trái: if dao == so: với print(so, \"là số đối xứng\"), rồi else: với print(so, \"không phải là số đối xứng\").", en: "After the loop that builds dao, write at the left edge: if dao == so: with print(so, \"là số đối xứng\"), then else: with print(so, \"không phải là số đối xứng\")." }
    test_eligible: true
  - id: s4.chu-so.l6.ex3
    type: code
    concepts: [divisor-loop, accumulator-init]
    prompt:
      vi: "Số hoàn hảo là số bằng tổng các ước của nó, không tính chính nó. Ví dụ, 6 = 1 + 2 + 3. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên từ 1 đến 1000. Hãy dùng vòng lặp for để tính tổng các ước nhỏ hơn n, rồi in ra đúng 1 dòng như phần Ví dụ: n là số hoàn hảo, hoặc n không phải là số hoàn hảo."
      en: "A perfect number is a number that equals the sum of its divisors, not counting itself. For example, 6 = 1 + 2 + 3. The Input data box has 1 line: a number n, an integer from 1 to 1000. Use a for loop to work out the sum of the divisors smaller than n, then print exactly 1 line as in the Example: n là số hoàn hảo (n is a perfect number), or n không phải là số hoàn hảo (n is not a perfect number)."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      tong = 0
      for i in range(1, n):
          if n % i == 0:
              tong += i
      if tong == n:
          print(n, "là số hoàn hảo")
      else:
          print(n, "không phải là số hoàn hảo")
    tests:
      - input: "6"
        output: "6 là số hoàn hảo"
      - input: "1"
        output: "1 không phải là số hoàn hảo"
        hidden: true
      - input: "28"
        output: "28 là số hoàn hảo"
        hidden: true
      - input: "12"
        output: "12 không phải là số hoàn hảo"
        hidden: true
      - input: "496"
        output: "496 là số hoàn hảo"
        hidden: true
      - input: "500"
        output: "500 không phải là số hoàn hảo"
        hidden: true
    common_wrong:
      - test: 0
        output: "6 không phải là số hoàn hảo"
        misconception: divisor-loop
        sample: |
          n = int(input())
          tong = 0
          for i in range(1, n + 1):
              if n % i == 0:
                  tong += i
          if tong == n:
              print(n, "là số hoàn hảo")
          else:
              print(n, "không phải là số hoàn hảo")
    hints:
      - { vi: "Không tính chính n, nên i chỉ chạy từ 1 đến n - 1: con dùng range(1, n). Đặt tong = 0 trước vòng lặp, và cộng i vào tong khi n % i == 0. Sau vòng lặp, so sánh tong với n.", en: "n itself does not count, so i only goes from 1 to n - 1: use range(1, n). Set tong = 0 before the loop, and add i to tong when n % i == 0. After the loop, compare tong with n." }
      - { vi: "Chương trình: n = int(input()), tong = 0, for i in range(1, n):, if n % i == 0: thụt lề 4 dấu cách, tong += i thụt lề 8 dấu cách. Sau vòng lặp: if tong == n: in ra là số hoàn hảo, else: in ra không phải là số hoàn hảo.", en: "The program: n = int(input()), tong = 0, for i in range(1, n):, if n % i == 0: indented by 4 spaces, tong += i indented by 8 spaces. After the loop: if tong == n: print là số hoàn hảo, else: print không phải là số hoàn hảo." }
    test_eligible: true
  - id: s4.chu-so.l6.q1
    type: predict
    concepts: [digit-split]
    code: |
      n = 1200
      r = 0
      while n > 0:
          r = r * 10 + n % 10
          n = n // 10
      print(r)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "0021", misconception: digit-split }
      - { text: "3", misconception: digit-split }
      - { text: "21", correct: true }
      - { text: "2100", misconception: digit-split }
    explanation:
      vi: "Các chữ số được lấy từ phải sang trái: 0, 0, 2, 1. Sau 2 lần lặp đầu, r vẫn là 0 * 10 + 0 = 0. Lần lặp 3: r = 0 * 10 + 2 = 2. Lần lặp 4: r = 2 * 10 + 1 = 21. r là 1 số, không phải chuỗi, nên các số 0 ở đầu không được giữ lại."
      en: "The digits are taken from right to left: 0, 0, 2, 1. After the first 2 passes, r is still 0 * 10 + 0 = 0. Pass 3: r = 0 * 10 + 2 = 2. Pass 4: r = 2 * 10 + 1 = 21. r is a number, not a string, so the zeros at the start are not kept."
---
**Số đảo ngược** của 123 là 321: các chữ số viết theo thứ tự ngược lại. Robo tách chữ số từ phải sang trái, và mỗi lần lặp ghép chữ số vừa tách vào bên phải của dao:

```python run
n = 123
dao = 0
while n > 0:
    dao = dao * 10 + n % 10
    n = n // 10
    print("dao là", dao)
```

Nhân dao với 10 là chừa 1 chỗ trống ở bên phải, rồi cộng chữ số mới vào chỗ đó: dao lần lượt là 3, rồi 3 * 10 + 2 = 32, rồi 32 * 10 + 1 = 321.
---
**Số đối xứng** đọc từ trái sang phải hay từ phải sang trái đều như nhau, như 121 hay 4554. Số đối xứng thì bằng số đảo ngược của nó. Vòng lặp làm n thành 0, nên Robo giữ số lúc đầu trong biến so để so sánh:

```python run
so = 121
n = so
dao = 0
while n > 0:
    dao = dao * 10 + n % 10
    n = n // 10
if dao == so:
    print(so, "là số đối xứng")
else:
    print(so, "không phải là số đối xứng")
```

Con thử đổi so thành 123: số đảo ngược là 321, khác 123, nên 123 không phải là số đối xứng.
---
**Số hoàn hảo** là số bằng tổng các ước của nó, không tính chính nó. 6 có các ước 1, 2, 3 và 6. Không tính 6, tổng là 1 + 2 + 3 = 6, nên 6 là số hoàn hảo:

```python run
n = 28
tong = 0
for i in range(1, n):
    if n % i == 0:
        tong += i
print("Tổng các ước nhỏ hơn", n, "là", tong)
```

28 = 1 + 2 + 4 + 7 + 14, nên 28 cũng là số hoàn hảo. Vòng lặp dùng `range(1, n)` để không cộng chính n. Số hoàn hảo rất hiếm: số tiếp theo sau 28 là 496.
