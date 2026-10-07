---
id: s2.bien.l3
title: { vi: "Thay giá trị của biến", en: "Changing a variable" }
exercises:
  - id: s2.bien.l3.ex1
    type: code
    concepts: [var-reassign]
    prompt:
      vi: "Robo có 10 xu. Robo nhặt được thêm 3 xu, rồi tiêu hết 4 xu. Ở mỗi chỗ có chú thích, hãy thêm 1 lệnh gán lại biến xu, để chương trình in ra 3 dòng như phần Ví dụ. Đừng tự tính: hãy dùng phép tính với biến xu."
      en: "Robo has 10 xu. Robo picks up 3 more xu, then spends 4 xu. At each comment, add 1 statement that changes the variable xu, so that the program prints the 3 lines in the Example. Do not work out the answers yourself: use a calculation with the variable xu."
    starter: |
      xu = 10
      print("Lúc đầu:", xu)
      # Robo nhặt thêm 3 xu: gán lại biến xu ở dòng dưới

      print("Sau khi nhặt:", xu)
      # Robo tiêu 4 xu: gán lại biến xu ở dòng dưới

      print("Còn lại:", xu)
    solution: |
      xu = 10
      print("Lúc đầu:", xu)
      xu = xu + 3
      print("Sau khi nhặt:", xu)
      xu = xu - 4
      print("Còn lại:", xu)
    tests:
      - output: |
          Lúc đầu: 10
          Sau khi nhặt: 13
          Còn lại: 9
    common_wrong:
      - output: |
          Lúc đầu: 10
          Sau khi nhặt: 10
          Còn lại: 10
        misconception: var-reassign
        sample: |
          xu = 10
          print("Lúc đầu:", xu)
          xu + 3
          print("Sau khi nhặt:", xu)
          xu - 4
          print("Còn lại:", xu)
      - output: |
          Lúc đầu: 10
          Sau khi nhặt: 3
          Còn lại: 4
        misconception: var-reassign
        sample: |
          xu = 10
          print("Lúc đầu:", xu)
          xu = 3
          print("Sau khi nhặt:", xu)
          xu = 4
          print("Còn lại:", xu)
    hints:
      - { vi: "Chỉ viết xu + 3 thì Python tính xong rồi bỏ kết quả đi. Muốn biến xu đổi giá trị, con phải gán lại: xu = ...", en: "If you only write xu + 3, Python works it out and then throws the result away. To change the value of xu, assign it again: xu = ..." }
      - { vi: "Dòng cần thêm thứ nhất là xu = xu + 3. Dòng thứ hai làm tương tự với phép trừ 4.", en: "The first line to add is xu = xu + 3. Do the second line the same way with minus 4." }
    test_eligible: true
  - id: s2.bien.l3.q1
    type: predict
    concepts: [var-reassign]
    code: |
      n = 1
      n = 7
      print(n)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "7", correct: true }
      - { text: "1", misconception: var-reassign }
      - { text: "1\n7", misconception: var-reassign }
      - { text: "8", misconception: var-reassign }
    explanation:
      vi: "Một biến chỉ giữ 1 giá trị. Dòng 2 gán 7 cho n, nên giá trị cũ là 1 bị thay mất. Lệnh print chạy sau cùng nên in ra 7."
      en: "A variable holds only 1 value. Line 2 assigns 7 to n, so the old value 1 is replaced. The print statement runs last, so it prints 7."
  - id: s2.bien.l3.q2
    type: predict
    concepts: [var-reassign]
    code: |
      n = 5
      n = n + 1
      n = n * 2
      print(n)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "12", correct: true }
      - { text: "11", misconception: var-reassign }
      - { text: "6", misconception: var-reassign }
      - { text: "5", misconception: var-reassign }
    explanation:
      vi: "Python chạy từ trên xuống. Dòng 2 tính 5 + 1 ra 6, rồi cất 6 vào n. Dòng 3 tính 6 * 2 ra 12, rồi cất 12 vào n. Vì vậy print in ra 12."
      en: "Python runs from top to bottom. Line 2 works out 5 + 1 = 6 and stores 6 in n. Line 3 works out 6 * 2 = 12 and stores 12 in n. So print prints 12."
  - id: s2.bien.l3.q3
    type: predict
    concepts: [var-before-use]
    code: |
      print(n)
      n = 3
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "Báo lỗi NameError ở dòng 1", en: "A NameError on line 1", correct: true, error: true }
      - { text: "3", misconception: var-before-use }
      - { text: "0", misconception: var-before-use }
      - { text: "n", misconception: var-assign }
    explanation:
      vi: "Python chạy từ trên xuống. Ở dòng 1, biến n chưa được gán giá trị nào, nên Python chưa biết n là gì và báo lỗi NameError. Dòng 2 không được chạy."
      en: "Python runs from top to bottom. On line 1, nothing has been assigned to n yet, so Python does not know n and shows a NameError. Line 2 does not run."
---
Một chiếc hộp chỉ chứa được **1 giá trị**. Khi con gán giá trị mới cho biến, giá trị cũ bị bỏ đi, và hộp chỉ còn giá trị mới. Việc này gọi là **gán lại**.

```python run
mau = "đỏ"
print("Mắt Robo màu", mau)
mau = "xanh"
print("Mắt Robo màu", mau)
```

Lần in thứ nhất ra đỏ. Sau khi gán lại, lần in thứ hai ra xanh.
---
Con có thể dùng giá trị cũ để tính ra giá trị mới. Hãy xem dòng `diem = diem + 5`:

```python run
diem = 10
diem = diem + 5
print(diem)
```

Python làm theo 2 bước:

1. Tính vế **bên phải** trước, bằng giá trị cũ: 10 + 5 ra 15.
2. Cất kết quả 15 vào biến **bên trái**, thay cho giá trị cũ.

Ở môn Toán, diem không thể bằng diem + 5. Nhưng ở đây dấu `=` là gán, không phải "bằng", nên dòng này hoàn toàn đúng.
---
Lệnh chạy **từ trên xuống**, nên thứ tự các dòng rất quan trọng. Lệnh print in ra giá trị của biến **ở đúng lúc** lệnh đó chạy.

```python run
pin = 3
print("Pin:", pin)
pin = pin * 2
print("Pin:", pin)
pin = pin - 1
print("Pin:", pin)
```

Biến `pin` lần lượt là 3, rồi 6, rồi 5. Mỗi lệnh print in giá trị của lúc đó.
---
Con phải **gán giá trị cho biến trước**, rồi mới được dùng biến. Nếu dùng biến khi nó chưa có giá trị, Python báo lỗi **NameError**. Bấm Chạy thử để xem:

```python run expect-error
print(tuoi)
tuoi = 11
```

Python chạy dòng 1 trước, lúc đó chưa có hộp nào tên `tuoi`. Con sửa bằng cách đổi chỗ 2 dòng: dòng gán `tuoi = 11` đặt lên trên, dòng print đặt xuống dưới.
