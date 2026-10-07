---
id: s3.elif.l2
title: { vi: "Thứ tự điều kiện", en: "The order of conditions" }
exercises:
  - id: s3.elif.l2.ex1
    type: code
    concepts: [condition-order]
    prompt:
      vi: "Robo tặng sao theo số bước con đi trong 1 ngày. Từ 8000 bước trở lên: Robo tặng 3 ngôi sao. Từ 5000 bước trở lên: Robo tặng 2 ngôi sao. Từ 2000 bước trở lên: Robo tặng 1 ngôi sao. Ít hơn 2000 bước: Con đi thêm nhé. Ô Dữ liệu nhập có 1 dòng: số bước. Code bên phải chạy được nhưng in sai: với 9000 bước, Robo chỉ tặng 1 ngôi sao. Hãy sửa code để in ra đúng như phần Ví dụ."
      en: "Robo gives stars for the steps you walk in a day. 8000 steps or more: Robo tặng 3 ngôi sao. 5000 steps or more: Robo tặng 2 ngôi sao. 2000 steps or more: Robo tặng 1 ngôi sao. Fewer than 2000 steps: Con đi thêm nhé. The Input data box has 1 line: the number of steps. The code on the right runs but prints the wrong thing: with 9000 steps, Robo gives only 1 star. Fix the code so that it prints as in the Example."
    starter: |
      so_buoc = int(input())
      if so_buoc >= 2000:
          print("Robo tặng 1 ngôi sao")
      elif so_buoc >= 5000:
          print("Robo tặng 2 ngôi sao")
      elif so_buoc >= 8000:
          print("Robo tặng 3 ngôi sao")
      else:
          print("Con đi thêm nhé")
    solution: |
      so_buoc = int(input())
      if so_buoc >= 8000:
          print("Robo tặng 3 ngôi sao")
      elif so_buoc >= 5000:
          print("Robo tặng 2 ngôi sao")
      elif so_buoc >= 2000:
          print("Robo tặng 1 ngôi sao")
      else:
          print("Con đi thêm nhé")
    tests:
      - input: "9000"
        output: "Robo tặng 3 ngôi sao"
      - input: "8000"
        output: "Robo tặng 3 ngôi sao"
        hidden: true
      - input: "6000"
        output: "Robo tặng 2 ngôi sao"
        hidden: true
      - input: "5000"
        output: "Robo tặng 2 ngôi sao"
        hidden: true
      - input: "2000"
        output: "Robo tặng 1 ngôi sao"
        hidden: true
      - input: "1500"
        output: "Con đi thêm nhé"
        hidden: true
    common_wrong:
      - test: 0
        output: "Robo tặng 1 ngôi sao"
        misconception: condition-order
        sample: |
          so_buoc = int(input())
          if so_buoc >= 2000:
              print("Robo tặng 1 ngôi sao")
          elif so_buoc >= 5000:
              print("Robo tặng 2 ngôi sao")
          elif so_buoc >= 8000:
              print("Robo tặng 3 ngôi sao")
          else:
              print("Con đi thêm nhé")
    hints:
      - { vi: "Python dừng ở điều kiện đúng đầu tiên. 9000 >= 2000 đã đúng, nên Python không thử tới các điều kiện bên dưới. Với dấu >=, con xếp số lớn nhất lên trước.", en: "Python stops at the first True condition. 9000 >= 2000 is already True, so Python never tries the conditions below it. With >=, put the biggest number first." }
      - { vi: "Đổi thứ tự: dòng if hỏi so_buoc >= 8000 và in 3 ngôi sao, elif thứ nhất hỏi so_buoc >= 5000, elif thứ hai hỏi so_buoc >= 2000. Nhánh else giữ nguyên.", en: "Change the order: the if line asks so_buoc >= 8000 and prints 3 stars, the first elif asks so_buoc >= 5000, and the second elif asks so_buoc >= 2000. The else branch stays the same." }
    test_eligible: true
  - id: s3.elif.l2.ex2
    type: code
    concepts: [condition-order]
    prompt:
      vi: "Robo báo tình trạng pin. Pin dưới 20 phần trăm: in ra Robo cần sạc ngay. Từ 20 đến dưới 50 phần trăm: in ra Robo nên sạc sớm. Từ 50 phần trăm trở lên: in ra Pin còn tốt. Ô Dữ liệu nhập có 1 dòng: số phần trăm pin, là số nguyên. Hãy dùng if, elif và else để in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo reports its battery. Below 20 percent: print Robo cần sạc ngay. From 20 to below 50 percent: print Robo nên sạc sớm. 50 percent or more: print Pin còn tốt. The Input data box has 1 line: the battery percent, an integer. Use if, elif and else to print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      pin = int(input())
      if pin < 20:
          print("Robo cần sạc ngay")
      elif pin < 50:
          print("Robo nên sạc sớm")
      else:
          print("Pin còn tốt")
    tests:
      - input: "10"
        output: "Robo cần sạc ngay"
      - input: "20"
        output: "Robo nên sạc sớm"
        hidden: true
      - input: "49"
        output: "Robo nên sạc sớm"
        hidden: true
      - input: "50"
        output: "Pin còn tốt"
        hidden: true
      - input: "85"
        output: "Pin còn tốt"
        hidden: true
    common_wrong:
      - test: 0
        output: "Robo nên sạc sớm"
        misconception: condition-order
        sample: |
          pin = int(input())
          if pin < 50:
              print("Robo nên sạc sớm")
          elif pin < 20:
              print("Robo cần sạc ngay")
          else:
              print("Pin còn tốt")
    hints:
      - { vi: "Với dấu <, con hỏi số nhỏ nhất trước: pin < 20, rồi mới đến pin < 50. Nếu hỏi pin < 50 trước, pin 10 cũng rơi vào nhánh nên sạc sớm.", en: "With <, ask about the smallest number first: pin < 20, and only then pin < 50. If you ask pin < 50 first, a battery of 10 also falls into the branch for charging soon." }
      - { vi: "Dòng 1 là pin = int(input()). Dòng 2 là if pin < 20:, dòng 4 là elif pin < 50:, dòng 6 là else:. Dưới mỗi dòng đó là 1 lệnh print thụt lề.", en: "Line 1 is pin = int(input()). Line 2 is if pin < 20:, line 4 is elif pin < 50:, and line 6 is else:. Under each of those lines is 1 indented print statement." }
    test_eligible: true
  - id: s3.elif.l2.q1
    type: predict
    concepts: [condition-order]
    code: |
      n = 95
      if n > 50:
          print("ok")
      elif n > 90:
          print("top")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "ok", correct: true }
      - { text: "top", misconception: condition-order }
      - { text: "ok\ntop", misconception: elif-chain }
      - { vi: "Báo lỗi, vì các điều kiện xếp sai thứ tự", en: "An error, because the conditions are in the wrong order", error: true, misconception: condition-order }
    explanation:
      vi: "Python thử từ trên xuống. 95 > 50 là True, nên Python in ra ok và bỏ qua elif, dù 95 > 90 cũng đúng. Vì vậy nhánh top không bao giờ chạy được. Xếp sai thứ tự không làm Python báo lỗi: chương trình vẫn chạy, chỉ là kết quả không như con muốn."
      en: "Python tries from the top down. 95 > 50 is True, so Python prints ok and skips the elif, even though 95 > 90 is also True. So the top branch can never run. The wrong order does not make Python give an error: the program still runs, but the result is not what you want."
  - id: s3.elif.l2.q2
    type: mcq
    concepts: [condition-order]
    prompt:
      vi: "Khi chạy 1 chuỗi if, elif, else, Python làm thế nào?"
      en: "How does Python run an if, elif, else chain?"
    choices:
      - { vi: "Thử hết mọi điều kiện, rồi chạy nhánh của điều kiện đúng cuối cùng", en: "It tries every condition, then runs the branch of the last True condition", misconception: condition-order }
      - { vi: "Chọn nhánh có điều kiện gần với giá trị của biến nhất", en: "It picks the branch whose condition is closest to the value of the variable", misconception: condition-order }
      - { vi: "Thử từ dưới lên, bắt đầu từ nhánh else", en: "It tries from the bottom up, starting with the else branch", misconception: condition-order }
      - { vi: "Thử từng điều kiện từ trên xuống, dừng ở điều kiện đúng đầu tiên", en: "It tries each condition from the top down and stops at the first True one", correct: true }
    explanation:
      vi: "Python thử điều kiện của if trước, rồi đến từng elif theo thứ tự từ trên xuống. Gặp điều kiện đúng đầu tiên, Python chạy nhánh đó và bỏ qua phần còn lại. Nhánh else chỉ chạy khi mọi điều kiện đều sai."
      en: "Python tries the condition of the if first, then each elif in order from the top down. At the first True condition, Python runs that branch and skips the rest. The else branch runs only when every condition is False."
