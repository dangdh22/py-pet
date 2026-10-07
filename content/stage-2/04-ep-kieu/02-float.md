---
id: s2.ep-kieu.l2
title: { vi: "Số thực và float()", en: "Decimal numbers and float()" }
exercises:
  - id: s2.ep-kieu.l2.ex1
    type: code
    concepts: [float-convert]
    prompt:
      vi: "Robo đi bộ 2 lần trong ngày. Ô Dữ liệu nhập có 2 dòng: số km Robo đi buổi sáng và số km Robo đi buổi chiều, đều là số thực có dấu chấm. Hãy đọc 2 số vào 2 biến sang và chieu, rồi in ra tổng quãng đường như phần Ví dụ."
      en: "Robo goes for a walk 2 times a day. The Input data box has 2 lines: the km Robo walks in the morning and the km Robo walks in the afternoon, both decimal numbers with a dot. Read the 2 numbers into the 2 variables sang and chieu, then print the total distance as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      sang = float(input())
      chieu = float(input())
      print("Robo đã đi", sang + chieu, "km")
    tests:
      - input: "1.5\n2.25"
        output: "Robo đã đi 3.75 km"
      - input: "0.5\n1.75"
        output: "Robo đã đi 2.25 km"
        hidden: true
    common_wrong:
      - output: "Robo đã đi 1.52.25 km"
        misconception: input-str
        sample: |
          sang = input()
          chieu = input()
          print("Robo đã đi", sang + chieu, "km")
    hints:
      - { vi: "Hai dòng nhập là số thực, nên con đổi mỗi dòng thành số bằng float(). Nếu không đổi, dấu + sẽ nối 2 chuỗi lại.", en: "The 2 input lines are decimal numbers, so change each line into a number with float(). Without the change, + joins the 2 strings." }
      - { vi: "Dòng 1 là sang = float(input()). Dòng 2 đọc chieu theo cách tương tự. Dòng 3 là print(\"Robo đã đi\", sang + chieu, \"km\").", en: "Line 1 is sang = float(input()). Line 2 reads chieu the same way. Line 3 is print(\"Robo đã đi\", sang + chieu, \"km\")." }
    test_eligible: true
  - id: s2.ep-kieu.l2.ex2
    type: code
    concepts: [float-convert]
    prompt:
      vi: "Robo đi mua nho, 1 kg nho giá 60 nghìn đồng. Ô Dữ liệu nhập có 1 dòng: số kg nho Robo mua, là số thực có dấu chấm. Hãy đọc số đó vào biến so_kg, rồi in ra số tiền phải trả như phần Ví dụ."
      en: "Robo buys grapes, and 1 kg of grapes costs 60 thousand dong. The Input data box has 1 line: the kg of grapes Robo buys, a decimal number with a dot. Read the number into the variable so_kg, then print the price to pay as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so_kg = float(input())
      print("Số tiền:", so_kg * 60, "nghìn đồng")
    tests:
      - input: "1.5"
        output: "Số tiền: 90.0 nghìn đồng"
      - input: "2.25"
        output: "Số tiền: 135.0 nghìn đồng"
        hidden: true
    hints:
      - { vi: "Đọc số kg bằng float(input()), rồi nhân với 60. Một số thực nhân với số nguyên vẫn ra số thực, nên kết quả có .0 ở cuối.", en: "Read the kg with float(input()), then multiply by 60. A decimal number times an integer is still a decimal number, so the result ends in .0." }
      - { vi: "Dòng 1 là so_kg = float(input()). Dòng 2 là print(\"Số tiền:\", so_kg * 60, \"nghìn đồng\").", en: "Line 1 is so_kg = float(input()). Line 2 is print(\"Số tiền:\", so_kg * 60, \"nghìn đồng\")." }
  - id: s2.ep-kieu.l2.q1
    type: predict
    concepts: [float-convert]
    code: |
      a = float("3")
      print(a, a + 1)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "3 4", misconception: float-convert }
      - { text: "3.0 4" }
      - { vi: "Báo lỗi TypeError ở dòng 2", en: "A TypeError on line 2", error: true, misconception: str-vs-int }
      - { text: "3.0 4.0", correct: true }
    explanation:
      vi: "float(\"3\") đổi chuỗi thành số thực 3.0, dù chuỗi không có dấu chấm. Biến a chứa số, không phải chuỗi, nên a + 1 tính được. Số thực cộng với số nguyên vẫn ra số thực: 4.0."
      en: "float(\"3\") changes the string into the decimal number 3.0, even though the string has no dot. The variable a holds a number, not a string, so a + 1 works. A decimal number plus an integer is still a decimal number: 4.0."
  - id: s2.ep-kieu.l2.q2
    type: predict
    concepts: [float-convert]
    code: |
      print(4,5 * 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "9.0", misconception: float-convert }
      - { text: "4 10", correct: true }
      - { text: "9", misconception: float-convert }
      - { text: "4,10", misconception: print-comma-space }
    explanation:
      vi: "Python không hiểu 4,5 là bốn phẩy năm. Dấu phẩy trong print ngăn cách 2 giá trị: 4 và 5 * 2. Vì vậy Python in ra 4, 1 dấu cách, rồi 10. Muốn viết bốn phẩy năm, con dùng dấu chấm: 4.5."
      en: "Python does not read 4,5 as four point five. The comma in print separates 2 values: 4 and 5 * 2. So Python prints 4, a space, then 10. To write four point five, use a dot: 4.5."
---
Ở chủ đề Phép tính, con đã gặp **số thực** (float): kết quả của phép `/`, như 3.5. Con cũng có thể tự viết số thực trong code. Python dùng **dấu chấm** ở chỗ con quen viết dấu phẩy: ba phẩy năm viết là `3.5`.

```python run
can_nang = 2.5
print(can_nang)
print(type(can_nang))
```

Đừng viết `3,5`. Trong Python, dấu phẩy ngăn cách các giá trị, nên `print(3,5)` in ra 2 số 3 và 5:

```python run
print(3.5)
print(3,5)
```
---
Lệnh **float()** đổi 1 chuỗi thành số thực, giống như `int()` đổi chuỗi thành số nguyên. Chuỗi không có dấu chấm cũng đổi được: `float("3")` ra 3.0.

```python run
chieu_cao = float("1.5")
print(chieu_cao)
print(float("3"))
```

Muốn đọc 1 số thực người dùng gõ, con viết `chieu_cao = float(input())`. Người dùng phải gõ dấu chấm. Nếu gõ 3,5 thì `float()` không hiểu, và Python báo lỗi **ValueError**, nghĩa là giá trị không hợp lệ:

```python run expect-error
so = float("3,5")  # giống như con gõ 3,5
```
---
Số thực tính được với `+ - * /` như số nguyên. Khi phép tính có 1 số thực, kết quả cũng là số thực, kể cả khi không có phần lẻ:

```python run
dua_hau = 1.5  # cân nặng (kg)
xoai = 0.5
print(dua_hau + xoai)
print(dua_hau * 4)
print(dua_hau + 2)
```

Python in ra 2.0, 6.0 và 3.5. Số 2.0 bằng 2, chỉ là được viết theo kiểu số thực.
