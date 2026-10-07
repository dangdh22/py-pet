# M5b – Nội dung giai đoạn 2 "Dữ liệu": Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giai đoạn 2 "Dữ liệu" có đủ 5 chủ đề của spec 12.1 (khoảng 25 bài học): biến; phép tính `// % **`; `input()`; ép kiểu; định dạng đầu ra (f-string, `round`); phần AI "Dữ liệu là gì". Ngân hàng câu hỏi đủ cho đề tiến hóa (ít nhất 30 câu, ít nhất 3 câu AI, ít nhất 3 bài code dùng trong đề); mọi khái niệm có thẻ hiểu lầm, gợi ý cho phụ huynh và bài luyện đủ mức. `npm run content:build` không có dòng "Cảnh báo:" nào.

**Architecture:** Chỉ có nội dung trong `content/stage-2/` (định dạng như giai đoạn 1) và, khi cần, mục mới trong `content/errors/errors.yaml` (kèm số mục trong `src/content/parity.pyodide.test.ts`). Không đổi code của app. Nội dung được soạn theo yêu cầu trong kế hoạch; mỗi task tự kiểm bằng `npm run content:validate`, Vitest (gồm test parity chạy từng mục nội dung trong Pyodide) và review sư phạm.

**Tech Stack:** Như M5a. Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md` (chính: mục 3, 4.3, 7, 12.1)

## Global Constraints

- Phạm vi M5b: nội dung giai đoạn 2. Ngoài phạm vi (đừng làm): giai đoạn 3–4 (M5c–M5d), sửa nội dung giai đoạn 1 (trừ khi 1 test hoặc validator bắt buộc), biến luật 8 và 9 thành lỗi (cuối M5d), sửa code của app.
- ID đã phát hành không được đổi (spec 3.8). Không đổi `GAME_STATE_VERSION`, `SCHEMA_VERSION`, file mẫu `.pypet`.
- App chạy Python 3.14 trong Pyodide; `python3` của máy và validator là CPython 3.13. Đầu ra của `print` giống nhau, nhưng **thông báo lỗi có thể khác**: mọi thông báo lỗi mà bài học nói tới phải được kiểm trong Pyodide (cách làm: `.superpowers/sdd/2026-10-06-m5a-noi-dung-giai-doan-1/task-4-report.md` của M5a, hoặc test `src/content/parity.pyodide.test.ts`).
- Sau mỗi task: `npm run content:validate` qua; `npx vitest run` và `npm run typecheck` qua. Số test Vitest tăng theo số mục nội dung (test parity), nên báo số thật.
- Không gọi mạng. Không dùng Gemini.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy.
- Mốc xanh trước khi bắt đầu: `npm run check` sau M5a (Vitest 753, pytest 21, e2e 14, 0 cảnh báo). Trong phiên cloud, đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` trước khi chạy e2e.

## Quy tắc soạn nội dung (mọi task)

Giữ nguyên 11 quy tắc của M5a (`docs/superpowers/plans/2026-10-06-m5a-noi-dung-giai-doan-1.md`, mục "Quy tắc soạn nội dung") với các thay đổi sau cho giai đoạn 2:

1. **Kiến thức được dùng (thay quy tắc 2):** toàn bộ giai đoạn 1 cộng với kiến thức của chủ đề giai đoạn 2 đã học trước. Giai đoạn 2 vẫn chưa có `if`, vòng lặp, list, hàm tự viết. Chủ đề sau được dùng kiến thức chủ đề trước, không ngược lại (ví dụ chủ đề "Biến" chưa có `input()`, chủ đề "Phép tính" chưa có `int()`).
2. **`input()` luôn để trống** (không có chữ trong ngoặc): khi chấm bài, chữ trong `input("...")` bị tính vào đầu ra (mục từ điển `input-prompt`). Bài học giải thích điều này 1 lần ở chủ đề `input()`.
3. **Test có dữ liệu nhập:** từ chủ đề `input()` trở đi, bài `code` đọc dữ liệu có ít nhất 2 test, trong đó ít nhất 1 test ẩn (`hidden: true`) với dữ liệu khác ví dụ, để con không in cứng đáp án. Bài có số thực dùng `compare: float` và `tolerance` khi đầu ra có thể lệch ở chữ số cuối (spec 3.7); nếu đề yêu cầu `round` hay `:.2f` thì so khớp chính xác.
4. **Tên biến:** trong bài học, tên biến tiếng Việt không dấu, dễ hiểu (`tuoi`, `ten`, `so_keo`); trong câu `predict`/`mcq`, tên trung tính (`a`, `n`, `total`, `name`) và không in chuỗi tiếng Việt (quy tắc 5 cũ).
5. **Tên khái niệm** duy nhất trong toàn bộ nội dung; ID khái niệm cố định theo bảng của từng task.
6. **Bài AI:** mỗi giai đoạn có 1 bài AI (2 thẻ, 2 câu `mcq`, không có bài code) và khái niệm AI chỉ cần bài luyện mức 1 (quyết định M5a). Giai đoạn 2 có ít nhất 5 câu AI.

