---
id: s3.if-else.l2
title: { vi: "Khối lệnh và thụt lề", en: "Blocks and indentation" }
exercises:
  - id: s3.if-else.l2.ex1
    type: code
    concepts: [indent-block]
    prompt:
      vi: "Robo chỉ đi sạc khi pin dưới 20 phần trăm. Ô Dữ liệu nhập có 1 dòng: số phần trăm pin. Code bên phải in ra Robo đi sạc cả khi pin còn nhiều. Hãy sửa code để 2 dòng Pin yếu và Robo đi sạc chỉ in ra khi pin dưới 20, còn dòng cuối luôn in ra, đúng như phần Ví dụ."
      en: "Robo goes charging only when the battery is below 20 percent. The Input data box has 1 line: the battery percent. The code on the right prints Robo đi sạc even when the battery is high. Fix the code so that the 2 lines Pin yếu and Robo đi sạc are printed only when the battery is below 20, and the last line is always printed, exactly as in the Example."
    starter: |
      pin = int(input())
      if pin < 20:
          print("Pin yếu")
      print("Robo đi sạc")
      print("Pin còn", pin, "phần trăm")
    solution: |
      pin = int(input())
      if pin < 20:
          print("Pin yếu")
          print("Robo đi sạc")
      print("Pin còn", pin, "phần trăm")
    tests:
      - input: "12"
        output: |
          Pin yếu
          Robo đi sạc
          Pin còn 12 phần trăm
      - input: "20"
        output: "Pin còn 20 phần trăm"
        hidden: true
      - input: "75"
        output: "Pin còn 75 phần trăm"
        hidden: true
    common_wrong:
      - test: 1
        output: |
          Robo đi sạc
          Pin còn 20 phần trăm
        misconception: indent-block
        sample: |
          pin = int(input())
          if pin < 20:
              print("Pin yếu")
          print("Robo đi sạc")
          print("Pin còn", pin, "phần trăm")
    hints:
      - { vi: "Chỉ những dòng thụt lề 4 dấu cách ngay dưới lệnh if mới thuộc khối của if. Dòng print(\"Robo đi sạc\") đang sát lề trái, nên nó luôn chạy.", en: "Only the lines indented by 4 spaces right under the if statement belong to the block of the if. The line print(\"Robo đi sạc\") starts at the left edge, so it always runs." }
      - { vi: "Thêm 4 dấu cách vào đầu dòng 4. Giữ nguyên dòng 5 sát lề trái.", en: "Add 4 spaces at the start of line 4. Keep line 5 at the left edge." }
    test_eligible: true
  - id: s3.if-else.l2.ex2
    type: code
    concepts: [after-block]
    prompt:
      vi: "Robo bán vé vào khu vui chơi. Trẻ dưới 6 tuổi được vào miễn phí. Ô Dữ liệu nhập có 1 dòng: tuổi của 1 bạn nhỏ. Hãy đọc tuổi vào biến tuoi. Nếu tuổi dưới 6, in ra Con được vào miễn phí. Dù tuổi là bao nhiêu, cuối cùng luôn in ra Chúc con chơi vui, đúng như phần Ví dụ."
      en: "Robo sells tickets for a playground. Children under 6 get in for free. The Input data box has 1 line: the age of a child. Read the age into the variable tuoi. If the age is under 6, print Con được vào miễn phí. Whatever the age is, at the end always print Chúc con chơi vui, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tuoi = int(input())
      if tuoi < 6:
          print("Con được vào miễn phí")
      print("Chúc con chơi vui")
    tests:
      - input: "4"
        output: |
          Con được vào miễn phí
          Chúc con chơi vui
      - input: "6"
        output: "Chúc con chơi vui"
        hidden: true
      - input: "11"
        output: "Chúc con chơi vui"
        hidden: true
    hints:
      - { vi: "Dòng Con được vào miễn phí nằm trong khối của if, nên thụt lề 4 dấu cách. Dòng Chúc con chơi vui luôn chạy, nên viết sát lề trái, sau khối của if. Bạn đúng 6 tuổi thì không được miễn phí.", en: "The line Con được vào miễn phí is in the block of the if, so it is indented by 4 spaces. The line Chúc con chơi vui always runs, so it starts at the left edge, after the block of the if. A child who is exactly 6 does not get in for free." }
      - { vi: "Chương trình có 4 dòng: tuoi = int(input()), rồi if tuoi < 6:, rồi print(\"Con được vào miễn phí\") thụt lề 4 dấu cách, và cuối cùng là print(\"Chúc con chơi vui\") sát lề trái.", en: "The program has 4 lines: tuoi = int(input()), then if tuoi < 6:, then print(\"Con được vào miễn phí\") indented by 4 spaces, and last print(\"Chúc con chơi vui\") at the left edge." }
    test_eligible: true
  - id: s3.if-else.l2.q1
    type: predict
    concepts: [after-block]
    code: |
      x = 8
      if x < 5:
          print("A")
          print("B")
      print("C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "B\nC", misconception: indent-block }
      - { text: "A\nB\nC", misconception: indent-block }
      - { vi: "Báo lỗi IndentationError ở dòng 5, vì dòng này không thụt lề", en: "An IndentationError on line 5, because this line is not indented", error: true, misconception: after-block }
      - { text: "C", correct: true }
    explanation:
      vi: "x bằng 8, nên điều kiện x < 5 là False. Cả 2 dòng print(\"A\") và print(\"B\") đều thụt lề, nên cùng thuộc khối của if và cùng bị bỏ qua. Dòng print(\"C\") viết sát lề trái, không thuộc khối, nên luôn chạy và không có lỗi."
      en: "x is 8, so the condition x < 5 is False. Both lines print(\"A\") and print(\"B\") are indented, so they both belong to the block of the if and are both skipped. The line print(\"C\") starts at the left edge and is not in the block, so it always runs, and there is no error."
  - id: s3.if-else.l2.q2
    type: predict
    concepts: [indent-block]
    code: |
      x = 9
      if x > 5:
          print("A")
        print("B")
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { text: "A\nB", misconception: indent-block }
      - { vi: "Báo lỗi IndentationError ở dòng 4", en: "An IndentationError on line 4", correct: true, error: true }
      - { text: "A", misconception: indent-block }
      - { vi: "Báo lỗi SyntaxError ở dòng 2", en: "A SyntaxError on line 2", error: true, misconception: if-colon }
    explanation:
      vi: "Dòng 3 thụt lề 4 dấu cách, còn dòng 4 chỉ thụt lề 2 dấu cách. Thụt lề lệch nhau như vậy, Python không biết dòng 4 có thuộc khối hay không, nên báo lỗi IndentationError ở dòng 4 và không in gì. Dòng 2 viết đúng, có đủ dấu hai chấm."
      en: "Line 3 is indented by 4 spaces, but line 4 is indented by only 2 spaces. With indentation that does not line up, Python cannot tell whether line 4 is in the block, so it gives an IndentationError on line 4 and prints nothing. Line 2 is written correctly, with its colon."
---
Khối lệnh của if có thể có nhiều dòng. Mọi dòng thụt lề cùng 4 dấu cách ngay dưới lệnh if đều thuộc **khối lệnh** đó:

```python run
pin = 10
if pin < 20:
    print("Pin yếu")
    print("Robo đi sạc")
```

Cả dòng 3 và dòng 4 đều thụt lề, nên cả 2 cùng chạy khi điều kiện đúng. Khi điều kiện sai, cả 2 cùng bị bỏ qua.
---
Dòng viết **sát lề trái** sau khối lệnh không thuộc lệnh if. Dòng đó **luôn chạy**, dù điều kiện đúng hay sai:

```python run
pin = 90
if pin < 20:
    print("Pin yếu")
    print("Robo đi sạc")
print("Robo chào con")
```

90 không nhỏ hơn 20, nên khối lệnh bị bỏ qua. Dòng 5 không thụt lề, nên vẫn chạy: Python in ra Robo chào con. Con thử đổi pin thành 10 để thấy cả 3 dòng được in ra.
---
Dòng ngay sau lệnh if **phải** thụt lề. Nếu con quên thụt lề, Python báo lỗi:

```python run expect-error
pin = 10
if pin < 20:
print("Pin yếu")
```

Lời báo lỗi là IndentationError: expected an indented block after 'if' statement on line 2. Câu này nghĩa là "sau lệnh if ở dòng 2, cần 1 khối lệnh thụt lề". **IndentationError** là lỗi thụt lề.
---
Thụt lề phải đều nhau: mọi dòng trong khối đều lùi vào đúng 4 dấu cách. Nếu 1 dòng chỉ lùi vào 2 dấu cách, Python báo lỗi vì thụt lề **lệch**:

```python run expect-error
pin = 10
if pin < 20:
    print("Pin yếu")
  print("Robo đi sạc")
```

Còn nếu 1 dòng thụt vào mà không nằm trong khối nào, Python báo lỗi thụt lề **thừa** (unexpected indent):

```python run expect-error
print("Robo thức dậy")
    print("Robo đánh răng")
```
