---
id: s4.long-nhau.l1
title: { vi: "Vòng lặp trong vòng lặp", en: "A loop inside a loop" }
exercises:
  - id: s4.long-nhau.l1.ex1
    type: code
    concepts: [nested-inner-full]
    prompt:
      vi: "Robo tập nhảy trong n ngày, mỗi ngày nhảy m lần. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số ngày n, dòng 2 là số lần nhảy m, đều là số nguyên không âm. Với mỗi ngày, hãy in ra dòng Ngày cùng với số thứ tự của ngày, rồi in ra các dòng Nhảy 1, Nhảy 2, và cứ thế đến Nhảy m. Cuối cùng, in ra 1 lần dòng Robo tập xong, đúng như phần Ví dụ. Nếu n là 0, Robo chỉ in ra Robo tập xong."
      en: "Robo practises jumping for n days, m jumps each day. The Input data box has 2 lines: line 1 is the number of days n, and line 2 is the number of jumps m, both integers that are not negative. For each day, print the line Ngày with the number of the day, then print the lines Nhảy 1, Nhảy 2, and so on up to Nhảy m. At the end, print the line Robo tập xong once, exactly as in the Example. If n is 0, Robo prints only Robo tập xong."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      m = int(input())
      for ngay in range(1, n + 1):
          print("Ngày", ngay)
          for lan in range(1, m + 1):
              print("Nhảy", lan)
      print("Robo tập xong")
    tests:
      - input: "2\n3"
        output: |
          Ngày 1
          Nhảy 1
          Nhảy 2
          Nhảy 3
          Ngày 2
          Nhảy 1
          Nhảy 2
          Nhảy 3
          Robo tập xong
      - input: "1\n1"
        output: |
          Ngày 1
          Nhảy 1
          Robo tập xong
        hidden: true
      - input: "0\n4"
        output: "Robo tập xong"
        hidden: true
      - input: "3\n2"
        output: |
          Ngày 1
          Nhảy 1
          Nhảy 2
          Ngày 2
          Nhảy 1
          Nhảy 2
          Ngày 3
          Nhảy 1
          Nhảy 2
          Robo tập xong
        hidden: true
      - input: "2\n0"
        output: |
          Ngày 1
          Ngày 2
          Robo tập xong
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Ngày 1
          Ngày 2
          Nhảy 1
          Nhảy 2
          Nhảy 3
          Robo tập xong
        misconception: nested-inner-full
        sample: |
          n = int(input())
          m = int(input())
          for ngay in range(1, n + 1):
              print("Ngày", ngay)
          for lan in range(1, m + 1):
              print("Nhảy", lan)
          print("Robo tập xong")
      - test: 0
        output: |
          Ngày 1
          Nhảy 1
          Nhảy 2
          Nhảy 3
          Robo tập xong
          Ngày 2
          Nhảy 1
          Nhảy 2
          Nhảy 3
          Robo tập xong
        misconception: for-repeat
        sample: |
          n = int(input())
          m = int(input())
          for ngay in range(1, n + 1):
              print("Ngày", ngay)
              for lan in range(1, m + 1):
                  print("Nhảy", lan)
              print("Robo tập xong")
    hints:
      - { vi: "Vòng ngoài đi qua các ngày, từ 1 đến n. Vòng trong đi qua các lần nhảy, từ 1 đến m, và phải nằm trong vòng ngoài, để mỗi ngày Robo nhảy đủ m lần. Dòng Robo tập xong viết sát lề trái, sau cả 2 vòng lặp.", en: "The outer loop goes through the days, from 1 to n. The inner loop goes through the jumps, from 1 to m, and it must be inside the outer loop, so that Robo does all m jumps every day. The line Robo tập xong starts at the left edge, after both loops." }
      - { vi: "Sau 2 dòng đọc n và m là for ngay in range(1, n + 1):. Thụt lề 4 dấu cách: print(\"Ngày\", ngay) và for lan in range(1, m + 1):. Thụt lề 8 dấu cách: print(\"Nhảy\", lan). Cuối cùng, sát lề trái: print(\"Robo tập xong\").", en: "After the 2 lines that read n and m comes for ngay in range(1, n + 1):. Indented by 4 spaces: print(\"Ngày\", ngay) and for lan in range(1, m + 1):. Indented by 8 spaces: print(\"Nhảy\", lan). Last, at the left edge: print(\"Robo tập xong\")." }
    test_eligible: true
  - id: s4.long-nhau.l1.ex2
    type: code
    concepts: [nested-inner-full]
    prompt:
      vi: "Robo có n chiếc áo và m chiếc quần, đánh số từ 1. Ô Dữ liệu nhập có 2 dòng: dòng 1 là số áo n, dòng 2 là số quần m, đều là số nguyên không âm. Hãy dùng 2 vòng lặp lồng nhau để in ra mọi cách ghép 1 áo với 1 quần, mỗi cách 1 dòng. Dùng thêm 1 biến đếm để đếm số cách, rồi in ra dòng cuối cùng, đúng như phần Ví dụ."
      en: "Robo has n shirts and m pairs of trousers, numbered from 1. The Input data box has 2 lines: line 1 is the number of shirts n, and line 2 is the number of trousers m, both integers that are not negative. Use 2 nested loops to print every way to match 1 shirt with 1 pair of trousers, one way on each line. Also use a counter variable to count the ways, then print the last line, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      n = int(input())
      m = int(input())
      dem = 0
      for ao in range(1, n + 1):
          for quan in range(1, m + 1):
              print("Áo", ao, "- Quần", quan)
              dem += 1
      print("Có", dem, "cách mặc")
    tests:
      - input: "2\n3"
        output: |
          Áo 1 - Quần 1
          Áo 1 - Quần 2
          Áo 1 - Quần 3
          Áo 2 - Quần 1
          Áo 2 - Quần 2
          Áo 2 - Quần 3
          Có 6 cách mặc
      - input: "1\n1"
        output: |
          Áo 1 - Quần 1
          Có 1 cách mặc
        hidden: true
      - input: "0\n5"
        output: "Có 0 cách mặc"
        hidden: true
      - input: "3\n2"
        output: |
          Áo 1 - Quần 1
          Áo 1 - Quần 2
          Áo 2 - Quần 1
          Áo 2 - Quần 2
          Áo 3 - Quần 1
          Áo 3 - Quần 2
          Có 6 cách mặc
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Áo 1 - Quần 1
          Áo 1 - Quần 2
          Áo 1 - Quần 3
          Áo 2 - Quần 1
          Áo 2 - Quần 2
          Áo 2 - Quần 3
          Có 3 cách mặc
        misconception: accumulator-init
        sample: |
          n = int(input())
          m = int(input())
          for ao in range(1, n + 1):
              dem = 0
              for quan in range(1, m + 1):
                  print("Áo", ao, "- Quần", quan)
                  dem += 1
          print("Có", dem, "cách mặc")
    hints:
      - { vi: "Đặt dem = 0 trước cả 2 vòng lặp, sát lề trái. Vòng ngoài đi qua các áo, vòng trong đi qua các quần. Trong vòng trong, con in ra 1 cách ghép rồi cộng 1 vào dem.", en: "Set dem = 0 before both loops, at the left edge. The outer loop goes through the shirts, and the inner loop goes through the trousers. Inside the inner loop, print one match and then add 1 to dem." }
      - { vi: "Sau dem = 0 là for ao in range(1, n + 1):, rồi for quan in range(1, m + 1): thụt lề 4 dấu cách. Thụt lề 8 dấu cách: print(\"Áo\", ao, \"- Quần\", quan) và dem += 1. Cuối cùng, sát lề trái: print(\"Có\", dem, \"cách mặc\").", en: "After dem = 0 comes for ao in range(1, n + 1):, then for quan in range(1, m + 1): indented by 4 spaces. Indented by 8 spaces: print(\"Áo\", ao, \"- Quần\", quan) and dem += 1. Last, at the left edge: print(\"Có\", dem, \"cách mặc\")." }
    test_eligible: true
  - id: s4.long-nhau.l1.q1
    type: predict
    concepts: [nested-inner-full]
    code: |
      for i in range(2):
          for j in range(3):
              print(i, j)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "0 0\n1 1", misconception: nested-inner-full }
      - { text: "0 0\n1 0\n0 1\n1 1\n0 2\n1 2", misconception: nested-inner-full }
      - { text: "1 1\n1 2\n1 3\n2 1\n2 2\n2 3", misconception: range-stop-excluded }
      - { text: "0 0\n0 1\n0 2\n1 0\n1 1\n1 2", correct: true }
    explanation:
      vi: "Khi i là 0, vòng trong chạy hết: j lần lượt là 0, 1, 2. Sau đó i mới tăng lên 1, và vòng trong lại chạy hết từ đầu. Vòng ngoài chạy 2 lần, mỗi lần vòng trong chạy 3 lần, nên có 2 × 3 = 6 dòng. range bắt đầu từ 0, nên không có số 3."
      en: "When i is 0, the inner loop runs all the way: j is 0, then 1, then 2. Only then does i go up to 1, and the inner loop runs all the way again from the start. The outer loop runs 2 times, and each time the inner loop runs 3 times, so there are 2 × 3 = 6 lines. range starts at 0, so there is no 3."
  - id: s4.long-nhau.l1.q2
    type: mcq
    concepts: [nested-inner-full]
    code: |
      for i in range(3):
          for j in range(4):
              print("A")
          print("B")
    prompt:
      vi: "Đoạn code in ra bao nhiêu chữ A và bao nhiêu chữ B?"
      en: "How many letters A and how many letters B does this code print?"
    choices:
      - { vi: "7 chữ A và 3 chữ B", en: "7 letters A and 3 letters B", misconception: nested-inner-full }
      - { vi: "12 chữ A và 3 chữ B", en: "12 letters A and 3 letters B", correct: true }
      - { vi: "4 chữ A và 3 chữ B", en: "4 letters A and 3 letters B", misconception: nested-inner-full }
      - { vi: "12 chữ A và 1 chữ B", en: "12 letters A and 1 letter B", misconception: for-repeat }
    explanation:
      vi: "Mỗi lần vòng ngoài chạy, vòng trong chạy đủ 4 lần, nên chữ A được in 3 × 4 = 12 lần, chứ không phải 3 + 4 = 7 lần. Dòng print(\"B\") thụt lề 4 dấu cách: nó nằm trong vòng ngoài nhưng ngoài vòng trong, nên chạy 1 lần sau mỗi lượt của vòng trong, tức là 3 lần."
      en: "Each time the outer loop runs, the inner loop runs all 4 times, so A is printed 3 × 4 = 12 times, not 3 + 4 = 7 times. The line print(\"B\") is indented by 4 spaces: it is inside the outer loop but outside the inner loop, so it runs once after each round of the inner loop, that is, 3 times."
