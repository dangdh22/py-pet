---
id: s2.input.l1
title: { vi: "input() là gì?", en: "What is input()?" }
exercises:
  - id: s2.input.l1.ex1
    type: code
    concepts: [input-one-line]
    prompt:
      vi: "Robo muốn chào 1 người bạn mới. Hãy dùng input() để đọc tên của bạn đó và cất vào biến ten, rồi in ra 2 dòng như phần Ví dụ. Robo chấm cả với những tên khác, nên đừng in sẵn 1 cái tên cố định."
      en: "Robo wants to greet a new friend. Use input() to read the friend's name and store it in the variable ten, then print the 2 lines in the Example. Robo also checks your program with other names, so do not print a fixed name."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      ten = input()
      print("Xin chào", ten)
      print("Robo rất vui được gặp", ten)
    tests:
      - input: "An"
        output: |
          Xin chào An
          Robo rất vui được gặp An
      - input: "Minh"
        output: |
          Xin chào Minh
          Robo rất vui được gặp Minh
        hidden: true
    common_wrong:
      - output: |
          Xin chào ten
          Robo rất vui được gặp ten
        misconception: var-assign
        sample: |
          ten = input()
          print("Xin chào", "ten")
          print("Robo rất vui được gặp", "ten")
    hints:
      - { vi: "Dòng đầu tiên đọc tên: tên biến, dấu =, rồi input() với ngoặc để trống. Sau đó dùng biến ten (không có dấu nháy) trong 2 lệnh print.", en: "The first line reads the name: the variable name, =, then input() with empty brackets. Then use the variable ten (with no quotes) in 2 print statements." }
      - { vi: "Dòng 1 là ten = input(). Dòng 2 là print(\"Xin chào\", ten). Dòng 3 làm tương tự với chuỗi \"Robo rất vui được gặp\".", en: "Line 1 is ten = input(). Line 2 is print(\"Xin chào\", ten). Do line 3 the same way with the string \"Robo rất vui được gặp\"." }
    test_eligible: true
  - id: s2.input.l1.q1
    type: mcq
    concepts: [input-one-line]
    code: |
      name = input()
    prompt:
      vi: "Khi Python chạy tới dòng này, chuyện gì xảy ra?"
      en: "What happens when Python reaches this line?"
    choices:
      - { vi: "Python đọc hết mọi dòng trong ô Dữ liệu nhập và cất vào biến name", en: "Python reads all the lines in the Input data box and stores them in the variable name", misconception: input-one-line }
      - { vi: "Python dừng lại chờ người dùng gõ 1 dòng, rồi cất dòng đó vào biến name", en: "Python stops and waits for the user to type 1 line, then stores that line in the variable name", correct: true }
      - { vi: "Python báo lỗi, vì ngoặc của input() đang để trống", en: "Python shows an error, because the brackets of input() are empty", error: true }
      - { vi: "Python dừng lại chờ người dùng gõ 1 dòng, rồi in dòng đó ra màn hình", en: "Python stops and waits for the user to type 1 line, then prints that line on the screen" }
    explanation:
      vi: "input() làm Python dừng lại và chờ. Người dùng gõ 1 dòng, input() đưa lại đúng dòng đó, và dấu = cất nó vào biến name. Mỗi lần gọi input() chỉ đọc 1 dòng. input() không in dòng đó ra màn hình: muốn in, con dùng print. Ngoặc để trống là đúng, không bị lỗi."
      en: "input() makes Python stop and wait. The user types 1 line, input() gives back exactly that line, and = stores it in the variable name. Each input() call reads only 1 line. input() does not print that line on the screen: to print it, you use print. Empty brackets are right, and there is no error."
  - id: s2.input.l1.q2
    type: mcq
    concepts: [input-prompt]
    prompt:
      vi: "Trong 1 bài tập của Py-Pet, con gõ dữ liệu cho input() ở đâu?"
      en: "In a Py-Pet exercise, where do you type the data for input()?"
    choices:
      - { vi: "Gõ vào trong ngoặc của input(), ví dụ input(\"An\")", en: "Inside the brackets of input(), for example input(\"An\")", misconception: input-prompt }
      - { vi: "Gõ vào chú thích ở cuối dòng có input(), ví dụ ten = input()  # An", en: "In a comment at the end of the line with input(), for example ten = input()  # An", misconception: comment-hash }
      - { vi: "Gõ vào phần kết quả, sau khi bấm Chạy thử", en: "In the output area, after you press Run" }
      - { vi: "Gõ vào ô Dữ liệu nhập, mỗi giá trị 1 dòng, rồi bấm Chạy thử", en: "In the Input data box, 1 value on each line, then press Run", correct: true }
    explanation:
      vi: "Ô Dữ liệu nhập nằm dưới chỗ viết code. Khi con bấm Chạy thử, input() đọc dữ liệu từ ô này. Chữ viết trong ngoặc của input() không phải là dữ liệu nhập: Python in chữ đó ra màn hình. Python cũng bỏ qua chú thích, nên chữ sau dấu # không phải là dữ liệu nhập. Phần kết quả chỉ để xem những gì chương trình in ra."
      en: "The Input data box is under the place where you write code. When you press Run, input() reads the data from this box. Text inside the brackets of input() is not input data: Python prints that text on the screen. Python also skips comments, so the text after # is not input data. The output area only shows what the program prints."
