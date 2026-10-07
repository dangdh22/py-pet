# M5d – Nội dung giai đoạn 4 "Vòng lặp": Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giai đoạn 4 "Vòng lặp" có đủ 5 chủ đề của spec 12.1 (khoảng 28 bài học): `for` và `range`; `while`; tổng, đếm, lớn nhất; vòng lặp lồng và vẽ hình `*`; bài toán chữ số và ước số (`break`, `continue`); phần AI "Học có giám sát và không giám sát". Ngân hàng câu hỏi đủ cho đề tiến hóa; mọi khái niệm đủ thẻ, gợi ý và bài luyện 3 mức. Khi giai đoạn 1–4 đã đủ nội dung, luật 8 và 9 của spec 3.9 trở thành lỗi của `content:validate` (không còn chỉ là cảnh báo).

**Architecture:** Nội dung trong `content/stage-4/` và, khi cần, mục mới trong `content/errors/errors.yaml`. Task 7 là thay đổi code nhỏ trong `tools/content/` (luật 8 và 9 thành lỗi). Mỗi task nội dung tự kiểm bằng `npm run content:validate`, Vitest (gồm test parity trong Pyodide) và review sư phạm.

**Tech Stack:** Như M5c. Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md` (chính: mục 3, 4.1–4.3, 7, 12.1)

## Global Constraints

- Phạm vi M5d: nội dung giai đoạn 4 và Task 7. Ngoài phạm vi: giai đoạn 5–6 (ngoài bản đầu), hình robot (M6), sửa nội dung giai đoạn 1–3 (trừ khi validator, 1 test, hoặc 1 mục từ điển lỗi dùng chung bắt buộc).
- ID đã phát hành không được đổi. Không đổi `GAME_STATE_VERSION`, `SCHEMA_VERSION`, file mẫu `.pypet`.
- App chạy Python 3.14 trong Pyodide; `python3` và validator là CPython 3.13. Thông báo lỗi trong bài học phải được kiểm trong Pyodide. Giới hạn thời gian chạy mặc định 2 giây (`runSeconds`), runner dừng vòng lặp vô hạn và báo `timeout`/`timeout-while`.
- Sau mỗi task: `npm run content:validate`, `npx vitest run`, `npm run typecheck` qua. Báo số test thật.
- Không gọi mạng. Không dùng Gemini.
- Mọi commit message kết thúc bằng dòng trailer theo hướng dẫn attribution của phiên đang chạy.
- Mốc xanh trước khi bắt đầu: `npm run check` sau M5c (Vitest 1109, pytest 21, e2e 14, 0 cảnh báo).

## Quy tắc soạn nội dung (mọi task)

Giữ các quy tắc của M5a, M5b, M5c, với các thay đổi sau cho giai đoạn 4:

1. **Kiến thức được dùng:** giai đoạn 1–3 cộng các chủ đề giai đoạn 4 đã học trước. Vẫn chưa có list, hàm tự viết, `max()`/`min()`/`sum()`, `len()` (trừ khi bài học dạy rõ). Vòng lặp `for` qua chuỗi được dùng (chuỗi đã học từ giai đoạn 1).
2. **Không có vòng lặp vô hạn trong lời giải hay ví dụ `run`** (trừ ví dụ `run expect-error` cố ý cho thấy vòng lặp vô hạn bị dừng, nếu validator chấp nhận; nếu không, chỉ hiện code không `run`). Lời giải chạy nhanh với mọi test (dưới 1 giây).
3. **Test của bài vòng lặp:** có test ở 0 lần lặp (ví dụ `n = 0` hay khoảng rỗng) khi đề cho phép, test 1 lần lặp, và test nhiều lần lặp; ít nhất 1 test ẩn; đáp án in cứng phải trượt.
4. **Vẽ hình bằng `*`:** đầu ra không dựa vào dấu cách cuối dòng (spec 3.7 bỏ dấu cách cuối dòng); hình có dấu cách đầu dòng (kim tự tháp) thì ghi rõ trong đề.
5. **Bài AI:** 1 bài AI (2 thẻ, 2 câu `mcq`, không có bài code), ít nhất 5 câu AI trong giai đoạn.

## Review Focus

1. Nội dung đúng về Python: `range(a, b)` không gồm `b`; `range(a, b, step)`; `while` kiểm tra điều kiện trước mỗi lần lặp; `break` thoát vòng lặp gần nhất; `continue` bỏ phần còn lại của lần lặp; biến đếm sau vòng lặp; vòng lặp lồng.
2. Test cho 0, 1 và nhiều lần lặp; không lời giải nào chậm hay vô hạn.
3. Phù hợp học sinh lớp 6; ví dụ đời thường (đếm bậc thang, tiết kiệm tiền, bảng cửu chương).
4. Sau Task 7, `npm run content:validate` báo lỗi (không chỉ cảnh báo) khi 1 khái niệm thiếu thẻ, gợi ý hay bài luyện, hoặc ngân hàng 1 giai đoạn nhỏ hơn 2 lần đề tiến hóa; nội dung hiện tại qua.

## Quyết định thiết kế

Chưa được người bảo trì duyệt; ghi trong `docs/superpowers/DECISIONS.md` mục M5d.

1. **Dàn ý giai đoạn 4** (5 chủ đề, 28 bài): xem Task 1–5.
2. **Bài AI "Học có giám sát và không giám sát"** là bài cuối của chủ đề "for và range".
3. **Chưa dạy list, `len()`, `sum()`, `max()`**: bài tổng, đếm, lớn nhất dùng biến tích lũy.
4. **Luật 8 và 9 thành lỗi** sau khi giai đoạn 4 xong (quyết định của người bảo trì ở M3a: "chỉ cảnh báo tới M5").

---

## File Structure

```
content/stage-4/
  stage.yaml                (mới, Task 1) id s4
  01-for-range/             (mới, Task 1) for và range, 6 bài (bài 6 là AI)
  02-while/                 (mới, Task 2) while, 5 bài
  03-tong-dem/              (mới, Task 3) Tổng, đếm, lớn nhất, 6 bài
  04-long-nhau/             (mới, Task 4) Vòng lặp lồng và vẽ hình, 5 bài
  05-chu-so-uoc-so/         (mới, Task 5) Chữ số, ước số, break, continue, 6 bài
