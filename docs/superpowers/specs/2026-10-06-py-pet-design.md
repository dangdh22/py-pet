# Py-Pet: Thiết kế ứng dụng dạy Python cho trẻ em qua nuôi robot ảo

- Ngày: 2026-10-06
- Trạng thái: Chờ duyệt
- Phạm vi tài liệu: toàn bộ thiết kế bản đầu (giai đoạn 1 đến 4). Kế hoạch triển khai được lập riêng cho từng mốc (mục 12).

## 1. Bối cảnh và mục tiêu

### 1.1. Người dùng

- Học sinh lớp 6 theo chương trình giáo dục phổ thông của Việt Nam. Chưa từng viết code.
- Học trên laptop có bàn phím, 15 đến 30 phút mỗi ngày.
- Phụ huynh theo dõi tiến độ, đặt mục tiêu, duyệt phần thưởng thật.

### 1.2. Mục tiêu

1. Dạy nền tảng lập trình và ngôn ngữ Python từ con số 0.
2. Chuẩn bị cho 2 dạng thi:
   - Dạng Tin học trẻ / học sinh giỏi Tin: tự viết chương trình, chấm bằng test case. Đây là phần chính.
   - Dạng SCO IAIO: trắc nghiệm đọc code chọn đầu ra và kiến thức AI/Machine Learning, có bản tiếng Anh. Tham chiếu: `ref/SAIO Vietnamese/` (35 câu, 60 phút; đề lớp 6 gồm khoảng 25 câu AI/ML và khoảng 10 câu đọc code Python).
3. Duy trì động lực bằng cơ chế nuôi robot ảo: làm bài thì robot lớn lên; qua bài kiểm tra tiến hóa thì robot tiến hóa.

### 1.3. Tiêu chí thành công

1. Con tự học được giai đoạn 1 mà không cần phụ huynh ngồi cạnh, ngoại trừ các lúc app báo "Con cần hỗ trợ".
2. Con duy trì 15 đến 30 phút/ngày trong ít nhất 4 tuần liên tục, không tính các ngày nghỉ.
3. Khu phụ huynh chỉ ra đúng khái niệm con đang vướng, kèm bằng chứng cụ thể.
4. Script kiểm tra nội dung, test Pyodide và test đầu cuối đều qua trước mỗi lần deploy.

### 1.4. Các quyết định đã chốt

| Chủ đề | Quyết định |
|---|---|
| Hình thức | Web tĩnh, Python chạy trong trình duyệt bằng Pyodide, deploy GitHub Pages |
| Lưu trữ | IndexedDB trong trình duyệt, có nút xuất/nhập file |
| Nội dung | Soạn sẵn dạng file (Markdown + YAML) trong repo |
| AI giải thích lỗi | Không có trong bản đầu. Có interface sẵn để cắm OpenRouter (model miễn phí) ở bản sau. Không dùng Gemini API vì điều khoản cấm ứng dụng cho người dưới 18 tuổi |
| Ngôn ngữ | Khung app song ngữ Việt/Anh. Câu hỏi trắc nghiệm, đoán đầu ra và bài code dùng trong đề kiểm tra có bản tiếng Anh. Lời giảng lý thuyết chỉ có tiếng Việt |
| Pet | Robot AI, 4 dạng tiến hóa trong bản đầu |
| Cơ chế pet | Kiểu Tamagotchi phạt nhẹ: chỉ số Pin và Vui giảm khi vắng, không bao giờ mất cấp hay mất XP |
| Kiểm tra tiến hóa | Ngưỡng đạt 80%. Không đạt thì phải làm bộ ôn tập trọng tâm trước khi thi lại |
| Hồ sơ | Giao diện 1 bé, dữ liệu thiết kế theo hồ sơ |
| Bố cục màn hình học | Dạng thẻ cho lý thuyết và trắc nghiệm; chia đôi màn hình cho bài tập code |
| Công nghệ | React + TypeScript + Vite |

## 2. Kiến trúc tổng thể

### 2.1. Cấu trúc thư mục

```
py-pet/
  content/                  Nội dung soạn tay (Markdown + YAML)
    stage-1/ ... stage-4/
    errors/errors.yaml      Từ điển lỗi song ngữ
  tools/
    validate_content.py     Kiểm tra nội dung bằng CPython
    build_content.ts        Gộp content/ thành JSON lúc build
  src/
    content/                Đọc và tra cứu nội dung đã build
    runner/                 Pyodide trong Web Worker + chấm test
    explain/                Giải thích lỗi: interface + DictionaryProvider
    game/                   Luật game, toàn hàm thuần
    storage/                IndexedDB, hồ sơ, xuất/nhập, migration
    store/                  Store trạng thái, nối game với storage
    i18n/                   Bộ chuỗi giao diện vi/en
    ui/                     Màn hình và component React
```

### 2.2. Trách nhiệm từng module

| Module | Trách nhiệm | Phụ thuộc |
|---|---|---|
| `content` | Cung cấp giai đoạn, chủ đề, bài học, bài tập, câu hỏi, khái niệm theo ID | Không phụ thuộc module khác |
| `runner` | `runCode(code, stdin, timeoutMs)` và `judge(exercise, code)` | Pyodide |
| `explain` | `explain(ctx)` trả về lời giải thích theo ngôn ngữ đang chọn | `content` (từ điển lỗi) |
| `game` | `apply(state, event, now, rng)` trả về state mới | Không phụ thuộc React hay trình duyệt |
| `storage` | Đọc/ghi hồ sơ, xuất/nhập file, migration | Dexie (IndexedDB) |
| `store` | Nhận hành động từ UI, gọi `game.apply`, lưu, cập nhật UI | `game`, `storage` |
| `i18n` | Tra chuỗi giao diện theo khóa và ngôn ngữ | Không phụ thuộc module khác |
| `ui` | Màn hình và component | `store`, `runner`, `explain`, `content`, `i18n` |

### 2.3. Luồng dữ liệu khi con nộp bài

