---
id: s2.bien.l5
title: { vi: "Dữ liệu là gì?", en: "What is data?" }
exercises:
  - id: s2.bien.l5.q1
    type: mcq
    concepts: [ai-data]
    prompt:
      vi: "Câu nào nói đúng về dữ liệu?"
      en: "Which sentence about data is right?"
    choices:
      - { vi: "Chữ, số, ảnh và âm thanh đều là dữ liệu", en: "Text, numbers, pictures and sounds are all data", correct: true }
      - { vi: "Chỉ có số mới là dữ liệu", en: "Only numbers are data", misconception: ai-data }
      - { vi: "Ảnh và âm thanh không phải dữ liệu, vì không viết bằng chữ", en: "Pictures and sounds are not data, because they are not written in words", misconception: ai-data }
      - { vi: "Chỉ những gì được in ra màn hình mới là dữ liệu", en: "Only what is printed on the screen is data", misconception: ai-data }
    explanation:
      vi: "Dữ liệu là mọi thứ máy tính ghi lại và cất giữ: chữ, số, ảnh, âm thanh, video. Giá trị con cất trong biến cũng là dữ liệu."
      en: "Data is everything a computer records and keeps: text, numbers, pictures, sounds, videos. The values you store in variables are data too."
  - id: s2.bien.l5.q2
    type: mcq
    concepts: [ai-data]
    prompt:
      vi: "Người ta muốn dạy AI đọc chữ viết tay. Nên cho AI học dữ liệu như thế nào?"
      en: "People want to teach an AI to read handwriting. What data should the AI learn from?"
    choices:
      - { vi: "Thật nhiều mẫu chữ của nhiều người khác nhau, mỗi mẫu có nhãn ghi đúng chữ gì", en: "Many handwriting samples from many different people, each with a label that says the right letter", correct: true }
      - { vi: "Vài mẫu chữ của đúng 1 người là đủ", en: "A few samples from just 1 person are enough", misconception: ai-data }
      - { vi: "Thật nhiều mẫu chữ, nhãn ghi sai cũng không sao", en: "Many samples, and it is fine if the labels are wrong", misconception: ai-data }
      - { vi: "Không cần mẫu chữ nào, chỉ cần máy tính thật mạnh", en: "No samples at all, just a very powerful computer", misconception: ai-data }
    explanation:
      vi: "AI học từ dữ liệu. Dữ liệu càng nhiều, càng đa dạng và nhãn càng đúng thì AI học càng tốt. Nếu chỉ học chữ của 1 người, AI sẽ khó đọc được chữ của người khác."
      en: "AI learns from data. The more data there is, the more varied it is and the more correct the labels are, the better the AI learns. If it only learns 1 person's handwriting, it will find it hard to read other people's writing."
---
**Dữ liệu** là những gì máy tính ghi lại và cất giữ. Ở các bài trước, con đã cất chữ và số vào biến: đó chính là dữ liệu.

```python run
ten = "Robo"
chieu_cao = 50
print(ten, "cao", chieu_cao, "cm")
```

Ảnh chụp, đoạn ghi âm, video cũng là dữ liệu. Điện thoại của bố mẹ đang cất rất nhiều dữ liệu: danh bạ, ảnh, tin nhắn.
---
Ở giai đoạn 1, con đã biết AI học từ rất nhiều ví dụ. Những ví dụ đó chính là **dữ liệu**. Để dạy AI nhận ra con mèo, người ta cho AI xem hàng nghìn bức ảnh. Mỗi ảnh có 1 **nhãn**, là lời ghi chú như "mèo" hoặc "không phải mèo".

Dữ liệu tốt thì AI học tốt. Nếu nhãn bị ghi sai, ví dụ ảnh con chó lại ghi là "mèo", hoặc dữ liệu bị thiếu, ví dụ chỉ có ảnh mèo trắng, thì AI sẽ học sai và có thể không nhận ra một con mèo đen. Dữ liệu sai hoặc thiếu làm AI trả lời sai.
