---
id: s3.if-else.l5
title: { vi: "Robo quyết định", en: "Robo decides" }
exercises:
  - id: s3.if-else.l5.ex1
    type: code
    concepts: [else-branch, convert-before-compare]
    prompt:
      vi: "Robo đi mua đồ chơi. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số tiền Robo có, dòng 2 là giá món đồ chơi, tính bằng nghìn đồng. Nếu đủ tiền, in ra Mua được, tiền thừa: rồi đến số tiền thừa. Nếu không đủ, in ra Chưa đủ tiền, còn thiếu: rồi đến số tiền còn thiếu. Xem cách in ở phần Ví dụ."
      en: "Robo goes to buy a toy. The Input data box has 2 lines: line 1 is the money Robo has, and line 2 is the price of the toy, in thousands of dong. If there is enough money, print Mua được, tiền thừa: and then the change. If not, print Chưa đủ tiền, còn thiếu: and then the missing amount. See how to print it in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tien = int(input())
      gia = int(input())
      if tien >= gia:
          print("Mua được, tiền thừa:", tien - gia)
      else:
          print("Chưa đủ tiền, còn thiếu:", gia - tien)
    tests:
      - input: "50\n35"
        output: "Mua được, tiền thừa: 15"
      - input: "20\n35"
        output: "Chưa đủ tiền, còn thiếu: 15"
        hidden: true
      - input: "35\n35"
        output: "Mua được, tiền thừa: 0"
        hidden: true
    common_wrong:
      - test: 2
        output: "Chưa đủ tiền, còn thiếu: 0"
        misconception: compare-ops
        sample: |
          tien = int(input())
          gia = int(input())
          if tien > gia:
              print("Mua được, tiền thừa:", tien - gia)
          else:
              print("Chưa đủ tiền, còn thiếu:", gia - tien)
    hints:
      - { vi: "Đổi cả 2 dòng nhập sang số bằng int(). Robo mua được khi số tiền lớn hơn hoặc bằng giá, kể cả khi vừa đủ. Tiền thừa là tien - gia, còn thiếu là gia - tien.", en: "Change both input lines into numbers with int(). Robo can buy the toy when the money is greater than or equal to the price, even when it is just enough. The change is tien - gia, and the missing amount is gia - tien." }
      - { vi: "Sau 2 dòng đọc tien và gia, viết if tien >= gia:. Nhánh if là print(\"Mua được, tiền thừa:\", tien - gia). Nhánh else là print(\"Chưa đủ tiền, còn thiếu:\", gia - tien).", en: "After the 2 lines that read tien and gia, write if tien >= gia:. The if branch is print(\"Mua được, tiền thừa:\", tien - gia). The else branch is print(\"Chưa đủ tiền, còn thiếu:\", gia - tien)." }
    test_eligible: true
  - id: s3.if-else.l5.ex2
    type: code
    concepts: [else-branch, convert-before-compare]
    prompt:
      vi: "Robo chấm bài kiểm tra có 2 phần. Ô Dữ liệu nhập có 2 dòng: điểm phần 1 và điểm phần 2, là số nguyên. Hãy in ra dòng Tổng điểm: cùng với tổng 2 phần. Sau đó, nếu tổng từ 10 trở lên thì in ra Đạt, nếu không thì in ra Chưa đạt, đúng như phần Ví dụ."
      en: "Robo marks a test with 2 parts. The Input data box has 2 lines: the score of part 1 and the score of part 2, as integers. Print the line Tổng điểm: with the total of the 2 parts. Then, if the total is 10 or more, print Đạt, and if not, print Chưa đạt, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      diem_1 = int(input())
      diem_2 = int(input())
      tong = diem_1 + diem_2
      print("Tổng điểm:", tong)
      if tong >= 10:
          print("Đạt")
      else:
          print("Chưa đạt")
    tests:
      - input: "6\n7"
        output: |
          Tổng điểm: 13
          Đạt
      - input: "4\n5"
        output: |
          Tổng điểm: 9
          Chưa đạt
        hidden: true
      - input: "5\n5"
        output: |
          Tổng điểm: 10
          Đạt
        hidden: true
    common_wrong:
      - test: 2
        output: |
          Tổng điểm: 10
          Chưa đạt
        misconception: compare-ops
        sample: |
          diem_1 = int(input())
          diem_2 = int(input())
          tong = diem_1 + diem_2
          print("Tổng điểm:", tong)
          if tong > 10:
              print("Đạt")
          else:
              print("Chưa đạt")
    hints:
      - { vi: "Đọc 2 điểm bằng int(input()) để cộng được như số. Cất tổng vào 1 biến, in nó ra, rồi so sánh tổng với 10 bằng >=, vì đúng 10 điểm là Đạt.", en: "Read the 2 scores with int(input()) so that they add up as numbers. Store the total in a variable, print it, then compare the total with 10 using >=, because exactly 10 points is a pass." }
      - { vi: "Dòng 3 là tong = diem_1 + diem_2, dòng 4 là print(\"Tổng điểm:\", tong). Dòng 5 là if tong >= 10:, rồi đến nhánh in Đạt, dòng else: và nhánh in Chưa đạt.", en: "Line 3 is tong = diem_1 + diem_2, and line 4 is print(\"Tổng điểm:\", tong). Line 5 is if tong >= 10:, then the branch that prints Đạt, the line else:, and the branch that prints Chưa đạt." }
    test_eligible: true
  - id: s3.if-else.l5.ex3
    type: code
    concepts: [else-branch]
    prompt:
      vi: "Thư viện mở cửa lúc 8 giờ sáng. Ô Dữ liệu nhập có 1 dòng: giờ con đến thư viện vào buổi sáng, là số nguyên từ 5 đến 11. Nếu con đến từ 8 giờ trở đi, in ra Thư viện đang mở cửa. Nếu con đến sớm hơn, in ra Thư viện chưa mở, con chờ thêm, rồi số giờ phải chờ, rồi chữ giờ, như phần Ví dụ."
      en: "The library opens at 8 in the morning. The Input data box has 1 line: the hour you arrive at the library in the morning, an integer from 5 to 11. If you arrive at 8 or later, print Thư viện đang mở cửa. If you arrive earlier, print Thư viện chưa mở, con chờ thêm, then the number of hours to wait, then the word giờ, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      gio = int(input())
      if gio >= 8:
          print("Thư viện đang mở cửa")
      else:
          print("Thư viện chưa mở, con chờ thêm", 8 - gio, "giờ")
    tests:
      - input: "6"
        output: "Thư viện chưa mở, con chờ thêm 2 giờ"
      - input: "8"
        output: "Thư viện đang mở cửa"
        hidden: true
      - input: "10"
        output: "Thư viện đang mở cửa"
        hidden: true
      - input: "7"
        output: "Thư viện chưa mở, con chờ thêm 1 giờ"
        hidden: true
    hints:
      - { vi: "Đến từ 8 giờ trở đi là gio >= 8. Số giờ phải chờ là 8 - gio. Trong lệnh print, con dùng dấu phẩy để in chữ, phép tính và chữ giờ trên cùng 1 dòng.", en: "Arriving at 8 or later is gio >= 8. The number of hours to wait is 8 - gio. In the print statement, use commas to print the text, the calculation and the word giờ on the same line." }
      - { vi: "Dòng 1 là gio = int(input()), dòng 2 là if gio >= 8:. Nhánh else là print(\"Thư viện chưa mở, con chờ thêm\", 8 - gio, \"giờ\").", en: "Line 1 is gio = int(input()), and line 2 is if gio >= 8:. The else branch is print(\"Thư viện chưa mở, con chờ thêm\", 8 - gio, \"giờ\")." }
    test_eligible: true
  - id: s3.if-else.l5.q1
    type: predict
    concepts: [else-branch]
    code: |
      money = 20
      price = 25
      if money >= price:
          print("buy")
      else:
          print("need", price - money)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "buy", misconception: compare-ops }
      - { text: "buy\nneed 5", misconception: else-branch }
      - { text: "need price - money", misconception: string-quotes }
      - { text: "need 5", correct: true }
    explanation:
      vi: "20 không lớn hơn hoặc bằng 25, nên điều kiện là False và chỉ nhánh else chạy. Python tính price - money được 5, rồi in ra need 5. price - money không có dấu nháy, nên đó là 1 phép tính chứ không phải chữ."
      en: "20 is not greater than or equal to 25, so the condition is False and only the else branch runs. Python works out price - money, which is 5, then prints need 5. price - money has no quotes, so it is a calculation, not text."
