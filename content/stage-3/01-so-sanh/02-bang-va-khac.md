---
id: s3.so-sanh.l2
title: { vi: "Bằng == và khác !=", en: "Equal == and not equal !=" }
exercises:
  - id: s3.so-sanh.l2.ex1
    type: code
    concepts: [eq-vs-assign]
    prompt:
      vi: "Chiếc hộp bí mật của Robo có mật mã là 1234. Ô Dữ liệu nhập có 1 dòng: số con đoán. Hãy đọc số đó vào biến ma, rồi in ra True nếu con đoán đúng mật mã, False nếu đoán sai, đúng như phần Ví dụ."
      en: "Robo's secret box has the code 1234. The Input data box has 1 line: the number you guess. Read the number into the variable ma, then print True if your guess is the right code, and False if it is wrong, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ma = int(input())
      print("Mở được hộp:", ma == 1234)
    tests:
      - input: "1234"
        output: "Mở được hộp: True"
      - input: "4321"
        output: "Mở được hộp: False"
        hidden: true
    hints:
      - { vi: "Hỏi \"ma có bằng 1234 không?\" thì dùng 2 dấu bằng ==. Một dấu = là lệnh gán, không phải câu hỏi.", en: "To ask \"is ma equal to 1234?\", use 2 equal signs ==. One = is an assignment, not a question." }
      - { vi: "Dòng 1 là ma = int(input()). Dòng 2 là print(\"Mở được hộp:\", ma == 1234).", en: "Line 1 is ma = int(input()). Line 2 is print(\"Mở được hộp:\", ma == 1234)." }
    test_eligible: true
  - id: s3.so-sanh.l2.ex2
    type: code
    concepts: [eq-vs-assign]
    prompt:
      vi: "Robo muốn biết số kẹo con gõ có phải số chẵn không. Số chẵn là số chia 2 dư 0. Code bên phải báo lỗi SyntaxError ở dòng 2. Hãy sửa code để in ra đúng dòng như phần Ví dụ."
      en: "Robo wants to know if the number of sweets you type is even. An even number has remainder 0 when divided by 2. The code on the right shows a SyntaxError on line 2. Fix the code to print the line in the Example."
    starter: |
      so_keo = int(input())
      print("Số kẹo chẵn:", so_keo % 2 = 0)
    solution: |
      so_keo = int(input())
      print("Số kẹo chẵn:", so_keo % 2 == 0)
    tests:
      - input: "6"
        output: "Số kẹo chẵn: True"
      - input: "7"
        output: "Số kẹo chẵn: False"
        hidden: true
    hints:
      - { vi: "Dòng 2 muốn hỏi \"số dư có bằng 0 không?\". Câu hỏi bằng nhau cần 2 dấu bằng, còn 1 dấu = là lệnh gán.", en: "Line 2 wants to ask \"is the remainder equal to 0?\". A question about being equal needs 2 equal signs, and one = is an assignment." }
      - { vi: "Sửa so_keo % 2 = 0 thành so_keo % 2 == 0.", en: "Change so_keo % 2 = 0 to so_keo % 2 == 0." }
    test_eligible: true
  - id: s3.so-sanh.l2.q1
    type: predict
    concepts: [eq-vs-assign, compare-ops]
    code: |
      a = 5
      b = a + 1
      print(a == 5, b != 6)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "5 6", misconception: eq-vs-assign }
      - { text: "False False", misconception: var-reassign }
      - { text: "True False", correct: true }
      - { text: "True True", misconception: compare-ops }
    explanation:
      vi: "Dòng 2 tính a + 1 rồi cất 6 vào b, còn a vẫn là 5. Vì vậy a == 5 ra True. Phép b != 6 hỏi \"b có khác 6 không?\": b bằng 6, nên ra False. Dấu == và != chỉ hỏi, không cất giá trị và không in ra con số."
      en: "Line 2 works out a + 1 and stores 6 in b, and a is still 5. So a == 5 gives True. b != 6 asks \"is b different from 6?\": b is 6, so it gives False. == and != only ask: they do not store a value, and they do not print a number."
  - id: s3.so-sanh.l2.q2
    type: mcq
    concepts: [eq-vs-assign]
    prompt:
      vi: "Biến diem đang chứa số 10. Robo muốn in ra True nếu diem bằng 10. Dòng nào viết đúng?"
      en: "The variable diem holds the number 10. Robo wants to print True if diem is equal to 10. Which line is right?"
    choices:
      - { text: "print(diem = 10)", misconception: eq-vs-assign }
      - { text: "print(\"diem\" == 10)", misconception: var-assign }
      - { text: "diem == 10", misconception: compare-ops }
      - { text: "print(diem == 10)", correct: true }
    explanation:
      vi: "print(diem == 10) hỏi \"diem có bằng 10 không?\" rồi in ra câu trả lời True. Với 1 dấu =, Python báo lỗi TypeError. Có dấu nháy thì \"diem\" là chữ diem, không phải biến, nên so với 10 ra False. Còn diem == 10 không có print thì chẳng in ra gì."
      en: "print(diem == 10) asks \"is diem equal to 10?\" and prints the answer True. With one =, Python shows a TypeError. With quotes, \"diem\" is the word diem, not the variable, so comparing it with 10 gives False. And diem == 10 without print prints nothing."
---
Muốn hỏi "2 giá trị có **bằng nhau** không?", con dùng phép **==**, gồm 2 dấu bằng viết liền nhau:

```python run
print(3 + 4 == 7)
print(10 == 1 + 1)
```

3 + 4 bằng 7, nên dòng 1 ra True. 1 + 1 là 2, không bằng 10, nên dòng 2 ra False.
---
Dấu `=` và dấu `==` khác nhau:

- `=` là lệnh **gán**: cất giá trị vào biến.
- `==` là câu **hỏi**: 2 giá trị có bằng nhau không?

```python run
tuoi = 11
print(tuoi == 11)
print(tuoi == 12)
```

Dòng 1 cất số 11 vào biến `tuoi`. Dòng 2 và dòng 3 chỉ hỏi, không thay đổi biến: tuoi bằng 11 nên ra True, không bằng 12 nên ra False.
---
Muốn hỏi "2 giá trị có **khác nhau** không?", con dùng phép **!=**. Dấu `!` đứng trước, dấu `=` đứng sau, viết liền nhau:

```python run
tuoi = 11
print(tuoi != 12)
print(tuoi != 11)
```

tuoi khác 12, nên dòng 2 ra True. tuoi không khác 11, nên dòng 3 ra False. Phép `!=` luôn cho kết quả ngược với phép `==`.
---
Viết 1 dấu `=` ở chỗ cần `==` là lỗi rất hay gặp. Bên trong print, Python báo lỗi, vì nó tưởng con đang viết 1 tham số như `sep=` hay `end=`:

```python run expect-error
tuoi = 11
print(tuoi = 11)
```

Có khi Python không báo lỗi mà làm sai. Dưới đây, con định hỏi tuoi có bằng 12 không, nhưng lại viết `tuoi = 12`:

```python run
tuoi = 11
tuoi = 12  # con định hỏi: tuoi có bằng 12 không?
print(tuoi)
```

Lệnh gán ở dòng 2 cất 12 vào biến, số 11 bị mất, và Python in ra 12 thay vì True hay False.
