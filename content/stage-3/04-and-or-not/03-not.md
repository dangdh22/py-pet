---
id: s3.logic.l3
title: { vi: "Đảo ngược: not", en: "Flipping: not" }
exercises:
  - id: s3.logic.l3.ex1
    type: code
    concepts: [not-flip]
    prompt:
      vi: "Robo có 1 công tắc đèn. Mỗi lần bấm, đèn đang bật thì tắt, đèn đang tắt thì bật. Ô Dữ liệu nhập có 1 dòng: bật nếu đèn đang bật, tắt nếu đèn đang tắt. Code bên phải đã có biến den_bat, là True khi đèn đang bật. Hãy dùng not để in ra Sau khi bấm, đèn bật: rồi True hoặc False, như phần Ví dụ."
      en: "Robo has a light switch. Each press turns the light off if it is on, and on if it is off. The Input data box has 1 line: bật if the light is on, tắt if the light is off. The code on the right already has the variable den_bat, which is True when the light is on. Use not to print Sau khi bấm, đèn bật: and then True or False, as in the Example."
    starter: |
      trang_thai = input()
      den_bat = trang_thai == "bật"
      # Viết lệnh của con ở dưới dòng này
    solution: |
      trang_thai = input()
      den_bat = trang_thai == "bật"
      print("Sau khi bấm, đèn bật:", not den_bat)
    tests:
      - input: "bật"
        output: "Sau khi bấm, đèn bật: False"
      - input: "tắt"
        output: "Sau khi bấm, đèn bật: True"
        hidden: true
    common_wrong:
      - test: 0
        output: "Sau khi bấm, đèn bật: True"
        misconception: not-flip
        sample: |
          trang_thai = input()
          den_bat = trang_thai == "bật"
          print("Sau khi bấm, đèn bật:", den_bat)
    hints:
      - { vi: "Bấm công tắc thì đèn đổi sang trạng thái ngược lại. den_bat là True thì sau khi bấm là False, và ngược lại. not làm đúng việc đảo ngược đó.", en: "Pressing the switch changes the light to the opposite state. If den_bat is True, after the press it is False, and the other way round. not does exactly that flip." }
      - { vi: "Thêm 1 dòng: print(\"Sau khi bấm, đèn bật:\", not den_bat).", en: "Add 1 line: print(\"Sau khi bấm, đèn bật:\", not den_bat)." }
    test_eligible: true
  - id: s3.logic.l3.ex2
    type: code
    concepts: [not-flip]
    prompt:
      vi: "Robo tưới cây khi đất không ẩm. Đất ẩm khi độ ẩm từ 40 phần trăm trở lên. Ô Dữ liệu nhập có 1 dòng: độ ẩm của đất, là số nguyên. Nếu đất không ẩm, in ra Robo tưới cây. Nếu đất ẩm, in ra Đất đủ ẩm rồi. Code bên phải chạy được nhưng làm ngược: đất khô mà Robo không tưới. Hãy sửa code để in ra đúng như phần Ví dụ."
      en: "Robo waters the plant when the soil is not moist. The soil is moist when its moisture is 40 percent or more. The Input data box has 1 line: the moisture of the soil, an integer. If the soil is not moist, print Robo tưới cây. If the soil is moist, print Đất đủ ẩm rồi. The code on the right runs but does the opposite: the soil is dry and Robo does not water it. Fix the code so that it prints as in the Example."
    starter: |
      do_am = int(input())
      dat_am = do_am >= 40
      if dat_am:
          print("Robo tưới cây")
      else:
          print("Đất đủ ẩm rồi")
    solution: |
      do_am = int(input())
      dat_am = do_am >= 40
      if not dat_am:
          print("Robo tưới cây")
      else:
          print("Đất đủ ẩm rồi")
    tests:
      - input: "20"
        output: "Robo tưới cây"
      - input: "40"
        output: "Đất đủ ẩm rồi"
        hidden: true
      - input: "39"
        output: "Robo tưới cây"
        hidden: true
      - input: "75"
        output: "Đất đủ ẩm rồi"
        hidden: true
    common_wrong:
      - test: 0
        output: "Đất đủ ẩm rồi"
        misconception: not-flip
        sample: |
          do_am = int(input())
          dat_am = do_am >= 40
          if dat_am:
              print("Robo tưới cây")
          else:
              print("Đất đủ ẩm rồi")
    hints:
      - { vi: "Với độ ẩm 20, dat_am là False, nên khối của if dat_am: không chạy. Robo cần tưới khi đất không ẩm, tức là khi not dat_am là True.", en: "With a moisture of 20, dat_am is False, so the block of if dat_am: does not run. Robo must water when the soil is not moist, that is, when not dat_am is True." }
      - { vi: "Đổi dòng 3 thành if not dat_am:. Các dòng khác giữ nguyên.", en: "Change line 3 to if not dat_am:. Keep the other lines as they are." }
    test_eligible: true
  - id: s3.logic.l3.q1
    type: predict
    concepts: [not-flip]
    code: |
      a = 5
      print(not a > 3)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "True", misconception: not-flip }
      - { vi: "Báo lỗi TypeError, vì not không dùng được với số 5", en: "A TypeError, because not cannot be used with the number 5", error: true, misconception: not-flip }
      - { text: "False", correct: true }
      - { vi: "Báo lỗi SyntaxError, vì not phải đứng sau phép so sánh", en: "A SyntaxError, because not must come after the comparison", error: true, misconception: not-flip }
    explanation:
      vi: "Python làm phép so sánh trước: 5 > 3 là True. Sau đó not đảo True thành False, nên Python in ra False. not đảo kết quả của cả phép so sánh a > 3, không đứng riêng với số 5, nên không có lỗi. not đứng trước điều kiện, như cách viết ở đây, là đúng."
      en: "Python does the comparison first: 5 > 3 is True. Then not flips True to False, so Python prints False. not flips the result of the whole comparison a > 3, it is not used on the number 5 alone, so there is no error. not goes before the condition, as it does here, so this is correct."
  - id: s3.logic.l3.q2
    type: mcq
    concepts: [not-flip]
    prompt:
      vi: "Điều kiện nào luôn cho cùng kết quả với not a == b?"
      en: "Which condition always gives the same result as not a == b?"
    choices:
      - { text: "a == b", misconception: not-flip }
      - { text: "a != b", correct: true }
      - { text: "not a != b", misconception: not-flip }
      - { text: "a < b", misconception: compare-ops }
    explanation:
      vi: "Python làm a == b trước, rồi not đảo kết quả. Vì vậy not a == b là True mỗi khi a khác b, giống hệt a != b. Còn not a != b thì giống a == b. a < b thì không đủ: khi a lớn hơn b, a < b là False, còn not a == b là True."
      en: "Python does a == b first, then not flips the result. So not a == b is True whenever a is not equal to b, just like a != b. And not a != b is the same as a == b. a < b is not enough: when a is greater than b, a < b is False, but not a == b is True."
