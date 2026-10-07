---
id: s3.elif.l4
title: { vi: "elif hay nhiều if?", en: "elif or many ifs?" }
exercises:
  - id: s3.elif.l4.ex1
    type: code
    concepts: [elif-vs-if]
    prompt:
      vi: "Đèn trên lưng Robo báo pin: từ 70 phần trăm trở lên là Đèn xanh, từ 30 phần trăm trở lên là Đèn vàng, dưới 30 phần trăm là Đèn đỏ. Ô Dữ liệu nhập có 1 dòng: số phần trăm pin. Code bên phải in ra 2 dòng khi pin là 80. Hãy sửa code để luôn in ra đúng 1 dòng như phần Ví dụ."
      en: "The light on Robo's back shows the battery: 70 percent or more is Đèn xanh, 30 percent or more is Đèn vàng, and below 30 percent is Đèn đỏ. The Input data box has 1 line: the battery percent. The code on the right prints 2 lines when the battery is 80. Fix the code so that it always prints exactly 1 line as in the Example."
    starter: |
      pin = int(input())
      if pin >= 70:
          print("Đèn xanh")
      if pin >= 30:
          print("Đèn vàng")
      else:
          print("Đèn đỏ")
    solution: |
      pin = int(input())
      if pin >= 70:
          print("Đèn xanh")
      elif pin >= 30:
          print("Đèn vàng")
      else:
          print("Đèn đỏ")
    tests:
      - input: "80"
        output: "Đèn xanh"
      - input: "70"
        output: "Đèn xanh"
        hidden: true
      - input: "45"
        output: "Đèn vàng"
        hidden: true
      - input: "30"
        output: "Đèn vàng"
        hidden: true
      - input: "12"
        output: "Đèn đỏ"
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Đèn xanh
          Đèn vàng
        misconception: elif-vs-if
        sample: |
          pin = int(input())
          if pin >= 70:
              print("Đèn xanh")
          if pin >= 30:
              print("Đèn vàng")
          else:
              print("Đèn đỏ")
    hints:
      - { vi: "Với pin 80, cả pin >= 70 và pin >= 30 đều đúng. Hai lệnh if riêng đều được kiểm tra, nên cả 2 khối cùng chạy. Con cần nối chúng thành 1 chuỗi để chỉ 1 nhánh chạy.", en: "With a battery of 80, both pin >= 70 and pin >= 30 are True. Two separate if statements are both checked, so both blocks run. Join them into 1 chain so that only 1 branch runs." }
      - { vi: "Đổi chữ if ở dòng 4 thành elif. Các dòng khác giữ nguyên.", en: "Change the word if on line 4 to elif. Keep the other lines as they are." }
    test_eligible: true
  - id: s3.elif.l4.ex2
    type: code
    concepts: [elif-vs-if]
    prompt:
      vi: "Trước khi đi chơi, Robo kiểm tra 2 việc riêng. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số phần trăm pin, dòng 2 là số phần trăm nước trong bình. Nếu pin dưới 30, in ra Robo cần sạc pin. Nếu nước dưới 20, in ra Robo cần đổ thêm nước. Cuối cùng, Robo luôn in ra Kiểm tra xong. Robo có thể in cả 2 lời nhắc, chỉ 1 lời nhắc, hoặc không lời nhắc nào, như phần Ví dụ."
      en: "Before going out, Robo checks 2 separate things. The Input data box has 2 lines: line 1 is the battery percent, and line 2 is the percent of water in the tank. If the battery is below 30, print Robo cần sạc pin. If the water is below 20, print Robo cần đổ thêm nước. At the end, Robo always prints Kiểm tra xong. Robo may print both reminders, only 1 reminder, or none, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      pin = int(input())
      nuoc = int(input())
      if pin < 30:
          print("Robo cần sạc pin")
      if nuoc < 20:
          print("Robo cần đổ thêm nước")
      print("Kiểm tra xong")
    tests:
      - input: "20\n10"
        output: |
          Robo cần sạc pin
          Robo cần đổ thêm nước
          Kiểm tra xong
      - input: "50\n10"
        output: |
          Robo cần đổ thêm nước
          Kiểm tra xong
        hidden: true
      - input: "20\n50"
        output: |
          Robo cần sạc pin
          Kiểm tra xong
        hidden: true
      - input: "30\n20"
        output: "Kiểm tra xong"
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Robo cần sạc pin
          Kiểm tra xong
        misconception: elif-vs-if
        sample: |
          pin = int(input())
          nuoc = int(input())
          if pin < 30:
              print("Robo cần sạc pin")
          elif nuoc < 20:
              print("Robo cần đổ thêm nước")
          print("Kiểm tra xong")
    hints:
      - { vi: "Pin và nước là 2 câu hỏi riêng: pin yếu không làm cho bình nước đầy lên. Con dùng 2 lệnh if riêng, không dùng elif, để cả 2 lời nhắc có thể cùng được in.", en: "The battery and the water are 2 separate questions: a low battery does not fill up the water tank. Use 2 separate if statements, not elif, so that both reminders can be printed." }
      - { vi: "Sau 2 dòng đọc pin và nuoc, viết if pin < 30: với 1 lệnh print thụt lề bên dưới, rồi if nuoc < 20: với 1 lệnh print thụt lề bên dưới. Dòng print(\"Kiểm tra xong\") sát lề trái, ở cuối.", en: "After the 2 lines that read pin and nuoc, write if pin < 30: with 1 indented print statement under it, then if nuoc < 20: with 1 indented print statement under it. The line print(\"Kiểm tra xong\") is at the left edge, at the end." }
    test_eligible: true
  - id: s3.elif.l4.q1
    type: predict
    concepts: [elif-vs-if]
    code: |
      n = 9
      if n > 5:
          print("A")
      if n > 7:
          print("B")
      else:
          print("C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A", misconception: elif-vs-if }
      - { text: "A\nC", misconception: elif-vs-if }
      - { text: "A\nB", correct: true }
      - { text: "A\nB\nC", misconception: else-branch }
    explanation:
      vi: "Đây là 2 lệnh if riêng, nên Python kiểm tra cả 2. 9 > 5 là True: in ra A. 9 > 7 cũng là True: in ra B. Nhánh else đi với lệnh if ngay phía trên nó, tức là if n > 7, nên else không chạy."
      en: "These are 2 separate if statements, so Python checks both. 9 > 5 is True: it prints A. 9 > 7 is also True: it prints B. The else branch belongs to the if right above it, which is if n > 7, so the else does not run."
  - id: s3.elif.l4.q2
    type: mcq
    concepts: [elif-vs-if]
    prompt:
      vi: "Bài toán nào nên dùng nhiều lệnh if riêng, thay vì 1 chuỗi if, elif, else?"
      en: "Which task should use several separate if statements instead of 1 if, elif, else chain?"
    choices:
      - { vi: "Robo xếp loại điểm thành Giỏi, Khá, Trung bình hoặc Cần cố gắng", en: "Robo grades a score as Giỏi, Khá, Trung bình or Cần cố gắng", misconception: elif-vs-if }
      - { vi: "Robo chọn 1 chiếc áo theo nhiệt độ: áo cộc, áo dài tay hoặc áo khoác", en: "Robo picks 1 piece of clothing by the temperature: a T-shirt, a long-sleeved shirt or a jacket", misconception: elif-vs-if }
      - { vi: "Robo bật 1 màu đèn theo số pin: xanh, vàng hoặc đỏ", en: "Robo turns on 1 light colour by the battery: green, yellow or red", misconception: elif-vs-if }
      - { vi: "Robo kiểm tra 3 việc riêng: pin yếu thì đi sạc, bình nước cạn thì đổ nước, bánh xe bẩn thì đi rửa", en: "Robo checks 3 separate things: charge if the battery is low, add water if the tank is empty, wash the wheels if they are dirty", correct: true }
    explanation:
      vi: "Pin, nước và bánh xe là 3 câu hỏi riêng, có thể cùng đúng một lúc, nên Robo cần 3 lệnh if riêng. Ở 3 bài toán kia, Robo chỉ cần đúng 1 câu trả lời trong nhiều trường hợp, nên dùng chuỗi if, elif, else."
      en: "The battery, the water and the wheels are 3 separate questions that can all be True at the same time, so Robo needs 3 separate if statements. In the other 3 tasks, Robo needs exactly 1 answer out of several cases, so it uses an if, elif, else chain."