1. UI gọi `runner.judge(exercise, code)` và nhận `JudgeResult`.
2. Store gửi sự kiện `ExerciseJudged` vào `game.apply` để cập nhật XP, xu, Pin/Vui, điểm thành thạo, hiểu lầm, hộp Leitner và kiểm tra mốc tiến hóa.
3. Storage ghi state mới và bản ghi lịch sử trong cùng 1 giao dịch.
4. UI hiển thị kết quả và phản ứng của robot.

### 2.4. Thời gian và ngẫu nhiên

- 1 ngày học tính theo giờ địa phương của máy, mốc là 0 giờ. Chuỗi ngày, Pin/Vui và kế hoạch tuần dựa trên ngày, không dựa trên giờ.
- `now` và `rng` (có seed) luôn được truyền vào `game.apply` từ ngoài, để mọi kịch bản test lặp lại được.

## 3. Nội dung bài học

### 3.1. Cấu trúc thư mục nội dung

```
content/stage-2/
  stage.yaml                Tên giai đoạn (vi/en), thứ tự chủ đề, cấu hình kiểm tra tiến hóa
  02-bien/
    topic.yaml              Tên chủ đề (vi/en), thứ tự bài học, cấu hình kiểm tra chủ đề
    concepts.yaml           Khái niệm, thẻ hiểu lầm, kho bài luyện 3 mức
    01-bien-la-gi.md        1 bài học
    questions.yaml          Ngân hàng câu hỏi của chủ đề
```

### 3.2. Phân cấp học tập

- Giai đoạn chứa nhiều chủ đề. Chủ đề gồm 3 đến 5 bài học, mỗi bài 5 đến 10 phút.
- Bài học gồm các thẻ lý thuyết (có ví dụ chạy được) và 2 đến 4 bài tập.
- Trạm ôn (bài ôn nhanh, 5 câu) đặt sau mỗi 2 đến 3 bài học.
- Kiểm tra chủ đề ở cuối mỗi chủ đề. Kiểm tra tiến hóa ở cuối mỗi giai đoạn.

### 3.3. File bài học

Phần đầu file (YAML) khai báo bài học và bài tập. Thân file là các thẻ lý thuyết bằng tiếng Việt, ngăn cách bằng `---`. Khối code có `run` là ví dụ chạy được; `run expect-error` là ví dụ cố ý gây lỗi.

````markdown
---
id: s2.bien.l1
title: { vi: Biến là gì?, en: What is a variable? }
exercises:
  - id: s2.bien.l1.ex1
    type: code
    concepts: [input-str, var-assign]
    prompt:
      vi: Nhập tuổi của con, in ra tuổi năm sau.
    starter: |
      tuoi = input()
      print(tuoi)
    solution: |
      tuoi = int(input())
      print(tuoi + 1)
    tests:
      - { input: "11", output: "12" }
      - { input: "0", output: "1" }
      - { input: "99", output: "100", hidden: true }
    common_wrong:
      - output: "111"
        misconception: input-str
        sample: |
          tuoi = input()
          print(tuoi + "1")
    hints:
      - { vi: input() luôn trả về chuỗi. }
      - { vi: Dùng int() để đổi chuỗi thành số. }
---
Biến giống như **chiếc hộp có tên**, dùng để cất dữ liệu.

```python run
ten = "Robo"
print(ten)
```
---
Thẻ tiếp theo...
````

### 3.4. Các loại bài tập và câu hỏi

| Loại | Mô tả | Chấm |
|---|---|---|
| `code` | Tự viết code. Dùng cả cho bài "sửa lỗi" (starter là code có lỗi) | Test case |
| `predict` | Đọc code, chọn đầu ra đúng | Đáp án |
| `mcq` | Trắc nghiệm kiến thức, gồm kiến thức AI | Đáp án |
| `parsons` | Sắp xếp lại các dòng code bị xáo trộn (có thụt lề) | Chạy code đã sắp xếp với test case |
| `fill` | Điền vào chỗ trống trong code | Chạy code đã điền với test case |

### 3.5. Câu hỏi song ngữ

Câu `predict` và `mcq` bắt buộc có bản `vi` và `en` cho mọi trường văn bản. Lựa chọn trung tính về ngôn ngữ (số, đầu ra của code) chỉ cần `text`.

```yaml
- id: s2.ep-kieu.q4
  type: predict
  concepts: [int-truncate]
  lessons: [s2.ep-kieu.l3]
  code: |
    a = "5.67"
    print(int(float(a)))
  prompt:
    vi: Đoạn code in ra gì?
    en: What is the output of this code?
  choices:
    - { text: "5.67" }
    - { text: "5", correct: true }
    - { text: "6", misconception: int-truncate }
    - { vi: "Lỗi", en: "Error" }
  explanation:
    vi: int() cắt bỏ phần thập phân, không làm tròn.
    en: int() drops the decimal part. It does not round.
```

Bài `code` có `test_eligible: true` (được dùng trong đề kiểm tra) bắt buộc có `prompt.en`.

Quy ước soạn câu hỏi song ngữ: code trong câu hỏi dùng tên biến trung tính (`a`, `n`, `total`, `name`) và tránh in chuỗi tiếng Việt, để 1 đoạn code dùng chung cho cả 2 bản.

### 3.6. Khái niệm và hiểu lầm (`concepts.yaml`)

```yaml
concepts:
  - id: int-truncate
    name: { vi: int() cắt bỏ phần thập phân, en: int() truncates decimals }
    misconception_card: |          # thẻ "Hiểu lầm thường gặp" (vi, Markdown)
      Nhiều bạn nghĩ `int(5.67)` ra `6`. Thực ra `int()` **cắt bỏ** phần sau dấu chấm:
      `int(5.67)` → `5`, `int(5.1)` → `5`. Muốn làm tròn thì dùng `round()`.
    parent_tip: |                  # gợi ý giảng ngoài đời cho phụ huynh (vi)
      Cầm 1 thanh sô-cô-la 5,7 thanh: int() giống việc chỉ lấy các thanh nguyên, bỏ phần lẻ.
    practice:                      # ID bài luyện theo bậc thang
      level1: [s2.ep-kieu.q4, s2.ep-kieu.q7]
      level2: [s2.ep-kieu.p1, s2.ep-kieu.f2]
      level3: [s2.ep-kieu.l3.ex2, s2.ep-kieu.c5]
```

