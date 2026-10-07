---
id: s4.tong-dem.l3
title: { vi: "Lớn nhất, nhỏ nhất", en: "Largest and smallest" }
exercises:
  - id: s4.tong-dem.l3.ex1
    type: code
    concepts: [running-max]
    prompt:
      vi: "Robo chơi 5 ván game. Mỗi ván được cộng hoặc bị trừ điểm, nên điểm của 1 ván có thể là số âm. Ô Dữ liệu nhập có 5 dòng: điểm của 5 ván, mỗi dòng 1 số nguyên. Hãy đọc điểm ván đầu tiên làm điểm cao nhất, rồi dùng vòng lặp for để so sánh với 4 ván còn lại. In ra đúng 1 dòng như phần Ví dụ."
      en: "Robo plays 5 rounds of a game. Each round can win or lose points, so the score of a round may be negative. The Input data box has 5 lines: the scores of the 5 rounds, each line an integer. Read the score of the first round as the highest score, then use a for loop to compare it with the other 4 rounds. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      cao_nhat = int(input())
      for i in range(4):
          diem = int(input())
          if diem > cao_nhat:
              cao_nhat = diem
      print("Ván cao nhất:", cao_nhat, "điểm")
    tests:
      - input: "3\n-2\n8\n5\n1"
        output: "Ván cao nhất: 8 điểm"
      - input: "-5\n-3\n-9\n-4\n-7"
        output: "Ván cao nhất: -3 điểm"
        hidden: true
      - input: "10\n2\n7\n-1\n0"
        output: "Ván cao nhất: 10 điểm"
        hidden: true
      - input: "1\n2\n3\n4\n6"
        output: "Ván cao nhất: 6 điểm"
        hidden: true
      - input: "-6\n-6\n-6\n-6\n-6"
        output: "Ván cao nhất: -6 điểm"
        hidden: true
    common_wrong:
      - test: 1
        output: "Ván cao nhất: 0 điểm"
        misconception: running-max
        sample: |
          cao_nhat = 0
          for i in range(5):
              diem = int(input())
              if diem > cao_nhat:
                  cao_nhat = diem
          print("Ván cao nhất:", cao_nhat, "điểm")
    hints:
      - { vi: "Dòng đầu tiên là cao_nhat = int(input()), vì điểm ván đầu tiên là điểm cao nhất cho tới lúc đó. Đừng bắt đầu từ 0: nếu mọi ván đều bị điểm âm, 0 sẽ là kết quả sai. Vòng lặp chạy 4 lần cho 4 ván còn lại.", en: "The first line is cao_nhat = int(input()), because the score of the first round is the highest so far. Do not start from 0: if every round has a negative score, 0 would be a wrong answer. The loop runs 4 times for the other 4 rounds." }
      - { vi: "Sau dòng đầu tiên là for i in range(4):. Trong vòng lặp: diem = int(input()), rồi if diem > cao_nhat: với dòng cao_nhat = diem thụt lề 8 dấu cách. Cuối cùng, sát lề trái: print(\"Ván cao nhất:\", cao_nhat, \"điểm\").", en: "After the first line comes for i in range(4):. Inside the loop: diem = int(input()), then if diem > cao_nhat: with the line cao_nhat = diem indented by 8 spaces. Last, at the left edge: print(\"Ván cao nhất:\", cao_nhat, \"điểm\")." }
    test_eligible: true
  - id: s4.tong-dem.l3.ex2
    type: code
    concepts: [running-max, sentinel-input]
    prompt:
      vi: "Robo đi chợ và muốn biết món nào rẻ nhất. Ô Dữ liệu nhập có nhiều dòng: mỗi dòng là giá 1 món (số nguyên lớn hơn 0, tính bằng nghìn đồng), và dòng cuối cùng là 0. Luôn có ít nhất 1 món. Hãy dùng vòng lặp while để tìm giá rẻ nhất, rồi in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo goes to the market and wants to know which item is the cheapest. The Input data box has several lines: each line is the price of 1 item (an integer greater than 0, in thousands of dong), and the last line is 0. There is always at least 1 item. Use a while loop to find the lowest price, then print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      gia = int(input())
      re_nhat = gia
      while gia != 0:
          if gia < re_nhat:
              re_nhat = gia
          gia = int(input())
      print("Món rẻ nhất giá", re_nhat, "nghìn đồng")
    tests:
      - input: "30\n15\n42\n15\n0"
        output: "Món rẻ nhất giá 15 nghìn đồng"
      - input: "25\n0"
        output: "Món rẻ nhất giá 25 nghìn đồng"
        hidden: true
      - input: "8\n20\n9\n0"
        output: "Món rẻ nhất giá 8 nghìn đồng"
        hidden: true
      - input: "50\n40\n35\n0"
        output: "Món rẻ nhất giá 35 nghìn đồng"
        hidden: true
    common_wrong:
      - test: 0
        output: "Món rẻ nhất giá 0 nghìn đồng"
        misconception: running-max
        sample: |
          gia = int(input())
          re_nhat = 0
          while gia != 0:
              if gia < re_nhat:
                  re_nhat = gia
              gia = int(input())
          print("Món rẻ nhất giá", re_nhat, "nghìn đồng")
    hints:
      - { vi: "Đọc giá đầu tiên trước vòng lặp, và gán re_nhat = gia, vì món đầu tiên là món rẻ nhất cho tới lúc đó. Nếu bắt đầu re_nhat = 0, không giá nào nhỏ hơn 0, nên Robo luôn in ra 0. Trong khối lệnh, so sánh trước, rồi đọc giá tiếp theo ở dòng cuối của khối.", en: "Read the first price before the loop, and set re_nhat = gia, because the first item is the cheapest so far. If you start with re_nhat = 0, no price is smaller than 0, so Robo always prints 0. Inside the block, compare first, then read the next price on the last line of the block." }
      - { vi: "Chương trình: gia = int(input()), re_nhat = gia, rồi while gia != 0:. Trong khối: if gia < re_nhat: với re_nhat = gia thụt lề 8 dấu cách, rồi gia = int(input()). Sau vòng lặp: print(\"Món rẻ nhất giá\", re_nhat, \"nghìn đồng\").", en: "The program: gia = int(input()), re_nhat = gia, then while gia != 0:. In the block: if gia < re_nhat: with re_nhat = gia indented by 8 spaces, then gia = int(input()). After the loop: print(\"Món rẻ nhất giá\", re_nhat, \"nghìn đồng\")." }
    test_eligible: true
  - id: s4.tong-dem.l3.q1
    type: predict
    concepts: [running-max]
    code: |
      big = 0
      for i in range(1, 4):
          n = i - 10
          if n > big:
              big = n
      print(big)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "-7", misconception: running-max }
      - { text: "-9", misconception: running-max }
      - { text: "-10", misconception: range-start-step }
      - { text: "0", correct: true }
    explanation:
      vi: "n lần lượt là -9, -8 và -7. Cả 3 số đều nhỏ hơn 0, nên n > big luôn là False, và big vẫn là 0 từ đầu đến cuối. Đoạn code in ra 0, dù không số nào bằng 0. Muốn tìm đúng số lớn nhất là -7, big phải bắt đầu từ số đầu tiên, không phải từ 0."
      en: "n is -9, then -8, then -7. All 3 numbers are smaller than 0, so n > big is always False, and big stays 0 from start to end. The code prints 0, even though no number is 0. To find the real largest number, -7, big must start from the first number, not from 0."
  - id: s4.tong-dem.l3.q2
    type: mcq
    concepts: [running-max]
    code: |
      small = 0
      for i in range(4):
          x = int(input())
          if x < small:
              small = x
      print(small)
    prompt:
      vi: "Đoạn code này muốn in ra số nhỏ nhất trong 4 số nhập vào. Với 4 dòng nào trong ô Dữ liệu nhập thì đoạn code in đúng số nhỏ nhất?"
      en: "This code is meant to print the smallest of 4 numbers that are read in. With which 4 lines in the Input data box does the code print the right smallest number?"
    choices:
      - { text: "6, 3, 8, 5", misconception: running-max }
      - { text: "12, 30, 25, 18", misconception: running-max }
      - { text: "-4, 2, -9, 1", correct: true }
      - { text: "5, 5, 5, 5", misconception: running-max }
    explanation:
      vi: "small bắt đầu từ 0. Khi mọi số đều lớn hơn 0, không số nào nhỏ hơn small, nên đoạn code in ra 0, dù 0 không có trong dữ liệu. Với -4, 2, -9, 1, small đổi thành -4 rồi -9, nên đoạn code in đúng -9. Bắt đầu từ số đầu tiên thì đoạn code đúng với mọi dữ liệu."
      en: "small starts at 0. When every number is greater than 0, no number is smaller than small, so the code prints 0, even though 0 is not in the data. With -4, 2, -9, 1, small changes to -4 and then -9, so the code prints the right answer, -9. Starting from the first number makes the code right for any data."
