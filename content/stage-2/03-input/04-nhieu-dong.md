---
id: s2.input.l4
title: { vi: "Đọc nhiều dòng", en: "Reading several lines" }
exercises:
  - id: s2.input.l4.ex1
    type: code
    concepts: [input-order, input-one-line]
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: dòng 1 là tên 1 con vật, dòng 2 là tiếng kêu của nó. Hãy đọc 2 dòng đó vào 2 biến con_vat và tieng_keu, rồi in ra đúng dòng như phần Ví dụ."
      en: "The Input data box has 2 lines: line 1 is the name of an animal, and line 2 is the sound it makes. Read the 2 lines into the 2 variables con_vat and tieng_keu, then print the line in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      con_vat = input()
      tieng_keu = input()
      print("Con", con_vat, "kêu", tieng_keu)
    tests:
      - input: "mèo\nmeo meo"
        output: "Con mèo kêu meo meo"
      - input: "chó\ngâu gâu"
        output: "Con chó kêu gâu gâu"
        hidden: true
    common_wrong:
      - output: "Con meo meo kêu mèo"
        misconception: input-order
        sample: |
          tieng_keu = input()
          con_vat = input()
          print("Con", con_vat, "kêu", tieng_keu)
    hints:
      - { vi: "Gọi input() 2 lần. Lần thứ nhất đọc dòng 1 (tên con vật), lần thứ hai đọc dòng 2 (tiếng kêu). Dòng meo meo có dấu cách nhưng vẫn chỉ là 1 dòng.", en: "Call input() 2 times. The first call reads line 1 (the animal), and the second call reads line 2 (the sound). The line meo meo has a space, but it is still just 1 line." }
      - { vi: "Viết con_vat = input(), rồi tieng_keu = input(), rồi print(\"Con\", con_vat, \"kêu\", tieng_keu).", en: "Write con_vat = input(), then tieng_keu = input(), then print(\"Con\", con_vat, \"kêu\", tieng_keu)." }
    test_eligible: true
  - id: s2.input.l4.ex2
    type: code
    concepts: [input-one-line]
    prompt:
      vi: "Code bên phải gọi input() 3 lần, nhưng ô Dữ liệu nhập chỉ có 1 dòng, nên Python báo lỗi EOFError. Hãy sửa 2 lệnh print để dùng biến ban thay cho input(), và in ra 2 dòng như phần Ví dụ."
      en: "The code on the right calls input() 3 times, but the Input data box has only 1 line, so Python shows an EOFError. Fix the 2 print statements to use the variable ban instead of input(), and print the 2 lines in the Example."
    starter: |
      ban = input()
      print(input(), "ơi, đi chơi không?")
      print("Robo chờ", input(), "ở công viên")
    solution: |
      ban = input()
      print(ban, "ơi, đi chơi không?")
      print("Robo chờ", ban, "ở công viên")
    tests:
      - input: "Lan"
        output: |
          Lan ơi, đi chơi không?
          Robo chờ Lan ở công viên
      - input: "Huy"
        output: |
          Huy ơi, đi chơi không?
          Robo chờ Huy ở công viên
        hidden: true
    hints:
      - { vi: "Mỗi lần gọi input() là đọc thêm 1 dòng mới, không đọc lại dòng cũ. Tên bạn đã được cất trong biến ban ở dòng 1.", en: "Each input() call reads 1 more new line, not the old line again. The friend's name is already stored in the variable ban on line 1." }
      - { vi: "Ở dòng 2 và dòng 3, thay input() bằng ban.", en: "On line 2 and line 3, replace input() with ban." }
  - id: s2.input.l4.q1
    type: mcq
    concepts: [input-order]
    code: |
      a = input()
      b = input()
      print(b, a)
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: cat và dog. Đoạn code in ra gì?"
      en: "The Input data box has 2 lines: cat and dog. What is the output of this code?"
    choices:
      - { text: "dog cat", correct: true }
      - { text: "cat dog", misconception: input-order }
      - { text: "b a", misconception: var-assign }
      - { vi: "Báo lỗi EOFError ở dòng 2", en: "An EOFError on line 2", error: true, misconception: input-one-line }
    explanation:
      vi: "Lần gọi input() thứ nhất đọc dòng 1, nên a là cat. Lần thứ hai đọc dòng 2, nên b là dog. Lệnh print in b trước rồi mới tới a: dog cat. Ô có đủ 2 dòng cho 2 lần gọi, nên không có lỗi."
      en: "The first input() call reads line 1, so a is cat. The second call reads line 2, so b is dog. The print statement prints b first and then a: dog cat. The box has 2 lines for the 2 calls, so there is no error."
  - id: s2.input.l4.q2
    type: mcq
    concepts: [input-one-line]
    prompt:
      vi: "Chương trình cần đọc 3 giá trị: tên, tuổi và lớp. Con cần gọi input() mấy lần, và ô Dữ liệu nhập cần mấy dòng?"
      en: "A program needs to read 3 values: a name, an age and a class. How many times do you call input(), and how many lines does the Input data box need?"
    choices:
      - { vi: "1 lần, và 1 dòng có cả 3 giá trị cách nhau bằng dấu cách", en: "1 time, and 1 line with all 3 values separated by spaces", misconception: input-one-line }
      - { vi: "1 lần, và 3 dòng", en: "1 time, and 3 lines", misconception: input-one-line }
      - { vi: "3 lần, và 3 dòng, mỗi dòng 1 giá trị", en: "3 times, and 3 lines with 1 value on each line", correct: true }
      - { vi: "3 lần, và 1 dòng có cả 3 giá trị", en: "3 times, and 1 line with all 3 values", misconception: input-one-line }
    explanation:
      vi: "Mỗi lần gọi input() đọc đúng 1 dòng, cả dòng. Muốn có 3 giá trị trong 3 biến, con gọi input() 3 lần và viết mỗi giá trị trên 1 dòng. Nếu viết cả 3 giá trị trên 1 dòng, lần gọi đầu tiên đọc hết dòng đó."
      en: "Each input() call reads exactly 1 line, the whole line. To get 3 values in 3 variables, you call input() 3 times and write each value on its own line. If you write all 3 values on 1 line, the first call reads that whole line."
