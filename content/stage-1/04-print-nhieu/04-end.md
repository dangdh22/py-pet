---
id: s1.print-nhieu.l4
title: { vi: "Tham số end", en: "The end option" }
exercises:
  - id: s1.print-nhieu.l4.ex1
    type: code
    concepts: [end-param]
    prompt:
      vi: "Robo đếm ngược để bay lên. Đừng gộp các lệnh print. Hãy thêm end vào 3 lệnh print đầu để in cả 4 phần trên 1 dòng, đúng như phần Ví dụ."
      en: "Robo counts down to take off. Do not merge the print statements. Add end to the first 3 print statements to print all 4 parts on 1 line, exactly as in the Example."
    starter: |
      print("3...")
      print("2...")
      print("1...")
      print("Bay!")
    solution: |
      print("3...", end=" ")
      print("2...", end=" ")
      print("1...", end=" ")
      print("Bay!")
    tests:
      - { output: "3... 2... 1... Bay!" }
    common_wrong:
      - output: "3...2...1...Bay!"
        misconception: end-param
        sample: |
          print("3...", end="")
          print("2...", end="")
          print("1...", end="")
          print("Bay!")
    hints:
      - { vi: "Mặc định, mỗi lệnh print kết thúc bằng xuống dòng. Tham số end đổi thứ được in ở cuối, và lệnh print sau sẽ in tiếp ngay trên dòng đó.", en: "By default, each print statement ends with a new line. The end option changes what is printed at the end, and the next print statement goes on printing on that same line." }
      - { vi: "Giữa các phần có 1 dấu cách, nên dòng 1 là print(\"3...\", end=\" \"). Dòng 2 và dòng 3 làm tương tự.", en: "There is 1 space between the parts, so line 1 is print(\"3...\", end=\" \"). Do lines 2 and 3 the same way." }
    test_eligible: true
  - id: s1.print-nhieu.l4.q1
    type: predict
    concepts: [end-param]
    code: |
      print("A", end="-")
      print("B")
      print("C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A-B\nC", correct: true }
      - { text: "A-B-C", misconception: end-param }
      - { text: "A-\nB\nC", misconception: end-param }
      - { text: "A\nB\nC", misconception: end-param }
    explanation:
      vi: "Lệnh print đầu kết thúc bằng dấu - thay vì xuống dòng, nên B được in tiếp ngay sau A-. Lệnh print thứ hai không có end, nên vẫn xuống dòng như bình thường, và C nằm ở dòng mới."
      en: "The first print statement ends with a - instead of a new line, so B is printed right after A-. The second print statement has no end, so it starts a new line as usual, and C is on a new line."
  - id: s1.print-nhieu.l4.q2
    type: predict
    concepts: [end-param, sep-param]
    code: |
      print(1, 2, sep="+", end="=")
      print(3)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1+2=3", correct: true }
      - { text: "1+2=\n3", misconception: end-param }
      - { text: "1+2+=3", misconception: sep-param }
      - { text: "3=3", misconception: number-vs-text }
    explanation:
      vi: "sep=\"+\" đặt dấu + giữa 1 và 2. end=\"=\" in dấu = ở cuối thay vì xuống dòng. Vì vậy số 3 của lệnh print sau được in tiếp trên cùng dòng: 1+2=3."
      en: "sep=\"+\" puts a + between 1 and 2. end=\"=\" prints an = at the end instead of a new line. So the 3 from the next print statement is printed on the same line: 1+2=3."
---
Mỗi lệnh print in xong thì **tự xuống dòng**. Đó là vì print luôn in thêm 1 ký tự xuống dòng `\n` ở **cuối**. Nhờ vậy, lệnh print sau in trên 1 dòng mới.

```python run
print("Robo")
print("Pet")
```

Thứ được in ở cuối có tên là **end**, cũng là 1 tham số của print. Nếu con không viết end, end là `"\n"`.
---
Con có thể đổi end. Với `end=""` (chuỗi rỗng), print **không xuống dòng**, nên lệnh print sau in tiếp ngay trên **cùng dòng**:

```python run
print("Robo", end="")
print("Pet")
```

Với `end=" "`, cuối dòng có 1 dấu cách, nên các chữ không dính nhau:

```python run
print("Robo", end=" ")
print("đang", end=" ")
print("học")
```

Lệnh print cuối không có end, nên nó vẫn xuống dòng như bình thường.
---
Một lệnh print có thể dùng **cả sep và end**. Cả 2 đều viết sau các giá trị. Viết sep trước hay end trước đều được.

- sep nằm **giữa** các giá trị.
- end nằm ở **cuối**, sau giá trị cuối cùng.

```python run
print("Py", "Pet", sep="-", end="! ")
print("Robo")
```
---
Muốn kết thúc 1 dòng đang in dở, con dùng `print()` để trống. Lệnh này không in chữ nào, chỉ in ký tự xuống dòng ở cuối.

```python run
print(1, end=" ")
print(2, end=" ")
print(3, end=" ")
print()
print("Bay!")
```

Nhờ `print()` ở dòng 4, chữ Bay! nằm ở dòng mới. Nếu thiếu dòng 4, chữ Bay! sẽ nằm ngay sau số 3, trên cùng 1 dòng.
