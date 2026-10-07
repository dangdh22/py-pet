---
id: s2.dinh-dang.l2
title: { vi: "Tính toán trong chuỗi f", en: "Maths inside f-strings" }
exercises:
  - id: s2.dinh-dang.l2.ex1
    type: code
    concepts: [fstring-expression]
    prompt:
      vi: "Robo khoe phép cộng. Ô Dữ liệu nhập có 2 dòng, mỗi dòng 1 số nguyên. Hãy đọc 2 số vào 2 biến a và b, rồi in ra phép cộng và kết quả như phần Ví dụ."
      en: "Robo shows off an addition. The Input data box has 2 lines with 1 integer on each line. Read the 2 numbers into the 2 variables a and b, then print the addition and its result as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      a = int(input())
      b = int(input())
      print(f"{a} + {b} = {a + b}")
    tests:
      - input: "12\n5"
        output: "12 + 5 = 17"
      - input: "30\n45"
        output: "30 + 45 = 75"
        hidden: true
    common_wrong:
      - output: "12 + 5 = 12 + 5"
        misconception: fstring-expression
        sample: |
          a = int(input())
          b = int(input())
          print(f"{a} + {b} = {a} + {b}")
      - output: "12 + 5 = 125"
        misconception: input-str
        sample: |
          a = input()
          b = input()
          print(f"{a} + {b} = {a + b}")
    hints:
      - { vi: "Đọc mỗi số bằng int(input()). Trong chuỗi f, phần ngoài ngoặc nhọn được in y nguyên, còn phép tính đặt trong ngoặc nhọn mới được tính.", en: "Read each number with int(input()). In an f-string, the part outside the curly brackets is printed as it is, and only a calculation inside curly brackets is worked out." }
      - { vi: "Hai dòng đầu là a = int(input()) và b = int(input()). Dòng 3 là print(f\"{a} + {b} = {a + b}\").", en: "The first 2 lines are a = int(input()) and b = int(input()). Line 3 is print(f\"{a} + {b} = {a + b}\")." }
    test_eligible: true
  - id: s2.dinh-dang.l2.ex2
    type: code
    concepts: [fstring-expression]
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: số tuổi của con năm nay, là số nguyên. Hãy đọc số đó vào biến tuoi, rồi in ra số tuổi của con vào năm sau và 5 năm nữa, trên 1 dòng như phần Ví dụ."
      en: "The Input data box has 1 line: your age this year, an integer. Read the number into the variable tuoi, then print your age next year and in 5 years, on 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tuoi = int(input())
      print(f"Năm sau con {tuoi + 1} tuổi, 5 năm nữa con {tuoi + 5} tuổi.")
    tests:
      - input: "11"
        output: "Năm sau con 12 tuổi, 5 năm nữa con 16 tuổi."
      - input: "9"
        output: "Năm sau con 10 tuổi, 5 năm nữa con 14 tuổi."
        hidden: true
    common_wrong:
      - output: "Năm sau con 11 + 1 tuổi, 5 năm nữa con 11 + 5 tuổi."
        misconception: fstring-expression
        sample: |
          tuoi = int(input())
          print(f"Năm sau con {tuoi} + 1 tuổi, 5 năm nữa con {tuoi} + 5 tuổi.")
    hints:
      - { vi: "Đọc tuổi bằng int(input()) để cộng được. Đặt cả phép cộng tuoi + 1 vào trong 1 cặp ngoặc nhọn, để Python tính rồi mới điền kết quả.", en: "Read the age with int(input()) so that you can add. Put the whole addition tuoi + 1 inside 1 pair of curly brackets, so that Python works it out and then fills in the result." }
      - { vi: "Dòng 1 là tuoi = int(input()). Dòng 2 là print(f\"Năm sau con {tuoi + 1} tuổi, 5 năm nữa con {tuoi + 5} tuổi.\").", en: "Line 1 is tuoi = int(input()). Line 2 is print(f\"Năm sau con {tuoi + 1} tuổi, 5 năm nữa con {tuoi + 5} tuổi.\")." }
  - id: s2.dinh-dang.l2.q1
    type: predict
    concepts: [fstring-expression]
    code: |
      a = 6
      b = 2
      print(f"{a} * {b} = {a * b}")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "6 * 2 = 6 * 2", misconception: fstring-expression }
      - { text: "12 = 12", misconception: fstring-expression }
      - { text: "{a} * {b} = {a * b}", misconception: fstring-prefix }
      - { text: "6 * 2 = 12", correct: true }
    explanation:
      vi: "Python thay mỗi cặp ngoặc nhọn bằng giá trị bên trong: {a} thành 6, {b} thành 2, còn {a * b} được tính ra 12. Dấu * và dấu = nằm ngoài ngoặc nhọn, nên được in y nguyên như chữ."
      en: "Python replaces each pair of curly brackets with the value inside: {a} becomes 6, {b} becomes 2, and {a * b} is worked out as 12. The * and = signs are outside the curly brackets, so they are printed as they are, like text."
  - id: s2.dinh-dang.l2.q2
    type: mcq
    concepts: [fstring-expression]
    prompt:
      vi: "Biến a chứa 10, biến b chứa 4. Lệnh nào in ra 10 - 4 = 6?"
      en: "The variable a holds 10, and the variable b holds 4. Which statement prints 10 - 4 = 6?"
    choices:
      - { text: "print(f\"{a} - {b} = {a - b}\")", correct: true }
      - { text: "print(f\"{a - b} = {a - b}\")", misconception: fstring-expression }
      - { text: "print(f\"{a} - {b} = {a} - {b}\")", misconception: fstring-expression }
      - { text: "print(\"{a} - {b} = {a - b}\")", misconception: fstring-prefix }
    explanation:
      vi: "Cần 3 cặp ngoặc nhọn: {a} điền 10, {b} điền 4, và {a - b} tính ra 6. Lệnh thứ hai in ra 6 = 6. Lệnh thứ ba in ra 10 - 4 = 10 - 4, vì dấu - nằm ngoài ngoặc nên không được tính. Lệnh cuối thiếu chữ f, nên in ra nguyên cả ngoặc nhọn."
      en: "You need 3 pairs of curly brackets: {a} fills in 10, {b} fills in 4, and {a - b} works out 6. The second statement prints 6 = 6. The third prints 10 - 4 = 10 - 4, because the - sign is outside the brackets, so it is not worked out. The last one has no f, so it prints the curly brackets as they are."