---
Python thử các điều kiện **từ trên xuống**, lần lượt từng cái. Nó dừng lại ở **điều kiện đúng đầu tiên** và chạy nhánh của điều kiện đó:

```python run
diem = 6
if diem >= 8:
    print("Giỏi")
elif diem >= 5:
    print("Đạt")
else:
    print("Chưa đạt")
```

Python thử diem >= 8 trước: 6 >= 8 là False, nên bỏ qua nhánh Giỏi. Python thử tiếp diem >= 5: 6 >= 5 là True, nên in ra Đạt và dừng lại. Nhánh else không chạy.
---
Vì điều kiện đúng đầu tiên thắng, **thứ tự** các điều kiện rất quan trọng. Đây là code viết điều kiện >= 5 trước >= 8:

```python run
diem = 9
if diem >= 5:
    print("Đạt")
elif diem >= 8:
    print("Giỏi")
else:
    print("Chưa đạt")
```

Con được 9 điểm mà Robo chỉ in ra Đạt! 9 >= 5 đã đúng, nên Python dừng ở đó và không bao giờ thử tới diem >= 8. Python không báo lỗi, nên con phải tự để ý thứ tự.
---
Cách xếp đúng: khi dùng `>=` hay `>`, con viết điều kiện có số **lớn nhất trước**, rồi nhỏ dần. Khi dùng `<` hay `<=`, con làm ngược lại: số **nhỏ nhất trước**, rồi lớn dần:

```python run
tuoi = 8
if tuoi < 6:
    print("Vé miễn phí")
elif tuoi < 12:
    print("Vé trẻ em")
else:
    print("Vé người lớn")
```

8 không nhỏ hơn 6, nhưng nhỏ hơn 12, nên Python in ra Vé trẻ em. Nếu con viết tuoi < 12 trước, bạn 4 tuổi cũng phải mua vé trẻ em.