---
Ở giai đoạn 3, con đã tìm số lớn nhất của 3 số bằng biến lon_nhat cập nhật dần: lúc đầu coi số thứ nhất là lớn nhất, rồi so sánh lon_nhat với từng số còn lại. Với nhiều số, 2 dòng `if so > lon_nhat:` và `lon_nhat = so` được lặp lại cho mỗi số, nên con đặt chúng trong vòng lặp:

```python
lon_nhat = int(input())
for i in range(4):
    so = int(input())
    if so > lon_nhat:
        lon_nhat = so
print("Lớn nhất:", lon_nhat)
```

Dòng 1 đọc số đầu tiên, và Robo coi số đó là lớn nhất. Vòng lặp đọc 4 số còn lại. Với 5 dòng là 7, 12, 5, 15 và 9, lon_nhat lần lượt là 7, 12, 12, 15, 15, và chương trình in ra Lớn nhất: 15.
---
Vì sao không bắt đầu với `lon_nhat = 0`? Đêm trên đỉnh núi rất lạnh: lúc 1 giờ sáng nhiệt độ là -2 độ, và mỗi giờ giảm thêm 2 độ. Robo tìm lúc ấm nhất, nhưng bắt đầu từ 0:

```python run
lon_nhat = 0
for gio in range(1, 5):
    nhiet_do = -2 * gio
    print("Lúc", gio, "giờ:", nhiet_do, "độ")
    if nhiet_do > lon_nhat:
        lon_nhat = nhiet_do
print("Ấm nhất:", lon_nhat, "độ")
```

Không giờ nào có 0 độ, nhưng Robo in ra 0! Mọi nhiệt độ đều nhỏ hơn 0, nên lon_nhat không bao giờ đổi. Số đầu tiên luôn là 1 số thật trong dữ liệu, nên con bắt đầu từ **số đầu tiên**. Bắt đầu từ -2, Robo in đúng là -2 độ.
---
Tìm số **nhỏ nhất** cũng vậy, chỉ đổi dấu > thành dấu <:

```python
nho_nhat = int(input())
for i in range(4):
    so = int(input())
    if so < nho_nhat:
        nho_nhat = so
print("Nhỏ nhất:", nho_nhat)
```

Với 7, 12, 5, 15 và 9, chương trình in ra Nhỏ nhất: 5. Ở đây, bắt đầu với `nho_nhat = 0` còn sai hơn: các số đều lớn hơn 0, nên không số nào nhỏ hơn 0, và Robo luôn in ra 0.
