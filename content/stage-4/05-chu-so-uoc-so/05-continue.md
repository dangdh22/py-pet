---
id: s4.chu-so.l5
title: { vi: "Bỏ qua 1 lần lặp với continue", en: "Skipping with continue" }
exercises:
  - id: s4.chu-so.l5.ex1
    type: code
    concepts: [continue-skip, accumulator-init]
    prompt:
      vi: "Robo cộng điểm của n lượt chơi. Máy đếm điểm đôi khi bị lỗi, và lượt bị lỗi có điểm là số âm: lượt đó không được tính. Ô Dữ liệu nhập: dòng đầu là n (số nguyên không âm), n dòng sau là điểm của từng lượt. Hãy dùng vòng lặp for, và dùng continue để bỏ qua lượt có điểm âm. In ra đúng 1 dòng như phần Ví dụ."
      en: "Robo adds up the points of n rounds. The score counter sometimes goes wrong, and a round that went wrong has a negative score: that round does not count. The Input data box: the first line is n (an integer that is not negative), and the n lines after it are the points of each round. Use a for loop, and use continue to skip a round with a negative score. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      tong = 0
      for i in range(n):
          diem = int(input())
          if diem < 0:
              continue
          tong += diem
      print("Tổng điểm:", tong)
    tests:
      - input: "4\n5\n-2\n7\n-1"
        output: "Tổng điểm: 12"
      - input: "0"
        output: "Tổng điểm: 0"
        hidden: true
      - input: "1\n-6"
        output: "Tổng điểm: 0"
        hidden: true
      - input: "1\n9"
        output: "Tổng điểm: 9"
        hidden: true
      - input: "5\n-1\n-2\n0\n3\n10"
        output: "Tổng điểm: 13"
        hidden: true
    common_wrong:
      - test: 0
        output: "Tổng điểm: 5"
        misconception: continue-skip
        sample: |
          n = int(input())
          tong = 0
          for i in range(n):
              diem = int(input())
              if diem < 0:
                  break
              tong += diem
          print("Tổng điểm:", tong)
    hints:
      - { vi: "Đặt tong = 0 trước vòng lặp. Mỗi lần lặp, đọc điểm của 1 lượt. Nếu điểm nhỏ hơn 0, con viết continue để bỏ qua phần còn lại của lần lặp này. Dòng cộng điểm nằm sau lệnh if, nên lượt có điểm âm không được cộng.", en: "Set tong = 0 before the loop. On each pass, read the points of 1 round. If the points are less than 0, write continue to skip the rest of this pass. The line that adds the points comes after the if statement, so a round with negative points is not added." }
      - { vi: "Trong vòng lặp for i in range(n):, có 3 phần thụt lề 4 dấu cách: diem = int(input()), rồi if diem < 0: với continue thụt lề 8 dấu cách, rồi tong += diem. Cuối cùng, sát lề trái: print(\"Tổng điểm:\", tong).", en: "Inside the loop for i in range(n):, there are 3 parts indented by 4 spaces: diem = int(input()), then if diem < 0: with continue indented by 8 spaces, then tong += diem. Last, at the left edge: print(\"Tổng điểm:\", tong)." }
    test_eligible: true
  - id: s4.chu-so.l5.ex2
    type: code
    concepts: [continue-skip, for-over-string]
    prompt:
      vi: "Robo in lại 1 câu nhưng bỏ hết dấu cách, để các từ dính liền nhau. Ô Dữ liệu nhập có 1 dòng: 1 câu, có ít nhất 1 ký tự. Code bên phải dùng nhầm break, nên Robo chỉ in ra từ đầu tiên. Hãy sửa code để Robo in ra cả câu không có dấu cách, đúng như phần Ví dụ."
      en: "Robo prints a sentence again but drops every space, so the words stick together. The Input data box has 1 line: a sentence with at least 1 character. The code on the right uses break by mistake, so Robo prints only the first word. Fix the code so that Robo prints the whole sentence without spaces, exactly as in the Example."
    starter: |
      cau = input()
      for ch in cau:
          if ch == " ":
              break
          print(ch, end="")
    solution: |
      cau = input()
      for ch in cau:
          if ch == " ":
              continue
          print(ch, end="")
    tests:
      - input: "Chào Robo"
        output: "ChàoRobo"
      - input: "A"
        output: "A"
        hidden: true
      - input: "a b c d"
        output: "abcd"
        hidden: true
      - input: "Robo  vui  lắm"
        output: "Robovuilắm"
        hidden: true
    hints:
      - { vi: "break thoát hẳn khỏi vòng lặp ở dấu cách đầu tiên, nên các từ sau đó không được in. Con cần 1 lệnh chỉ bỏ qua đúng ký tự dấu cách, rồi vòng lặp chạy tiếp với ký tự sau.", en: "break leaves the loop for good at the first space, so the words after it are not printed. You need a statement that skips only the space character, and then the loop goes on with the next character." }
      - { vi: "Đổi dòng 4 thành continue, vẫn thụt lề 8 dấu cách. Các dòng khác giữ nguyên.", en: "Change line 4 to continue, still indented by 8 spaces. Keep the other lines as they are." }
    test_eligible: true
  - id: s4.chu-so.l5.q1
    type: predict
    concepts: [continue-skip]
    code: |
      total = 0
      for i in range(1, 7):
          if i % 2 == 0:
              continue
          total += i
      print(total)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "12", misconception: continue-skip }
      - { text: "9", correct: true }
      - { text: "1", misconception: continue-skip }
      - { text: "21", misconception: continue-skip }
    explanation:
      vi: "Khi i chẵn (2, 4, 6), continue bỏ qua dòng total += i, và vòng lặp chạy tiếp với số sau. Chỉ các số lẻ 1, 3, 5 được cộng: 1 + 3 + 5 = 9. continue không dừng vòng lặp như break, nên Robo vẫn cộng 3 và 5 sau khi gặp số 2."
      en: "When i is even (2, 4, 6), continue skips the line total += i, and the loop goes on with the next number. Only the odd numbers 1, 3, 5 are added: 1 + 3 + 5 = 9. continue does not stop the loop like break, so Robo still adds 3 and 5 after it meets 2."
  - id: s4.chu-so.l5.q2
    type: mcq
    concepts: [continue-skip]
    prompt:
      vi: "Khi Python gặp continue trong 1 vòng lặp for, chuyện gì xảy ra?"
      en: "What happens when Python meets continue inside a for loop?"
    choices:
      - { vi: "Vòng lặp dừng hẳn, và Python chạy dòng sau vòng lặp", en: "The loop stops for good, and Python runs the line after the loop", misconception: continue-skip }
      - { vi: "Python chạy lại lần lặp này từ đầu, và biến của vòng lặp giữ nguyên giá trị", en: "Python runs this pass again from the top, and the loop variable keeps its value", misconception: continue-skip }
      - { vi: "Python chỉ bỏ qua 1 dòng ngay sau continue, rồi chạy tiếp các dòng còn lại trong khối", en: "Python skips only the 1 line right after continue, then runs the rest of the block", misconception: continue-skip }
      - { vi: "Python bỏ qua phần còn lại của lần lặp này, rồi sang lần lặp tiếp theo", en: "Python skips the rest of this pass, then moves on to the next pass", correct: true }
    explanation:
      vi: "continue bỏ qua mọi dòng còn lại trong khối của lần lặp đang chạy, không chỉ 1 dòng. Sau đó, biến của vòng lặp nhận giá trị tiếp theo và vòng lặp chạy tiếp. Vòng lặp không dừng hẳn: dừng hẳn là việc của break."
      en: "continue skips every line left in the block for the pass that is running, not just 1 line. Then the loop variable takes its next value and the loop goes on. The loop does not stop for good: stopping for good is what break does."
