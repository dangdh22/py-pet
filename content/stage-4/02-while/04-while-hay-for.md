---
id: s4.while.l4
title: { vi: "while hay for?", en: "while or for?" }
exercises:
  - id: s4.while.l4.ex1
    type: code
    concepts: [while-vs-for, off-by-one]
    prompt:
      vi: "Robo đếm cừu để dễ ngủ. Code bên phải là 1 chương trình dùng for, viết trong các dòng chú thích. Hãy viết lại chương trình đó bằng vòng lặp while, không dùng for, để in ra giống hệt như phần Ví dụ. Ô Dữ liệu nhập có 1 dòng: số con cừu n, là số nguyên không âm."
      en: "Robo counts sheep to fall asleep. The code on the right is a program that uses for, written in comment lines. Rewrite that program with a while loop, without for, so that it prints exactly the same as in the Example. The Input data box has 1 line: the number of sheep n, an integer that is not negative."
    starter: |
      # Chương trình dùng for:
      # n = int(input())
      # for i in range(1, n + 1):
      #     print("Con cừu thứ", i)
      # print("Robo ngủ rồi")
      # Hãy viết lại bằng while ở dưới dòng này
    solution: |
      n = int(input())
      i = 1
      while i <= n:
          print("Con cừu thứ", i)
          i = i + 1
      print("Robo ngủ rồi")
    tests:
      - input: "3"
        output: |
          Con cừu thứ 1
          Con cừu thứ 2
          Con cừu thứ 3
          Robo ngủ rồi
      - input: "1"
        output: |
          Con cừu thứ 1
          Robo ngủ rồi
        hidden: true
      - input: "0"
        output: "Robo ngủ rồi"
        hidden: true
      - input: "6"
        output: |
          Con cừu thứ 1
          Con cừu thứ 2
          Con cừu thứ 3
          Con cừu thứ 4
          Con cừu thứ 5
          Con cừu thứ 6
          Robo ngủ rồi
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Con cừu thứ 1
          Con cừu thứ 2
          Robo ngủ rồi
        misconception: off-by-one
        sample: |
          n = int(input())
          i = 1
          while i < n:
              print("Con cừu thứ", i)
              i = i + 1
          print("Robo ngủ rồi")
    hints:
      - { vi: "Với while, con tự viết 3 thứ mà for làm sẵn: giá trị đầu i = 1 trước vòng lặp, điều kiện để i đi tới cả số n, và dòng i = i + 1 ở cuối khối lệnh.", en: "With while, you write yourself the 3 things that for does for you: the start value i = 1 before the loop, a condition that lets i reach n itself, and the line i = i + 1 at the end of the block." }
      - { vi: "Chương trình có 6 dòng: n = int(input()), i = 1, while i <= n:, rồi print(\"Con cừu thứ\", i) và i = i + 1 thụt lề 4 dấu cách, cuối cùng là print(\"Robo ngủ rồi\") sát lề trái.", en: "The program has 6 lines: n = int(input()), i = 1, while i <= n:, then print(\"Con cừu thứ\", i) and i = i + 1 indented by 4 spaces, and last print(\"Robo ngủ rồi\") at the left edge." }
    test_eligible: true
  - id: s4.while.l4.ex2
    type: code
    concepts: [while-vs-for, off-by-one]
    prompt:
      vi: "Robo có 1 tin vui. Ngày 1, chỉ có 1 người biết tin. Mỗi ngày sau đó, số người biết tin gấp 3 lần ngày trước. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên lớn hơn 0. Hãy tìm ngày đầu tiên có từ n người biết tin trở lên, rồi in ra ngày đó và số người biết tin vào ngày đó, đúng như phần Ví dụ. Con chưa biết trước số ngày, nên hãy dùng while."
      en: "Robo has some good news. On day 1, only 1 person knows it. Each day after that, the number of people who know it is 3 times the day before. The Input data box has 1 line: a number n, an integer greater than 0. Find the first day on which n people or more know the news, then print that day and the number of people who know the news on that day, exactly as in the Example. You do not know the number of days in advance, so use while."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      ngay = 1
      nguoi = 1
      while nguoi < n:
          ngay = ngay + 1
          nguoi = nguoi * 3
      print("Ngày", ngay, "có", nguoi, "người biết tin")
    tests:
      - input: "81"
        output: "Ngày 5 có 81 người biết tin"
      - input: "1"
        output: "Ngày 1 có 1 người biết tin"
        hidden: true
      - input: "2"
        output: "Ngày 2 có 3 người biết tin"
        hidden: true
      - input: "100"
        output: "Ngày 6 có 243 người biết tin"
        hidden: true
    common_wrong:
      - test: 0
        output: "Ngày 6 có 243 người biết tin"
        misconception: off-by-one
        sample: |
          n = int(input())
          ngay = 1
          nguoi = 1
          while nguoi <= n:
              ngay = ngay + 1
              nguoi = nguoi * 3
          print("Ngày", ngay, "có", nguoi, "người biết tin")
    hints:
      - { vi: "Bắt đầu với ngay = 1 và nguoi = 1. Trong khi số người còn ít hơn n, con sang ngày mới: cộng 1 vào ngay và nhân nguoi với 3. Khi có đúng n người là đã đủ, nên điều kiện dùng dấu <.", en: "Start with ngay = 1 and nguoi = 1. While there are fewer than n people, move on to a new day: add 1 to ngay and multiply nguoi by 3. Exactly n people is already enough, so the condition uses the sign <." }
      - { vi: "Sau 3 dòng n = int(input()), ngay = 1 và nguoi = 1, con viết while nguoi < n:, rồi 2 dòng thụt lề: ngay = ngay + 1 và nguoi = nguoi * 3. Cuối cùng là print(\"Ngày\", ngay, \"có\", nguoi, \"người biết tin\") sát lề trái.", en: "After the 3 lines n = int(input()), ngay = 1 and nguoi = 1, write while nguoi < n:, then 2 indented lines: ngay = ngay + 1 and nguoi = nguoi * 3. Last comes print(\"Ngày\", ngay, \"có\", nguoi, \"người biết tin\") at the left edge." }
    test_eligible: true
  - id: s4.while.l4.q1
    type: mcq
    concepts: [while-vs-for]
    prompt:
      vi: "Việc nào hợp với vòng lặp while hơn vòng lặp for?"
      en: "Which job fits a while loop better than a for loop?"
    choices:
      - { vi: "In lời chào đúng 10 lần", en: "Print a greeting exactly 10 times", misconception: while-vs-for }
      - { vi: "In từng ký tự của tên con", en: "Print each character of your name", misconception: while-vs-for }
      - { vi: "Đọc các số cho đến khi gặp số 0", en: "Read numbers until the number 0 comes", correct: true }
      - { vi: "In các số từ 1 đến n đã đọc vào", en: "Print the numbers from 1 to an n that was read", misconception: while-vs-for }
    explanation:
      vi: "Khi đọc đến số 0, chương trình không biết trước sẽ có bao nhiêu số, chỉ biết lúc nào dừng, nên while hợp hơn. In 10 lần, đi qua từng ký tự, hay đếm từ 1 đến n đều biết trước số lần lặp ngay khi vòng lặp bắt đầu, nên for gọn hơn."
      en: "When reading until 0, the program does not know in advance how many numbers will come, only when to stop, so while fits better. Printing 10 times, going through each character, or counting from 1 to n all have a number of passes known when the loop starts, so for is shorter."
  - id: s4.while.l4.q2
    type: mcq
    concepts: [while-vs-for, off-by-one]
    code: |
      for i in range(1, 4):
          print(i)
    prompt:
      vi: "Đoạn code while nào in ra giống hệt đoạn code for này?"
      en: "Which while code prints exactly the same as this for code?"
    choices:
      - { text: "i = 1\nwhile i <= 4:\n    print(i)\n    i = i + 1", misconception: off-by-one }
      - { text: "i = 0\nwhile i < 4:\n    print(i)\n    i = i + 1", misconception: off-by-one }
      - { text: "i = 1\nwhile i < 4:\n    i = i + 1\n    print(i)", misconception: off-by-one }
      - { text: "i = 1\nwhile i < 4:\n    print(i)\n    i = i + 1", correct: true }
    explanation:
      vi: "range(1, 4) cho i là 1, 2, 3. Đoạn while đúng bắt đầu với i = 1, in i rồi mới tăng i, và dừng khi i là 4 vì 4 < 4 sai. Với i <= 4, số 4 cũng được in. Bắt đầu từ i = 0 thì in 0, 1, 2, 3. Tăng i trước khi in thì in ra 2, 3, 4."
      en: "range(1, 4) gives i the values 1, 2, 3. The right while code starts with i = 1, prints i before making it bigger, and stops when i is 4 because 4 < 4 is False. With i <= 4, the number 4 is printed too. Starting from i = 0 prints 0, 1, 2, 3. Making i bigger before printing prints 2, 3, 4."