---
Đôi khi Robo cần hỏi nhiều câu hỏi **riêng rẽ**, và nhiều câu có thể cùng đúng. Khi đó, con viết nhiều lệnh `if` riêng. Python kiểm tra **từng lệnh if**, nên nhiều khối có thể cùng chạy:

```python run
so = 12
if so % 2 == 0:
    print(so, "chia hết cho 2")
if so % 3 == 0:
    print(so, "chia hết cho 3")
```

12 chia hết cho cả 2 và 3, nên Python in ra cả 2 dòng.
---
Nếu con đổi lệnh if thứ hai thành `elif`, 2 lệnh trở thành 1 chuỗi. Trong 1 chuỗi, chỉ 1 nhánh chạy:

```python run
so = 12
if so % 2 == 0:
    print(so, "chia hết cho 2")
elif so % 3 == 0:
    print(so, "chia hết cho 3")
```

Lần này Python chỉ in ra 12 chia hết cho 2. Điều kiện đầu đã đúng, nên Python bỏ qua elif, và Robo quên mất rằng 12 cũng chia hết cho 3.
---
Ngược lại, khi xếp loại, Robo chỉ cần **đúng 1** câu trả lời. Nếu con dùng nhiều lệnh if riêng, Robo in ra quá nhiều:

```python run
diem = 9
if diem >= 8:
    print("Giỏi")
if diem >= 5:
    print("Trung bình")
```

Python in ra cả Giỏi và Trung bình, vì cả 2 điều kiện đều đúng. Con tự hỏi: Robo cần đúng 1 câu trả lời, hay có thể cần nhiều câu trả lời cùng lúc? Cần đúng 1 thì dùng chuỗi if, elif, else. Có thể cần nhiều thì dùng nhiều lệnh if riêng.
