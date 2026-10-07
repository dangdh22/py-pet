---
id: s3.if-else.l3
title: { vi: "Nhánh else", en: "The else branch" }
exercises:
  - id: s3.if-else.l3.ex1
    type: code
    concepts: [else-branch]
    prompt:
      vi: "Robo chọn áo theo nhiệt độ. Từ 25 độ trở lên, Robo mặc áo cộc. Dưới 25 độ, Robo mặc áo khoác. Ô Dữ liệu nhập có 1 dòng: nhiệt độ, là số nguyên. Hãy dùng if và else để in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo picks clothes by the temperature. At 25 degrees or more, Robo wears a T-shirt. Below 25 degrees, Robo wears a jacket. The Input data box has 1 line: the temperature, an integer. Use if and else to print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      nhiet_do = int(input())
      if nhiet_do >= 25:
          print("Robo mặc áo cộc")
      else:
          print("Robo mặc áo khoác")
    tests:
      - input: "30"
        output: "Robo mặc áo cộc"
      - input: "25"
        output: "Robo mặc áo cộc"
        hidden: true
      - input: "24"
        output: "Robo mặc áo khoác"
        hidden: true
    common_wrong:
      - test: 1
        output: "Robo mặc áo khoác"
        misconception: compare-ops
        sample: |
          nhiet_do = int(input())
          if nhiet_do > 25:
              print("Robo mặc áo cộc")
          else:
              print("Robo mặc áo khoác")
    hints:
      - { vi: "\"Từ 25 độ trở lên\" là lớn hơn hoặc bằng 25, viết là >= 25. Khi điều kiện này sai, nhánh else chạy. Dòng else: viết thẳng hàng với chữ if và không có điều kiện.", en: "\"25 degrees or more\" means greater than or equal to 25, written >= 25. When this condition is False, the else branch runs. The line else: lines up with the word if and has no condition." }
      - { vi: "Dòng 1 là nhiet_do = int(input()). Dòng 2 là if nhiet_do >= 25:, dòng 3 là print(\"Robo mặc áo cộc\") thụt lề. Dòng 4 là else:, dòng 5 là print(\"Robo mặc áo khoác\") thụt lề.", en: "Line 1 is nhiet_do = int(input()). Line 2 is if nhiet_do >= 25:, and line 3 is print(\"Robo mặc áo cộc\"), indented. Line 4 is else:, and line 5 is print(\"Robo mặc áo khoác\"), indented." }
    test_eligible: true
  - id: s3.if-else.l3.ex2
    type: code
    concepts: [else-branch]
    prompt:
      vi: "Robo chia kẹo cho 2 bạn. Ô Dữ liệu nhập có 1 dòng: số viên kẹo. Nếu số kẹo chia hết cho 2, Robo in ra Chia đều cho 2 bạn, nếu không thì in ra Còn dư 1 viên. Code bên phải báo lỗi SyntaxError ở dòng else. Hãy sửa code để in ra đúng như phần Ví dụ."
      en: "Robo shares candies between 2 friends. The Input data box has 1 line: the number of candies. If the number can be divided by 2, Robo prints Chia đều cho 2 bạn, and if not, it prints Còn dư 1 viên. The code on the right gives a SyntaxError on the else line. Fix the code so that it prints as in the Example."
    starter: |
      so_keo = int(input())
      if so_keo % 2 == 0:
          print("Chia đều cho 2 bạn")
      else so_keo % 2 == 1:
          print("Còn dư 1 viên")
    solution: |
      so_keo = int(input())
      if so_keo % 2 == 0:
          print("Chia đều cho 2 bạn")
      else:
          print("Còn dư 1 viên")
    tests:
      - input: "8"
        output: "Chia đều cho 2 bạn"
      - input: "7"
        output: "Còn dư 1 viên"
        hidden: true
      - input: "10"
        output: "Chia đều cho 2 bạn"
        hidden: true
    hints:
      - { vi: "else không có điều kiện. Nó tự chạy khi điều kiện của if sai, nên con không cần viết so_keo % 2 == 1.", en: "else has no condition. It runs by itself when the condition of the if is False, so you do not need to write so_keo % 2 == 1." }
      - { vi: "Sửa dòng 4 thành else: và giữ nguyên các dòng khác.", en: "Change line 4 to else: and keep the other lines as they are." }
    test_eligible: true
  - id: s3.if-else.l3.q1
    type: predict
    concepts: [else-branch, after-block]
    code: |
      n = 10
      if n > 10:
          print("A")
      else:
          print("B")
      print("C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\nC", misconception: compare-ops }
      - { text: "A\nB\nC", misconception: else-branch }
      - { text: "B\nC", correct: true }
      - { text: "B", misconception: after-block }
    explanation:
      vi: "n bằng 10, mà 10 không lớn hơn 10, nên điều kiện n > 10 là False. Python bỏ qua nhánh if và chạy nhánh else: in ra B. Mỗi lần chạy chỉ có 1 nhánh chạy. Dòng print(\"C\") sát lề trái, không thuộc nhánh nào, nên luôn chạy."
      en: "n is 10, and 10 is not greater than 10, so the condition n > 10 is False. Python skips the if branch and runs the else branch: it prints B. Only 1 branch runs each time. The line print(\"C\") starts at the left edge and is in no branch, so it always runs."
  - id: s3.if-else.l3.q2
    type: mcq
    concepts: [else-branch]
    prompt:
      vi: "Câu nào nói đúng về else?"
      en: "Which sentence about else is true?"
    choices:
      - { vi: "Khối else luôn chạy, ngay sau khối if", en: "The else block always runs, right after the if block", misconception: else-branch }
      - { vi: "else cần có điều kiện riêng, ví dụ else n < 5:", en: "else needs its own condition, for example else n < 5:", misconception: else-branch }
      - { vi: "Khi điều kiện của if đúng, cả khối if và khối else đều chạy", en: "When the condition of the if is True, both the if block and the else block run", misconception: else-branch }
      - { vi: "Khối else chạy khi điều kiện của if sai", en: "The else block runs when the condition of the if is False", correct: true }
    explanation:
      vi: "else không có điều kiện riêng: nó chạy khi điều kiện của if sai. Khi điều kiện đúng, chỉ khối if chạy. Vì vậy, mỗi lần chạy, đúng 1 trong 2 khối được chạy, không bao giờ cả 2. Viết else n < 5: thì Python báo lỗi SyntaxError."
      en: "else has no condition of its own: it runs when the condition of the if is False. When the condition is True, only the if block runs. So each time, exactly 1 of the 2 blocks runs, never both. Writing else n < 5: gives a SyntaxError."
