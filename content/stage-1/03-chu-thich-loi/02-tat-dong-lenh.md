---
id: s1.chu-thich-loi.l2
title: { vi: "Tắt tạm 1 dòng lệnh", en: "Turning a line off" }
exercises:
  - id: s1.chu-thich-loi.l2.ex1
    type: code
    concepts: [comment-hash]
    prompt:
      vi: "Robo đếm ngược nhưng bị lặp số 2. Đừng xóa dòng nào. Hãy thêm dấu # để tắt 1 dòng thừa, sao cho chương trình in ra đúng như phần Ví dụ."
      en: "Robo counts down, but the number 2 comes twice. Do not delete any line. Add a # sign to turn off 1 extra line, so that the program prints exactly the Example."
    starter: |
      print("3")
      print("2")
      print("2")
      print("1")
      print("Bay!")
    solution: |
      print("3")
      print("2")
      # print("2")
      print("1")
      print("Bay!")
    tests:
      - output: |
          3
          2
          1
          Bay!
    common_wrong:
      - output: |
          3
          2
          2
          1
          Bay!
        misconception: comment-hash
        sample: |
          print("3")
          print("2")
          print("2")  #
          print("1")
          print("Bay!")
    hints:
      - { vi: "Dấu # đặt ở đầu dòng sẽ tắt cả dòng đó. Dấu # đặt ở cuối dòng thì lệnh phía trước vẫn chạy.", en: "A # sign at the start of a line turns off the whole line. With a # sign at the end of a line, the statement before it still runs." }
      - { vi: "Thêm # vào đầu 1 trong 2 dòng print(\"2\"), ví dụ: # print(\"2\")", en: "Add # at the start of 1 of the 2 print(\"2\") lines, for example: # print(\"2\")" }
    test_eligible: true
  - id: s1.chu-thich-loi.l2.q1
    type: predict
    concepts: [comment-hash]
    code: |
      print("A")
      # print("B")
      print("C")
      # print("D")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\nC", correct: true }
      - { text: "A\nB\nC\nD", misconception: comment-hash }
      - { text: "A\n\nC", misconception: comment-hash }
      - { text: "B\nD", misconception: comment-hash }
    explanation:
      vi: "Dòng 2 và dòng 4 bắt đầu bằng dấu #, nên cả 2 dòng là chú thích. Python bỏ qua chúng và không in ra dòng trống nào. Chỉ có A và C được in."
      en: "Lines 2 and 4 start with a # sign, so both lines are comments. Python skips them and prints no empty line for them. Only A and C are printed."
  - id: s1.chu-thich-loi.l2.q2
    type: predict
    concepts: [comment-hash]
    code: |
      print("1")  # print("2")
      # print("3")
      print("4")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1\n4", correct: true }
      - { text: "1\n2\n4", misconception: comment-hash }
      - { text: "1\n3\n4", misconception: comment-hash }
      - { text: "4", misconception: comment-hash }
    explanation:
      vi: "Ở dòng 1, lệnh print(\"1\") đứng trước dấu # nên vẫn chạy, còn print(\"2\") nằm trong chú thích. Dòng 2 là chú thích. Dòng 3 in ra 4."
      en: "On line 1, print(\"1\") comes before the # sign, so it runs, and print(\"2\") is inside the comment. Line 2 is a comment. Line 3 prints 4."
---
Đặt dấu `#` ở **đầu 1 dòng lệnh** thì cả dòng đó trở thành chú thích. Python sẽ bỏ qua dòng đó, giống như con tạm tắt công tắc của 1 bóng đèn.

```python run
print("Robo thức dậy")
# print("Robo ăn sáng")
print("Robo đi học")
```

Muốn bật lại dòng lệnh, con chỉ cần xóa dấu `#`.
---
Tắt tạm 1 dòng rất có ích khi con **thử nghiệm**. Con muốn so sánh 2 kiểu đường kẻ? Hãy giữ cả 2 dòng, tắt 1 dòng, chạy thử, rồi đổi lại.

```python run
print("=" * 12)
# print("-" * 12)
print("Robo")
```

Con thử đoán: nếu bỏ dấu `#` ở dòng 2 và thêm `#` vào đầu dòng 1, đường kẻ sẽ đổi thế nào?
---
Tắt tạm 1 dòng cũng giúp con **tìm lỗi**. Nếu tắt 1 dòng mà chương trình hết lỗi, con biết lỗi nằm ở dòng đó.

```python run
print("Robo")
# print("Py)
print("Pet")
```

Dòng 2 thiếu dấu nháy đóng, nhưng nó đang bị tắt nên chương trình vẫn chạy. Tắt dòng chỉ giúp con tìm ra dòng lỗi. Sau đó con vẫn phải sửa dòng đó rồi bật lại.
