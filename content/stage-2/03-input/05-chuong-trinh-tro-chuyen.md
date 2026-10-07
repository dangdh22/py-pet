---
id: s2.input.l5
title: { vi: "Chương trình biết trò chuyện", en: "A program that talks" }
exercises:
  - id: s2.input.l5.ex1
    type: code
    concepts: [input-order, input-empty-prompt]
    prompt:
      vi: "Viết chương trình trò chuyện của Robo. Ô Dữ liệu nhập có 2 dòng: dòng 1 là tên, dòng 2 là món ăn yêu thích. Hãy đọc 2 dòng đó vào 2 biến ten và mon, rồi in ra 2 dòng như phần Ví dụ. Chú ý: dấu chấm than đứng liền ngay sau tên."
      en: "Write Robo's chat program. The Input data box has 2 lines: line 1 is a name, and line 2 is a favourite food. Read the 2 lines into the 2 variables ten and mon, then print the 2 lines in the Example. Note: the exclamation mark comes right after the name, with no space."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = input()
      mon = input()
      print("Chào", ten + "!")
      print("Món", mon, "ngon lắm,", ten, "ạ.")
    tests:
      - input: "An\nphở"
        output: |
          Chào An!
          Món phở ngon lắm, An ạ.
      - input: "Minh\nbánh mì"
        output: |
          Chào Minh!
          Món bánh mì ngon lắm, Minh ạ.
        hidden: true
    common_wrong:
      - output: |
          Chào An !
          Món phở ngon lắm, An ạ.
        misconception: print-comma-space
        sample: |
          ten = input()
          mon = input()
          print("Chào", ten, "!")
          print("Món", mon, "ngon lắm,", ten, "ạ.")
      - output: |
          Tên: Món: Chào An!
          Món phở ngon lắm, An ạ.
        misconception: input-empty-prompt
        sample: |
          ten = input("Tên: ")
          mon = input("Món: ")
          print("Chào", ten + "!")
          print("Món", mon, "ngon lắm,", ten, "ạ.")
      - output: |
          Chào phở!
          Món An ngon lắm, phở ạ.
        misconception: input-order
        sample: |
          mon = input()
          ten = input()
          print("Chào", ten + "!")
          print("Món", mon, "ngon lắm,", ten, "ạ.")
    hints:
      - { vi: "Đọc tên trước, món ăn sau, vì dòng 1 là tên. Ở dòng in thứ nhất, dùng dấu + để dấu chấm than dính liền với tên. Dòng in thứ hai chỉ cần dấu phẩy.", en: "Read the name first and the food second, because line 1 is the name. In the first print, use + so that the exclamation mark sticks to the name. The second print only needs commas." }
      - { vi: "Dòng 1 là ten = input(), dòng 2 là mon = input(). Dòng in thứ nhất là print(\"Chào\", ten + \"!\"). Dòng in thứ hai là print(\"Món\", mon, \"ngon lắm,\", ten, \"ạ.\").", en: "Line 1 is ten = input(), and line 2 is mon = input(). The first print is print(\"Chào\", ten + \"!\"). The second print is print(\"Món\", mon, \"ngon lắm,\", ten, \"ạ.\")." }
    test_eligible: true
  - id: s2.input.l5.ex2
    type: code
    concepts: [input-order]
    prompt:
      vi: "Robo tặng quà cho bạn. Ô Dữ liệu nhập có 3 dòng theo thứ tự: tên bạn, màu sắc, đồ vật. Hãy đọc 3 dòng vào 3 biến ten, mau, do_vat, rồi in ra đúng dòng như phần Ví dụ. Chú ý: thứ tự in khác thứ tự nhập."
      en: "Robo gives a friend a present. The Input data box has 3 lines in this order: the friend's name, a colour, a thing. Read the 3 lines into the 3 variables ten, mau, do_vat, then print the line in the Example. Note: the order of printing is not the order of input."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = input()
      mau = input()
      do_vat = input()
      print("Robo tặng", ten, "1 cái", do_vat, "màu", mau + ".")
    tests:
      - input: "An\nxanh\nmũ"
        output: "Robo tặng An 1 cái mũ màu xanh."
      - input: "Bình\nvàng\nbalo"
        output: "Robo tặng Bình 1 cái balo màu vàng."
        hidden: true
    common_wrong:
      - output: "Robo tặng An 1 cái xanh màu mũ."
        misconception: input-order
        sample: |
          ten = input()
          do_vat = input()
          mau = input()
          print("Robo tặng", ten, "1 cái", do_vat, "màu", mau + ".")
    hints:
      - { vi: "Đọc theo đúng thứ tự các dòng nhập: ten trước, rồi mau, rồi do_vat. Thứ tự in là chuyện của lệnh print, không ảnh hưởng tới thứ tự đọc.", en: "Read in the order of the input lines: ten first, then mau, then do_vat. The order of printing is the job of the print statement, and it does not change the order of reading." }
      - { vi: "Ba dòng đầu là ten = input(), mau = input(), do_vat = input(). Dòng in là print(\"Robo tặng\", ten, \"1 cái\", do_vat, \"màu\", mau + \".\").", en: "The first 3 lines are ten = input(), mau = input(), do_vat = input(). The print line is print(\"Robo tặng\", ten, \"1 cái\", do_vat, \"màu\", mau + \".\")." }
  - id: s2.input.l5.q1
    type: mcq
    concepts: [input-str]
    code: |
      a = input()
      print("Hi " + a + "!")
    prompt:
      vi: "Ô Dữ liệu nhập có 1 dòng: Bo. Đoạn code in ra gì?"
      en: "The Input data box has 1 line: Bo. What is the output of this code?"
    choices:
      - { text: "Hi Bo !", misconception: concat-no-space }
      - { text: "Hi a!", misconception: var-assign }
      - { vi: "Báo lỗi TypeError ở dòng 2", en: "A TypeError on line 2", error: true, misconception: input-str }
      - { text: "Hi Bo!", correct: true }
    explanation:
      vi: "a là chuỗi \"Bo\" đọc từ input(), nên nối với chuỗi khác bằng dấu + không bị lỗi. Dấu cách nằm sẵn trong chuỗi \"Hi \", còn dấu + không thêm dấu cách nào, nên dấu chấm than dính liền với Bo."
      en: "a is the string \"Bo\" read with input(), so joining it to other strings with + gives no error. The space is already inside the string \"Hi \", and + adds no space, so the exclamation mark sticks to Bo."
  - id: s2.input.l5.q2
    type: mcq
    concepts: [input-order]
    code: |
      x = input()
      y = input()
      print(y + x, x + y)
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: ab và cd. Đoạn code in ra gì?"
      en: "The Input data box has 2 lines: ab and cd. What is the output of this code?"
    choices:
      - { text: "cdab abcd", correct: true }
      - { text: "abcd cdab", misconception: input-order }
      - { text: "cd ab ab cd", misconception: concat-no-space }
      - { text: "cdab\nabcd", misconception: print-comma-space }
    explanation:
      vi: "x đọc dòng 1 nên là ab, y đọc dòng 2 nên là cd. y + x nối thành cdab, x + y nối thành abcd. Dấu + không thêm dấu cách, còn dấu phẩy trong print thêm 1 dấu cách ở giữa, trên cùng 1 dòng."
      en: "x reads line 1, so it is ab, and y reads line 2, so it is cd. y + x joins into cdab, and x + y joins into abcd. + adds no space, and the comma in print adds 1 space between them, on the same line."
