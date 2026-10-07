---
id: s4.while.l3
title: { vi: "Nhập đến khi gặp 0", en: "Read until 0" }
exercises:
  - id: s4.while.l3.ex1
    type: code
    concepts: [sentinel-input]
    prompt:
      vi: "Robo là máy nhân đôi. Ô Dữ liệu nhập có nhiều dòng, mỗi dòng 1 số nguyên, và dòng cuối cùng là 0. Với mỗi số khác 0, hãy in ra số đó và số gấp đôi của nó. Khi gặp 0, in ra Hết số, đúng như phần Ví dụ."
      en: "Robo is a doubling machine. The Input data box has several lines, each with an integer, and the last line is 0. For each number that is not 0, print the number and its double. When you meet 0, print Hết số, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = int(input())
      while so != 0:
          print(so, "gấp đôi là", so * 2)
          so = int(input())
      print("Hết số")
    tests:
      - input: "3\n10\n7\n0"
        output: |
          3 gấp đôi là 6
          10 gấp đôi là 20
          7 gấp đôi là 14
          Hết số
      - input: "25\n0"
        output: |
          25 gấp đôi là 50
          Hết số
        hidden: true
      - input: "0"
        output: "Hết số"
        hidden: true
      - input: "-4\n2\n100\n1\n0"
        output: |
          -4 gấp đôi là -8
          2 gấp đôi là 4
          100 gấp đôi là 200
          1 gấp đôi là 2
          Hết số
        hidden: true
    common_wrong:
      - test: 0
        output: |
          10 gấp đôi là 20
          7 gấp đôi là 14
          0 gấp đôi là 0
          Hết số
        misconception: sentinel-input
        sample: |
          so = int(input())
          while so != 0:
              so = int(input())
              print(so, "gấp đôi là", so * 2)
          print("Hết số")
    hints:
      - { vi: "Đọc số đầu tiên trước vòng lặp. Điều kiện là so != 0. Trong khối lệnh, con in kết quả trước, rồi mới đọc số tiếp theo ở dòng cuối của khối.", en: "Read the first number before the loop. The condition is so != 0. Inside the block, print the result first, and read the next number only on the last line of the block." }
      - { vi: "Chương trình có 5 dòng: so = int(input()), rồi while so != 0:, rồi 2 dòng thụt lề 4 dấu cách: print(so, \"gấp đôi là\", so * 2) và so = int(input()). Cuối cùng là print(\"Hết số\") sát lề trái.", en: "The program has 5 lines: so = int(input()), then while so != 0:, then 2 lines indented by 4 spaces: print(so, \"gấp đôi là\", so * 2) and so = int(input()). Last comes print(\"Hết số\") at the left edge." }
    test_eligible: true
  - id: s4.while.l3.ex2
    type: code
    concepts: [sentinel-input]
    prompt:
      vi: "Robo xem từng số và nói số đó chẵn hay lẻ. Ô Dữ liệu nhập có nhiều dòng, mỗi dòng 1 số nguyên, và dòng cuối cùng là 0. Với mỗi số khác 0, in ra số đó và chữ chẵn hoặc lẻ. Khi gặp 0, in ra 1 dòng cho biết Robo đã xem bao nhiêu số khác 0, đúng như phần Ví dụ."
      en: "Robo looks at each number and says whether it is even or odd. The Input data box has several lines, each with an integer, and the last line is 0. For each number that is not 0, print the number and the word chẵn (even) or lẻ (odd). When you meet 0, print 1 line that tells how many numbers other than 0 Robo looked at, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      dem = 0
      so = int(input())
      while so != 0:
          if so % 2 == 0:
              print(so, "chẵn")
          else:
              print(so, "lẻ")
          dem = dem + 1
          so = int(input())
      print("Robo đã xem", dem, "số")
    tests:
      - input: "4\n7\n0"
        output: |
          4 chẵn
          7 lẻ
          Robo đã xem 2 số
      - input: "9\n0"
        output: |
          9 lẻ
          Robo đã xem 1 số
        hidden: true
      - input: "0"
        output: "Robo đã xem 0 số"
        hidden: true
      - input: "12\n15\n-3\n8\n0"
        output: |
          12 chẵn
          15 lẻ
          -3 lẻ
          8 chẵn
          Robo đã xem 4 số
        hidden: true
    common_wrong:
      - test: 0
        output: |
          7 lẻ
          0 chẵn
          Robo đã xem 2 số
        misconception: sentinel-input
        sample: |
          dem = 0
          so = int(input())
          while so != 0:
              so = int(input())
              if so % 2 == 0:
                  print(so, "chẵn")
              else:
                  print(so, "lẻ")
              dem = dem + 1
          print("Robo đã xem", dem, "số")
    hints:
      - { vi: "Đặt dem = 0 và đọc số đầu tiên trước vòng lặp. Trong khối lệnh: dùng if và else với so % 2 == 0 để in chẵn hay lẻ, cộng thêm 1 vào dem, rồi đọc số tiếp theo ở dòng cuối của khối.", en: "Set dem = 0 and read the first number before the loop. Inside the block: use if and else with so % 2 == 0 to print chẵn or lẻ, add 1 to dem, then read the next number on the last line of the block." }
      - { vi: "Sau dòng while so != 0:, khối lệnh có if so % 2 == 0: với print(so, \"chẵn\"), else: với print(so, \"lẻ\"), rồi dem = dem + 1 và so = int(input()). Dòng print(\"Robo đã xem\", dem, \"số\") sát lề trái, sau vòng lặp.", en: "After the line while so != 0:, the block has if so % 2 == 0: with print(so, \"chẵn\"), else: with print(so, \"lẻ\"), then dem = dem + 1 and so = int(input()). The line print(\"Robo đã xem\", dem, \"số\") is at the left edge, after the loop." }
    test_eligible: true
  - id: s4.while.l3.q1
    type: mcq
    concepts: [sentinel-input]
    code: |
      n = int(input())
      while n != 0:
          print(n * 10)
          n = int(input())
      print("end")
    prompt:
      vi: "Ô Dữ liệu nhập có 4 dòng: 6, 0, 9, 0. Đoạn code in ra gì?"
      en: "The Input data box has 4 lines: 6, 0, 9, 0. What is the output of this code?"
    choices:
      - { text: "60\n90\nend", misconception: sentinel-input }
      - { text: "60\n0\nend", misconception: sentinel-input }
      - { vi: "Báo lỗi, vì còn 2 dòng chưa được đọc", en: "An error, because 2 lines are never read", error: true, misconception: input-one-line }
      - { text: "60\nend", correct: true }
    explanation:
      vi: "Dòng 1 đọc 6, nên vòng lặp in ra 60 rồi đọc dòng tiếp theo là 0. Lúc này n != 0 sai, nên vòng lặp dừng và in ra end. Số 0 chỉ là tín hiệu dừng, nên 0 không được nhân 10 và in ra. Hai dòng 9 và 0 phía sau không được đọc, và các dòng thừa chỉ bị bỏ qua, Python không báo lỗi."
      en: "Line 1 reads 6, so the loop prints 60 and then reads the next line, which is 0. Now n != 0 is False, so the loop stops and end is printed. The 0 is only a stop signal, so it is not multiplied by 10 and printed. The 2 lines 9 and 0 after it are never read, and extra lines are just skipped, so Python gives no error."
