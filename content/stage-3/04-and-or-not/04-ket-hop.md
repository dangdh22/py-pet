---
id: s3.logic.l4
title: { vi: "Kết hợp điều kiện", en: "Combining conditions" }
exercises:
  - id: s3.logic.l4.ex1
    type: code
    concepts: [chained-compare]
    prompt:
      vi: "Trong trò chơi đoán số, Robo chỉ nhận các số từ 1 đến 10. Ô Dữ liệu nhập có 1 dòng: số con chọn, là số nguyên. Nếu số đó từ 1 đến 10, in ra Số hợp lệ. Nếu không, in ra Con chọn 1 số từ 1 đến 10 nhé. Hãy in ra đúng 1 dòng như phần Ví dụ."
      en: "In a guessing game, Robo only accepts numbers from 1 to 10. The Input data box has 1 line: the number you pick, an integer. If the number is from 1 to 10, print Số hợp lệ. If not, print Con chọn 1 số từ 1 đến 10 nhé. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      if 1 <= so <= 10:
          print("Số hợp lệ")
      else:
          print("Con chọn 1 số từ 1 đến 10 nhé")
    tests:
      - input: "5"
        output: "Số hợp lệ"
      - input: "1"
        output: "Số hợp lệ"
        hidden: true
      - input: "10"
        output: "Số hợp lệ"
        hidden: true
      - input: "0"
        output: "Con chọn 1 số từ 1 đến 10 nhé"
        hidden: true
      - input: "11"
        output: "Con chọn 1 số từ 1 đến 10 nhé"
        hidden: true
    common_wrong:
      - test: 1
        output: "Con chọn 1 số từ 1 đến 10 nhé"
        misconception: boundary-check
        sample: |
          so = int(input())
          if 1 < so < 10:
              print("Số hợp lệ")
          else:
              print("Con chọn 1 số từ 1 đến 10 nhé")
      - test: 3
        output: "Số hợp lệ"
        misconception: and-both
        sample: |
          so = int(input())
          if so >= 1 or so <= 10:
              print("Số hợp lệ")
          else:
              print("Con chọn 1 số từ 1 đến 10 nhé")
    hints:
      - { vi: "\"Từ 1 đến 10\" gồm cả số 1 và số 10, nên con dùng dấu <=. Con viết gọn khoảng giá trị là 1 <= so <= 10, với số nhỏ bên trái và số lớn bên phải.", en: "\"From 1 to 10\" includes both 1 and 10, so use <=. Write the range in the short form 1 <= so <= 10, with the small number on the left and the big number on the right." }
      - { vi: "Dòng 1 là so = int(input()). Dòng 2 là if 1 <= so <= 10:. Sau đó là nhánh in Số hợp lệ, dòng else:, và nhánh in lời nhắc chọn lại.", en: "Line 1 is so = int(input()). Line 2 is if 1 <= so <= 10:. Then come the branch that prints Số hợp lệ, the line else:, and the branch that prints the reminder to pick again." }
    test_eligible: true
  - id: s3.logic.l4.ex2
    type: code
    concepts: [and-both, or-either]
    prompt:
      vi: "Vào thứ ba, rạp phim của Robo bán vé giảm giá cho trẻ em dưới 12 tuổi hoặc người từ 60 tuổi trở lên. Ngày khác thì ai cũng mua vé thường. Ô Dữ liệu nhập có 2 dòng: dòng 1 là tuổi, dòng 2 là ngày trong tuần, viết chữ thường như thứ ba hay chủ nhật. In ra Vé giảm giá hoặc Vé thường, như phần Ví dụ."
      en: "On Tuesdays, Robo's cinema sells discount tickets to children under 12 or people aged 60 or older. On other days, everyone buys a normal ticket. The Input data box has 2 lines: line 1 is the age, and line 2 is the day of the week in Vietnamese, in small letters, like thứ ba (Tuesday) or chủ nhật (Sunday). Print Vé giảm giá or Vé thường, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tuoi = int(input())
      ngay = input()
      if (tuoi < 12 or tuoi >= 60) and ngay == "thứ ba":
          print("Vé giảm giá")
      else:
          print("Vé thường")
    tests:
      - input: "8\nthứ ba"
        output: "Vé giảm giá"
      - input: "65\nthứ ba"
        output: "Vé giảm giá"
        hidden: true
      - input: "30\nthứ ba"
        output: "Vé thường"
        hidden: true
      - input: "8\nthứ tư"
        output: "Vé thường"
        hidden: true
      - input: "12\nthứ ba"
        output: "Vé thường"
        hidden: true
      - input: "60\nthứ ba"
        output: "Vé giảm giá"
        hidden: true
      - input: "70\nchủ nhật"
        output: "Vé thường"
        hidden: true
    hints:
      - { vi: "Điều kiện có 2 phần: tuổi được giảm giá (dưới 12 hoặc từ 60 trở lên), và ngày là thứ ba. Cả 2 phần phải cùng đúng, nên con nối chúng bằng and. Phần tuổi có or, nên con đặt nó trong ngoặc.", en: "The condition has 2 parts: an age that gets the discount (under 12, or 60 or older), and the day being thứ ba. Both parts must be True, so join them with and. The age part has an or, so put it in brackets." }
      - { vi: "Dòng 1 là tuoi = int(input()), dòng 2 là ngay = input(). Dòng 3 là if (tuoi < 12 or tuoi >= 60) and ngay == \"thứ ba\":. Sau đó là nhánh in Vé giảm giá, dòng else:, và nhánh in Vé thường.", en: "Line 1 is tuoi = int(input()), and line 2 is ngay = input(). Line 3 is if (tuoi < 12 or tuoi >= 60) and ngay == \"thứ ba\":. Then come the branch that prints Vé giảm giá, the line else:, and the branch that prints Vé thường." }
    test_eligible: true
  - id: s3.logic.l4.q1
    type: predict
    concepts: [chained-compare]
    code: |
      x = 10
      print(1 <= x <= 10)
      print(1 < x < 10)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "True\nTrue", misconception: boundary-check }
      - { text: "False\nFalse", misconception: chained-compare }
      - { vi: "Báo lỗi SyntaxError ở dòng 2, vì 1 phép so sánh chỉ có 1 dấu", en: "A SyntaxError on line 2, because a comparison can have only 1 sign", error: true, misconception: chained-compare }
      - { text: "True\nFalse", correct: true }
    explanation:
      vi: "1 <= x <= 10 giống 1 <= x and x <= 10. Dấu <= gồm cả số 10, nên lệnh print đầu tiên in ra True. Trong 1 < x < 10, phần x < 10 là False, vì 10 không nhỏ hơn 10, nên lệnh print thứ hai in ra False. Python cho viết 2 dấu so sánh liền nhau như vậy, nên không có lỗi."
      en: "1 <= x <= 10 is the same as 1 <= x and x <= 10. The sign <= includes 10, so the first print statement shows True. In 1 < x < 10, the part x < 10 is False, because 10 is not less than 10, so the second print statement shows False. Python lets you write 2 comparison signs in a row like this, so there is no error."
  - id: s3.logic.l4.q2
    type: mcq
    concepts: [or-either, chained-compare]
    prompt:
      vi: "Robo báo động khi n nằm ngoài khoảng từ 10 đến 20, tức là khi n nhỏ hơn 10 hoặc lớn hơn 20. Điều kiện nào đúng với ý đó?"
      en: "Robo sounds an alarm when n is outside the range from 10 to 20, that is, when n is less than 10 or greater than 20. Which condition matches that?"
    choices:
      - { text: "n < 10 or n > 20", correct: true }
      - { text: "n < 10 and n > 20", misconception: and-both }
      - { text: "10 <= n <= 20", misconception: chained-compare }
      - { text: "n < 10 or > 20", misconception: or-misuse }
    explanation:
      vi: "\"Nhỏ hơn 10 hoặc lớn hơn 20\" là n < 10 or n > 20. Với and, điều kiện không bao giờ đúng, vì không số nào vừa nhỏ hơn 10 vừa lớn hơn 20. 10 <= n <= 20 hỏi điều ngược lại: n nằm trong khoảng. Còn n < 10 or > 20 thiếu tên biến ở bên phải or, nên Python báo lỗi SyntaxError."
      en: "\"Less than 10 or greater than 20\" is n < 10 or n > 20. With and, the condition is never True, because no number is both less than 10 and greater than 20. 10 <= n <= 20 asks the opposite: n is inside the range. And n < 10 or > 20 has no variable name on the right of or, so Python gives a SyntaxError."
