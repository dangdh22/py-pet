---
id: s4.tong-dem.l4
title: { vi: "Trung bình", en: "The average" }
exercises:
  - id: s4.tong-dem.l4.ex1
    type: code
    concepts: [average-zero-count, accumulator-init]
    prompt:
      vi: "Robo ghi lại số trang sách đọc mỗi ngày. Ô Dữ liệu nhập có nhiều dòng: mỗi dòng là số trang của 1 ngày (số nguyên lớn hơn 0), và dòng cuối cùng là 0. Hãy in ra tổng số trang, số ngày, và số trang trung bình mỗi ngày với đúng 2 chữ số sau dấu chấm (dùng :.2f), như phần Ví dụ. Nếu dòng đầu tiên đã là 0, chỉ in ra Robo chưa đọc ngày nào."
      en: "Robo writes down how many pages it reads each day. The Input data box has several lines: each line is the number of pages of 1 day (an integer greater than 0), and the last line is 0. Print the total number of pages, the number of days, and the average number of pages per day with exactly 2 digits after the decimal point (use :.2f), as in the Example. If the first line is already 0, print only Robo chưa đọc ngày nào."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tong = 0
      dem = 0
      trang = int(input())
      while trang != 0:
          tong += trang
          dem += 1
          trang = int(input())
      if dem > 0:
          print("Robo đọc", tong, "trang trong", dem, "ngày")
          print(f"Trung bình mỗi ngày: {tong / dem:.2f} trang")
      else:
          print("Robo chưa đọc ngày nào")
    tests:
      - input: "20\n35\n30\n0"
        output: |
          Robo đọc 85 trang trong 3 ngày
          Trung bình mỗi ngày: 28.33 trang
      - input: "12\n0"
        output: |
          Robo đọc 12 trang trong 1 ngày
          Trung bình mỗi ngày: 12.00 trang
        hidden: true
      - input: "0"
        output: "Robo chưa đọc ngày nào"
        hidden: true
      - input: "10\n15\n20\n25\n0"
        output: |
          Robo đọc 70 trang trong 4 ngày
          Trung bình mỗi ngày: 17.50 trang
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Robo đọc 85 trang trong 3 ngày
          Trung bình mỗi ngày: 28.00 trang
        misconception: floor-div
        sample: |
          tong = 0
          dem = 0
          trang = int(input())
          while trang != 0:
              tong += trang
              dem += 1
              trang = int(input())
          if dem > 0:
              print("Robo đọc", tong, "trang trong", dem, "ngày")
              print(f"Trung bình mỗi ngày: {tong // dem:.2f} trang")
          else:
              print("Robo chưa đọc ngày nào")
    hints:
      - { vi: "Đặt tong = 0 và dem = 0 trước vòng lặp, rồi đọc số trang đầu tiên. Trong khối của while, cộng số trang vào tong, cộng 1 vào dem, rồi đọc dòng tiếp theo. Sau vòng lặp, chỉ chia khi dem > 0; nếu không, in ra Robo chưa đọc ngày nào.", en: "Set tong = 0 and dem = 0 before the loop, then read the first number of pages. In the while block, add the pages to tong, add 1 to dem, then read the next line. After the loop, divide only when dem > 0; otherwise print Robo chưa đọc ngày nào." }
      - { vi: "Vòng lặp: while trang != 0: với tong += trang, dem += 1 và trang = int(input()). Sau đó: if dem > 0: với 2 dòng print, dòng thứ hai là print(f\"Trung bình mỗi ngày: {tong / dem:.2f} trang\"), và else: với print(\"Robo chưa đọc ngày nào\").", en: "The loop: while trang != 0: with tong += trang, dem += 1 and trang = int(input()). Then: if dem > 0: with 2 print lines, the second one being print(f\"Trung bình mỗi ngày: {tong / dem:.2f} trang\"), and else: with print(\"Robo chưa đọc ngày nào\")." }
    test_eligible: true
  - id: s4.tong-dem.l4.ex2
    type: code
    concepts: [average-zero-count, count-if]
    prompt:
      vi: "Robo thi nhảy xa 5 lần. Lần nào phạm quy thì trọng tài ghi 0, và lần đó không được tính. Ô Dữ liệu nhập có 5 dòng: thành tích 5 lần nhảy, tính bằng cm, mỗi dòng 1 số nguyên (0 là phạm quy). Hãy in ra thành tích trung bình của các lần không phạm quy, với đúng 2 chữ số sau dấu chấm, như phần Ví dụ. Nếu cả 5 lần đều phạm quy, in ra Không có lần nhảy nào được tính."
      en: "Robo takes 5 long jumps. When a jump is a foul, the judge writes 0, and that jump does not count. The Input data box has 5 lines: the results of the 5 jumps in cm, each line an integer (0 is a foul). Print the average result of the jumps that are not fouls, with exactly 2 digits after the decimal point, as in the Example. If all 5 jumps are fouls, print Không có lần nhảy nào được tính."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tong = 0
      dem = 0
      for i in range(5):
          cm = int(input())
          if cm > 0:
              tong += cm
              dem += 1
      if dem > 0:
          print(f"Trung bình: {tong / dem:.2f} cm")
      else:
          print("Không có lần nhảy nào được tính")
    tests:
      - input: "150\n0\n162\n145\n0"
        output: "Trung bình: 152.33 cm"
      - input: "0\n0\n0\n0\n0"
        output: "Không có lần nhảy nào được tính"
        hidden: true
      - input: "0\n0\n171\n0\n0"
        output: "Trung bình: 171.00 cm"
        hidden: true
      - input: "140\n155\n0\n150\n148"
        output: "Trung bình: 148.25 cm"
        hidden: true
    common_wrong:
      - test: 0
        output: "Trung bình: 91.40 cm"
        misconception: count-if
        sample: |
          tong = 0
          for i in range(5):
              cm = int(input())
              tong += cm
          print(f"Trung bình: {tong / 5:.2f} cm")
    hints:
      - { vi: "Con cần 2 biến tích lũy: tong cho tổng số cm và dem cho số lần được tính. Chỉ khi cm > 0 thì mới cộng vào tong và dem. Sau vòng lặp, kiểm tra dem > 0 trước khi chia, vì có thể không lần nào được tính.", en: "You need 2 running variables: tong for the total cm and dem for the number of jumps that count. Add to tong and dem only when cm > 0. After the loop, check dem > 0 before you divide, because maybe no jump counts." }
      - { vi: "Trong for i in range(5): đọc cm = int(input()), rồi if cm > 0: với tong += cm và dem += 1 thụt lề 8 dấu cách. Sau vòng lặp: if dem > 0: với print(f\"Trung bình: {tong / dem:.2f} cm\"), và else: với print(\"Không có lần nhảy nào được tính\").", en: "In for i in range(5): read cm = int(input()), then if cm > 0: with tong += cm and dem += 1 indented by 8 spaces. After the loop: if dem > 0: with print(f\"Trung bình: {tong / dem:.2f} cm\"), and else: with print(\"Không có lần nhảy nào được tính\")." }
    test_eligible: true
  - id: s4.tong-dem.l4.q1
    type: predict
    concepts: [average-zero-count]
    code: |
      total = 0
      count = 0
      for i in range(3, 3):
          total += i
          count += 1
      if count > 0:
          print(total / count)
      else:
          print("none")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "0.0", misconception: average-zero-count }
      - { text: "none", correct: true }
      - { vi: "Báo lỗi ZeroDivisionError, vì count là 0", en: "A ZeroDivisionError, because count is 0", error: true, misconception: average-zero-count }
      - { text: "3.0", misconception: range-stop-excluded }
    explanation:
      vi: "range(3, 3) dừng trước 3, nên không có số nào, và vòng lặp chạy 0 lần. count vẫn là 0, nên count > 0 là False và Python chạy nhánh else, in ra none. Phép chia total / count nằm trong nhánh if, nên không chạy, và không có lỗi chia cho 0."
      en: "range(3, 3) stops before 3, so it has no numbers, and the loop runs 0 times. count is still 0, so count > 0 is False and Python runs the else branch, which prints none. The division total / count is in the if branch, so it does not run, and there is no division by 0."
  - id: s4.tong-dem.l4.q2
    type: mcq
    concepts: [average-zero-count]
    prompt:
      vi: "Chương trình của Robo đọc các số đến khi gặp 0, rồi in ra trung bình bằng tong / dem. Nếu ngay dòng đầu tiên đã là 0, chương trình nên làm gì?"
      en: "Robo's program reads numbers until it meets 0, then prints the average with tong / dem. If the very first line is already 0, what should the program do?"
    choices:
      - { vi: "Chia như bình thường, vì 0 chia cho 0 sẽ ra 0", en: "Divide as usual, because 0 divided by 0 gives 0", misconception: average-zero-count }
      - { vi: "Chia cho dem + 1 thay cho dem, để không bao giờ chia cho 0", en: "Divide by dem + 1 instead of dem, so that it never divides by 0", misconception: average-zero-count }
      - { vi: "Đặt dem = 1 trước vòng lặp thay cho dem = 0", en: "Set dem = 1 before the loop instead of dem = 0", misconception: accumulator-init }
      - { vi: "Chỉ chia khi dem > 0, còn không thì báo chưa có số nào", en: "Divide only when dem > 0, otherwise say there are no numbers yet", correct: true }
    explanation:
      vi: "Khi không có số nào, dem là 0, và tong / dem làm Python báo lỗi ZeroDivisionError. Chia cho dem + 1 hay bắt đầu dem = 1 thì không còn lỗi, nhưng trung bình sẽ sai mỗi khi có số. Cách đúng là dùng if dem > 0: để chỉ chia khi có số, và dùng else để báo chưa có số nào."
      en: "When there are no numbers, dem is 0, and tong / dem makes Python give a ZeroDivisionError. Dividing by dem + 1 or starting with dem = 1 removes the error, but then the average is wrong whenever there are numbers. The right way is to use if dem > 0: so that it divides only when there are numbers, and use else to say there are no numbers yet."
