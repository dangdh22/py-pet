---
id: s2.phep-tinh.l3
title: { vi: "Chia lấy dư %", en: "Remainder %" }
exercises:
  - id: s2.phep-tinh.l3.ex1
    type: code
    concepts: [modulo, floor-div]
    prompt:
      vi: "Robo xếp 23 quả bóng vào các hộp, mỗi hộp đựng đúng 5 quả. Hãy viết 2 lệnh print dùng 2 biến bong và moi_hop để in ra số hộp đầy và số bóng còn lẻ, như phần Ví dụ."
      en: "Robo puts 23 balls into boxes, with exactly 5 balls in each box. Write 2 print statements that use the 2 variables bong and moi_hop to print the number of full boxes and the number of balls left over, as in the Example."
    starter: |
      bong = 23
      moi_hop = 5
      # Viết 2 lệnh print ở dưới dòng này
    solution: |
      bong = 23
      moi_hop = 5
      print("Số hộp đầy:", bong // moi_hop)
      print("Còn lẻ:", bong % moi_hop)
    tests:
      - output: |
          Số hộp đầy: 4
          Còn lẻ: 3
    common_wrong:
      - output: |
          Số hộp đầy: 3
          Còn lẻ: 4
        misconception: modulo
        sample: |
          bong = 23
          moi_hop = 5
          print("Số hộp đầy:", bong % moi_hop)
          print("Còn lẻ:", bong // moi_hop)
    hints:
      - { vi: "Số hộp đầy là phần nguyên của phép chia, nên dùng //. Số bóng còn lẻ là số dư, nên dùng %.", en: "The number of full boxes is the whole part of the division, so use //. The balls left over are the remainder, so use %." }
      - { vi: "Dòng thứ nhất là print(\"Số hộp đầy:\", bong // moi_hop). Dòng thứ hai làm tương tự với dấu %.", en: "The first line is print(\"Số hộp đầy:\", bong // moi_hop). Do the second line the same way with %." }
    test_eligible: true
  - id: s2.phep-tinh.l3.q1
    type: predict
    concepts: [modulo]
    code: |
      print(17 % 5)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "3", misconception: modulo }
      - { text: "3.4", misconception: modulo }
      - { text: "2", correct: true }
      - { text: "15", misconception: modulo }
    explanation:
      vi: "17 chia 5 được 3, còn dư 2, vì 3 * 5 = 15 và 17 - 15 = 2. Phép % cho ra số dư, nên Python in ra 2. Số 3 là kết quả của 17 // 5."
      en: "17 divided by 5 is 3 with a remainder of 2, because 3 * 5 = 15 and 17 - 15 = 2. % gives the remainder, so Python prints 2. The number 3 is the result of 17 // 5."
  - id: s2.phep-tinh.l3.q2
    type: predict
    concepts: [modulo]
    code: |
      n = 14
      print(n % 2)
      print(n % 10)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "1\n4", misconception: modulo }
      - { text: "0\n4", correct: true }
      - { text: "7\n1", misconception: floor-div }
      - { text: "0\n1", misconception: modulo }
    explanation:
      vi: "14 là số chẵn, chia 2 không dư, nên n % 2 ra 0. 14 chia 10 được 1, còn dư 4, nên n % 10 ra 4. Đó chính là chữ số hàng đơn vị của 14."
      en: "14 is even, so dividing it by 2 leaves nothing: n % 2 gives 0. 14 divided by 10 is 1 with a remainder of 4, so n % 10 gives 4. That is the ones digit of 14."
---
Robo chia 7 viên kẹo đều cho 2 bạn. Mỗi bạn được 3 viên, còn **dư** 1 viên. Ở bài trước, con đã dùng `//` để tính mỗi bạn được mấy viên. Muốn biết còn dư mấy viên, con dùng phép `%`, gọi là **chia lấy dư**.

```python run
keo = 7
ban = 2
print("Mỗi bạn:", keo // ban)
print("Còn dư:", keo % ban)
```

Trong Python, dấu `%` **không** có nghĩa là phần trăm. Nó cho ra **số dư** của phép chia.
---
Hãy xem thêm vài phép chia lấy dư:

```python run
print(10 % 3)
print(12 % 4)
print(3 % 5)
```

- 10 chia 3 được 3, dư **1**.
- 12 chia 4 được 3, không dư, nên số dư là **0**. Chia hết thì số dư là 0.
- 3 chia 5 được 0, dư **3**: 3 viên kẹo chia cho 5 bạn thì không ai được viên nào, còn nguyên 3 viên.
---
Phép `% 2` giúp con biết 1 số là **chẵn** hay **lẻ**:

- Số chẵn chia 2 thì dư **0**.
- Số lẻ chia 2 thì dư **1**.

```python run
print(8 % 2)
print(13 % 2)
```

8 là số chẵn nên in ra 0. 13 là số lẻ nên in ra 1.
---
Phép `% 10` lấy ra **chữ số hàng đơn vị** của 1 số. Phép `// 10` thì bỏ chữ số hàng đơn vị đi.

```python run
so = 345
print(so % 10)
print(so // 10)
```

345 chia 10 được 34, dư 5. Vì vậy `so % 10` ra 5, là chữ số hàng đơn vị. Còn `so // 10` ra 34, là số 345 sau khi bỏ chữ số 5.
