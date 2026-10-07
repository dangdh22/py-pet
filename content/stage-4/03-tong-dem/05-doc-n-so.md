---
id: s4.tong-dem.l5
title: { vi: "Đọc n số", en: "Reading n numbers" }
exercises:
  - id: s4.tong-dem.l5.ex1
    type: code
    concepts: [accumulator-init, count-if]
    prompt:
      vi: "Robo bán kem. Ô Dữ liệu nhập: dòng đầu là số ngày n (số nguyên không âm), n dòng sau là số que kem bán được mỗi ngày. Hãy in ra tổng số que kem, và số ngày bán được từ 10 que trở lên, như phần Ví dụ. Nếu n là 0, cả 2 số đều là 0."
      en: "Robo sells ice cream. The Input data box: the first line is the number of days n (an integer that is not negative), and the n lines after it are the numbers of ice creams sold each day. Print the total number of ice creams, and the number of days with 10 or more sold, as in the Example. If n is 0, both numbers are 0."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      tong = 0
      dem = 0
      for i in range(n):
          que = int(input())
          tong += que
          if que >= 10:
              dem += 1
      print("Tổng số que kem:", tong)
      print("Số ngày bán từ 10 que trở lên:", dem)
    tests:
      - input: "4\n12\n7\n10\n15"
        output: |
          Tổng số que kem: 44
          Số ngày bán từ 10 que trở lên: 3
      - input: "0"
        output: |
          Tổng số que kem: 0
          Số ngày bán từ 10 que trở lên: 0
        hidden: true
      - input: "1\n9"
        output: |
          Tổng số que kem: 9
          Số ngày bán từ 10 que trở lên: 0
        hidden: true
      - input: "6\n20\n3\n11\n10\n9\n30"
        output: |
          Tổng số que kem: 83
          Số ngày bán từ 10 que trở lên: 4
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Tổng số que kem: 44
          Số ngày bán từ 10 que trở lên: 2
        misconception: boundary-check
        sample: |
          n = int(input())
          tong = 0
          dem = 0
          for i in range(n):
              que = int(input())
              tong += que
              if que > 10:
                  dem += 1
          print("Tổng số que kem:", tong)
          print("Số ngày bán từ 10 que trở lên:", dem)
    hints:
      - { vi: "Đọc n ở dòng đầu, rồi đặt tong = 0 và dem = 0. Vòng lặp for i in range(n): chạy n lần, mỗi lần đọc số que kem của 1 ngày, cộng vào tong, và cộng 1 vào dem nếu số đó từ 10 trở lên.", en: "Read n on the first line, then set tong = 0 and dem = 0. The loop for i in range(n): runs n times, and each time it reads the ice creams of 1 day, adds them to tong, and adds 1 to dem if that number is 10 or more." }
      - { vi: "Trong vòng lặp, thụt lề 4 dấu cách: que = int(input()), tong += que và if que >= 10:, rồi dem += 1 thụt lề 8 dấu cách. Sau vòng lặp, 2 dòng print sát lề trái.", en: "Inside the loop, indented by 4 spaces: que = int(input()), tong += que and if que >= 10:, then dem += 1 indented by 8 spaces. After the loop, 2 print lines at the left edge." }
    test_eligible: true
  - id: s4.tong-dem.l5.ex2
    type: code
    concepts: [running-max]
    prompt:
      vi: "Robo đo nhiệt độ ở Sa Pa vào mùa đông. Ô Dữ liệu nhập: dòng đầu là số ngày n (n lớn hơn 0), n dòng sau là nhiệt độ của từng ngày, là số nguyên và có thể âm. Hãy in ra nhiệt độ cao nhất và thấp nhất, như phần Ví dụ."
      en: "Robo measures the temperature in Sa Pa in winter. The Input data box: the first line is the number of days n (n is greater than 0), and the n lines after it are the temperatures of the days, integers that may be negative. Print the highest and the lowest temperature, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      for i in range(n):
          t = int(input())
          if i == 0:
              cao = t
              thap = t
          if t > cao:
              cao = t
          if t < thap:
              thap = t
      print("Cao nhất:", cao, "độ")
      print("Thấp nhất:", thap, "độ")
    tests:
      - input: "5\n12\n-3\n8\n15\n0"
        output: |
          Cao nhất: 15 độ
          Thấp nhất: -3 độ
      - input: "1\n-4"
        output: |
          Cao nhất: -4 độ
          Thấp nhất: -4 độ
        hidden: true
      - input: "4\n-2\n-7\n-1\n-5"
        output: |
          Cao nhất: -1 độ
          Thấp nhất: -7 độ
        hidden: true
      - input: "3\n6\n9\n2"
        output: |
          Cao nhất: 9 độ
          Thấp nhất: 2 độ
        hidden: true
    common_wrong:
      - test: 1
        output: |
          Cao nhất: 0 độ
          Thấp nhất: -4 độ
        misconception: running-max
        sample: |
          n = int(input())
          cao = 0
          thap = 0
          for i in range(n):
              t = int(input())
              if t > cao:
                  cao = t
              if t < thap:
                  thap = t
          print("Cao nhất:", cao, "độ")
          print("Thấp nhất:", thap, "độ")
    hints:
      - { vi: "Cả cao và thap phải bắt đầu từ nhiệt độ đầu tiên, không phải từ 0. Trong vòng lặp, ngay sau khi đọc t, viết if i == 0: để gán cao = t và thap = t ở lần lặp đầu tiên. Sau đó, dùng 2 lệnh if riêng để so sánh t với cao và với thap.", en: "Both cao and thap must start from the first temperature, not from 0. Inside the loop, right after reading t, write if i == 0: to set cao = t and thap = t on the first pass. Then use 2 separate if statements to compare t with cao and with thap." }
      - { vi: "Trong for i in range(n):, các dòng thụt lề 4 dấu cách là t = int(input()), if i == 0:, if t > cao:, if t < thap:. Dưới if i == 0: là 2 dòng cao = t và thap = t. Dưới if t > cao: là cao = t, và dưới if t < thap: là thap = t. Các dòng gán này đều thụt lề 8 dấu cách. Sau vòng lặp là 2 dòng print.", en: "In for i in range(n):, the lines indented by 4 spaces are t = int(input()), if i == 0:, if t > cao:, if t < thap:. Under if i == 0: come the 2 lines cao = t and thap = t. Under if t > cao: comes cao = t, and under if t < thap: comes thap = t. These lines are all indented by 8 spaces. After the loop come 2 print lines." }
    test_eligible: true
  - id: s4.tong-dem.l5.q1
    type: mcq
    concepts: [accumulator-init]
    code: |
      n = int(input())
      total = 0
      for i in range(n):
          x = int(input())
          total += x
      print(total)
    prompt:
      vi: "Ô Dữ liệu nhập có 4 dòng: 2, 10, 20, 5. Đoạn code in ra gì?"
      en: "The Input data box has 4 lines: 2, 10, 20, 5. What is the output of this code?"
    choices:
      - { text: "35" }
      - { text: "30", correct: true }
      - { text: "32" }
      - { vi: "Báo lỗi, vì số 5 ở dòng cuối không được đọc", en: "An error, because the number 5 on the last line is never read", error: true, misconception: input-one-line }
    explanation:
      vi: "Dòng đầu cho n là 2, nên vòng lặp chạy 2 lần và đọc 2 dòng tiếp theo là 10 và 20. total là 10 + 20 = 30. Số n chỉ cho biết có mấy số, nên không được cộng vào total. Số 5 ở dòng cuối không được đọc, và các dòng thừa chỉ bị bỏ qua, Python không báo lỗi."
      en: "The first line makes n equal to 2, so the loop runs 2 times and reads the next 2 lines, 10 and 20. total is 10 + 20 = 30. The number n only tells how many numbers there are, so it is not added to total. The number 5 on the last line is never read, and extra lines are just skipped, so Python gives no error."
  - id: s4.tong-dem.l5.q2
    type: predict
    concepts: [running-max]
    code: |
      for i in range(4):
          x = 10 - i * 3
          if i == 0:
              small = x
          if x < small:
              small = x
      print(small)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1", correct: true }
      - { text: "10", misconception: running-max }
      - { text: "0", misconception: running-max }
      - { vi: "Báo lỗi, vì small được dùng trước khi được gán", en: "An error, because small is used before it is given a value", error: true, misconception: var-before-use }
    explanation:
      vi: "x lần lượt là 10, 7, 4 và 1. Ở lần lặp đầu tiên, i == 0 là True, nên small được gán là 10 trước khi Python so sánh x < small, và không có lỗi. Ở các lần lặp sau, mỗi số mới đều nhỏ hơn small, nên small thành 7, 4, rồi 1."
      en: "x is 10, then 7, 4 and 1. On the first pass, i == 0 is True, so small is set to 10 before Python compares x < small, and there is no error. On the later passes, each new number is smaller than small, so small becomes 7, 4, then 1."
