---
id: s3.so-sanh.l3
title: { vi: "So sánh chuỗi", en: "Comparing strings" }
exercises:
  - id: s3.so-sanh.l3.ex1
    type: code
    concepts: [str-equality]
    prompt:
      vi: "Mật khẩu của Robo là Robo123, có chữ R viết hoa. Ô Dữ liệu nhập có 1 dòng: mật khẩu con gõ. Hãy đọc dòng đó vào biến mat_khau, rồi in ra True nếu con gõ đúng mật khẩu, False nếu gõ sai, đúng như phần Ví dụ."
      en: "Robo's password is Robo123, with a capital R. The Input data box has 1 line: the password you type. Read the line into the variable mat_khau, then print True if you typed the right password, and False if it is wrong, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      mat_khau = input()
      print("Đúng mật khẩu:", mat_khau == "Robo123")
    tests:
      - input: "Robo123"
        output: "Đúng mật khẩu: True"
      - input: "robo123"
        output: "Đúng mật khẩu: False"
        hidden: true
      - input: "Robo12"
        output: "Đúng mật khẩu: False"
        hidden: true
    hints:
      - { vi: "Mật khẩu là chữ, nên con đọc bằng input() và không đổi sang số. So sánh với chuỗi \"Robo123\" bằng ==, viết đúng từng chữ hoa, chữ thường.", en: "The password is text, so read it with input() and do not change it into a number. Compare it with the string \"Robo123\" using ==, with every capital and small letter exactly right." }
      - { vi: "Dòng 1 là mat_khau = input(). Dòng 2 là print(\"Đúng mật khẩu:\", mat_khau == \"Robo123\").", en: "Line 1 is mat_khau = input(). Line 2 is print(\"Đúng mật khẩu:\", mat_khau == \"Robo123\")." }
    test_eligible: true
  - id: s3.so-sanh.l3.ex2
    type: code
    concepts: [compare-str-num]
    prompt:
      vi: "Robo so sánh 2 số con gõ. Ô Dữ liệu nhập có 2 dòng, mỗi dòng 1 số nguyên. Với 10 và 9, code bên phải lại in ra False, vì nó so sánh 2 chuỗi. Hãy sửa code để so sánh 2 số và in ra đúng dòng như phần Ví dụ."
      en: "Robo compares 2 numbers you type. The Input data box has 2 lines, each with an integer. With 10 and 9, the code on the right prints False, because it compares 2 strings. Fix the code so that it compares 2 numbers and prints the line in the Example."
    starter: |
      a = input()
      b = input()
      print("Số đầu lớn hơn:", a > b)
    solution: |
      a = int(input())
      b = int(input())
      print("Số đầu lớn hơn:", a > b)
    tests:
      - input: "10\n9"
        output: "Số đầu lớn hơn: True"
      - input: "5\n30"
        output: "Số đầu lớn hơn: False"
        hidden: true
      - input: "100\n99"
        output: "Số đầu lớn hơn: True"
        hidden: true
    common_wrong:
      - output: "Số đầu lớn hơn: False"
        misconception: compare-str-num
        sample: |
          a = input()
          b = input()
          print("Số đầu lớn hơn:", a > b)
    hints:
      - { vi: "input() đưa lại chuỗi. Chuỗi được so sánh theo từng ký tự, nên \"10\" nhỏ hơn \"9\". Con cần đổi cả 2 dòng nhập thành số trước khi so sánh.", en: "input() gives back a string. Strings are compared character by character, so \"10\" is smaller than \"9\". Change both input lines into numbers before comparing." }
      - { vi: "Sửa 2 dòng đầu thành a = int(input()) và b = int(input()).", en: "Change the first 2 lines to a = int(input()) and b = int(input())." }
    test_eligible: true
  - id: s3.so-sanh.l3.q1
    type: predict
    concepts: [str-equality]
    code: |
      a = "Hi"
      print(a == "Hi", a == "hi", a == "Hi ")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "True True True", misconception: str-equality }
      - { text: "True True False", misconception: str-equality }
      - { text: "True False True", misconception: str-equality }
      - { text: "True False False", correct: true }
    explanation:
      vi: "Hai chuỗi chỉ bằng nhau khi giống hệt nhau từng ký tự. \"hi\" có chữ h viết thường, khác chữ H viết hoa, nên ra False. \"Hi \" có thêm 1 dấu cách ở cuối, mà dấu cách cũng là 1 ký tự, nên cũng ra False."
      en: "Two strings are equal only when they are the same in every character. \"hi\" has a small h, which is different from a capital H, so it gives False. \"Hi \" has 1 extra space at the end, and a space is a character too, so it also gives False."
  - id: s3.so-sanh.l3.q2
    type: predict
    concepts: [compare-str-num]
    code: |
      print("10" < "9", int("10") < int("9"))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "False False", misconception: compare-str-num }
      - { text: "True False", correct: true }
      - { vi: "Báo lỗi TypeError, vì không so sánh lớn nhỏ được 2 chuỗi", en: "A TypeError, because 2 strings cannot be compared for bigger or smaller", error: true, misconception: compare-str-num }
      - { text: "True True", misconception: int-convert }
    explanation:
      vi: "Hai chuỗi được so sánh theo từng ký tự, từ trái sang phải. Ký tự đầu của \"10\" là 1, đứng trước 9, nên \"10\" < \"9\" ra True. Sau khi đổi bằng int(), Python so sánh 2 số: 10 không nhỏ hơn 9, nên ra False."
      en: "Two strings are compared character by character, from left to right. The first character of \"10\" is 1, which comes before 9, so \"10\" < \"9\" gives True. After the change with int(), Python compares 2 numbers: 10 is not smaller than 9, so it gives False."
