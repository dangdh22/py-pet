---
id: s2.phep-tinh.l4
title: { vi: "Lũy thừa ** và thứ tự phép tính", en: "Powers ** and order" }
exercises:
  - id: s2.phep-tinh.l4.ex1
    type: code
    concepts: [power-op]
    prompt:
      vi: "Diện tích hình vuông bằng cạnh mũ 2. Thể tích hình lập phương bằng cạnh mũ 3. Hãy viết 2 lệnh print dùng biến canh và phép ** để in ra 2 dòng như phần Ví dụ."
      en: "The area of a square is its side to the power of 2. The volume of a cube is its side to the power of 3. Write 2 print statements that use the variable canh and ** to print the 2 lines in the Example."
    starter: |
      canh = 4
      # Viết 2 lệnh print ở dưới dòng này
    solution: |
      canh = 4
      print("Diện tích hình vuông:", canh ** 2)
      print("Thể tích hình lập phương:", canh ** 3)
    tests:
      - output: |
          Diện tích hình vuông: 16
          Thể tích hình lập phương: 64
    common_wrong:
      - output: |
          Diện tích hình vuông: 8
          Thể tích hình lập phương: 12
        misconception: power-op
        sample: |
          canh = 4
          print("Diện tích hình vuông:", canh * 2)
          print("Thể tích hình lập phương:", canh * 3)
      - output: |
          Diện tích hình vuông: 6
          Thể tích hình lập phương: 7
        misconception: power-op
        sample: |
          canh = 4
          print("Diện tích hình vuông:", canh ^ 2)
          print("Thể tích hình lập phương:", canh ^ 3)
    hints:
      - { vi: "Cạnh mũ 2 là canh * canh. Trong Python, lũy thừa viết bằng 2 dấu sao **, không dùng dấu ^.", en: "The side to the power of 2 is canh * canh. In Python, a power is written with 2 stars **, not with ^." }
      - { vi: "Dòng thứ nhất là print(\"Diện tích hình vuông:\", canh ** 2). Dòng thứ hai dùng canh ** 3.", en: "The first line is print(\"Diện tích hình vuông:\", canh ** 2). The second line uses canh ** 3." }
    test_eligible: true
  - id: s2.phep-tinh.l4.ex2
    type: code
    concepts: [precedence]
    prompt:
      vi: "Robo mua 2 hộp bút. Mỗi hộp có 3 bút xanh và 4 bút đỏ. Code bên phải in ra 10 bút, sai rồi. Hãy thêm 1 cặp ngoặc tròn vào phép tính để in ra đúng dòng như phần Ví dụ."
      en: "Robo buys 2 boxes of pens. Each box has 3 blue pens and 4 red pens. The code on the right prints 10 pens, which is wrong. Add 1 pair of round brackets to the calculation to print the line in the Example."
    starter: |
      so_hop = 2
      but_xanh = 3
      but_do = 4
      print("Tổng số bút:", so_hop * but_xanh + but_do)
    solution: |
      so_hop = 2
      but_xanh = 3
      but_do = 4
      print("Tổng số bút:", so_hop * (but_xanh + but_do))
    tests:
      - output: "Tổng số bút: 14"
    common_wrong:
      - output: "Tổng số bút: 10"
        misconception: precedence
        sample: |
          so_hop = 2
          but_xanh = 3
          but_do = 4
          print("Tổng số bút:", so_hop * but_xanh + but_do)
    hints:
      - { vi: "Python làm phép nhân trước: 2 * 3 ra 6, rồi mới cộng 4. Con cần cộng số bút trong 1 hộp trước, rồi mới nhân với số hộp.", en: "Python does the multiplication first: 2 * 3 gives 6, then it adds 4. You need to add the pens in 1 box first, then multiply by the number of boxes." }
      - { vi: "Đặt but_xanh + but_do vào trong 1 cặp ngoặc tròn.", en: "Put but_xanh + but_do inside 1 pair of round brackets." }
    test_eligible: true
  - id: s2.phep-tinh.l4.q1
    type: predict
    concepts: [power-op]
    code: |
      print(3 ** 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "6", misconception: power-op }
      - { text: "8", misconception: power-op }
      - { text: "5", misconception: power-op }
      - { text: "9", correct: true }
    explanation:
      vi: "3 ** 2 là 3 mũ 2, tức là 3 * 3, ra 9. Đây không phải 3 nhân 2 (ra 6), cũng không phải 2 mũ 3 (ra 8)."
      en: "3 ** 2 is 3 to the power of 2, that is 3 * 3, which gives 9. It is not 3 times 2 (6), and it is not 2 to the power of 3 (8)."
  - id: s2.phep-tinh.l4.q2
    type: predict
    concepts: [precedence, power-op]
    code: |
      print(2 + 3 ** 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "11", correct: true }
      - { text: "25", misconception: precedence }
      - { text: "8", misconception: power-op }
      - { text: "10" }
    explanation:
      vi: "Python làm phép ** trước: 3 ** 2 ra 9. Sau đó mới cộng: 2 + 9 ra 11. Nếu muốn cộng trước thì phải viết (2 + 3) ** 2, ra 25."
      en: "Python does ** first: 3 ** 2 gives 9. Then it adds: 2 + 9 gives 11. To add first, you must write (2 + 3) ** 2, which gives 25."