## Review Focus

1. Nội dung đúng về Python (CPython 3.13 và 3.14), đặc biệt: `/` luôn ra số thực; `//` và `%` với số âm (chỉ dạy số dương, nhưng lời văn không được sai); `round(2.5)` ra `2` (làm tròn về số chẵn); `int("5.6")` báo lỗi; `0.1 + 0.2`.
2. Phù hợp học sinh lớp 6: chỉ dùng kiến thức đã học; ví dụ đời thường (kẹo, tiền tiêu vặt, giờ phút); lời văn ngắn, rõ.
3. Bài nhập dữ liệu có test ẩn và không chấp nhận đáp án in cứng.
4. `npm run content:build` không có "Cảnh báo:" sau Task 6.

## Quyết định thiết kế

Chưa được người bảo trì duyệt; ghi trong `docs/superpowers/DECISIONS.md` mục M5b.

1. **Dàn ý giai đoạn 2** (5 chủ đề, 25 bài): xem Task 1–5. Thứ tự chủ đề theo spec 12.1.
2. **Bài AI "Dữ liệu là gì?"** là bài cuối của chủ đề "Biến" (biến là nơi cất dữ liệu), như bài AI của giai đoạn 1 nằm cuối chủ đề 1.
3. **`round` làm tròn về số chẵn** (`round(2.5)` ra `2`, `round(3.5)` ra `4`) được dạy như 1 hiểu lầm hay gặp, không né tránh.
4. **Phép chia số âm** (`-7 // 2`) không dạy ở giai đoạn 2; bài và câu hỏi chỉ dùng số không âm.

---

## File Structure

```
content/stage-2/
  stage.yaml                (mới, Task 1) id s2, 5 chủ đề, đề tiến hóa mặc định
  01-bien/                  (mới, Task 1) Biến, 5 bài (bài 5 là AI)
  02-phep-tinh/             (mới, Task 2) Phép tính // % **, 5 bài
  03-input/                 (mới, Task 3) Nhập dữ liệu với input(), 5 bài
  04-ep-kieu/               (mới, Task 4) Ép kiểu, 5 bài
  05-dinh-dang/             (mới, Task 5) Định dạng đầu ra, 5 bài
content/errors/errors.yaml  (có thể sửa) chỉ khi cần mục mới; cập nhật số mục trong src/content/parity.pyodide.test.ts
docs/superpowers/content-stage-2.md  (mới, Task 6) bảng tổng hợp để phụ huynh duyệt
```

Mỗi thư mục chủ đề có `topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml` và các file bài học. Mẫu định dạng: `content/stage-1/`.

---

### Task 1: Giai đoạn 2 và chủ đề "Biến"

**Files:**
- Create: `content/stage-2/stage.yaml`, `content/stage-2/01-bien/` (`topic.yaml`, `concepts.yaml`, `questions.yaml`, `practice.yaml`, 5 file bài học)
- Modify: `content/errors/errors.yaml` (chỉ khi cần), `src/content/parity.pyodide.test.ts` (chỉ khi thêm mục từ điển)