---
Con dùng `==` để so sánh 2 **chuỗi**. Hai chuỗi chỉ bằng nhau khi giống hệt nhau **từng ký tự**:

```python run
ten = "Robo"
print(ten == "Robo")
print(ten == "robo")
print(ten == "Robo ")
```

Dòng 3 ra False, vì chữ R viết hoa khác chữ r viết thường. Dòng 4 cũng ra False, vì "Robo " có thêm 1 dấu cách ở cuối. Với Python, dấu cách cũng là 1 ký tự.
---
Chuỗi "10" và số 10 trông giống nhau, nhưng là 2 kiểu dữ liệu khác nhau. Hỏi bằng nhau thì Python trả lời False, không báo lỗi:

```python run
print("10" == 10)
print(int("10") == 10)
```

Nhưng hỏi lớn hơn, nhỏ hơn giữa chuỗi và số thì Python báo lỗi **TypeError**:

```python run expect-error
print("10" < 9)
```

Lời báo lỗi là '<' not supported between instances of 'str' and 'int'. Câu này nghĩa là phép < không dùng được giữa 1 chuỗi (str) và 1 số nguyên (int).
---
Python so sánh lớn nhỏ được 2 chuỗi: nó xét **từng ký tự từ trái sang phải**, giống như cách xếp các từ trong từ điển. Với chữ số, ký tự 1 đứng trước ký tự 9:

```python run
print("an" < "binh")
print("10" < "9")
print(10 < 9)
```

Dòng 2 ra True. Python so ký tự đầu trước: "1" đứng trước "9", nên Python trả lời ngay, không xét tiếp. Python không xem "10" là số mười.
---
Vì vậy, khi so sánh số con nhập vào, con phải **đổi sang số** bằng `int()` trước:

```python run
a = "12"  # giống như con gõ 12
b = "9"   # giống như con gõ 9
print(a > b)
print(int(a) > int(b))
```

Dòng 3 so sánh 2 chuỗi và ra False, sai với điều con muốn hỏi. Dòng 4 so sánh 2 số và ra True. Trong bài tập, con viết `a = int(input())` ngay từ đầu.
