---
id: s2.dinh-dang.l3
title: { vi: "Làm tròn với round()", en: "Rounding with round()" }
exercises:
  - id: s2.dinh-dang.l3.ex1
    type: code
    concepts: [round-digits]
    prompt:
      vi: "Robo làm 3 bài kiểm tra. Ô Dữ liệu nhập có 3 dòng, mỗi dòng là điểm của 1 bài, là số nguyên. Hãy đọc 3 điểm vào 3 biến diem_1, diem_2 và diem_3, rồi in ra điểm trung bình, làm tròn đến 1 chữ số sau dấu chấm, như phần Ví dụ. Điểm trung bình bằng tổng 3 điểm chia cho 3."
      en: "Robo takes 3 tests. The Input data box has 3 lines, each with the score of 1 test, an integer. Read the 3 scores into the 3 variables diem_1, diem_2 and diem_3, then print the average score, rounded to 1 digit after the dot, as in the Example. The average is the sum of the 3 scores divided by 3."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      diem_1 = int(input())
      diem_2 = int(input())
      diem_3 = int(input())
      trung_binh = (diem_1 + diem_2 + diem_3) / 3
      print(f"Điểm trung bình: {round(trung_binh, 1)}")
    tests:
      - input: "7\n8\n10"
        output: "Điểm trung bình: 8.3"
      - input: "9\n9\n8"
        output: "Điểm trung bình: 8.7"
        hidden: true
      - input: "6\n8\n10"
        output: "Điểm trung bình: 8.0"
        hidden: true
    common_wrong:
      - output: "Điểm trung bình: 8"
        misconception: round-digits
        sample: |
          diem_1 = int(input())
          diem_2 = int(input())
          diem_3 = int(input())
          trung_binh = (diem_1 + diem_2 + diem_3) / 3
          print(f"Điểm trung bình: {round(trung_binh)}")
      - output: "Điểm trung bình: 18.3"
        misconception: precedence
        sample: |
          diem_1 = int(input())
          diem_2 = int(input())
          diem_3 = int(input())
          trung_binh = diem_1 + diem_2 + diem_3 / 3
          print(f"Điểm trung bình: {round(trung_binh, 1)}")
    hints:
      - { vi: "Đọc mỗi điểm bằng int(input()). Cộng 3 điểm trong ngoặc tròn rồi mới chia cho 3. Cuối cùng, round(trung_binh, 1) làm tròn đến 1 chữ số sau dấu chấm.", en: "Read each score with int(input()). Add the 3 scores inside round brackets, then divide by 3. Last, round(trung_binh, 1) rounds to 1 digit after the dot." }
      - { vi: "Ba dòng đầu đọc diem_1, diem_2 và diem_3 bằng int(input()). Dòng 4 là trung_binh = (diem_1 + diem_2 + diem_3) / 3. Dòng 5 là print(f\"Điểm trung bình: {round(trung_binh, 1)}\").", en: "The first 3 lines read diem_1, diem_2 and diem_3 with int(input()). Line 4 is trung_binh = (diem_1 + diem_2 + diem_3) / 3. Line 5 is print(f\"Điểm trung bình: {round(trung_binh, 1)}\")." }
    test_eligible: true
  - id: s2.dinh-dang.l3.ex2
    type: code
    concepts: [round-digits]
    prompt:
      vi: "Robo đo nhiệt độ ngoài trời. Ô Dữ liệu nhập có 1 dòng: nhiệt độ Robo đo được, là số thực có dấu chấm. Hãy đọc số đó vào biến nhiet_do, rồi in ra nhiệt độ làm tròn thành số nguyên gần nhất, như phần Ví dụ."
      en: "Robo measures the temperature outside. The Input data box has 1 line: the temperature Robo measures, a decimal number with a dot. Read the number into the variable nhiet_do, then print the temperature rounded to the nearest whole number, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      nhiet_do = float(input())
      print(f"Hôm nay khoảng {round(nhiet_do)} độ")
    tests:
      - input: "28.7"
        output: "Hôm nay khoảng 29 độ"
      - input: "31.2"
        output: "Hôm nay khoảng 31 độ"
        hidden: true
    common_wrong:
      - output: "Hôm nay khoảng 28 độ"
        misconception: int-truncate
        sample: |
          nhiet_do = float(input())
          print(f"Hôm nay khoảng {int(nhiet_do)} độ")
    hints:
      - { vi: "Đọc nhiệt độ bằng float(input()). int() chỉ cắt bỏ phần thập phân, còn round() mới làm tròn về số nguyên gần nhất.", en: "Read the temperature with float(input()). int() only drops the decimal part, and round() rounds to the nearest whole number." }
      - { vi: "Dòng 1 là nhiet_do = float(input()). Dòng 2 là print(f\"Hôm nay khoảng {round(nhiet_do)} độ\").", en: "Line 1 is nhiet_do = float(input()). Line 2 is print(f\"Hôm nay khoảng {round(nhiet_do)} độ\")." }
  - id: s2.dinh-dang.l3.q1
    type: predict
    concepts: [round-half-even]
    code: |
      print(round(4.5), round(5.5))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "5 6", misconception: round-half-even }
      - { text: "4 6", correct: true }
      - { text: "4 5", misconception: int-truncate }
      - { text: "4.0 6.0", misconception: round-digits }
    explanation:
      vi: "4.5 nằm đúng giữa 4 và 5, nên Python chọn số chẵn là 4. 5.5 nằm đúng giữa 5 và 6, nên Python chọn số chẵn là 6. round() với 1 số trong ngoặc đưa lại số nguyên, nên không có .0."
      en: "4.5 is exactly halfway between 4 and 5, so Python picks the even number, 4. 5.5 is exactly halfway between 5 and 6, so Python picks the even number, 6. round() with 1 number in the brackets gives back an integer, so there is no .0."
  - id: s2.dinh-dang.l3.q2
    type: predict
    concepts: [round-digits]
    code: |
      x = 3.14159
      print(round(x, 2), round(x))
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "3.1 3", misconception: round-digits }
      - { text: "3.14 3.0", misconception: round-digits }
      - { text: "3.14 3", correct: true }
      - { text: "3 3", misconception: round-digits }
    explanation:
      vi: "round(x, 2) làm tròn đến 2 chữ số sau dấu chấm, nên ra 3.14. round(x) không có số thứ hai, nên làm tròn thành số nguyên 3, không có .0."
      en: "round(x, 2) rounds to 2 digits after the dot, so it gives 3.14. round(x) has no second number, so it rounds to the integer 3, with no .0."