---
Nhiều bài toán của Robo được giải theo 3 bước: **đọc** dữ liệu (đổi sang số nếu cần), **so sánh** bằng lệnh if, rồi **in** câu trả lời ở mỗi nhánh. Robo cần ít nhất 30 phần trăm pin để đi đến công viên:

```python run
pin = int("45")  # giống như con gõ 45
if pin >= 30:
    print("Robo đi được, pin còn lại:", pin - 30)
else:
    print("Robo cần sạc thêm", 30 - pin, "phần trăm")
```

Mỗi nhánh có thể in cả kết quả của 1 phép tính. Ở đây Python in ra: Robo đi được, pin còn lại: 15.
---
Muốn biết chương trình đúng chưa, con thử với nhiều dữ liệu: 1 số cho nhánh if, 1 số cho nhánh else, và 1 số đúng ở **ranh giới**. Ranh giới là số nằm ngay chỗ điều kiện đổi từ đúng sang sai:

```python run
pin = 30  # thử đúng ranh giới
if pin >= 30:
    print("Robo đi được")
else:
    print("Robo cần sạc thêm")
```

Với đúng 30 phần trăm, Robo vẫn đi được. Nếu con viết nhầm `pin > 30`, chỉ lần thử ranh giới này mới thấy lỗi. Khi chấm bài, Robo cũng thử nhiều dữ liệu như vậy, kể cả các test ẩn.
---
Điều kiện có thể chứa phép tính. Python tính trước, rồi mới so sánh:

```python run
so_banh = 14
so_ban = 4
if so_banh % so_ban == 0:
    print("Chia đều được")
else:
    print("Còn dư", so_banh % so_ban, "cái bánh")
```

14 chia 4 dư 2, nên điều kiện là False. Python in ra: Còn dư 2 cái bánh.
