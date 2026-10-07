---
id: s1.print-nhieu.l1
title: { vi: "In nhiều giá trị bằng dấu phẩy", en: "Many values with commas" }
exercises:
  - id: s1.print-nhieu.l1.ex1
    type: code
    concepts: [print-comma-space]
    prompt:
      vi: "Code bên phải dùng dấu + nên các chữ dính liền nhau. Hãy đổi mọi dấu + thành dấu phẩy để in ra đúng 2 dòng như phần Ví dụ. Không thêm dấu cách vào trong chuỗi."
      en: "The code on the right uses + so the words are stuck together. Change every + into a comma to print the 2 lines exactly as in the Example. Do not add spaces inside the strings."
    starter: |
      print("=" * 5 + "Robo" + "=" * 5)
      print("Robo" + "thích" + "ăn" + "pin")
    solution: |
      print("=" * 5, "Robo", "=" * 5)
      print("Robo", "thích", "ăn", "pin")
    tests:
      - output: |
          ===== Robo =====
          Robo thích ăn pin
    common_wrong:
      - output: |
          =====  Robo  =====
          Robo  thích  ăn  pin
        misconception: print-comma-space
        sample: |
          print("=" * 5, " Robo ", "=" * 5)
          print("Robo ", "thích ", "ăn ", "pin")
    hints:
      - { vi: "Dấu phẩy ngăn cách các giá trị, và print tự thêm 1 dấu cách giữa 2 giá trị liền nhau. Con không cần tự thêm dấu cách.", en: "A comma separates the values, and print adds 1 space between 2 values next to each other. You do not need to add spaces yourself." }
      - { vi: "Dòng 1 là print(\"=\" * 5, \"Robo\", \"=\" * 5). Dòng 2 làm tương tự: thay 3 dấu + bằng 3 dấu phẩy.", en: "Line 1 is print(\"=\" * 5, \"Robo\", \"=\" * 5). Do line 2 the same way: change the 3 + signs into 3 commas." }
    test_eligible: true
  - id: s1.print-nhieu.l1.q1
    type: predict
    concepts: [print-comma-space]
    code: |
      print("A", "B", "C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "ABC", misconception: print-comma-space }
      - { text: "A, B, C", misconception: print-comma-space }
      - { text: "A B C", correct: true }
      - { text: "A\nB\nC", misconception: print-comma-space }
    explanation:
      vi: "Lệnh print có 3 giá trị, ngăn cách bằng dấu phẩy. Python in cả 3 giá trị trên cùng 1 dòng, với 1 dấu cách giữa 2 giá trị liền nhau. Dấu phẩy không được in ra."
      en: "The print statement has 3 values, separated by commas. Python prints all 3 values on the same line, with 1 space between 2 values next to each other. The commas are not printed."
  - id: s1.print-nhieu.l1.q2
    type: predict
    concepts: [print-comma-space, concat-no-space]
    code: |
      print("Py" + "Pet", "Bo")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Py Pet Bo", misconception: concat-no-space }
      - { text: "PyPetBo", misconception: print-comma-space }
      - { text: "PyPet, Bo", misconception: print-comma-space }
      - { text: "PyPet Bo", correct: true }
    explanation:
      vi: "Dấu + nối Py và Pet sát nhau thành 1 giá trị: PyPet. Dấu phẩy ngăn cách PyPet với Bo, nên print thêm 1 dấu cách giữa chúng."
      en: "+ joins Py and Pet with no space into 1 value: PyPet. The comma separates PyPet from Bo, so print adds 1 space between them."
---
Một lệnh `print` có thể in **nhiều thứ cùng lúc**. Mỗi thứ con đặt trong ngoặc của print để in ra gọi là 1 **giá trị**. Chuỗi `"Robo"` là 1 giá trị.

Muốn in nhiều giá trị, con viết chúng trong ngoặc và ngăn cách bằng **dấu phẩy**. Python in tất cả trên **cùng 1 dòng**.

```python run
print("Robo", "đi", "học")
print("Py", "Pet")
```
---
Con thấy không? Giữa 2 giá trị liền nhau có **1 dấu cách**, dù con không viết dấu cách nào. Đó là dấu cách do print **tự thêm vào**, giống như khi con viết tên các bạn lên bảng, giữa 2 tên luôn có 1 khoảng trống.

Dấu phẩy chỉ để ngăn cách các giá trị, nên dấu phẩy **không được in ra**.

```python run
print("Robo", "Mimi", "Bin")
```
---
Dấu phẩy khác dấu `+`. Dấu `+` nối các chuỗi **sát nhau** thành 1 chuỗi. Dấu phẩy giữ các giá trị riêng rẽ, và print đặt **1 dấu cách** giữa chúng.

```python run
print("Robo" + "Pet")
print("Robo", "Pet")
```

Mỗi giá trị cũng có thể là 1 phép lặp chuỗi. Python làm phép `*` trước, rồi mới in:

```python run
print("=" * 3, "Robo", "=" * 3)
```
---
Print chỉ thêm **đúng 1** dấu cách. Nếu trong chuỗi đã có dấu cách, Python vẫn giữ nguyên dấu cách đó. Vì vậy dòng 2 dưới đây có **2 dấu cách** giữa Robo và Pet:

```python run
print("Robo", "Pet")
print("Robo ", "Pet")
```

Còn dấu phẩy nằm **trong dấu nháy** thì chỉ là 1 ký tự của chuỗi, nên được in ra:

```python run
print("Robo, Pet")
```
