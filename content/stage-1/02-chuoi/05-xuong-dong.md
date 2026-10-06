---
id: s1.chuoi.l5
title: { vi: 'Xuống dòng với \n', en: 'New lines with \n' }
exercises:
  - id: s1.chuoi.l5.ex1
    type: code
    concepts: [newline-escape]
    prompt:
      vi: "Chỉ dùng 1 lệnh print, in ra lịch của Robo đúng 3 dòng như phần Ví dụ."
      en: "Use only 1 print statement to print the timetable of Robo: 3 lines, exactly as in the Example."
    starter: |
      # Viết 1 lệnh print ở dưới dòng này
    solution: |
      print("Sáng: học Python\nTrưa: sạc pin\nTối: đi ngủ")
    tests:
      - output: |
          Sáng: học Python
          Trưa: sạc pin
          Tối: đi ngủ
    common_wrong:
      - output: "Sáng: học Python/nTrưa: sạc pin/nTối: đi ngủ"
        misconception: newline-escape
        sample: |
          print("Sáng: học Python/nTrưa: sạc pin/nTối: đi ngủ")
      - output: |
          Sáng: học Python
           Trưa: sạc pin
           Tối: đi ngủ
        misconception: newline-escape
        sample: |
          print("Sáng: học Python\n Trưa: sạc pin\n Tối: đi ngủ")
    hints:
      - { vi: 'Đặt \n vào chỗ cần xuống dòng, ngay trong chuỗi.', en: 'Put \n inside the string where a new line must start.' }
      - { vi: 'Có 3 dòng nên cần 2 lần \n: 1 lần sau chữ Python, 1 lần sau chữ pin. Không đặt dấu cách ngay sau \n.', en: 'There are 3 lines, so you need \n 2 times: after the word Python and after the word pin. Do not put a space right after \n.' }
    test_eligible: true
  - id: s1.chuoi.l5.q1
    type: predict
    concepts: [newline-escape]
    code: |
      print("Hi\nBo")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Hi\nBo", correct: true }
      - { text: 'Hi\nBo', misconception: newline-escape }
      - { text: "HiBo" }
      - { text: "Hi nBo" }
    explanation:
      vi: 'Trong chuỗi, \n là ký tự xuống dòng. Python in Hi, xuống dòng, rồi in Bo. Hai ký tự \ và n không được in ra.'
      en: 'Inside a string, \n is the new-line character. Python prints Hi, starts a new line, then prints Bo. The 2 characters \ and n are not printed.'
  - id: s1.chuoi.l5.q2
    type: mcq
    concepts: [newline-escape]
    prompt:
      vi: "Lệnh nào in ra 2 dòng: dòng 1 là A, dòng 2 là B?"
      en: "Which statement prints 2 lines: A on line 1 and B on line 2?"
    choices:
      - { text: 'print("A\nB")', correct: true }
      - { text: 'print("A/nB")', misconception: newline-escape }
      - { text: 'print("A" + "B")' }
      - { text: 'print("A n B")' }
    explanation:
      vi: 'Ký tự xuống dòng viết là \n, với dấu gạch chéo ngược. /n chỉ là 2 ký tự bình thường. Còn dấu + nối A và B trên cùng 1 dòng.'
      en: '\n, with a backslash, is the new-line character. /n is just 2 ordinary characters. And + joins A and B on the same line.'
---
Ở bài 2, con đã gặp dấu `\` trong `\"`. Dấu `\` báo cho Python biết: ký tự ngay sau nó có nghĩa đặc biệt.

`\n` (dấu gạch chéo ngược và chữ n) là **ký tự xuống dòng**. Gặp `\n`, Python chuyển xuống dòng mới rồi in tiếp. Chữ n là chữ đầu của *new line*, nghĩa là "dòng mới".

```python run
print("Robo\nPy-Pet")
```
---
Nhờ `\n`, chỉ cần **1 lệnh print** là in được nhiều dòng. Lệnh dưới đây in ra 4 dòng, giống như 4 lệnh print:

```python run
print("3\n2\n1\nBay!")
```
---
Python **không in** 2 ký tự `\` và `n`. Hai ký tự này viết cạnh nhau thì thành 1 ký tự xuống dòng.

Nhớ viết đúng dấu gạch chéo ngược `\`. Nếu viết nhầm thành `/n` thì Python in y nguyên `/n` và không xuống dòng:

```python run
print("Py\nPet")
print("Py/nPet")
```
