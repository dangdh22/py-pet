---
id: s4.tong-dem.l1
title: { vi: "Cộng dồn", en: "Adding up" }
exercises:
  - id: s4.tong-dem.l1.ex1
    type: code
    concepts: [accumulator-init]
    prompt:
      vi: "Robo đọc 1 cuốn truyện: ngày 1 đọc 1 trang, ngày 2 đọc 2 trang, và cứ thế, ngày thứ n đọc n trang. Ô Dữ liệu nhập có 1 dòng: số ngày n, là số nguyên không âm. Hãy dùng vòng lặp for và 1 biến tích lũy để tính tổng số trang Robo đã đọc, rồi in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo reads a storybook: on day 1 it reads 1 page, on day 2 it reads 2 pages, and so on, so on day n it reads n pages. The Input data box has 1 line: the number of days n, an integer that is not negative. Use a for loop and a running total variable to work out how many pages Robo has read in all, then print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      tong = 0
      for ngay in range(1, n + 1):
          tong = tong + ngay
      print("Robo đọc được", tong, "trang")
    tests:
      - input: "5"
        output: "Robo đọc được 15 trang"
      - input: "1"
        output: "Robo đọc được 1 trang"
        hidden: true
      - input: "0"
        output: "Robo đọc được 0 trang"
        hidden: true
      - input: "10"
        output: "Robo đọc được 55 trang"
        hidden: true
    common_wrong:
      - test: 0
        output: "Robo đọc được 5 trang"
        misconception: accumulator-init
        sample: |
          n = int(input())
          for ngay in range(1, n + 1):
              tong = 0
              tong = tong + ngay
          print("Robo đọc được", tong, "trang")
      - test: 0
        output: "Robo đọc được 10 trang"
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          tong = 0
          for ngay in range(1, n):
              tong = tong + ngay
          print("Robo đọc được", tong, "trang")
    hints:
      - { vi: "Đặt tong = 0 trước vòng lặp, sát lề trái. Ngày đi từ 1 đến n, có cả n, nên con dùng range(1, n + 1). Mỗi lần lặp, cộng số trang của ngày đó vào tong. In kết quả 1 lần, sau vòng lặp.", en: "Set tong = 0 before the loop, at the left edge. The days go from 1 to n, n included, so use range(1, n + 1). On each pass, add that day's pages to tong. Print the result once, after the loop." }
      - { vi: "Chương trình có 5 dòng: n = int(input()), tong = 0, for ngay in range(1, n + 1):, rồi tong = tong + ngay thụt lề 4 dấu cách, và cuối cùng là print(\"Robo đọc được\", tong, \"trang\") sát lề trái.", en: "The program has 5 lines: n = int(input()), tong = 0, for ngay in range(1, n + 1):, then tong = tong + ngay indented by 4 spaces, and last print(\"Robo đọc được\", tong, \"trang\") at the left edge." }
    test_eligible: true
  - id: s4.tong-dem.l1.ex2
    type: code
    concepts: [plus-equals, accumulator-init]
    prompt:
      vi: "Robo cộng các số chẵn từ 2 đến n. Ô Dữ liệu nhập có 1 dòng: số n, là số nguyên không âm. Hãy dùng range với bước nhảy 2 và phép += để tính tổng các số chẵn từ 2 đến n (có cả n nếu n chẵn), rồi in ra đúng 1 dòng như phần Ví dụ. Nếu không có số chẵn nào, tổng là 0."
      en: "Robo adds up the even numbers from 2 to n. The Input data box has 1 line: a number n, an integer that is not negative. Use range with a step of 2 and the += operation to work out the sum of the even numbers from 2 to n (n included if n is even), then print exactly 1 line as in the Example. If there is no even number, the sum is 0."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      tong = 0
      for i in range(2, n + 1, 2):
          tong += i
      print("Tổng các số chẵn:", tong)
    tests:
      - input: "10"
        output: "Tổng các số chẵn: 30"
      - input: "2"
        output: "Tổng các số chẵn: 2"
        hidden: true
      - input: "1"
        output: "Tổng các số chẵn: 0"
        hidden: true
      - input: "9"
        output: "Tổng các số chẵn: 20"
        hidden: true
    common_wrong:
      - test: 0
        output: "Tổng các số chẵn: 10"
        misconception: plus-equals
        sample: |
          n = int(input())
          tong = 0
          for i in range(2, n + 1, 2):
              tong =+ i
          print("Tổng các số chẵn:", tong)
      - test: 0
        output: "Tổng các số chẵn: 20"
        misconception: range-stop-excluded
        sample: |
          n = int(input())
          tong = 0
          for i in range(2, n, 2):
              tong += i
          print("Tổng các số chẵn:", tong)
    hints:
      - { vi: "Đặt tong = 0 trước vòng lặp. range(2, n + 1, 2) cho i lần lượt là 2, 4, 6, và dừng trước n + 1. Mỗi lần lặp, viết tong += i, với dấu + đứng trước dấu =.", en: "Set tong = 0 before the loop. range(2, n + 1, 2) gives i the values 2, 4, 6, and stops before n + 1. On each pass, write tong += i, with the + sign before the = sign." }
      - { vi: "Chương trình có 5 dòng: n = int(input()), tong = 0, for i in range(2, n + 1, 2):, rồi tong += i thụt lề 4 dấu cách, và cuối cùng là print(\"Tổng các số chẵn:\", tong) sát lề trái.", en: "The program has 5 lines: n = int(input()), tong = 0, for i in range(2, n + 1, 2):, then tong += i indented by 4 spaces, and last print(\"Tổng các số chẵn:\", tong) at the left edge." }
    test_eligible: true
  - id: s4.tong-dem.l1.q1
    type: predict
    concepts: [plus-equals]
    code: |
      total = 0
      for i in range(1, 5):
          total += i * 2
      print(total)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "8", misconception: plus-equals }
      - { text: "12", misconception: range-stop-excluded }
      - { text: "20", correct: true }
      - { text: "2\n6\n12\n20", misconception: for-repeat }
    explanation:
      vi: "range(1, 5) cho i là 1, 2, 3, 4. Mỗi lần lặp, total += i * 2 cộng thêm i * 2 vào total: 0 + 2 + 4 + 6 + 8 = 20. Phép += không thay total bằng số mới, mà cộng số mới vào giá trị cũ. Dòng print(total) sát lề trái, nên chỉ in 1 lần, sau vòng lặp."
      en: "range(1, 5) gives i the values 1, 2, 3, 4. On each pass, total += i * 2 adds i * 2 to total: 0 + 2 + 4 + 6 + 8 = 20. The += operation does not replace total with the new number; it adds the new number to the old value. The line print(total) starts at the left edge, so it prints only once, after the loop."
  - id: s4.tong-dem.l1.q2
    type: predict
    concepts: [accumulator-init]
    code: |
      for i in range(3):
          total = 0
          total = total + 10
      print(total)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "30", misconception: accumulator-init }
      - { text: "10\n10\n10", misconception: for-repeat }
      - { vi: "Báo lỗi, vì total được gán lại nhiều lần", en: "An error, because total is assigned again and again", error: true, misconception: var-reassign }
      - { text: "10", correct: true }
    explanation:
      vi: "Dòng total = 0 nằm trong vòng lặp, nên mỗi lần lặp total bị đặt lại về 0, rồi mới cộng 10. Sau cả 3 lần lặp, total chỉ là 10, không phải 30. Gán lại 1 biến không phải là lỗi. Muốn cộng dồn, con đặt total = 0 trước vòng lặp."
      en: "The line total = 0 is inside the loop, so on each pass total is set back to 0 before 10 is added. After all 3 passes, total is only 10, not 30. Assigning a variable again is not an error. To add up, put total = 0 before the loop."
