---
id: s3.bai-toan.l1
title: { vi: "Chẵn hay lẻ?", en: "Even or odd?" }
exercises:
  - id: s3.bai-toan.l1.ex1
    type: code
    concepts: [divisible-check]
    prompt:
      vi: "Robo xếp bánh vào hộp, mỗi hộp đựng đúng 6 cái. Ô Dữ liệu nhập có 1 dòng: số bánh, là số nguyên. Nếu số bánh chia hết cho 6, in ra Vừa đủ các hộp. Nếu không, in ra Còn bánh lẻ. Hãy in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo puts cakes into boxes, and each box holds exactly 6. The Input data box has 1 line: the number of cakes, an integer. If the number of cakes can be divided by 6, print Vừa đủ các hộp. If not, print Còn bánh lẻ. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so_banh = int(input())
      if so_banh % 6 == 0:
          print("Vừa đủ các hộp")
      else:
          print("Còn bánh lẻ")
    tests:
      - input: "18"
        output: "Vừa đủ các hộp"
      - input: "6"
        output: "Vừa đủ các hộp"
        hidden: true
      - input: "13"
        output: "Còn bánh lẻ"
        hidden: true
      - input: "23"
        output: "Còn bánh lẻ"
        hidden: true
      - input: "20"
        output: "Còn bánh lẻ"
        hidden: true
    common_wrong:
      - test: 3
        output: "Vừa đủ các hộp"
        misconception: divisible-check
        sample: |
          so_banh = int(input())
          if so_banh % 6 == 1:
              print("Còn bánh lẻ")
          else:
              print("Vừa đủ các hộp")
      - test: 0
        output: "Còn bánh lẻ"
        misconception: modulo
        sample: |
          so_banh = int(input())
          if so_banh / 6 == 0:
              print("Vừa đủ các hộp")
          else:
              print("Còn bánh lẻ")
    hints:
      - { vi: "Số bánh chia hết cho 6 khi số dư của phép chia cho 6 bằng 0, viết là so_banh % 6 == 0. Con so sánh số dư với 0, không so sánh với 1, vì số dư có thể là 1, 2, 3, 4 hoặc 5.", en: "The number of cakes can be divided by 6 when the remainder of dividing by 6 is 0, written so_banh % 6 == 0. Compare the remainder with 0, not with 1, because the remainder can be 1, 2, 3, 4 or 5." }
      - { vi: "Dòng 1 là so_banh = int(input()). Dòng 2 là if so_banh % 6 == 0:. Sau đó là nhánh in Vừa đủ các hộp, dòng else:, và nhánh in Còn bánh lẻ.", en: "Line 1 is so_banh = int(input()). Line 2 is if so_banh % 6 == 0:. Then come the branch that prints Vừa đủ các hộp, the line else:, and the branch that prints Còn bánh lẻ." }
    test_eligible: true
  - id: s3.bai-toan.l1.ex2
    type: code
    concepts: [divisible-check, condition-order]
    prompt:
      vi: "Robo chơi trò Bùm Chíu với con. Ô Dữ liệu nhập có 1 dòng: 1 số nguyên dương. Nếu số đó chia hết cho cả 3 và 5, in ra Bùm Chíu. Nếu chỉ chia hết cho 3, in ra Bùm. Nếu chỉ chia hết cho 5, in ra Chíu. Nếu không chia hết cho 3, cũng không chia hết cho 5, in ra chính số đó. Hãy in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo plays the game Bùm Chíu with you. The Input data box has 1 line: a positive integer. If the number can be divided by both 3 and 5, print Bùm Chíu. If it can be divided only by 3, print Bùm. If only by 5, print Chíu. If it can be divided by neither 3 nor 5, print the number itself. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      if so % 3 == 0 and so % 5 == 0:
          print("Bùm Chíu")
      elif so % 3 == 0:
          print("Bùm")
      elif so % 5 == 0:
          print("Chíu")
      else:
          print(so)
    tests:
      - input: "9"
        output: "Bùm"
      - input: "15"
        output: "Bùm Chíu"
        hidden: true
      - input: "10"
        output: "Chíu"
        hidden: true
      - input: "7"
        output: "7"
        hidden: true
      - input: "30"
        output: "Bùm Chíu"
        hidden: true
      - input: "8"
        output: "8"
        hidden: true
    common_wrong:
      - test: 1
        output: "Bùm"
        misconception: condition-order
        sample: |
          so = int(input())
          if so % 3 == 0:
              print("Bùm")
          elif so % 5 == 0:
              print("Chíu")
          elif so % 3 == 0 and so % 5 == 0:
              print("Bùm Chíu")
          else:
              print(so)
    hints:
      - { vi: "Có 4 trường hợp, nên con dùng if, 2 lần elif và else. Trường hợp chia hết cho cả 3 và 5 phải đứng đầu tiên: nếu so % 3 == 0 đứng trước, Python dừng ở đó với số 15 và in ra Bùm.", en: "There are 4 cases, so use if, elif twice and else. The case divisible by both 3 and 5 must come first: if so % 3 == 0 comes first, Python stops there for the number 15 and prints Bùm." }
      - { vi: "Dòng 2 là if so % 3 == 0 and so % 5 == 0:. Tiếp theo là elif so % 3 == 0:, rồi elif so % 5 == 0:, rồi else:. Nhánh else in ra chính số đó bằng print(so).", en: "Line 2 is if so % 3 == 0 and so % 5 == 0:. Next come elif so % 3 == 0:, then elif so % 5 == 0:, then else:. The else branch prints the number itself with print(so)." }
    test_eligible: true
  - id: s3.bai-toan.l1.q1
    type: predict
    concepts: [divisible-check]
    code: |
      n = 11
      if n % 3 == 0:
          print("yes")
      else:
          print("no")
      print(n % 3)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "no\n1", misconception: divisible-check }
      - { text: "no\n3", misconception: modulo }
      - { text: "no\n2", correct: true }
      - { vi: "Báo lỗi SyntaxError ở dòng 2, vì dòng if không dùng được phép %", en: "A SyntaxError on line 2, because an if line cannot use %", error: true, misconception: divisible-check }
    explanation:
      vi: "11 chia 3 được 3, còn dư 2, vì 3 * 3 = 9 và 11 - 9 = 2. Số dư khác 0, nên điều kiện là False và Python in ra no. Sau đó print(n % 3) in ra số dư là 2, không phải 1: khi chia cho 3, số dư có thể là 1 hoặc 2. Số 3 là kết quả của 11 // 3. Dòng if dùng được phép % như mọi phép tính khác."
      en: "11 divided by 3 is 3 with a remainder of 2, because 3 * 3 = 9 and 11 - 9 = 2. The remainder is not 0, so the condition is False and Python prints no. Then print(n % 3) shows the remainder, 2, not 1: when you divide by 3, the remainder can be 1 or 2. The number 3 is the result of 11 // 3. An if line can use % like any other operation."
  - id: s3.bai-toan.l1.q2
    type: mcq
    concepts: [divisible-check, and-both]
    prompt:
      vi: "Điều kiện nào là True khi n chia hết cho cả 3 và 5, và False trong mọi trường hợp khác?"
      en: "Which condition is True when n can be divided by both 3 and 5, and False in every other case?"
    choices:
      - { text: "n % 3 == 0 and n % 5 == 0", correct: true }
      - { text: "n % 3 == 0 or n % 5 == 0", misconception: or-either }
      - { text: "n % 3 == 0 and 5", misconception: or-misuse }
      - { text: "n % 3 == 0 and n % 5 == 1", misconception: divisible-check }
    explanation:
      vi: "Chia hết cho 3 là n % 3 == 0, chia hết cho 5 là n % 5 == 0, và \"cả 2\" là and. Với or, điều kiện đã đúng khi n chỉ chia hết cho 1 trong 2 số, như 9. Bên phải and phải là 1 phép so sánh đầy đủ, không chỉ là số 5. Còn n % 5 == 1 hỏi số dư bằng 1, tức là n không chia hết cho 5."
      en: "Divisible by 3 is n % 3 == 0, divisible by 5 is n % 5 == 0, and \"both\" is and. With or, the condition is already True when n can be divided by only 1 of the 2 numbers, like 9. The right side of and must be a full comparison, not just the number 5. And n % 5 == 1 asks for a remainder of 1, which means n cannot be divided by 5."