Mỗi chủ đề có khoảng 3 đến 6 khái niệm.

### 3.7. Quy tắc so sánh đầu ra

- Bỏ khoảng trắng thừa ở cuối mỗi dòng và các dòng trống ở cuối. Phần còn lại phải khớp chính xác.
- Bài cần so sánh số thực khai báo `compare: float` và `tolerance`.

### 3.8. Quy tắc ID

ID là khóa lưu tiến độ, không bao giờ đổi sau khi phát hành. Được phép đổi tên file và tiêu đề.

### 3.9. Script kiểm tra `tools/validate_content.py`

Chạy bằng CPython trên máy và trong CI. Kiểm tra:

1. Cấu trúc file: đủ trường bắt buộc, ID không trùng, mọi tham chiếu (bài học, khái niệm, câu hỏi) đều tồn tại.
2. Lời giải mẫu của bài `code`, `parsons`, `fill` qua toàn bộ test case (kể cả test ẩn) trong giới hạn thời gian.
3. Code `starter` không qua toàn bộ test.
4. Câu `predict`: chạy code thật; đáp án đúng khớp với đầu ra thật và chỉ đúng 1 lựa chọn khớp.
5. Ví dụ `run` chạy không lỗi; ví dụ `run expect-error` sinh lỗi.
6. Mỗi `common_wrong` có `sample` chạy ra đúng đầu ra sai đã khai báo.
7. Mỗi mục từ điển lỗi có `sample` sinh đúng loại lỗi và được đúng mục đó nhận diện.
8. Mỗi khái niệm có thẻ hiểu lầm, gợi ý cho phụ huynh và đủ bài luyện ở cả 3 mức.
9. Ngân hàng câu hỏi của mỗi giai đoạn có số câu ít nhất gấp 2 lần số câu của đề kiểm tra tiến hóa.
10. Song ngữ: mọi `predict`/`mcq` có đủ `vi` và `en`; mọi bài `code` có `test_eligible: true` có `prompt.en`; mọi mục từ điển lỗi có đủ `vi` và `en`.

### 3.10. Quy trình soạn nội dung

Claude soạn bản nháp theo từng chủ đề, chạy script kiểm tra, sau đó phụ huynh duyệt và chỉnh lời văn.

## 4. Chạy code, chấm bài, từ điển lỗi

### 4.1. Runner

- Pyodide chạy trong 1 Web Worker riêng, tải ngay khi mở app. Màn hình chờ: "Robo đang khởi động...".
- File Pyodide được đóng gói cùng app, không tải từ CDN.
- Mỗi lần chạy dùng không gian biến mới. `sys.stdin` được thay bằng dữ liệu Input. Đầu ra stdout/stderr được thu lại, giới hạn 100 KB.
- Giới hạn thời gian mặc định 2 giây mỗi lần chạy. Quá thời gian thì hủy Worker và tạo Worker mới. Không dùng cơ chế ngắt mềm vì cần header COOP/COEP mà GitHub Pages không hỗ trợ.
- Code được biên dịch với tên file `<bai-cua-con>` và lỗi được bắt trong Python để lấy số dòng chính xác, kể cả `SyntaxError`.

```
runCode(code, stdin, timeoutMs) -> {
  stdout, stderr, durationMs,
  outcome: 'ok' | 'error' | 'timeout' | 'output-limit',
  error?: { type, message, line, column, lineText }
}
```

### 4.2. Chấm bài

- "Chạy thử" chạy 1 lần với Input con tự nhập. "Nộp bài" chạy lần lượt mọi test, mỗi test dùng không gian biến mới.

```
JudgeResult {
  status: 'accepted' | 'wrong-answer' | 'error' | 'timeout'
  tests: [{ passed, hidden, input, expected, actual, error? }]
  misconceptions: string[]
}
```

- Test hiện: so sánh từng dòng, tô dòng đầu tiên khác nhau, hiện "Mong đợi" cạnh "Code của con in ra". Test ẩn: chỉ báo đúng/sai.
- Nhận diện hiểu lầm: đầu ra sai khớp `common_wrong`, hoặc lỗi khớp mục từ điển có gắn `misconception`.

### 4.3. Từ điển lỗi song ngữ (`content/errors/errors.yaml`)

```yaml
- id: name-typo
  match:
    type: NameError
    message: "name '(?P<name>\\w+)' is not defined"
    check: similar-name
  explain:
    vi: 'Dòng {line}: Python không biết "{name}" là gì. Có phải con muốn viết "{suggestion}" không?'
    en: 'Line {line}: Python does not know "{name}". Did you mean "{suggestion}"?'
  hint:
    vi: Kiểm tra chính tả và chữ hoa, chữ thường.
    en: Check the spelling and the upper-case and lower-case letters.
  misconception: case-sensitive
  sample: |
    Print("hello")
```

- Tra cứu theo thứ tự từ cụ thể đến chung. Không khớp mục cụ thể thì dùng mục chung của loại lỗi. Loại lỗi chưa có thì hiện thông báo gốc kèm câu "Lỗi này lạ quá, con hỏi bố mẹ nhé" và ghi nhật ký.
- Kiểm tra phụ trên code của con: tên gần giống (`Print` → `print`), dùng `=` thay `==` trong `if`, vòng `while` có điều kiện không đổi khi bị quá thời gian.
- Bản đầu khoảng 20 mục: thiếu `:`; `IndentationError`; chuỗi thiếu nháy đóng; ngoặc không khớp; `NameError` (gõ sai tên, viết hoa `Print`, dùng biến trước khi gán); `TypeError` cộng chuỗi với số; `ValueError` từ `int("abc")` và `int("5.5")`; `ZeroDivisionError`; `IndexError`; `EOFError` (thiếu dữ liệu Input); `=` trong `if`; quá thời gian; quá nhiều đầu ra; các mục chung theo loại lỗi.
- Hiển thị: robot nói lời giải thích trong bong bóng thoại, dòng lỗi tô đỏ trong trình soạn code, thông báo gốc tiếng Anh nằm trong mục "Xem lỗi gốc" thu gọn.

