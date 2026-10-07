---
id: s4.while.l5
title: { vi: "Heo đất của Robo", en: "Robo's piggy bank" }
exercises:
  - id: s4.while.l5.ex1
    type: code
    concepts: [off-by-one, while-update, while-check-first]
    prompt:
      vi: "Robo để dành tiền trong heo đất để mua 1 món đồ chơi. Ô Dữ liệu nhập có 3 dòng: dòng 1 là giá món đồ, dòng 2 là số tiền đã có trong heo đất, dòng 3 là số tiền Robo bỏ thêm mỗi tuần (luôn lớn hơn 0), tất cả tính bằng nghìn đồng. Trong khi chưa đủ tiền, mỗi tuần Robo bỏ thêm tiền và in ra số tiền trong heo đất. Cuối cùng, in ra số tuần Robo cần, đúng như phần Ví dụ."
      en: "Robo saves money in a piggy bank to buy a toy. The Input data box has 3 lines: line 1 is the price of the toy, line 2 is the money already in the piggy bank, and line 3 is the money Robo adds each week (always greater than 0), all in thousands of dong. While there is not enough money, each week Robo adds money and prints the money in the piggy bank. At the end, print the number of weeks Robo needs, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      gia = int(input())
      tien = int(input())
      moi_tuan = int(input())
      tuan = 0
      while tien < gia:
          tien = tien + moi_tuan
          tuan = tuan + 1
          print("Tuần", tuan, "có", tien, "nghìn đồng")
      print("Robo cần", tuan, "tuần")
    tests:
      - input: "45\n0\n15"
        output: |
          Tuần 1 có 15 nghìn đồng
          Tuần 2 có 30 nghìn đồng
          Tuần 3 có 45 nghìn đồng
          Robo cần 3 tuần
      - input: "30\n40\n10"
        output: "Robo cần 0 tuần"
        hidden: true
      - input: "100\n90\n20"
        output: |
          Tuần 1 có 110 nghìn đồng
          Robo cần 1 tuần
        hidden: true
      - input: "50\n5\n8"
        output: |
          Tuần 1 có 13 nghìn đồng
          Tuần 2 có 21 nghìn đồng
          Tuần 3 có 29 nghìn đồng
          Tuần 4 có 37 nghìn đồng
          Tuần 5 có 45 nghìn đồng
          Tuần 6 có 53 nghìn đồng
          Robo cần 6 tuần
        hidden: true
      - input: "60\n60\n5"
        output: "Robo cần 0 tuần"
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Tuần 1 có 15 nghìn đồng
          Tuần 2 có 30 nghìn đồng
          Tuần 3 có 45 nghìn đồng
          Tuần 4 có 60 nghìn đồng
          Robo cần 4 tuần
        misconception: off-by-one
        sample: |
          gia = int(input())
          tien = int(input())
          moi_tuan = int(input())
          tuan = 0
          while tien <= gia:
              tien = tien + moi_tuan
              tuan = tuan + 1
              print("Tuần", tuan, "có", tien, "nghìn đồng")
          print("Robo cần", tuan, "tuần")
    hints:
      - { vi: "Đọc 3 số theo đúng thứ tự, rồi đặt tuan = 0. Điều kiện là tien < gia, vì có tiền vừa bằng giá là đã đủ. Mỗi lần lặp, cộng moi_tuan vào tien, cộng 1 vào tuan, rồi in ra 1 dòng.", en: "Read the 3 numbers in the right order, then set tuan = 0. The condition is tien < gia, because money exactly equal to the price is already enough. On each pass, add moi_tuan to tien, add 1 to tuan, then print 1 line." }
      - { vi: "Sau 4 dòng gia, tien, moi_tuan và tuan = 0, con viết while tien < gia:, rồi 3 dòng thụt lề: tien = tien + moi_tuan, tuan = tuan + 1 và print(\"Tuần\", tuan, \"có\", tien, \"nghìn đồng\"). Cuối cùng là print(\"Robo cần\", tuan, \"tuần\") sát lề trái.", en: "After the 4 lines for gia, tien, moi_tuan and tuan = 0, write while tien < gia:, then 3 indented lines: tien = tien + moi_tuan, tuan = tuan + 1 and print(\"Tuần\", tuan, \"có\", tien, \"nghìn đồng\"). Last comes print(\"Robo cần\", tuan, \"tuần\") at the left edge." }
    test_eligible: true
  - id: s4.while.l5.q1
    type: predict
    concepts: [off-by-one]
    code: |
      money = 10
      weeks = 0
      while money < 35:
          money = money + 10
          weeks = weeks + 1
      print(weeks, money)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "2 30", misconception: off-by-one }
      - { text: "4 40", misconception: off-by-one }
      - { text: "4 50", misconception: off-by-one }
      - { text: "3 40", correct: true }
    explanation:
      vi: "money bắt đầu là 10. Lần lượt, 10 < 35, 20 < 35 và 30 < 35 đều đúng, nên vòng lặp chạy 3 lần: money thành 20, 30, rồi 40, và weeks thành 3. Lúc này 40 < 35 sai, nên vòng lặp dừng. Lần kiểm tra cuối cùng không làm weeks tăng."
      en: "money starts at 10. In turn, 10 < 35, 20 < 35 and 30 < 35 are all True, so the loop runs 3 times: money becomes 20, 30, then 40, and weeks becomes 3. Now 40 < 35 is False, so the loop stops. The last check does not make weeks bigger."
  - id: s4.while.l5.q2
    type: mcq
    concepts: [while-check-first, off-by-one]
    code: |
      price = int(input())
      money = int(input())
      weeks = 0
      while money < price:
          money = money + 5
          weeks = weeks + 1
      print(weeks)
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: 20 và 15. Đoạn code in ra gì?"
      en: "The Input data box has 2 lines: 20 and 15. What is the output of this code?"
    choices:
      - { text: "2", misconception: off-by-one }
      - { text: "0", misconception: while-check-first }
      - { text: "1", correct: true }
      - { text: "4" }
    explanation:
      vi: "price là 20 và money là 15. Lần kiểm tra đầu, 15 < 20 đúng, nên khối lệnh chạy: money thành 20, weeks thành 1. Lần kiểm tra sau, 20 < 20 sai, nên vòng lặp dừng. Vì vậy code in ra 1. money bắt đầu từ 15 chứ không từ 0, nên không cần tới 4 tuần."
      en: "price is 20 and money is 15. At the first check, 15 < 20 is True, so the block runs: money becomes 20 and weeks becomes 1. At the next check, 20 < 20 is False, so the loop stops. So the code prints 1. money starts at 15, not at 0, so 4 weeks are not needed."
