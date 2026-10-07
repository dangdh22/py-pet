---
id: s1.chuoi.l2
title: { vi: "Dấu nháy bên trong chuỗi", en: "Quotes inside a string" }
exercises:
  - id: s1.chuoi.l2.ex1
    type: code
    concepts: [quote-inside]
    prompt:
      vi: "Viết chương trình in ra câu nói của Robo, đúng như phần Ví dụ, có cả 2 dấu nháy kép."
      en: "Write a program that prints what Robo says, exactly as in the Example, with both double quotes."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      print('Robo nói: "Xin chào!"')
    tests:
      - output: |
          Robo nói: "Xin chào!"
    common_wrong:
      - output: |
          Robo nói: Xin chào!
        misconception: quote-inside
        sample: |
          print("Robo nói: Xin chào!")
    hints:
      - { vi: "Bên trong chuỗi có dấu nháy kép. Hãy bao ngoài chuỗi bằng loại dấu nháy còn lại.", en: "There are double quotes inside the string. Put the other type of quote around the string." }
      - { vi: "Mở và đóng chuỗi bằng dấu nháy đơn: print('...'). Giữ nguyên 2 dấu nháy kép ở bên trong.", en: "Open and close the string with single quotes: print('...'). Keep the 2 double quotes inside." }
    test_eligible: true
  - id: s1.chuoi.l2.q1
    type: predict
    concepts: [quote-inside]
    code: |
      print('Say "hi"')
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Say hi", misconception: quote-inside }
      - { text: "'Say \"hi\"'", misconception: string-quotes }
      - { vi: "Báo lỗi ở dòng 1", en: "An error on line 1", error: true, misconception: quote-inside }
      - { text: 'Say "hi"', correct: true }
    explanation:
      vi: "Chuỗi mở và đóng bằng dấu nháy đơn, nên 2 dấu nháy kép ở giữa chỉ là ký tự bình thường và được in ra. Hai dấu nháy đơn bao ngoài thì không được in."
      en: "The string opens and closes with single quotes, so the 2 double quotes inside are ordinary characters and are printed. The single quotes around it are not printed."
  - id: s1.chuoi.l2.q2
    type: mcq
    concepts: [quote-inside, string-quotes]
    prompt:
      vi: "Lệnh nào in ra đúng dòng chữ: It's OK"
      en: "Which statement prints exactly this text: It's OK"
    choices:
      - { text: "print('It's OK')", misconception: quote-inside }
      - { text: "print(It's OK)", misconception: string-quotes }
      - { text: "print(\"It's OK\")", correct: true }
      - { text: "print(\"It's OK')", misconception: string-quotes }
    explanation:
      vi: "Chuỗi có dấu nháy đơn bên trong thì bao ngoài bằng dấu nháy kép. Với print('It's OK'), dấu nháy đơn sau chữ It đã đóng chuỗi mất rồi, nên Python báo lỗi."
      en: "A string with a single quote inside goes between double quotes. In print('It's OK'), the single quote after It closes the string too early, so Python shows an error."
---
Muốn in câu có dấu nháy, ví dụ Robo nói: "Chào con!", con cần nhớ: dấu nháy đầu tiên **mở** chuỗi, còn dấu nháy **cùng loại** tiếp theo sẽ **đóng** chuỗi.

Vì vậy viết như dưới đây là sai. Dấu nháy kép đứng trước chữ Chào đã đóng chuỗi mất rồi, nên Python không hiểu phần còn lại và báo lỗi.

```python
print("Robo nói: "Chào con!"")
```
---
Cách sửa: chuỗi có dấu nháy kép bên trong thì bao ngoài bằng **dấu nháy đơn**. Ngược lại, chuỗi có dấu nháy đơn bên trong thì bao ngoài bằng **dấu nháy kép**.

```python run
print('Robo nói: "Chào con!"')
print("It's Robo")
```
---
Nếu chuỗi cần cả 2 loại dấu nháy, hãy đặt **dấu gạch chéo ngược** `\` ngay trước dấu nháy ở bên trong.

`\"` báo cho Python biết: đây là dấu nháy để in ra, không phải dấu đóng chuỗi. Python in ra dấu nháy, còn dấu `\` thì không in.

```python run
print("Robo nói: \"It's me!\"")
print('It\'s Robo')
```
