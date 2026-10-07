---
id: s4.for-range.l6
title: { vi: "Học có giám sát và không giám sát", en: "Supervised and unsupervised learning" }
exercises:
  - id: s4.for-range.l6.q1
    type: mcq
    concepts: [ai-supervised]
    prompt:
      vi: "Một ứng dụng học từ hàng nghìn ảnh lá cây, mỗi ảnh có ghi tên loài cây. Học xong, ứng dụng đoán tên loài cây trong 1 ảnh mới. Ứng dụng đã dùng cách học nào?"
      en: "An app learns from thousands of photos of leaves, and each photo has the name of the plant written on it. After learning, the app guesses the plant's name in a new photo. Which way of learning did the app use?"
    choices:
      - { vi: "Học không giám sát, vì không có ai ngồi trông lúc AI học", en: "Unsupervised learning, because nobody sat watching while the AI learned", misconception: ai-supervised }
      - { vi: "Không phải AI học, vì người đã viết sẵn quy tắc cho từng loài cây", en: "It is not AI learning, because people wrote a rule for each plant beforehand", misconception: ai-rules-vs-data }
      - { vi: "Học có giám sát, vì mỗi ảnh đều có nhãn là tên loài cây", en: "Supervised learning, because every photo has a label, the plant's name", correct: true }
      - { vi: "Học không giám sát, vì ảnh mới chưa có nhãn", en: "Unsupervised learning, because the new photo has no label yet", misconception: ai-supervised }
    explanation:
      vi: "Ứng dụng học từ những ảnh đã có nhãn, tức là mỗi ví dụ đều có sẵn đáp án, nên đây là học có giám sát. Giám sát không có nghĩa là có người ngồi trông. Ảnh mới chưa có nhãn chính là ảnh mà ứng dụng cần đoán sau khi học xong."
      en: "The app learns from photos that already have labels, so every example comes with its answer: this is supervised learning. Supervised does not mean that someone sits watching. The new photo without a label is just the photo that the app has to guess after learning."
  - id: s4.for-range.l6.q2
    type: mcq
    concepts: [ai-supervised]
    prompt:
      vi: "Một ứng dụng nghe nhạc dùng học không giám sát cho hàng nghìn bài hát chưa có nhãn. Câu nào nói đúng về việc ứng dụng làm?"
      en: "A music app uses unsupervised learning on thousands of songs that have no labels. Which sentence about what the app does is right?"
    choices:
      - { vi: "AI tự biết tên đúng của từng nhóm, như nhóm nhạc thiếu nhi hay nhạc vui", en: "The AI knows the right name of each group by itself, such as children's songs or happy songs", misconception: ai-supervised }
      - { vi: "Phải có người ghi nhãn cho từng bài hát trước, thì AI mới chia nhóm được", en: "Someone must label every song first, or the AI cannot make groups", misconception: ai-supervised }
      - { vi: "AI chỉ xếp các bài hát theo thứ tự tên bài, từ chữ A đến chữ Z", en: "The AI only sorts the songs by their titles, from A to Z", misconception: ai-supervised }
      - { vi: "AI xếp những bài hát giống nhau vào cùng 1 nhóm, rồi người đặt tên nhóm", en: "The AI puts songs that are alike into one group, then people name the groups", correct: true }
    explanation:
      vi: "Học không giám sát dùng dữ liệu không có nhãn: AI tự tìm những bài hát giống nhau, như cùng nhịp nhanh, rồi xếp chung 1 nhóm. AI không biết tên của nhóm, nên người xem các nhóm rồi đặt tên. Xếp theo tên bài hát thì không cần học gì, và cũng không phải là tìm bài giống nhau."
      en: "Unsupervised learning uses data without labels: the AI finds songs that are alike, such as songs with the same fast beat, and puts them in one group. The AI does not know the name of a group, so people look at the groups and name them. Sorting by title needs no learning, and it does not find songs that are alike."
---
Ở các giai đoạn trước, con đã biết AI học từ những ví dụ có **nhãn**, như ảnh có ghi "mèo" hoặc "không phải mèo". Cách học này có tên là **học có giám sát**: mỗi ví dụ đều đi kèm đáp án đúng. Chữ "giám sát" ở đây nghĩa là AI học từ những ví dụ có nhãn, chứ không phải có người ngồi trông máy tính.

Giống như con luyện đề có đáp án ở cuối sách: con làm bài, so với đáp án, rồi sửa. Học xong, AI đoán được nhãn của 1 ví dụ mới chưa có nhãn, như 1 bức ảnh con vừa chụp.
---
Có khi dữ liệu không có nhãn nào. Một ứng dụng nghe nhạc có hàng nghìn bài hát, nhưng không ai ghi bài nào thuộc loại gì. Khi đó, người ta dùng **học không giám sát**: AI tự tìm những bài hát giống nhau, như cùng nhịp nhanh hay cùng tiếng đàn, rồi xếp chúng vào cùng 1 **nhóm**.

AI chỉ biết các bài trong 1 nhóm giống nhau, chứ không biết tên nhóm. Người xem từng nhóm rồi đặt tên, như "nhạc vui" hay "nhạc ru ngủ". Ghi nhãn cho thật nhiều dữ liệu rất tốn công, nên cách học này rất có ích.
