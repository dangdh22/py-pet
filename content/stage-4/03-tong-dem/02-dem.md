---
id: s4.tong-dem.l2
title: { vi: "Đếm", en: "Counting" }
exercises:
  - id: s4.tong-dem.l2.ex1
    type: code
    concepts: [count-if]
    prompt:
      vi: "Tổ của Robo có 6 bạn vừa làm bài kiểm tra. Ô Dữ liệu nhập có 6 dòng: điểm của 6 bạn, mỗi dòng 1 số nguyên từ 0 đến 10. Hãy dùng vòng lặp for, 1 biến đếm và lệnh if để đếm số bạn đạt từ 5 điểm trở lên, rồi in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo's group has 6 children who just took a test. The Input data box has 6 lines: the scores of the 6 children, each line an integer from 0 to 10. Use a for loop, a counter variable and an if statement to count the children who scored 5 or more, then print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      dem = 0
      for i in range(6):
          diem = int(input())
          if diem >= 5:
              dem += 1
      print("Có", dem, "bạn đạt từ 5 điểm trở lên")
    tests:
      - input: "7\n4\n5\n9\n3\n10"
        output: "Có 4 bạn đạt từ 5 điểm trở lên"
      - input: "2\n4\n0\n3\n1\n4"
        output: "Có 0 bạn đạt từ 5 điểm trở lên"
        hidden: true
      - input: "3\n5\n2\n4\n1\n0"
        output: "Có 1 bạn đạt từ 5 điểm trở lên"
        hidden: true
      - input: "8\n6\n10\n5\n7\n9"
        output: "Có 6 bạn đạt từ 5 điểm trở lên"
        hidden: true
    common_wrong:
      - test: 0
        output: "Có 6 bạn đạt từ 5 điểm trở lên"
        misconception: count-if
        sample: |
          dem = 0
          for i in range(6):
              diem = int(input())
              dem += 1
          print("Có", dem, "bạn đạt từ 5 điểm trở lên")
      - test: 0
        output: "Có 3 bạn đạt từ 5 điểm trở lên"
        misconception: boundary-check
        sample: |
          dem = 0
          for i in range(6):
              diem = int(input())
              if diem > 5:
                  dem += 1
          print("Có", dem, "bạn đạt từ 5 điểm trở lên")
    hints:
      - { vi: "Đặt dem = 0 trước vòng lặp. Vòng lặp chạy 6 lần, và mỗi lần đọc 1 điểm bằng int(input()). Chỉ khi diem >= 5 thì cộng 1 vào dem, nên dòng dem += 1 nằm trong khối của if.", en: "Set dem = 0 before the loop. The loop runs 6 times, and each time it reads 1 score with int(input()). Add 1 to dem only when diem >= 5, so the line dem += 1 goes inside the if block." }
      - { vi: "Sau dem = 0 là for i in range(6):. Trong vòng lặp, thụt lề 4 dấu cách: diem = int(input()) và if diem >= 5:. Dòng dem += 1 thụt lề 8 dấu cách. Cuối cùng, sát lề trái: print(\"Có\", dem, \"bạn đạt từ 5 điểm trở lên\").", en: "After dem = 0 comes for i in range(6):. Inside the loop, indented by 4 spaces: diem = int(input()) and if diem >= 5:. The line dem += 1 is indented by 8 spaces. Last, at the left edge: print(\"Có\", dem, \"bạn đạt từ 5 điểm trở lên\")." }
    test_eligible: true
  - id: s4.tong-dem.l2.ex2
    type: code
    concepts: [count-if, for-over-string]
    prompt:
      vi: "Robo đếm xem 1 chữ cái xuất hiện mấy lần trong 1 câu. Ô Dữ liệu nhập có 2 dòng: dòng 1 là câu, dòng 2 là 1 chữ cái. Python phân biệt chữ hoa và chữ thường, nên R và r là 2 chữ khác nhau. Hãy in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo counts how many times a letter appears in a sentence. The Input data box has 2 lines: line 1 is the sentence, line 2 is a letter. Python sees upper-case and lower-case letters as different, so R and r are 2 different letters. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      cau = input()
      chu = input()
      dem = 0
      for ch in cau:
          if ch == chu:
              dem += 1
      print("Chữ", chu, "xuất hiện", dem, "lần")
    tests:
      - input: "banana\na"
        output: "Chữ a xuất hiện 3 lần"
      - input: "Robo\nr"
        output: "Chữ r xuất hiện 0 lần"
        hidden: true
      - input: "Robo\nR"
        output: "Chữ R xuất hiện 1 lần"
        hidden: true
      - input: "hello world\nl"
        output: "Chữ l xuất hiện 3 lần"
        hidden: true
      - input: "x\nx"
        output: "Chữ x xuất hiện 1 lần"
        hidden: true
    common_wrong:
      - test: 0
        output: "Chữ a xuất hiện 6 lần"
        misconception: count-if
        sample: |
          cau = input()
          chu = input()
          dem = 0
          for ch in cau:
              dem += 1
          print("Chữ", chu, "xuất hiện", dem, "lần")
    hints:
      - { vi: "Đọc câu và chữ cái bằng 2 lần input(), rồi đặt dem = 0. Vòng lặp for ch in cau: đi qua từng ký tự. Khi ch == chu, cộng 1 vào dem.", en: "Read the sentence and the letter with 2 input() calls, then set dem = 0. The loop for ch in cau: goes through each character. When ch == chu, add 1 to dem." }
      - { vi: "Trong vòng lặp for ch in cau:, viết if ch == chu: thụt lề 4 dấu cách, và dem += 1 thụt lề 8 dấu cách. Sau vòng lặp, sát lề trái: print(\"Chữ\", chu, \"xuất hiện\", dem, \"lần\").", en: "Inside the loop for ch in cau:, write if ch == chu: indented by 4 spaces, and dem += 1 indented by 8 spaces. After the loop, at the left edge: print(\"Chữ\", chu, \"xuất hiện\", dem, \"lần\")." }
    test_eligible: true
  - id: s4.tong-dem.l2.q1
    type: predict
    concepts: [count-if]
    code: |
      count = 0
      for i in range(1, 11):
          if i % 4 == 0:
              count += 1
      print(count)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "10", misconception: count-if }
      - { text: "2", correct: true }
      - { text: "12", misconception: count-if }
      - { text: "4\n8", misconception: count-if }
    explanation:
      vi: "i đi từ 1 đến 10. Chỉ có 4 và 8 chia hết cho 4, nên điều kiện i % 4 == 0 đúng 2 lần, và count tăng lên 2. Mỗi lần điều kiện đúng, count chỉ cộng thêm 1, không cộng i. Dòng print(count) sát lề trái, nên chỉ in 1 số sau vòng lặp."
      en: "i goes from 1 to 10. Only 4 and 8 can be divided by 4, so the condition i % 4 == 0 is True 2 times, and count goes up to 2. Each time the condition is True, count adds only 1, not i. The line print(count) starts at the left edge, so it prints just 1 number after the loop."
  - id: s4.tong-dem.l2.q2
    type: mcq
    concepts: [count-if]
    prompt:
      vi: "Robo đọc điểm của nhiều bạn bằng vòng lặp for, và muốn đếm số bạn đạt từ 5 điểm trở lên. Dòng dem += 1 nên đặt ở đâu?"
      en: "Robo reads the scores of many children with a for loop, and wants to count the children who scored 5 or more. Where should the line dem += 1 go?"
    choices:
      - { vi: "Ngay dưới dòng for, thụt lề 4 dấu cách, ngang hàng với dòng if", en: "Right under the for line, indented by 4 spaces, level with the if line", misconception: count-if }
      - { vi: "Sau vòng lặp, sát lề trái, để chỉ cộng 1 lần", en: "After the loop, at the left edge, so that it adds only once", misconception: for-repeat }
      - { vi: "Trong khối của dòng if diem >= 5:, thụt lề 8 dấu cách", en: "Inside the block of the line if diem >= 5:, indented by 8 spaces", correct: true }
      - { vi: "Trước vòng lặp, ngay sau dòng dem = 0", en: "Before the loop, right after the line dem = 0", misconception: accumulator-init }
    explanation:
      vi: "Robo chỉ đếm bạn nào có điểm từ 5 trở lên, nên dem += 1 phải nằm trong khối của if, thụt lề 8 dấu cách. Nếu dòng đó ngang hàng với if, nó chạy ở mọi lần lặp và đếm cả các bạn dưới 5 điểm. Nếu đặt ngoài vòng lặp, nó chỉ chạy 1 lần."
      en: "Robo counts only the children with 5 or more, so dem += 1 must be inside the if block, indented by 8 spaces. If that line is level with the if, it runs on every pass and also counts the children below 5. If it is outside the loop, it runs only once."
