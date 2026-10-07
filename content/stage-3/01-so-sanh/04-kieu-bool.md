---
id: s3.so-sanh.l4
title: { vi: "Kiểu bool", en: "The bool type" }
exercises:
  - id: s3.so-sanh.l4.ex1
    type: code
    concepts: [bool-value, compare-ops]
    prompt:
      vi: "Muốn chơi tàu lượn, con phải cao từ 120 cm trở lên. Ô Dữ liệu nhập có 1 dòng: chiều cao của con (cm, số nguyên). Hãy đọc số đó vào biến chieu_cao, cất kết quả so sánh vào biến duoc_choi, rồi in ra đúng dòng như phần Ví dụ."
      en: "To ride the roller coaster, you must be 120 cm tall or more. The Input data box has 1 line: your height (cm, an integer). Read the number into the variable chieu_cao, store the result of the comparison in the variable duoc_choi, then print the line in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      chieu_cao = int(input())
      duoc_choi = chieu_cao >= 120
      print("Được chơi tàu lượn:", duoc_choi)
    tests:
      - input: "135"
        output: "Được chơi tàu lượn: True"
      - input: "120"
        output: "Được chơi tàu lượn: True"
        hidden: true
      - input: "110"
        output: "Được chơi tàu lượn: False"
        hidden: true
    common_wrong:
      - test: 1
        output: "Được chơi tàu lượn: False"
        misconception: compare-ops
        sample: |
          chieu_cao = int(input())
          duoc_choi = chieu_cao > 120
          print("Được chơi tàu lượn:", duoc_choi)
    hints:
      - { vi: "Dòng gán duoc_choi = ... có phép so sánh ở bên phải. Python so sánh trước, rồi cất True hoặc False vào biến. \"Từ 120 trở lên\" viết là >= 120.", en: "The line duoc_choi = ... has a comparison on the right. Python compares first, then stores True or False in the variable. \"120 or more\" is written >= 120." }
      - { vi: "Dòng 1 là chieu_cao = int(input()). Dòng 2 là duoc_choi = chieu_cao >= 120. Dòng 3 là print(\"Được chơi tàu lượn:\", duoc_choi).", en: "Line 1 is chieu_cao = int(input()). Line 2 is duoc_choi = chieu_cao >= 120. Line 3 is print(\"Được chơi tàu lượn:\", duoc_choi)." }
    test_eligible: true
  - id: s3.so-sanh.l4.ex2
    type: code
    concepts: [bool-value]
    prompt:
      vi: "Robo kiểm tra túi kẹo. Ô Dữ liệu nhập có 1 dòng: số kẹo trong túi, là số nguyên. Hãy đọc số đó vào biến so_keo, rồi cất 2 câu trả lời vào 2 biến: chan (số kẹo có phải số chẵn không) và nhieu (số kẹo có nhiều hơn 10 không). Cuối cùng in ra 2 dòng như phần Ví dụ."
      en: "Robo checks a bag of sweets. The Input data box has 1 line: the number of sweets in the bag, an integer. Read the number into the variable so_keo, then store 2 answers in 2 variables: chan (is the number of sweets even?) and nhieu (is it more than 10?). Finally print the 2 lines in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so_keo = int(input())
      chan = so_keo % 2 == 0
      nhieu = so_keo > 10
      print("Số chẵn:", chan)
      print("Nhiều hơn 10 viên:", nhieu)
    tests:
      - input: "12"
        output: |
          Số chẵn: True
          Nhiều hơn 10 viên: True
      - input: "7"
        output: |
          Số chẵn: False
          Nhiều hơn 10 viên: False
        hidden: true
      - input: "10"
        output: |
          Số chẵn: True
          Nhiều hơn 10 viên: False
        hidden: true
      - input: "15"
        output: |
          Số chẵn: False
          Nhiều hơn 10 viên: True
        hidden: true
    hints:
      - { vi: "Số chẵn là số chia 2 dư 0, nên chan = so_keo % 2 == 0. Python tính so_keo % 2 trước, rồi so sánh với 0. \"Nhiều hơn 10\" thì không tính đúng 10.", en: "An even number has remainder 0 when divided by 2, so chan = so_keo % 2 == 0. Python works out so_keo % 2 first, then compares it with 0. \"More than 10\" does not include exactly 10." }
      - { vi: "Sau dòng so_keo = int(input()), viết chan = so_keo % 2 == 0 và nhieu = so_keo > 10. Hai dòng cuối là print(\"Số chẵn:\", chan) và print(\"Nhiều hơn 10 viên:\", nhieu).", en: "After the line so_keo = int(input()), write chan = so_keo % 2 == 0 and nhieu = so_keo > 10. The last 2 lines are print(\"Số chẵn:\", chan) and print(\"Nhiều hơn 10 viên:\", nhieu)." }
    test_eligible: true
  - id: s3.so-sanh.l4.q1
    type: predict
    concepts: [bool-value]
    code: |
      x = 3 > 5
      print(x, type(x))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "False <class 'bool'>", correct: true }
      - { text: "False <class 'str'>", misconception: bool-value }
      - { text: "3 <class 'int'>", misconception: compare-ops }
      - { text: "True <class 'bool'>", misconception: compare-ops }
    explanation:
      vi: "Python so sánh 3 > 5 trước: 3 không lớn hơn 5, nên ra False. Sau đó dấu = cất False vào biến x. False không có dấu nháy, nên không phải chuỗi: kiểu của nó là bool."
      en: "Python compares 3 > 5 first: 3 is not greater than 5, so it gives False. Then = stores False in the variable x. False has no quotes, so it is not a string: its type is bool."
  - id: s3.so-sanh.l4.q2
    type: mcq
    concepts: [bool-value]
    prompt:
      vi: "Dòng nào cất 1 giá trị kiểu bool vào biến a?"
      en: "Which line stores a value of type bool in the variable a?"
    choices:
      - { text: "a = true", misconception: bool-value }
      - { text: "a = \"True\"", misconception: bool-value }
      - { text: "a = True", correct: true }
      - { text: "a = TRUE", misconception: bool-value }
    explanation:
      vi: "Giá trị bool viết là True hoặc False: chữ đầu viết hoa, các chữ sau viết thường, không có dấu nháy. Với true hay TRUE, Python báo lỗi NameError, vì không biết đó là gì. Còn \"True\" có dấu nháy là 1 chuỗi, không phải bool."
      en: "A bool value is written True or False: a capital first letter, small letters after it, and no quotes. With true or TRUE, Python shows a NameError, because it does not know what that is. And \"True\" with quotes is a string, not a bool."
