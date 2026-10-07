---
id: s1.print-nhieu.l5
title: { vi: "Vẽ hình bằng print", en: "Drawing with print" }
exercises:
  - id: s1.print-nhieu.l5.ex1
    type: code
    concepts: [sep-param]
    prompt:
      vi: "Vẽ cầu thang 4 bậc cho Robo leo, đúng như phần Ví dụ. Chỉ dùng 1 lệnh print."
      en: "Draw a staircase with 4 steps for Robo to climb, exactly as in the Example. Use only 1 print statement."
    starter: |
      # Viết 1 lệnh print ở dưới dòng này
    solution: |
      print("#", "#" * 2, "#" * 3, "#" * 4, sep="\n")
    tests:
      - output: |
          #
          ##
          ###
          ####
    common_wrong:
      - output: "# ## ### ####"
        misconception: sep-param
        sample: |
          print("#", "#" * 2, "#" * 3, "#" * 4)
      - output: "#/n##/n###/n####"
        misconception: newline-escape
        sample: |
          print("#", "#" * 2, "#" * 3, "#" * 4, sep="/n")
    hints:
      - { vi: 'Mỗi bậc là 1 giá trị, ví dụ "#" * 3 là bậc thứ ba. Dùng sep để mỗi giá trị nằm trên 1 dòng riêng.', en: 'Each step is 1 value, for example "#" * 3 is the third step. Use sep to put each value on its own line.' }
      - { vi: 'Lệnh cần có dạng print("#", "#" * 2, "#" * 3, "#" * 4, sep=...). Ký tự xuống dòng viết là \n.', en: 'The statement looks like print("#", "#" * 2, "#" * 3, "#" * 4, sep=...). The new-line character is written \n.' }
    test_eligible: true
  - id: s1.print-nhieu.l5.ex2
    type: code
    concepts: [print-comma-space, number-vs-text]
    prompt:
      vi: "Robo có 4 cục pin trong túi và 5 cục pin trong hộp. Vẽ bảng đếm pin đúng 3 dòng như phần Ví dụ. Ở dòng 2, hãy viết phép cộng 4 + 5 để Python tự tính."
      en: "Robo has 4 batteries in a bag and 5 batteries in a box. Draw the battery board: 3 lines, exactly as in the Example. On line 2, write the sum 4 + 5 so that Python works it out."
    starter: |
      print("+" + "-" * 8 + "+")
      # Viết dòng 2 ở đây
      print("+" + "-" * 8 + "+")
    solution: |
      print("+" + "-" * 8 + "+")
      print("| Pin:", 4 + 5, "|")
      print("+" + "-" * 8 + "+")
    tests:
      - output: |
          +--------+
          | Pin: 9 |
          +--------+
    common_wrong:
      - output: |
          +--------+
          | Pin:  9  |
          +--------+
        misconception: print-comma-space
        sample: |
          print("+" + "-" * 8 + "+")
          print("| Pin: ", 4 + 5, " |")
          print("+" + "-" * 8 + "+")
      - output: |
          +--------+
          | Pin: 4 + 5 |
          +--------+
        misconception: number-vs-text
        sample: |
          print("+" + "-" * 8 + "+")
          print("| Pin:", "4 + 5", "|")
          print("+" + "-" * 8 + "+")
    hints:
      - { vi: "Dòng 2 có 3 giá trị: chữ \"| Pin:\", phép cộng 4 + 5, rồi chữ \"|\". Dấu phẩy tự thêm dấu cách giữa chúng.", en: "Line 2 has 3 values: the text \"| Pin:\", the sum 4 + 5, then the text \"|\". The commas add the spaces between them." }
      - { vi: "Dòng 2 là print(\"| Pin:\", 4 + 5, \"|\"). Phép cộng không nằm trong dấu nháy.", en: "Line 2 is print(\"| Pin:\", 4 + 5, \"|\"). The sum is not inside quotes." }
    test_eligible: true
  - id: s1.print-nhieu.l5.q1
    type: predict
    concepts: [end-param, string-repeat]
    code: |
      print("#" * 2, end="")
      print("#")
      print("#" * 3)
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "##\n#\n###", misconception: end-param }
      - { text: "## #\n###", misconception: end-param }
      - { text: "##\n####", misconception: end-param }
      - { text: "###\n###", correct: true }
    explanation:
      vi: "Lệnh 1 in ## và không xuống dòng, vì end=\"\". Lệnh 2 in thêm 1 dấu # ngay sau đó, rồi xuống dòng: dòng 1 có ###. Lệnh 3 in ### ở dòng 2."
      en: "Statement 1 prints ## and does not start a new line, because of end=\"\". Statement 2 prints 1 more # right after it, then starts a new line: line 1 is ###. Statement 3 prints ### on line 2."
---
Bài này, con dùng mọi thứ đã học để **vẽ hình** bằng ký tự. Trước khi viết code, hãy vẽ hình ra giấy và **đếm số ký tự** của từng dòng.

Đầu tiên là 1 cái **khung tên**. Dòng trên và dòng dưới dùng phép `*` và dấu `+`. Dòng giữa dùng dấu phẩy và sep:

```python run
print("+" + "-" * 8 + "+")
print("|", "Robo", "|", sep="  ")
print("+" + "-" * 8 + "+")
```

Dòng giữa có 2 dấu cách ở mỗi bên chữ Robo, vì sep là chuỗi có 2 dấu cách.
---
Tiếp theo là 1 cái **cầu thang**. Mỗi bậc dài hơn bậc trước 1 ký tự:

```python run
print("#")
print("#" * 2)
print("#" * 3)
```

Với `sep="\n"`, con vẽ được cả cầu thang chỉ bằng **1 lệnh print**, vì mỗi giá trị nằm trên 1 dòng riêng:

```python run
print("#", "#" * 2, "#" * 3, sep="\n")
```
---
Bây giờ là 1 **lá cờ**. Mỗi dòng có cột cờ ở bên trái. Lệnh print với `end=""` vẽ cột cờ và không xuống dòng, rồi lệnh print sau vẽ tiếp lá cờ trên cùng dòng đó:

```python run
print("|", end="")
print("~" * 6)
print("|", end="")
print("~" * 6)
print("|")
print("|")
```
---
Cuối cùng là 1 **cái cây**. Con dùng dấu cách để đẩy ngọn cây vào giữa. Dòng nào ngắn hơn thì cần nhiều dấu cách ở đầu hơn:

```python run
print(" " * 2 + "*")
print(" " + "*" * 3)
print("*" * 5)
print(" " * 2 + "|")
```

Mẹo: viết từng dòng một và bấm Chạy thử sau mỗi dòng. Nếu hình bị lệch, hãy đếm lại số ký tự của dòng đó.
