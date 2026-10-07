---
id: s3.so-sanh.l5
title: { vi: "Quy tắc cố định và học từ dữ liệu", en: "Fixed rules and learning from data" }
exercises:
  - id: s3.so-sanh.l5.q1
    type: mcq
    concepts: [ai-rules-vs-data]
    prompt:
      vi: "Việc nào chỉ cần 1 quy tắc cố định do người viết, không cần AI học từ dữ liệu?"
      en: "Which task only needs a fixed rule written by a person, with no need for an AI that learns from data?"
    choices:
      - { vi: "Nhận ra khuôn mặt của con trong ảnh chụp cả lớp", en: "Recognizing your face in a photo of the whole class", misconception: ai-rules-vs-data }
      - { vi: "Kiểm tra 1 điểm kiểm tra có từ 5 trở lên hay không", en: "Checking whether a test score is 5 or more", correct: true }
      - { vi: "Hiểu giọng nói của nhiều người khác nhau", en: "Understanding the voices of many different people", misconception: ai-rules-vs-data }
      - { vi: "Đọc chữ viết tay của cả lớp", en: "Reading the handwriting of the whole class", misconception: ai-rules-vs-data }
    explanation:
      vi: "Điểm từ 5 trở lên là 1 quy tắc rõ ràng, viết được bằng 1 phép so sánh: diem >= 5. Khuôn mặt, giọng nói và chữ viết tay thì mỗi người mỗi khác, không ai viết hết được quy tắc, nên cần AI học từ rất nhiều ví dụ."
      en: "A score of 5 or more is a clear rule that you can write with one comparison: diem >= 5. Faces, voices and handwriting are different for every person, and nobody can write down all the rules, so an AI that learns from many examples is needed."
  - id: s3.so-sanh.l5.q2
    type: mcq
    concepts: [ai-rules-vs-data]
    prompt:
      vi: "Một AI nhận ra được ảnh con mèo. AI đó có được quy tắc nhận ra mèo bằng cách nào?"
      en: "An AI can recognize photos of cats. How did that AI get its rule for recognizing cats?"
    choices:
      - { vi: "Người lập trình viết sẵn 1 phép so sánh đúng với mọi con mèo", en: "A programmer wrote one comparison that is right for every cat", misconception: ai-rules-vs-data }
      - { vi: "AI chỉ cần xem 1 bức ảnh mèo thật đẹp", en: "The AI only needs to see one very good photo of a cat", misconception: ai-data }
      - { vi: "AI so sánh cân nặng của con vật với 1 con số cố định", en: "The AI compares the animal's weight with a fixed number", misconception: ai-rules-vs-data }
      - { vi: "AI tự tìm ra quy tắc từ rất nhiều ảnh có nhãn \"mèo\" hoặc \"không phải mèo\"", en: "The AI found the rule by itself from a huge number of photos labeled \"cat\" or \"not a cat\"", correct: true }
    explanation:
      vi: "Mèo có rất nhiều màu lông, kích thước và tư thế, nên không ai viết được 1 quy tắc đúng cho mọi con mèo. AI xem rất nhiều ảnh có nhãn rồi tự tìm ra quy tắc. Chỉ 1 bức ảnh thì quá ít để học, còn trong ảnh thì AI không biết con vật nặng bao nhiêu."
      en: "Cats have many fur colours, sizes and poses, so nobody can write one rule that is right for every cat. The AI looks at a huge number of labeled photos and finds the rule by itself. One photo is far too few to learn from, and a photo does not tell the AI how heavy the animal is."
---
Các chương trình con viết đều làm theo **quy tắc cố định** do con đặt ra. Ví dụ, con quyết định: "nhiệt độ trên 30 độ là trời nóng".

```python run
nhiet_do = 33
print("Trời nóng:", nhiet_do > 30)
```

Chính con chọn con số 30. Chương trình làm đúng quy tắc đó, lần nào cũng giống nhau. Với những việc rõ ràng, đo được bằng con số, như đủ tuổi, đủ tiền hay đủ điểm, quy tắc cố định là đủ.
---
Có những việc rất khó viết thành quy tắc, như nhận ra con mèo trong ảnh. Mèo có đủ màu lông, to nhỏ khác nhau, lúc nằm, lúc chạy. Không ai viết hết được các phép so sánh cho mọi con mèo.

Với những việc như vậy, người ta dùng **AI học từ dữ liệu**: cho AI xem rất nhiều ảnh có nhãn "mèo" hoặc "không phải mèo", và AI **tự tìm ra quy tắc**. Quy tắc AI tự tìm ra có thể sai, nhất là khi gặp ảnh lạ, nên con người vẫn cần kiểm tra lại.
