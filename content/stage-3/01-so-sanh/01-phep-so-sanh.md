---
id: s3.so-sanh.l1
title: { vi: "Phép so sánh", en: "Comparison operators" }
exercises:
  - id: s3.so-sanh.l1.ex1
    type: code
    concepts: [compare-ops]
    prompt:
      vi: "Robo cần ít nhất 20 phần trăm pin thì mới chạy được. Ô Dữ liệu nhập có 1 dòng: số phần trăm pin của Robo, là số nguyên. Hãy đọc số đó vào biến pin, rồi in ra True nếu pin từ 20 trở lên, False nếu pin dưới 20, đúng như phần Ví dụ."
      en: "Robo needs at least 20 percent battery to run. The Input data box has 1 line: Robo's battery percent, an integer. Read the number into the variable pin, then print True if the battery is 20 or more, and False if it is below 20, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      pin = int(input())
      print("Đủ pin để chạy:", pin >= 20)
    tests:
      - input: "35"
        output: "Đủ pin để chạy: True"
      - input: "20"
        output: "Đủ pin để chạy: True"
        hidden: true
      - input: "8"
        output: "Đủ pin để chạy: False"
        hidden: true
    common_wrong:
      - test: 1
        output: "Đủ pin để chạy: False"
        misconception: compare-ops
        sample: |
          pin = int(input())
          print("Đủ pin để chạy:", pin > 20)
    hints:
      - { vi: "\"Từ 20 trở lên\" nghĩa là lớn hơn hoặc bằng 20. Phép so sánh này viết là >=. Dấu > chưa đủ, vì với đúng 20 phần trăm, Robo vẫn chạy được.", en: "\"20 or more\" means greater than or equal to 20. This comparison is written >=. The sign > is not enough, because with exactly 20 percent, Robo can still run." }
      - { vi: "Dòng 1 là pin = int(input()). Dòng 2 là print(\"Đủ pin để chạy:\", pin >= 20).", en: "Line 1 is pin = int(input()). Line 2 is print(\"Đủ pin để chạy:\", pin >= 20)." }
    test_eligible: true
  - id: s3.so-sanh.l1.ex2
    type: code
    concepts: [compare-ops]
    prompt:
      vi: "Con và Robo thi ném vòng. Ô Dữ liệu nhập có 2 dòng: dòng 1 là điểm của con, dòng 2 là điểm của Robo. Hãy đọc 2 số vào 2 biến diem_con và diem_robo, rồi in ra True nếu con được nhiều điểm hơn Robo, False nếu không, đúng như phần Ví dụ."
      en: "You and Robo play ring toss. The Input data box has 2 lines: line 1 is your score, and line 2 is Robo's score. Read the 2 numbers into the 2 variables diem_con and diem_robo, then print True if you have more points than Robo, and False if not, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      diem_con = int(input())
      diem_robo = int(input())
      print("Con thắng:", diem_con > diem_robo)
    tests:
      - input: "8\n6"
        output: "Con thắng: True"
      - input: "5\n9"
        output: "Con thắng: False"
        hidden: true
      - input: "7\n7"
        output: "Con thắng: False"
        hidden: true
    hints:
      - { vi: "Đọc 2 điểm bằng int(input()), mỗi điểm 1 dòng. \"Nhiều điểm hơn\" là phép lớn hơn, viết là >. Khi 2 bên bằng điểm nhau, con chưa thắng.", en: "Read the 2 scores with int(input()), 1 score on each line. \"More points\" is the greater-than comparison, written >. When both scores are the same, you have not won." }
      - { vi: "Hai dòng đầu là diem_con = int(input()) và diem_robo = int(input()). Dòng 3 là print(\"Con thắng:\", diem_con > diem_robo).", en: "The first 2 lines are diem_con = int(input()) and diem_robo = int(input()). Line 3 is print(\"Con thắng:\", diem_con > diem_robo)." }
    test_eligible: true
  - id: s3.so-sanh.l1.q1
    type: predict
    concepts: [compare-ops]
    code: |
      n = 7
      print(n >= 7, n > 7)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "True True", misconception: compare-ops }
      - { text: "True False", correct: true }
      - { text: "7 7", misconception: compare-ops }
      - { text: "False False", misconception: compare-ops }
    explanation:
      vi: "n bằng 7. Phép n >= 7 hỏi \"n lớn hơn hoặc bằng 7 không?\": có, vì n bằng 7, nên ra True. Phép n > 7 hỏi \"n lớn hơn 7 không?\": 7 không lớn hơn 7, nên ra False. Phép so sánh cho ra True hoặc False, không cho ra con số."
      en: "n is 7. n >= 7 asks \"is n greater than or equal to 7?\": yes, because n is 7, so it gives True. n > 7 asks \"is n greater than 7?\": 7 is not greater than 7, so it gives False. A comparison gives True or False, not a number."
  - id: s3.so-sanh.l1.q2
    type: mcq
    concepts: [compare-ops]
    prompt:
      vi: "Biến x đang chứa số 3. Phép so sánh nào cho ra True?"
      en: "The variable x holds the number 3. Which comparison gives True?"
    choices:
      - { text: "x > 3", misconception: compare-ops }
      - { text: "x < 3", misconception: compare-ops }
      - { text: "x <= 2", misconception: compare-ops }
      - { text: "x >= 3", correct: true }
    explanation:
      vi: "x >= 3 hỏi \"x lớn hơn hoặc bằng 3 không?\". x bằng 3, nên câu trả lời là có: True. Còn x > 3 và x < 3 đều ra False, vì 3 không lớn hơn và cũng không nhỏ hơn chính nó. x <= 2 cũng ra False, vì 3 lớn hơn 2."
      en: "x >= 3 asks \"is x greater than or equal to 3?\". x is 3, so the answer is yes: True. x > 3 and x < 3 both give False, because 3 is not greater than and not smaller than itself. x <= 2 also gives False, because 3 is greater than 2."
