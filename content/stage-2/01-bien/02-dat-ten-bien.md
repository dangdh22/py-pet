---
id: s2.bien.l2
title: { vi: "Đặt tên biến", en: "Naming variables" }
exercises:
  - id: s2.bien.l2.ex1
    type: code
    concepts: [var-name-rules]
    prompt:
      vi: "Code bên phải có 2 tên biến đặt sai quy tắc nên Python báo lỗi. Hãy đổi 2 tên đó thành tên đúng quy tắc (nhớ đổi ở mọi chỗ dùng tên), để in ra đúng dòng như phần Ví dụ."
      en: "The code on the right has 2 variable names that break the naming rules, so Python shows an error. Change the 2 names to names that follow the rules (change them everywhere they are used), to print the line in the Example."
    starter: |
      2robo = "Robo"
      so pin = 3
      print(2robo, "có", so pin, "cục pin")
    solution: |
      robo2 = "Robo"
      so_pin = 3
      print(robo2, "có", so_pin, "cục pin")
    tests:
      - output: "Robo có 3 cục pin"
    hints:
      - { vi: "Tên biến không được bắt đầu bằng chữ số, và không được có dấu cách. Đọc số dòng trong thông báo lỗi để biết tên nào sai.", en: "A variable name cannot start with a digit, and it cannot have a space. Read the line number in the error message to find the wrong name." }
      - { vi: "Đổi 2robo thành robo2, và đổi so pin thành so_pin. Đổi cả ở dòng print.", en: "Change 2robo to robo2, and change so pin to so_pin. Change them in the print line too." }
    test_eligible: true
  - id: s2.bien.l2.q1
    type: mcq
    concepts: [var-name-rules]
    prompt:
      vi: "Tên biến nào viết đúng quy tắc?"
      en: "Which variable name follows the rules?"
    choices:
      - { text: "my_total", correct: true }
      - { text: "my total", misconception: var-name-rules }
      - { text: "2total", misconception: var-name-rules }
      - { text: "my-total", misconception: var-name-rules }
    explanation:
      vi: "Tên biến chỉ gồm chữ cái, chữ số và dấu gạch dưới _, và không bắt đầu bằng chữ số. my total có dấu cách, 2total bắt đầu bằng số, còn my-total có dấu gạch ngang mà Python hiểu là phép trừ."
      en: "A variable name has only letters, digits and the underscore _, and it does not start with a digit. my total has a space, 2total starts with a digit, and my-total has a dash, which Python reads as a minus sign."
  - id: s2.bien.l2.q2
    type: predict
    concepts: [var-name-rules, case-sensitive]
    code: |
      name = "Bo"
      Name = "Mo"
      print(name, Name)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Bo Mo", correct: true }
      - { text: "Mo Mo", misconception: case-sensitive }
      - { text: "Bo Bo", misconception: case-sensitive }
      - { vi: "Báo lỗi NameError", en: "A NameError", error: true, misconception: case-sensitive }
    explanation:
      vi: "Python phân biệt chữ hoa và chữ thường, nên name và Name là 2 biến khác nhau. Biến name chứa Bo, biến Name chứa Mo."
      en: "Python sees upper-case and lower-case letters as different, so name and Name are 2 different variables. The variable name holds Bo, and the variable Name holds Mo."
---
Con được tự đặt tên cho biến, nhưng phải theo **quy tắc đặt tên** của Python:

- Tên chỉ gồm **chữ cái**, **chữ số** và **dấu gạch dưới** `_`.
- Tên **không được bắt đầu bằng chữ số**.

```python run
robo2 = "Robo"
mau_mat = "xanh"
print(robo2, mau_mat)
```

Nếu tên bắt đầu bằng chữ số, Python báo lỗi ngay. Bấm Chạy thử để xem:

```python run expect-error
2robo = "Robo"
```
---
Tên biến **không được có dấu cách**. Nếu tên có nhiều từ, con nối các từ bằng dấu gạch dưới: viết `so_keo`, không viết `so keo`.

```python run expect-error
so keo = 3
```

Python thấy 2 từ `so` và `keo` đứng cạnh nhau nên không hiểu. Dấu gạch ngang cũng không dùng được: Python đọc `so-keo` là "so trừ keo".

Con nên viết tên bằng chữ không dấu, như `so_keo` hay `tuoi`, để dễ gõ và không gõ nhầm.
---
Python **phân biệt chữ hoa và chữ thường** trong tên biến, giống như với tên lệnh `print`. Vì vậy `ten` và `Ten` là 2 biến khác nhau.

```python run expect-error
ten = "Robo"
print(Ten)
```

Biến `ten` đã có giá trị, nhưng biến `Ten` thì chưa có, nên Python báo lỗi NameError. Robo đoán giúp con tên đúng là `ten`. Con nên viết tên biến bằng chữ thường để khỏi nhầm.
---
Hãy chọn tên **có nghĩa**, để ai đọc code cũng hiểu biến đó cất gì. Tên `so_pin` dễ hiểu hơn nhiều so với `x` hay `abc`.

Đừng đặt tên biến trùng với tên lệnh của Python, như `print`. Python vẫn cho gán, nhưng sau đó lệnh print không dùng được nữa:

```python run expect-error
print = "Robo"
print(print)
```

Ở dòng 2, `print` không còn là lệnh in nữa mà là 1 biến chứa chuỗi, nên Python báo lỗi. Cũng có vài từ đặc biệt như `if` hay `for` mà Python cấm hẳn dùng làm tên biến. Con sẽ gặp các từ này ở giai đoạn sau.
