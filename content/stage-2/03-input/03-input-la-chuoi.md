---
id: s2.input.l3
title: { vi: "input() luôn trả về chuỗi", en: "input() always gives a string" }
exercises:
  - id: s2.input.l3.ex1
    type: code
    concepts: [input-str]
    prompt:
      vi: "Trò ảo thuật của Robo: con gõ 1 số, Robo dùng dấu + để cộng số đó với chính nó, nhưng kết quả lại là số đó viết 2 lần. Hãy đọc 1 số vào biến so, rồi in ra 2 dòng như phần Ví dụ: dòng 1 là so + so, dòng 2 là loại dữ liệu của so (dùng type())."
      en: "Robo's magic trick: you type a number, and Robo uses + to add the number to itself, but the result is the number written twice. Read 1 number into the variable so, then print the 2 lines in the Example: line 1 is so + so, and line 2 is the data type of so (use type())."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      so = input()
      print(so + so)
      print(type(so))
    tests:
      - input: "12"
        output: |
          1212
          <class 'str'>
      - input: "305"
        output: |
          305305
          <class 'str'>
        hidden: true
    hints:
      - { vi: "input() luôn đưa lại chuỗi, nên so + so nối 2 chuỗi lại. Con chỉ cần đọc vào biến so, rồi in so + so và type(so).", en: "input() always gives back a string, so so + so joins 2 strings. You only need to read into the variable so, then print so + so and type(so)." }
      - { vi: "Dòng 1 là so = input(). Dòng 2 là print(so + so). Dòng 3 là print(type(so)).", en: "Line 1 is so = input(). Line 2 is print(so + so). Line 3 is print(type(so))." }
  - id: s2.input.l3.ex2
    type: code
    concepts: [input-str]
    prompt:
      vi: "Hãy đọc tuổi của con vào biến tuoi, rồi dùng dấu + để nối thành đúng dòng như phần Ví dụ. Tuổi đọc từ input() là chuỗi, nên phép nối này không bị lỗi."
      en: "Read your age into the variable tuoi, then use + to join it into the line in the Example. An age read with input() is a string, so this join gives no error."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      tuoi = input()
      print("Robo biết con " + tuoi + " tuổi rồi!")
    tests:
      - input: "11"
        output: "Robo biết con 11 tuổi rồi!"
      - input: "9"
        output: "Robo biết con 9 tuổi rồi!"
        hidden: true
    common_wrong:
      - output: "Robo biết con11tuổi rồi!"
        misconception: concat-no-space
        sample: |
          tuoi = input()
          print("Robo biết con" + tuoi + "tuổi rồi!")
    hints:
      - { vi: "Dấu + không tự thêm dấu cách. Con cần để sẵn 1 dấu cách bên trong dấu nháy: ở cuối chuỗi đứng trước tuoi và ở đầu chuỗi đứng sau tuoi.", en: "+ does not add a space by itself. Put 1 space inside the quotes: at the end of the string before tuoi and at the start of the string after tuoi." }
      - { vi: "Dòng 1 là tuoi = input(). Dòng 2 là print(\"Robo biết con \" + tuoi + \" tuổi rồi!\").", en: "Line 1 is tuoi = input(). Line 2 is print(\"Robo biết con \" + tuoi + \" tuổi rồi!\")." }
    test_eligible: true
  - id: s2.input.l3.q1
    type: mcq
    concepts: [input-str]
    code: |
      a = input()
      b = input()
      print(a + b)
    prompt:
      vi: "Ô Dữ liệu nhập có 2 dòng: 2 và 4. Đoạn code in ra gì?"
      en: "The Input data box has 2 lines: 2 and 4. What is the output of this code?"
    choices:
      - { text: "6", misconception: input-str }
      - { text: "24", correct: true }
      - { text: "2 4", misconception: concat-no-space }
      - { vi: "Báo lỗi TypeError ở dòng 3", en: "A TypeError on line 3", error: true, misconception: input-str }
    explanation:
      vi: "input() luôn đưa lại chuỗi, nên a là chuỗi \"2\" và b là chuỗi \"4\". Dấu + giữa 2 chuỗi nối chúng lại thành 24, không có dấu cách. Nối 2 chuỗi thì không có lỗi."
      en: "input() always gives back a string, so a is the string \"2\" and b is the string \"4\". + between 2 strings joins them into 24, with no space. Joining 2 strings gives no error."
  - id: s2.input.l3.q2
    type: mcq
    concepts: [input-str]
    code: |
      n = input()
    prompt:
      vi: "Con gõ 10 vào ô Dữ liệu nhập. Sau dòng này, biến n chứa gì?"
      en: "You type 10 in the Input data box. After this line, what does the variable n hold?"
    choices:
      - { vi: "Số nguyên 10", en: "The integer 10", misconception: input-str }
      - { vi: "Số nguyên 10 nếu con gõ chữ số, còn chuỗi nếu con gõ chữ cái", en: "The integer 10 if you type digits, and a string if you type letters", misconception: input-str }
      - { vi: "Không chứa gì, vì input() chỉ đọc được chữ cái", en: "Nothing, because input() can only read letters", misconception: input-str }
      - { vi: "Chuỗi \"10\"", en: "The string \"10\"", correct: true }
    explanation:
      vi: "Dù con gõ chữ hay gõ số, input() luôn đưa lại 1 chuỗi. Vì vậy n chứa chuỗi \"10\", và print(type(n)) sẽ in ra <class 'str'>."
      en: "Whether you type letters or digits, input() always gives back a string. So n holds the string \"10\", and print(type(n)) prints <class 'str'>."
