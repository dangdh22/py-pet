---
id: s1.print-nhieu.l2
title: { vi: "Số và chữ", en: "Numbers and text" }
exercises:
  - id: s1.print-nhieu.l2.ex1
    type: code
    concepts: [number-vs-text, print-comma-space]
    prompt:
      vi: "Robo mua 3 cục pin, mỗi cục giá 5 xu, và 2 bánh răng, mỗi cái giá 4 xu. In ra 2 dòng như phần Ví dụ. Đừng tự tính: ở mỗi dòng, hãy viết phép nhân để Python tính giúp con."
      en: "Robo buys 3 batteries at 5 xu each and 2 gears at 4 xu each. Print the 2 lines in the Example. Do not work out the answers yourself: on each line, write a multiplication so that Python works it out for you."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      print("Pin:", 3 * 5, "xu")
      print("Bánh răng:", 2 * 4, "xu")
    tests:
      - output: |
          Pin: 15 xu
          Bánh răng: 8 xu
    common_wrong:
      - output: |
          Pin: 3 * 5 xu
          Bánh răng: 2 * 4 xu
        misconception: number-vs-text
        sample: |
          print("Pin:", "3 * 5", "xu")
          print("Bánh răng:", "2 * 4", "xu")
      - output: |
          Pin:  15  xu
          Bánh răng:  8  xu
        misconception: print-comma-space
        sample: |
          print("Pin: ", 3 * 5, " xu")
          print("Bánh răng: ", 2 * 4, " xu")
    hints:
      - { vi: "Mỗi dòng có 3 giá trị: chữ, phép nhân, rồi chữ. Ngăn cách chúng bằng dấu phẩy. Phép nhân không nằm trong dấu nháy.", en: "Each line has 3 values: text, a multiplication, then text. Separate them with commas. The multiplication is not inside quotes." }
      - { vi: "Dòng 1 là print(\"Pin:\", 3 * 5, \"xu\"). Dòng 2 làm tương tự với 2 * 4.", en: "Line 1 is print(\"Pin:\", 3 * 5, \"xu\"). Do line 2 the same way with 2 * 4." }
    test_eligible: true
  - id: s1.print-nhieu.l2.q1
    type: predict
    concepts: [number-vs-text]
    code: |
      print(3 + 4)
      print("3" + "4")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "7\n34", correct: true }
      - { text: "7\n7", misconception: number-vs-text }
      - { text: "34\n34", misconception: number-vs-text }
      - { text: "3 + 4\n34", misconception: number-vs-text }
    explanation:
      vi: "Ở dòng 1, 3 và 4 không có dấu nháy nên là số, và Python cộng ra 7. Ở dòng 2, \"3\" và \"4\" nằm trong dấu nháy nên là chữ, và dấu + chỉ đặt 2 chữ số cạnh nhau thành 34."
      en: "On line 1, 3 and 4 have no quotes, so they are numbers, and Python adds them to get 7. On line 2, \"3\" and \"4\" are inside quotes, so they are text, and + only puts the 2 digits next to each other: 34."
  - id: s1.print-nhieu.l2.q2
    type: predict
    concepts: [number-vs-text, print-comma-space]
    code: |
      print("1 + 2 =", 1 + 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1 + 2 = 1 + 2", misconception: number-vs-text }
      - { text: "3 = 3", misconception: number-vs-text }
      - { text: "1 + 2 =3", misconception: print-comma-space }
      - { text: "1 + 2 = 3", correct: true }
    explanation:
      vi: "Giá trị thứ nhất nằm trong dấu nháy nên được in y nguyên: 1 + 2 =. Giá trị thứ hai không có dấu nháy nên Python tính ra 3. Dấu phẩy thêm 1 dấu cách giữa 2 giá trị."
      en: "The first value is inside quotes, so it is printed exactly as it is: 1 + 2 =. The second value has no quotes, so Python works it out: 3. The comma adds 1 space between the 2 values."
---
Ở chủ đề 2, con đã biết: chữ số nằm trong dấu nháy chỉ là **chữ**, nên `print("1 + 2")` in ra 1 + 2, còn `"4" + "4"` ra 44.

Bây giờ, con hãy viết số **không có dấu nháy**. Khi đó Python hiểu đây là **số** thật, giống số kẹo trong hộp: dùng để đếm và để tính. Python tính xong rồi mới in kết quả.

```python run
print(5)
print(2 + 3)
print(10 - 4)
print(3 * 4)
```

Dấu `-` là phép trừ. Dấu `*` là phép nhân, không phải chữ x.
---
So sánh 3 dòng dưới đây. Chúng trông giống nhau, nhưng in ra 3 kết quả khác nhau:

```python run
print(2 + 3)
print("2 + 3")
print("2" + "3")
```

- Dòng 1: 2 và 3 là số, nên Python cộng ra **5**.
- Dòng 2: cả phép tính nằm trong 1 chuỗi, nên được in y nguyên: **2 + 3**.
- Dòng 3: "2" và "3" là chữ, nên dấu `+` nối chúng thành **23**.

Giống môn Toán, phép nhân làm trước, phép cộng và phép trừ làm sau: `print(2 + 3 * 4)` in ra 14.
---
Muốn in chữ và số trên cùng 1 dòng, con dùng **dấu phẩy** như bài trước. Mỗi giá trị có thể là chữ, là số, hoặc là 1 phép tính.

```python run
print("Robo có", 4, "bánh xe")
print("3 + 4 =", 3 + 4)
print("Hai Robo có", 2 * 4, "bánh xe")
```

Ở dòng 2, phần trong dấu nháy được in y nguyên, còn phần không có dấu nháy được Python tính ra 7. Ở dòng 3, Python tính 2 * 4 ra 8 rồi mới in.
---
Đừng dùng dấu `+` để ghép chữ với số. Dấu `+` chỉ nối chuỗi với chuỗi, hoặc cộng số với số. Nếu con đặt dấu `+` giữa chuỗi và số, Python sẽ báo lỗi **TypeError** (lỗi kiểu dữ liệu). Bấm Chạy thử để xem:

```python run expect-error
print("Robo có " + 4 + " bánh xe")
```

Trong thông báo, **int** là tên Python dùng cho số nguyên, còn **str** là tên của chuỗi. Robo gợi ý dùng dấu phẩy, đúng cách con vừa học. Robo cũng nhắc đến **str()**, một cách khác mà con sẽ học ở giai đoạn sau. Bây giờ, con chỉ cần dùng dấu phẩy: `print("Robo có", 4, "bánh xe")`.