---
Ở giai đoạn 2, con đã học phép `%` cho ra số dư. Khi số dư bằng 0, ta nói số đó **chia hết**. Ví dụ, 12 chia 3 được 4, không dư, nên 12 chia hết cho 3. Trong Python, con hỏi "số kẹo có chia hết cho 3 không?" bằng điều kiện `so_keo % 3 == 0`:

```python run
so_keo = 12
if so_keo % 3 == 0:
    print("Chia đều cho 3 bạn, không thừa viên nào")
else:
    print("Chia cho 3 bạn thì còn thừa kẹo")
```

12 % 3 ra 0, nên điều kiện là True và Python chạy nhánh if. Con thử đổi so_keo thành 13 rồi chạy lại.
---
Số **chẵn** là số chia hết cho 2: `n % 2 == 0`. Cách hỏi này dùng được với mọi số: chia hết cho 5 là `n % 5 == 0`, chia hết cho 10 là `n % 10 == 0`:

```python run
so = 15
print("Chẵn:", so % 2 == 0)
print("Chia hết cho 3:", so % 3 == 0)
print("Chia hết cho 5:", so % 5 == 0)
```

15 là số lẻ, nhưng 15 chia hết cho 3 và cho 5, nên Python in ra False, rồi True, rồi True. Python làm phép `%` trước, rồi mới so sánh kết quả với 0.
---
Muốn hỏi "**không** chia hết cho 3", nhiều bạn viết `so % 3 == 1`. Cách này sai, vì khi chia cho 3, số dư có thể là 1 hoặc 2:

```python run
so = 8
print(so % 3)
print(so % 3 == 1)
print(so % 3 != 0)
```

8 chia 3 được 2, còn dư 2, nên `so % 3 == 1` là False, dù 8 không chia hết cho 3. Con luôn so sánh số dư với 0: chia hết là `== 0`, không chia hết là `!= 0`. Riêng khi chia cho 2, số dư chỉ có thể là 0 hoặc 1, nên số lẻ có `n % 2 == 1`.
