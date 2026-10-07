---
id: s3.bai-toan.l3
title: { vi: "Năm nhuận", en: "Leap years" }
exercises:
  - id: s3.bai-toan.l3.ex1
    type: code
    concepts: [leap-year-rule, divisible-check]
    prompt:
      vi: "Robo đang làm lịch cho cả nhà. Ô Dữ liệu nhập có 1 dòng: 1 năm, là số nguyên. Nếu năm đó là năm nhuận, in ra Năm nhuận. Nếu không, in ra Năm thường. Hãy dùng quy tắc năm nhuận đầy đủ để in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo is making a calendar for the family. The Input data box has 1 line: a year, an integer. If that year is a leap year, print Năm nhuận. If not, print Năm thường. Use the full leap year rule to print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      nam = int(input())
      if nam % 400 == 0:
          print("Năm nhuận")
      elif nam % 100 == 0:
          print("Năm thường")
      elif nam % 4 == 0:
          print("Năm nhuận")
      else:
          print("Năm thường")
    tests:
      - input: "2024"
        output: "Năm nhuận"
      - input: "2023"
        output: "Năm thường"
        hidden: true
      - input: "1900"
        output: "Năm thường"
        hidden: true
      - input: "2000"
        output: "Năm nhuận"
        hidden: true
      - input: "2100"
        output: "Năm thường"
        hidden: true
    common_wrong:
      - test: 2
        output: "Năm nhuận"
        misconception: leap-year-rule
        sample: |
          nam = int(input())
          if nam % 4 == 0:
              print("Năm nhuận")
          else:
              print("Năm thường")
      - test: 3
        output: "Năm thường"
        misconception: condition-order
        sample: |
          nam = int(input())
          if nam % 100 == 0:
              print("Năm thường")
          elif nam % 400 == 0:
              print("Năm nhuận")
          elif nam % 4 == 0:
              print("Năm nhuận")
          else:
              print("Năm thường")
    hints:
      - { vi: "Viết 4 nhánh theo thứ tự: chia hết cho 400, rồi chia hết cho 100, rồi chia hết cho 4, rồi else. Python dừng ở điều kiện đúng đầu tiên, nên nhánh hỏi 400 phải đứng trước nhánh hỏi 100.", en: "Write 4 branches in this order: divisible by 400, then divisible by 100, then divisible by 4, then else. Python stops at the first True condition, so the branch that asks about 400 must come before the branch that asks about 100." }
      - { vi: "Dòng 2 là if nam % 400 == 0:, in ra Năm nhuận. Tiếp theo là elif nam % 100 == 0:, in ra Năm thường, rồi elif nam % 4 == 0:, in ra Năm nhuận. Cuối cùng là else:, in ra Năm thường.", en: "Line 2 is if nam % 400 == 0:, which prints Năm nhuận. Next comes elif nam % 100 == 0:, which prints Năm thường, then elif nam % 4 == 0:, which prints Năm nhuận. Last comes else:, which prints Năm thường." }
    test_eligible: true
  - id: s3.bai-toan.l3.ex2
    type: code
    concepts: [leap-year-rule]
    prompt:
      vi: "Robo in ra số ngày của tháng 2. Ô Dữ liệu nhập có 1 dòng: 1 năm. Năm nhuận thì in ra Tháng 2 có 29 ngày, năm thường thì in ra Tháng 2 có 28 ngày. Code bên phải chạy được, nhưng chỉ dùng quy tắc chia hết cho 4, nên in sai với năm 1900. Hãy sửa điều kiện để in ra đúng như phần Ví dụ."
      en: "Robo prints the number of days in February. The Input data box has 1 line: a year. For a leap year, print Tháng 2 có 29 ngày, and for a common year, print Tháng 2 có 28 ngày. The code on the right runs, but it only uses the rule of dividing by 4, so it prints the wrong thing for the year 1900. Fix the condition so that it prints as in the Example."
    starter: |
      nam = int(input())
      if nam % 4 == 0:
          print("Tháng 2 có 29 ngày")
      else:
          print("Tháng 2 có 28 ngày")
    solution: |
      nam = int(input())
      if (nam % 4 == 0 and nam % 100 != 0) or nam % 400 == 0:
          print("Tháng 2 có 29 ngày")
      else:
          print("Tháng 2 có 28 ngày")
    tests:
      - input: "1900"
        output: "Tháng 2 có 28 ngày"
      - input: "2024"
        output: "Tháng 2 có 29 ngày"
        hidden: true
      - input: "2000"
        output: "Tháng 2 có 29 ngày"
        hidden: true
      - input: "2023"
        output: "Tháng 2 có 28 ngày"
        hidden: true
      - input: "2100"
        output: "Tháng 2 có 28 ngày"
        hidden: true
    common_wrong:
      - test: 0
        output: "Tháng 2 có 29 ngày"
        misconception: leap-year-rule
        sample: |
          nam = int(input())
          if nam % 4 == 0:
              print("Tháng 2 có 29 ngày")
          else:
              print("Tháng 2 có 28 ngày")
      - test: 2
        output: "Tháng 2 có 28 ngày"
        misconception: leap-year-rule
        sample: |
          nam = int(input())
          if nam % 4 == 0 and nam % 100 != 0:
              print("Tháng 2 có 29 ngày")
          else:
              print("Tháng 2 có 28 ngày")
    hints:
      - { vi: "Năm 1900 chia hết cho 4, nhưng cũng chia hết cho 100 mà không chia hết cho 400, nên không phải năm nhuận. Điều kiện cần thêm 2 phần: không chia hết cho 100, hoặc chia hết cho 400.", en: "The year 1900 can be divided by 4, but it can also be divided by 100 and not by 400, so it is not a leap year. The condition needs 2 more parts: not divisible by 100, or divisible by 400." }
      - { vi: "Đổi dòng 2 thành if (nam % 4 == 0 and nam % 100 != 0) or nam % 400 == 0:. Các dòng khác giữ nguyên.", en: "Change line 2 to if (nam % 4 == 0 and nam % 100 != 0) or nam % 400 == 0:. Keep the other lines as they are." }
    test_eligible: true
  - id: s3.bai-toan.l3.q1
    type: predict
    concepts: [leap-year-rule]
    code: |
      year = 1900
      if year % 4 == 0:
          print("leap")
      else:
          print("common")
      print(year % 100)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "leap\n0", correct: true }
      - { text: "common\n0", misconception: leap-year-rule }
      - { text: "leap\n19", misconception: modulo }
      - { text: "common\n19", misconception: leap-year-rule }
    explanation:
      vi: "1900 % 4 là 0, vì 1900 = 4 * 475, nên điều kiện là True và Python in ra leap. Đoạn code chỉ làm đúng điều được viết: nó chỉ hỏi chia hết cho 4, nên nó gọi 1900 là năm nhuận, dù theo quy tắc đầy đủ thì 1900 là năm thường. Dòng cuối in ra số dư của 1900 chia 100, là 0. Số 19 là kết quả của 1900 // 100."
      en: "1900 % 4 is 0, because 1900 = 4 * 475, so the condition is True and Python prints leap. The code does exactly what it says: it only asks about dividing by 4, so it calls 1900 a leap year, even though by the full rule 1900 is a common year. The last line prints the remainder of 1900 divided by 100, which is 0. The number 19 is the result of 1900 // 100."
  - id: s3.bai-toan.l3.q2
    type: mcq
    concepts: [leap-year-rule]
    prompt:
      vi: "Năm nào dưới đây là năm nhuận?"
      en: "Which of these years is a leap year?"
    choices:
      - { text: "1800", misconception: leap-year-rule }
      - { text: "1900", misconception: leap-year-rule }
      - { text: "2000", correct: true }
      - { text: "2100", misconception: leap-year-rule }
    explanation:
      vi: "Cả 4 năm đều chia hết cho 100, nên chỉ năm chia hết cho 400 mới là năm nhuận. 2000 = 400 * 5, nên 2000 là năm nhuận. 1800, 1900 và 2100 không chia hết cho 400, nên là năm thường, dù chúng chia hết cho 4."
      en: "All 4 years can be divided by 100, so only a year that can be divided by 400 is a leap year. 2000 = 400 * 5, so 2000 is a leap year. 1800, 1900 and 2100 cannot be divided by 400, so they are common years, even though they can be divided by 4."
