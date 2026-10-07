---
id: s2.ep-kieu.l1
title: { vi: "Đổi chuỗi thành số nguyên với int()", en: "Text to whole number with int()" }
exercises:
  - id: s2.ep-kieu.l1.ex1
    type: code
    concepts: [int-convert]
    prompt:
      vi: "Con và Robo cùng đếm kẹo. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số kẹo của con, dòng 2 là số kẹo của Robo. Hãy đọc 2 số vào 2 biến keo_con và keo_robo, rồi in ra tổng số kẹo như phần Ví dụ."
      en: "You and Robo count your sweets. The Input data box has 2 lines: line 1 is the number of your sweets, and line 2 is the number of Robo's sweets. Read the 2 numbers into the 2 variables keo_con and keo_robo, then print the total number of sweets as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      keo_con = int(input())
      keo_robo = int(input())
      print("Tổng số kẹo:", keo_con + keo_robo)
    tests:
      - input: "5\n3"
        output: "Tổng số kẹo: 8"
      - input: "12\n7"
        output: "Tổng số kẹo: 19"
        hidden: true
    common_wrong:
      - output: "Tổng số kẹo: 53"
        misconception: input-str
        sample: |
          keo_con = input()
          keo_robo = input()
          print("Tổng số kẹo:", keo_con + keo_robo)
    hints:
      - { vi: "input() đưa lại chuỗi, nên con dùng int() để đổi mỗi dòng thành số. Nếu không đổi, dấu + sẽ nối 2 chuỗi lại.", en: "input() gives back a string, so use int() to change each line into a number. Without the change, + joins the 2 strings." }
      - { vi: "Dòng 1 là keo_con = int(input()). Dòng 2 đọc keo_robo theo cách tương tự. Dòng 3 là print(\"Tổng số kẹo:\", keo_con + keo_robo).", en: "Line 1 is keo_con = int(input()). Line 2 reads keo_robo the same way. Line 3 is print(\"Tổng số kẹo:\", keo_con + keo_robo)." }
    test_eligible: true
  - id: s2.ep-kieu.l1.ex2
    type: code
    concepts: [int-convert]
    prompt:
      vi: "Robo muốn gấp đôi số con gõ, nhưng code bên phải in ra 77 thay vì 14. Dòng 2 có gọi int(), nhưng biến so vẫn chứa chuỗi. Hãy sửa code để in ra đúng dòng như phần Ví dụ."
      en: "Robo wants to double the number you type, but the code on the right prints 77 instead of 14. Line 2 calls int(), but the variable so still holds a string. Fix the code to print the line in the Example."
    starter: |
      so = input()
      int(so)
      print("Gấp đôi:", so * 2)
    solution: |
      so = input()
      so = int(so)
      print("Gấp đôi:", so * 2)
    tests:
      - input: "7"
        output: "Gấp đôi: 14"
      - input: "25"
        output: "Gấp đôi: 50"
        hidden: true
    common_wrong:
      - output: "Gấp đôi: 77"
        misconception: int-convert
        sample: |
          so = input()
          int(so)
          print("Gấp đôi:", so * 2)
    hints:
      - { vi: "int(so) đưa lại 1 số mới, nhưng dòng 2 không cất số đó vào đâu cả. Vì vậy so vẫn là chuỗi \"7\", và chuỗi nhân 2 thì được lặp lại.", en: "int(so) gives back a new number, but line 2 does not store it anywhere. So so is still the string \"7\", and a string times 2 is repeated." }
      - { vi: "Sửa dòng 2 thành so = int(so). Con cũng có thể gộp 2 dòng đầu thành so = int(input()).", en: "Change line 2 to so = int(so). You can also join the first 2 lines into so = int(input())." }
    test_eligible: true
  - id: s2.ep-kieu.l1.q1
    type: mcq
    concepts: [int-convert]
    code: |
      a = int(input())
      b = int(input())
      print(a + b)
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: 10 và 5. Đoạn code in ra gì?"
      en: "The Input data box has 2 lines: 10 and 5. What is the output of this code?"
    choices:
      - { text: "105", misconception: input-str }
      - { text: "10 5", misconception: concat-no-space }
      - { text: "15", correct: true }
      - { text: "a + b", misconception: var-assign }
    explanation:
      vi: "int() đổi chuỗi \"10\" thành số 10 và chuỗi \"5\" thành số 5. Hai biến a và b đều chứa số, nên dấu + cộng chúng lại: 15. Nếu không có int(), dấu + sẽ nối thành 105."
      en: "int() changes the string \"10\" into the number 10 and the string \"5\" into the number 5. The variables a and b both hold numbers, so + adds them: 15. Without int(), + would join them into 105."
  - id: s2.ep-kieu.l1.q2
    type: predict
    concepts: [int-convert]
    code: |
      a = "7"
      b = int(a)
      print(b * 2, a * 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "14 77", correct: true }
      - { text: "14 14", misconception: int-convert }
      - { text: "77 77", misconception: int-convert }
      - { vi: "Báo lỗi TypeError ở dòng 3", en: "A TypeError on line 3", error: true, misconception: string-repeat }
    explanation:
      vi: "int(a) đưa lại số 7 và dấu = cất số đó vào biến b, nên b * 2 ra 14. Biến a không bị thay đổi, vẫn là chuỗi \"7\". Chuỗi nhân 2 thì được lặp lại, nên a * 2 ra 77, không bị lỗi."
      en: "int(a) gives back the number 7, and = stores it in the variable b, so b * 2 gives 14. The variable a does not change: it is still the string \"7\". A string times 2 is repeated, so a * 2 gives 77, with no error."