---
Nhiều việc làm được bằng cả for lẫn while. Đây là 2 cách in các số từ 1 đến 5. Cách thứ nhất dùng for:

```python run
for i in range(1, 6):
    print(i)
```

Cách thứ hai dùng while:

```python run
i = 1
while i <= 5:
    print(i)
    i = i + 1
```

Với for, range tự cho i đi từ 1 đến 5. Với while, con phải tự viết 3 thứ: giá trị đầu `i = 1`, điều kiện `i <= 5`, và dòng tăng `i = i + 1`.
---
**Biết trước số lần lặp** thì dùng for, vì for gọn hơn: in 10 dòng, đếm từ 1 đến n, đi qua từng ký tự của 1 chuỗi. **Chưa biết số lần lặp, chỉ biết lúc nào dừng** thì dùng while: đọc đến khi gặp 0, bơm bóng đến khi bóng sắp nổ. Ví dụ, Robo cắt đôi 1 sợi dây dài 100 cm, cắt mãi đến khi dây chỉ còn 1 cm:

```python run
day = 100
lan = 0
while day > 1:
    day = day // 2
    lan = lan + 1
    print("Lần", lan, "dây còn", day, "cm")
```

Robo không biết trước phải cắt mấy lần. Vòng lặp tự dừng sau 6 lần, khi dây còn 1 cm.
---
Lỗi hay gặp với vòng lặp là **lặp thừa hoặc thiếu 1 lần**. Robo muốn in các số từ 1 đến 5, nhưng viết dấu < thay cho <=:

```python run
i = 1
while i < 5:
    print(i)
    i = i + 1
```

Khi i là 5, điều kiện 5 < 5 sai, nên số 5 không được in. Để tránh lỗi này, con thử trong đầu lần lặp đầu tiên và lần lặp cuối cùng: i bắt đầu bằng mấy, và khi i bằng số cuối thì điều kiện đúng hay sai?