### 4.4. Interface giải thích lỗi

```
interface ExplainProvider {
  explain(ctx: ExplainContext): Promise<Explanation | null>
}
ExplainContext = { error?, code, exercise, failedTest?, recentMisconceptions, language }
```

App đi lần lượt theo chuỗi provider, provider đầu tiên trả lời được sẽ được dùng. Bản đầu chỉ có `DictionaryProvider`. Bản sau thêm `OpenRouterProvider` ở cuối chuỗi; AI chỉ được gọi khi từ điển không trả lời được hoặc khi con bấm "Giải thích kỹ hơn".

### 4.5. Trình soạn code

CodeMirror 6, chế độ Python: tô màu cú pháp, tự thụt lề 4 dấu cách, phím Tab chèn 4 dấu cách, chữ cỡ lớn. Tự lưu nháp theo từng bài.

## 5. Logic game

Toàn bộ nằm trong `src/game/` dưới dạng hàm thuần. Các giá trị đánh dấu (*) phụ huynh chỉnh được.

### 5.1. Sự kiện

`LessonCompleted`, `ExerciseJudged`, `QuestionAnswered`, `ReviewCompleted`, `TopicTestCompleted`, `EvolutionTestCompleted`, `RemedialCompleted`, `DayRollover`, `ActiveTimeRecorded`, `ItemBought`, `ItemUsed`, `RewardRequested`, `RewardApproved`, `RewardRejected`, `PracticeAssigned`, `VacationToggled`, `VacationScheduled`, `SettingsChanged`.

### 5.2. Trạng thái của 1 hồ sơ

```
profile:  tên con, tên robot, ngày tạo, cài đặt (gồm uiLanguage, questionLanguage)
pet:      giai đoạn, XP trong giai đoạn, Pin 0-5, Vui 0-5, đang đi nghỉ, lịch nghỉ, phụ kiện đang đeo, đồ sở hữu
wallet:   xu, lịch sử giao dịch
streak:   số ngày hiện tại, kỷ lục, số thẻ giữ chuỗi, ngày hoạt động cuối, điểm hoạt động hôm nay
week:     mục tiêu, số bài đã làm trong tuần, ngày bắt đầu tuần
activity: số phút học theo ngày
progress: bài học đã xong, kết quả kiểm tra chủ đề, lịch sử kiểm tra tiến hóa, bộ ôn tập trọng tâm đang mở
mastery:  theo khái niệm: điểm 0-100, mức bậc thang 1-3, cờ "Cần hỗ trợ", hiểu lầm đã gặp và số lần, 5 kết quả gần nhất
reviews:  theo câu hỏi: hộp Leitner 1-5, ngày đến hạn
assigned: danh sách bài luyện do phụ huynh giao
rewards:  danh sách phần thưởng thật (tên, giá, giới hạn/tuần), yêu cầu chờ duyệt, lịch sử
badges:   huy hiệu đã nhận
```

### 5.3. Lộ trình và mở khóa

- Bản đồ chủ đề: `Bài 1 → Bài 2 → Trạm ôn → Bài 3 → Bài 4 → Trạm ôn → … → Kiểm tra chủ đề`.
- Trạm ôn là bắt buộc. Kiểm tra chủ đề không chặn đường: làm xong với bất kỳ điểm nào là sang chủ đề tiếp theo.
- Kiểm tra tiến hóa mở khi xong mọi bài học và mọi bài kiểm tra chủ đề của giai đoạn.
- Làm lại bài đã xong không nhận lại XP.
- Nút "Học tiếp" chọn việc tiếp theo theo thứ tự ưu tiên: bài phụ huynh giao, bộ ôn tập trọng tâm đang mở, nút tiếp theo trên bản đồ.

### 5.4. XP

| Hoạt động | XP |
|---|---|
| Hoàn thành bài học | 10 |
| Bài code đúng ngay lần đầu / đúng sau vài lần / đúng sau khi xem lời giải | 15 / 10 / 3 |
| Câu trắc nghiệm hoặc đoán đầu ra đúng | 3 |
| Trạm ôn | 5 + 2 cho mỗi câu đúng |
| Kiểm tra chủ đề | 30 |

XP trong giai đoạn chia thành 3 kích cỡ hiển thị: nhỏ, vừa, lớn. XP không bao giờ mất.

### 5.5. Xu

| Hoạt động | Xu |
|---|---|
| Bài code đúng ở lần nộp đầu | 5, thêm 3 nếu không mở gợi ý |
| Kiên trì: đúng sau ít nhất 3 lần sai | thêm 5 |
| Trạm ôn | 10, thêm 5 nếu đúng hết |
| Kiểm tra chủ đề đạt từ 80% | 20 |
| Tiến hóa | 100 |
| Chuỗi 3 / 7 / 14 / 30 ngày | 20 / 50 / 100 / 250, kèm phụ kiện |
| Đạt kế hoạch tuần / vượt từ 130% | 50 / 100 |

Ước tính học 20 đến 30 phút/ngày được khoảng 40 đến 60 xu (giả định, cần kiểm chứng khi dùng thật). Khu phụ huynh hiển thị số xu trung bình/ngày thực tế để tham khảo khi đặt giá.

### 5.6. Pin và Vui

- Tăng: hoàn thành bài học Pin +1; trạm ôn Pin +2; đạt kiểm tra Vui +1; dùng đồ chơi mua bằng xu Vui +1; 3 bài đúng liên tiếp Vui +1. Tối đa 5.
- Giảm (trong `DayRollover`): đếm số ngày vắng kể từ ngày hoạt động cuối, bỏ qua ngày đi nghỉ. Ngày vắng đầu tiên được miễn (*). Từ ngày thứ 2, mỗi ngày Pin −1 và Vui −1. Thấp nhất là 0.
- Không bao giờ mất cấp, mất XP, chết hay bỏ đi.
- Trạng thái hiển thị (xét theo thứ tự): Đi nghỉ (chế độ nghỉ đang bật); Hết pin (có chỉ số bằng 0); Buồn ngủ (có chỉ số ≤ 2); Vui vẻ (cả 2 chỉ số ≥ 4); còn lại là Bình thường.

