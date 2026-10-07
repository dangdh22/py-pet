# py-pet

Ứng dụng web dạy Python cho học sinh lớp 6 qua việc nuôi robot ảo. Python chạy ngay trong trình duyệt bằng Pyodide.

- Thiết kế: `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch M1: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`
- Kế hoạch M2: `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`
- Trạng thái dự án và việc tiếp theo: `docs/superpowers/STATUS.md`

Tiến độ được lưu trong IndexedDB của trình duyệt. Hãy xuất file sao lưu `.pypet` thường xuyên (màn hình Sao lưu). Khi đổi cấu trúc dữ liệu, tăng `SCHEMA_VERSION`, thêm migration trong `src/storage/backup.ts` và chạy `npx tsx tools/make_backup_fixture.ts` để lưu file mẫu của phiên bản mới.

## Cài đặt lần đầu

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
npx playwright install chromium
```

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
- Bật Pages 1 lần: trên GitHub vào Settings → Pages → Source: chọn **GitHub Actions**.
- Trang sau khi deploy: `https://<owner>.github.io/py-pet/` (`<owner>` là tên tài khoản hoặc tổ chức chứa repo). Bản build dùng đường dẫn tương đối và hash routing nên chạy được dưới `/py-pet/`; e2e `e2e/subpath.spec.ts` kiểm tra điều này bằng `tools/serve_subpath.mjs` (phục vụ `dist/` tại `http://localhost:4174/py-pet/`).

## Soạn nội dung

Nội dung nằm trong `content/`. Mỗi bài học là 1 file Markdown có phần đầu YAML. Sau khi sửa nội dung, chạy `npm run content:validate`. ID đã phát hành thì không được đổi.
