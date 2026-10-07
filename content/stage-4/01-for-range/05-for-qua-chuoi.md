---
id: s4.for-range.l5
title: { vi: "for qua từng ký tự", en: "for over each character" }
exercises:
  - id: s4.for-range.l5.ex1
    type: code
    concepts: [for-over-string]
    prompt:
      vi: "Robo tập đánh vần. Ô Dữ liệu nhập có 1 dòng: 1 từ. Hãy dùng vòng lặp for để in ra từng ký tự của từ đó, mỗi ký tự 1 dòng, đúng như phần Ví dụ."
      en: "Robo is practising spelling. The Input data box has 1 line: a word. Use a for loop to print each character of that word, one character on each line, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tu = input()
      for ch in tu:
          print(ch)
    tests:
      - input: "Robo"
        output: |
          R
          o
          b
          o
      - input: "A"
        output: "A"
        hidden: true
      - input: "Mèo"
        output: |
          M
          è
          o
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Robo
          Robo
          Robo
          Robo
        misconception: for-over-string
        sample: |
          tu = input()
          for ch in tu:
              print(tu)
    hints:
      - { vi: "Đọc từ vào biến tu, rồi viết for ch in tu:. Mỗi lần lặp, biến ch giữ 1 ký tự của từ, nên bên trong vòng lặp con in ch, không in tu.", en: "Read the word into the variable tu, then write for ch in tu:. On each pass, the variable ch holds one character of the word, so inside the loop print ch, not tu." }
      - { vi: "Chương trình có 3 dòng: tu = input(), rồi for ch in tu:, rồi print(ch) thụt lề 4 dấu cách.", en: "The program has 3 lines: tu = input(), then for ch in tu:, then print(ch) indented by 4 spaces." }
    test_eligible: true
  - id: s4.for-range.l5.ex2
    type: code
    concepts: [for-over-string, for-repeat]
    prompt:
      vi: "Robo đếm số ký tự trong tên của con, kể cả dấu cách. Ô Dữ liệu nhập có 1 dòng: tên của con. Hãy dùng 1 biến đếm và vòng lặp for để đếm số ký tự, rồi in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo counts the characters in your name, spaces included. The Input data box has 1 line: your name. Use a counter variable and a for loop to count the characters, then print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = input()
      dem = 0
      for ch in ten:
          dem = dem + 1
      print("Tên có", dem, "ký tự")
    tests:
      - input: "Lan"
        output: "Tên có 3 ký tự"
      - input: "Minh Anh"
        output: "Tên có 8 ký tự"
        hidden: true
      - input: "A"
        output: "Tên có 1 ký tự"
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Tên có 1 ký tự
          Tên có 2 ký tự
          Tên có 3 ký tự
        misconception: for-repeat
        sample: |
          ten = input()
          dem = 0
          for ch in ten:
              dem = dem + 1
              print("Tên có", dem, "ký tự")
    hints:
      - { vi: "Đặt dem = 0 trước vòng lặp. Mỗi lần lặp, cộng thêm 1 vào dem. Dòng in kết quả viết sát lề trái, sau vòng lặp, để nó chỉ chạy 1 lần.", en: "Set dem = 0 before the loop. On each pass, add 1 to dem. The line that prints the result starts at the left edge, after the loop, so that it runs only once." }
      - { vi: "Chương trình có 5 dòng: ten = input(), dem = 0, for ch in ten:, rồi dem = dem + 1 thụt lề 4 dấu cách, và cuối cùng là print(\"Tên có\", dem, \"ký tự\") sát lề trái.", en: "The program has 5 lines: ten = input(), dem = 0, for ch in ten:, then dem = dem + 1 indented by 4 spaces, and last print(\"Tên có\", dem, \"ký tự\") at the left edge." }
    test_eligible: true
  - id: s4.for-range.l5.q1
    type: predict
    concepts: [for-over-string]
    code: |
      for ch in "ab c":
          print(ch, end="*")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "a*b* *c*", correct: true }
      - { text: "a*b*c*", misconception: for-over-string }
      - { text: "ab c*", misconception: for-over-string }
      - { text: "*a*b* *c", misconception: end-param }
    explanation:
      vi: "Chuỗi \"ab c\" có 4 ký tự: a, b, dấu cách và c. Vòng lặp chạy 4 lần, mỗi lần in 1 ký tự rồi in dấu * thay cho xuống dòng. Dấu cách cũng là 1 ký tự, nên giữa b* và c* có 1 dấu cách."
      en: "The string \"ab c\" has 4 characters: a, b, a space and c. The loop runs 4 times, and each time it prints one character and then a * instead of a new line. A space is a character too, so there is a space between b* and c*."
  - id: s4.for-range.l5.q2
    type: mcq
    concepts: [for-over-string]
    code: |
      word = input()
      count = 0
      for ch in word:
          count = count + 1
      print(count)
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: Hi Bo. Đoạn code in ra gì?"
      en: "The Input data box has 1 line: Hi Bo. What is the output of this code?"
    choices:
      - { text: "4", misconception: for-over-string }
      - { text: "5", correct: true }
      - { text: "2", misconception: for-over-string }
      - { text: "1\n2\n3\n4\n5", misconception: for-repeat }
    explanation:
      vi: "Vòng lặp chạy 1 lần cho mỗi ký tự của Hi Bo: H, i, dấu cách, B, o. Đó là 5 lần, kể cả dấu cách, nên count tăng lên 5. Dòng print(count) sát lề trái nên chỉ chạy 1 lần, sau vòng lặp."
      en: "The loop runs once for each character of Hi Bo: H, i, a space, B, o. That is 5 times, the space included, so count goes up to 5. The line print(count) starts at the left edge, so it runs only once, after the loop."
---
Vòng lặp for còn đi được qua 1 chuỗi. Mỗi chữ, chữ số, dấu hay dấu cách trong chuỗi là 1 **ký tự**. Mỗi lần lặp, biến `ch` giữ 1 ký tự, lần lượt từ trái sang phải:

```python run
for ch in "Robo":
    print(ch)
```

Chuỗi "Robo" có 4 ký tự, nên vòng lặp chạy 4 lần và Python in ra R, o, b, o, mỗi ký tự 1 dòng.
---
**Dấu cách** cũng là 1 ký tự. Con đặt mỗi ký tự trong 1 cặp ngoặc vuông để thấy rõ:

```python run
for ch in "Hi Bo":
    print("[" + ch + "]")
```

Dòng thứ 3 là [ ]: lần lặp đó, ch là dấu cách. Chuỗi "Hi Bo" có 5 ký tự, nên vòng lặp chạy 5 lần.
---
Muốn đếm số ký tự, con dùng 1 **biến đếm**: đặt `dem = 0` trước vòng lặp, rồi mỗi lần lặp cộng thêm 1.

```python run
tu = "Robo"
dem = 0
for ch in tu:
    dem = dem + 1
print("Số ký tự:", dem)
```

Sau 4 lần lặp, dem là 4. Dòng print sát lề trái, nên chỉ in 1 lần, khi đã đếm xong. Trong bài tập, con đọc chuỗi bằng `tu = input()`.
