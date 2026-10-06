---
id: s1.chuoi.l4
title: { vi: "Lặp chuỗi bằng dấu *", en: "Repeating strings with *" }
exercises:
  - id: s1.chuoi.l4.ex1
    type: code
    concepts: [string-repeat]
    prompt:
      vi: "Vẽ khung tên cho Robo, đúng 3 dòng như phần Ví dụ. Dòng 1 và dòng 3 có 10 dấu *. Hãy viết 2 dòng này bằng phép lặp chuỗi."
      en: "Draw a name frame for Robo: 3 lines, exactly as in the Example. Lines 1 and 3 have 10 * signs. Write these 2 lines by repeating a string."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      print("*" * 10)
      print("*  Robo  *")
      print("*" * 10)
    tests:
      - output: |
          **********
          *  Robo  *
          **********
    common_wrong:
      - output: |
          *10
          *  Robo  *
          *10
        misconception: string-repeat
        sample: |
          print("*10")
          print("*  Robo  *")
          print("*10")
    hints:
      - { vi: "Viết chuỗi cần lặp, rồi dấu *, rồi số lần lặp. Số lần lặp nằm ngoài dấu nháy.", en: "Write the string to repeat, then *, then the number of times. The number goes outside the quotes." }
      - { vi: "Dòng 1 là print(\"*\" * 10). Dòng 2 giữ nguyên các dấu cách như phần Ví dụ.", en: "Line 1 is print(\"*\" * 10). Line 2 keeps the spaces exactly as in the Example." }
    test_eligible: true
  - id: s1.chuoi.l4.q1
    type: predict
    concepts: [string-repeat]
    code: |
      print("ab" * 3)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "ababab", correct: true }
      - { text: "aaabbb", misconception: string-repeat }
      - { text: "ab ab ab", misconception: string-repeat }
      - { text: "ab3", misconception: string-repeat }
    explanation:
      vi: "Cả chuỗi ab được lặp lại 3 lần và nối sát nhau: ababab."
      en: "The whole string ab is repeated 3 times, with no spaces in between: ababab."
  - id: s1.chuoi.l4.q2
    type: predict
    concepts: [string-repeat]
    code: |
      print("A" + "B" * 2)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "ABB", correct: true }
      - { text: "ABAB", misconception: string-repeat }
      - { text: "AABB" }
      - { text: "AB2" }
    explanation:
      vi: "Phép * làm trước: \"B\" * 2 ra BB. Sau đó mới nối với A, nên ra ABB."
      en: "* comes first: \"B\" * 2 gives BB. Then it is joined to A, so the result is ABB."
---
Dấu `*` đặt sau 1 chuỗi, rồi đến 1 số, sẽ **lặp lại** chuỗi đó bấy nhiêu lần. Số lần lặp viết **ngoài dấu nháy**.

Các lần lặp nối sát nhau. Muốn có dấu cách giữa chúng, con đặt dấu cách vào trong chuỗi.

```python run
print("ha" * 3)
print("Robo! " * 2)
```
---
Phép `*` giúp con vẽ **đường kẻ** thật nhanh. Thay vì gõ 20 dấu bằng, con chỉ cần viết `"=" * 20`.

```python run
print("=" * 20)
print("Robo đang học")
print("=" * 20)
```
---
Một lệnh có thể dùng cả `*` và `+`. Giống trong môn Toán, **phép nhân làm trước, phép cộng làm sau**.

Với `"Ro" + "bo" * 2`, Python làm `"bo" * 2` trước, được bobo. Sau đó Python mới nối Ro với bobo, nên in ra Robobo.

```python run
print("Ro" + "bo" * 2)
print("*" * 3 + " Robo " + "*" * 3)
```