---
Robo đi thăm 3 phòng. Ở mỗi phòng, Robo bật 2 bóng đèn. Con viết được việc này bằng 1 vòng lặp nằm **trong** 1 vòng lặp khác. Cách viết này có tên là **vòng lặp lồng nhau**:

```python run
for phong in range(1, 4):
    for den in range(1, 3):
        print("Phòng", phong, "bật đèn", den)
```

Vòng lặp bên ngoài, đi qua các phòng, là **vòng ngoài**. Vòng lặp nằm bên trong, đi qua các bóng đèn, là **vòng trong**. Vòng trong dùng 1 tên biến khác với vòng ngoài, ở đây là den.
---
Mỗi lần vòng ngoài chạy 1 lần, vòng trong chạy **hết** từ đầu đến cuối, rồi vòng ngoài mới chạy tiếp. Giống như cái đồng hồ: kim phút chạy hết 1 vòng thì kim giờ mới nhích lên 1 số.

```python run
dem = 0
for i in range(3):
    for j in range(4):
        dem += 1
print("Vòng trong chạy tất cả", dem, "lần")
```

Vòng ngoài chạy 3 lần, mỗi lần vòng trong chạy 4 lần, nên khối lệnh trong vòng trong chạy 3 × 4 = 12 lần, chứ không phải 3 + 4 = 7 lần.
---
Thụt lề cho biết mỗi dòng nằm ở đâu. Dòng thụt lề 8 dấu cách nằm trong vòng trong. Dòng thụt lề 4 dấu cách, viết sau vòng trong, chạy 1 lần sau mỗi lượt của vòng trong. Dòng sát lề trái chỉ chạy 1 lần, khi cả 2 vòng lặp đã xong:

```python run
for hang in range(1, 3):
    print("Robo đếm ghế ở hàng", hang)
    for ghe in range(1, 4):
        print("Ghế", ghe)
    print("Xong hàng", hang)
print("Robo đếm xong")
```

Con thử xóa 4 dấu cách ở đầu dòng 5 để thấy dòng Xong hàng chỉ còn được in 1 lần.