---
Ở chủ đề trước, con đã biết `input()` luôn đưa lại **chuỗi**. Gõ 5 thì được chuỗi "5", chỉ để đọc, không để tính. Muốn tính toán, con phải đổi chuỗi đó thành số. Việc đổi 1 giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác gọi là **ép kiểu**.

Lệnh **int()** đổi 1 chuỗi chữ số thành **số nguyên**. Chữ int là viết tắt của tiếng Anh "integer", nghĩa là số nguyên.

```python run
chu = "5"
so = int(chu)
print(type(chu))
print(type(so))
print(so + 1)
```

Biến `chu` vẫn là chuỗi (str). Biến `so` là số nguyên (int), nên `so + 1` tính ra 6.
---
Con có thể đổi ngay khi đọc dữ liệu, bằng công thức đã gặp ở chủ đề trước:

```python
tuoi = int(input())
print("Năm sau con", tuoi + 1, "tuổi")
```

Python làm từ trong ra ngoài. Đầu tiên, `input()` đọc dòng con gõ, ví dụ chuỗi "11". Tiếp theo, `int()` đổi chuỗi đó thành số 11. Cuối cùng, dấu `=` cất số 11 vào biến `tuoi`.

Đoạn code dưới đây thay `input()` bằng chuỗi "11", đúng như thứ `input()` đưa lại:

```python run
tuoi = int("11")  # giống như con gõ 11
print("Năm sau con", tuoi + 1, "tuổi")
```
---
Bây giờ Robo cộng được 2 số con nhập vào. Hãy so sánh khi không có và khi có `int()`:

```python run
a = "5"  # giống như con gõ 5
b = "3"  # giống như con gõ 3
print(a + b)
print(int(a) + int(b))
```

Dòng 3 nối 2 chuỗi thành 53. Dòng 4 đổi cả 2 chuỗi thành số rồi mới cộng, nên ra 8. Trong bài tập, con viết gọn hơn: `a = int(input())` rồi `b = int(input())`, mỗi số 1 dòng.
---
`int()` đưa lại 1 **số mới**, chứ không thay đổi chuỗi trong biến. Nếu con chỉ viết `int(so)` trên 1 dòng riêng, số mới không được cất vào đâu cả, và biến `so` vẫn chứa chuỗi:

```python run
so = "7"  # giống như con gõ 7
int(so)
print(so + so)
so = int(so)
print(so + so)
```

Dòng 3 vẫn nối thành 77. Ở dòng 4, dấu `=` cất số mới vào lại biến `so`, nên dòng 5 cộng ra 14.