---
Robo xếp 5 chồng sách: chồng thứ nhất có 2 cuốn, rồi 4, 6, 8 và 10 cuốn. Trung bình mỗi chồng có mấy cuốn? **Trung bình cộng** là tổng chia cho số lượng. Trong cùng 1 vòng lặp, Robo cộng dồn vào tong và đếm bằng dem:

```python run
tong = 0
dem = 0
for so_sach in range(2, 11, 2):
    tong += so_sach
    dem += 1
print("Tổng:", tong, "cuốn trong", dem, "chồng")
print("Trung bình:", tong / dem)
```

Phép chia nằm sau vòng lặp, sát lề trái, nên chỉ chạy 1 lần, khi đã cộng và đếm xong. Phép `/` luôn cho số thực, nên Robo in ra 6.0.
---
Robo đọc số trang sách của từng ngày, đến khi gặp 0, giống bài nhập đến khi gặp 0 của chủ đề while. Con nhớ `:.2f` ở giai đoạn 2: nó in đúng 2 chữ số sau dấu chấm.

```python
tong = 0
dem = 0
trang = int(input())
while trang != 0:
    tong += trang
    dem += 1
    trang = int(input())
print(f"Trung bình mỗi ngày: {tong / dem:.2f} trang")
```

Với 4 dòng là 20, 35, 30 và 0, tong là 85, dem là 3, và chương trình in ra Trung bình mỗi ngày: 28.33 trang.
---
Nếu ngay dòng đầu tiên đã là 0, vòng lặp chạy 0 lần và dem vẫn là 0. Thẻ này không có ô Dữ liệu nhập, nên con thay lần đọc đầu tiên bằng `trang = 0`:

```python run expect-error
tong = 0
dem = 0
trang = 0  # giống như dòng đầu con gõ là 0
while trang != 0:
    tong += trang
    dem += 1
    trang = int(input())
print(f"Trung bình mỗi ngày: {tong / dem:.2f} trang")
```

Lời báo lỗi là ZeroDivisionError: division by zero, nghĩa là chia cho 0. Không ai chia được 1 số cho 0, kể cả Python.
---
Vì vậy, trước khi chia, con kiểm tra **dem > 0** bằng if. Nếu không có số nào, Robo in ra 1 câu báo, thay vì chia:

```python run
tong = 0
dem = 0
trang = 0  # giống như dòng đầu con gõ là 0
while trang != 0:
    tong += trang
    dem += 1
    trang = int(input())
if dem > 0:
    print(f"Trung bình mỗi ngày: {tong / dem:.2f} trang")
else:
    print("Robo chưa đọc ngày nào")
```

Khi thử chương trình tính trung bình, con nhớ thử cả trường hợp không có số nào.