---
Robo có 5 viên pin, bạn của Robo có 3 viên. Ai có nhiều hơn? Để trả lời những câu hỏi như vậy, Python dùng **phép so sánh**. Kết quả của 1 phép so sánh chỉ có 2 khả năng: **True** (nghĩa là đúng) hoặc **False** (nghĩa là sai).

```python run
print(5 > 3)
print(2 > 7)
```

Dòng 1 hỏi "5 có lớn hơn 3 không?", Python trả lời True. Dòng 2 hỏi "2 có lớn hơn 7 không?", Python trả lời False.
---
Python có 4 phép so sánh lớn nhỏ:

- `>` là **lớn hơn**: `9 > 4` ra True.
- `<` là **nhỏ hơn**: `4 < 9` ra True.
- `>=` là **lớn hơn hoặc bằng**: `5 >= 5` ra True.
- `<=` là **nhỏ hơn hoặc bằng**: `5 <= 9` ra True.

```python run
print(5 > 5)
print(5 >= 5)
print(4 <= 5)
```

5 không lớn hơn 5, nên dòng 1 ra False. Nhưng 5 bằng 5, nên dòng 2 ra True. Khi viết `>=` và `<=`, con đặt 2 dấu sát nhau, dấu `=` luôn đứng sau.
---
Con có thể so sánh **biến** và **phép tính**. Python tính phép tính trước, rồi mới so sánh:

```python run
pin = 40
print(pin > 50)
print(pin + 20 > 50)
```

Dòng 2 hỏi "40 có lớn hơn 50 không?": False. Dòng 3 tính 40 + 20 được 60 trước, rồi hỏi "60 có lớn hơn 50 không?": True.
---
Con in kết quả so sánh cùng với chữ, giống như in 1 giá trị bình thường. Khi đọc số bằng `input()`, con nhớ đổi sang số bằng `int()` trước:

```python run
pin = int("45")  # giống như con gõ 45
print("Robo đủ pin:", pin >= 30)
```

Python in ra: Robo đủ pin: True. Nếu con gõ 12, kết quả sẽ là False. Cùng 1 chương trình, mỗi dữ liệu nhập cho 1 câu trả lời riêng.