**Interfaces:**
- Produces:
  - `stage.yaml`: `id: s2`, `title: { vi: "Giai đoạn 2: Dữ liệu", en: "Stage 2: Data" }`, `topics: [01-bien]` (các task sau thêm chủ đề), không ghi `evolution` (mặc định 15 câu, 3 câu AI, 3 bài code).
  - Chủ đề `s2.bien`, `title: { vi: "Biến", en: "Variables" }`:

    | File | ID | Tên (vi / en) | Mục tiêu |
    |---|---|---|---|
    | `01-bien-la-gi.md` | `s2.bien.l1` | Biến là gì? / What is a variable? | **Biến** là chiếc hộp có tên để cất dữ liệu; `ten = "Robo"`; `print(ten)` in giá trị, không in chữ "ten"; dấu `=` là **gán** (cất vào hộp), không phải "bằng". |
    | `02-dat-ten-bien.md` | `s2.bien.l2` | Đặt tên biến / Naming variables | Tên gồm chữ, số, `_`; không bắt đầu bằng số; không có dấu cách; phân biệt hoa thường; tên nên có nghĩa; không dùng từ khóa như `print`. |
    | `03-gan-lai.md` | `s2.bien.l3` | Thay giá trị của biến / Changing a variable | Gán lại thì giá trị cũ mất; `diem = diem + 1`; lệnh chạy từ trên xuống nên thứ tự gán quan trọng; dùng biến trước khi gán thì báo `NameError`. |
    | `04-chu-va-so.md` | `s2.bien.l4` | Biến chứa chữ, biến chứa số / Text and number variables | Biến chứa chuỗi hoặc số nguyên; `+` của 2 chuỗi là nối, của 2 số là cộng; `print("Tuổi:", tuoi)`; `type()` cho biết loại dữ liệu (`str`, `int`). |
    | `05-du-lieu-la-gi.md` | `s2.bien.l5` | Dữ liệu là gì? / What is data? | Bài AI (2 thẻ, 2 câu `mcq`, không có bài code): **dữ liệu** là những gì máy tính ghi lại (chữ, số, ảnh, âm thanh); AI học từ rất nhiều dữ liệu có nhãn; dữ liệu sai hoặc thiếu làm AI sai. |

  - Khái niệm (6): `var-assign` (dấu = là gán, không phải so sánh), `var-name-rules` (quy tắc đặt tên), `var-reassign` (biến giữ giá trị gán sau cùng), `var-before-use` (phải gán trước khi dùng), `str-vs-int` (chuỗi "5" khác số 5), `ai-data` (AI cần dữ liệu tốt; `ai: true`).
  - Trạm ôn: `s2.bien.r1` sau `s2.bien.l2`, `s2.bien.r2` sau `s2.bien.l4`.
  - Ít nhất 5 câu AI cho khái niệm `ai-data` (2 trong bài 5, ít nhất 3 trong ngân hàng, `lessons: [s2.bien.l5]`).

- [ ] **Step 1: Soạn nội dung** theo bảng trên và quy tắc soạn nội dung.
- [ ] **Step 2: Kiểm tra:** `npm run content:validate && npm run content:build 2>&1 | grep "Cảnh báo"; npx vitest run && npm run typecheck`. Expected: validate qua; cảnh báo chỉ còn về cỡ ngân hàng của `s2` (hết ở Task 5); không có cảnh báo về khái niệm hay chủ đề `s2.bien`.
- [ ] **Step 3: Commit:** `git add content/stage-2 content/errors/errors.yaml src/content/parity.pyodide.test.ts` rồi `git commit -m "content(s2): stage 2 and the topic variables"` (kèm trailer).

---

### Task 2: Chủ đề "Phép tính // % **"

**Files:** Create `content/stage-2/02-phep-tinh/`; Modify `content/stage-2/stage.yaml` (thêm `02-phep-tinh`), từ điển lỗi khi cần.

**Interfaces:**
- Chủ đề `s2.phep-tinh`, `title: { vi: "Phép tính // % **", en: "Operators // % **" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-cong-tru-nhan-chia.md` | `s2.phep-tinh.l1` | Cộng, trừ, nhân, chia / Add, subtract, multiply, divide | `+ - * /` với biến; `/` luôn cho **số thực** (`6 / 2` ra `3.0`); dấu `*` cho phép nhân (không viết `2x`). |
  | `02-chia-lay-nguyen.md` | `s2.phep-tinh.l2` | Chia lấy phần nguyên // / Floor division // | `//` cho phần nguyên của phép chia (`7 // 2` ra `3`); ví dụ chia kẹo đều cho bạn. |
  | `03-chia-lay-du.md` | `s2.phep-tinh.l3` | Chia lấy dư % / Remainder % | `%` cho số dư (`7 % 2` ra `1`); `n % 2` cho biết chẵn (0) hay lẻ (1); `n % 10` lấy chữ số hàng đơn vị, `n // 10` bỏ chữ số đó. |
  | `04-luy-thua.md` | `s2.phep-tinh.l4` | Lũy thừa ** và thứ tự phép tính / Powers ** and order | `2 ** 3` ra `8` (không phải `6`); thứ tự: `**` trước, rồi `* / // %`, rồi `+ -`; ngoặc tròn đổi thứ tự. |
  | `05-bai-toan.md` | `s2.phep-tinh.l5` | Giải bài toán bằng phép tính / Solving problems | Đổi phút ra giờ và phút (`//`, `%`), chia kẹo còn dư, tính diện tích; bài tổng hợp. |