---
Ở giai đoạn 2, con đã gặp các kiểu dữ liệu: số nguyên (int), số thực (float), chuỗi (str). True và False cũng có kiểu riêng, gọi là **bool**. Kiểu bool chỉ có đúng 2 giá trị: True và False.

```python run
print(type(True))
print(type(5 > 3))
print(type(10))
```

Con nhìn chữ nằm trong dấu nháy đơn: `<class 'bool'>` nghĩa là giá trị có kiểu bool, giống như `<class 'int'>` là số nguyên. Kết quả của mọi phép so sánh đều có kiểu bool.
---
True và False phải viết **hoa chữ đầu** và **không có dấu nháy**. Viết `true` thì Python báo lỗi NameError, vì không biết `true` là gì:

```python run expect-error
den_bat = true
```

Có dấu nháy thì "True" lại là 1 chuỗi, không phải bool. Chuỗi "True" không bằng giá trị True:

```python run
print(type("True"))
print("True" == True)
```
---
Con có thể **cất kết quả so sánh vào biến**, giống như cất số hay chuỗi:

```python run
pin = 75
du_pin = pin >= 50
print("Đủ pin:", du_pin)
```

Dòng 2 có cả dấu `=` và dấu `>=`. Python làm phép so sánh ở bên phải trước, được True, rồi dấu `=` cất True vào biến `du_pin`. Con cũng gán thẳng được: `troi_mua = False`.
---
Biến chứa bool dùng được trong chuỗi f, như mọi biến khác:

```python run
bai_con_lai = 3
xong_bai = bai_con_lai == 0
print(f"Robo đã làm xong bài: {xong_bai}")
```

Robo còn 3 bài chưa làm, nên `bai_con_lai == 0` ra False, và Python in ra: Robo đã làm xong bài: False. Đặt tên biến bool như 1 câu hỏi có hoặc không (`du_pin`, `xong_bai`) giúp con đọc code dễ hơn.
