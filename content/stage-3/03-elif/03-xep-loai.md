---
id: s3.elif.l3
title: { vi: "Xếp loại điểm", en: "Grading scores" }
exercises:
  - id: s3.elif.l3.ex1
    type: code
    concepts: [boundary-check, condition-order, elif-chain]
    prompt:
      vi: "Hãy viết chương trình xếp loại điểm của Robo: từ 8 điểm trở lên là Giỏi, từ 6.5 điểm trở lên là Khá, từ 5 điểm trở lên là Trung bình, dưới 5 điểm là Cần cố gắng. Ô Dữ liệu nhập có 1 dòng: điểm của con, có thể là số lẻ như 7.5. In ra đúng 1 dòng là loại của điểm đó, như phần Ví dụ."
      en: "Write Robo's grading program: 8 points or more is Giỏi, 6.5 or more is Khá, 5 or more is Trung bình, and below 5 is Cần cố gắng. The Input data box has 1 line: your score, which can have a decimal part like 7.5. Print exactly 1 line, the grade of that score, as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      diem = float(input())
      if diem >= 8:
          print("Giỏi")
      elif diem >= 6.5:
          print("Khá")
      elif diem >= 5:
          print("Trung bình")
      else:
          print("Cần cố gắng")
    tests:
      - input: "9"
        output: "Giỏi"
      - input: "8"
        output: "Giỏi"
        hidden: true
      - input: "7.5"
        output: "Khá"
        hidden: true
      - input: "6.5"
        output: "Khá"
        hidden: true
      - input: "6"
        output: "Trung bình"
        hidden: true
      - input: "5"
        output: "Trung bình"
        hidden: true
      - input: "4.5"
        output: "Cần cố gắng"
        hidden: true
    common_wrong:
      - test: 1
        output: "Khá"
        misconception: boundary-check
        sample: |
          diem = float(input())
          if diem > 8:
              print("Giỏi")
          elif diem >= 6.5:
              print("Khá")
          elif diem >= 5:
              print("Trung bình")
          else:
              print("Cần cố gắng")
      - test: 0
        output: "Trung bình"
        misconception: condition-order
        sample: |
          diem = float(input())
          if diem >= 5:
              print("Trung bình")
          elif diem >= 6.5:
              print("Khá")
          elif diem >= 8:
              print("Giỏi")
          else:
              print("Cần cố gắng")
    hints:
      - { vi: "Đọc điểm bằng float(input()), vì điểm có thể lẻ. \"Từ ... trở lên\" viết là >=. Xếp các điều kiện từ số lớn nhất xuống: 8, rồi 6.5, rồi 5.", en: "Read the score with float(input()), because it can have a decimal part. \"... or more\" is written >=. Put the conditions from the biggest number down: 8, then 6.5, then 5." }
      - { vi: "Dòng 1 là diem = float(input()). Sau đó là if diem >= 8:, elif diem >= 6.5:, elif diem >= 5: và else:, dưới mỗi dòng là 1 lệnh print thụt lề.", en: "Line 1 is diem = float(input()). Then come if diem >= 8:, elif diem >= 6.5:, elif diem >= 5: and else:, each with 1 indented print statement under it." }
    test_eligible: true
  - id: s3.elif.l3.ex2
    type: code
    concepts: [boundary-check, elif-chain]
    prompt:
      vi: "Robo cân ba lô đi học của con. Ba lô không quá 3 kg: in ra Ba lô vừa sức. Nặng hơn 3 kg nhưng không quá 5 kg: in ra Ba lô hơi nặng. Nặng hơn 5 kg: in ra Ba lô quá nặng, con bỏ bớt đồ ra nhé. Ô Dữ liệu nhập có 1 dòng: số ki-lô-gam, là số nguyên. Hãy in ra đúng 1 dòng như phần Ví dụ."
      en: "Robo weighs your school backpack. Not more than 3 kg: print Ba lô vừa sức. More than 3 kg but not more than 5 kg: print Ba lô hơi nặng. More than 5 kg: print Ba lô quá nặng, con bỏ bớt đồ ra nhé. The Input data box has 1 line: the weight in kilograms, an integer. Print exactly 1 line as in the Example."
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      can_nang = int(input())
      if can_nang <= 3:
          print("Ba lô vừa sức")
      elif can_nang <= 5:
          print("Ba lô hơi nặng")
      else:
          print("Ba lô quá nặng, con bỏ bớt đồ ra nhé")
    tests:
      - input: "2"
        output: "Ba lô vừa sức"
      - input: "3"
        output: "Ba lô vừa sức"
        hidden: true
      - input: "4"
        output: "Ba lô hơi nặng"
        hidden: true
      - input: "5"
        output: "Ba lô hơi nặng"
        hidden: true
      - input: "6"
        output: "Ba lô quá nặng, con bỏ bớt đồ ra nhé"
        hidden: true
    common_wrong:
      - test: 1
        output: "Ba lô hơi nặng"
        misconception: boundary-check
        sample: |
          can_nang = int(input())
          if can_nang < 3:
              print("Ba lô vừa sức")
          elif can_nang < 5:
              print("Ba lô hơi nặng")
          else:
              print("Ba lô quá nặng, con bỏ bớt đồ ra nhé")
    hints:
      - { vi: "\"Không quá 3 kg\" nghĩa là nhỏ hơn hoặc bằng 3, viết là <= 3. Ba lô nặng đúng 3 kg vẫn vừa sức. Với dấu <=, con hỏi số nhỏ trước: 3, rồi đến 5.", en: "\"Not more than 3 kg\" means less than or equal to 3, written <= 3. A backpack of exactly 3 kg is still fine. With <=, ask about the smaller number first: 3, then 5." }
      - { vi: "Dòng 1 là can_nang = int(input()). Sau đó là if can_nang <= 3:, elif can_nang <= 5: và else:, dưới mỗi dòng là 1 lệnh print thụt lề.", en: "Line 1 is can_nang = int(input()). Then come if can_nang <= 3:, elif can_nang <= 5: and else:, each with 1 indented print statement under it." }
    test_eligible: true
  - id: s3.elif.l3.q1
    type: predict
    concepts: [boundary-check]
    code: |
      t = 30
      if t > 30:
          print("hot")
      elif t > 20:
          print("warm")
      else:
          print("cold")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "hot", misconception: boundary-check }
      - { text: "warm", correct: true }
      - { text: "hot\nwarm", misconception: elif-chain }
      - { text: "warm\ncold", misconception: elif-chain }
    explanation:
      vi: "30 > 30 là False, vì 30 không lớn hơn chính nó. Python thử tiếp t > 20: 30 > 20 là True, nên in ra warm và bỏ qua nhánh else. Nếu điều kiện đầu là t >= 30 thì mới in ra hot."
      en: "30 > 30 is False, because 30 is not greater than itself. Python tries t > 20 next: 30 > 20 is True, so it prints warm and skips the else branch. Only with t >= 30 as the first condition would it print hot."
  - id: s3.elif.l3.q2
    type: mcq
    concepts: [boundary-check]
    prompt:
      vi: "Đề bài: \"Robo tặng huy hiệu cho bạn chạy được trên 100 mét\". Gọi m là số mét bạn chạy được. Điều kiện nào đúng với đề bài?"
      en: "The task says: \"Robo gives a badge to a friend who runs more than 100 metres\". Let m be the number of metres the friend runs. Which condition matches the task?"
    choices:
      - { text: "m > 100", correct: true }
      - { text: "m >= 100", misconception: boundary-check }
      - { text: "m < 100", misconception: compare-ops }
      - { text: "m <= 100", misconception: compare-ops }
    explanation:
      vi: "\"Trên 100 mét\" nghĩa là nhiều hơn 100 mét, nên bạn chạy đúng 100 mét chưa được huy hiệu. Vì vậy con dùng m > 100. Điều kiện m >= 100 sai ở đúng ranh giới 100, còn dấu < và <= hỏi số mét ít hơn."
      en: "\"More than 100 metres\" means over 100 metres, so a friend who runs exactly 100 metres gets no badge yet. That is why you use m > 100. The condition m >= 100 is wrong exactly at the boundary 100, and < and <= ask about fewer metres."
