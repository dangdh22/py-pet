---
id: s2.phep-tinh.l5
title: { vi: "Giải bài toán bằng phép tính", en: "Solving problems" }
exercises:
  - id: s2.phep-tinh.l5.ex1
    type: code
    concepts: [floor-div, modulo]
    prompt:
      vi: "Robo chạy hết 200 giây. Hãy dùng biến giay, phép // và phép % để đổi 200 giây ra phút và giây (1 phút có 60 giây), rồi in ra đúng dòng như phần Ví dụ."
      en: "Robo runs for 200 seconds. Use the variable giay, // and % to change 200 seconds into minutes and seconds (1 minute has 60 seconds), then print the line in the Example."
    starter: |
      giay = 200
      # Viết lệnh của con ở dưới dòng này
    solution: |
      giay = 200
      phut = giay // 60
      giay_le = giay % 60
      print(giay, "giây là", phut, "phút", giay_le, "giây")
    tests:
      - output: "200 giây là 3 phút 20 giây"
    common_wrong:
      - output: "200 giây là 20 phút 3 giây"
        misconception: modulo
        sample: |
          giay = 200
          print(giay, "giây là", giay % 60, "phút", giay // 60, "giây")
    hints:
      - { vi: "Số phút là phần nguyên của phép chia 200 cho 60. Số giây còn lại là số dư của phép chia đó.", en: "The minutes are the whole part of 200 divided by 60. The seconds left over are the remainder of that division." }
      - { vi: "Số phút là giay // 60, số giây còn lại là giay % 60. In ra bằng print(giay, \"giây là\", ..., \"phút\", ..., \"giây\").", en: "The minutes are giay // 60, and the seconds left over are giay % 60. Print them with print(giay, \"giây là\", ..., \"phút\", ..., \"giây\")." }
    test_eligible: true
  - id: s2.phep-tinh.l5.ex2
    type: code
    concepts: [precedence]
    prompt:
      vi: "Khu vườn hình chữ nhật của Robo dài 12 m và rộng 7 m. Hãy dùng 2 biến dai và rong để tính diện tích và chu vi của khu vườn, rồi in ra 2 dòng như phần Ví dụ. Chu vi bằng (dài + rộng) nhân 2."
      en: "Robo's rectangular garden is 12 m long and 7 m wide. Use the 2 variables dai and rong to work out the area and the perimeter of the garden, then print the 2 lines in the Example. The perimeter is (length + width) times 2."
    starter: |
      dai = 12
      rong = 7
      # Viết lệnh của con ở dưới dòng này
    solution: |
      dai = 12
      rong = 7
      print("Diện tích:", dai * rong)
      print("Chu vi:", (dai + rong) * 2)
    tests:
      - output: |
          Diện tích: 84
          Chu vi: 38
    common_wrong:
      - output: |
          Diện tích: 84
          Chu vi: 26
        misconception: precedence
        sample: |
          dai = 12
          rong = 7
          print("Diện tích:", dai * rong)
          print("Chu vi:", dai + rong * 2)
    hints:
      - { vi: "Diện tích là dai * rong. Với chu vi, Python làm phép nhân trước phép cộng, nên con cần ngoặc tròn để cộng trước.", en: "The area is dai * rong. For the perimeter, Python multiplies before it adds, so you need round brackets to add first." }
      - { vi: "Dòng in chu vi là print(\"Chu vi:\", (dai + rong) * 2).", en: "The line for the perimeter is print(\"Chu vi:\", (dai + rong) * 2)." }
    test_eligible: true
  - id: s2.phep-tinh.l5.q1
    type: predict
    concepts: [floor-div, modulo]
    code: |
      m = 75
      print(m // 60, m % 60)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "15 1", misconception: modulo }
      - { text: "1 15", correct: true }
      - { text: "1.25 15", misconception: floor-div }
      - { text: "1.0 15", misconception: div-float }
    explanation:
      vi: "75 chia 60 được 1, còn dư 15. Phép // cho phần nguyên là 1, phép % cho số dư là 15. Chia 2 số nguyên bằng // thì ra số nguyên, nên không có .0."
      en: "75 divided by 60 is 1 with a remainder of 15. // gives the whole part, 1, and % gives the remainder, 15. // with 2 integers gives an integer, so there is no .0."
  - id: s2.phep-tinh.l5.q2
    type: predict
    concepts: [precedence]
    code: |
      w = 7
      h = 3
      print(w * h)
      print((w + h) * 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "21\n13", misconception: precedence }
      - { text: "w * h\n(w + h) * 2", misconception: number-vs-text }
      - { text: "21\n20", correct: true }
      - { text: "21.0\n20.0", misconception: div-float }
    explanation:
      vi: "Dòng 3 tính 7 * 3 ra 21. Ở dòng 4, phép cộng trong ngoặc làm trước: 7 + 3 ra 10, rồi 10 * 2 ra 20. Phép tính không nằm trong dấu nháy nên Python tính ra số. Chỉ có phép / mới cho ra số thực."
      en: "Line 3 works out 7 * 3 = 21. On line 4, the addition in brackets comes first: 7 + 3 = 10, then 10 * 2 = 20. The calculations are not in quotes, so Python works them out. Only / gives a float."
---
Robo đã chơi 135 phút. Như vậy là bao nhiêu giờ và bao nhiêu phút? Một giờ có 60 phút, nên con chia 135 cho 60:

- Phần nguyên `135 // 60` là số **giờ**.
- Số dư `135 % 60` là số **phút** còn lại.

```python run
phut = 135
gio = phut // 60
phut_le = phut % 60
print(phut, "phút là", gio, "giờ", phut_le, "phút")
```

Python in ra: 135 phút là 2 giờ 15 phút.
---
Khi giải 1 bài toán bằng Python, con làm theo 3 bước:

1. Cất các số liệu của đề bài vào biến có tên dễ hiểu.
2. Tính kết quả và cất vào biến mới.
3. In kết quả ra kèm lời giải thích.

Ví dụ: Robo có 50 viên kẹo, chia đều cho 6 bạn.

```python run
keo = 50
ban = 6
moi_ban = keo // ban
con_du = keo % ban
print("Mỗi bạn được", moi_ban, "viên")
print("Còn dư", con_du, "viên")
```

Mỗi bạn được 8 viên, còn dư 2 viên.
---
Biến giúp chương trình dùng lại được cho số liệu khác. Hãy tính diện tích và chu vi của 1 hình chữ nhật:

```python run
dai = 8
rong = 5
dien_tich = dai * rong
chu_vi = (dai + rong) * 2
print("Diện tích:", dien_tich)
print("Chu vi:", chu_vi)
```

Python in ra diện tích 40 và chu vi 26. Ở dòng 4, ngoặc tròn giúp cộng trước rồi mới nhân. Con thử đổi `dai = 8` thành `dai = 10` rồi bấm Chạy thử nhé: chương trình tự tính lại cả 2 kết quả.