### 5.7. Chế độ nghỉ

- Phụ huynh bật ngay hoặc lên lịch theo khoảng ngày (ví dụ đợt ôn thi học kỳ).
- Trong thời gian nghỉ: Pin/Vui giữ nguyên, chuỗi ngày đóng băng, ngày nghỉ không tính vào kế hoạch tuần. Con vẫn học được nếu muốn; ngày có học vẫn được tính điểm hoạt động.

### 5.8. Chuỗi ngày và kế hoạch tuần

- 1 ngày "đạt" khi có từ 2 điểm hoạt động (*). Bài học = 1 điểm, trạm ôn = 1 điểm.
- Lỡ 1 ngày: tự dùng thẻ giữ chuỗi nếu còn; không còn thì chuỗi về 0.
- Mỗi 7 ngày liên tục được 1 thẻ giữ chuỗi, giữ tối đa 2 thẻ.
- Tuần tính từ thứ 2 đến chủ nhật. Khi sang tuần mới, chốt kết quả tuần cũ và cộng thưởng.

### 5.9. Điểm thành thạo và hỗ trợ khi gặp khó

- Công thức: `m ← m + 0,3 × (s × 100 − m)`, với `s` = 1 (đúng ngay lần đầu), 0,6 (đúng sau vài lần), 0,3 (có dùng gợi ý hoặc xem lời giải), 0 (sai).
- Đánh dấu "Cần hỗ trợ" khi xảy ra 1 trong các trường hợp: tỷ lệ đúng dưới 60% (*) trong ít nhất 5 lượt gần nhất; cùng 1 hiểu lầm xuất hiện từ 3 lần; sai bài ôn 2 lần liên tiếp. Bỏ đánh dấu khi điểm thành thạo vượt 70.
- Bậc thang: tăng 1 mức khi đúng 2 lần liên tiếp, giảm 1 mức khi sai 2 lần liên tiếp. Mức 1 = `predict`, mức 2 = `parsons`/`fill`, mức 3 = `code`.
- Hỗ trợ theo bậc:
  1. Gợi ý 3 mức trong bài tập. Sai 3 lần thì mở nút "Xem lời giải có giải thích"; bài đó được xếp lại sau 1 đến 2 ngày với bài cùng khái niệm.
  2. Phát hiện hiểu lầm thì robot mời xem thẻ "Hiểu lầm thường gặp" kèm 2 bài luyện.
  3. Khái niệm yếu được ưu tiên trong trạm ôn ở đúng mức bậc thang.
  4. Làm sai không giảm Pin/Vui. Đúng sau khi sai được thêm xu kiên trì và tính vào huy hiệu "Kiên trì".
  5. Báo cho phụ huynh ở tab "Con cần hỗ trợ" (mục 8).

### 5.10. Ôn tập ngắt quãng

- Mỗi câu hỏi nằm trong 1 trong 5 hộp Leitner, khoảng cách ôn 1, 2, 4, 7, 14 ngày. Đúng thì lên 1 hộp, sai thì về hộp 1.
- Trạm ôn gồm 5 câu: 2 câu về bài vừa học; 2 câu đến hạn ôn, ưu tiên khái niệm yếu; 1 câu về khái niệm "Cần hỗ trợ" (nếu có) ở đúng mức bậc thang; thiếu thì bù bằng câu cũ ngẫu nhiên.

### 5.11. Kiểm tra tiến hóa

- Cấu trúc (*): 15 câu `predict`/`mcq` (trong đó 3 câu kiến thức AI), mỗi câu 1 điểm; 3 bài `code` có `test_eligible: true`, mỗi bài 3 điểm, chấm theo tỷ lệ số test qua. Tổng 24 điểm. Đạt khi điểm ≥ 80% (≥ 19,2 điểm).
- Đề rút ngẫu nhiên từ ngân hàng câu hỏi của giai đoạn, tránh câu của lần thi trước.
- Ngôn ngữ đề lấy theo `questionLanguage`; con đổi được từng câu bằng nút VI/EN.
- Đạt: hoạt cảnh tiến hóa, robot lên dạng mới, +100 xu, mở giai đoạn tiếp theo.
- Chưa đạt: không bị trừ gì. App liệt kê các khái niệm sai và tạo bộ ôn tập trọng tâm (2 đến 3 bài cho mỗi khái niệm sai, ở mức bậc thang phù hợp). Làm xong bộ ôn tập thì được thi lại.

### 5.12. Cửa hàng và phần thưởng

- Khu "Đồ cho Robo": pin sạc nhanh, dầu nhớt (hồi Pin), đồ chơi (hồi Vui), phụ kiện, đồ trang trí phòng.
- Khu "Phần thưởng từ bố mẹ": danh sách do phụ huynh tạo, có giá và giới hạn số lần mỗi tuần. Con bấm Đổi thì tạo yêu cầu "Chờ bố mẹ duyệt"; xu chỉ bị trừ khi phụ huynh nhập PIN duyệt.

### 5.13. Thời gian học

Chỉ tính khi con đang ở màn hình học và có thao tác trong 60 giây gần nhất. Lưu số phút theo ngày.

### 5.14. Chống chỉnh đồng hồ

Nếu thời gian hiện tại sớm hơn ngày hoạt động cuối: không cộng thưởng chuỗi ngày, không xử lý `DayRollover` cho tới khi thời gian trở lại bình thường, và ghi cảnh báo vào nhật ký của khu phụ huynh.

## 6. Lưu trữ, hồ sơ, xuất/nhập

### 6.1. IndexedDB (Dexie)

