---
id: s4.while.l2
title: { vi: "Vòng lặp không dừng", en: "A loop that never stops" }
exercises:
  - id: s4.while.l2.ex1
    type: code
    concepts: [while-update, off-by-one]
    prompt:
      vi: "Bình tưới của Robo có n lít nước, và mỗi chậu cây cần 2 lít. Ô Dữ liệu nhập có 1 dòng: số lít nước n, là số nguyên không âm. Trong khi bình còn từ 2 lít trở lên, Robo tưới 1 chậu: bớt đi 2 lít rồi in ra số lít còn lại. Cuối cùng, in ra số lít nước còn thừa, đúng như phần Ví dụ."
      en: "Robo's watering can holds n liters of water, and each plant pot needs 2 liters. The Input data box has 1 line: the number of liters n, an integer that is not negative. While the can still has 2 liters or more, Robo waters 1 pot: take away 2 liters, then print how many liters are left. At the end, print how many liters of water are left over, exactly as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      nuoc = int(input())
      while nuoc >= 2:
          nuoc = nuoc - 2
          print("Tưới 1 chậu, còn", nuoc, "lít")
      print("Nước còn thừa:", nuoc, "lít")
    tests:
      - input: "8"
        output: |
          Tưới 1 chậu, còn 6 lít
          Tưới 1 chậu, còn 4 lít
          Tưới 1 chậu, còn 2 lít
          Tưới 1 chậu, còn 0 lít
          Nước còn thừa: 0 lít
      - input: "2"
        output: |
          Tưới 1 chậu, còn 0 lít
          Nước còn thừa: 0 lít
        hidden: true
      - input: "1"
        output: "Nước còn thừa: 1 lít"
        hidden: true
      - input: "11"
        output: |
          Tưới 1 chậu, còn 9 lít
          Tưới 1 chậu, còn 7 lít
          Tưới 1 chậu, còn 5 lít
          Tưới 1 chậu, còn 3 lít
          Tưới 1 chậu, còn 1 lít
          Nước còn thừa: 1 lít
        hidden: true
    common_wrong:
      - test: 0
        output: |
          Tưới 1 chậu, còn 6 lít
          Tưới 1 chậu, còn 4 lít
          Tưới 1 chậu, còn 2 lít
          Nước còn thừa: 2 lít
        misconception: off-by-one
        sample: |
          nuoc = int(input())
          while nuoc > 2:
              nuoc = nuoc - 2
              print("Tưới 1 chậu, còn", nuoc, "lít")
          print("Nước còn thừa:", nuoc, "lít")
    hints:
      - { vi: "Điều kiện là nuoc >= 2, vì còn đúng 2 lít thì Robo vẫn tưới được 1 chậu. Trong khối lệnh phải có dòng nuoc = nuoc - 2. Nếu thiếu dòng này, nuoc không đổi và vòng lặp chạy mãi.", en: "The condition is nuoc >= 2, because with exactly 2 liters left Robo can still water 1 pot. The block must have the line nuoc = nuoc - 2. Without it, nuoc never changes and the loop runs forever." }
      - { vi: "Sau dòng nuoc = int(input()), con viết while nuoc >= 2:, rồi 2 dòng thụt lề 4 dấu cách: nuoc = nuoc - 2 và print(\"Tưới 1 chậu, còn\", nuoc, \"lít\"). Cuối cùng là print(\"Nước còn thừa:\", nuoc, \"lít\") sát lề trái.", en: "After the line nuoc = int(input()), write while nuoc >= 2:, then 2 lines indented by 4 spaces: nuoc = nuoc - 2 and print(\"Tưới 1 chậu, còn\", nuoc, \"lít\"). Last comes print(\"Nước còn thừa:\", nuoc, \"lít\") at the left edge." }
    test_eligible: true
  - id: s4.while.l2.q1
    type: mcq
    concepts: [while-update]
    code: |
      n = 5
      while n > 0:
          print(n)
      n = n - 1
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "In ra số 5 mãi, đến khi Py-Pet dừng chương trình", en: "It prints 5 again and again, until Py-Pet stops the program", correct: true }
      - { vi: "In ra 5, 4, 3, 2, 1, mỗi số 1 dòng, rồi dừng lại", en: "It prints 5, 4, 3, 2, 1, one number on each line, and stops", misconception: while-update }
      - { vi: "In ra số 5 đúng 1 lần, rồi vòng lặp dừng lại", en: "It prints 5 exactly once, and then the loop stops", misconception: while-check-first }
      - { vi: "Báo lỗi IndentationError, vì dòng 4 sát lề trái", en: "An IndentationError, because line 4 is at the left edge", error: true, misconception: indent-block }
    explanation:
      vi: "Dòng n = n - 1 sát lề trái, nên nó nằm ngoài vòng lặp và chỉ chạy khi vòng lặp đã xong. Trong vòng lặp, n luôn là 5, nên n > 0 luôn đúng và số 5 được in ra mãi. Dòng sát lề trái sau khối lệnh là hợp lệ, nên Python không báo lỗi thụt lề. Py-Pet dừng chương trình vì nó in ra quá nhiều."
      en: "The line n = n - 1 starts at the left edge, so it is outside the loop and only runs when the loop is done. Inside the loop, n is always 5, so n > 0 is always True and 5 is printed forever. A line at the left edge after a block is allowed, so Python gives no indentation error. Py-Pet stops the program because it prints too much."
  - id: s4.while.l2.q2
    type: mcq
    concepts: [while-update]
    code: |
      dem = 0
      while dem < 3:
          print("Robo")
    prompt:
      vi: "Đoạn code này chạy mãi không dừng. Con thêm dòng nào vào cuối khối lệnh, thụt lề 4 dấu cách, để Robo được in ra đúng 3 lần?"
      en: "This code runs forever. Which line do you add at the end of the block, indented by 4 spaces, so that Robo is printed exactly 3 times?"
    choices:
      - { text: "dem = 0", misconception: while-update }
      - { text: "dem = dem - 1", misconception: while-update }
      - { text: "print(dem)", misconception: while-update }
      - { text: "dem = dem + 1", correct: true }
    explanation:
      vi: "Với dem = dem + 1, dem lần lượt là 0, 1, 2 khi điều kiện được kiểm tra, rồi thành 3 và dem < 3 sai: Robo được in ra 3 lần. dem = 0 và print(dem) không làm dem thay đổi. dem = dem - 1 làm dem nhỏ dần thành -1, -2, nên dem < 3 vẫn đúng mãi."
      en: "With dem = dem + 1, dem is 0, then 1, then 2 when the condition is checked, then it becomes 3 and dem < 3 is False: Robo is printed 3 times. dem = 0 and print(dem) do not change dem. dem = dem - 1 makes dem smaller, -1, -2, so dem < 3 stays True forever."
