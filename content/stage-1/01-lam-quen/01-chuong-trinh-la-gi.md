---
id: s1.lam-quen.l1
title: { vi: "Chương trình là gì?", en: "What is a program?" }
exercises:
  - id: s1.lam-quen.l1.ex1
    type: code
    concepts: [print-call, string-quotes]
    prompt:
      vi: "Viết chương trình in ra dòng chữ: Xin chào Robo"
      en: "Write a program that prints this text: Xin chào Robo"
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      print("Xin chào Robo")
    tests:
      - { output: "Xin chào Robo" }
    hints:
      - { vi: "Dùng lệnh print(...).", en: "Use print(...)." }
      - { vi: "Chữ cần in phải nằm trong dấu nháy kép: print(\"...\")", en: "Put the text inside double quotes: print(\"...\")" }
    test_eligible: true
  - id: s1.lam-quen.l1.q1
    type: mcq
    concepts: [print-call, string-quotes, case-sensitive]
    prompt:
      vi: "Lệnh nào in ra màn hình dòng chữ Hello?"
      en: "Which statement prints the text Hello?"
    choices:
      - { text: "print(\"Hello\")", correct: true }
      - { text: "print(Hello)", misconception: string-quotes }
      - { text: "Print(\"Hello\")", misconception: case-sensitive }
      - { text: "print \"Hello\"", misconception: print-call }
    explanation:
      vi: "Lệnh in là print viết thường, có dấu ngoặc tròn, và chữ cần in nằm trong dấu nháy."
      en: "The print statement uses lower-case print, round brackets, and quotes around the text."
---
**Chương trình** là một danh sách **lệnh** viết cho máy tính. Máy tính làm đúng từng lệnh, không hơn, không kém.

Trong Py-Pet, con viết lệnh bằng ngôn ngữ **Python**. Bấm **Chạy thử** để xem máy tính làm gì:

```python run
print("Xin chào, mình là Robo!")
```
---
Lệnh `print(...)` nghĩa là **in ra màn hình**. Chữ muốn in phải nằm trong cặp dấu nháy kép `"..."`.

```python run
print("Python thật vui")
```

Con thử đoán: nếu đổi chữ bên trong dấu nháy thì kết quả sẽ thay đổi thế nào?
