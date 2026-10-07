---
id: s4.while.l1
title: { vi: "Lặp khi điều kiện còn đúng", en: "Repeat while true" }
exercises:
  - id: s4.while.l1.ex1
    type: code
    concepts: [while-check-first, off-by-one]
    prompt:
      vi: "Robo bơm bóng bay. Lúc đầu bóng to 1 cm, và mỗi lần bơm, bóng to gấp đôi. Ô Dữ liệu nhập có 1 dòng: cỡ lớn nhất n (tính bằng cm) mà bóng chưa nổ, là số nguyên không âm. Hãy dùng vòng lặp while: trong khi cỡ bóng còn nhỏ hơn hoặc bằng n, in ra cỡ bóng rồi bơm cho bóng to gấp đôi. Cuối cùng, in ra Dừng bơm, đúng như phần Ví dụ."
      en: "Robo blows up a balloon. At first the balloon is 1 cm big, and each pump makes it twice as big. The Input data box has 1 line: the largest size n (in cm) at which the balloon does not pop, an integer that is not negative. Use a while loop: while the balloon size is less than or equal to n, print the size and then pump to make the balloon twice as big. At the end, print Dừng bơm, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      co = 1
      while co <= n:
          print("Bóng to", co, "cm")
          co = co * 2
      print("Dừng bơm")
    tests:
      - input: "16"
        output: |
          Bóng to 1 cm
          Bóng to 2 cm
          Bóng to 4 cm
          Bóng to 8 cm
          Bóng to 16 cm
          Dừng bơm
      - input: "1"
        output: |
          Bóng to 1 cm
          Dừng bơm
        hidden: true
      - input: "0"
        output: "Dừng bơm"
        hidden: true
      - input: "100"
        output: |
          Bóng to 1 cm
          Bóng to 2 cm
          Bóng to 4 cm
          Bóng to 8 cm
          Bóng to 16 cm
          Bóng to 32 cm
          Bóng to 64 cm
          Dừng bơm
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Bóng to 1 cm
          Bóng to 2 cm
          Bóng to 4 cm
          Bóng to 8 cm
          Dừng bơm
        misconception: off-by-one
        sample: |
          n = int(input())
          co = 1
          while co < n:
              print("Bóng to", co, "cm")
              co = co * 2
          print("Dừng bơm")
    hints:
      - { vi: "Đặt co = 1 trước vòng lặp. Điều kiện của while là co <= n, vì bóng to đúng bằng n vẫn chưa nổ. Trong khối lệnh, con in cỡ bóng, rồi gấp đôi co.", en: "Set co = 1 before the loop. The while condition is co <= n, because a balloon of exactly n does not pop yet. Inside the block, print the size, then double co." }
      - { vi: "Sau 2 dòng n = int(input()) và co = 1, con viết while co <= n:, rồi 2 dòng thụt lề 4 dấu cách: print(\"Bóng to\", co, \"cm\") và co = co * 2. Cuối cùng là print(\"Dừng bơm\") sát lề trái.", en: "After the 2 lines n = int(input()) and co = 1, write while co <= n:, then 2 lines indented by 4 spaces: print(\"Bóng to\", co, \"cm\") and co = co * 2. Last comes print(\"Dừng bơm\") at the left edge." }
    test_eligible: true
  - id: s4.while.l1.ex2
    type: code
    concepts: [while-check-first]
    prompt:
      vi: "Robo ăn kẹo: mỗi lần ăn 1 viên, cho đến khi hết kẹo. Ô Dữ liệu nhập có 1 dòng: số viên kẹo, là số nguyên không âm. Code bên phải báo lỗi SyntaxError, và còn 1 lỗi nữa: Robo chỉ ăn 1 viên rồi thôi. Hãy sửa code để Robo ăn đến khi hết kẹo, rồi in ra Hết kẹo, như phần Ví dụ."
      en: "Robo eats candy: 1 piece at a time, until there is no candy left. The Input data box has 1 line: the number of candies, an integer that is not negative. The code on the right gives a SyntaxError, and it has 1 more mistake: Robo eats only 1 piece and stops. Fix the code so that Robo eats until the candy is gone, then prints Hết kẹo, as in the Example."
    starter: |
      keo = int(input())
      if keo > 0
          keo = keo - 1
          print("Robo ăn 1 viên, còn", keo, "viên")
      print("Hết kẹo")
    solution: |
      keo = int(input())
      while keo > 0:
          keo = keo - 1
          print("Robo ăn 1 viên, còn", keo, "viên")
      print("Hết kẹo")
    tests:
      - input: "3"
        output: |
          Robo ăn 1 viên, còn 2 viên
          Robo ăn 1 viên, còn 1 viên
          Robo ăn 1 viên, còn 0 viên
          Hết kẹo
      - input: "1"
        output: |
          Robo ăn 1 viên, còn 0 viên
          Hết kẹo
        hidden: true
      - input: "0"
        output: "Hết kẹo"
        hidden: true
      - input: "5"
        output: |
          Robo ăn 1 viên, còn 4 viên
          Robo ăn 1 viên, còn 3 viên
          Robo ăn 1 viên, còn 2 viên
          Robo ăn 1 viên, còn 1 viên
          Robo ăn 1 viên, còn 0 viên
          Hết kẹo
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Robo ăn 1 viên, còn 2 viên
          Hết kẹo
        misconception: while-check-first
        sample: |
          keo = int(input())
          if keo > 0:
              keo = keo - 1
              print("Robo ăn 1 viên, còn", keo, "viên")
          print("Hết kẹo")
    hints:
      - { vi: "Lời báo lỗi expected ':' nghĩa là dòng 2 thiếu dấu hai chấm. Sửa xong, con chạy lại: lệnh if chỉ kiểm tra 1 lần, nên Robo chỉ ăn 1 viên. Con cần 1 lệnh kiểm tra lại điều kiện trước mỗi lần lặp.", en: "The error message expected ':' means that line 2 has no colon. After fixing it, run the code again: an if statement checks only once, so Robo eats only 1 piece. You need a statement that checks the condition again before each pass." }
      - { vi: "Đổi dòng 2 thành while keo > 0: với dấu hai chấm ở cuối. Các dòng khác giữ nguyên.", en: "Change line 2 to while keo > 0: with a colon at the end. Keep the other lines as they are." }
    test_eligible: true
  - id: s4.while.l1.q1
    type: predict
    concepts: [while-check-first]
    code: |
      n = 1
      while n < 10:
          n = n * 3
      print(n)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "9", misconception: while-check-first }
      - { text: "3\n9\n27", misconception: after-block }
      - { text: "27", correct: true }
      - { text: "81", misconception: off-by-one }
    explanation:
      vi: "Trước mỗi lần lặp, Python kiểm tra n < 10. n lần lượt là 1, 3, 9: cả 3 lần điều kiện đều đúng, nên n được nhân 3 thành 3, 9, rồi 27. Lúc này 27 < 10 sai, nên vòng lặp dừng. Dòng print(n) sát lề trái, chỉ chạy 1 lần sau vòng lặp, và in ra 27."
      en: "Before each pass, Python checks n < 10. n is 1, then 3, then 9: all 3 times the condition is True, so n is multiplied by 3 to become 3, 9, then 27. Now 27 < 10 is False, so the loop stops. The line print(n) starts at the left edge, runs only once after the loop, and prints 27."
  - id: s4.while.l1.q2
    type: mcq
    concepts: [while-check-first]
    prompt:
      vi: "Python kiểm tra điều kiện của vòng lặp while vào lúc nào?"
      en: "When does Python check the condition of a while loop?"
    choices:
      - { vi: "Chỉ 1 lần, trước khi vòng lặp bắt đầu", en: "Only once, before the loop starts", misconception: while-check-first }
      - { vi: "Trước mỗi lần lặp, kể cả lần đầu tiên", en: "Before each pass, the first one included", correct: true }
      - { vi: "Sau mỗi dòng lệnh nằm trong khối lệnh", en: "After each line inside the block", misconception: while-check-first }
      - { vi: "Sau mỗi lần lặp, nên khối luôn chạy ít nhất 1 lần", en: "After each pass, so the block always runs at least once", misconception: while-check-first }
    explanation:
      vi: "Python kiểm tra điều kiện ở dòng while trước mỗi lần lặp. Nếu đúng, Python chạy hết cả khối lệnh rồi quay lên kiểm tra lại. Nếu ngay lần đầu điều kiện đã sai, khối lệnh không chạy lần nào."
      en: "Python checks the condition on the while line before each pass. If it is True, Python runs the whole block and then goes back up to check again. If the condition is False the very first time, the block runs 0 times."
