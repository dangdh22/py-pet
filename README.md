# Py-Pet

Py-Pet là ứng dụng web dạy Python cho học sinh lớp 6 chưa từng viết code. Con học qua việc nuôi robot ảo tên Robo: làm bài thì Robo lớn lên, qua bài kiểm tra tiến hóa thì Robo lên dạng mới. Python chạy ngay trong trình duyệt bằng Pyodide, nên app không cần máy chủ và không gửi dữ liệu đi đâu.

Hướng dẫn sử dụng cho học sinh và phụ huynh: [`public/huong-dan.html`](public/huong-dan.html). Sau khi deploy, trang này nằm ở `https://<owner>.github.io/py-pet/huong-dan.html`.

## Mục tiêu

1. Dạy nền tảng lập trình và ngôn ngữ Python từ con số 0, mỗi ngày 15 đến 30 phút trên laptop.
2. Chuẩn bị cho 2 dạng thi:
   - Tin học trẻ, học sinh giỏi Tin: tự viết chương trình, chấm bằng test. Đây là phần chính.
   - SCO IAIO: trắc nghiệm đọc code và kiến thức AI, có bản tiếng Anh.
3. Giữ động lực bằng cơ chế nuôi robot. Robo không bao giờ mất cấp hay mất XP; khi con vắng lâu, Robo chỉ buồn ngủ hoặc hết pin.
4. Cho phụ huynh thấy con đang vướng ở khái niệm nào, kèm bài làm thật của con.

## Chức năng

### Cho học sinh

| Màn hình | Chức năng |
|---|---|
| Chào hỏi | Chọn ngôn ngữ, nhập tên con, tên robot và mã PIN của bố mẹ |
| Phòng của Robo | Robo theo dạng tiến hóa và trạng thái (vui vẻ, bình thường, buồn ngủ, hết pin, đi nghỉ ở bãi biển), phụ kiện và đồ trang trí, thanh Pin, Vui, Lớn lên, mục tiêu ngày và tuần, chuỗi ngày, xu, nút "Học tiếp" |
| Bản đồ học | Đường đi theo chủ đề: bài học, trạm ôn, kiểm tra chủ đề, kiểm tra tiến hóa |
| Bài học | Thẻ lý thuyết có ví dụ chạy được; bài tập code chia đôi màn hình (đề bên trái, trình soạn code, ô Input, Chạy thử, Nộp bài bên phải); bài sắp xếp dòng code, điền chỗ trống, trắc nghiệm, đoán kết quả |
| Hỗ trợ khi gặp khó | Robo giải thích lỗi Python bằng tiếng Việt (từ điển 43 lỗi); gợi ý 3 mức; xem lời giải sau 3 lần sai; thẻ "Hiểu lầm thường gặp" kèm bài luyện |
| Trạm ôn và ôn tập | 5 câu theo lịch ôn ngắt quãng (hộp Leitner), ưu tiên khái niệm yếu; ôn tập sạc Pin cho Robo |
| Kiểm tra | Kiểm tra chủ đề (8 câu và 2 bài code); kiểm tra tiến hóa (15 câu, 3 bài code, đạt từ 80%); chưa đạt thì làm bộ ôn tập trọng tâm rồi thi lại |
| Tiến hóa | Hoạt cảnh toàn màn hình; Robo có thêm ăng-ten, tay, màn hình ngực qua 4 dạng: Viên nang, Sơ sinh, Bé con, Thiếu niên |
| Cửa hàng | Đồ cho Robo (pin, dầu nhớt, đồ chơi, 10 phụ kiện, 5 đồ trang trí) và phần thưởng thật do bố mẹ đặt |
| Sổ thành tích | Huy hiệu, các dạng Robo đã đạt, số khái niệm đã vững và đang luyện |
| Song ngữ | Giao diện Việt và Anh; câu hỏi và bài code dùng trong đề kiểm tra có bản tiếng Anh, đổi từng câu bằng nút VI/EN |

### Cho phụ huynh (Khu phụ huynh, vào bằng PIN, tự khóa sau 5 phút)

| Tab | Chức năng |
|---|---|
| Tổng quan | Cảnh báo, số phút học 7 ngày, giai đoạn, kế hoạch tuần, chuỗi ngày, xu |
| Con cần hỗ trợ | Khái niệm yếu kèm điểm thành thạo, tỷ lệ đúng, 3 hiểu lầm hay gặp, bài làm thật của con, gợi ý cách kèm con ngoài đời, nút giao thêm bài luyện |
| Tiến độ | Theo chủ đề và từng bài, lịch sử kiểm tra tiến hóa |
| Phần thưởng | Duyệt hoặc từ chối yêu cầu đổi thưởng, sửa danh sách phần thưởng và giới hạn mỗi tuần |
| Cài đặt | Chế độ nghỉ (bật ngay hoặc lên lịch), mục tiêu ngày và tuần, các ngưỡng, giới hạn thời gian chạy code, ngôn ngữ, đổi PIN, xóa hồ sơ, nhật ký lỗi |