---
Robo muốn làm 1 việc khi điều kiện đúng, và 1 việc khác khi điều kiện sai. Con dùng **else**, nghĩa là "nếu không thì":

```python run
pin = 80
if pin < 20:
    print("Robo đi sạc")
else:
    print("Robo đi chơi")
```

Điều kiện pin < 20 là False, nên Python bỏ qua khối của if và chạy khối của else: in ra Robo đi chơi. Mỗi khối như vậy gọi là 1 **nhánh**.
---
Dòng `else:` viết thẳng hàng với chữ `if`, có dấu hai chấm, và **không có điều kiện**. Dòng bên dưới thụt lề 4 dấu cách như khối của if. Nếu con viết điều kiện sau else, Python báo lỗi:

```python run expect-error
pin = 80
if pin < 20:
    print("Robo đi sạc")
else pin >= 20:
    print("Robo đi chơi")
```

Lời báo lỗi là SyntaxError: expected ':'. Sau chữ else, Python chờ ngay 1 dấu hai chấm. Con xóa điều kiện, chỉ để lại `else:` là đúng.
---
Mỗi lần chạy, Python chọn **đúng 1** trong 2 nhánh: điều kiện đúng thì chạy nhánh if, sai thì chạy nhánh else. Dòng sát lề trái sau đó vẫn luôn chạy:

```python run
so = 7
if so % 2 == 0:
    print(so, "là số chẵn")
else:
    print(so, "là số lẻ")
print("Robo đã kiểm tra xong")
```

7 chia 2 dư 1, nên điều kiện là False: Python in ra 7 là số lẻ, rồi in Robo đã kiểm tra xong. Ở bài 1, con viết 2 lệnh if với 2 điều kiện ngược nhau. Dùng else thì gọn hơn, vì con không phải viết điều kiện thứ hai.
