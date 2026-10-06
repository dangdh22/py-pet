import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}

async function submitCode(page: Page, code: string) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp" }).click();
}

async function lesson(page: Page, code: string) {
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, code);
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: "Hoàn thành" }).click();
  await page.getByRole("button", { name: "Về phòng" }).click();
}

test("xu from 2 lessons buy an item in the shop; the achievement book shows the first badge", async ({ page }) => {
  await startApp(page);
  await lesson(page, 'print("Xin chào Robo")');
  await lesson(page, 'print("Robo đang học Python")');
  await expect(page.getByText("Xu: 16")).toBeVisible();

  await page.getByRole("link", { name: "Cửa hàng" }).click();
  await expect(page.getByText("Con có 16 xu")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mua Pin sạc nhanh" })).toBeDisabled();
  await page.getByRole("button", { name: "Mua Dầu nhớt" }).click();
  await expect(page.getByText("Con có 1 xu")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Dầu nhớt" })).toContainText("Có 1");
  await page.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }).click();
  await expect(page.getByText("Bố mẹ chưa đặt phần thưởng nào.")).toBeVisible();

  await page.getByRole("link", { name: "Về phòng" }).click();
  await page.getByRole("link", { name: "Sổ thành tích" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Bài học đầu tiên" })).toContainText("Nhận ngày");
});
