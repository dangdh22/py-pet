---
id: s3.if-else.l1
title: { vi: "Lệnh if", en: "The if statement" }
exercises:
  - id: s3.if-else.l1.ex1
    type: code
    concepts: [if-colon, indent-block]
    prompt:
      vi: "Robo cần đi sạc khi pin dưới 20 phần trăm. Ô Dữ liệu nhập có 1 dòng: số phần trăm pin, là số nguyên. Hãy đọc số đó vào biến pin, rồi in ra dòng Pin: cùng với số pin. Sau đó, dùng lệnh if để in thêm dòng Robo cần đi sạc, chỉ khi pin dưới 20, đúng như phần Ví dụ."
      en: "Robo needs charging when the battery is below 20 percent. The Input data box has 1 line: the battery percent, an integer. Read the number into the variable pin, then print the line Pin: with the battery number. After that, use an if statement to also print the line Robo cần đi sạc, only when the battery is below 20, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      pin = int(input())
      print("Pin:", pin)
      if pin < 20:
          print("Robo cần đi sạc")
    tests:
      - input: "15"
        output: |
          Pin: 15
          Robo cần đi sạc
      - input: "20"
        output: "Pin: 20"
        hidden: true
      - input: "64"
        output: "Pin: 64"
        hidden: true
    common_wrong:
      - test: 1
        output: |
          Pin: 20
          Robo cần đi sạc
        misconception: compare-ops
        sample: |
          pin = int(input())
          print("Pin:", pin)
          if pin <= 20:
              print("Robo cần đi sạc")
    hints:
      - { vi: "Dòng if viết là if pin < 20: và có dấu hai chấm ở cuối. Dòng print bên dưới thụt lề vào 4 dấu cách, để nó chỉ chạy khi pin dưới 20. Với đúng 20 phần trăm, Robo chưa cần đi sạc.", en: "The if line is if pin < 20: with a colon at the end. The print line under it is indented by 4 spaces, so that it runs only when the battery is below 20. With exactly 20 percent, Robo does not need charging yet." }
      - { vi: "Chương trình có 4 dòng: pin = int(input()), rồi print(\"Pin:\", pin), rồi if pin < 20:, và cuối cùng là print(\"Robo cần đi sạc\") thụt lề 4 dấu cách.", en: "The program has 4 lines: pin = int(input()), then print(\"Pin:\", pin), then if pin < 20:, and last print(\"Robo cần đi sạc\") indented by 4 spaces." }
    test_eligible: true
  - id: s3.if-else.l1.ex2
    type: code
    concepts: [if-colon]
    prompt:
      vi: "Robo bật quạt khi trời nóng trên 30 độ. Ô Dữ liệu nhập có 1 dòng: nhiệt độ, là số nguyên. Code bên phải báo lỗi SyntaxError. Hãy sửa code để in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo turns on the fan when it is hotter than 30 degrees. The Input data box has 1 line: the temperature, an integer. The code on the right gives a SyntaxError. Fix the code so that it prints exactly 1 line as in the Example."
    starter: |
      nhiet_do = int(input())
      if nhiet_do > 30
          print("Trời nóng, Robo bật quạt")
      if nhiet_do <= 30
          print("Trời mát, Robo tắt quạt")
    solution: |
      nhiet_do = int(input())
      if nhiet_do > 30:
          print("Trời nóng, Robo bật quạt")
      if nhiet_do <= 30:
          print("Trời mát, Robo tắt quạt")
    tests:
      - input: "34"
        output: "Trời nóng, Robo bật quạt"
      - input: "30"
        output: "Trời mát, Robo tắt quạt"
        hidden: true
      - input: "31"
        output: "Trời nóng, Robo bật quạt"
        hidden: true
    hints:
      - { vi: "Lời báo lỗi expected ':' nghĩa là Python cần 1 dấu hai chấm. Mỗi dòng if phải kết thúc bằng dấu hai chấm.", en: "The error message expected ':' means that Python needs a colon. Every if line must end with a colon." }
      - { vi: "Thêm dấu : vào cuối dòng 2 và cuối dòng 4.", en: "Add : at the end of line 2 and at the end of line 4." }
    test_eligible: true
  - id: s3.if-else.l1.q1
    type: predict
    concepts: [indent-block]
    code: |
      a = 3
      if a > 5:
          print("A")
      if a == 3:
          print("B")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\nB", misconception: indent-block }
      - { text: "B", correct: true }
      - { text: "False\nTrue", misconception: compare-ops }
      - { text: "A", misconception: compare-ops }
    explanation:
      vi: "a bằng 3. Điều kiện a > 5 là False, nên Python bỏ qua dòng print(\"A\") thụt lề bên dưới. Điều kiện a == 3 là True, nên dòng print(\"B\") chạy. Lệnh if không in ra True hay False: nó chỉ quyết định khối bên dưới có chạy hay không."
      en: "a is 3. The condition a > 5 is False, so Python skips the indented line print(\"A\") under it. The condition a == 3 is True, so the line print(\"B\") runs. An if statement does not print True or False: it only decides whether the block under it runs."
  - id: s3.if-else.l1.q2
    type: mcq
    concepts: [if-colon]
    prompt:
      vi: "Robo muốn kiểm tra biến n có nhỏ hơn 20 không. Dòng if nào viết đúng?"
      en: "Robo wants to check whether the variable n is less than 20. Which if line is written correctly?"
    choices:
      - { text: "if n < 20", misconception: if-colon }
      - { text: "if: n < 20", misconception: if-colon }
      - { text: "if n < 20:", correct: true }
      - { text: "If n < 20:", misconception: case-sensitive }
    explanation:
      vi: "Dòng if gồm chữ if viết thường, rồi điều kiện, rồi dấu hai chấm ở cuối dòng. Thiếu dấu hai chấm, hay đặt nó ngay sau chữ if, đều báo lỗi SyntaxError. Python phân biệt chữ hoa và chữ thường, nên viết If với chữ I hoa cũng báo lỗi."
      en: "An if line has the word if in small letters, then the condition, then a colon at the end of the line. A missing colon, or a colon right after the word if, gives a SyntaxError. Python sees the difference between capital and small letters, so If with a capital I also gives an error."