Sao lưu: xuất và nhập file `.pypet` (có kiểm tra file hỏng hoặc bị sửa), kèm bản sao lưu tự động. App nhắc sao lưu khi quá 7 ngày chưa sao lưu.

### Nội dung bản đầu

| Giai đoạn | Chủ đề | Số bài |
|---|---|---|
| 1. Khởi động | Làm quen với chương trình; print và chuỗi; chú thích và đọc thông báo lỗi; sep và end; bài AI "AI là gì?" | 19 |
| 2. Dữ liệu | Biến; phép tính `//` `%` `**`; `input()`; ép kiểu; định dạng đầu ra | 25 |
| 3. Rẽ nhánh | So sánh và bool; if và else; elif; and, or, not; bài toán điều kiện | 22 |
| 4. Vòng lặp | for và range; while; tổng, đếm, lớn nhất; vòng lặp lồng và vẽ hình; chữ số, ước số, break và continue | 28 |

Tổng cộng: 94 bài học, 336 câu hỏi và bài tập trong bài học, 280 câu trong ngân hàng câu hỏi, 167 bài luyện, 95 khái niệm (mỗi khái niệm có thẻ hiểu lầm, gợi ý cho phụ huynh và bài luyện 3 mức), 43 mục trong từ điển lỗi. Bảng tổng hợp cho phụ huynh duyệt: `docs/superpowers/content-stage-1.md` đến `content-stage-4.md`.

## Cách tiếp cận

### Sư phạm

- **Thành thạo theo khái niệm:** mỗi khái niệm có điểm 0 đến 100, cập nhật sau mỗi lần làm bài. App bật cờ "Cần hỗ trợ" khi con sai nhiều, gặp lại cùng 1 hiểu lầm, hoặc sai bài ôn liên tiếp.
- **Bậc thang 3 mức:** đọc code và đoán kết quả, rồi sắp xếp dòng code hoặc điền chỗ trống, rồi tự viết code. Đúng 2 lần liên tiếp thì lên mức, sai 2 lần liên tiếp thì xuống mức.
- **Ôn tập ngắt quãng:** mỗi câu nằm trong 1 trong 5 hộp Leitner (ôn lại sau 1, 2, 4, 7, 14 ngày).
- **Hiểu lầm thường gặp:** phương án sai của câu hỏi và các lỗi code điển hình được gắn với 1 khái niệm, nên app nhận ra con đang hiểu sai điều gì và mời xem thẻ giải thích.
- **Bài luyện chỉ dùng kiến thức đã học:** 1 bài luyện chỉ mở khi mọi khái niệm của nó đã có trong 1 bài học con đã xong.
- **Phạt nhẹ:** làm sai không mất Pin hay Vui; đúng sau nhiều lần sai còn được thêm xu kiên trì.

### Kỹ thuật

- Web tĩnh: React 19, TypeScript, Vite. Không có máy chủ, app không gọi mạng.
- Python 3.14 chạy trong Web Worker bằng Pyodide; có giới hạn thời gian chạy, giới hạn đầu ra và tự khởi động lại khi treo.
- Luật chơi là hàm thuần trong `src/game/`, nhận thời gian từ ngoài, nên test được mọi kịch bản ngày tháng.
- Dữ liệu lưu trong IndexedDB (Dexie) của trình duyệt, có phiên bản dữ liệu và migration; file sao lưu có checksum.
- Nội dung là file Markdown và YAML trong `content/`, được build thành JSON và kiểm tra tự động: mọi lời giải, mọi ví dụ và mọi mẫu lỗi đều được chạy bằng CPython và bằng Pyodide thật; thiếu thẻ hiểu lầm, bài luyện hay câu cho đề kiểm tra thì build báo lỗi.
- Hình robot, phụ kiện, phòng và hoạt cảnh vẽ bằng SVG và CSS, không dùng file ảnh; mọi hoạt cảnh tắt khi máy bật chế độ giảm chuyển động.
- Xử lý lỗi: trình duyệt không hỗ trợ, Python không khởi động được (có nút Thử lại), bài lỗi lúc chạy (bỏ qua được và không tính điểm), IndexedDB bị chặn, ghi dữ liệu thất bại, mở app ở 2 tab, lỗi giao diện.
- Không dùng Gemini (điều khoản cấm người dưới 18 tuổi). Giải thích lỗi bằng AI để dành cho bản sau.

### Quy trình phát triển

Dự án làm theo từng mốc (M1 đến M6). Mỗi mốc có kế hoạch trong `docs/superpowers/plans/`, được làm theo từng task: 1 agent viết code và test, 1 agent khác review, cuối mốc có review toàn nhánh rồi mới merge vào `main`. Các quyết định chưa được người bảo trì duyệt nằm trong `docs/superpowers/DECISIONS.md`; sổ ghi của từng mốc nằm trong `docs/superpowers/ledgers/`.

## Trạng thái

