---
id: s1.lam-quen.l4
title: { vi: "Khi máy tính không hiểu", en: "When the computer does not understand" }
exercises:
  - id: s1.lam-quen.l4.q1
    type: predict
    concepts: [read-error, string-quotes]
    code: |
      print("Một")
      print(Hai)
      print("Ba")
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "In ra Một, rồi báo lỗi NameError ở dòng 2", en: "It prints Một, then shows a NameError on line 2", correct: true, error: true }
      - { text: "Một\nHai\nBa", misconception: string-quotes }
      - { text: "Một\nBa" }
      - { vi: "Không in gì, báo lỗi SyntaxError ở dòng 2", en: "It prints nothing and shows a SyntaxError on line 2", error: true, misconception: read-error }
    explanation:
      vi: "Dòng 1 chạy bình thường. Ở dòng 2, Hai không có dấu nháy nên Python nghĩ đó là tên biến chưa có, và dừng lại với lỗi NameError. Dòng 3 không được chạy."
      en: "Line 1 runs. On line 2, Hai has no quotes, so Python thinks it is a variable that does not exist and stops with a NameError. Line 3 does not run."
  - id: s1.lam-quen.l4.ex1
    type: code
    concepts: [read-error, string-quotes]
    prompt:
      vi: "Đoạn code bên phải có 2 lỗi. Hãy đọc thông báo lỗi để tìm và sửa từng lỗi, sao cho chương trình in ra 3 dòng như phần Ví dụ."
      en: "The code on the right has 2 errors. Read the error messages to find and fix each error, so that the program prints the 3 lines in the Example."
    starter: |
      print("Robo")
      print("đang học)
      print(Python)
    solution: |
      print("Robo")
      print("đang học")
      print("Python")
    tests:
      - output: |
          Robo
          đang học
          Python
    hints:
      - { vi: "Bấm Chạy thử và xem số dòng trong thông báo lỗi.", en: "Click Run and look at the line number in the error message." }
      - { vi: "Sửa xong 1 lỗi thì chạy lại để tìm lỗi tiếp theo.", en: "After you fix 1 error, run the code again to find the next error." }
    test_eligible: true
---
Khi code viết sai, Python dừng lại và báo **lỗi**. Lỗi không có gì đáng sợ: nó cho biết **dòng nào** sai và **sai kiểu gì**.

```python run expect-error
print("Bắt đầu")
print(Robo)
```

Con thấy không? Dòng 1 vẫn in ra "Bắt đầu", rồi Python dừng ở dòng 2.
---
Thông báo lỗi có 2 phần quan trọng: **số dòng** (line) và **tên lỗi** (ví dụ SyntaxError, NameError). Robo giải thích bằng tiếng Việt, còn bản gốc tiếng Anh nằm trong mục *Xem lỗi gốc*.

Với lỗi cú pháp **SyntaxError**, Python không chạy dòng nào cả, kể cả các dòng đúng ở phía trên:

```python run expect-error
print("Bắt đầu")
print("Thiếu dấu nháy)
```
