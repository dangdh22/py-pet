---
id: s1.chu-thich-loi.l3
title: { vi: "Đọc thông báo lỗi", en: "Reading an error message" }
exercises:
  - id: s1.chu-thich-loi.l3.q1
    type: predict
    concepts: [syntax-error-nothing-runs]
    code: |
      print("A")
      print("B")
      print("C"
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "Không in gì, báo lỗi SyntaxError ở dòng 3", en: "It prints nothing and shows a SyntaxError on line 3", correct: true, error: true }
      - { vi: "In ra A và B, rồi báo lỗi SyntaxError ở dòng 3", en: "It prints A and B, then shows a SyntaxError on line 3", error: true, misconception: syntax-error-nothing-runs }
      - { text: "A\nB\nC", misconception: bracket-pairs }
      - { vi: "Không in gì, báo lỗi SyntaxError ở dòng 1", en: "It prints nothing and shows a SyntaxError on line 1", error: true }
    explanation:
      vi: "Dòng 3 thiếu dấu ) nên có lỗi cú pháp. Python kiểm tra cách viết của cả chương trình trước khi chạy, nên khi có lỗi cú pháp thì không dòng nào được chạy, kể cả dòng 1 và dòng 2."
      en: "Line 3 is missing a ), so there is a syntax error. Python checks how the whole program is written before it runs anything, so with a syntax error no line runs, not even lines 1 and 2."
  - id: s1.chu-thich-loi.l3.q2
    type: predict
    concepts: [runtime-error-stops]
    code: |
      print("Go")
      print("Go" * 2)
      Print("Stop")
      print("End")
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "Không in gì, báo lỗi NameError ở dòng 3", en: "It prints nothing and shows a NameError on line 3", error: true, misconception: runtime-error-stops }
      - { vi: "In ra Go và GoGo, rồi báo lỗi NameError ở dòng 3", en: "It prints Go and GoGo, then shows a NameError on line 3", correct: true, error: true }
      - { text: "Go\nGoGo\nEnd", misconception: runtime-error-stops }
      - { text: "Go\nGoGo\nStop\nEnd", misconception: case-sensitive }
    explanation:
      vi: "Cách viết của cả 4 dòng đều đúng, nên Python bắt đầu chạy. Dòng 1 và dòng 2 in ra Go và GoGo. Tới dòng 3, Python không biết Print là gì nên dừng lại với lỗi NameError. Dòng 4 không được chạy."
      en: "All 4 lines are written correctly, so Python starts running. Lines 1 and 2 print Go and GoGo. On line 3, Python does not know Print, so it stops with a NameError. Line 4 does not run."
  - id: s1.chu-thich-loi.l3.ex1
    type: code
    concepts: [syntax-error-nothing-runs, runtime-error-stops]
    prompt:
      vi: "Đoạn code bên phải có 2 lỗi. Lần chạy đầu, con sẽ thấy chưa dòng nào được in. Hãy đọc thông báo lỗi và sửa từng lỗi, để chương trình in ra 4 dòng như phần Ví dụ."
      en: "The code on the right has 2 errors. On the first run, you will see that no line is printed yet. Read the error messages and fix the errors one by one, so that the program prints the 4 lines in the Example."
    starter: |
      print("Robo")
      print("đang")
      pirnt("học")
      print("Python"
    solution: |
      print("Robo")
      print("đang")
      print("học")
      print("Python")
    tests:
      - output: |
          Robo
          đang
          học
          Python
    hints:
      - { vi: "Lỗi cú pháp luôn được báo trước, dù nằm ở dòng cuối. Sửa lỗi đó xong, bấm Chạy thử lại để thấy lỗi tiếp theo.", en: "A syntax error is always shown first, even when it is on the last line. After you fix it, click Run again to see the next error." }
      - { vi: "Dòng 4 thiếu dấu ) ở cuối. Ở dòng 3, tên lệnh print bị gõ sai thứ tự chữ cái.", en: "Line 4 is missing a ) at the end. On line 3, the letters of print are in the wrong order." }
    test_eligible: true
---
Ở chủ đề 1, con đã biết thông báo lỗi cho biết **dòng nào** sai và **sai kiểu gì**. Bài này giúp con đọc thông báo lỗi kỹ hơn.

Khi có lỗi, Robo giải thích bằng tiếng Việt, bắt đầu bằng số dòng. Bấm Chạy thử để xem:

```python run expect-error
print("Robo")
print("Py" + "Pet"
```

Mở mục *Xem lỗi gốc*, con thấy thông báo gốc của Python có 3 phần: số dòng (**line 2**), dòng code bị lỗi, và dòng cuối gồm **tên lỗi** (SyntaxError) cùng lời giải thích bằng tiếng Anh: `'(' was never closed`, nghĩa là dấu ( chưa được đóng.
---
Lỗi ở ví dụ trên là **lỗi cú pháp** (SyntaxError). **Cú pháp** là quy tắc viết code, giống như chính tả và dấu câu khi con viết tiếng Việt.

Trước khi chạy, Python đọc **cả chương trình** để kiểm tra cách viết. Chỉ cần 1 dòng sai cú pháp, Python **không chạy dòng nào**, kể cả các dòng đúng ở phía trên:

```python run expect-error
print("1")
print("2")
print("3"))
```

Con thấy không? Lỗi nằm ở dòng 3 (thừa 1 dấu ngoặc đóng), nhưng cả dòng 1 và dòng 2 cũng không được in.
---
Có những lỗi chỉ xuất hiện khi chương trình **đang chạy**, ví dụ **NameError** khi Python gặp 1 tên mà nó không biết. Đó gọi là **lỗi khi chạy**.

Cách viết vẫn đúng, nên Python bắt đầu chạy từ trên xuống. Các dòng trước dòng lỗi đã chạy xong và in ra. Tới dòng lỗi, Python **dừng lại**, các dòng sau không chạy nữa.

```python run expect-error
print("1")
print("2")
pirnt("3")
print("4")
```

Python in ra 1 và 2, rồi dừng ở dòng 3 vì không biết `pirnt` là gì. Dòng 4 không được chạy.
---
Vậy khi gặp lỗi, con hãy nhìn **tên lỗi** và **đầu ra**:

- **SyntaxError** (lỗi cú pháp): Python chưa chạy dòng nào, nên không có gì được in. Lỗi có thể nằm ở bất kỳ dòng nào, kể cả dòng cuối. Hãy xem số dòng trong thông báo.
- **NameError** (lỗi khi chạy): các dòng phía trên dòng lỗi đã chạy xong và in ra. Chương trình dừng đúng ở dòng có số trong thông báo.

Con đoán xem: với đoạn code dưới đây, Python có in ra chữ Một không? Bấm Chạy thử để kiểm tra.

```python run expect-error
print("Một")
print(Hai)
```