---
Robo đi dạo khi còn pin. Con không biết trước Robo đi được mấy vòng, nhưng biết lúc nào phải dừng: khi hết pin. Python có **vòng lặp while** cho việc này. Chữ while trong tiếng Anh nghĩa là "trong khi": trong khi điều kiện còn đúng, Python lặp lại khối lệnh.

```python run
pin = 3
while pin > 0:
    print("Pin là", pin, "nên Robo đi 1 vòng")
    pin = pin - 1
print("Robo hết pin")
```

Dòng while viết giống dòng if: chữ `while`, 1 điều kiện, rồi dấu hai chấm. Khối lệnh bên dưới thụt lề 4 dấu cách.
---
Khác với if, chạy xong khối lệnh, Python **quay lên dòng while** và kiểm tra điều kiện lần nữa. Điều kiện được kiểm tra **trước mỗi lần lặp**: đúng thì chạy cả khối, sai thì bỏ qua khối và chạy tiếp dòng sát lề trái bên dưới.

```python run
i = 1
while i <= 3:
    i = i + 1
    print("i là", i)
```

Lần lặp thứ 3 bắt đầu khi i là 3. Trong khối, i thành 4, nhưng Python vẫn chạy hết khối và in ra i là 4. Sau đó Python mới kiểm tra lại: 4 <= 3 sai, nên vòng lặp dừng.
---
Nếu ngay lần kiểm tra đầu tiên điều kiện đã sai, khối lệnh **không chạy lần nào**:

```python run
pin = 0
while pin > 0:
    print("Pin là", pin, "nên Robo đi 1 vòng")
    pin = pin - 1
print("Robo cần sạc pin")
```

pin là 0, nên pin > 0 sai ngay từ đầu. Python bỏ qua khối lệnh và chỉ in ra Robo cần sạc pin. Khi thử chương trình, con nhớ thử cả trường hợp vòng lặp chạy 0 lần.
---
Giống dòng if và dòng for, dòng while thiếu dấu hai chấm thì Python báo lỗi và chưa chạy dòng nào:

```python run expect-error
pin = 2
while pin > 0
    pin = pin - 1
```

Lời báo lỗi là SyntaxError: expected ':'. Con thêm dấu `:` vào cuối dòng 2 là chương trình chạy được.
