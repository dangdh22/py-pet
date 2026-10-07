---
id: s2.dinh-dang.l1
title: { vi: "Chuỗi f", en: "f-strings" }
exercises:
  - id: s2.dinh-dang.l1.ex1
    type: code
    concepts: [fstring-prefix]
    prompt:
      vi: "Robo chào 1 bạn mới. Ô Dữ liệu nhập có 1 dòng: tên của bạn đó. Hãy đọc tên vào biến ten, rồi in ra lời chào như phần Ví dụ. Chú ý: dấu chấm than đứng liền ngay sau tên."
      en: "Robo greets a new friend. The Input data box has 1 line: the friend's name. Read the name into the variable ten, then print the greeting as in the Example. Note: the exclamation mark comes right after the name, with no space."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = input()
      print(f"Chào {ten}! Robo rất vui được gặp bạn.")
    tests:
      - input: "Lan"
        output: "Chào Lan! Robo rất vui được gặp bạn."
      - input: "Minh"
        output: "Chào Minh! Robo rất vui được gặp bạn."
        hidden: true
    common_wrong:
      - output: "Chào {ten}! Robo rất vui được gặp bạn."
        misconception: fstring-prefix
        sample: |
          ten = input()
          print("Chào {ten}! Robo rất vui được gặp bạn.")
      - output: "Chào Lan ! Robo rất vui được gặp bạn."
        misconception: print-comma-space
        sample: |
          ten = input()
          print("Chào", ten, "! Robo rất vui được gặp bạn.")
    hints:
      - { vi: "Dùng chuỗi f: viết chữ f ngay trước dấu nháy mở, rồi đặt biến ten trong cặp ngoặc nhọn { } ở chỗ cần in tên.", en: "Use an f-string: write the letter f right before the opening quote, then put the variable ten in curly brackets { } where the name goes." }
      - { vi: "Dòng 1 là ten = input(). Dòng 2 là print(f\"Chào {ten}! Robo rất vui được gặp bạn.\").", en: "Line 1 is ten = input(). Line 2 is print(f\"Chào {ten}! Robo rất vui được gặp bạn.\")." }
    test_eligible: true
  - id: s2.dinh-dang.l1.ex2
    type: code
    concepts: [fstring-prefix]
    prompt:
      vi: "Robo muốn kể món ăn mà 1 bạn thích. Ô Dữ liệu nhập có 2 dòng: tên của bạn và món ăn bạn thích. Code bên phải in ra {ten} thích ăn {mon}. thay vì tên và món ăn. Hãy sửa dòng 3 để in ra đúng dòng như phần Ví dụ."
      en: "Robo wants to tell which food a friend likes. The Input data box has 2 lines: the friend's name and the food the friend likes. The code on the right prints {ten} thích ăn {mon}. instead of the name and the food. Fix line 3 to print the line in the Example."
    starter: |
      ten = input()
      mon = input()
      print("{ten} thích ăn {mon}.")
    solution: |
      ten = input()
      mon = input()
      print(f"{ten} thích ăn {mon}.")
    tests:
      - input: "Lan\nphở"
        output: "Lan thích ăn phở."
      - input: "Minh\nbánh mì"
        output: "Minh thích ăn bánh mì."
        hidden: true
    common_wrong:
      - output: "{ten} thích ăn {mon}."
        misconception: fstring-prefix
        sample: |
          ten = input()
          mon = input()
          print("{ten} thích ăn {mon}.")
    hints:
      - { vi: "Chuỗi ở dòng 3 thiếu chữ f trước dấu nháy mở. Vì vậy đó chỉ là chuỗi thường, và Python in ra nguyên cả ngoặc nhọn.", en: "The string on line 3 has no f before the opening quote. So it is just a normal string, and Python prints the curly brackets as they are." }
      - { vi: "Sửa dòng 3 thành print(f\"{ten} thích ăn {mon}.\").", en: "Change line 3 to print(f\"{ten} thích ăn {mon}.\")." }
  - id: s2.dinh-dang.l1.q1
    type: predict
    concepts: [fstring-prefix]
    code: |
      name = "Bo"
      age = 9
      print(f"{name} is {age}")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "{name} is {age}", misconception: fstring-prefix }
      - { vi: "Báo lỗi TypeError ở dòng 3, vì age là số, không phải chuỗi", en: "A TypeError on line 3, because age is a number, not a string", error: true, misconception: str-convert }
      - { text: "Bo is 9", correct: true }
      - { text: "name is age", misconception: var-assign }
    explanation:
      vi: "Chuỗi có chữ f trước dấu nháy, nên Python thay mỗi cặp ngoặc nhọn bằng giá trị của biến bên trong: {name} thành Bo, {age} thành 9. Chuỗi f điền được cả số, không cần str(), nên không có lỗi."
      en: "The string has an f before the quote, so Python replaces each pair of curly brackets with the value of the variable inside: {name} becomes Bo, and {age} becomes 9. An f-string can fill in numbers too, with no str(), so there is no error."
  - id: s2.dinh-dang.l1.q2
    type: predict
    concepts: [fstring-prefix]
    code: |
      n = 5
      print("n = {n}", n)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "n = 5 5", misconception: fstring-prefix }
      - { text: "n = {n} 5", correct: true }
      - { text: "n = {5} 5", misconception: fstring-prefix }
      - { text: "n = {n}5", misconception: print-comma-space }
    explanation:
      vi: "Chuỗi \"n = {n}\" không có chữ f trước dấu nháy, nên đó là chuỗi thường: Python in ra nguyên văn, cả ngoặc nhọn. Sau đó dấu phẩy thêm 1 dấu cách rồi in giá trị của biến n là 5."
      en: "The string \"n = {n}\" has no f before the quote, so it is a normal string: Python prints it as it is, curly brackets too. Then the comma adds a space and prints the value of the variable n, which is 5."