---
Nhiều bài cho dữ liệu theo cách này: **dòng đầu là n**, cho biết có bao nhiêu số, và **n dòng sau** là các số. Con biết trước số lần lặp là n, nên con dùng for. Mỗi lần lặp, `int(input())` đọc 1 dòng mới:

```python
n = int(input())
for i in range(n):
    so = int(input())
    print("Số thứ", i + 1, "là", so)
```

Với 4 dòng là 3, 10, 20 và 5, dòng đầu cho n là 3, và vòng lặp đọc 3 số 10, 20, 5. Số 3 chỉ cho biết có mấy số, không phải 1 số trong dãy.
---
Trong cùng 1 vòng lặp, con dùng được nhiều biến tích lũy. Robo tính tổng các số, và đếm xem có mấy số chẵn:

```python
n = int(input())
tong = 0
dem_chan = 0
for i in range(n):
    so = int(input())
    tong += so
    if so % 2 == 0:
        dem_chan += 1
print("Tổng:", tong)
print("Có", dem_chan, "số chẵn")
```

Với 3, 10, 7 và 4 (n là 3), chương trình in ra Tổng: 21 và Có 2 số chẵn. Mọi biến tích lũy đều được gán giá trị ban đầu trước vòng lặp.
---
Muốn tìm số lớn nhất, con bắt đầu từ **số đầu tiên**. Khi mọi số đều được đọc trong vòng lặp, lần lặp đầu tiên là lần có `i == 0`:

```python
n = int(input())
for i in range(n):
    so = int(input())
    if i == 0:
        lon_nhat = so
    if so > lon_nhat:
        lon_nhat = so
print("Lớn nhất:", lon_nhat)
```

Ở lần lặp đầu tiên, Robo gán số đó cho lon_nhat, rồi mới so sánh. Ở các lần lặp sau, i khác 0, nên Robo chỉ so sánh như ở bài trước.
---
Nếu dòng đầu là 0, vòng lặp chạy 0 lần, và lon_nhat không bao giờ được gán. Thẻ này không có ô Dữ liệu nhập, nên con thay dòng đọc n bằng `n = 0`:

```python run
n = 0  # giống như dòng đầu con gõ là 0
tong = 0
for i in range(n):
    so = int(input())
    tong += so
    if i == 0:
        lon_nhat = so
    if so > lon_nhat:
        lon_nhat = so
print("Tổng:", tong)
if n > 0:
    print("Lớn nhất:", lon_nhat)
else:
    print("Không có số nào")
```

tong vẫn là 0, nên in tổng thì không sao. Nhưng lon_nhat chưa có giá trị, nên con chỉ in nó khi n > 0. Khi thử chương trình, con nhớ thử n bằng 0, n bằng 1, và n lớn hơn.
