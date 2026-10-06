# py-pet

Ứng dụng web dạy Python cho học sinh lớp 6 qua việc nuôi robot ảo. Python chạy ngay trong trình duyệt bằng Pyodide.

- Thiết kế: `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch M1: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`
- Kế hoạch M2: `docs/superpowers/plans/2026-10-06-m2-vong-choi-pet.md`

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
| `npm run test:e2e` | Test đầu cuối bằng Playwright trên bản build |
| `npm run check` | Chạy tất cả kiểm tra ở trên |
| `npm run build` | Build bản tĩnh vào `dist/` |

## Soạn nội dung

Nội dung nằm trong `content/`. Mỗi bài học là 1 file Markdown có phần đầu YAML. Sau khi sửa nội dung, chạy `npm run content:validate`. ID đã phát hành thì không được đổi.
