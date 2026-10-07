# M5c – Nội dung giai đoạn 3 "Rẽ nhánh": Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giai đoạn 3 "Rẽ nhánh" có đủ 5 chủ đề của spec 12.1 (khoảng 22 bài học): so sánh và `bool`; `if`/`else`; `elif`; `and`/`or`/`not`; bài toán điều kiện (chẵn lẻ, năm nhuận, số lớn nhất); phần AI "Quy tắc cố định và học từ dữ liệu". Ngân hàng câu hỏi đủ cho đề tiến hóa (ít nhất 30 câu, ít nhất 3 câu AI, ít nhất 3 bài code dùng trong đề); mọi khái niệm có thẻ hiểu lầm, gợi ý cho phụ huynh và bài luyện đủ mức. `npm run content:build` không có dòng "Cảnh báo:" nào.

**Architecture:** Chỉ có nội dung trong `content/stage-3/` và, khi cần, mục mới trong `content/errors/errors.yaml` (kèm số mục trong `src/content/parity.pyodide.test.ts`). Không đổi code của app. Mỗi task tự kiểm bằng `npm run content:validate`, Vitest (gồm test parity trong Pyodide) và review sư phạm.

**Tech Stack:** Như M5b. Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md` (chính: mục 3, 4.3, 7, 12.1)

## Global Constraints

- Phạm vi M5c: nội dung giai đoạn 3. Ngoài phạm vi (đừng làm): giai đoạn 4 (M5d), sửa nội dung giai đoạn 1–2 (trừ khi 1 test hoặc validator bắt buộc, hoặc 1 mục từ điển lỗi dùng chung cần sửa), biến luật 8 và 9 thành lỗi (cuối M5d), sửa code của app.
- ID đã phát hành không được đổi (spec 3.8). Không đổi `GAME_STATE_VERSION`, `SCHEMA_VERSION`, file mẫu `.pypet`.
- App chạy Python 3.14 trong Pyodide; `python3` và validator là CPython 3.13. Mọi thông báo lỗi mà bài học nói tới phải được kiểm trong Pyodide.
- Sau mỗi task: `npm run content:validate` qua; `npx vitest run` và `npm run typecheck` qua. Báo số test Vitest thật.
- Không gọi mạng. Không dùng Gemini.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy.
- Mốc xanh trước khi bắt đầu: `npm run check` sau M5b (Vitest 932, pytest 21, e2e 14, 0 cảnh báo). Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e.

## Quy tắc soạn nội dung (mọi task)

Giữ nguyên 11 quy tắc của M5a và 6 thay đổi của M5b (`docs/superpowers/plans/2026-10-07-m5b-noi-dung-giai-doan-2.md`, mục "Quy tắc soạn nội dung"), với các thay đổi sau cho giai đoạn 3:

1. **Kiến thức được dùng:** giai đoạn 1–2 cộng với các chủ đề giai đoạn 3 đã học trước. Giai đoạn 3 vẫn chưa có vòng lặp, list, hàm tự viết, `max()`/`min()`. Không nhắc tới `for`, `while`, list, "hàm" dù chỉ lướt qua.
2. **Thụt lề:** luôn 4 dấu cách. Code trong YAML phải giữ đúng thụt lề (dùng `|` block). Bài `parsons` có thụt lề: mỗi dòng giữ thụt lề của nó (xem cách validator xử lý trong `tools/content/schema.ts` và `src/content/exercise.ts`).
3. **Test của bài rẽ nhánh:** mỗi nhánh của chương trình được ít nhất 1 test đi qua (ví dụ `if`/`else` cần ít nhất 2 test, 1 test cho mỗi nhánh; `elif` 3 nhánh cần 3 test), trong đó ít nhất 1 test ẩn. Có test ở đúng ranh giới (ví dụ điểm 5 khi điều kiện là `>= 5`).
4. **Bài học từ các review trước** (bắt buộc trước khi commit): đáp án đúng phân bố đều 4 vị trí; không có lựa chọn đùa hay lấp chỗ; thẻ hiểu lầm 2–4 câu, gợi ý cho phụ huynh 1–2 câu; không có câu gần trùng giữa bài học và ngân hàng; lời giải thích không gọi lựa chọn theo vị trí (giao diện xáo thứ tự); `lessons` trỏ tới bài thật sự dạy cú pháp cần dùng.
5. **Bài AI:** 1 bài AI (2 thẻ, 2 câu `mcq`, không có bài code); khái niệm AI chỉ cần bài luyện mức 1; giai đoạn có ít nhất 5 câu AI.

## Review Focus

1. Nội dung đúng về Python (3.13 và 3.14): `=` và `==`; so sánh chuỗi theo thứ tự ký tự (`"10" < "9"` là `True`, chữ hoa đứng trước chữ thường); `x == 1 or 2` luôn đúng; so sánh nối `1 < x < 5`; thụt lề và dấu hai chấm; nhánh `elif` dừng ở điều kiện đúng đầu tiên.
2. Mỗi bài rẽ nhánh có test cho mọi nhánh và ranh giới.
3. Phù hợp học sinh lớp 6: ví dụ đời thường (điểm kiểm tra, giá vé, thời tiết, tuổi); lời văn ngắn, rõ.
4. `npm run content:build` không có "Cảnh báo:" sau Task 6.

## Quyết định thiết kế

Chưa được người bảo trì duyệt; ghi trong `docs/superpowers/DECISIONS.md` mục M5c.

1. **Dàn ý giai đoạn 3** (5 chủ đề, 22 bài): xem Task 1–5.
2. **Bài AI "Quy tắc cố định và học từ dữ liệu"** là bài cuối của chủ đề "So sánh và bool": `if` là 1 quy tắc cố định do người viết; AI tự rút ra quy tắc từ dữ liệu.
3. **Chưa dạy `max()`/`min()`**: bài "số lớn nhất" dùng `if`.
4. **So sánh nối (`1 < x < 5`)** được dạy ở chủ đề `and`/`or`/`not`, cạnh cách viết bằng `and`.

---

## File Structure

```
content/stage-3/
  stage.yaml                (mới, Task 1) id s3, 5 chủ đề, đề tiến hóa mặc định
  01-so-sanh/               (mới, Task 1) So sánh và bool, 5 bài (bài 5 là AI)
  02-if-else/               (mới, Task 2) if và else, 5 bài
  03-elif/                  (mới, Task 3) elif, 4 bài
  04-and-or-not/            (mới, Task 4) and, or, not, 4 bài
  05-bai-toan/              (mới, Task 5) Bài toán điều kiện, 4 bài