| Bảng | Khóa | Nội dung |
|---|---|---|
| `meta` | key | Phiên bản dữ liệu, hồ sơ đang dùng, mã băm PIN, ngày sao lưu cuối, nhật ký cảnh báo, nhật ký lỗi (50 mục), 3 bản sao lưu tự động gần nhất |
| `profiles` | profileId | Tên con, tên robot, ngày tạo |
| `states` | profileId | Trạng thái game (mục 5.2), JSON |
| `attempts` | tự tăng | Lịch sử làm bài: mã bài, code, đầu ra, kết quả, hiểu lầm, ngôn ngữ câu hỏi, thời gian. Giữ 10 lượt gần nhất mỗi bài |
| `drafts` | profileId + mã bài | Code đang làm dở |

- Mỗi sự kiện ghi state và bản ghi lịch sử trong cùng 1 giao dịch.
- Lần đầu mở app gọi `navigator.storage.persist()`. Khuyên dùng Chrome hoặc Edge.
- Quá 7 ngày chưa sao lưu thì hiện banner kèm nút xuất file.

### 6.2. Hồ sơ

Lần đầu mở app: chọn ngôn ngữ giao diện, nhập tên con, đặt tên robot, phụ huynh đặt PIN. App tạo 1 hồ sơ. Mọi dữ liệu gắn với `profileId`; màn hình chọn hồ sơ ẩn trong bản đầu. PIN, cài đặt chung và khu phụ huynh dùng chung cho mọi hồ sơ.

### 6.3. Mã PIN

- 4 đến 6 chữ số, lưu dạng mã băm có muối (PBKDF2 qua WebCrypto).
- Có nút đặt lại PIN. Sau khi đặt lại, khu phụ huynh hiện banner cố định ghi thời điểm đặt lại.

### 6.4. Xuất file

- Tên file: `py-pet-<ten-con>-YYYY-MM-DD.pypet`. Không cần PIN.
- Nội dung (mã hóa base64):

```
{ format: "py-pet-backup", schemaVersion, appVersion, exportedAt,
  meta, profiles: [{ profile, state, attempts, drafts }],
  checksum }
```

- `checksum` = SHA-256 của nội dung cộng 1 chuỗi bí mật cố định của app. Mục đích là phát hiện file bị sửa tay, không phải bảo mật.

### 6.5. Nhập file

1. Bắt buộc nhập PIN.
2. Kiểm tra định dạng và checksum. Checksum sai thì cảnh báo "File đã bị chỉnh sửa"; phụ huynh vẫn có thể chọn nhập tiếp.
3. File từ phiên bản mới hơn app thì từ chối và hướng dẫn tải lại trang.
4. Chạy migration nếu file từ phiên bản cũ.
5. Hiện bản xem trước (tên con, giai đoạn, xu, ngày hoạt động cuối) để xác nhận.
6. Tự sao lưu dữ liệu hiện tại trước khi ghi đè (giữ 3 bản gần nhất).

### 6.6. Migration

`schemaVersion` là số nguyên. Mỗi lần đổi cấu trúc thì tăng 1 và thêm 1 hàm migration thuần. Repo giữ file mẫu của mọi phiên bản cũ để test.

### 6.7. Khi nội dung thay đổi

Bài bị xóa khỏi nội dung: tiến độ được giữ nhưng không hiển thị. Bài mới thêm vào chủ đề đã học xong: hiện nhãn "Bài mới", không khóa lại giai đoạn đã tiến hóa.

## 7. Song ngữ (i18n)

### 7.1. Phạm vi

| Phần | Tiếng Việt | Tiếng Anh |
|---|---|---|
| Khung app: nút, menu, thông báo, lời thoại robot, khu phụ huynh | Có | Có |
| Từ điển lỗi | Có | Có |
| Tên giai đoạn, chủ đề, bài học, khái niệm | Có | Có |
| Câu `predict` và `mcq` | Có | Có |
| Đề bài `code` có `test_eligible: true` | Có | Có |
| Thẻ lý thuyết, đề bài `code` thường, gợi ý, thẻ hiểu lầm, gợi ý cho phụ huynh | Có | Không |

### 7.2. Cài đặt ngôn ngữ

- `uiLanguage`: `vi` hoặc `en`. Đổi được trong cài đặt; mặc định `vi`.
- `questionLanguage`: `vi`, `en` hoặc `both` (hiện 2 bản song song). Phụ huynh đặt mặc định.
- Trên mỗi câu hỏi có nút VI/EN để con đổi tạm cho câu đó.
- Khi giao diện là `en` mà phần nội dung chỉ có `vi`, app hiện bản `vi` (không để trống).

### 7.3. Triển khai

- Bộ chuỗi giao diện đặt trong `src/i18n/vi.ts` và `src/i18n/en.ts`. Kiểu TypeScript bắt buộc 2 bộ có cùng tập khóa; thiếu khóa là lỗi biên dịch.
- Nội dung dùng trường `{ vi, en }` (mục 3.5). Hàm `pick(text, lang)` trả về bản đúng ngôn ngữ, hoặc bản `vi` nếu không có bản `en`.
- Lịch sử làm bài ghi lại ngôn ngữ câu hỏi, để khu phụ huynh thấy con làm bản nào.

## 8. Giao diện

### 8.1. Luồng chính

Lần đầu: chào hỏi (ngôn ngữ, tên con, tên robot, PIN). Sau đó: Phòng robot → Bản đồ học → Bài học / Trạm ôn / Kiểm tra → Màn hình kết quả → Phòng robot. Từ Phòng robot còn vào được Cửa hàng, Sổ thành tích, Khu phụ huynh, Sao lưu.

### 8.2. Các màn hình của con