---
Bây giờ con đã đủ đồ nghề để viết 1 chương trình biết trò chuyện. Robo hỏi tên và món ăn yêu thích của con, rồi trả lời. Trước khi viết code, con lên kế hoạch:

1. Đọc tên vào biến `ten`.
2. Đọc món ăn vào biến `mon`.
3. In lời chào và lời trả lời.

```python
ten = input()
mon = input()
print("Chào", ten + "!")
print("Robo cũng thích ăn", mon + ".")
```

Với 2 dòng An và phở trong ô Dữ liệu nhập, chương trình chạy giống đoạn code dưới đây:

```python run
ten = "An"   # dòng 1 con gõ
mon = "phở"  # dòng 2 con gõ
print("Chào", ten + "!")
print("Robo cũng thích ăn", mon + ".")
```
---
Hãy nhìn kỹ lệnh `print("Chào", ten + "!")`. Dấu phẩy thêm 1 dấu cách giữa chữ Chào và tên. Dấu `+` nối tên với dấu chấm than, không có dấu cách. Nếu con dùng dấu phẩy ở cả 2 chỗ, dấu chấm than bị tách ra:

```python run
ten = "An"  # giống như con gõ An
print("Chào", ten, "!")
print("Chào", ten + "!")
print("Chào " + ten + "!")
```

Dòng 1 in ra Chào An ! với 1 dấu cách thừa. Dòng 2 và dòng 3 đều in ra Chào An!. Khi chỉ dùng dấu `+`, con phải tự để dấu cách trong dấu nháy: chuỗi "Chào " có 1 dấu cách ở cuối.
---
Chương trình tốt phải chạy đúng với **mọi** dữ liệu nhập, không chỉ với dữ liệu ở phần Ví dụ. Nếu con in sẵn chữ An thay vì dùng biến `ten`, chương trình chỉ đúng khi người dùng tên là An:

```python run
print("Chào An!")  # chỉ đúng khi người dùng tên là An
```

Đoạn code này qua được test Ví dụ, nhưng sai ở test ẩn có tên khác. Trước khi Nộp bài, con hãy tự thử: sửa ô Dữ liệu nhập thành tên của con và món con thích, rồi bấm Chạy thử để xem kết quả có đúng không.
