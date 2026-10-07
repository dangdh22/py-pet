---
id: s2.input.l2
title: { vi: "Để trống ngoặc của input()", en: "Keep input() empty" }
exercises:
  - id: s2.input.l2.ex1
    type: code
    concepts: [input-prompt]
    prompt:
      vi: "Robo hỏi món ăn con thích. Code bên phải có lời nhắc trong ngoặc của input(), nên kết quả bị thừa chữ và bị chấm sai. Hãy sửa code để in ra đúng dòng như phần Ví dụ."
      en: "Robo asks which food you like. The code on the right has a prompt inside the brackets of input(), so the output has extra text and is marked wrong. Fix the code to print the line in the Example."
    starter: |
      mon = input("Con thích ăn gì? ")
      print("Robo cũng thích", mon)
    solution: |
      mon = input()
      print("Robo cũng thích", mon)
    tests:
      - input: "phở"
        output: "Robo cũng thích phở"
      - input: "bánh mì"
        output: "Robo cũng thích bánh mì"
        hidden: true
    common_wrong:
      - output: "Con thích ăn gì? Robo cũng thích phở"
        misconception: input-prompt
        sample: |
          mon = input("Con thích ăn gì? ")
          print("Robo cũng thích", mon)
    hints:
      - { vi: "Bấm Chạy thử rồi so sánh kết quả với phần Ví dụ. Chữ thừa ở đầu dòng đến từ ngoặc của input().", en: "Press Run and compare the output with the Example. The extra text at the start of the line comes from the brackets of input()." }
      - { vi: "Xóa chữ \"Con thích ăn gì? \" trong ngoặc, để dòng 1 thành mon = input().", en: "Delete the text \"Con thích ăn gì? \" inside the brackets, so that line 1 becomes mon = input()." }
    test_eligible: true
  - id: s2.input.l2.q1
    type: mcq
    concepts: [input-prompt]
    code: |
      name = input("Name? ")
      print("Hi", name)
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: Bo. Đoạn code in ra gì?"
      en: "The Input data box has 1 line: Bo. What is the output of this code?"
    choices:
      - { text: "Hi Bo", misconception: input-prompt }
      - { text: "Name?\nHi Bo", misconception: input-prompt }
      - { text: "Name? Hi Bo", correct: true }
      - { text: "Name? Bo\nHi Bo", misconception: input-prompt }
    explanation:
      vi: "Python in lời nhắc Name? ra trước và không xuống dòng. Chữ Bo trong ô Dữ liệu nhập không được in ra. Sau đó print in Hi Bo ngay sau lời nhắc, nên kết quả chỉ có 1 dòng: Name? Hi Bo."
      en: "Python prints the prompt Name? first and does not start a new line. The text Bo in the Input data box is not printed. Then print prints Hi Bo right after the prompt, so the output is just 1 line: Name? Hi Bo."
  - id: s2.input.l2.q2
    type: mcq
    concepts: [input-prompt]
    prompt:
      vi: "Trong bài tập của Py-Pet, con nên viết lệnh nào để đọc dữ liệu nhập?"
      en: "In a Py-Pet exercise, which statement should you write to read the input data?"
    choices:
      - { text: "n = input()", correct: true }
      - { text: "n = input(\"Number: \")", misconception: input-prompt }
      - { text: "n = input(\"5\")", misconception: input-prompt }
      - { text: "input() = n", misconception: var-assign }
    explanation:
      vi: "Trong Py-Pet, con luôn để trống ngoặc: n = input(). Chữ trong ngoặc là lời nhắc, được in ra và bị tính vào kết quả, kể cả khi đó là chữ số như \"5\". Dữ liệu nhập nằm ở ô Dữ liệu nhập, không nằm trong ngoặc. Còn input() = n viết ngược lệnh gán."
      en: "In Py-Pet, you always keep the brackets empty: n = input(). Text inside the brackets is a prompt: it is printed and counted in the output, even when it is a digit like \"5\". The input data is in the Input data box, not inside the brackets. And input() = n writes the assignment the wrong way round."
---
Con có thể viết 1 câu hỏi vào trong ngoặc của `input()`, ví dụ `input("Con tên là gì? ")`. Câu đó gọi là **lời nhắc**. Python in lời nhắc ra trước, rồi mới chờ người dùng gõ. Khi có người ngồi trước máy, lời nhắc giúp họ biết cần gõ gì.

```python
ten = input("Con tên là gì? ")
print("Xin chào", ten)
```

Lời nhắc được in ra mà **không xuống dòng**. Nếu người dùng gõ An vào ô Dữ liệu nhập, chữ An không được in ra. Vì vậy, lời chào dính ngay sau lời nhắc, trên cùng 1 dòng. Thẻ này không có ô Dữ liệu nhập, nên đoạn code dưới đây dùng 2 lệnh print để cho con thấy kết quả khi người dùng gõ An:

```python run
print("Con tên là gì? ", end="")  # lời nhắc của input()
print("Xin chào", "An")
```
---
Khi chấm bài, Robo so sánh từng chữ trong kết quả của con với kết quả mong đợi. Lời nhắc cũng là chữ được in ra, nên nó bị tính vào kết quả:

- Kết quả mong đợi: Xin chào An
- Kết quả của con: Con tên là gì? Xin chào An

Hai dòng này khác nhau, nên bài bị chấm sai, dù phần còn lại của con hoàn toàn đúng.

```python run
print("Xin chào", "An")  # kết quả mong đợi
print("Con tên là gì? Xin chào An")  # kết quả khi có lời nhắc
```
---
Vì vậy, trong Py-Pet, con luôn viết **input() để trống**, không có chữ nào trong ngoặc. Đề bài và phần Ví dụ đã cho con biết dữ liệu nhập là gì, nên không cần lời nhắc.

```python
ten = input()
print("Xin chào", ten)
```

Nếu con lỡ viết chữ trong ngoặc, Robo sẽ nhắc con khi chấm bài. Con chỉ cần xóa chữ đó đi, giữ lại `input()`.
