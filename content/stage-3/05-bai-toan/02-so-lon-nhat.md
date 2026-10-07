---
id: s3.bai-toan.l2
title: { vi: "Số lớn nhất", en: "The largest number" }
exercises:
  - id: s3.bai-toan.l2.ex1
    type: code
    concepts: [max-by-compare]
    prompt:
      vi: "Mỗi bạn được ném bóng vào rổ 2 lượt, và Robo ghi lại điểm của lượt cao hơn. Ô Dữ liệu nhập có 2 dòng: điểm lượt 1 và điểm lượt 2, đều là số nguyên. Hãy dùng if để in ra Điểm của con: rồi điểm cao hơn, như phần Ví dụ. Nếu 2 lượt bằng điểm nhau, in ra điểm đó."
      en: "Each child throws the ball at the basket in 2 turns, and Robo records the score of the better turn. The Input data box has 2 lines: the score of turn 1 and the score of turn 2, both integers. Use if to print Điểm của con: and then the higher score, as in the Example. If the 2 turns have the same score, print that score."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      luot_1 = int(input())
      luot_2 = int(input())
      if luot_1 > luot_2:
          print("Điểm của con:", luot_1)
      else:
          print("Điểm của con:", luot_2)
    tests:
      - input: "6\n9"
        output: "Điểm của con: 9"
      - input: "8\n3"
        output: "Điểm của con: 8"
        hidden: true
      - input: "7\n7"
        output: "Điểm của con: 7"
        hidden: true
      - input: "0\n5"
        output: "Điểm của con: 5"
        hidden: true
    common_wrong:
      - test: 0
        output: "Điểm của con: 6"
        misconception: max-by-compare
        sample: |
          luot_1 = int(input())
          luot_2 = int(input())
          if luot_1 < luot_2:
              print("Điểm của con:", luot_1)
          else:
              print("Điểm của con:", luot_2)
    hints:
      - { vi: "So sánh 2 điểm bằng if luot_1 > luot_2:. Nếu điều kiện đúng, lượt 1 cao hơn. Nếu sai, lượt 2 cao hơn hoặc bằng lượt 1, nên nhánh else in ra luot_2.", en: "Compare the 2 scores with if luot_1 > luot_2:. If the condition is True, turn 1 is higher. If it is False, turn 2 is higher or the same, so the else branch prints luot_2." }
      - { vi: "Dòng 1 và dòng 2 đọc 2 điểm bằng int(input()). Dòng 3 là if luot_1 > luot_2:. Sau đó là nhánh print(\"Điểm của con:\", luot_1), dòng else:, và nhánh print(\"Điểm của con:\", luot_2).", en: "Lines 1 and 2 read the 2 scores with int(input()). Line 3 is if luot_1 > luot_2:. Then come the branch print(\"Điểm của con:\", luot_1), the line else:, and the branch print(\"Điểm của con:\", luot_2)." }
    test_eligible: true
  - id: s3.bai-toan.l2.ex2
    type: code
    concepts: [max-by-compare]
    prompt:
      vi: "Ba bạn An, Bình và Chi thi gấp hạc giấy. Ô Dữ liệu nhập có 3 dòng: số hạc của An, của Bình và của Chi, đều là số nguyên. Hãy dùng if để tìm số hạc nhiều nhất, rồi in ra Nhiều nhất: và số đó, như phần Ví dụ. Có thể có 2 hay 3 bạn gấp được số hạc bằng nhau."
      en: "Three children, An, Bình and Chi, have a paper crane folding contest. The Input data box has 3 lines: the number of cranes of An, of Bình and of Chi, all integers. Use if to find the largest number of cranes, then print Nhiều nhất: and that number, as in the Example. 2 or 3 children may fold the same number of cranes."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      an = int(input())
      binh = int(input())
      chi = int(input())
      lon_nhat = an
      if binh > lon_nhat:
          lon_nhat = binh
      if chi > lon_nhat:
          lon_nhat = chi
      print("Nhiều nhất:", lon_nhat)
    tests:
      - input: "5\n9\n2"
        output: "Nhiều nhất: 9"
      - input: "8\n3\n6"
        output: "Nhiều nhất: 8"
        hidden: true
      - input: "4\n7\n10"
        output: "Nhiều nhất: 10"
        hidden: true
      - input: "9\n9\n5"
        output: "Nhiều nhất: 9"
        hidden: true
      - input: "6\n2\n6"
        output: "Nhiều nhất: 6"
        hidden: true
      - input: "3\n8\n8"
        output: "Nhiều nhất: 8"
        hidden: true
      - input: "7\n7\n7"
        output: "Nhiều nhất: 7"
        hidden: true
    common_wrong:
      - test: 3
        output: "Nhiều nhất: 5"
        misconception: max-by-compare
        sample: |
          an = int(input())
          binh = int(input())
          chi = int(input())
          if an > binh and an > chi:
              lon_nhat = an
          elif binh > an and binh > chi:
              lon_nhat = binh
          else:
              lon_nhat = chi
          print("Nhiều nhất:", lon_nhat)
      - test: 2
        output: "Nhiều nhất: 7"
        misconception: elif-vs-if
        sample: |
          an = int(input())
          binh = int(input())
          chi = int(input())
          lon_nhat = an
          if binh > lon_nhat:
              lon_nhat = binh
          elif chi > lon_nhat:
              lon_nhat = chi
          print("Nhiều nhất:", lon_nhat)
    hints:
      - { vi: "Con có thể dùng biến lon_nhat cập nhật dần: lúc đầu lon_nhat = an, rồi dùng 2 lệnh if riêng để so sánh lon_nhat với binh và với chi. Hoặc con dùng if, elif, else với dấu >=, để chương trình đúng cả khi có số bằng nhau.", en: "You can use a variable lon_nhat that you update step by step: first lon_nhat = an, then use 2 separate if statements to compare lon_nhat with binh and with chi. Or use if, elif, else with >=, so that the program also works when some numbers are equal." }
      - { vi: "Sau 3 dòng đọc dữ liệu, viết lon_nhat = an. Tiếp theo là if binh > lon_nhat: với dòng lon_nhat = binh thụt lề, rồi if chi > lon_nhat: với dòng lon_nhat = chi thụt lề. Dòng cuối là print(\"Nhiều nhất:\", lon_nhat).", en: "After the 3 input lines, write lon_nhat = an. Next comes if binh > lon_nhat: with the line lon_nhat = binh indented, then if chi > lon_nhat: with the line lon_nhat = chi indented. The last line is print(\"Nhiều nhất:\", lon_nhat)." }
    test_eligible: true
  - id: s3.bai-toan.l2.q1
    type: predict
    concepts: [max-by-compare]
    code: |
      a = 4
      b = 9
      c = 6
      big = a
      if b > big:
          big = b
      if c > big:
          big = c
      print(big)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "6", misconception: max-by-compare }
      - { text: "9", correct: true }
      - { text: "4", misconception: var-reassign }
      - { vi: "Báo lỗi, vì biến big được gán nhiều lần", en: "An error, because the variable big is assigned several times", error: true, misconception: var-reassign }
    explanation:
      vi: "Lúc đầu big là 4. 9 > 4 là True, nên big đổi thành 9. Sau đó Python so sánh c với big, lúc này là 9, không phải 4: 6 > 9 là False, nên big vẫn là 9. Gán lại 1 biến nhiều lần là bình thường, và biến luôn giữ giá trị được gán sau cùng."
      en: "At first big is 4. 9 > 4 is True, so big changes to 9. Then Python compares c with big, which is now 9, not 4: 6 > 9 is False, so big stays 9. Assigning a variable several times is normal, and the variable always keeps the last value assigned."
  - id: s3.bai-toan.l2.q2
    type: mcq
    concepts: [max-by-compare]
    code: |
      if a > b and a > c:
          print(a)
      elif b > a and b > c:
          print(b)
      else:
          print(c)
    prompt:
      vi: "Đoạn code này muốn in ra số lớn nhất của a, b và c. Với giá trị nào của a, b, c thì đoạn code in sai?"
      en: "This code is meant to print the largest of a, b and c. For which values of a, b, c does the code print the wrong number?"
    choices:
      - { text: "a = 9, b = 5, c = 2", misconception: max-by-compare }
      - { text: "a = 2, b = 9, c = 5", misconception: max-by-compare }
      - { text: "a = 2, b = 5, c = 9", misconception: max-by-compare }
      - { text: "a = 9, b = 9, c = 2", correct: true }
    explanation:
      vi: "Khi a và b cùng là 9, a > b là False và b > a cũng là False, vì 9 không lớn hơn chính nó. Cả 2 điều kiện đều False, nên Python chạy nhánh else và in ra 2. Đoạn code chỉ in sai khi a và b bằng nhau và cùng lớn hơn c, như ở đây. Với 3 số khác nhau, đoạn code in đúng. Đổi mọi dấu > thành >= thì đoạn code đúng với mọi trường hợp."
      en: "When a and b are both 9, a > b is False and b > a is also False, because 9 is not greater than itself. Both conditions are False, so Python runs the else branch and prints 2. The code prints the wrong number only when a and b are equal and both larger than c, as here. With 3 different numbers, the code prints the right number. Changing every > to >= makes the code right in every case."
