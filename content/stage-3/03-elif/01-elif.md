---
id: s3.elif.l1
title: { vi: "Lệnh elif", en: "The elif statement" }
exercises:
  - id: s3.elif.l1.ex1
    type: code
    concepts: [elif-chain]
    prompt:
      vi: "Robo chào con theo giờ trong ngày. Ô Dữ liệu nhập có 1 dòng: giờ hiện tại, là số nguyên từ 5 đến 23. Trước 12 giờ, in ra Chào buổi sáng. Từ 12 giờ đến trước 18 giờ, in ra Chào buổi chiều. Từ 18 giờ trở đi, in ra Chào buổi tối. Hãy dùng if, elif và else để in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo greets you by the time of day. The Input data box has 1 line: the current hour, an integer from 5 to 23. Before 12 o'clock, print Chào buổi sáng. From 12 o'clock to before 18 o'clock, print Chào buổi chiều. From 18 o'clock on, print Chào buổi tối. Use if, elif and else to print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      gio = int(input())
      if gio < 12:
          print("Chào buổi sáng")
      elif gio < 18:
          print("Chào buổi chiều")
      else:
          print("Chào buổi tối")
    tests:
      - input: "9"
        output: "Chào buổi sáng"
      - input: "12"
        output: "Chào buổi chiều"
        hidden: true
      - input: "17"
        output: "Chào buổi chiều"
        hidden: true
      - input: "18"
        output: "Chào buổi tối"
        hidden: true
      - input: "21"
        output: "Chào buổi tối"
        hidden: true
    common_wrong:
      - test: 1
        output: "Chào buổi sáng"
        misconception: boundary-check
        sample: |
          gio = int(input())
          if gio <= 12:
              print("Chào buổi sáng")
          elif gio < 18:
              print("Chào buổi chiều")
          else:
              print("Chào buổi tối")
    hints:
      - { vi: "Trước 12 giờ là gio < 12. Nếu điều kiện này sai, Python thử tiếp elif. Lúc đó gio đã từ 12 trở lên, nên elif chỉ cần hỏi gio < 18. Còn lại là buổi tối, con viết trong else.", en: "Before 12 o'clock is gio < 12. If this condition is False, Python tries the elif next. By then gio is already 12 or more, so the elif only needs to ask gio < 18. What is left is the evening, which you write in the else." }
      - { vi: "Dòng 1 là gio = int(input()). Sau đó là if gio < 12:, elif gio < 18: và else:, dưới mỗi dòng là 1 lệnh print thụt lề.", en: "Line 1 is gio = int(input()). Then come if gio < 12:, elif gio < 18: and else:, each with 1 indented print statement under it." }
    test_eligible: true
  - id: s3.elif.l1.ex2
    type: code
    concepts: [elif-chain]
    prompt:
      vi: "Robo khen con theo số sao con được trong trò chơi, từ 0 đến 3 sao. Được 3 sao thì in ra Xuất sắc!, được 2 sao thì in ra Giỏi lắm!, còn lại thì in ra Con chơi lại để thêm sao nhé. Ô Dữ liệu nhập có 1 dòng: số sao. Code bên phải báo lỗi SyntaxError. Hãy sửa code để in ra đúng như phần Ví dụ."
      en: "Robo praises you by the number of stars you get in a game, from 0 to 3 stars. With 3 stars, print Xuất sắc!, with 2 stars, print Giỏi lắm!, and otherwise print Con chơi lại để thêm sao nhé. The Input data box has 1 line: the number of stars. The code on the right gives a SyntaxError. Fix the code so that it prints as in the Example."
    starter: |
      so_sao = int(input())
      if so_sao == 3:
          print("Xuất sắc!")
      else:
          print("Con chơi lại để thêm sao nhé")
      elif so_sao == 2:
          print("Giỏi lắm!")
    solution: |
      so_sao = int(input())
      if so_sao == 3:
          print("Xuất sắc!")
      elif so_sao == 2:
          print("Giỏi lắm!")
      else:
          print("Con chơi lại để thêm sao nhé")
    tests:
      - input: "3"
        output: "Xuất sắc!"
      - input: "2"
        output: "Giỏi lắm!"
        hidden: true
      - input: "1"
        output: "Con chơi lại để thêm sao nhé"
        hidden: true
      - input: "0"
        output: "Con chơi lại để thêm sao nhé"
        hidden: true
    hints:
      - { vi: "Lời báo lỗi 'elif' block follows an 'else' block nghĩa là khối elif đang đứng sau khối else. Trong 1 chuỗi, else luôn đứng cuối cùng.", en: "The error message 'elif' block follows an 'else' block means that the elif block comes after the else block. In a chain, else always comes last." }
      - { vi: "Chuyển 2 dòng else: và print(\"Con chơi lại để thêm sao nhé\") xuống dưới cùng, sau nhánh elif.", en: "Move the 2 lines else: and print(\"Con chơi lại để thêm sao nhé\") to the very bottom, after the elif branch." }
    test_eligible: true
  - id: s3.elif.l1.q1
    type: predict
    concepts: [elif-chain]
    code: |
      n = 15
      if n > 20:
          print("big")
      elif n > 10:
          print("medium")
      else:
          print("small")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "medium\nsmall", misconception: elif-chain }
      - { text: "medium", correct: true }
      - { text: "small", misconception: elif-chain }
      - { vi: "Báo lỗi SyntaxError ở dòng 4", en: "A SyntaxError on line 4", error: true, misconception: elif-chain }
    explanation:
      vi: "n bằng 15. Điều kiện n > 20 là False, nên Python thử tiếp điều kiện của elif: 15 > 10 là True. Python in ra medium và bỏ qua nhánh else, vì mỗi lần chỉ 1 nhánh chạy. elif là 1 từ của Python, nên dòng 4 không có lỗi."
      en: "n is 15. The condition n > 20 is False, so Python tries the condition of the elif next: 15 > 10 is True. Python prints medium and skips the else branch, because only 1 branch runs each time. elif is a Python word, so line 4 has no error."
  - id: s3.elif.l1.q2
    type: mcq
    concepts: [elif-chain]
    prompt:
      vi: "Câu nào nói đúng về elif?"
      en: "Which sentence about elif is true?"
    choices:
      - { vi: "elif không cần điều kiện, vì nó giống hệt như else", en: "elif needs no condition, because it is just like else", misconception: elif-chain }
      - { vi: "elif được viết sau else, ở cuối cùng của chuỗi", en: "elif is written after else, at the very end of the chain", misconception: elif-chain }
      - { vi: "Mỗi elif có điều kiện riêng và dấu hai chấm ở cuối", en: "Each elif has its own condition and a colon at the end", correct: true }
      - { vi: "Mỗi lệnh if chỉ được đi kèm nhiều nhất 1 elif", en: "Each if statement can have at most 1 elif", misconception: elif-chain }
    explanation:
      vi: "elif giống dòng if: có điều kiện riêng và dấu hai chấm ở cuối. Con viết bao nhiêu elif cũng được. Các elif luôn đứng sau if và trước else: viết elif sau else thì Python báo lỗi SyntaxError."
      en: "elif is like the if line: it has its own condition and a colon at the end. You can write as many elifs as you need. The elifs always come after the if and before the else: an elif after the else gives a SyntaxError."
