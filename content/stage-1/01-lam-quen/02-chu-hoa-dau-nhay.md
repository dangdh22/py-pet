---
id: s1.lam-quen.l2
title: { vi: "Dấu nháy và chữ hoa, chữ thường", en: "Quotes and letter case" }
exercises:
  - id: s1.lam-quen.l2.ex1
    type: code
    concepts: [case-sensitive, string-quotes]
    prompt:
      vi: "Đoạn code bên phải có 2 lỗi. Hãy sửa để chương trình in ra: Robo đang học Python"
      en: "The code on the right has 2 errors. Fix it so that the program prints: Robo đang học Python"
    starter: |
      Print("Robo đang học Python)
    solution: |
      print("Robo đang học Python")
    tests:
      - { output: "Robo đang học Python" }
    hints:
      - { vi: "Python phân biệt chữ hoa và chữ thường.", en: "Python sees upper-case and lower-case letters as different." }
      - { vi: "Chuỗi mở bằng dấu \" thì phải đóng bằng dấu \".", en: "A string that opens with \" must close with \"." }
    test_eligible: true
  - id: s1.lam-quen.l2.q1
    type: predict
    concepts: [string-quotes]
    code: |
      print("Robo")
      print('Robo')
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Robo\nRobo", correct: true }
      - { vi: "Báo lỗi ở dòng 2", en: "An error on line 2", error: true, misconception: string-quotes }
      - { text: "\"Robo\"\n'Robo'" }
      - { text: "Robo" }
    explanation:
      vi: "Nháy kép và nháy đơn đều dùng được. Dấu nháy không được in ra, chỉ có chữ bên trong."
      en: "Double quotes and single quotes both work. The quotes are not printed. Only the text inside is printed."
---
Python phân biệt **chữ hoa** và **chữ thường**. `print` là đúng, còn `Print` hay `PRINT` là sai. Bấm Chạy thử để xem Robo giải thích lỗi:

```python run expect-error
Print("Robo")
```
---
Chữ cần in phải nằm trong cặp dấu nháy. Có thể dùng nháy kép `"..."` hoặc nháy đơn `'...'`, nhưng **mở bằng loại nào thì đóng bằng loại đó**.

```python run
print('Robo thích Python')
print("Robo thích Python")
```