- Khái niệm (5): `div-float` (`/` luôn ra số thực), `floor-div` (`//` lấy phần nguyên), `modulo` (`%` lấy số dư), `power-op` (`**` là lũy thừa, `^` không phải), `precedence` (thứ tự phép tính).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`.
- Quy tắc riêng: chưa có `input()`; số liệu gán sẵn trong biến (bài code "đổi giá trị trong biến rồi in kết quả" vẫn chấm theo đầu ra cố định). Chỉ dùng số không âm.
- Commit: `content(s2): the topic operators`.

---

### Task 3: Chủ đề "Nhập dữ liệu với input()"

**Files:** Create `content/stage-2/03-input/`; Modify `stage.yaml`, từ điển lỗi khi cần.

**Interfaces:**
- Chủ đề `s2.input`, `title: { vi: "Nhập dữ liệu với input()", en: "Reading input with input()" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-input-la-gi.md` | `s2.input.l1` | input() là gì? / What is input()? | `input()` dừng chương trình, chờ người dùng gõ 1 dòng rồi trả về dòng đó; cất vào biến `ten = input()`; trong Py-Pet, ô "Dữ liệu nhập" là chỗ gõ trước khi Chạy thử. |
  | `02-de-trong-ngoac.md` | `s2.input.l2` | Để trống ngoặc của input() / Keep input() empty | Chữ trong `input("...")` được in ra và bị tính vào đầu ra khi chấm; trong Py-Pet luôn viết `input()` (giải thích 1 lần, có ví dụ). |
  | `03-input-la-chuoi.md` | `s2.input.l3` | input() luôn trả về chuỗi / input() always gives text | Gõ `5` thì được chuỗi `"5"`; `a + b` của 2 lần nhập là nối chuỗi (`"5" + "3"` ra `53`); bài học dừng ở chỗ nêu vấn đề, cách đổi sang số học ở chủ đề sau (có thể giới thiệu trước `int(input())` như 1 công thức, giải thích kỹ ở chủ đề "Ép kiểu"). |
  | `04-nhieu-dong.md` | `s2.input.l4` | Đọc nhiều dòng / Reading several lines | Mỗi lần gọi `input()` đọc đúng 1 dòng, theo thứ tự; thiếu dòng thì báo `EOFError` (mục từ điển `eof`). |
  | `05-chuong-trinh-tro-chuyen.md` | `s2.input.l5` | Chương trình biết trò chuyện / A program that talks | Bài tổng hợp: đọc tên, món ăn yêu thích, in lời chào bằng dấu phẩy và nối chuỗi. |

- Khái niệm (4): `input-str` (input trả về chuỗi; ID có trong ví dụ của spec 3.3), `input-empty-prompt` (để trống ngoặc khi chấm bài), `input-one-line` (mỗi lần input đọc 1 dòng), `input-order` (dữ liệu được đọc theo thứ tự gõ).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`.
- Quy tắc riêng: từ chủ đề này, quy tắc soạn nội dung 3 (test ẩn) bắt buộc.
- Commit: `content(s2): the topic input`.

---

### Task 4: Chủ đề "Ép kiểu"

**Files:** Create `content/stage-2/04-ep-kieu/`; Modify `stage.yaml`, từ điển lỗi khi cần.

**Interfaces:**
- Chủ đề `s2.ep-kieu`, `title: { vi: "Ép kiểu", en: "Type conversion" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-int.md` | `s2.ep-kieu.l1` | Đổi chuỗi thành số nguyên với int() / Text to whole number with int() | `int("5")` ra `5`; `tuoi = int(input())`; cộng đúng 2 số nhập vào. |
  | `02-float.md` | `s2.ep-kieu.l2` | Số thực và float() / Decimal numbers and float() | **Số thực** có dấu chấm (`3.5`, không dùng dấu phẩy); `float(input())`; phép tính với số thực. |
  | `03-str.md` | `s2.ep-kieu.l3` | Đổi số thành chuỗi với str() / Number to text with str() | `"Tuổi: " + str(tuoi)`; so sánh với cách dùng dấu phẩy trong `print`. |
  | `04-int-cat-bo.md` | `s2.ep-kieu.l4` | int() cắt bỏ phần thập phân / int() drops the decimals | `int(5.67)` ra `5` (không làm tròn); `int("5.67")` báo lỗi `ValueError` — đổi qua `float` trước; `int("năm")` báo lỗi. |
  | `05-bai-toan.md` | `s2.ep-kieu.l5` | Máy tính bỏ túi của Robo / Robo's calculator | Bài tổng hợp: đọc 2 số, in tổng, hiệu, tích, thương. |

- Khái niệm (5): `int-convert` (int() đổi chuỗi số nguyên thành số), `float-convert` (số thực dùng dấu chấm, float()), `str-convert` (str() để nối số vào chuỗi), `int-truncate` (int() cắt bỏ phần thập phân; ID có trong ví dụ của spec 3.6), `int-invalid` (int() không đổi được chuỗi có dấu chấm hay chữ).
- Kiểm tra trước khi đặt ID khái niệm `int-invalid`: từ điển lỗi đã có mục `int-invalid`; ID khái niệm và ID mục từ điển là 2 không gian khác nhau, nhưng nếu validator báo trùng thì đổi ID khái niệm thành `int-bad-text` và ghi trong báo cáo.
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`.
- Commit: `content(s2): the topic type conversion`.

---

### Task 5: Chủ đề "Định dạng đầu ra"

**Files:** Create `content/stage-2/05-dinh-dang/`; Modify `stage.yaml` (`topics: [01-bien, 02-phep-tinh, 03-input, 04-ep-kieu, 05-dinh-dang]`), từ điển lỗi khi cần.

**Interfaces:**
- Chủ đề `s2.dinh-dang`, `title: { vi: "Định dạng đầu ra", en: "Formatting output" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-f-string.md` | `s2.dinh-dang.l1` | Chuỗi f / f-strings | `f"Xin chào {ten}!"`; quên chữ `f` thì in nguyên `{ten}`; ngoặc nhọn `{}`. |
  | `02-tinh-trong-f-string.md` | `s2.dinh-dang.l2` | Tính toán trong chuỗi f / Maths inside f-strings | `f"{a} + {b} = {a + b}"`; biểu thức trong `{}`. |
  | `03-round.md` | `s2.dinh-dang.l3` | Làm tròn với round() / Rounding with round() | `round(3.14159, 2)` ra `3.14`; `round(x)` ra số nguyên; `round(2.5)` ra `2`, `round(3.5)` ra `4` (làm tròn về số chẵn khi đúng ở giữa). |
  | `04-hai-chu-so.md` | `s2.dinh-dang.l4` | In đúng 2 chữ số thập phân / Exactly 2 decimal places | `f"{x:.2f}"` luôn có 2 chữ số sau dấu chấm (`5` thành `5.00`); khác `round` (`round(5.0, 2)` vẫn in `5.0`); `0.1 + 0.2` in ra `0.30000000000000004`, dùng `:.2f` để in gọn. |
  | `05-hoa-don.md` | `s2.dinh-dang.l5` | In hóa đơn mua hàng / Printing a receipt | Bài tổng hợp: đọc số lượng và giá, in hóa đơn có căn chỉnh đơn giản bằng f-string. |

- Khái niệm (5): `fstring-prefix` (cần chữ f trước dấu nháy), `fstring-expression` (biểu thức trong ngoặc nhọn được tính), `round-digits` (round(x, n)), `round-half-even` (round(2.5) ra 2), `format-two-decimals` (`:.2f` luôn in đủ 2 chữ số).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`.
- Expected sau task: `npm run content:build` không còn dòng "Cảnh báo:" nào.
- Commit: `content(s2): the topic formatting output`.

---

### Task 6: Rà soát giai đoạn 2 và bảng tổng hợp cho phụ huynh

Như Task 6 của M5a, cho giai đoạn 2:

- Rà soát chéo cả giai đoạn (kiến thức chưa học, thuật ngữ thống nhất, câu hỏi gần trùng, mỗi khái niệm dạy ở đúng 1 chủ đề, test ẩn của bài nhập dữ liệu, vị trí đáp án đúng phân bố đều).
- Viết `docs/superpowers/content-stage-2.md` theo mẫu `docs/superpowers/content-stage-1.md` (đếm bằng script đọc `src/generated/content.json`).
- Chạy `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium; npm run check` và đếm "Cảnh báo" (phải là 0).
- Commit nội dung sửa trước (`content(s2): stage 2 review across the 5 topics`), rồi bảng tổng hợp (`docs: stage 2 content summary for the parents' review`).
