---
id: s3.if-else.l4
title: { vi: "Điều kiện từ dữ liệu nhập", en: "Conditions on input" }
exercises:
  - id: s3.if-else.l4.ex1
    type: code
    concepts: [convert-before-compare]
    prompt:
      vi: "Robo mở phòng trò chơi cho các bạn từ 10 tuổi trở lên. Ô Dữ liệu nhập có 1 dòng: tuổi của con, là số nguyên. Code bên phải báo lỗi TypeError. Hãy sửa code để in ra đúng như phần Ví dụ."
      en: "Robo opens the game room for children who are 10 or older. The Input data box has 1 line: your age, an integer. The code on the right gives a TypeError. Fix the code so that it prints as in the Example."
    starter: |
      tuoi = input()
      if tuoi >= 10:
          print("Mời con vào phòng trò chơi")
      else:
          print("Con chưa đủ tuổi")
    solution: |
      tuoi = int(input())
      if tuoi >= 10:
          print("Mời con vào phòng trò chơi")
      else:
          print("Con chưa đủ tuổi")
    tests:
      - input: "12"
        output: "Mời con vào phòng trò chơi"
      - input: "10"
        output: "Mời con vào phòng trò chơi"
        hidden: true
      - input: "9"
        output: "Con chưa đủ tuổi"
        hidden: true
    hints:
      - { vi: "input() đưa lại chuỗi. Python không so sánh lớn nhỏ được giữa chuỗi và số 10, nên báo lỗi TypeError. Con đổi dòng nhập thành số trước khi so sánh.", en: "input() gives back a string. Python cannot compare a string with the number 10 for bigger or smaller, so it gives a TypeError. Change the input into a number before comparing." }
      - { vi: "Sửa dòng 1 thành tuoi = int(input()).", en: "Change line 1 to tuoi = int(input())." }
    test_eligible: true
  - id: s3.if-else.l4.ex2
    type: code
    concepts: [else-branch, str-equality]
    prompt:
      vi: "Robo đố con: \"Con mèo\" trong tiếng Anh là gì? Đáp án là cat, viết thường. Ô Dữ liệu nhập có 1 dòng: câu trả lời của con. Nếu con trả lời đúng, in ra Đúng rồi!, nếu không thì in ra Chưa đúng, đáp án là cat, như phần Ví dụ."
      en: "Robo asks you: what is \"Con mèo\" in English? The answer is cat, in small letters. The Input data box has 1 line: your answer. If your answer is right, print Đúng rồi!, and if not, print Chưa đúng, đáp án là cat, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tra_loi = input()
      if tra_loi == "cat":
          print("Đúng rồi!")
      else:
          print("Chưa đúng, đáp án là cat")
    tests:
      - input: "cat"
        output: "Đúng rồi!"
      - input: "Cat"
        output: "Chưa đúng, đáp án là cat"
        hidden: true
      - input: "dog"
        output: "Chưa đúng, đáp án là cat"
        hidden: true
    hints:
      - { vi: "Câu trả lời là chữ, nên con đọc bằng input() và không đổi sang số. So sánh với chuỗi \"cat\" bằng ==. Câu trả lời Cat có chữ C hoa nên chưa đúng.", en: "The answer is text, so read it with input() and do not change it into a number. Compare it with the string \"cat\" using ==. The answer Cat has a capital C, so it is not right." }
      - { vi: "Dòng 1 là tra_loi = input(). Dòng 2 là if tra_loi == \"cat\":. Sau đó là nhánh in Đúng rồi!, dòng else:, và nhánh in Chưa đúng, đáp án là cat.", en: "Line 1 is tra_loi = input(). Line 2 is if tra_loi == \"cat\":. Then come the branch that prints Đúng rồi!, the line else:, and the branch that prints Chưa đúng, đáp án là cat." }
    test_eligible: true
  - id: s3.if-else.l4.q1
    type: mcq
    concepts: [convert-before-compare]
    code: |
      n = input()
      if n > 5:
          print("big")
      else:
          print("small")
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: 8. Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "The Input data box has 1 line: 8. What happens when this code runs?"
    choices:
      - { text: "big", misconception: convert-before-compare }
      - { text: "small", misconception: compare-str-num }
      - { vi: "Báo lỗi TypeError ở dòng 2", en: "A TypeError on line 2", correct: true, error: true }
      - { text: "big\nsmall", misconception: else-branch }
    explanation:
      vi: "input() đưa lại chuỗi \"8\", không phải số 8. Dòng 2 so sánh lớn nhỏ giữa chuỗi \"8\" và số 5, nên Python báo lỗi TypeError ở dòng 2 và không chạy nhánh nào. Muốn so sánh như số, con viết n = int(input())."
      en: "input() gives back the string \"8\", not the number 8. Line 2 compares the string \"8\" with the number 5 for bigger or smaller, so Python gives a TypeError on line 2 and runs no branch. To compare as numbers, write n = int(input())."
  - id: s3.if-else.l4.q2
    type: mcq
    concepts: [convert-before-compare]
    prompt:
      vi: "Robo hỏi con thích màu gì, rồi so sánh câu trả lời với chuỗi \"blue\". Dòng nào đọc câu trả lời đúng cách?"
      en: "Robo asks you which colour you like, then compares your answer with the string \"blue\". Which line reads the answer the right way?"
    choices:
      - { text: "ans = int(input())", misconception: convert-before-compare }
      - { text: "ans = input()", correct: true }
      - { text: "ans == input()", misconception: eq-vs-assign }
      - { text: "ans = \"input()\"", misconception: string-quotes }
    explanation:
      vi: "Câu trả lời là chữ, nên con chỉ đọc bằng input() và để nguyên là chuỗi. Chỉ đổi bằng int() khi dữ liệu là số: int(\"blue\") báo lỗi ValueError. ans == input() là 1 phép so sánh, không cất gì vào ans, nên Python báo lỗi NameError vì ans chưa có giá trị. Còn \"input()\" có dấu nháy chỉ là 1 chuỗi, không đọc gì cả."
      en: "The answer is text, so just read it with input() and keep it as a string. Only change it with int() when the data is a number: int(\"blue\") gives a ValueError. ans == input() is a comparison that stores nothing in ans, so Python gives a NameError because ans has no value yet. And \"input()\" with quotes is just a string that reads nothing."