content/errors/errors.yaml  (có thể sửa)
tools/content/coverage.ts, buildBundle.ts và test  (sửa, Task 7) luật 8 và 9 thành lỗi
docs/superpowers/content-stage-4.md  (mới, Task 6)
```

---

### Task 1: Giai đoạn 4 và chủ đề "for và range"

- `stage.yaml`: `id: s4`, `title: { vi: "Giai đoạn 4: Vòng lặp", en: "Stage 4: Loops" }`, `topics: [01-for-range]`.
- Chủ đề `s4.for-range`, `title: { vi: "for và range", en: "for and range" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-lap-lai.md` | `s4.for-range.l1` | Lặp lại với for / Repeating with for | `for i in range(3):` chạy khối lệnh 3 lần; dấu `:` và thụt lề như `if`. |
  | `02-range.md` | `s4.for-range.l2` | range(n) đếm từ 0 / range(n) counts from 0 | `range(5)` cho 0, 1, 2, 3, 4 (không có 5); in `i` trong vòng lặp. |
  | `03-range-a-b.md` | `s4.for-range.l3` | range(a, b) và bước nhảy / range(a, b) and steps | `range(1, 6)`; `range(0, 11, 2)`; `range(10, 0, -1)` đếm ngược. |
  | `04-bien-trong-vong-lap.md` | `s4.for-range.l4` | Dùng i trong phép tính / Using i in calculations | `i * i`, bảng nhân của 1 số, đọc `n` rồi lặp `n` lần. |
  | `05-for-qua-chuoi.md` | `s4.for-range.l5` | for qua từng ký tự / for over each character | `for ch in "Robo":`; đếm ký tự bằng biến đếm (chưa dùng `len`). |
  | `06-giam-sat.md` | `s4.for-range.l6` | Học có giám sát và không giám sát / Supervised and unsupervised learning | Bài AI: học có giám sát dùng dữ liệu có nhãn (ảnh có ghi "mèo"); học không giám sát tự nhóm dữ liệu không nhãn (xếp các bài hát giống nhau thành nhóm). |

- Khái niệm (6): `for-repeat` (for lặp lại khối lệnh), `range-stop-excluded` (range không gồm số cuối), `range-start-step`, `loop-variable` (i thay đổi mỗi lần lặp), `for-over-string`, `ai-supervised` (`ai: true`).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`. Ít nhất 5 câu AI (`lessons: [s4.for-range.l6]`).
- Commit: `content(s4): stage 4 and the topic for and range`.

### Task 2: Chủ đề "while"

- Chủ đề `s4.while`, `title: { vi: "Vòng lặp while", en: "The while loop" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-while.md` | `s4.while.l1` | Lặp khi điều kiện còn đúng / Repeat while true | `while dieu_kien:`; điều kiện được kiểm tra trước mỗi lần lặp; có thể lặp 0 lần. |
  | `02-vong-lap-vo-han.md` | `s4.while.l2` | Vòng lặp không dừng / A loop that never stops | Quên thay đổi biến thì lặp mãi; Py-Pet dừng chương trình sau vài giây (mục từ điển `timeout-while`); cách sửa. |
  | `03-dung-khi-nhap-0.md` | `s4.while.l3` | Nhập đến khi gặp 0 / Read until 0 | Đọc số trong vòng lặp, dừng khi gặp 0; test có dữ liệu nhập nhiều dòng. |
  | `04-while-hay-for.md` | `s4.while.l4` | while hay for? / while or for? | Biết trước số lần thì dùng `for`; dừng theo điều kiện thì dùng `while`; viết 1 bài bằng cả 2 cách. |
  | `05-tiet-kiem.md` | `s4.while.l5` | Heo đất của Robo / Robo's piggy bank | Bài tổng hợp: mỗi tuần thêm tiền, bao nhiêu tuần thì đủ mua món đồ. |

- Khái niệm (5): `while-check-first`, `while-update` (phải thay đổi biến để dừng), `sentinel-input` (dừng khi gặp giá trị đặc biệt), `while-vs-for`, `off-by-one` (lặp thừa hoặc thiếu 1 lần).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`. Commit: `content(s4): the topic while`.

### Task 3: Chủ đề "Tổng, đếm, lớn nhất"

- Chủ đề `s4.tong-dem`, `title: { vi: "Tổng, đếm, lớn nhất", en: "Sum, count, maximum" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-tinh-tong.md` | `s4.tong-dem.l1` | Cộng dồn / Adding up | Biến `tong = 0` đặt trước vòng lặp; `tong = tong + i` (giới thiệu `+=`). |
  | `02-dem.md` | `s4.tong-dem.l2` | Đếm / Counting | `dem = 0`, tăng khi điều kiện đúng (đếm số chẵn, đếm điểm từ 5 trở lên). |
  | `03-lon-nhat.md` | `s4.tong-dem.l3` | Lớn nhất, nhỏ nhất / Largest and smallest | Gán số đầu tiên làm `lon_nhat` rồi so sánh dần (không bắt đầu bằng 0 nếu có thể có số âm). |
  | `04-trung-binh.md` | `s4.tong-dem.l4` | Trung bình / The average | Tổng chia số lượng; trường hợp không có số nào (tránh chia cho 0). |
  | `05-doc-n-so.md` | `s4.tong-dem.l5` | Đọc n số / Reading n numbers | Dòng đầu là `n`, `n` dòng sau là các số; kết hợp tổng, đếm, lớn nhất. |
  | `06-bai-toan.md` | `s4.tong-dem.l6` | Thống kê điểm của lớp / Class score statistics | Bài tổng hợp. |

- Khái niệm (5): `accumulator-init` (khởi tạo trước vòng lặp), `plus-equals` (`+=`), `count-if`, `running-max` (bắt đầu từ số đầu tiên), `average-zero-count` (không chia cho 0).
- Trạm ôn: `r1` sau `l2`, `r2` sau `l4`. Commit: `content(s4): the topic sum count maximum`.

### Task 4: Chủ đề "Vòng lặp lồng và vẽ hình"

- Chủ đề `s4.long-nhau`, `title: { vi: "Vòng lặp lồng và vẽ hình", en: "Nested loops and drawing" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-vong-lap-long.md` | `s4.long-nhau.l1` | Vòng lặp trong vòng lặp / A loop inside a loop | Vòng trong chạy hết mỗi lần vòng ngoài chạy 1 lần; đếm số lần chạy (3 × 4 = 12). |
  | `02-hinh-chu-nhat.md` | `s4.long-nhau.l2` | Hình chữ nhật bằng * / A rectangle of * | `print("*" * m)` trong vòng lặp; cách dùng `end=""` và `print()` để xuống dòng. |
  | `03-tam-giac.md` | `s4.long-nhau.l3` | Tam giác / Triangles | Số `*` ở dòng thứ `i` là `i`; tam giác ngược. |
  | `04-bang-cuu-chuong.md` | `s4.long-nhau.l4` | Bảng cửu chương / Times tables | In bảng nhân bằng 2 vòng lặp; định dạng bằng f-string. |
  | `05-kim-tu-thap.md` | `s4.long-nhau.l5` | Kim tự tháp / Pyramids | Dấu cách đầu dòng và `*`; đề ghi rõ có dấu cách đầu dòng. |

- Khái niệm (4): `nested-inner-full` (vòng trong chạy hết mỗi lần), `row-col-pattern` (dòng thứ i có i ký tự), `print-end-newline` (end="" và print() xuống dòng trong vòng lặp), `leading-spaces`.
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`. Commit: `content(s4): the topic nested loops`.

### Task 5: Chủ đề "Chữ số, ước số, break, continue"

- Chủ đề `s4.chu-so`, `title: { vi: "Chữ số, ước số, break và continue", en: "Digits, divisors, break and continue" }`:

  | File | ID | Tên (vi / en) | Mục tiêu |
  |---|---|---|---|
  | `01-tach-chu-so.md` | `s4.chu-so.l1` | Tách từng chữ số / Splitting digits | `while n > 0:` với `n % 10` và `n // 10`; trường hợp `n = 0`. |
  | `02-tong-chu-so.md` | `s4.chu-so.l2` | Tổng và số lượng chữ số / Sum and count of digits | Kết hợp với cộng dồn và đếm. |
  | `03-uoc-so.md` | `s4.chu-so.l3` | Ước số / Divisors | Duyệt `i` từ 1 tới `n`, in `i` khi `n % i == 0`; đếm ước. |
  | `04-break.md` | `s4.chu-so.l4` | Thoát vòng lặp với break / Leaving a loop with break | `break` thoát vòng lặp gần nhất; tìm ước nhỏ nhất lớn hơn 1; kiểm tra số nguyên tố. |
  | `05-continue.md` | `s4.chu-so.l5` | Bỏ qua 1 lần lặp với continue / Skipping with continue | `continue` bỏ phần còn lại của lần lặp đó; khác `break`. |
  | `06-bai-toan.md` | `s4.chu-so.l6` | Bài toán số học / Number puzzles | Số đảo ngược, số đối xứng, số hoàn hảo (giá trị nhỏ). |

- Khái niệm (5): `digit-split` (`% 10` và `// 10`), `divisor-loop`, `break-nearest` (break thoát vòng gần nhất), `continue-skip`, `prime-check`.
- Trạm ôn: `r1` sau `l2`, `r2` sau `l5`.
- Expected sau task: `npm run content:build` không có dòng "Cảnh báo:" nào. Commit: `content(s4): the topic digits divisors break continue`.

### Task 6: Rà soát giai đoạn 4 và bảng tổng hợp cho phụ huynh

Như Task 6 của M5c, cho giai đoạn 4 (test cho 0, 1, nhiều lần lặp; không lời giải chậm; thuật ngữ "vòng lặp", "lần lặp", "biến đếm"). Viết `docs/superpowers/content-stage-4.md`. Commit nội dung sửa trước, rồi bảng tổng hợp.

### Task 7: Luật 8 và 9 thành lỗi

**Files:** Modify `tools/content/coverage.ts`, nơi gọi nó (`tools/build_content.ts`, `tools/content/buildBundle.ts`), test trong `tools/content/buildBundle.test.ts`; có thể sửa `tools/validate_content.py` nếu luật được kiểm ở đó.

**Interfaces:**
- `npm run content:build` (và `content:validate`) dừng với lỗi khi: 1 khái niệm thiếu thẻ hiểu lầm, gợi ý cho phụ huynh, hoặc bài luyện mức 1 (khái niệm AI) hay mức 1–3 (khái niệm khác) (luật 8); ngân hàng câu hỏi của 1 giai đoạn nhỏ hơn 2 lần số câu của đề tiến hóa, hoặc thiếu câu AI hay bài code cho đề (luật 9). Thiếu câu cho kiểm tra chủ đề cũng là lỗi.
- Test: đổi các test "warns about …" thành "reports …" (nội dung thiếu thì `buildBundle` ném `ContentError` với thông báo cũ); test mẫu tối thiểu trong test có thể cần đủ nội dung hoặc 1 tùy chọn để bỏ qua luật khi test các phần khác (chọn cách đơn giản nhất và giải thích trong báo cáo).
- Nội dung hiện tại (giai đoạn 1–4) qua.
- Commit: `feat(content): rules 8 and 9 are errors now that stages 1 to 4 are complete`.

## Việc chuyển từ M5c

- Mục từ điển `missing-colon` (và các mục thụt lề) ở M5c chỉ nói về `if`/`elif`/`else`: Task 1 của M5d bổ sung `for` vào lời giải thích, Task 2 bổ sung `while`, kiểm trong Pyodide. Tag `if-colon` của `missing-colon` cũng bắt dòng `for`/`while`: Task 1 quyết định giữ hay bỏ (ghi trong báo cáo).
- Quy tắc soạn của M5c (`docs/superpowers/plans/2026-10-07-m5c-noi-dung-giai-doan-3.md`, "Quy tắc soạn nội dung") vẫn áp dụng, gồm cả các bài học từ review (vị trí đáp án, không có lựa chọn đùa, không gọi vị trí lựa chọn, test cho mọi nhánh và ranh giới).