---
Ở chủ đề trước, Robo chỉ chọn được 1 trong 2 việc. Khi có 3 việc để chọn, con dùng thêm **elif**. Chữ elif là viết tắt của "else if", nghĩa là "nếu không thì nếu":

```python run
nhiet_do = 26
if nhiet_do >= 30:
    print("Trời nóng, Robo bật quạt")
elif nhiet_do >= 20:
    print("Trời mát, Robo đi dạo")
else:
    print("Trời lạnh, Robo mặc áo ấm")
```

Điều kiện đầu tiên nhiet_do >= 30 là False. Python thử tiếp điều kiện của elif: 26 >= 20 là True, nên Python in ra Trời mát, Robo đi dạo.
---
Dòng `elif` viết thẳng hàng với chữ `if`. Mỗi elif có **điều kiện riêng** và dấu hai chấm ở cuối, giống dòng if. Con viết bao nhiêu elif cũng được. Phần `else:` ở cuối có thể không có:

```python run
den = "vàng"
if den == "xanh":
    print("Robo đi tiếp")
elif den == "vàng":
    print("Robo đi chậm lại")
elif den == "đỏ":
    print("Robo dừng lại")
```

Python in ra Robo đi chậm lại. Con thử đổi den thành "tím": mọi điều kiện đều sai, mà không có else, nên không dòng nào được in.
---
Trong 1 chuỗi if, elif, else, mỗi lần chạy **chỉ 1 nhánh** được chạy. Gặp điều kiện đúng, Python chạy nhánh đó, rồi bỏ qua mọi nhánh còn lại bên dưới:

```python run
pin = 90
if pin > 80:
    print("Pin đầy")
elif pin > 50:
    print("Pin còn nhiều")
else:
    print("Pin yếu")
print("Robo kiểm tra xong")
```

pin > 50 cũng đúng, nhưng Python không thử điều kiện này nữa, vì nhánh Pin đầy đã chạy. Python in ra Pin đầy, rồi in Robo kiểm tra xong, vì dòng cuối sát lề trái.
---
Thứ tự luôn là: `if` đứng đầu, sau đó là các `elif`, và `else` đứng cuối cùng. elif không đứng 1 mình được, nó luôn đi sau 1 lệnh if. Nếu con viết elif sau else, Python báo lỗi:

```python run expect-error
pin = 40
if pin > 80:
    print("Pin đầy")
else:
    print("Pin yếu")
elif pin > 30:
    print("Pin vừa")
```

Lời báo lỗi là SyntaxError: 'elif' block follows an 'else' block, nghĩa là "khối elif đứng sau khối else". Con chuyển phần else xuống cuối cùng là chạy được.