---
Ở chủ đề trước, con thấy `10 / 3` in ra 3.3333333333333335, rất dài. Lệnh **round()** dùng để **làm tròn** 1 số, giống như khi con làm tròn ở môn Toán. Chữ round là tiếng Anh, nghĩa là làm tròn.

Số thứ hai trong ngoặc cho biết giữ lại mấy chữ số sau dấu chấm:

```python run
print(round(3.14159, 2))
print(round(3.14159, 1))
print(round(10 / 3, 2))
```

Python in ra 3.14, 3.1 và 3.33.
---
Nếu chỉ có 1 số trong ngoặc, `round()` làm tròn thành **số nguyên** gần nhất. Hãy so sánh với `int()`, lệnh chỉ cắt bỏ phần thập phân:

```python run
print(round(2.8), int(2.8))
print(round(9.2), int(9.2))
print(type(round(2.8)))
```

`round(2.8)` ra 3, vì 2.8 gần 3 hơn. `int(2.8)` ra 2, vì `int()` không làm tròn. Kết quả của `round()` khi chỉ có 1 số trong ngoặc là số nguyên (int), nên không có .0.
---
Khi 1 số nằm **đúng giữa** 2 số nguyên, như 2.5 nằm giữa 2 và 3, Python không luôn làm tròn lên như ở môn Toán. Python chọn số **chẵn** trong 2 số đó:

```python run
print(round(2.5))
print(round(3.5))
print(round(4.5))
print(round(2.51))
```

Python in ra 2, 4, 4 và 3. Số 2 và số 4 là số chẵn. Còn 2.51 không nằm đúng giữa mà gần 3 hơn, nên ra 3. Con chỉ cần nhớ: đúng giữa thì Python chọn số chẵn.
---
Con có thể dùng `round()` ngay trong ngoặc nhọn của chuỗi f:

```python run
tong_diem = 25
trung_binh = tong_diem / 3
print(trung_binh)
print(f"Điểm trung bình: {round(trung_binh, 1)}")
```

Dòng 3 in ra 8.333333333333334. Dòng 4 làm tròn đến 1 chữ số sau dấu chấm, nên in ra Điểm trung bình: 8.3.