---
Mỗi lần gọi `input()`, Python đọc đúng **1 dòng**. Muốn đọc 2 giá trị, con gọi `input()` 2 lần, và viết mỗi giá trị trên 1 dòng của ô Dữ liệu nhập.

```python
ten = input()
mon = input()
print(ten, "thích", mon)
```

Nếu ô Dữ liệu nhập có 2 dòng là An và kem, lần gọi thứ nhất đọc An, lần gọi thứ hai đọc kem. Chương trình in ra: An thích kem.

```python run
ten = "An"   # dòng 1 con gõ
mon = "kem"  # dòng 2 con gõ
print(ten, "thích", mon)
```

Một dòng có dấu cách vẫn chỉ là 1 dòng. Nếu dòng 1 là An Nhiên, biến `ten` nhận cả An Nhiên.
---
Python chạy từ trên xuống, nên `input()` chạy trước đọc dòng 1, `input()` chạy sau đọc dòng tiếp theo. **Tên biến không giúp Python chọn dòng.** Nếu con gõ ngược, dòng 1 là kem và dòng 2 là An, thì biến `ten` nhận kem, còn biến `mon` nhận An:

```python run
ten = "kem"  # dòng 1 con gõ
mon = "An"   # dòng 2 con gõ
print(ten, "thích", mon)
```

Chương trình in ra: kem thích An. Vì vậy, thứ tự các dòng trong ô Dữ liệu nhập phải đúng với thứ tự các lần gọi `input()`.
---
Mỗi lần gọi `input()` là đọc thêm 1 **dòng mới**, không đọc lại dòng cũ. Muốn dùng 1 giá trị nhiều lần, con cất nó vào biến rồi dùng biến:

```python run
ten = "An"  # giống như con gõ An
print("Xin chào", ten)
print("Hẹn gặp lại", ten)
```

Nếu con viết `print("Hẹn gặp lại", input())`, Python sẽ đọc thêm 1 dòng nữa, chứ không lấy lại chữ An.
---
Nếu chương trình gọi `input()` nhiều lần hơn số dòng trong ô Dữ liệu nhập, tới lần gọi bị thiếu dòng, Python báo lỗi **EOFError**. EOF là viết tắt của tiếng Anh "End Of File", nghĩa là đã hết dữ liệu để đọc.

Thẻ này không có ô Dữ liệu nhập, nên `input()` không có dòng nào để đọc. Bấm Chạy thử để xem lỗi:

```python run expect-error
ten = input()
print("Xin chào", ten)
```

Gặp lỗi này ở bài tập, con thêm dòng còn thiếu vào ô Dữ liệu nhập, hoặc bớt lần gọi `input()` thừa. Ngược lại, nếu ô có thừa dòng thì các dòng thừa chỉ bị bỏ qua, Python không báo lỗi.
