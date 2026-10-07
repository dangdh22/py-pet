---
id: s2.ep-kieu.l3
title: { vi: "Đổi số thành chuỗi với str()", en: "Number to text with str()" }
exercises:
  - id: s2.ep-kieu.l3.ex1
    type: code
    concepts: [str-convert, int-convert]
    prompt:
      vi: "Robo đang sạc pin. Ô Dữ liệu nhập có 1 dòng: số phần trăm pin lúc này, là số nguyên. Sạc xong, pin tăng thêm 15. Hãy đọc số đó vào biến pin, rồi in ra lượng pin sau khi sạc như phần Ví dụ. Chú ý: dấu % đứng liền ngay sau số."
      en: "Robo is charging its battery. The Input data box has 1 line: the battery level in percent now, an integer. After charging, the level goes up by 15. Read the number into the variable pin, then print the level after charging as in the Example. Note: the % sign comes right after the number, with no space."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      pin = int(input())
      print("Pin: " + str(pin + 15) + "%")
    tests:
      - input: "65"
        output: "Pin: 80%"
      - input: "30"
        output: "Pin: 45%"
        hidden: true
    common_wrong:
      - output: "Pin: 80 %"
        misconception: print-comma-space
        sample: |
          pin = int(input())
          print("Pin:", pin + 15, "%")
    hints:
      - { vi: "Đọc pin bằng int(input()) để cộng được 15. Dấu phẩy trong print thêm 1 dấu cách trước dấu %, nên con dùng dấu + để nối, và đổi số thành chuỗi bằng str() trước khi nối.", en: "Read pin with int(input()) so that you can add 15. A comma in print adds a space before the % sign, so use + to join, and change the number into a string with str() before joining." }
      - { vi: "Dòng 1 là pin = int(input()). Dòng 2 là print(\"Pin: \" + str(pin + 15) + \"%\").", en: "Line 1 is pin = int(input()). Line 2 is print(\"Pin: \" + str(pin + 15) + \"%\")." }
    test_eligible: true
  - id: s2.ep-kieu.l3.ex2
    type: code
    concepts: [str-convert]
    prompt:
      vi: "Code bên phải báo lỗi TypeError ở dòng 3. Hãy sửa dòng 3 để in ra đúng dòng như phần Ví dụ. Chú ý: dấu / đứng liền với 2 số, không có dấu cách."
      en: "The code on the right shows a TypeError on line 3. Fix line 3 to print the line in the Example. Note: the / sign sits right between the 2 numbers, with no spaces."
    starter: |
      dung = 8
      tong = 10
      print("Con làm đúng " + dung + "/" + tong + " câu")
    solution: |
      dung = 8
      tong = 10
      print("Con làm đúng " + str(dung) + "/" + str(tong) + " câu")
    tests:
      - output: "Con làm đúng 8/10 câu"
    common_wrong:
      - output: "Con làm đúng 8 / 10 câu"
        misconception: print-comma-space
        sample: |
          dung = 8
          tong = 10
          print("Con làm đúng", dung, "/", tong, "câu")
    hints:
      - { vi: "dung và tong là số nguyên, còn dấu + chỉ nối được chuỗi với chuỗi. Con cần đổi 2 số thành chuỗi trước khi nối.", en: "dung and tong are integers, and + can only join a string with a string. Change the 2 numbers into strings before joining." }
      - { vi: "Trong lệnh print, thay dung bằng str(dung) và thay tong bằng str(tong).", en: "In the print statement, replace dung with str(dung) and tong with str(tong)." }
  - id: s2.ep-kieu.l3.q1
    type: predict
    concepts: [str-convert]
    code: |
      n = 4
      print(str(n) + "0", n + 10)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "14 14", misconception: str-convert }
      - { text: "40 410", misconception: str-convert }
      - { text: "4 0 14", misconception: concat-no-space }
      - { text: "40 14", correct: true }
    explanation:
      vi: "str(n) đưa lại chuỗi \"4\", nối với chuỗi \"0\" thành 40. Biến n không bị thay đổi, vẫn là số 4, nên n + 10 là phép cộng: 14. Dấu + không thêm dấu cách, còn dấu phẩy trong print thêm 1 dấu cách giữa 40 và 14."
      en: "str(n) gives back the string \"4\", which joins with the string \"0\" into 40. The variable n does not change: it is still the number 4, so n + 10 is an addition: 14. + adds no space, and the comma in print adds 1 space between 40 and 14."
  - id: s2.ep-kieu.l3.q2
    type: mcq
    concepts: [str-convert]
    prompt:
      vi: "Biến n chứa số nguyên 5. Lệnh nào in ra n=5, không có dấu cách?"
      en: "The variable n holds the integer 5. Which statement prints n=5, with no space?"
    choices:
      - { text: "print(\"n=\" + str(n))", correct: true }
      - { text: "print(\"n=\" + n)", misconception: str-convert }
      - { text: "print(\"n=\", n)", misconception: print-comma-space }
      - { text: "print(\"n=\" + \"n\")", misconception: var-assign }
    explanation:
      vi: "str(n) đổi số 5 thành chuỗi \"5\", nên dấu + nối được và không thêm dấu cách. \"n=\" + n báo lỗi TypeError, vì không nối được chuỗi với số. Dấu phẩy in ra n= 5, có 1 dấu cách. Còn \"n\" có dấu nháy là chữ n, không phải biến n."
      en: "str(n) changes the number 5 into the string \"5\", so + can join it and adds no space. \"n=\" + n shows a TypeError, because a string cannot join with a number. The comma prints n= 5, with a space. And \"n\" in quotes is the letter n, not the variable n."
---
Ở chủ đề Biến, con đã thấy dấu `+` không nối được chuỗi với số: Python báo lỗi TypeError. Bấm Chạy thử để xem lại:

```python run expect-error
tuoi = 11
print("Tuổi: " + tuoi)
```

Lệnh **str()** đổi 1 số thành **chuỗi**. Chữ str là viết tắt của tiếng Anh "string", nghĩa là chuỗi. Sau khi đổi, dấu `+` nối được như với 2 chuỗi bình thường:

```python run
tuoi = 11
print("Tuổi: " + str(tuoi))
```
---
`str(tuoi)` đưa lại 1 chuỗi mới, còn biến `tuoi` vẫn là số. Hãy xem dấu `+` làm gì với chuỗi mới và với số cũ:

```python run
so = 5
chu = str(so)
print(chu + chu)
print(so + so)
print(type(chu))
```

Dòng 3 nối 2 chuỗi thành 55. Dòng 4 cộng 2 số thành 10. Chuỗi "5" chỉ để đọc, giống như chuỗi đọc từ `input()`.
---
Con đã biết 1 cách khác để in chữ cùng với số: **dấu phẩy** trong print. Dấu phẩy không cần `str()`, nhưng luôn thêm 1 dấu cách. Dấu `+` thì không thêm gì cả:

```python run
diem = 9
print("Điểm:", diem, "/10")
print("Điểm: " + str(diem) + "/10")
```

Dòng 2 in ra Điểm: 9 /10, có 1 dấu cách thừa. Dòng 3 in ra Điểm: 9/10. Khi chữ và số cần đứng sát nhau, con dùng dấu `+` và `str()`. Còn lại, dùng dấu phẩy thì viết gọn hơn.