1. **Phòng robot:** robot trong phòng; thanh Pin, Vui, Lớn lên; mục tiêu hôm nay và tuần; chuỗi ngày; xu; nút "Học tiếp".
2. **Bản đồ học:** đường đi các nút theo chủ đề, màu theo trạng thái (đã xong, tiếp theo, trạm ôn, kiểm tra, khóa); danh sách chủ đề; ô "Kiểm tra tiến hóa".
3. **Bài học:** thẻ lý thuyết từng bước (đọc, chạy ví dụ, Tiếp). Bài tập `code` dùng màn hình chia đôi: đề bên trái; trình soạn code, ô Input, nút Chạy thử/Nộp bài và kết quả test bên phải; robot nhỏ góc dưới trái hiện bong bóng giải thích.
4. **Trạm ôn và kiểm tra:** dạng thẻ, mỗi thẻ 1 câu, có nút VI/EN. Trạm ôn hiện giải thích ngay sau mỗi câu. Kiểm tra chỉ hiện kết quả ở cuối.
5. **Màn hình kết quả:** XP, xu, Pin nhận được; mục tiêu ngày; chuỗi ngày. Hoạt cảnh tiến hóa toàn màn hình khi đạt. Khi chưa đạt: lời động viên, danh sách khái niệm cần ôn, nút "Bắt đầu ôn tập trọng tâm".
6. **Cửa hàng:** 2 tab như mục 5.12.
7. **Sổ thành tích:** huy hiệu, các dạng robot đã đạt, số khái niệm đã vững và đang luyện. Không hiện điểm yếu chi tiết.

### 8.3. Trạng thái đặc biệt của Phòng robot

- Buồn ngủ: robot ngáp, phòng tối hơn, bong bóng nhớ con.
- Hết pin: robot nằm cạnh ổ sạc; nút "Sạc cho Robo" mở ngay 1 trạm ôn.
- Đi nghỉ: robot ở bãi biển đeo kính râm; nút học vẫn hoạt động.
- Banner sao lưu khi quá 7 ngày.

### 8.4. Hình ảnh robot

4 dạng tiến hóa (Viên nang, Sơ sinh, Bé con, Thiếu niên) × 3 kích cỡ × 5 trạng thái (Vui vẻ, Bình thường, Buồn ngủ, Hết pin, Đi nghỉ), vẽ bằng SVG, có phụ kiện đeo được. Mỗi lần tiến hóa được nâng cấp linh kiện (ăng-ten, tay, màn hình ngực).

## 9. Khu phụ huynh

Vào bằng PIN; tự khóa sau 5 phút không thao tác hoặc khi rời khu.

1. **Tổng quan:** cảnh báo (yêu cầu đổi thưởng, khái niệm cần hỗ trợ, nhắc sao lưu); biểu đồ số phút học 7 ngày (ngày nghỉ màu xám); giai đoạn hiện tại, kế hoạch tuần, chuỗi ngày, xu.
2. **Con cần hỗ trợ:** mỗi khái niệm yếu hiện điểm thành thạo, tỷ lệ đúng, hiểu lầm hay gặp, mức bậc thang; bằng chứng là bài làm thật của con (code, input, đầu ra so với mong đợi); gợi ý giảng ngoài đời; nút "Giao thêm bài luyện"; nút "Đánh dấu đã kèm con". Bên dưới là các khái niệm đang luyện (điểm 40 đến 70).
3. **Tiến độ chi tiết:** bảng theo chủ đề (số bài, thành thạo, điểm kiểm tra chủ đề); lịch sử kiểm tra tiến hóa; chi tiết từng bài (số lần nộp, gợi ý đã dùng, thời gian, ngôn ngữ câu hỏi).
4. **Phần thưởng:** duyệt/từ chối yêu cầu; quản lý danh sách (tên, giá, giới hạn/tuần); số xu trung bình/ngày để tham khảo; lịch sử.
5. **Cài đặt:** chế độ nghỉ (bật ngay hoặc lên lịch); mục tiêu ngày, kế hoạch tuần, số ngày vắng được miễn; ngưỡng đạt tiến hóa, ngưỡng "Cần hỗ trợ", giới hạn thời gian chạy code; ngôn ngữ giao diện và ngôn ngữ câu hỏi mặc định; xuất/nhập file, đổi PIN, xóa hồ sơ; nhật ký cảnh báo và nhật ký lỗi.

## 10. Xử lý lỗi

| Tình huống | Cách xử lý |
|---|---|
| Trình duyệt thiếu WebAssembly, Worker hoặc IndexedDB | Màn hình kiểm tra trình duyệt, khuyên dùng Chrome hoặc Edge |
| Tải Pyodide thất bại | "Robo chưa khởi động được" + nút Thử lại; các phần không chạy code vẫn dùng được |
| Worker treo hoặc sập | Tạo Worker mới; sập 3 lần liên tiếp thì hướng dẫn tải lại trang |
| Chế độ ẩn danh, IndexedDB bị chặn | Banner đỏ "Tiến độ sẽ không được lưu"; vẫn học được |
| Ghi dữ liệu thất bại | Thử lại 1 lần; vẫn lỗi thì giữ trong bộ nhớ, hiện banner, mời xuất file |
| Nội dung lỗi lúc chạy | Bỏ qua bài lỗi, ghi nhật ký, không chặn lộ trình |
| File nhập không hợp lệ hoặc từ bản mới hơn | Báo rõ nguyên nhân, không ghi đè |
| Lỗi giao diện bất ngờ | Vùng bắt lỗi theo màn hình: "Robo bị trục trặc" + nút Tải lại + nút Xuất file |
| Mở app ở 2 tab | Web Locks: chỉ 1 tab được ghi; tab kia hiện "App đang mở ở tab khác" |

Nhật ký lỗi lưu 50 mục gần nhất, xem và xuất được trong khu phụ huynh.

## 11. Kiểm thử

Viết test trước khi viết code (TDD). `now` và `rng` luôn được truyền vào.