content/errors/errors.yaml  (có thể sửa) chỉ khi cần; cập nhật số mục trong src/content/parity.pyodide.test.ts
docs/superpowers/content-stage-3.md  (mới, Task 6) bảng tổng hợp để phụ huynh duyệt
```

---

### Task 1: Giai đoạn 3 và chủ đề "So sánh và bool"

**Files:** Create `content/stage-3/stage.yaml`, `content/stage-3/01-so-sanh/`; từ điển lỗi khi cần.

**Interfaces:**
- `stage.yaml`: `id: s3`, `title: { vi: "Giai đoạn 3: Rẽ nhánh", en: "Stage 3: Making decisions" }`, `topics: [01-so-sanh]`, không ghi `evolution`.
- Chủ đề `s3.so-sanh`, `title: { vi: "So sánh và bool", en: "Comparisons and bool" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-phep-so-sanh.md` | `s3.so-sanh.l1` | Phép so sánh / Comparison operators | `> < >= <=` cho kết quả `True` hoặc `False`; in kết quả so sánh; so sánh số với biến. |
  | `02-bang-va-khac.md` | `s3.so-sanh.l2` | Bằng == và khác != / Equal == and not equal != | `==` là hỏi "có bằng không", `=` là gán; `!=`; viết `=` trong chỗ cần `==` thì báo lỗi hoặc làm sai. |
  | `03-so-sanh-chuoi.md` | `s3.so-sanh.l3` | So sánh chuỗi / Comparing strings | `==` với chuỗi phân biệt hoa thường và dấu cách; `"10" == 10` là `False`; so sánh chuỗi số theo từng ký tự (`"10" < "9"` là `True`), nên đổi sang `int` trước khi so sánh số nhập vào. |
  | `04-kieu-bool.md` | `s3.so-sanh.l4` | Kiểu bool / The bool type | **bool** chỉ có `True` và `False` (chữ hoa đầu); cất kết quả so sánh vào biến; `type(True)`. |
  | `05-quy-tac-va-du-lieu.md` | `s3.so-sanh.l5` | Quy tắc cố định và học từ dữ liệu / Fixed rules and learning from data | Bài AI: chương trình dùng quy tắc do người viết ("nếu nhiệt độ trên 30 thì nóng"); AI tự tìm quy tắc từ rất nhiều ví dụ có nhãn; khi nào quy tắc cố định là đủ, khi nào cần học từ dữ liệu (ví dụ nhận ra ảnh mèo). |

- Khái niệm (6): `compare-ops` (so sánh cho True/False), `eq-vs-assign` (== và =), `compare-str-num` (chuỗi số so sánh theo ký tự), `str-equality` (so sánh chuỗi phân biệt hoa thường, dấu cách), `bool-value` (True/False viết hoa chữ đầu, là 1 kiểu dữ liệu), `ai-rules-vs-data` (`ai: true`).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l4`. Ít nhất 5 câu AI (`lessons: [s3.so-sanh.l5]`).
- Commit: `content(s3): stage 3 and the topic comparisons`.

### Task 2: Chủ đề "if và else"

**Files:** Create `content/stage-3/02-if-else/`; Modify `stage.yaml`; từ điển lỗi khi cần.

- Chủ đề `s3.if-else`, `title: { vi: "if và else", en: "if and else" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-lenh-if.md` | `s3.if-else.l1` | Lệnh if / The if statement | `if dieu_kien:` rồi khối lệnh thụt lề 4 dấu cách; khối chỉ chạy khi điều kiện là `True`; quên dấu `:` báo lỗi. |
  | `02-khoi-lenh.md` | `s3.if-else.l2` | Khối lệnh và thụt lề / Blocks and indentation | Mọi dòng thụt lề cùng mức thuộc khối; dòng không thụt lề sau khối luôn chạy; lỗi thụt lề hay gặp (thiếu, thừa, lệch). |
  | `03-else.md` | `s3.if-else.l3` | Nhánh else / The else branch | `else:` chạy khi điều kiện sai; `else` không có điều kiện; đúng 1 trong 2 nhánh chạy. |
  | `04-dieu-kien-tu-input.md` | `s3.if-else.l4` | Điều kiện từ dữ liệu nhập / Conditions on input | Đổi `int(input())` trước khi so sánh; so sánh chuỗi nhập (mật khẩu, câu trả lời). |
  | `05-bai-toan.md` | `s3.if-else.l5` | Robo quyết định / Robo decides | Bài tổng hợp: đủ tiền mua không, đạt hay chưa đạt, mở cửa hay không. |

- Khái niệm (5): `if-colon` (dấu hai chấm sau điều kiện), `indent-block` (khối lệnh thụt lề 4 dấu cách), `after-block` (dòng sau khối luôn chạy), `else-branch` (else không có điều kiện, chạy khi điều kiện sai), `convert-before-compare` (đổi kiểu trước khi so sánh số nhập).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`. Commit: `content(s3): the topic if and else`.

### Task 3: Chủ đề "elif"

**Files:** Create `content/stage-3/03-elif/`; Modify `stage.yaml`; từ điển lỗi khi cần.

- Chủ đề `s3.elif`, `title: { vi: "Nhiều nhánh với elif", en: "Many branches with elif" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-elif.md` | `s3.elif.l1` | Lệnh elif / The elif statement | `if` … `elif` … `else`; mỗi `elif` có điều kiện riêng; chỉ 1 nhánh chạy. |
  | `02-thu-tu-dieu-kien.md` | `s3.elif.l2` | Thứ tự điều kiện / The order of conditions | Python thử từ trên xuống và dừng ở điều kiện đúng đầu tiên; đặt sai thứ tự (`>= 5` trước `>= 8`) làm sai kết quả. |
  | `03-xep-loai.md` | `s3.elif.l3` | Xếp loại điểm / Grading scores | Bài thực hành: điểm ra Giỏi/Khá/Trung bình/Cần cố gắng; test ở mọi ranh giới. |
  | `04-elif-hay-if.md` | `s3.elif.l4` | elif hay nhiều if? / elif or many ifs? | Nhiều `if` riêng có thể cùng chạy; `elif` chỉ chạy 1; chọn đúng cách theo bài toán. |

- Khái niệm (4): `elif-chain` (chỉ 1 nhánh của chuỗi if/elif/else chạy), `condition-order` (điều kiện đúng đầu tiên thắng), `boundary-check` (ranh giới >= và >), `elif-vs-if` (nhiều if độc lập có thể cùng chạy).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l4`. Commit: `content(s3): the topic elif`.

### Task 4: Chủ đề "and, or, not"

**Files:** Create `content/stage-3/04-and-or-not/`; Modify `stage.yaml`; từ điển lỗi khi cần.

- Chủ đề `s3.logic`, `title: { vi: "and, or, not", en: "and, or, not" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-and.md` | `s3.logic.l1` | Cả hai đều đúng: and / Both true: and | `and` đúng khi cả 2 điều kiện đúng; ví dụ tuổi và chiều cao để chơi trò chơi. |
  | `02-or.md` | `s3.logic.l2` | Một trong hai đúng: or / At least one: or | `or` đúng khi ít nhất 1 điều kiện đúng; `x == 1 or x == 2` (không viết `x == 1 or 2`, cách viết này luôn đúng). |
  | `03-not.md` | `s3.logic.l3` | Đảo ngược: not / Flipping: not | `not` đổi True thành False và ngược lại; `not` với `==` và `!=`. |
  | `04-ket-hop.md` | `s3.logic.l4` | Kết hợp điều kiện / Combining conditions | Dùng ngoặc cho rõ; `1 <= x <= 10` giống `1 <= x and x <= 10`; khoảng giá trị. |

- Khái niệm (5): `and-both`, `or-either`, `or-misuse` (`x == 1 or 2` luôn đúng), `not-flip`, `chained-compare` (`a < x < b`).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l4`. Commit: `content(s3): the topic and or not`.

### Task 5: Chủ đề "Bài toán điều kiện"

**Files:** Create `content/stage-3/05-bai-toan/`; Modify `stage.yaml` (`topics: [01-so-sanh, 02-if-else, 03-elif, 04-and-or-not, 05-bai-toan]`); từ điển lỗi khi cần.

- Chủ đề `s3.bai-toan`, `title: { vi: "Bài toán điều kiện", en: "Problems with conditions" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-chan-le.md` | `s3.bai-toan.l1` | Chẵn hay lẻ? / Even or odd? | `n % 2 == 0`; chia hết cho 3, cho 5; so sánh `%` với 0. |
  | `02-so-lon-nhat.md` | `s3.bai-toan.l2` | Số lớn nhất / The largest number | Lớn nhất của 2 số, rồi của 3 số bằng `if`/`elif` hoặc biến `lon_nhat` cập nhật dần; trường hợp các số bằng nhau. |
  | `03-nam-nhuan.md` | `s3.bai-toan.l3` | Năm nhuận / Leap years | Quy tắc: chia hết cho 4 nhưng không chia hết cho 100, hoặc chia hết cho 400; test 2024, 1900, 2000, 2023. |
  | `04-if-long-nhau.md` | `s3.bai-toan.l4` | if lồng nhau / Nested if | `if` bên trong `if` (thụt lề 8 dấu cách); khi nào dùng lồng nhau, khi nào dùng `and`. |

- Khái niệm (4): `divisible-check` (`n % k == 0`), `max-by-compare` (tìm số lớn nhất bằng so sánh), `leap-year-rule`, `nested-if`.
- Trạm ôn: `r1` sau `l2`, `r2` sau `l4`.
- Expected sau task: `npm run content:build` không còn dòng "Cảnh báo:" nào.
- Commit: `content(s3): the topic problems with conditions`.

### Task 6: Rà soát giai đoạn 3 và bảng tổng hợp cho phụ huynh

Như Task 6 của M5b, cho giai đoạn 3: rà soát chéo cả giai đoạn (kiến thức chưa học, thuật ngữ thống nhất — "điều kiện", "khối lệnh", "thụt lề", "nhánh"; câu gần trùng; mỗi khái niệm dạy ở đúng 1 chủ đề; test cho mọi nhánh và ranh giới; vị trí đáp án; lời giải thích không gọi vị trí lựa chọn); áp dụng danh sách sửa nhỏ từ các review; viết `docs/superpowers/content-stage-3.md` theo mẫu `docs/superpowers/content-stage-2.md`; chạy `npm run check` và đếm "Cảnh báo" (phải là 0). Commit nội dung sửa trước (`content(s3): stage 3 review across the 5 topics`), rồi bảng tổng hợp (`docs: stage 3 content summary for the parents' review`).