---
Ở chủ đề trước, con dùng dấu `+` và `str()` để ghép chữ với số, như `"Pin: " + str(pin) + "%"`. Cách này đúng, nhưng phải viết nhiều dấu nháy và dấu cộng. Python có 1 cách gọn hơn: **chuỗi f** (tiếng Anh là f-string).

Chuỗi f là chuỗi có chữ **f** đứng ngay trước dấu nháy mở. Bên trong chuỗi, con đặt tên biến vào giữa 1 cặp **ngoặc nhọn** `{ }`. Khi in, Python thay cả cặp ngoặc bằng giá trị của biến:

```python run
ten = "Robo"
print(f"Xin chào {ten}!")
```

Python in ra Xin chào Robo!. Dấu chấm than đứng sát ngay sau tên, không có dấu cách thừa.
---
Chuỗi f giống 1 tấm thiệp viết sẵn lời chúc, chỉ chừa chỗ trống để điền tên. Mỗi cặp ngoặc nhọn là 1 chỗ trống. Một chuỗi f có thể có nhiều chỗ trống, và biến chứa số cũng điền vào được, không cần `str()`:

```python run
ten = "Robo"
tuoi = 3
pin = 80
print(f"{ten} năm nay {tuoi} tuổi.")
print(f"Pin còn {pin}%")
```

Dòng 5 in ra Pin còn 80%: số 80 và dấu % đứng sát nhau. Nếu dùng dấu phẩy trong print, con sẽ có 1 dấu cách thừa ở giữa.
---
Chuỗi f dùng được với biến đọc từ `input()`. Đoạn code dưới đây thay `input()` bằng chuỗi "Lan", đúng như thứ `input()` đưa lại khi con gõ Lan:

```python run
ten = "Lan"  # giống như con gõ Lan
print(f"Chào {ten}, mình là Robo!")
```

Trong bài tập, con viết `ten = input()` ở dòng 1, rồi dùng biến `ten` trong chuỗi f.
---
Nếu con quên chữ `f`, chuỗi chỉ là 1 chuỗi thường. Python không báo lỗi, nhưng in ra nguyên cả ngoặc nhọn và tên biến:

```python run
ten = "Robo"
print("Xin chào {ten}!")
print(f"Xin chào {ten}!")
```

Dòng 2 in ra Xin chào {ten}!. Dòng 3 có chữ f, nên in ra Xin chào Robo!. Khi thấy ngoặc nhọn hiện ra trong kết quả, con hãy kiểm tra chữ f trước dấu nháy. Con cũng nhớ dùng ngoặc nhọn `{ }`, không phải ngoặc tròn `( )`.
