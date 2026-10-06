---
id: s1.chuoi.l3
title: { vi: "Nối chuỗi bằng dấu +", en: "Joining strings with +" }
exercises:
  - id: s1.chuoi.l3.ex1
    type: code
    concepts: [concat-no-space, string-exact]
    prompt:
      vi: "Robo muốn in ra câu: Robo thích Python. Nhưng code bên phải in ra các chữ dính liền nhau. Hãy sửa code, vẫn dùng dấu +, để in ra đúng như phần Ví dụ."
      en: "Robo wants to print the sentence: Robo thích Python. But the code on the right prints the words stuck together. Fix the code, still using +, so that it prints exactly the Example."
    starter: |
      print("Robo" + "thích" + "Python")
    solution: |
      print("Robo " + "thích " + "Python")
    tests:
      - { output: "Robo thích Python" }
    common_wrong:
      - output: "RobothíchPython"
        misconception: concat-no-space
        sample: |
          print("Robo" + "thích" + "Python")
      - output: "Robo  thích  Python"
        misconception: string-exact
        sample: |
          print("Robo " + " thích " + " Python")
    hints:
      - { vi: "Dấu + không tự thêm dấu cách giữa 2 chuỗi. Con phải tự đặt dấu cách vào trong chuỗi.", en: "+ does not add a space between 2 strings. You must put the space inside a string yourself." }
      - { vi: "Thêm 1 dấu cách vào cuối chuỗi \"Robo\" và cuối chuỗi \"thích\", ví dụ \"Robo \".", en: "Add 1 space at the end of \"Robo\" and at the end of \"thích\", for example \"Robo \"." }
    test_eligible: true
  - id: s1.chuoi.l3.q1
    type: predict
    concepts: [concat-no-space]
    code: |
      print("ice" + "cream")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "icecream", correct: true }
      - { text: "ice cream", misconception: concat-no-space }
      - { text: "ice + cream" }
      - { vi: "Báo lỗi ở dòng 1", en: "An error on line 1", error: true }
    explanation:
      vi: "Dấu + nối 2 chuỗi sát nhau và không tự thêm dấu cách, nên ra icecream."
      en: "+ joins the 2 strings right next to each other and adds no space, so the result is icecream."
  - id: s1.chuoi.l3.q2
    type: predict
    concepts: [string-exact, concat-no-space]
    code: |
      print("4" + "4")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "44", correct: true }
      - { text: "8", misconception: string-exact }
      - { text: "4 4", misconception: concat-no-space }
      - { text: "4 + 4" }
    explanation:
      vi: "\"4\" nằm trong dấu nháy nên là chữ, không phải số. Dấu + chỉ đặt 2 chữ 4 cạnh nhau thành 44."
      en: "\"4\" is inside quotes, so it is text, not a number. + only puts the 2 characters 4 next to each other: 44."
---
Dấu `+` đặt giữa 2 chuỗi sẽ **nối** chúng thành 1 chuỗi dài hơn, giống như nối 2 toa tàu thành 1 đoàn tàu. Việc này gọi là **nối chuỗi**.

```python run
print("Py" + "Pet")
print("Ro" + "bo" + "!")
```
---
Dấu `+` **không tự thêm dấu cách**. Hai chuỗi được nối sát vào nhau.

Muốn có dấu cách, con tự đặt dấu cách vào trong chuỗi, hoặc nối thêm chuỗi `" "` (chuỗi chỉ có 1 dấu cách):

```python run
print("Xin chào" + "Robo")
print("Xin chào " + "Robo")
print("Xin chào" + " " + "Robo")
```
---
Nhớ lại bài 1: `"5"` là chữ, không phải số. Vì vậy dấu `+` giữa 2 chuỗi chữ số không làm phép cộng. Nó chỉ đặt các chữ số cạnh nhau.

```python run
print("7" + "1")
print("1" + "2" + "3")
```

Con thấy không? Python in ra 71 và 123, chứ không phải 8 và 6.