1. **Unit test (Vitest):** luật game theo kịch bản thời gian (vắng nhiều ngày, ngày được miễn, chế độ nghỉ và lịch nghỉ, thẻ giữ chuỗi, chốt tuần, đồng hồ bị lùi, giới hạn đổi thưởng theo tuần); điểm thành thạo, "Cần hỗ trợ", bậc thang, Leitner, thành phần trạm ôn, chấm và rút đề tiến hóa, bộ ôn tập trọng tâm; so sánh đầu ra, `common_wrong`, tra từ điển lỗi, gợi ý tên gần giống; xuất rồi nhập lại cho dữ liệu giống hệt, checksum, migration trên file mẫu; i18n: 2 bộ chuỗi đủ khóa, `pick` trả về bản dự phòng `vi`.
2. **Kiểm tra nội dung:** pytest cho chính `validate_content.py`; chạy script trên toàn bộ `content/` ở mỗi commit.
3. **Test tích hợp với Pyodide thật (Node.js):** stdin, quá thời gian, giới hạn đầu ra, số dòng lỗi, không gian biến mới; chạy toàn bộ lời giải mẫu và code của câu `predict` trên Pyodide để đối chiếu với CPython.
4. **Test component (React Testing Library):** màn hình bài tập chia đôi, thẻ trắc nghiệm có nút VI/EN, cửa nhập PIN, bong bóng giải thích lỗi.
5. **Test đầu cuối (Playwright, Chromium)** với bộ nội dung mẫu và đồng hồ giả lập: lần đầu mở app đến bài đầu tiên và nhận XP; trạm ôn; thi tiến hóa không đạt, ôn trọng tâm, thi lại đạt; đổi thưởng và duyệt bằng PIN; xuất và nhập file; chế độ nghỉ; chuyển giao diện sang tiếng Anh.
6. **Kiểm thử thủ công trước mỗi lần phát hành:** gõ tiếng Việt bằng Unikey và bộ gõ macOS trong trình soạn code; laptop 13 và 15 inch; quan sát con dùng thử 1 buổi.
7. **CI (GitHub Actions):** mỗi lần push chạy lint, kiểm tra kiểu, unit test, kiểm tra nội dung, test Pyodide, test đầu cuối. Merge vào `main` thì build và deploy GitHub Pages.

## 12. Phạm vi bản đầu và các mốc

### 12.1. Nội dung bản đầu (ước tính)

| Giai đoạn | Chủ đề | Số bài | Phần AI |
|---|---|---|---|
| 1. Khởi động | Làm quen với chương trình; `print` và chuỗi; chú thích và đọc thông báo lỗi; `print` nhiều giá trị (`sep`, `end`) | ~18 | AI là gì |
| 2. Dữ liệu | Biến; phép tính `// % **`; `input()`; ép kiểu; định dạng đầu ra (f-string, `round`) | ~25 | Dữ liệu là gì |
| 3. Rẽ nhánh | So sánh và `bool`; `if`/`else`; `elif`; `and`/`or`/`not`; bài toán điều kiện (chẵn lẻ, năm nhuận, số lớn nhất) | ~22 | Quy tắc cố định và học từ dữ liệu |
| 4. Vòng lặp | `for` và `range`; `while`; tổng, đếm, lớn nhất; vòng lặp lồng và vẽ hình `*`; bài toán chữ số và ước số (`break`, `continue`) | ~28 | Học có giám sát và không giám sát |

Kèm theo: khoảng 270 câu `predict`/`mcq` song ngữ; khoảng 70 khái niệm có thẻ hiểu lầm, gợi ý cho phụ huynh và bài luyện 3 mức; 4 đề kiểm tra tiến hóa; từ điển khoảng 20 lỗi song ngữ.

### 12.2. Ngoài phạm vi bản đầu

- Giải thích lỗi bằng AI (OpenRouter).
- Giai đoạn 5 và 6: chuỗi, list, dict, hàm, thuật toán thi đấu, NumPy, `re`, đề IAIO 35 câu.
- Bản tiếng Anh cho thẻ lý thuyết, gợi ý, thẻ hiểu lầm.
- Giao diện nhiều hồ sơ, đồng bộ đám mây, theo dõi từ máy khác.
- PWA offline hoàn toàn; điện thoại và máy tính bảng.
- Âm thanh, bảng xếp hạng, chế độ lớp học.

### 12.3. Các mốc

Mỗi mốc có kế hoạch triển khai riêng và kết thúc bằng 1 bản chạy được.

1. **M1 – Lát cắt dọc:** khung dự án, i18n, runner, chấm bài, từ điển lỗi, định dạng nội dung, script kiểm tra, màn hình bài học, 1 chủ đề đầu tiên của giai đoạn 1.
2. **M2 – Vòng chơi pet:** state game, Phòng robot, Bản đồ học, màn hình kết quả, lưu trữ, xuất/nhập, màn hình chào hỏi.
3. **M3 – Ôn tập và hỗ trợ:** điểm thành thạo, Leitner, trạm ôn, kiểm tra chủ đề và tiến hóa, bậc thang, `parsons` và `fill`, bộ ôn tập trọng tâm.
4. **M4 – Cửa hàng và khu phụ huynh.**
5. **M5 – Nội dung giai đoạn 1 đến 4:** bắt đầu song song sau M1. Mỗi giai đoạn: soạn, chạy script kiểm tra, phụ huynh duyệt.
6. **M6 – Hoàn thiện:** hình robot đầy đủ, hoạt cảnh, CI/CD, con dùng thử và chỉnh theo phản hồi.

## 13. Giả định cần kiểm chứng

1. Pyodide tải khoảng 10 MB lần đầu; tải lại Worker mất 1 đến 3 giây.
2. Pyodide chậm hơn CPython 1,5 đến 3 lần; giới hạn 2 giây đủ cho bài lớp 6.
3. CPython và Pyodide cho cùng kết quả với nội dung chỉ dùng thư viện chuẩn (được kiểm chứng bằng test ở mục 11.3).
4. Safari có thể xóa dữ liệu trang web không truy cập trong 7 ngày.
5. Gõ tiếng Việt bằng Unikey và bộ gõ macOS hoạt động đúng trong CodeMirror 6.
6. Trạng thái game của 1 hồ sơ dưới 1 MB.
7. 20 đến 30 phút học/ngày cho khoảng 40 đến 60 xu.
8. Từ điển khoảng 20 mục xử lý được phần lớn lỗi của học sinh lớp 6.
9. Số lượng bài, câu hỏi và khái niệm ở mục 12.1 là ước tính; khối lượng thực tế được chốt trong kế hoạch của M5.
