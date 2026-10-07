---
id: s1.chu-thich-loi.l4
title: { vi: "Những lỗi hay gặp", en: "Common mistakes" }
exercises:
  - id: s1.chu-thich-loi.l4.ex1
    type: code
    concepts: [bracket-pairs, syntax-error-nothing-runs, runtime-error-stops]
    prompt:
      vi: "Đoạn code bên phải có 3 lỗi. Mỗi lần chạy, Python chỉ báo 1 lỗi. Hãy sửa từng lỗi một và chạy lại sau mỗi lần sửa, để chương trình in ra 3 dòng như phần Ví dụ."
      en: "The code on the right has 3 errors. Each time it runs, Python shows only 1 error. Fix the errors one by one and run the code again after each fix, so that the program prints the 3 lines in the Example."
    starter: |
      print("Robo thức dậy)
      print "Robo ăn sáng"
      pirnt("Robo đi học")
    solution: |
      print("Robo thức dậy")
      print("Robo ăn sáng")
      print("Robo đi học")
    tests:
      - output: |
          Robo thức dậy
          Robo ăn sáng
          Robo đi học
    hints:
      - { vi: "Bấm Chạy thử, sửa đúng dòng có số trong thông báo lỗi, rồi bấm Chạy thử lại. Làm như vậy 3 lần.", en: "Click Run, fix the line whose number is in the error message, then click Run again. Do this 3 times." }
      - { vi: "Dòng 1 thiếu dấu nháy đóng. Dòng 2 thiếu cặp ngoặc tròn của print. Dòng 3 gõ sai tên lệnh print.", en: "Line 1 is missing its closing quote. Line 2 is missing the round brackets of print. Line 3 has a typo in the name print." }
    test_eligible: true
  - id: s1.chu-thich-loi.l4.q1
    type: mcq
    concepts: [bracket-pairs]
    prompt:
      vi: "Dòng code nào có đủ các cặp ngoặc và dấu nháy?"
      en: "Which line of code has all of its brackets and quotes in pairs?"
    choices:
      - { text: "print(\"Robo\" + \"!\"", misconception: bracket-pairs }
      - { text: "print(\"Robo\" + \"!\")", correct: true }
      - { text: "print(\"Robo\" + \"!)", misconception: bracket-pairs }
      - { text: "print(\"Robo\" + \"!\"))", misconception: bracket-pairs }
    explanation:
      vi: "Mỗi dấu ( cần đúng 1 dấu ) để đóng, và mỗi chuỗi cần 1 dấu nháy mở và 1 dấu nháy đóng. Chỉ dòng print(\"Robo\" + \"!\") có đủ các cặp: không thiếu, không thừa."
      en: "Each ( needs exactly 1 ) to close it, and each string needs 1 opening quote and 1 closing quote. Only the line print(\"Robo\" + \"!\") has all its pairs, with nothing missing and nothing extra."
  - id: s1.chu-thich-loi.l4.q2
    type: predict
    concepts: [bracket-pairs, syntax-error-nothing-runs]
    code: |
      print("A")
      print("B" + "C"))
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "Không in gì, báo lỗi SyntaxError ở dòng 2", en: "It prints nothing and shows a SyntaxError on line 2", correct: true, error: true }
      - { text: "A\nBC", misconception: bracket-pairs }
      - { vi: "In ra A, rồi báo lỗi SyntaxError ở dòng 2", en: "It prints A, then shows a SyntaxError on line 2", error: true, misconception: syntax-error-nothing-runs }
      - { text: "A", misconception: syntax-error-nothing-runs }
    explanation:
      vi: "Dòng 2 thừa 1 dấu ), không có dấu ( nào đi cặp với nó, nên có lỗi cú pháp. Với lỗi cú pháp, Python không chạy dòng nào, nên chữ A cũng không được in."
      en: "Line 2 has an extra ) with no ( to pair with it, so there is a syntax error. With a syntax error, Python runs no line at all, so A is not printed either."
---
Dấu ngoặc và dấu nháy luôn đi thành **cặp**, giống như 1 đôi giày: thiếu 1 chiếc là không đi được. Mỗi dấu `(` cần 1 dấu `)` để đóng. Mỗi chuỗi cần 1 dấu nháy mở và 1 dấu nháy đóng cùng loại.

Bấm Chạy thử 2 ví dụ dưới đây. Ví dụ đầu thiếu dấu nháy đóng, ví dụ sau thiếu dấu ngoặc đóng:

```python run expect-error
print("Robo đi học)
```

```python run expect-error
print("Robo đi học"
```

Trong *Xem lỗi gốc*, `unterminated string literal` nghĩa là chuỗi chưa được đóng, còn `'(' was never closed` nghĩa là dấu ( chưa được đóng.
---
Ở chủ đề 2, con đã biết: dấu nháy kép nằm bên trong 1 chuỗi mở bằng nháy kép sẽ **đóng chuỗi quá sớm**. Bấm Chạy thử để xem Robo giải thích:

```python run expect-error
print("Robo nói: "Chào"")
```

Python thấy chuỗi `"Robo nói: "` đã đóng, rồi gặp chữ Chào nằm ngoài dấu nháy, nên báo lỗi cú pháp. Cách sửa: bao ngoài chuỗi bằng dấu nháy đơn.

```python run
print('Robo nói: "Chào"')
```
---
Hai lỗi khác cũng rất hay gặp: **gõ sai tên lệnh** và **quên dấu ngoặc của print**.

```python run expect-error
pirnt("Robo")
```

```python run expect-error
print "Robo"
```

Với `pirnt`, Python không biết tên này nên báo NameError, và Robo đoán con muốn viết `print`. Với `print "Robo"`, Python báo SyntaxError vì lệnh print luôn cần cặp ngoặc tròn.
---
Code có nhiều lỗi thì sao? Mỗi lần chạy, Python chỉ báo **1 lỗi**. Con hãy **sửa từng lỗi một**: sửa lỗi Python vừa báo, bấm Chạy thử lại, rồi xem lỗi tiếp theo.

```python run expect-error
print("Một")
print("Hai)
Print("Ba")
```

Lần chạy đầu, Python chỉ báo lỗi cú pháp ở dòng 2 và không in gì. Nếu sửa xong dòng 2 rồi chạy lại, Python mới in ra Một và Hai, rồi báo lỗi NameError ở dòng 3.
