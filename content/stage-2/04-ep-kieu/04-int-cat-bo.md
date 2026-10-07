---
id: s2.ep-kieu.l4
title: { vi: "int() cắt bỏ phần thập phân", en: "int() drops the decimals" }
exercises:
  - id: s2.ep-kieu.l4.ex1
    type: code
    concepts: [int-truncate]
    prompt:
      vi: "Robo chạy thi. Ô Dữ liệu nhập có 1 dòng: thời gian chạy tính bằng giây, là số thực có dấu chấm. Bảng điểm chỉ ghi số giây tròn: bỏ phần thập phân, không làm tròn. Hãy đọc thời gian vào biến giay, rồi in ra đúng dòng như phần Ví dụ."
      en: "Robo runs a race. The Input data box has 1 line: the race time in seconds, a decimal number with a dot. The score board only shows whole seconds: it drops the decimal part and does not round. Read the time into the variable giay, then print the line in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      giay = float(input())
      print("Thời gian:", int(giay), "giây")
    tests:
      - input: "12.8"
        output: "Thời gian: 12 giây"
      - input: "9.35"
        output: "Thời gian: 9 giây"
        hidden: true
    hints:
      - { vi: "Dòng nhập có dấu chấm, nên con đọc bằng float(input()). Sau đó, int() cắt bỏ phần sau dấu chấm.", en: "The input line has a dot, so read it with float(input()). Then int() drops the part after the dot." }
      - { vi: "Dòng 1 là giay = float(input()). Dòng 2 là print(\"Thời gian:\", int(giay), \"giây\").", en: "Line 1 is giay = float(input()). Line 2 is print(\"Thời gian:\", int(giay), \"giây\")." }
    test_eligible: true
  - id: s2.ep-kieu.l4.ex2
    type: code
    concepts: [int-invalid, int-truncate]
    prompt:
      vi: "Robo cân 1 quả dưa hấu và chỉ ghi số kg tròn. Code bên phải báo lỗi ValueError khi con gõ 1 số có dấu chấm, như 3.6. Hãy sửa dòng 1 để in ra đúng dòng như phần Ví dụ."
      en: "Robo weighs a watermelon and writes down only the whole kg. The code on the right shows a ValueError when you type a number with a dot, like 3.6. Fix line 1 to print the line in the Example."
    starter: |
      can_nang = int(input())
      print("Quả dưa nặng khoảng", can_nang, "kg")
    solution: |
      can_nang = int(float(input()))
      print("Quả dưa nặng khoảng", can_nang, "kg")
    tests:
      - input: "3.6"
        output: "Quả dưa nặng khoảng 3 kg"
      - input: "5.25"
        output: "Quả dưa nặng khoảng 5 kg"
        hidden: true
    hints:
      - { vi: "int() không đổi được chuỗi có dấu chấm như \"3.6\". Con cần đổi chuỗi thành số thực bằng float() trước, rồi mới dùng int().", en: "int() cannot change a string with a dot like \"3.6\". Change the string into a decimal number with float() first, then use int()." }
      - { vi: "Sửa dòng 1 thành can_nang = int(float(input())).", en: "Change line 1 to can_nang = int(float(input()))." }
  - id: s2.ep-kieu.l4.q1
    type: predict
    concepts: [int-truncate]
    code: |
      print(int(9.99), int(3.5))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "10 4", misconception: int-truncate }
      - { text: "9.0 3.0", misconception: int-truncate }
      - { text: "9 3", correct: true }
      - { vi: "Báo lỗi ValueError, vì int() không nhận số có dấu chấm", en: "A ValueError, because int() does not take a number with a dot", error: true, misconception: int-invalid }
    explanation:
      vi: "int() cắt bỏ phần sau dấu chấm và không làm tròn, nên 9.99 thành 9 và 3.5 thành 3. Kết quả là số nguyên, nên không có .0. Ở đây 9.99 và 3.5 là số thực, không phải chuỗi, nên int() đổi được, không báo lỗi."
      en: "int() drops the part after the dot and does not round, so 9.99 becomes 9 and 3.5 becomes 3. The results are integers, so there is no .0. Here 9.99 and 3.5 are decimal numbers, not strings, so int() can change them, with no error."
  - id: s2.ep-kieu.l4.q2
    type: predict
    concepts: [int-invalid]
    code: |
      a = "3.5"
      print(int(a))
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { text: "3", misconception: int-invalid }
      - { vi: "Báo lỗi ValueError ở dòng 2", en: "A ValueError on line 2", correct: true, error: true }
      - { text: "4", misconception: int-truncate }
      - { text: "3.5", misconception: int-invalid }
    explanation:
      vi: "a là chuỗi \"3.5\", có dấu chấm. Với chuỗi, int() chỉ nhận các chữ số của 1 số nguyên, nên Python báo lỗi ValueError ở dòng 2. Muốn có 3, con đổi qua float() trước: int(float(a))."
      en: "a is the string \"3.5\", which has a dot. With a string, int() only takes the digits of a whole number, so Python shows a ValueError on line 2. To get 3, change it with float() first: int(float(a))."
---
Ở bài 1, con dùng `int()` để đổi chuỗi thành số nguyên. `int()` cũng đổi được **số thực** thành số nguyên. Khi đó, `int()` **cắt bỏ** phần sau dấu chấm, **không làm tròn**:

```python run
print(int(5.67))
print(int(5.1))
print(int(9.99))
print(int(7 / 2))
```

Python in ra 5, 5, 9 và 3. Dù 9.99 rất gần 10, `int()` vẫn chỉ giữ phần nguyên là 9. `int(7 / 2)` lấy phần nguyên của 3.5, nên ra 3, giống `7 // 2`. Cách làm tròn, con sẽ học ở chủ đề sau.
---
Với **chuỗi**, `int()` khó tính hơn: chuỗi phải là 1 số nguyên. Nếu chuỗi có dấu chấm, như "5.67", Python báo lỗi **ValueError**. Bấm Chạy thử để xem:

```python run expect-error
so = int("5.67")  # giống như con gõ 5.67
```

Cách sửa: đổi chuỗi thành số thực bằng `float()` trước, rồi mới dùng `int()` để cắt bỏ phần thập phân:

```python run
so = int(float("5.67"))
print(so)
```

Python làm từ trong ra ngoài: `float("5.67")` ra 5.67, rồi `int(5.67)` ra 5. Khi đọc dữ liệu, con viết `int(float(input()))`.
---
`int()` chỉ hiểu **chữ số**. Nếu chuỗi có chữ cái, như "năm" hay "5 tuổi", Python cũng báo lỗi ValueError:

```python run expect-error
so = int("năm")  # giống như con gõ năm
```

Lời báo lỗi là invalid literal for int() with base 10: 'năm'. Câu này nghĩa là int() không đổi được 'năm' thành số nguyên (base 10 là cách viết số thường ngày, bằng các chữ số từ 0 đến 9). Phần trong dấu nháy đơn ở cuối cho con biết chuỗi nào bị sai. Gặp lỗi này ở bài tập, con kiểm tra lại ô Dữ liệu nhập: mỗi dòng phải là 1 số viết bằng chữ số, ví dụ 5.