---
Robo nhận các số từ con, nhưng không biết trước con sẽ gõ bao nhiêu số. Hai bên hẹn nhau: con gõ số 0 nghĩa là hết. Số 0 ở đây là **giá trị dừng**: nó chỉ báo đã hết số, không phải 1 số để Robo xử lý.

```python
so = int(input())
while so != 0:
    print("Robo nhận số", so)
    so = int(input())
print("Hết số")
```

Điều kiện so != 0 nghĩa là: so khác 0. Nếu ô Dữ liệu nhập có 3 dòng là 5, 8 và 0, chương trình in ra Robo nhận số 5, rồi Robo nhận số 8, rồi Hết số.
---
Chương trình gọi `input()` ở **2 chỗ**. Lần thứ nhất, trước vòng lặp, đọc số đầu tiên để dòng while có số mà kiểm tra. Lần thứ hai, ở cuối khối lệnh, đọc số tiếp theo, rồi Python quay lên kiểm tra số mới đó. Nếu thiếu lần đọc thứ hai, so không bao giờ đổi và vòng lặp chạy mãi.

Đặt lần đọc thứ hai ở đầu khối lệnh là sai:

```python
so = int(input())
while so != 0:
    so = int(input())
    print("Robo nhận số", so)
print("Hết số")
```

Với 5, 8 và 0, code này bỏ mất số 5 và in ra cả Robo nhận số 0, vì nó đọc số mới rồi in ngay, chưa kịp kiểm tra số đó.
---
Nếu ngay dòng đầu đã là 0, vòng lặp chạy 0 lần. Thẻ này không có ô Dữ liệu nhập, nên con thay lần đọc đầu tiên bằng `so = 0`:

```python run
so = 0  # giống như dòng đầu con gõ là 0
while so != 0:
    print("Robo nhận số", so)
    so = int(input())
print("Hết số")
```

Python chỉ in ra Hết số. Dòng `input()` trong khối lệnh không chạy lần nào, nên không có lỗi. Trong bài tập, con gõ mỗi số trên 1 dòng của ô Dữ liệu nhập, và dòng cuối cùng là 0.
