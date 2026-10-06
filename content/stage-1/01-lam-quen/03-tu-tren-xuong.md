---
id: s1.lam-quen.l3
title: { vi: "Lệnh chạy từ trên xuống", en: "From top to bottom" }
exercises:
  - id: s1.lam-quen.l3.ex1
    type: code
    concepts: [run-order, print-call]
    prompt:
      vi: "Viết chương trình in ra khuôn mặt của Robo, đúng 4 dòng như phần Ví dụ."
      en: "Write a program that prints the face of Robo: 4 lines, exactly as in the Example."
    starter: |
      print("+-----+")
    solution: |
      print("+-----+")
      print("| o o |")
      print("|  -  |")
      print("+-----+")
    tests:
      - output: |
          +-----+
          | o o |
          |  -  |
          +-----+
    common_wrong:
      - output: |
          +-----+
          +-----+
          | o o |
          |  -  |
        misconception: run-order
        sample: |
          print("+-----+")
          print("+-----+")
          print("| o o |")
          print("|  -  |")
    hints:
      - { vi: "Mỗi lệnh print in ra 1 dòng. Con cần 4 lệnh print.", en: "Each print statement prints 1 line. You need 4 print statements." }
      - { vi: "Các dòng được in theo đúng thứ tự con viết lệnh.", en: "The lines come out in the same order as your statements." }
    test_eligible: true
  - id: s1.lam-quen.l3.q1
    type: predict
    concepts: [print-call]
    code: |
      print("A")
      print()
      print("B")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\n\nB", correct: true }
      - { text: "A\nB", misconception: print-call }
      - { text: "AB" }
      - { text: "A\n()\nB", misconception: print-call }
    explanation:
      vi: "print() không có gì bên trong sẽ in ra 1 dòng trống."
      en: "print() with nothing inside prints 1 empty line."
---
Máy tính chạy các lệnh **lần lượt từ trên xuống dưới**. Mỗi lệnh `print` in ra **1 dòng**.

```python run
print("1. Thức dậy")
print("2. Đánh răng")
print("3. Học Python")
```
---
Muốn in ra **1 dòng trống**, dùng `print()` và để trống bên trong.

```python run
print("Dòng 1")
print()
print("Dòng 3")
```