---
Khi điều kiện dùng số con nhập vào, con nhớ đổi sang số bằng `int()` trước, như đã học ở giai đoạn 2:

```python run
tuoi = int("11")  # giống như con gõ 11
if tuoi >= 10:
    print("Con được chơi tàu lượn")
else:
    print("Con chưa đủ tuổi")
```

Trong bài tập, con viết `tuoi = int(input())`. Sau dòng này, tuoi là số 11, và Python so sánh được 11 với 10.
---
Nếu con quên `int()`, biến chứa 1 chuỗi. So sánh lớn nhỏ giữa chuỗi và số thì Python báo lỗi:

```python run expect-error
tuoi = "11"  # giống như con gõ 11 mà chưa đổi sang số
if tuoi >= 10:
    print("Con được chơi tàu lượn")
```

Lời báo lỗi là TypeError: '>=' not supported between instances of 'str' and 'int'. Câu này nghĩa là phép >= không dùng được giữa chuỗi (str) và số nguyên (int).
---
Khi so sánh 2 dữ liệu nhập với nhau mà quên `int()`, Python không báo lỗi, nhưng kết quả có thể **sai**:

```python run
a = "9"   # giống như con gõ 9
b = "10"  # giống như con gõ 10
if a > b:
    print("Số đầu lớn hơn")
else:
    print("Số đầu không lớn hơn")
```

Python in ra Số đầu lớn hơn, vì nó so sánh 2 chuỗi theo từng ký tự, và "9" đứng sau "1". Đổi cả 2 thành số bằng `int()` thì kết quả mới đúng. Lỗi im lặng như vậy khó thấy hơn lỗi có báo.
---
Khi dữ liệu nhập là chữ, như mật khẩu hay câu trả lời, con **không đổi** sang số. Con so sánh luôn với 1 chuỗi bằng `==`:

```python run
tra_loi = "Hà Nội"  # giống như con gõ Hà Nội
if tra_loi == "Hà Nội":
    print("Đúng rồi!")
else:
    print("Chưa đúng, con thử lại nhé")
```

Nhớ rằng chữ hoa, chữ thường và dấu cách đều phải giống hệt. Còn nếu con viết `int(input())` rồi gõ chữ, Python báo lỗi ValueError, vì chữ không đổi được thành số.