---
Theo dương lịch, 1 **năm thường** có 365 ngày. Nhưng Trái Đất đi hết 1 vòng quanh Mặt Trời mất khoảng 365 ngày và gần 6 giờ. Cứ 4 năm, phần dư ra cộng lại thành gần 1 ngày. Vì vậy, khoảng 4 năm lại có 1 **năm nhuận** dài 366 ngày: tháng 2 năm đó có thêm ngày 29.

```python run
nam = 2024
print(nam, "chia hết cho 4:", nam % 4 == 0)
```

2024 chia hết cho 4, và 2024 là năm nhuận: tháng 2 năm 2024 có 29 ngày. Âm lịch cũng có năm nhuận, nhưng theo cách khác; bài này chỉ nói về dương lịch.
---
Phần dư ra mỗi năm thật ra ít hơn 6 giờ một chút, nên cứ 4 năm thêm 1 ngày là hơi nhiều. Vì vậy, người ta bỏ bớt vài năm nhuận. Quy tắc đầy đủ là:

- Năm chia hết cho 400 là năm nhuận, như năm 2000.
- Năm chia hết cho 100 mà không chia hết cho 400 là năm thường, như năm 1900.
- Năm chia hết cho 4 mà không chia hết cho 100 là năm nhuận, như năm 2024.
- Các năm còn lại là năm thường, như năm 2023.

Con viết quy tắc này bằng if, elif và else, theo đúng thứ tự trên:

```python run
nam = 1900
if nam % 400 == 0:
    print(nam, "là năm nhuận")
elif nam % 100 == 0:
    print(nam, "là năm thường")
elif nam % 4 == 0:
    print(nam, "là năm nhuận")
else:
    print(nam, "là năm thường")
```

1900 không chia hết cho 400, nhưng chia hết cho 100, nên Python dừng ở nhánh thứ hai và in ra 1900 là năm thường.
---
Con cũng có thể viết cả quy tắc trong 1 điều kiện, dùng and, or và ngoặc như ở chủ đề trước:

```python run
nam = 2000
nhuan = (nam % 4 == 0 and nam % 100 != 0) or nam % 400 == 0
print(nam, "là năm nhuận:", nhuan)
```

Phần trong ngoặc hỏi: chia hết cho 4 mà không chia hết cho 100? Với 2000, phần này là False, nhưng `nam % 400 == 0` là True, nên nhuan là True. Khi thử 1 chương trình năm nhuận, con thử đủ 4 năm: 2024, 2023, 1900 và 2000. Mỗi năm kiểm tra 1 phần của quy tắc.
