---
id: s2.phep-tinh.l2
title: { vi: "Chia lấy phần nguyên //", en: "Floor division //" }
exercises:
  - id: s2.phep-tinh.l2.ex1
    type: code
    concepts: [floor-div]
    prompt:
      vi: "Robo có 17 viên kẹo, chia đều cho 5 bạn. Không ai được cắt kẹo. Hãy viết 1 lệnh print dùng 2 biến keo và ban để in ra số kẹo mỗi bạn được, như phần Ví dụ."
      en: "Robo has 17 sweets to share equally among 5 friends. Nobody may cut a sweet. Write 1 print statement that uses the 2 variables keo and ban to print how many sweets each friend gets, as in the Example."
    starter: |
      keo = 17
      ban = 5
      # Viết lệnh print ở dưới dòng này
    solution: |
      keo = 17
      ban = 5
      print("Mỗi bạn được:", keo // ban)
    tests:
      - output: "Mỗi bạn được: 3"
    common_wrong:
      - output: "Mỗi bạn được: 3.4"
        misconception: floor-div
        sample: |
          keo = 17
          ban = 5
          print("Mỗi bạn được:", keo / ban)
    hints:
      - { vi: "Dấu / chia ra số thực 3.4, mà kẹo thì không cắt được. Con cần phép chia chỉ giữ phần nguyên.", en: "/ gives the float 3.4, but a sweet cannot be cut. You need the division that keeps only the whole part." }
      - { vi: "Viết print(\"Mỗi bạn được:\", keo // ban).", en: "Write print(\"Mỗi bạn được:\", keo // ban)." }
    test_eligible: true
  - id: s2.phep-tinh.l2.q1
    type: predict
    concepts: [floor-div]
    code: |
      print(9 // 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "4", correct: true }
      - { text: "4.5", misconception: floor-div }
      - { text: "5", misconception: floor-div }
      - { text: "4.0", misconception: floor-div }
    explanation:
      vi: "9 chia 2 được 4.5. Phép // chỉ giữ phần nguyên là 4 và bỏ phần lẻ đi. Phép // không làm tròn lên thành 5. Chia 2 số nguyên bằng // thì ra số nguyên, không có .0."
      en: "9 divided by 2 is 4.5. // keeps only the whole part, 4, and drops the rest. // does not round up to 5. // with 2 integers gives an integer, with no .0."
  - id: s2.phep-tinh.l2.q2
    type: predict
    concepts: [floor-div]
    code: |
      a = 3
      b = 5
      print(a // b)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "0.6", misconception: floor-div }
      - { text: "1", misconception: floor-div }
      - { vi: "Báo lỗi ZeroDivisionError", en: "A ZeroDivisionError", error: true }
      - { text: "0", correct: true }
    explanation:
      vi: "3 chia 5 được 0.6, phần nguyên là 0. Giống như có 3 viên kẹo mà chia đều cho 5 bạn: không bạn nào được trọn 1 viên. Không có lỗi, vì số chia là 5, không phải 0."
      en: "3 divided by 5 is 0.6, and its whole part is 0. It is like sharing 3 sweets equally among 5 friends: nobody gets a whole sweet. There is no error, because we divide by 5, not by 0."
---
Robo có 7 viên kẹo và muốn chia đều cho 2 bạn. Kẹo thì không cắt đôi được. Mỗi bạn được 3 viên, còn thừa 1 viên.

Phép `//` (2 dấu gạch chéo) gọi là **chia lấy phần nguyên**. Nó cho biết mỗi bạn được bao nhiêu viên trọn vẹn.

```python run
keo = 7
ban = 2
print(keo / ban)
print(keo // ban)
```

Dấu `/` chia ra 3.5. Dấu `//` bỏ phần lẻ .5 đi, chỉ giữ **phần nguyên** là 3.
---
Phép `//` **không làm tròn lên số gần nhất**: nó luôn lấy số nguyên ở phía dưới (bỏ phần lẻ đi), dù phần lẻ lớn hay nhỏ.

```python run
print(9 // 2)
print(19 // 10)
print(3 // 5)
print(8 // 2)
```

- 9 / 2 là 4.5, còn 9 // 2 là **4**, không phải 5.
- 19 / 10 là 1.9, gần 2, nhưng 19 // 10 vẫn là **1**.
- 3 // 5 là **0**: có 3 viên kẹo mà chia cho 5 bạn thì không bạn nào được trọn 1 viên.
- 8 // 2 là **4**, không có .0 như phép `/`. Chia 2 số nguyên bằng `//` thì ra số nguyên.
---
Không ai chia được cho 0, kể cả Python. Nếu số chia bằng 0, Python báo lỗi **ZeroDivisionError** (lỗi chia cho 0). Bấm Chạy thử để xem:

```python run expect-error
keo = 10
ban = 0
print(keo // ban)
```

Phép `/` cũng báo lỗi này khi chia cho 0. Khi gặp lỗi này, con hãy kiểm tra giá trị của biến đứng sau dấu chia.
