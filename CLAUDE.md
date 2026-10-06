# Hướng dẫn cho Claude trong repo py-pet

Py-Pet là web app tĩnh dạy Python cho học sinh lớp 6 (con của chủ repo) qua việc nuôi robot ảo. Python chạy trong trình duyệt bằng Pyodide. Stack: React 19, TypeScript 5.9, Vite 8, Vitest 5, Playwright 1.63, Dexie 4 (IndexedDB), Pyodide 314.

## Đọc trước khi làm việc

1. `docs/superpowers/STATUS.md`: mốc đã xong, việc tiếp theo, việc tồn đọng chuyển sang mốc sau.
2. `docs/superpowers/specs/2026-10-06-py-pet-design.md`: spec. Spec là căn cứ cao nhất; kế hoạch là lập luận dựa trên spec.
3. Kế hoạch và ledger của mốc gần nhất trong `docs/superpowers/plans/` và `docs/superpowers/ledgers/` khi cần biết vì sao code được viết như vậy.

## Quy tắc giao tiếp với chủ repo

Chép nguyên văn từ quy tắc cá nhân của chủ repo (file `~/CLAUDE.md` trên máy local không có trong phiên cloud):

- If I write in Vietnamese, reply in Vietnamese. If I write in English, or ask for English output, write the content in ASD-STE100 Simplified Technical English.
- In chat replies, address me as "Anh yêu" or "Honey" in a sweet, affectionate, lovely-girl tone. In English replies, keep this warmth to the greeting and short framing sentences. Files and documents you create use a neutral professional tone.
- Before you create a file deliverable (PPTX, DOCX, XLSX, PDF), confirm the format with me, unless I already asked for that format. These files take time to build, and often I only need the content. Otherwise, answer in Markdown.
- Use metric units and numerals (3 instead of three).
- Mark any claim you have not verified as (assumption).
- Use paragraphs for narrative explanations, numbered lists for ordered steps or lists I will refer back to by number, and bullets for short unordered options.
- Write chat replies in plain text, without emoji or decorative icons.
- Default to concise responses; expand only when complexity requires it or I explicitly request detail.
- Dates in ISO format (YYYY-MM-DD).

## Cách làm mỗi mốc

Chủ repo dùng bộ skill superpowers và làm mỗi mốc theo đúng thứ tự:

1. `/superpowers:writing-plans` để viết kế hoạch cho mốc vào `docs/superpowers/plans/YYYY-MM-DD-<ten-moc>.md`. Chủ repo duyệt kế hoạch trước khi làm.
2. `/superpowers:subagent-driven-development` để thực hiện: mỗi task có 1 subagent làm và 1 reviewer kiểm tra, cuối cùng review toàn nhánh. Làm trên nhánh riêng, không commit thẳng vào `main`.
3. Sau review cuối, chủ repo thử app bằng mắt (`npm run dev`).
4. Merge vào `main`, chạy lại `npm run check`, dọn nhánh/worktree. Chỉ push khi chủ repo bảo.
5. Khi xong mốc: cập nhật `docs/superpowers/STATUS.md` và lưu ledger của mốc vào `docs/superpowers/ledgers/` (ledger mặc định nằm trong `.superpowers/`, thư mục này bị git bỏ qua và sẽ mất khi phiên cloud kết thúc).

Hỏi trước khi merge, push, xóa nhánh hoặc làm việc khó hoàn tác.

## Làm việc trong phiên cloud

- Cài đặt: `npm install`; `python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt`; `npx playwright install --with-deps chromium`; `npm run pyodide:copy`. Sau đó chạy `npm run check` để có mốc xanh trước khi sửa code.
- Phiên cloud thường đã chạy trên 1 nhánh riêng; khi đó không cần tạo worktree trong `.worktrees/`.
- Phiên cloud không mở được Chrome trên máy chủ repo. Ở bước thử app (bước 3 ở trên), push nhánh và gửi chủ repo lệnh chạy trên máy local: `git fetch && git switch <nhanh> && npm install && npm run dev`, rồi mở http://localhost:5173/.
- Dòng trailer của commit (Co-Authored-By, Claude-Session) lấy theo hướng dẫn attribution của phiên hiện tại. Các kế hoạch cũ ghi cứng link session cũ; khi viết kế hoạch mới, dùng link của phiên mới.

## Quy ước code

- Luật chơi là hàm thuần trong `src/game/` nhận `now` từ ngoài; `GameState` chỉ chứa dữ liệu JSON.
- Mọi chuỗi giao diện đi qua `t(key)`; `src/i18n/vi.ts` và `src/i18n/en.ts` phải cùng khóa và cùng placeholder (có test kiểm tra).
- Đổi cấu trúc dữ liệu: tăng `SCHEMA_VERSION`, thêm migration trong `src/storage/backup.ts`, chạy `npx tsx tools/make_backup_fixture.ts` và commit file mẫu mới. Không sinh lại file mẫu của phiên bản cũ (`src/storage/fixtures/backup-v1.pypet`).
- Nội dung bài học trong `content/`; sau khi sửa chạy `npm run content:validate`. ID đã phát hành không được đổi.
- Không gọi mạng từ app. Không dùng Gemini (điều khoản cấm người dưới 18 tuổi); AI giải thích lỗi để dành cho OpenRouter free ở bản sau.
- Thư mục `ref/` chứa đề thi mẫu SAIO, chỉ để tham khảo.