---
Trong ngoặc nhọn của chuỗi f, con không chỉ đặt được tên biến. Con còn đặt được cả 1 **biểu thức**, tức là 1 phép tính như `a + b`. Python tính biểu thức trước, rồi điền kết quả vào chỗ ngoặc:

```python run
a = 3
b = 4
print(f"{a} + {b} = {a + b}")
```

Python in ra 3 + 4 = 7. Ngoặc thứ nhất điền 3, ngoặc thứ hai điền 4, còn ngoặc thứ ba tính `a + b` rồi điền 7.
---
Chỉ phần **bên trong** ngoặc nhọn mới được tính. Phần bên ngoài là chữ, nên Python in ra y nguyên, kể cả dấu `+` và dấu `=`:

```python run
a = 3
b = 4
print(f"{a} + {b}")
print(f"{a + b}")
print(f"2 + 3 = {2 + 3}")
```

Dòng 3 in ra 3 + 4, không phải 7, vì dấu `+` nằm ngoài ngoặc. Dòng 4 có cả phép cộng trong 1 cặp ngoặc, nên in ra 7. Dòng 5 in ra 2 + 3 = 5.
---
Mọi phép tính con đã học đều dùng được trong ngoặc nhọn: `+ - * / // % **`. Ví dụ Robo đi mua vở và chia bánh:

```python run
so_vo = 4
gia = 8  # nghìn đồng 1 quyển
print(f"Mua {so_vo} quyển vở hết {so_vo * gia} nghìn đồng.")
print(f"Chia 7 cái bánh cho 2 bạn: mỗi bạn {7 // 2} cái, dư {7 % 2} cái.")
```

Python in ra Mua 4 quyển vở hết 32 nghìn đồng. Phép tính trong ngoặc nhọn vẫn theo đúng thứ tự con đã học ở chủ đề Phép tính: ngoặc tròn trước, rồi `**`, rồi `* / // %`, cuối cùng là `+ -`.