---
Con đã gặp việc cộng dồn rồi. Ở heo đất của Robo, mỗi tuần `tien = tien + moi_tuan`. Khi đếm ký tự, mỗi lần lặp `dem = dem + 1`. Biến như tien hay dem, cứ mỗi lần lặp lại cộng thêm 1 phần, gọi là **biến tích lũy**. Giống như con bỏ từng viên bi vào hộp: hộp giữ tất cả số bi đã bỏ vào.

Robo tập chạy: ngày 1 chạy 1 vòng, ngày 2 chạy 2 vòng, và cứ thế đến ngày 5. Robo đã chạy tất cả bao nhiêu vòng?

```python run
tong = 0
for ngay in range(1, 6):
    tong = tong + ngay
    print("Sau ngày", ngay, "Robo đã chạy", tong, "vòng")
print("Tổng cộng:", tong, "vòng")
```

Mỗi lần lặp, tong cộng thêm số vòng của ngày đó: 1, rồi 3, 6, 10 và 15.
---
Biến tích lũy cần 1 **giá trị ban đầu** trước vòng lặp. Nếu quên dòng `tong = 0`, Python báo lỗi:

```python run expect-error
for ngay in range(1, 6):
    tong = tong + ngay
print("Tổng cộng:", tong, "vòng")
```

Lời báo lỗi là NameError: name 'tong' is not defined. Ở lần lặp đầu tiên, Python cần giá trị cũ của tong để cộng thêm, nhưng tong chưa có giá trị nào.
---
Dòng `tong = 0` phải nằm **trước** vòng lặp, sát lề trái. Nếu con đặt nó trong vòng lặp, Python không báo lỗi, nhưng kết quả sai:

```python run
for ngay in range(1, 6):
    tong = 0
    tong = tong + ngay
print("Tổng cộng:", tong, "vòng")
```

Mỗi lần lặp, tong bị đặt lại về 0, rồi chỉ cộng số vòng của ngày đó. Sau vòng lặp, tong là 5, số vòng của ngày cuối, không phải 15. Dòng gán giá trị ban đầu chỉ được chạy 1 lần, trước khi bắt đầu cộng.
---
Python có cách viết gọn: `tong += ngay` nghĩa là `tong = tong + ngay`, tức là cộng thêm ngay vào tong. Dấu `+` đứng trước dấu `=`, viết liền nhau. Biến đếm cũng viết gọn được: `dem += 1`.

```python run
tong = 0
for ngay in range(1, 6):
    tong += ngay
print("Tổng cộng:", tong, "vòng")
```

Nếu con viết ngược thành `tong =+ ngay`, Python hiểu là `tong = +ngay`, tức là gán số ngay cho tong. Python không báo lỗi, nhưng tong chỉ giữ số của ngày cuối, nên chương trình in ra 5 thay vì 15.