---
Phép `**` (2 dấu sao) là **lũy thừa**. `2 ** 3` đọc là "2 mũ 3", nghĩa là 3 số 2 nhân với nhau: 2 * 2 * 2.

```python run
print(2 ** 3)
print(2 * 2 * 2)
print(5 ** 2)
```

Hai dòng đầu đều in ra 8. Dòng 3 in ra 25, vì 5 * 5 = 25. Hãy nhớ: `2 ** 3` ra 8, không phải 6. Số 6 là kết quả của `2 * 3`.
---
Trên máy tính bỏ túi, người ta hay viết 2^3 để chỉ 2 mũ 3. Trong Python, dấu `^` là một phép tính khác mà con chưa học. Python **không báo lỗi**, mà in ra 1 kết quả khác hẳn:

```python run
print(2 ^ 3)
print(2 ** 3)
```

Dòng 1 in ra 1, không phải 8. Vì Python không báo lỗi, con rất khó nhận ra mình viết sai. Muốn tính lũy thừa, con luôn dùng `**`.
---
Khi 1 dòng có nhiều phép tính, Python làm theo **thứ tự phép tính**, giống môn Toán:

1. Lũy thừa `**` làm trước tiên.
2. Rồi đến nhân và chia: `*`, `/`, `//`, `%`.
3. Cuối cùng là cộng và trừ: `+`, `-`.

Các phép cùng mức thì làm lần lượt **từ trái sang phải**.

```python run
print(2 + 3 * 4)
print(2 * 3 ** 2)
print(10 - 7 // 2)
print(8 / 2 * 3)
```

- `2 + 3 * 4`: nhân trước, 3 * 4 ra 12, rồi 2 + 12 ra **14**.
- `2 * 3 ** 2`: lũy thừa trước, 3 ** 2 ra 9, rồi 2 * 9 ra **18**.
- `10 - 7 // 2`: chia trước, 7 // 2 ra 3, rồi 10 - 3 ra **7**.
- `8 / 2 * 3`: chia và nhân cùng mức, nên làm từ trái sang phải: 8 / 2 ra 4.0, rồi 4.0 * 3 ra **12.0**.
---
Muốn Python làm phép nào trước, con đặt phép đó trong **ngoặc tròn**. Phép tính trong ngoặc luôn được làm đầu tiên.

```python run
print(2 + 3 * 4)
print((2 + 3) * 4)
print((2 * 3) ** 2)
```

Dòng 1 in ra 14. Dòng 2 cộng trước nên in ra 20. Dòng 3 nhân trước, 6 ** 2 ra 36. Khi không chắc thứ tự, con cứ thêm ngoặc cho dễ đọc.
