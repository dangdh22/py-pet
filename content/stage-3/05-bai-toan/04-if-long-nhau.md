---
id: s3.bai-toan.l4
title: { vi: "if lồng nhau", en: "Nested if" }
exercises:
  - id: s3.bai-toan.l4.ex1
    type: code
    concepts: [nested-if]
    prompt:
      vi: "Thư viện của Robo cho mượn sách theo luật: phải có thẻ thư viện, và mỗi bạn chỉ được mượn tối đa 3 cuốn cùng lúc. Ô Dữ liệu nhập có 2 dòng: dòng 1 là có nếu con có thẻ, hoặc không nếu chưa có; dòng 2 là số sách con đang mượn. Chưa có thẻ thì in ra Con cần làm thẻ thư viện trước. Có thẻ và đang mượn ít hơn 3 cuốn thì in ra Con mượn thêm được 1 cuốn. Có thẻ và đang mượn từ 3 cuốn trở lên thì in ra Con trả bớt sách rồi mượn tiếp nhé. Hãy dùng if lồng nhau để in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo's library lends books by these rules: you must have a library card, and each child may borrow at most 3 books at a time. The Input data box has 2 lines: line 1 is có if you have a card, or không if you do not; line 2 is the number of books you are borrowing now. Without a card, print Con cần làm thẻ thư viện trước. With a card and fewer than 3 books, print Con mượn thêm được 1 cuốn. With a card and 3 books or more, print Con trả bớt sách rồi mượn tiếp nhé. Use a nested if to print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      co_the = input()
      dang_muon = int(input())
      if co_the == "có":
          if dang_muon < 3:
              print("Con mượn thêm được 1 cuốn")
          else:
              print("Con trả bớt sách rồi mượn tiếp nhé")
      else:
          print("Con cần làm thẻ thư viện trước")
    tests:
      - input: "có\n1"
        output: "Con mượn thêm được 1 cuốn"
      - input: "có\n2"
        output: "Con mượn thêm được 1 cuốn"
        hidden: true
      - input: "có\n3"
        output: "Con trả bớt sách rồi mượn tiếp nhé"
        hidden: true
      - input: "có\n5"
        output: "Con trả bớt sách rồi mượn tiếp nhé"
        hidden: true
      - input: "không\n0"
        output: "Con cần làm thẻ thư viện trước"
        hidden: true
      - input: "không\n4"
        output: "Con cần làm thẻ thư viện trước"
        hidden: true
    common_wrong:
      - test: 2
        output: "Con mượn thêm được 1 cuốn"
        misconception: boundary-check
        sample: |
          co_the = input()
          dang_muon = int(input())
          if co_the == "có":
              if dang_muon <= 3:
                  print("Con mượn thêm được 1 cuốn")
              else:
                  print("Con trả bớt sách rồi mượn tiếp nhé")
          else:
              print("Con cần làm thẻ thư viện trước")
    hints:
      - { vi: "if bên ngoài hỏi con có thẻ không: co_the == \"có\". Chỉ khi có thẻ, if bên trong mới hỏi số sách: dang_muon < 3. Đang mượn đúng 3 cuốn là đã đủ, nên con dùng dấu <, không dùng <=.", en: "The outer if asks whether you have a card: co_the == \"có\". Only with a card does the inner if ask about the books: dang_muon < 3. Borrowing exactly 3 books is already the limit, so use <, not <=." }
      - { vi: "Dòng 3 là if co_the == \"có\":. Thụt lề 4 dấu cách là dòng if dang_muon < 3: và dòng else: của nó, mỗi dòng có 1 lệnh print thụt lề 8 dấu cách bên dưới. Cuối cùng là else: sát lề trái, với lệnh print in lời nhắc làm thẻ thụt lề 4 dấu cách.", en: "Line 3 is if co_the == \"có\":. Indented by 4 spaces come the line if dang_muon < 3: and its line else:, each with 1 print statement indented by 8 spaces under it. Last comes else: at the left edge, with the print statement for the card reminder indented by 4 spaces." }
    test_eligible: true
  - id: s3.bai-toan.l4.ex2
    type: code
    concepts: [nested-if, indent-block]
    prompt:
      vi: "Cửa phòng của Robo có khóa 2 lớp. Ô Dữ liệu nhập có 2 dòng: dòng 1 là tên, dòng 2 là mật khẩu. Nếu tên là robo và mật khẩu là 1234, in ra Mở cửa. Nếu tên là robo mà mật khẩu sai, in ra Sai mật khẩu. Nếu tên khác robo, in ra Không có tên này. Code bên phải báo lỗi IndentationError. Hãy sửa thụt lề để in ra đúng như phần Ví dụ."
      en: "Robo's door has a 2-step lock. The Input data box has 2 lines: line 1 is a name, and line 2 is a password. If the name is robo and the password is 1234, print Mở cửa. If the name is robo but the password is wrong, print Sai mật khẩu. If the name is not robo, print Không có tên này. The code on the right gives an IndentationError. Fix the indentation so that it prints as in the Example."
    starter: |
      ten = input()
      mat_khau = input()
      if ten == "robo":
          if mat_khau == "1234":
          print("Mở cửa")
          else:
          print("Sai mật khẩu")
      else:
          print("Không có tên này")
    solution: |
      ten = input()
      mat_khau = input()
      if ten == "robo":
          if mat_khau == "1234":
              print("Mở cửa")
          else:
              print("Sai mật khẩu")
      else:
          print("Không có tên này")
    tests:
      - input: "robo\n1234"
        output: "Mở cửa"
      - input: "robo\n0000"
        output: "Sai mật khẩu"
        hidden: true
      - input: "an\n1234"
        output: "Không có tên này"
        hidden: true
      - input: "Robo\n1234"
        output: "Không có tên này"
        hidden: true
    hints:
      - { vi: "2 lệnh print của if bên trong phải thụt lề sâu hơn dòng if mat_khau == \"1234\": và dòng else: của nó. Mỗi mức thụt thêm 4 dấu cách, nên 2 lệnh print này thụt lề 8 dấu cách.", en: "The 2 print statements of the inner if must be indented deeper than the line if mat_khau == \"1234\": and its line else:. Each level adds 4 spaces, so these 2 print statements are indented by 8 spaces." }
      - { vi: "Thêm 4 dấu cách vào đầu dòng 5 và dòng 7, để 2 lệnh print này thụt lề 8 dấu cách. Các dòng khác giữ nguyên.", en: "Add 4 spaces at the start of line 5 and line 7, so that these 2 print statements are indented by 8 spaces. Keep the other lines as they are." }
    test_eligible: true
  - id: s3.bai-toan.l4.q1
    type: predict
    concepts: [nested-if]
    code: |
      a = 7
      b = 2
      if a > 5:
          if b > 5:
              print("A")
          else:
              print("B")
      else:
          print("C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "C", misconception: nested-if }
      - { text: "B", correct: true }
      - { text: "B\nC", misconception: nested-if }
      - { vi: "Không in ra gì", en: "Nothing is printed", misconception: nested-if }
    explanation:
      vi: "a > 5 là True, nên Python vào khối của if bên ngoài và hỏi tiếp b > 5. Câu này là False, nên Python chạy else thụt lề 4 dấu cách, là else của if bên trong, và in ra B. else sát lề trái đi với if bên ngoài, nên nó không chạy, vì a > 5 là True."
      en: "a > 5 is True, so Python enters the block of the outer if and asks b > 5. That is False, so Python runs the else indented by 4 spaces, which is the else of the inner if, and prints B. The else at the left edge belongs to the outer if, so it does not run, because a > 5 is True."
  - id: s3.bai-toan.l4.q2
    type: mcq
    concepts: [nested-if, and-both]
    code: |
      if x > 0:
          if y > 0:
              print("ok")
    prompt:
      vi: "Con muốn viết 2 lệnh if lồng nhau này thành 1 lệnh if, còn khối lệnh vẫn là print(\"ok\"). Dòng if nào cho cùng kết quả với mọi giá trị của x và y?"
      en: "You want to write these 2 nested if statements as 1 if statement, with print(\"ok\") still as the block. Which if line gives the same result for every value of x and y?"
    choices:
      - { text: "if x > 0 or y > 0:", misconception: or-either }
      - { text: "if x > 0:", misconception: nested-if }
      - { text: "if y > 0:", misconception: nested-if }
      - { text: "if x > 0 and y > 0:", correct: true }
    explanation:
      vi: "print(\"ok\") chỉ chạy khi cả 2 điều kiện đều đúng: x > 0 đúng thì Python mới hỏi tiếp y > 0. Vì vậy 2 lệnh if lồng nhau này giống if x > 0 and y > 0:. Với or, khối lệnh chạy cả khi chỉ 1 điều kiện đúng. Chỉ hỏi x > 0 hay chỉ hỏi y > 0 thì bỏ mất 1 điều kiện."
      en: "print(\"ok\") runs only when both conditions are True: only when x > 0 is True does Python go on to ask y > 0. So these 2 nested if statements are the same as if x > 0 and y > 0:. With or, the block would also run when only 1 condition is True. Asking only x > 0 or only y > 0 drops 1 of the conditions."
---
Đôi khi, Robo chỉ cần hỏi câu thứ hai khi câu thứ nhất đã đúng. Khi đó, con đặt 1 lệnh if **bên trong** khối lệnh của 1 lệnh if khác. Ta gọi đó là **if lồng nhau**:

```python run
troi_mua = False
nhiet_do = 32
if not troi_mua:
    print("Robo ra công viên chơi")
    if nhiet_do >= 30:
        print("Robo đội mũ cho đỡ nắng")
print("Chúc Robo vui vẻ")
```

Dòng `if nhiet_do >= 30:` thụt lề 4 dấu cách, vì nó nằm trong khối của if thứ nhất. Lệnh print bên dưới nó thụt lề **8 dấu cách**: mỗi mức thêm 4 dấu cách. Python chỉ hỏi nhiệt độ khi trời không mưa.
---
Nếu dòng bên trong if thứ hai chỉ thụt lề 4 dấu cách, Python không thấy khối lệnh nào của if thứ hai, và báo lỗi:

```python run expect-error
tuoi = 12
if tuoi >= 10:
    if tuoi >= 12:
    print("Con được chơi trò này")
```

Lời báo lỗi là IndentationError: expected an indented block after 'if' statement on line 3. Nghĩa là: sau dòng if ở dòng 3, Python chờ 1 khối lệnh thụt lề sâu hơn dòng đó. Con sửa bằng cách thụt lệnh print vào 8 dấu cách.
---
Mỗi else đi với lệnh if **thẳng hàng** với nó. Ở ví dụ này, Robo có 3 câu trả lời khác nhau:

```python run
tuoi = 11
chieu_cao = 125
if tuoi >= 10:
    if chieu_cao >= 130:
        print("Con được chơi tàu lượn")
    else:
        print("Con đủ tuổi nhưng chưa đủ cao")
else:
    print("Con chưa đủ tuổi")
```

else thụt lề 4 dấu cách đi với if bên trong: nó chạy khi con đủ tuổi mà chưa đủ cao. else sát lề trái đi với if bên ngoài: nó chạy khi con chưa đủ tuổi. Con thử đổi tuoi thành 8, rồi đổi chieu_cao thành 140, và chạy lại mỗi lần.
---
Nếu if bên trong không có else, thì 2 lệnh if lồng nhau giống hệt 1 lệnh if có and:

```python run
tuoi = 11
chieu_cao = 140
if tuoi >= 10:
    if chieu_cao >= 130:
        print("Lồng nhau: con được chơi")
if tuoi >= 10 and chieu_cao >= 130:
    print("Dùng and: con được chơi")
```

Cả 2 cách đều in ra 1 dòng. Khi chỉ cần biết cả 2 điều kiện có cùng đúng không, con dùng and cho gọn. Khi mỗi trường hợp cần 1 câu trả lời riêng, như ở thẻ trước, con dùng if lồng nhau.