---
Từ trước tới giờ, chương trình của con chạy lần nào cũng in ra đúng 1 kết quả. Robo muốn hỏi tên của con để chào cho đúng. Để chương trình hỏi được người dùng, con dùng lệnh **input()**.

Khi gặp `input()`, Python **dừng lại và chờ**. Người dùng gõ 1 dòng rồi bấm phím Enter. Dòng vừa gõ chính là thứ mà `input()` đưa lại cho chương trình. Việc gõ dữ liệu cho chương trình gọi là **nhập dữ liệu**.

```python
ten = input()
print("Xin chào", ten)
```

Nếu con gõ An, chương trình in ra: Xin chào An. Nếu bạn khác gõ Minh, chương trình in ra: Xin chào Minh. Cùng 1 chương trình, mỗi người nhập khác nhau thì kết quả khác nhau.

Thẻ này không có chỗ để gõ, nên đoạn code trên không có nút Chạy thử. Con sẽ chạy nó ở phần bài tập.
---
Dòng `ten = input()` làm 2 việc: `input()` đọc dòng con gõ, rồi dấu `=` cất dòng đó vào biến `ten`. Nếu con gõ Robo, dòng này giống hệt lệnh gán `ten = "Robo"`.

Đoạn code dưới đây thay `input()` bằng giá trị cố định "Robo", để con bấm Chạy thử được ngay:

```python run
ten = "Robo"  # giống như con gõ Robo
print("Xin chào", ten)
print(ten, "là bạn của mình")
```

Sau khi đã cất vào biến, con dùng biến `ten` bao nhiêu lần cũng được. Chương trình không hỏi lại người dùng.
---
Trong Py-Pet, ở bài tập có dùng `input()`, bên dưới chỗ viết code có ô **Dữ liệu nhập**. Đó là chỗ con gõ sẵn những gì người dùng sẽ gõ. Mỗi dòng trong ô là 1 dòng người dùng gõ.

- Bấm **Chạy thử**: `input()` đọc dữ liệu từ ô Dữ liệu nhập. Lúc đầu, ô này có sẵn dữ liệu của phần Ví dụ. Con sửa được để thử với dữ liệu khác.
- Bấm **Nộp bài**: Robo chấm bằng dữ liệu riêng của từng test, trong đó có **test ẩn** với dữ liệu con không được thấy trước. Vì vậy, con phải đọc dữ liệu bằng `input()`, đừng in sẵn 1 cái tên cố định.

Chữ con gõ vào ô Dữ liệu nhập không hiện ra trong phần kết quả. Kết quả chỉ có những gì lệnh print in ra.
