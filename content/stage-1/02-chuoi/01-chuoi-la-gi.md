---
id: s1.chuoi.l1
title: { vi: "Chuỗi là gì?", en: "What is a string?" }
exercises:
  - id: s1.chuoi.l1.ex1
    type: code
    concepts: [string-exact]
    prompt:
      vi: "Viết chương trình in ra thẻ tên của Robo, đúng 3 dòng như phần Ví dụ. Giữ nguyên mọi dấu cách và chữ số."
      en: "Write a program that prints the name card of Robo: 3 lines, exactly as in the Example. Keep every space and every digit."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      print("Tên:   Robo")
      print("Mã số: 007")
      print("Pin:   100%")
    tests:
      - output: |
          Tên:   Robo
          Mã số: 007
          Pin:   100%
    common_wrong:
      - output: |
          Tên: Robo
          Mã số: 007
          Pin: 100%
        misconception: string-exact
        sample: |
          print("Tên: Robo")
          print("Mã số: 007")
          print("Pin: 100%")
    hints:
      - { vi: "Mỗi dòng cần 1 lệnh print. Chép chữ trong phần Ví dụ vào giữa 2 dấu nháy.", en: "Each line needs 1 print statement. Copy the text of the Example between the 2 quotes." }
      - { vi: "Đếm dấu cách cho kỹ: sau Tên: và sau Pin: có 3 dấu cách, sau Mã số: có 1 dấu cách.", en: "Count the spaces carefully: there are 3 spaces after Tên: and after Pin:, and 1 space after Mã số:." }
    test_eligible: true
  - id: s1.chuoi.l1.q1
    type: predict
    concepts: [string-exact]
    code: |
      print("A  B")
      print("  C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A B\nC", misconception: string-exact }
      - { text: "AB\nC" }
      - { text: "A  B  C" }
      - { text: "A  B\n  C", correct: true }
    explanation:
      vi: "Python in chuỗi y nguyên, kể cả dấu cách. Dòng 1 có 2 dấu cách giữa A và B. Dòng 2 có 2 dấu cách trước C."
      en: "Python prints a string exactly as it is, spaces included. Line 1 has 2 spaces between A and B. Line 2 has 2 spaces before C."
  - id: s1.chuoi.l1.q2
    type: mcq
    concepts: [string-exact]
    prompt:
      vi: 'Chuỗi "Hi Bo!" có bao nhiêu ký tự?'
      en: 'How many characters are there in the string "Hi Bo!"?'
    choices:
      - { text: "4", misconception: string-exact }
      - { text: "5", misconception: string-exact }
      - { text: "6", correct: true }
      - { text: "8", misconception: string-quotes }
    explanation:
      vi: "Chuỗi gồm H, i, dấu cách, B, o và dấu chấm than: 6 ký tự. Dấu cách và dấu câu cũng là ký tự. Hai dấu nháy chỉ đánh dấu chỗ bắt đầu và chỗ kết thúc, không thuộc chuỗi."
      en: "The string has H, i, a space, B, o and an exclamation mark: 6 characters. Spaces and punctuation marks are characters too. The 2 quotes only mark where the string starts and ends. They are not part of it."
---
Ở chủ đề trước, con đã viết `print("Xin chào Robo")`. Phần chữ nằm trong dấu nháy có tên riêng là **chuỗi** (tiếng Anh: string).

Chuỗi là một dãy **ký tự** xếp liền nhau, giống những hạt cườm xâu thành một chuỗi vòng. Mỗi chữ cái, chữ số, dấu cách hay dấu câu là 1 ký tự. Chuỗi `"Py 3"` có 4 ký tự: P, y, dấu cách và 3.

```python run
print("Robo")
print("Robo có 4 bánh xe!")
```
---
Python in chuỗi **y nguyên**, từng ký tự một. Con viết bao nhiêu dấu cách thì Python in ra bấy nhiêu dấu cách. Dấu câu cũng được giữ nguyên.

```python run
print("Robo chạy")
print("Robo    chạy")
print("   Robo chạy!!!")
```
---
Chữ số nằm trong chuỗi cũng chỉ là ký tự. `"5"` là chữ 5, giống số trên áo cầu thủ: để đọc, không phải để tính.

Vì vậy `print("1 + 2")` in ra 1 + 2, chứ không ra 3. Python cũng không sửa phép tính sai nằm trong chuỗi:

```python run
print("5")
print("Số nhà 007")
print("1 + 1 = 3")
```
---
Con đã biết `print()` để trống in ra 1 dòng trống.

`print("")` cũng in ra 1 dòng trống. Hai dấu nháy liền nhau `""` là **chuỗi rỗng**: chuỗi không có ký tự nào, giống một sợi dây chưa xâu hạt nào.

```python run
print("Robo")
print("")
print("Py-Pet")
```