---
Robo muốn mua 1 chiếc diều giá 50 nghìn đồng. Heo đất của Robo đang trống, và mỗi tuần Robo bỏ vào 15 nghìn đồng. Robo cần bao nhiêu tuần? Robo chưa biết trước số tuần, chỉ biết lúc nào dừng: khi đủ tiền. Vì vậy Robo dùng while:

```python run
gia = 50
moi_tuan = 15
tien = 0
tuan = 0
while tien < gia:
    tien = tien + moi_tuan
    tuan = tuan + 1
    print("Tuần", tuan, "có", tien, "nghìn đồng")
print("Robo cần", tuan, "tuần")
```

Mỗi lần lặp là 1 tuần: tiền tăng thêm 15, và số tuần tăng thêm 1. Sau tuần 4, Robo có 60 nghìn đồng, đã đủ tiền, nên vòng lặp dừng.
---
Điều kiện là `tien < gia`, không phải `tien <= gia`. Khi tiền **vừa bằng** giá, Robo đã đủ tiền và phải dừng. Thử với chiếc diều giá 45 nghìn đồng:

```python run
gia = 45
tien = 0
tuan = 0
while tien < gia:
    tien = tien + 15
    tuan = tuan + 1
print("Robo cần", tuan, "tuần")
```

Sau 3 tuần, Robo có 45 nghìn đồng, vừa đủ. Nếu viết `tien <= gia`, vòng lặp chạy thừa 1 lần và Robo nói cần 4 tuần.
---
Nếu heo đất đã có sẵn đủ tiền, điều kiện sai ngay từ đầu. Vòng lặp chạy 0 lần, và Robo cần 0 tuần:

```python run
gia = 50
tien = 60
tuan = 0
while tien < gia:
    tien = tien + 15
    tuan = tuan + 1
print("Robo cần", tuan, "tuần")
```

Trong bài tập, con đọc giá món đồ, số tiền có sẵn và số tiền mỗi tuần bằng 3 lần gọi `int(input())`, theo đúng thứ tự của các dòng.