---
Từ **not** nghĩa là "không". not **đảo ngược** 1 giá trị bool: not True là False, còn not False là True:

```python run
print(not True)
print(not False)
print(not 5 > 3)
```

Ở dòng 3, Python làm phép so sánh trước: 5 > 3 là True. Sau đó not đảo True thành False, nên dòng 3 in ra False.
---
not hay đi với biến bool sau if. `if troi_mua:` chạy khối lệnh khi trời mưa, còn `if not troi_mua:` chạy khối lệnh khi trời **không** mưa:

```python run
troi_mua = False
if not troi_mua:
    print("Robo ra công viên chơi")
else:
    print("Robo chơi trong nhà")
```

troi_mua là False, nên not troi_mua là True, và Python in ra Robo ra công viên chơi. Dòng if đọc lên giống 1 câu: nếu trời không mưa.
---
Đặt not trước 1 phép `==` thì được kết quả giống như dùng `!=`. Đặt not trước 1 phép `!=` thì giống như dùng `==`:

```python run
mat_khau = "robo123"
print(not mat_khau == "abc")
print(mat_khau != "abc")
print(not mat_khau != "abc")
```

2 lệnh print đầu tiên đều in ra True, vì mật khẩu không phải "abc". Lệnh print cuối in ra False, vì not đảo True của `mat_khau != "abc"` thành False. Khi viết code, con dùng `!=` cho ngắn và dễ đọc hơn `not ... ==`.
