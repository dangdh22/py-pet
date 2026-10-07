---
id: s4.tong-dem.l6
title: { vi: "Thống kê điểm của lớp", en: "Class score statistics" }
exercises:
  - id: s4.tong-dem.l6.ex1
    type: code
    concepts: [average-zero-count, running-max, count-if]
    prompt:
      vi: "Cô giáo nhờ Robo thống kê điểm kiểm tra của lớp. Ô Dữ liệu nhập: dòng đầu là số bạn n (số nguyên không âm), n dòng sau là điểm của từng bạn, mỗi điểm là 1 số nguyên từ 0 đến 10. Hãy in ra 4 dòng: điểm trung bình với đúng 2 chữ số sau dấu chấm, điểm cao nhất, điểm thấp nhất, và số bạn đạt từ 5 điểm trở lên, như phần Ví dụ. Nếu n là 0, chỉ in ra Lớp chưa có điểm."
      en: "The teacher asks Robo for statistics of the class test scores. The Input data box: the first line is the number of children n (an integer that is not negative), and the n lines after it are the scores of the children, each an integer from 0 to 10. Print 4 lines: the average score with exactly 2 digits after the decimal point, the highest score, the lowest score, and the number of children who scored 5 or more, as in the Example. If n is 0, print only Lớp chưa có điểm."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      tong = 0
      dem_dat = 0
      for i in range(n):
          diem = int(input())
          tong += diem
          if diem >= 5:
              dem_dat += 1
          if i == 0:
              cao = diem
              thap = diem
          if diem > cao:
              cao = diem
          if diem < thap:
              thap = diem
      if n > 0:
          print(f"Điểm trung bình: {tong / n:.2f}")
          print("Cao nhất:", cao)
          print("Thấp nhất:", thap)
          print("Số bạn đạt:", dem_dat)
      else:
          print("Lớp chưa có điểm")
    tests:
      - input: "4\n7\n9\n4\n9"
        output: |
          Điểm trung bình: 7.25
          Cao nhất: 9
          Thấp nhất: 4
          Số bạn đạt: 3
      - input: "0"
        output: "Lớp chưa có điểm"
        hidden: true
      - input: "1\n5"
        output: |
          Điểm trung bình: 5.00
          Cao nhất: 5
          Thấp nhất: 5
          Số bạn đạt: 1
        hidden: true
      - input: "6\n3\n10\n0\n6\n4\n8"
        output: |
          Điểm trung bình: 5.17
          Cao nhất: 10
          Thấp nhất: 0
          Số bạn đạt: 3
        hidden: true
      - input: "3\n2\n4\n1"
        output: |
          Điểm trung bình: 2.33
          Cao nhất: 4
          Thấp nhất: 1
          Số bạn đạt: 0
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Điểm trung bình: 7.25
          Cao nhất: 9
          Thấp nhất: 0
          Số bạn đạt: 3
        misconception: running-max
        sample: |
          n = int(input())
          tong = 0
          dem_dat = 0
          cao = 0
          thap = 0
          for i in range(n):
              diem = int(input())
              tong += diem
              if diem >= 5:
                  dem_dat += 1
              if diem > cao:
                  cao = diem
              if diem < thap:
                  thap = diem
          if n > 0:
              print(f"Điểm trung bình: {tong / n:.2f}")
              print("Cao nhất:", cao)
              print("Thấp nhất:", thap)
              print("Số bạn đạt:", dem_dat)
          else:
              print("Lớp chưa có điểm")
    hints:
      - { vi: "Trước vòng lặp: đọc n, đặt tong = 0 và dem_dat = 0. Trong vòng lặp: đọc điểm, cộng vào tong, đếm nếu điểm từ 5 trở lên, và dùng if i == 0: để cao và thap bắt đầu từ điểm đầu tiên. Sau vòng lặp: nếu n > 0 thì in 4 dòng, nếu không thì in Lớp chưa có điểm.", en: "Before the loop: read n, set tong = 0 and dem_dat = 0. Inside the loop: read the score, add it to tong, count it if it is 5 or more, and use if i == 0: so that cao and thap start from the first score. After the loop: if n > 0, print 4 lines, otherwise print Lớp chưa có điểm." }
      - { vi: "Trong vòng lặp, sau diem = int(input()) và tong += diem, con viết 4 lệnh if: if diem >= 5: với dem_dat += 1; if i == 0: với cao = diem và thap = diem; if diem > cao: với cao = diem; if diem < thap: với thap = diem. Dòng in trung bình là print(f\"Điểm trung bình: {tong / n:.2f}\").", en: "Inside the loop, after diem = int(input()) and tong += diem, write 4 if statements: if diem >= 5: with dem_dat += 1; if i == 0: with cao = diem and thap = diem; if diem > cao: with cao = diem; if diem < thap: with thap = diem. The line that prints the average is print(f\"Điểm trung bình: {tong / n:.2f}\")." }
    test_eligible: true
  - id: s4.tong-dem.l6.ex2
    type: code
    concepts: [accumulator-init, running-max]
    prompt:
      vi: "Robo viết chương trình in ra tổng điểm và điểm thấp nhất của n bạn, nhưng chương trình có 2 lỗi và in sai cả 2 dòng. Ô Dữ liệu nhập: dòng đầu là số bạn n (n lớn hơn 0), n dòng sau là điểm của từng bạn, mỗi điểm là 1 số nguyên từ 0 đến 10. Hãy sửa code để chương trình in đúng như phần Ví dụ."
      en: "Robo wrote a program that prints the total score and the lowest score of n children, but the program has 2 mistakes and prints both lines wrong. The Input data box: the first line is the number of children n (n is greater than 0), and the n lines after it are the scores of the children, each an integer from 0 to 10. Fix the code so that the program prints as in the Example."
    starter: |
      n = int(input())
      thap = 0
      for i in range(n):
          tong = 0
          diem = int(input())
          tong += diem
          if diem < thap:
              thap = diem
      print("Tổng điểm:", tong)
      print("Thấp nhất:", thap)
    solution: |
      n = int(input())
      tong = 0
      for i in range(n):
          diem = int(input())
          tong += diem
          if i == 0:
              thap = diem
          if diem < thap:
              thap = diem
      print("Tổng điểm:", tong)
      print("Thấp nhất:", thap)
    tests:
      - input: "3\n6\n8\n5"
        output: |
          Tổng điểm: 19
          Thấp nhất: 5
      - input: "1\n7"
        output: |
          Tổng điểm: 7
          Thấp nhất: 7
        hidden: true
      - input: "5\n10\n9\n3\n7\n3"
        output: |
          Tổng điểm: 32
          Thấp nhất: 3
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Tổng điểm: 19
          Thấp nhất: 0
        misconception: running-max
        sample: |
          n = int(input())
          tong = 0
          thap = 0
          for i in range(n):
              diem = int(input())
              tong += diem
              if diem < thap:
                  thap = diem
          print("Tổng điểm:", tong)
          print("Thấp nhất:", thap)
      - test: 0
        output: |
          Tổng điểm: 5
          Thấp nhất: 5
        misconception: accumulator-init
        sample: |
          n = int(input())
          for i in range(n):
              tong = 0
              diem = int(input())
              tong += diem
              if i == 0:
                  thap = diem
              if diem < thap:
                  thap = diem
          print("Tổng điểm:", tong)
          print("Thấp nhất:", thap)
    hints:
      - { vi: "Lỗi thứ nhất: dòng tong = 0 nằm trong vòng lặp, nên tong bị đặt lại về 0 ở mỗi lần lặp. Lỗi thứ hai: thap bắt đầu từ 0, mà không điểm nào nhỏ hơn 0, nên thap luôn là 0.", en: "The first mistake: the line tong = 0 is inside the loop, so tong is set back to 0 on every pass. The second mistake: thap starts at 0, and no score is smaller than 0, so thap is always 0." }
      - { vi: "Chuyển dòng tong = 0 lên trước vòng lặp, sát lề trái, thay cho dòng thap = 0. Trong vòng lặp, ngay sau tong += diem, thêm if i == 0: với dòng thap = diem thụt lề 8 dấu cách.", en: "Move the line tong = 0 up before the loop, at the left edge, in place of the line thap = 0. Inside the loop, right after tong += diem, add if i == 0: with the line thap = diem indented by 8 spaces." }
    test_eligible: true
  - id: s4.tong-dem.l6.q1
    type: mcq
    concepts: [average-zero-count]
    prompt:
      vi: "Robo viết xong chương trình thống kê điểm của lớp. Ô Dữ liệu nhập nào giúp Robo kiểm tra trường hợp có thể chia cho 0?"
      en: "Robo has finished the class score statistics program. Which Input data helps Robo check the case that could divide by 0?"
    choices:
      - { vi: "2 dòng là 1 và 0: lớp có 1 bạn, được 0 điểm", en: "2 lines, 1 and 0: the class has 1 child, who scored 0", misconception: average-zero-count }
      - { vi: "1 dòng là 0: lớp không có bạn nào", en: "1 line, 0: the class has no children", correct: true }
      - { vi: "4 dòng là 3, 5, 5, 5: cả 3 bạn đều được 5 điểm", en: "4 lines, 3, 5, 5, 5: all 3 children scored 5", misconception: boundary-check }
      - { vi: "6 dòng là 5, 0, 0, 0, 0, 0: cả 5 bạn đều được 0 điểm", en: "6 lines, 5, 0, 0, 0, 0, 0: all 5 children scored 0", misconception: average-zero-count }
    explanation:
      vi: "Trung bình là tổng chia cho số bạn n. Python chỉ chia cho 0 khi n là 0, tức là lớp không có bạn nào. Khi các bạn được 0 điểm, tổng là 0, nhưng số bạn vẫn lớn hơn 0, và 0 chia cho 5 vẫn ra 0.0, không có lỗi."
      en: "The average is the total divided by the number of children n. Python divides by 0 only when n is 0, that is, when the class has no children. When children score 0, the total is 0, but the number of children is still greater than 0, and 0 divided by 5 still gives 0.0, with no error."
  - id: s4.tong-dem.l6.q2
    type: predict
    concepts: [count-if, accumulator-init]
    code: |
      total = 0
      passed = 0
      for x in range(3, 8):
          total += x
          if x >= 5:
              passed += 1
      print(total, passed)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "25 5", misconception: count-if }
      - { text: "25 2", misconception: boundary-check }
      - { text: "18 2", misconception: range-stop-excluded }
      - { text: "25 3", correct: true }
    explanation:
      vi: "range(3, 8) cho x là 3, 4, 5, 6, 7. total cộng cả 5 số: 3 + 4 + 5 + 6 + 7 = 25. passed chỉ cộng 1 khi x >= 5, tức là với 5, 6 và 7, nên passed là 3. Số 5 cũng được đếm, vì 5 >= 5 là True."
      en: "range(3, 8) gives x the values 3, 4, 5, 6, 7. total adds all 5 numbers: 3 + 4 + 5 + 6 + 7 = 25. passed adds 1 only when x >= 5, that is, for 5, 6 and 7, so passed is 3. The 5 is counted too, because 5 >= 5 is True."