---
Robo và con thi nhảy dây. Muốn biết ai nhảy được nhiều lần hơn, con **so sánh** 2 số bằng if và else, rồi cất số lớn hơn vào biến lon_nhat:

```python run
cua_robo = 35
cua_con = 42
if cua_robo > cua_con:
    lon_nhat = cua_robo
else:
    lon_nhat = cua_con
print("Nhiều lần nhất:", lon_nhat)
```

35 > 42 là False, nên Python chạy nhánh else và lon_nhat là 42. Nếu 2 số bằng nhau, Python cũng chạy nhánh else, và kết quả vẫn đúng, vì 2 số có cùng giá trị.
---
Với 3 số a, b và c, con hỏi lần lượt. Câu đầu tiên: a có lớn hơn hoặc bằng cả b và c không? Nếu không, số lớn nhất là b hoặc c, nên con chỉ cần so sánh b với c:

```python run
a = 8
b = 15
c = 11
if a >= b and a >= c:
    lon_nhat = a
elif b >= c:
    lon_nhat = b
else:
    lon_nhat = c
print("Số lớn nhất là", lon_nhat)
```

8 không lớn hơn 15, nên Python thử elif: 15 >= 11 là True, và lon_nhat là 15. Con thử đổi c thành 20 rồi chạy lại.
---
Con nhớ thử cả trường hợp có **các số bằng nhau**. Đoạn code dưới đây dùng dấu > và hỏi đủ 2 điều kiện cho từng số. Nó chạy đúng khi 3 số khác nhau, và đúng cả với nhiều trường hợp có số bằng nhau. Nó chỉ sai khi a và b bằng nhau và cùng lớn hơn c:

```python run
a = 9
b = 9
c = 5
if a > b and a > c:
    lon_nhat = a
elif b > a and b > c:
    lon_nhat = b
else:
    lon_nhat = c
print("Số lớn nhất là", lon_nhat)
```

9 > 9 là False, nên cả 2 điều kiện đều False, và Python chọn c là 5! Với dấu >=, như ở thẻ trước, `a >= b and a >= c` là True, và kết quả đúng là 9.
---
Còn 1 cách khác: dùng biến lon_nhat **cập nhật dần**. Lúc đầu, con coi a là số lớn nhất. Sau đó con so sánh lon_nhat với từng số còn lại; gặp số lớn hơn thì con đổi lon_nhat thành số đó:

```python run
a = 8
b = 15
c = 20
lon_nhat = a
if b > lon_nhat:
    lon_nhat = b
if c > lon_nhat:
    lon_nhat = c
print("Số lớn nhất là", lon_nhat)
```

Ở đây con dùng 2 lệnh if riêng, không dùng elif, vì số nào cũng phải được so sánh. Nếu viết elif, khi b > lon_nhat là True, Python bỏ qua phần so sánh c, và in ra 15 thay vì 20.
