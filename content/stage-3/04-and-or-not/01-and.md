---
id: s3.logic.l1
title: { vi: "Cả hai đều đúng: and", en: "Both true: and" }
exercises:
  - id: s3.logic.l1.ex1
    type: code
    concepts: [and-both]
    prompt:
      vi: "Bể bơi lớn chỉ cho con vào khi con từ 10 tuổi trở lên và bơi được ít nhất 25 mét. Ô Dữ liệu nhập có 2 dòng: dòng 1 là tuổi của con, dòng 2 là số mét con bơi được. Cả 2 đều là số nguyên. Nếu đủ cả 2 điều kiện, in ra Con được vào bể bơi lớn. Nếu không, in ra Con bơi ở bể nhỏ nhé. Hãy dùng and để in ra đúng 1 dòng như phần Ví dụ."
      en: "The big pool lets you in only when you are 10 or older and can swim at least 25 metres. The Input data box has 2 lines: line 1 is your age, and line 2 is how many metres you can swim. Both are integers. If both conditions are met, print Con được vào bể bơi lớn. If not, print Con bơi ở bể nhỏ nhé. Use and to print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tuoi = int(input())
      so_met = int(input())
      if tuoi >= 10 and so_met >= 25:
          print("Con được vào bể bơi lớn")
      else:
          print("Con bơi ở bể nhỏ nhé")
    tests:
      - input: "11\n30"
        output: "Con được vào bể bơi lớn"
      - input: "10\n25"
        output: "Con được vào bể bơi lớn"
        hidden: true
      - input: "9\n50"
        output: "Con bơi ở bể nhỏ nhé"
        hidden: true
      - input: "12\n24"
        output: "Con bơi ở bể nhỏ nhé"
        hidden: true
      - input: "8\n10"
        output: "Con bơi ở bể nhỏ nhé"
        hidden: true
    common_wrong:
      - test: 1
        output: "Con bơi ở bể nhỏ nhé"
        misconception: boundary-check
        sample: |
          tuoi = int(input())
          so_met = int(input())
          if tuoi > 10 and so_met > 25:
              print("Con được vào bể bơi lớn")
          else:
              print("Con bơi ở bể nhỏ nhé")
    hints:
      - { vi: "\"Từ 10 tuổi trở lên\" là tuoi >= 10, \"ít nhất 25 mét\" là so_met >= 25. Con nối 2 điều kiện bằng and, vì con cần cả 2 điều kiện cùng đúng.", en: "\"10 or older\" is tuoi >= 10, and \"at least 25 metres\" is so_met >= 25. Join the 2 conditions with and, because you need both of them to be True." }
      - { vi: "Dòng 1 là tuoi = int(input()), dòng 2 là so_met = int(input()). Dòng 3 là if tuoi >= 10 and so_met >= 25:. Sau đó là nhánh in Con được vào bể bơi lớn, dòng else:, và nhánh in Con bơi ở bể nhỏ nhé.", en: "Line 1 is tuoi = int(input()), and line 2 is so_met = int(input()). Line 3 is if tuoi >= 10 and so_met >= 25:. Then come the branch that prints Con được vào bể bơi lớn, the line else:, and the branch that prints Con bơi ở bể nhỏ nhé." }
    test_eligible: true
  - id: s3.logic.l1.ex2
    type: code
    concepts: [and-both]
    prompt:
      vi: "Robo chia các bạn thành 2 đội bằng nhau để chơi kéo co. Muốn chơi được, số bạn phải từ 10 trở lên và là số chẵn. Ô Dữ liệu nhập có 1 dòng: số bạn. Hãy in ra Chơi kéo co được: rồi True hoặc False, như phần Ví dụ."
      en: "Robo splits the children into 2 equal teams for a tug of war. To play, the number of children must be 10 or more and an even number. The Input data box has 1 line: the number of children. Print Chơi kéo co được: and then True or False, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so_ban = int(input())
      print("Chơi kéo co được:", so_ban >= 10 and so_ban % 2 == 0)
    tests:
      - input: "12"
        output: "Chơi kéo co được: True"
      - input: "10"
        output: "Chơi kéo co được: True"
        hidden: true
      - input: "11"
        output: "Chơi kéo co được: False"
        hidden: true
      - input: "8"
        output: "Chơi kéo co được: False"
        hidden: true
      - input: "7"
        output: "Chơi kéo co được: False"
        hidden: true
    common_wrong:
      - test: 1
        output: "Chơi kéo co được: False"
        misconception: boundary-check
        sample: |
          so_ban = int(input())
          print("Chơi kéo co được:", so_ban > 10 and so_ban % 2 == 0)
    hints:
      - { vi: "Số chẵn là số chia 2 dư 0, viết là so_ban % 2 == 0. \"Từ 10 trở lên\" là so_ban >= 10. Nối 2 phép so sánh bằng and, và Python cho ra True hoặc False.", en: "An even number has remainder 0 when divided by 2, written so_ban % 2 == 0. \"10 or more\" is so_ban >= 10. Join the 2 comparisons with and, and Python gives True or False." }
      - { vi: "Dòng 1 là so_ban = int(input()). Dòng 2 in ra chuỗi \"Chơi kéo co được:\", dấu phẩy, rồi so_ban >= 10 and so_ban % 2 == 0, tất cả trong 1 lệnh print.", en: "Line 1 is so_ban = int(input()). Line 2 prints the string \"Chơi kéo co được:\", a comma, and then so_ban >= 10 and so_ban % 2 == 0, all in 1 print statement." }
    test_eligible: true
  - id: s3.logic.l1.q1
    type: predict
    concepts: [and-both]
    code: |
      a = 7
      b = 3
      if a > 5 and b > 5:
          print("yes")
      else:
          print("no")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "yes", misconception: and-both }
      - { text: "no", correct: true }
      - { text: "yes\nno", misconception: else-branch }
      - { vi: "Báo lỗi SyntaxError ở dòng 3, vì 1 dòng if chỉ được có 1 điều kiện", en: "A SyntaxError on line 3, because an if line can have only 1 condition", error: true, misconception: and-both }
    explanation:
      vi: "a > 5 là True, nhưng b > 5 là False, vì 3 không lớn hơn 5. Với and, chỉ cần 1 bên là False thì cả điều kiện là False, nên Python chạy nhánh else và in ra no. Dòng if được nối nhiều điều kiện bằng and, nên không có lỗi."
      en: "a > 5 is True, but b > 5 is False, because 3 is not greater than 5. With and, one False side is enough to make the whole condition False, so Python runs the else branch and prints no. An if line can join several conditions with and, so there is no error."
  - id: s3.logic.l1.q2
    type: mcq
    concepts: [and-both]
    prompt:
      vi: "A và B là 2 điều kiện. Khi nào A and B là True?"
      en: "A and B are 2 conditions. When is A and B True?"
    choices:
      - { vi: "Khi ít nhất 1 trong 2 điều kiện là True", en: "When at least 1 of the 2 conditions is True", misconception: and-both }
      - { vi: "Khi A là True, dù B là True hay False", en: "When A is True, whether B is True or False", misconception: and-both }
      - { vi: "Khi A và B giống nhau: cùng True hoặc cùng False", en: "When A and B are the same: both True or both False", misconception: and-both }
      - { vi: "Chỉ khi cả A và B đều True", en: "Only when both A and B are True", correct: true }
    explanation:
      vi: "and nghĩa là \"và\": cả 2 điều kiện phải cùng đúng. Chỉ cần 1 điều kiện là False, A and B là False. Khi A và B cùng False, A and B cũng là False."
      en: "and means both conditions must be True. If even 1 condition is False, A and B is False. When A and B are both False, A and B is False too."
