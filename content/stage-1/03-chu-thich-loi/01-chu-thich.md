---
id: s1.chu-thich-loi.l1
title: { vi: "Chú thích bằng dấu #", en: "Comments with #" }
exercises:
  - id: s1.chu-thich-loi.l1.ex1
    type: code
    concepts: [hash-in-string, comment-hash]
    prompt:
      vi: "Robo vừa thi chạy với 2 bạn. In ra bảng xếp hạng đúng 4 dòng như phần Ví dụ. Nhớ in ra cả dấu #."
      en: "Robo has just run a race with 2 friends. Print the ranking: 4 lines, exactly as in the Example. Remember to print the # signs too."
    starter: |
      # Bảng xếp hạng cuộc thi chạy
      # Viết lệnh của con ở dưới dòng này
    solution: |
      # Bảng xếp hạng cuộc thi chạy
      print("Bảng xếp hạng")
      print("#1 Robo")
      print("#2 Mimi")
      print("#3 Bin")
    tests:
      - output: |
          Bảng xếp hạng
          #1 Robo
          #2 Mimi
          #3 Bin
    common_wrong:
      - output: |
          Bảng xếp hạng
          Robo
          Mimi
          Bin
        misconception: hash-in-string
        sample: |
          print("Bảng xếp hạng")
          print("Robo")  #1
          print("Mimi")  #2
          print("Bin")  #3
    hints:
      - { vi: "Dấu # nằm bên trong dấu nháy là 1 ký tự bình thường, nên được in ra.", en: "A # sign inside the quotes is an ordinary character, so it is printed." }
      - { vi: "Dòng 2 là print(\"#1 Robo\"). Dòng 3 và dòng 4 làm tương tự.", en: "Line 2 is print(\"#1 Robo\"). Do lines 3 and 4 the same way." }
    test_eligible: true
  - id: s1.chu-thich-loi.l1.q1
    type: predict
    concepts: [comment-hash]
    code: |
      print("A")  # B
      print("C")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\nC", correct: true }
      - { text: "A  # B\nC", misconception: comment-hash }
      - { text: "A B\nC", misconception: comment-hash }
      - { text: "C", misconception: comment-hash }
    explanation:
      vi: "Python chạy lệnh print(\"A\") ở đầu dòng 1, rồi bỏ qua phần chú thích từ dấu # tới hết dòng. Dòng 2 in ra C."
      en: "Python runs print(\"A\") at the start of line 1, then skips the comment from the # sign to the end of the line. Line 2 prints C."
  - id: s1.chu-thich-loi.l1.q2
    type: predict
    concepts: [hash-in-string, comment-hash]
    code: |
      print("Go #1")  # 2
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Go #1", correct: true }
      - { text: "Go", misconception: hash-in-string }
      - { text: "Go #1  # 2", misconception: comment-hash }
      - { text: "Go #1 2", misconception: comment-hash }
    explanation:
      vi: "Dấu # thứ nhất nằm trong dấu nháy nên là 1 ký tự của chuỗi và được in ra. Dấu # thứ hai nằm ngoài dấu nháy nên bắt đầu chú thích, và Python bỏ qua phần đó."
      en: "The first # is inside the quotes, so it is a character of the string and is printed. The second # is outside the quotes, so it starts a comment, and Python skips it."
---
**Chú thích** là ghi chú viết cho người đọc code, giống như ghi chú bằng bút chì bên lề vở. Chú thích bắt đầu bằng dấu `#`.

Python **bỏ qua** chú thích: không chạy, không in ra. Con đã gặp chú thích rồi đấy: dòng `# Viết lệnh của con ở dưới dòng này` trong ô code.

```python run
# Chương trình chào hỏi của Robo
print("Xin chào!")
# Dòng này là ghi chú, Python không in ra
print("Mình là Robo")
```
---
Chú thích cũng có thể đặt **ở cuối dòng lệnh**. Python chạy phần lệnh đứng trước dấu `#`, rồi bỏ qua mọi thứ từ dấu `#` tới hết dòng.

```python run
print("Robo đi học")  # in ra việc Robo làm
print("=" * 10)  # vẽ 1 đường kẻ gồm 10 dấu bằng
```

Chú thích giúp người đọc hiểu nhanh mỗi dòng làm gì, kể cả chính con khi mở lại code sau nhiều ngày.
---
Nếu dấu `#` nằm **bên trong dấu nháy** thì nó không phải chú thích. Đó chỉ là 1 ký tự của chuỗi, nên được in ra như mọi ký tự khác.

```python run
print("Robo #1")
print("# Robo đứng đầu #")  # còn đây mới là chú thích
```

Mẹo: hãy tìm dấu nháy trước. Dấu `#` nằm giữa 2 dấu nháy thì được in ra. Dấu `#` nằm ngoài dấu nháy thì bắt đầu chú thích.