---
Con đã gặp **biến đếm** rồi: khi đếm số ký tự trong tên, mỗi lần lặp con cộng thêm 1 vào dem. Biến đếm là 1 biến tích lũy, mỗi lần chỉ cộng thêm 1, nên con viết gọn là `dem += 1`.

Bây giờ Robo chỉ đếm những lần **điều kiện đúng**. Con đặt `dem += 1` trong khối của 1 lệnh if. Robo đếm các số chia hết cho 3, từ 1 đến 20:

```python run
dem = 0
for i in range(1, 21):
    if i % 3 == 0:
        dem += 1
print("Từ 1 đến 20 có", dem, "số chia hết cho 3")
```

Đó là 3, 6, 9, 12, 15 và 18: tất cả 6 số.
---
Dòng `dem += 1` thụt lề **8 dấu cách**, vì nó nằm trong khối của if, mà if lại nằm trong vòng lặp. Nếu con chỉ thụt lề 4 dấu cách, ngang hàng với if, dòng đó chạy ở mọi lần lặp:

```python run
dem = 0
for i in range(1, 21):
    if i % 3 == 0:
        print(i, "chia hết cho 3")
    dem += 1
print("Từ 1 đến 20 có", dem, "số chia hết cho 3")
```

Robo vẫn in đúng 6 số, nhưng dem là 20, vì Robo đã đếm cả 20 số.
---
Robo đếm được cả các ký tự trong 1 chuỗi. Robo đếm chữ o trong câu Robo con robot:

```python run
cau = "Robo con robot"
dem = 0
for ch in cau:
    if ch == "o":
        dem += 1
print("Có", dem, "chữ o")
```

Kết quả là 5. Python phân biệt chữ hoa và chữ thường: nếu đếm chữ r, Robo chỉ được 1, vì chữ R ở đầu câu là chữ hoa.
---
Robo đếm số bạn đạt từ 5 điểm trở lên trong 5 bạn. Mỗi lần lặp, `int(input())` đọc 1 dòng mới của ô Dữ liệu nhập:

```python
dem = 0
for i in range(5):
    diem = int(input())
    if diem >= 5:
        dem += 1
print("Có", dem, "bạn đạt từ 5 điểm trở lên")
```

Nếu ô Dữ liệu nhập có 5 dòng là 7, 4, 5, 9 và 3, chương trình in ra Có 3 bạn đạt từ 5 điểm trở lên. Bạn được đúng 5 điểm cũng được đếm, vì 5 >= 5 là True.