Bản đầu đã đủ 6 mốc (M1 đến M6, cập nhật 2026-10-07). `npm run check` xanh: lint, typecheck, 1418 test Vitest, 21 test pytest, kiểm tra nội dung, 17 test Playwright. Chi tiết, việc tiếp theo và việc để bản sau: `docs/superpowers/STATUS.md`.

Việc còn lại trước khi phát hành:

1. Người bảo trì thử app bằng mắt và xem lại `docs/superpowers/DECISIONS.md`.
2. Phụ huynh duyệt lời văn nội dung.
3. Bật GitHub Pages (mục "CI và deploy").
4. Cho học sinh dùng thử theo `docs/manual-test-checklist.md`.

## Tài liệu

| File | Nội dung |
|---|---|
| `docs/superpowers/specs/2026-10-06-py-pet-design.md` | Thiết kế (căn cứ cao nhất) |
| `docs/superpowers/STATUS.md` | Trạng thái, việc tiếp theo, việc tồn đọng |
| `docs/superpowers/DECISIONS.md` | Quyết định cần người bảo trì xem lại |
| `docs/superpowers/plans/` | Kế hoạch từng mốc |
| `docs/superpowers/ledgers/` | Sổ ghi từng mốc: phán quyết review, finding đã hoãn |
| `docs/superpowers/content-stage-1.md` đến `-4.md` | Bảng tổng hợp nội dung để phụ huynh duyệt |
| `docs/manual-test-checklist.md` | Kiểm tra thủ công trước khi phát hành |
| `CLAUDE.md` | Quy ước cho Claude khi làm việc trong repo |

## Cài đặt lần đầu

Cần Node `^22.22.2 || ^24.15.0 || >=26` và Python 3.

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
npx playwright install chromium
```

Chạy thử trên máy: `npm run dev`, rồi mở http://localhost:5173/. Ở bản dev có thêm trang `#/gallery` để xem mọi dạng của Robo, phụ kiện và cảnh phòng.

## Lệnh thường dùng

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy app ở chế độ phát triển |
| `npm test` | Build nội dung rồi chạy test Vitest (gồm test trên Pyodide thật) |
| `npm run test:py` | Test cho script kiểm tra nội dung |
| `npm run content:validate` | Build nội dung và chạy mọi đoạn code trong nội dung bằng Python |
| `npm run test:e2e` | Test đầu cuối bằng Playwright trên bản build (cả khi bản build chạy dưới đường dẫn con `/py-pet/`) |
| `npm run lint` | ESLint |
| `npm run check` | Chạy tất cả kiểm tra ở trên, gồm lint |
| `npm run build` | Build bản tĩnh vào `dist/` |

## CI và deploy

- `.github/workflows/ci.yml` chạy trên mọi lần push và pull request: Node 22, Python 3.13 (tạo `.venv` từ `requirements-dev.txt`), `npm ci`, cài Chromium của Playwright rồi `npm run check`. Khi lỗi, báo cáo Playwright được lưu thành artifact `playwright-report` của lần chạy.
- `.github/workflows/deploy.yml` chạy khi push vào `main` (hoặc bấm tay ở tab Actions): `npm run build` rồi đưa `dist/` lên GitHub Pages. Không chạy lại test vì CI đã chạy trên cùng commit. Push nhánh khác không deploy.
- Bật Pages 1 lần: trên GitHub vào Settings → Pages → Source: chọn **GitHub Actions**. Trước khi bật, bước deploy báo lỗi 404; bật xong thì vào tab Actions, chọn workflow Deploy và bấm Run workflow.
- Trang sau khi deploy: `https://<owner>.github.io/py-pet/` (`<owner>` là tên tài khoản hoặc tổ chức chứa repo). Bản build dùng đường dẫn tương đối và hash routing nên chạy được dưới `/py-pet/`; e2e `e2e/subpath.spec.ts` kiểm tra điều này bằng `tools/serve_subpath.mjs` (phục vụ `dist/` tại `http://localhost:4174/py-pet/`).

## Soạn nội dung

Nội dung nằm trong `content/stage-N/<chủ đề>/`: `topic.yaml`, `concepts.yaml` (khái niệm, thẻ hiểu lầm, gợi ý cho phụ huynh, bài luyện 3 mức), `questions.yaml` (ngân hàng câu hỏi), `practice.yaml` và mỗi bài học là 1 file Markdown có phần đầu YAML. Từ điển lỗi nằm trong `content/errors/errors.yaml`, xếp theo độ ưu tiên. Sau khi sửa nội dung, chạy `npm run content:validate`. ID đã phát hành thì không được đổi.

## Dữ liệu

Tiến độ được lưu trong IndexedDB của trình duyệt. Hãy xuất file sao lưu `.pypet` thường xuyên (màn hình Sao lưu). Khi đổi cấu trúc dữ liệu, tăng `SCHEMA_VERSION`, thêm migration trong `src/storage/backup.ts` và chạy `npx tsx tools/make_backup_fixture.ts` để lưu file mẫu của phiên bản mới; không sinh lại file mẫu của phiên bản cũ.