---
Robo xếp loại điểm theo 4 mức: từ 8 điểm trở lên là Giỏi, từ 6.5 điểm trở lên là Khá, từ 5 điểm trở lên là Trung bình, dưới 5 điểm là Cần cố gắng. Điểm có thể lẻ như 7.5, nên con đọc điểm bằng `float(input())`:

```python run
diem = float("7.5")  # giống như con gõ 7.5
if diem >= 8:
    print("Giỏi")
elif diem >= 6.5:
    print("Khá")
elif diem >= 5:
    print("Trung bình")
else:
    print("Cần cố gắng")
```

Các điều kiện xếp từ số lớn nhất xuống, như con đã học ở bài trước. 7.5 >= 8 là False, còn 7.5 >= 6.5 là True, nên Python in ra Khá.
---
Các số 8, 6.5 và 5 là các **ranh giới**: ở đó, kết quả đổi từ loại này sang loại khác. Ngay tại ranh giới, `>=` và `>` cho kết quả khác nhau:

```python run
print(8 >= 8)
print(8 > 8)
```

8 >= 8 là True, nhưng 8 > 8 là False. Nếu con viết diem > 8, bạn được đúng 8 điểm sẽ bị xếp Khá thay vì Giỏi.
---
Con đọc kỹ đề để chọn dấu cho đúng: "từ 8 trở lên" hay "ít nhất 8" là `>= 8`; "trên 8" hay "hơn 8" là `> 8`; "dưới 8" là `< 8`; "không quá 8" hay "tối đa 8" là `<= 8`:

```python run
so_ban = 30  # xe của Robo chở tối đa 30 bạn
if so_ban <= 30:
    print("Đủ chỗ cho mọi bạn")
else:
    print("Quá đông, cần thêm 1 xe")
```

"Tối đa 30" nghĩa là không quá 30, nên 30 bạn vẫn đủ chỗ. Python in ra Đủ chỗ cho mọi bạn.
---
Muốn biết chương trình xếp loại đúng chưa, con thử **mỗi nhánh ít nhất 1 lần**, và thử **đúng từng ranh giới**, ví dụ 9, 8, 7, 6.5, 6, 5 và 4. Lần thử ở ranh giới là lần dễ bắt lỗi nhất:

```python run
diem = 6.5  # thử đúng ranh giới
if diem >= 8:
    print("Giỏi")
elif diem > 6.5:
    print("Khá")
elif diem >= 5:
    print("Trung bình")
else:
    print("Cần cố gắng")
```

Code này viết nhầm diem > 6.5, nên 6.5 điểm bị xếp Trung bình. Thử 7 hay 6 thì kết quả vẫn đúng, nên con không thấy lỗi. Khi chấm bài, Robo cũng thử ở mọi ranh giới.