---
Mỗi lần lặp, vòng lặp while phải **thay đổi biến** trong điều kiện, để đến 1 lúc nào đó điều kiện trở thành sai. Nếu con quên dòng đó, điều kiện đúng mãi và vòng lặp không bao giờ dừng. Đó là **vòng lặp vô hạn**, giống 1 con đường chạy vòng tròn không có lối ra.

```python
pin = 3
while pin > 0:
    print("Robo đi 1 vòng")
```

Code này thiếu dòng pin = pin - 1. pin luôn là 3, nên pin > 0 luôn đúng, và Robo đi mãi. Vì vậy đoạn code này không có nút Chạy thử.
---
Py-Pet không để Robo chạy mãi. Nếu vòng lặp vô hạn **in ra** mãi như ở thẻ trước, Robo dừng chương trình ngay khi nó đã in ra quá nhiều, và báo: Chương trình in ra quá nhiều nên Robo đã dừng lại. Nếu vòng lặp vô hạn không in gì, như đoạn code dưới đây, Robo chờ vài giây rồi mới dừng chương trình:

```python
pin = 3
while pin > 0:
    pin = pin + 1
```

Lần này pin có thay đổi, nhưng thay đổi sai chiều: pin lớn dần lên, nên pin > 0 vẫn luôn đúng. Robo báo: Code chạy lâu quá nên Robo đã dừng lại, rồi nhắc con kiểm tra vòng lặp while.
---
Dòng thay đổi biến phải **nằm trong khối lệnh**, tức là thụt lề 4 dấu cách. Nếu dòng đó sát lề trái, nó chỉ chạy sau vòng lặp, mà vòng lặp thì không bao giờ xong:

```python
i = 1
while i <= 3:
    print(i)
i = i + 1
```

Con sửa bằng cách thụt lề dòng 4. Bây giờ i tăng sau mỗi lần lặp, và vòng lặp dừng khi i là 4:

```python run
i = 1
while i <= 3:
    print(i)
    i = i + 1
print("Xong")
```

Mỗi khi viết while, con tự hỏi: biến nào trong điều kiện được thay đổi, và nó có tiến dần tới chỗ làm điều kiện sai không?