---
Ở công viên, tàu lượn có 2 luật: con phải từ 10 tuổi trở lên, **và** phải cao từ 130 cm trở lên. Trong Python, con nối 2 điều kiện bằng từ **and**, nghĩa là "và":

```python run
tuoi = 11
chieu_cao = 125
if tuoi >= 10 and chieu_cao >= 130:
    print("Con được chơi tàu lượn")
else:
    print("Con chưa được chơi tàu lượn")
```

Con đủ tuổi, nhưng chưa đủ cao, nên Python in ra Con chưa được chơi tàu lượn. Con thử đổi chieu_cao thành 135 rồi chạy lại.
---
Điều kiện có and chỉ là True khi **cả 2 bên đều True**. Chỉ cần 1 bên là False, cả điều kiện là False:

```python run
print(True and True)
print(True and False)
print(False and True)
print(False and False)
```

Python in ra True, rồi 3 lần False. Vì vậy, khi thử 1 chương trình có and, con thử đủ các trường hợp: cả 2 bên đúng, chỉ bên trái đúng, chỉ bên phải đúng, và cả 2 bên sai.
---
Con đã biết cất kết quả so sánh vào biến. Sau if, con có thể viết thẳng 1 **biến bool**: `if du_tuoi:` chạy khối lệnh khi du_tuoi là True. Con cũng nối được 2 biến bool bằng and:

```python run
tuoi = 12
chieu_cao = 140
du_tuoi = tuoi >= 10
du_cao = chieu_cao >= 130
print("Đủ tuổi:", du_tuoi)
print("Đủ cao:", du_cao)
if du_tuoi and du_cao:
    print("Con được chơi tàu lượn")
```

Cả du_tuoi và du_cao đều là True, nên Python in ra Con được chơi tàu lượn. Dòng `if du_tuoi and du_cao:` đọc lên giống 1 câu: nếu đủ tuổi và đủ cao.
