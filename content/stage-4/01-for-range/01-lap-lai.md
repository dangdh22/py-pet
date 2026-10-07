---
id: s4.for-range.l1
title: { vi: "Lặp lại với for", en: "Repeating with for" }
exercises:
  - id: s4.for-range.l1.ex1
    type: code
    concepts: [for-repeat]
    prompt:
      vi: "Robo chào 1 bạn mới thật nhiệt tình. Ô Dữ liệu nhập có 1 dòng: tên của bạn đó. Hãy đọc tên vào biến ten. Sau đó, dùng vòng lặp for để in ra 3 lần dòng Chào cùng với tên. Cuối cùng, in ra 1 lần dòng Robo chào xong, đúng như phần Ví dụ."
      en: "Robo greets a new friend very warmly. The Input data box has 1 line: the friend's name. Read the name into the variable ten. Then use a for loop to print the line Chào with the name 3 times. At the end, print the line Robo chào xong once, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = input()
      for i in range(3):
          print("Chào", ten)
      print("Robo chào xong")
    tests:
      - input: "An"
        output: |
          Chào An
          Chào An
          Chào An
          Robo chào xong
      - input: "Minh"
        output: |
          Chào Minh
          Chào Minh
          Chào Minh
          Robo chào xong
        hidden: true
      - input: "Bảo Ngọc"
        output: |
          Chào Bảo Ngọc
          Chào Bảo Ngọc
          Chào Bảo Ngọc
          Robo chào xong
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Chào An
          Robo chào xong
          Chào An
          Robo chào xong
          Chào An
          Robo chào xong
        misconception: for-repeat
        sample: |
          ten = input()
          for i in range(3):
              print("Chào", ten)
              print("Robo chào xong")
    hints:
      - { vi: "Dòng for viết là for i in range(3): và có dấu hai chấm ở cuối. Dòng in lời chào thụt lề 4 dấu cách, để nó được lặp lại. Dòng Robo chào xong viết sát lề trái, để nó chỉ chạy 1 lần, sau khi vòng lặp xong.", en: "The for line is for i in range(3): with a colon at the end. The line that prints the greeting is indented by 4 spaces, so that it is repeated. The line Robo chào xong starts at the left edge, so that it runs only once, after the loop is done." }
      - { vi: "Chương trình có 4 dòng: ten = input(), rồi for i in range(3):, rồi print(\"Chào\", ten) thụt lề 4 dấu cách, và cuối cùng là print(\"Robo chào xong\") sát lề trái.", en: "The program has 4 lines: ten = input(), then for i in range(3):, then print(\"Chào\", ten) indented by 4 spaces, and last print(\"Robo chào xong\") at the left edge." }
    test_eligible: true
  - id: s4.for-range.l1.ex2
    type: code
    concepts: [for-repeat]
    prompt:
      vi: "Buổi tối, Robo kêu 4 tiếng rồi đi ngủ. Ô Dữ liệu nhập có 1 dòng: tiếng kêu của Robo. Code bên phải báo lỗi SyntaxError, và còn 1 lỗi nữa. Hãy sửa code để in ra tiếng kêu đúng 4 lần, rồi in ra dòng Robo đi ngủ đúng 1 lần, như phần Ví dụ."
      en: "In the evening, Robo makes its sound 4 times and then goes to sleep. The Input data box has 1 line: Robo's sound. The code on the right gives a SyntaxError, and it has 1 more mistake. Fix the code to print the sound exactly 4 times, then print the line Robo đi ngủ exactly once, as in the Example."
    starter: |
      tieng_keu = input()
      for i in range(4)
          print(tieng_keu)
          print("Robo đi ngủ")
    solution: |
      tieng_keu = input()
      for i in range(4):
          print(tieng_keu)
      print("Robo đi ngủ")
    tests:
      - input: "Bíp"
        output: |
          Bíp
          Bíp
          Bíp
          Bíp
          Robo đi ngủ
      - input: "Ò ó o"
        output: |
          Ò ó o
          Ò ó o
          Ò ó o
          Ò ó o
          Robo đi ngủ
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Bíp
          Robo đi ngủ
          Bíp
          Robo đi ngủ
          Bíp
          Robo đi ngủ
          Bíp
          Robo đi ngủ
        misconception: for-repeat
        sample: |
          tieng_keu = input()
          for i in range(4):
              print(tieng_keu)
              print("Robo đi ngủ")
    hints:
      - { vi: "Lời báo lỗi expected ':' nghĩa là dòng for thiếu dấu hai chấm ở cuối. Sửa xong lỗi này, con chạy lại và đếm xem dòng Robo đi ngủ được in ra mấy lần.", en: "The error message expected ':' means that the for line has no colon at the end. After fixing it, run the code again and count how many times the line Robo đi ngủ is printed." }
      - { vi: "Thêm dấu : vào cuối dòng 2. Xóa 4 dấu cách ở đầu dòng 4, để dòng này nằm ngoài vòng lặp.", en: "Add : at the end of line 2. Delete the 4 spaces at the start of line 4, so that this line is outside the loop." }
    test_eligible: true
  - id: s4.for-range.l1.q1
    type: predict
    concepts: [for-repeat]
    code: |
      for i in range(2):
          print("A")
      print("B")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\nB\nA\nB", misconception: for-repeat }
      - { text: "A\nA\nA\nB", misconception: range-stop-excluded }
      - { text: "A\nA\nB", correct: true }
      - { text: "A\nA\nB\nB", misconception: for-repeat }
    explanation:
      vi: "range(2) làm vòng lặp chạy 2 lần. Chỉ dòng print(\"A\") thụt lề nằm trong vòng lặp, nên A được in 2 lần. Dòng print(\"B\") sát lề trái, nằm ngoài vòng lặp, nên chỉ chạy 1 lần, sau khi vòng lặp xong."
      en: "range(2) makes the loop run 2 times. Only the indented line print(\"A\") is inside the loop, so A is printed 2 times. The line print(\"B\") starts at the left edge and is outside the loop, so it runs only once, after the loop is done."
  - id: s4.for-range.l1.q2
    type: mcq
    concepts: [for-repeat]
    prompt:
      vi: "Robo muốn khối lệnh bên dưới chạy đúng 5 lần. Dòng for nào viết đúng?"
      en: "Robo wants the block below to run exactly 5 times. Which for line is written correctly?"
    choices:
      - { text: "for i in range(5):", correct: true }
      - { text: "for i in range(5)", misconception: for-repeat }
      - { text: "For i in range(5):", misconception: case-sensitive }
      - { text: "for i in range(4):", misconception: range-stop-excluded }
    explanation:
      vi: "Dòng for viết bằng chữ for thường, rồi i in range(5), và kết thúc bằng dấu hai chấm. range(5) làm vòng lặp chạy đúng 5 lần, còn range(4) chỉ chạy 4 lần. Thiếu dấu hai chấm hay viết For với chữ F hoa đều báo lỗi SyntaxError."
      en: "A for line uses the word for in small letters, then i in range(5), and ends with a colon. range(5) makes the loop run exactly 5 times, while range(4) runs only 4 times. A missing colon, or For with a capital F, gives a SyntaxError."