---
Robo chỉ đi dạo khi nhiệt độ **từ 20 đến 30 độ**. Đó là 1 **khoảng giá trị**: nhiệt độ phải vừa từ 20 trở lên, vừa không quá 30. Con dùng and:

```python run
nhiet_do = 26
if nhiet_do >= 20 and nhiet_do <= 30:
    print("Robo đi dạo")
else:
    print("Robo ở nhà")
```

Mỗi bên của and là 1 phép so sánh đầy đủ. Nếu con viết `nhiet_do >= 20 and <= 30`, bên phải and thiếu tên biến, và Python báo lỗi SyntaxError.
---
Python cho con viết khoảng giá trị gọn hơn, giống như trong toán: `20 <= nhiet_do <= 30`. Cách viết này giống hệt `20 <= nhiet_do and nhiet_do <= 30`:

```python run
nhiet_do = 30
print(20 <= nhiet_do <= 30)
print(20 < nhiet_do < 30)
```

Lệnh print đầu tiên in ra True, vì dấu <= gồm cả số 30. Lệnh print thứ hai in ra False, vì dấu < không gồm 2 số ở đầu khoảng. Con nhớ viết số nhỏ bên trái, số lớn bên phải: `30 <= nhiet_do <= 20` không bao giờ đúng.
---
Muốn hỏi nhiệt độ **nằm ngoài** khoảng từ 20 đến 30, con dùng or: nhỏ hơn 20 hoặc lớn hơn 30. Con cũng có thể đặt not trước khoảng giá trị:

```python run
nhiet_do = 35
print(nhiet_do < 20 or nhiet_do > 30)
print(not 20 <= nhiet_do <= 30)
```

Cả 2 lệnh print đều in ra True, vì 35 lớn hơn 30. Ở đây con không dùng and: không có số nào vừa nhỏ hơn 20 vừa lớn hơn 30.
---
Khi 1 điều kiện có cả and và or, con dùng **ngoặc** để chỉ cho Python phần nào làm trước, như trong toán. Robo đi dã ngoại vào thứ bảy hoặc chủ nhật, khi trời từ 20 độ trở lên:

```python run
ngay = "thứ bảy"
nhiet_do = 10
print((ngay == "thứ bảy" or ngay == "chủ nhật") and nhiet_do >= 20)
print(ngay == "thứ bảy" or ngay == "chủ nhật" and nhiet_do >= 20)
```

Có ngoặc, Python in ra False, đúng ý: trời lạnh nên Robo không đi. Không có ngoặc, Python làm and trước or, giống như làm phép nhân trước phép cộng, nên in ra True. Vì vậy, khi viết cả and và or trong 1 điều kiện, con luôn đặt ngoặc cho rõ.
