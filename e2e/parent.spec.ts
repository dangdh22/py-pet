import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}

async function openParentArea(page: Page) {
  await page.getByRole("link", { name: "Khu phụ huynh" }).click();
  await page.getByLabel("Mã PIN").fill("1234");
  await page.getByRole("button", { name: "Mở" }).click();
  await expect(page.getByRole("tab", { name: "Tổng quan" })).toBeVisible();
}

test("the parent adds a reward, the child asks for it, the parent approves it with the PIN", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type('print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("link", { name: "Py-Pet" }).click();
  await expect(page.getByText("Xu: 8")).toBeVisible();

  await openParentArea(page);
  await page.getByRole("tab", { name: "Phần thưởng" }).click();
  await page.getByRole("button", { name: "Thêm phần thưởng" }).click();
  await page.getByLabel("Tên").fill("Đọc truyện cùng bố");
  await page.getByLabel("Giá (xu)").fill("5");
  await page.getByRole("button", { name: "Lưu danh sách" }).click();
  await expect(page.getByText("Đã lưu danh sách.")).toBeVisible();
  await page.getByRole("button", { name: "Khóa" }).click();
  await page.getByRole("link", { name: "Về phòng" }).click();

  await page.getByRole("link", { name: "Cửa hàng" }).click();
  await page.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }).click();
  await page.getByRole("button", { name: "Đổi Đọc truyện cùng bố" }).click();
  await expect(page.getByText("Chờ bố mẹ duyệt")).toBeVisible();
  await page.getByRole("link", { name: "Về phòng" }).click();

  await openParentArea(page);
  await expect(page.getByText("1 yêu cầu đổi thưởng chờ duyệt")).toBeVisible();
  await page.getByRole("tab", { name: "Phần thưởng" }).click();
  await page.getByRole("button", { name: "Duyệt Đọc truyện cùng bố" }).click();
  await expect(page.getByText("Không có yêu cầu nào.")).toBeVisible();
  await page.getByRole("link", { name: "Về phòng" }).click();
  await expect(page.getByText("Xu: 3")).toBeVisible();
});

test("the parent switches the vacation on and the room shows it", async ({ page }) => {
  await startApp(page);
  await openParentArea(page);
  await page.getByRole("tab", { name: "Cài đặt" }).click();
  await page.getByRole("button", { name: "Bật chế độ nghỉ ngay" }).click();
  await expect(page.getByText(/^Đang nghỉ từ \d{4}-\d{2}-\d{2}\.$/)).toBeVisible();
  await page.getByRole("link", { name: "Về phòng" }).click();
  await expect(page.getByText("Robo đang đi nghỉ. Con vẫn học được nếu muốn!")).toBeVisible();
  await expect(page.getByRole("img", { name: "Robo" }).first()).toHaveAttribute("data-mood", "vacation");
});