---
Robo tưới 7 cây trong vườn, đánh số từ 1 đến 7. Cây có số chia hết cho 3 là cây xương rồng, không cần tưới. Lệnh **continue** giúp Robo **bỏ qua 1 lần lặp**:

```python run
for cay in range(1, 8):
    if cay % 3 == 0:
        continue
    print("Robo tưới cây số", cay)
print("Tưới xong")
```

Khi cay là 3 hay 6, Python gặp continue: nó bỏ qua phần còn lại của lần lặp đó và sang lần lặp tiếp theo. Vì vậy Robo không tưới cây số 3 và 6, nhưng vẫn tưới cây số 4, 5 và 7.
---
break và continue đều nằm trong vòng lặp, nhưng làm 2 việc khác nhau. Hãy so sánh:

```python run
for i in range(1, 6):
    if i == 3:
        continue
    print("continue:", i)
for i in range(1, 6):
    if i == 3:
        break
    print("break:", i)
```

Với continue, Robo chỉ bỏ qua số 3, rồi in tiếp 4 và 5. Với break, Robo dừng hẳn ở số 3, nên chỉ in 1 và 2. Con nhớ: continue bỏ qua **1 lần lặp**, break bỏ cả **phần còn lại của vòng lặp**.
---
Với vòng lặp while, con phải cẩn thận hơn. Đây là vòng lặp tưới cây viết bằng while, nhưng dòng tăng biến đặt ở cuối khối:

```python
cay = 1
while cay <= 7:
    if cay % 3 == 0:
        continue
    print("Robo tưới cây số", cay)
    cay = cay + 1
```

Khi cay là 3, continue bỏ qua cả dòng `cay = cay + 1`. cay mãi là 3, nên vòng lặp không bao giờ dừng. Con đổi biến **trước** dòng continue:

```python run
cay = 0
while cay < 7:
    cay = cay + 1
    if cay % 3 == 0:
        continue
    print("Robo tưới cây số", cay)
print("Tưới xong")
```

Ở đây cay bắt đầu từ 0 và tăng thêm 1 ngay ở đầu khối, nên mỗi lần lặp, cay đã đổi trước khi Python có thể gặp continue.
---
break và continue chỉ dùng được **bên trong 1 vòng lặp**. Chúng không thoát khỏi if. Nếu đặt break trong 1 lệnh if không nằm trong vòng lặp nào, Python báo lỗi và chưa chạy dòng nào:

```python run expect-error
diem = 3
if diem < 5:
    break
print("Điểm:", diem)
```

Lời báo lỗi là SyntaxError: 'break' outside loop, nghĩa là break nằm ngoài vòng lặp. Khi không có vòng lặp, con dùng if và else để chọn dòng nào được chạy.