---
Mỗi sáng, Robo tự hỏi: "Pin có yếu không? **Nếu** pin yếu **thì** đi sạc." Trong Python, con dùng **lệnh if** để chương trình làm 1 việc chỉ khi 1 câu hỏi được trả lời là đúng. Câu hỏi đó gọi là **điều kiện**.

```python run
pin = 15
if pin < 20:
    print("Robo cần đi sạc")
```

Dòng 2 hỏi "pin có dưới 20 không?". 15 nhỏ hơn 20, nên điều kiện là True và dòng 3 chạy: Python in ra Robo cần đi sạc.
---
Khi điều kiện là False, Python **bỏ qua** dòng thụt lề bên dưới lệnh if:

```python run
pin = 80
if pin < 20:
    print("Robo cần đi sạc")
if pin >= 20:
    print("Robo đủ pin để đi chơi")
```

80 không nhỏ hơn 20, nên dòng 3 bị bỏ qua. Điều kiện ở dòng 4 là True, nên Python chỉ in ra Robo đủ pin để đi chơi.
---
Lệnh if viết theo đúng thứ tự: chữ `if` viết thường, 1 dấu cách, điều kiện, rồi **dấu hai chấm** `:` ở cuối dòng.

```python run
ten = "Robo"
if ten == "Robo":
    print("Chào Robo!")
```

Dòng bên dưới phải **thụt lề**, tức là lùi vào 4 dấu cách so với chữ if. Con gõ 4 dấu cách, hoặc nhấn phím Tab 1 lần. Dòng thụt lề này là việc Robo làm khi điều kiện đúng.
---
Nếu con quên dấu hai chấm, Python báo lỗi và chưa chạy dòng nào:

```python run expect-error
pin = 15
if pin < 20
    print("Robo cần đi sạc")
```

Lời báo lỗi là SyntaxError: expected ':'. Câu này nghĩa là "cần 1 dấu hai chấm". Con thêm dấu `:` vào cuối dòng 2 là chương trình chạy được.