---
Cô giáo nhờ Robo thống kê điểm kiểm tra của lớp: điểm trung bình, điểm cao nhất, điểm thấp nhất, và số bạn đạt từ 5 điểm trở lên. Bài này dùng mọi thứ con đã học trong chủ đề. Trước khi viết code, Robo lên **kế hoạch** cho 3 phần:

- Trước vòng lặp: đọc n, và gán giá trị ban đầu cho các biến tích lũy: `tong = 0`, `dem_dat = 0`.
- Trong vòng lặp: đọc điểm, cộng vào tong, đếm nếu đạt, và cập nhật cao nhất, thấp nhất.
- Sau vòng lặp: tính trung bình và in kết quả, nhưng chỉ khi lớp có ít nhất 1 bạn.
---
Robo thử trước phần cộng và đếm, với điểm của 5 bạn viết liền trong 1 chuỗi. Mỗi ký tự là 1 chữ số, và `int(ch)` đổi ký tự đó thành số:

```python run
diem_lop = "74958"
so_ban = 0
tong = 0
dem_dat = 0
for ch in diem_lop:
    diem = int(ch)
    so_ban += 1
    tong += diem
    if diem >= 5:
        dem_dat += 1
print("Số bạn:", so_ban)
print(f"Điểm trung bình: {tong / so_ban:.2f}")
print("Số bạn đạt:", dem_dat)
```