---
Mỗi sáng, Robo tập thể dục: vẫy tay 3 lần. Con có thể viết 3 dòng print giống hệt nhau, nhưng Python có cách gọn hơn: **vòng lặp**. Vòng lặp làm 1 việc nhiều lần.

```python run
for i in range(3):
    print("Robo vẫy tay")
```

Dòng 1 bảo Python: "làm khối lệnh bên dưới 3 lần". Python in ra Robo vẫy tay 3 lần. Mỗi lần chạy khối lệnh được gọi là 1 **lần lặp**.
---
Dòng for viết theo đúng thứ tự: chữ `for` viết thường, tên biến `i`, chữ `in`, `range(3)`, rồi **dấu hai chấm** ở cuối, giống dòng if. Khối lệnh bên dưới thụt lề 4 dấu cách. Khối có thể có nhiều dòng, và cả khối được lặp lại:

```python run
for i in range(2):
    print("Robo nhảy lên")
    print("Robo ngồi xuống")
```

Python in ra 4 dòng: nhảy lên, ngồi xuống, nhảy lên, ngồi xuống. Con thử đổi số 2 thành 4 rồi bấm Chạy thử.
---
Dòng viết **sát lề trái** sau khối lệnh không nằm trong vòng lặp. Dòng đó chạy đúng 1 lần, sau khi vòng lặp xong:

```python run
for i in range(3):
    print("Robo chạy 1 vòng")
print("Robo nghỉ")
```

Robo chạy 3 vòng rồi mới nghỉ. Con thử thêm 4 dấu cách vào đầu dòng 3 để thấy Robo nghỉ sau mỗi vòng.
---
Nếu con quên dấu hai chấm ở cuối dòng for, Python báo lỗi và chưa chạy dòng nào:

```python run expect-error
for i in range(3)
    print("Robo vẫy tay")
```

Lời báo lỗi là SyntaxError: expected ':', giống như khi dòng if thiếu dấu hai chấm. Con thêm dấu `:` vào cuối dòng 1 là chương trình chạy được.