---
Dù con gõ chữ hay gõ số, **input()** luôn đưa lại 1 **chuỗi** (str). Gõ 5 thì biến nhận được chuỗi "5", như có dấu nháy, chứ không phải số 5.

```python
so = input()
print(type(so))
```

Nếu ô Dữ liệu nhập có dòng 5, chương trình in ra <class 'str'>. Đoạn code dưới đây thay `input()` bằng chuỗi "5", đúng như thứ `input()` đưa lại. Con bấm Chạy thử để xem:

```python run
so = "5"  # giống như con gõ 5
print(type(so))
```
---
Vì là chuỗi, dấu `+` sẽ **nối** chứ không cộng. Đoạn code dưới đây gọi `input()` 2 lần để đọc 2 dòng. Con sẽ học kỹ về việc đọc nhiều dòng ở bài sau.

```python
a = input()
b = input()
print(a + b)
```

Nếu ô Dữ liệu nhập có 2 dòng là 5 và 3, chương trình in ra 53, không phải 8. Python nối chuỗi "5" với chuỗi "3", như con đã học ở chủ đề Biến:

```python run
a = "5"  # giống như con gõ 5
b = "3"  # giống như con gõ 3
print(a + b)
```
---
Nếu con lấy chuỗi đọc từ `input()` cộng với 1 số, Python báo lỗi **TypeError**, vì không biết nên cộng hay nên nối. Bấm Chạy thử để xem:

```python run expect-error
so = "5"  # giống như con gõ 5
print(so + 1)
```

Ngược lại, nối chuỗi đọc từ `input()` với 1 chuỗi khác bằng dấu `+` thì không lỗi, vì cả 2 đều là chuỗi:

```python run
tuoi = "11"  # giống như con gõ 11
print("Con " + tuoi + " tuổi")
```
---
Vậy muốn nhập số để tính toán thì sao? Con cần đổi chuỗi thành số. Lúc này con chỉ cần nhớ **công thức** dưới đây. Con sẽ hiểu nó ở chủ đề "Ép kiểu".

```python
so = int(input())
print(so + 1)
```

Nếu ô Dữ liệu nhập có dòng 5, chương trình này in ra 6. Ở chủ đề này, các bài tập chỉ dùng `input()` để đọc chuỗi.