Con thử đổi chuỗi điểm rồi chạy lại. Trong bài tập, điểm được đọc bằng `int(input())`, và có thể có điểm 10.
---
Để cao nhất và thấp nhất bắt đầu từ điểm đầu tiên, Robo dùng `if i == 0:` như ở bài Đọc n số. Thứ tự các dòng trong vòng lặp rất quan trọng:

```python
for i in range(n):
    diem = int(input())
    if i == 0:
        cao = diem
        thap = diem
    if diem > cao:
        cao = diem
    if diem < thap:
        thap = diem
```

Khối `if i == 0:` phải đứng trước 2 lệnh so sánh, để ở lần lặp đầu tiên, cao và thap đã có giá trị khi Python so sánh.
---
Viết xong, Robo thử chương trình với nhiều bộ dữ liệu khác nhau:

- n là 0: lớp chưa có bạn nào, chương trình không được chia cho 0.
- n là 1: cao nhất và thấp nhất là cùng 1 điểm.
- Có bạn được đúng 5 điểm: bạn đó phải được đếm là đạt.
- Có bạn được 0 điểm hay 10 điểm: điểm thấp nhất hay cao nhất phải đúng.

Mỗi bộ dữ liệu kiểm tra 1 chỗ dễ sai. Thử đủ các trường hợp này, con sẽ tìm ra lỗi trước khi cô giáo tìm ra.
