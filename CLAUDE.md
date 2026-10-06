# Hướng dẫn cho Claude trong repo py-pet

Py-Pet là web app tĩnh dạy Python cho học sinh lớp 6 qua việc nuôi robot ảo. Python chạy trong trình duyệt bằng Pyodide. Stack: React 19, TypeScript 5.9, Vite 8, Vitest 5, Playwright 1.63, Dexie 4 (IndexedDB), Pyodide 314.

## Đọc trước khi làm việc

1. `docs/superpowers/STATUS.md`: mốc đã xong, việc tiếp theo, việc tồn đọng chuyển sang mốc sau.
2. `docs/superpowers/specs/2026-10-06-py-pet-design.md`: spec. Spec là căn cứ cao nhất; kế hoạch là lập luận dựa trên spec.
3. Kế hoạch và ledger của mốc gần nhất trong `docs/superpowers/plans/` và `docs/superpowers/ledgers/` khi cần biết vì sao code được viết như vậy.

Quy tắc giao tiếp riêng của từng người đóng góp đặt trong `CLAUDE.local.md` (git bỏ qua file này) hoặc `~/.claude/CLAUDE.md`, không đặt trong file này.

## Cách làm mỗi mốc

Dự án dùng bộ skill superpowers và làm mỗi mốc theo đúng thứ tự:

1. `/superpowers:writing-plans` để viết kế hoạch cho mốc vào `docs/superpowers/plans/YYYY-MM-DD-<ten-moc>.md`. Người bảo trì duyệt kế hoạch trước khi làm.
2. `/superpowers:subagent-driven-development` để thực hiện: mỗi task có 1 subagent làm và 1 reviewer kiểm tra, cuối cùng review toàn nhánh. Làm trên nhánh riêng, không commit thẳng vào `main`.
3. Sau review cuối, người bảo trì thử app bằng mắt (`npm run dev`).
4. Merge vào `main`, chạy lại `npm run check`, dọn nhánh/worktree. Chỉ push khi người bảo trì yêu cầu.
5. Khi xong mốc: cập nhật `docs/superpowers/STATUS.md` và lưu ledger của mốc vào `docs/superpowers/ledgers/` (ledger mặc định nằm trong `.superpowers/`, thư mục này bị git bỏ qua và sẽ mất khi phiên cloud kết thúc).

Hỏi trước khi merge, push, xóa nhánh hoặc làm việc khó hoàn tác.

## Làm việc trong phiên cloud

- Cài đặt: hook `.claude/hooks/session-start.sh` tự chạy khi phiên cloud bắt đầu (`npm ci`, tạo `.venv` và cài `requirements-dev.txt`, `npm run pyodide:copy`). Phiên cloud có sẵn Chromium tại `/opt/pw-browsers` nhưng cũ hơn bản Playwright cần, nên hook đặt `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` và `playwright.config.ts` dùng biến này; không chạy `npx playwright install`. Nếu hook chưa chạy, chạy tay: `CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR=$PWD .claude/hooks/session-start.sh` rồi `export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`. Sau đó chạy `npm run check` để có mốc xanh trước khi sửa code.
- Phiên cloud thường đã chạy trên 1 nhánh riêng; khi đó không cần tạo worktree trong `.worktrees/`.
- Phiên cloud không mở được trình duyệt trên máy của người bảo trì. Ở bước thử app (bước 3 ở trên), push nhánh và gửi lệnh chạy trên máy local: `git fetch && git switch <nhanh> && npm install && npm run dev`, rồi mở http://localhost:5173/.
- Dòng trailer của commit (Co-Authored-By và các dòng khác) lấy theo hướng dẫn attribution của phiên hiện tại. Không ghi cứng link session vào kế hoạch.

## Quy ước code

- Luật chơi là hàm thuần trong `src/game/` nhận `now` từ ngoài; `GameState` chỉ chứa dữ liệu JSON.
- Mọi chuỗi giao diện đi qua `t(key)`; `src/i18n/vi.ts` và `src/i18n/en.ts` phải cùng khóa và cùng placeholder (có test kiểm tra).
- Đổi cấu trúc dữ liệu: tăng `SCHEMA_VERSION`, thêm migration trong `src/storage/backup.ts`, chạy `npx tsx tools/make_backup_fixture.ts` và commit file mẫu mới. Không sinh lại file mẫu của phiên bản cũ (`src/storage/fixtures/backup-v1.pypet`).
- Nội dung bài học trong `content/`; sau khi sửa chạy `npm run content:validate`. ID đã phát hành không được đổi.
- Không gọi mạng từ app. Không dùng Gemini (điều khoản cấm người dưới 18 tuổi); AI giải thích lỗi để dành cho OpenRouter free ở bản sau.
- Thư mục `ref/` (đề thi mẫu SCO IAIO) chỉ có trên máy local và bị git bỏ qua vì lý do bản quyền. Không commit file trong thư mục này.
