---
id: s1.print-nhieu.l3
title: { vi: "Tham số sep", en: "The sep option" }
exercises:
  - id: s1.print-nhieu.l3.ex1
    type: code
    concepts: [sep-param, named-option-order]
    prompt:
      vi: "Robo muốn in đường đi tới trường và giờ vào học. Đừng sửa các giá trị. Hãy thêm sep vào cuối mỗi lệnh print để in ra đúng 2 dòng như phần Ví dụ."
      en: "Robo wants to print the way to school and the time school starts. Do not change the values. Add sep at the end of each print statement to print the 2 lines exactly as in the Example."
    starter: |
      print("Nhà", "Chợ", "Công viên", "Trường")
      print(7, 30)
    solution: |
      print("Nhà", "Chợ", "Công viên", "Trường", sep=" -> ")
      print(7, 30, sep=":")
    tests:
      - output: |
          Nhà -> Chợ -> Công viên -> Trường
          7:30
    common_wrong:
      - output: |
          Nhà->Chợ->Công viên->Trường
          7:30
        misconception: sep-param
        sample: |
          print("Nhà", "Chợ", "Công viên", "Trường", sep="->")
          print(7, 30, sep=":")
    hints:
      - { vi: "Viết sep=\"...\" sau giá trị cuối cùng, ngay trước dấu ). Khi có sep, print không tự thêm dấu cách nữa.", en: "Write sep=\"...\" after the last value, right before the ). With sep, print no longer adds a space by itself." }
      - { vi: "Dòng 1 cần sep=\" -> \", có 1 dấu cách ở mỗi bên mũi tên. Dòng 2 cần sep=\":\".", en: "Line 1 needs sep=\" -> \", with 1 space on each side of the arrow. Line 2 needs sep=\":\"." }
    test_eligible: true
  - id: s1.print-nhieu.l3.q1
    type: predict
    concepts: [sep-param]
    code: |
      print("A", "B", "C", sep="-")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A-B-C", correct: true }
      - { text: "A-B-C-", misconception: sep-param }
      - { text: "-A-B-C-", misconception: sep-param }
      - { text: "A - B - C", misconception: sep-param }
    explanation:
      vi: "sep=\"-\" thay dấu cách giữa các giá trị bằng dấu -. sep chỉ nằm giữa 2 giá trị liền nhau, không nằm ở đầu hay cuối dòng. Có 3 giá trị nên chỉ có 2 dấu -."
      en: "sep=\"-\" puts a - between the values instead of a space. sep goes only between 2 values next to each other, not at the start or the end of the line. There are 3 values, so there are only 2 dashes."
  - id: s1.print-nhieu.l3.q2
    type: predict
    concepts: [sep-param, number-vs-text]
    code: |
      print(1, 2, 3, sep="")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "123", correct: true }
      - { text: "1 2 3", misconception: sep-param }
      - { text: "6", misconception: number-vs-text }
      - { text: "1,2,3", misconception: print-comma-space }
    explanation:
      vi: "sep=\"\" là chuỗi rỗng, nên giữa các giá trị không có gì cả. Ba số được in sát nhau thành 123. Dấu phẩy chỉ ngăn cách các giá trị, không cộng chúng lại."
      en: "sep=\"\" is the empty string, so there is nothing between the values. The 3 numbers are printed right next to each other: 123. The commas only separate the values. They do not add them up."
  - id: s1.print-nhieu.l3.q3
    type: mcq
    concepts: [named-option-order]
    prompt:
      vi: "Lệnh nào in ra đúng dòng chữ: A+B"
      en: "Which statement prints exactly this text: A+B"
    choices:
      - { text: 'print(sep="+", "A", "B")', misconception: named-option-order }
      - { text: 'print("A", "B", sep="+")', correct: true }
      - { text: 'print("A", "B", sep=+)', misconception: named-option-order }
      - { text: 'print("A", "B", "sep=+")', misconception: named-option-order }
    explanation:
      vi: "sep viết sau tất cả giá trị, có dấu =, và giá trị của sep là 1 chuỗi trong dấu nháy. Viết sep ở đầu hoặc quên dấu nháy thì Python báo lỗi. Còn \"sep=+\" trong dấu nháy chỉ là 1 chuỗi bình thường, nên lệnh in ra A B sep=+."
      en: "sep goes after all the values, with an = sign, and the value of sep is a string inside quotes. If sep comes first or has no quotes, Python shows an error. And \"sep=+\" inside quotes is just an ordinary string, so that statement prints A B sep=+."
---
Con đã biết: khi in nhiều giá trị, print tự thêm 1 dấu cách giữa chúng. Con có thể **đổi** dấu cách đó thành thứ khác bằng **sep**.

`sep` là 1 **tham số** của print. Tham số là 1 lời dặn thêm cho print về cách in, giống như khi gọi món, con dặn thêm "ít cay" hay "không hành". Tên sep lấy từ chữ *separator*, nghĩa là "cái ngăn cách".

```python run
print("Py", "Pet", sep="-")
print(20, 11, 2026, sep="/")
```
---
Giá trị của sep là 1 **chuỗi**, nên con có thể dùng chuỗi nào cũng được:

- `sep=""` (chuỗi rỗng): các giá trị dính sát nhau.
- `sep=" - "`: chuỗi có cả dấu cách, nên dấu cách cũng được in ra.
- `sep="\n"`: mỗi giá trị nằm trên 1 dòng riêng.

```python run
print("Ro", "bo", sep="")
print("Robo", "Mimi", "Bin", sep=" - ")
print("Robo", "Mimi", "Bin", sep="\n")
```

Khi có sep, print **không tự thêm** dấu cách nữa. Chuỗi sep có dấu cách thì mới có dấu cách.
---
sep chỉ được đặt **giữa** 2 giá trị liền nhau, không đặt ở đầu hay ở cuối dòng. Giống như các bạn đứng thành hàng nắm tay nhau: 3 bạn chỉ có 2 cái nắm tay, nằm giữa các bạn.

```python run
print("A", "B", "C", sep="*")
print("Robo", sep="*")
```

Dòng 1 có 3 giá trị nên có 2 dấu `*`. Dòng 2 chỉ có 1 giá trị, nên không có dấu `*` nào.
---
Cách viết sep cần nhớ 3 điều:

1. Viết sep **sau tất cả giá trị**, ngay trước dấu `)`.
2. Viết tên sep, rồi dấu `=`, **không** đặt trong dấu nháy.
3. Giá trị của sep là 1 chuỗi, **có dấu nháy**: `sep="-"`.

Ba cách viết dưới đây đều sai. Hai dòng đầu làm Python báo lỗi cú pháp. Dòng thứ ba không báo lỗi, nhưng in ra A B sep=- vì `"sep=-"` chỉ là 1 chuỗi bình thường.

```python
print(sep="-", "A", "B")
print("A", "B", sep=-)
print("A", "B", "sep=-")
```
