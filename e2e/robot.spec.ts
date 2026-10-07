import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByRole("heading", { name: "Phòng của Robo" })).toBeVisible();
}

test("a backup of a drained Robo of form 3 shows the charger, the crown and leads to the review", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Sao lưu" }).click();
  await page.getByLabel("Mã PIN").fill("1234");
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await page.getByLabel("Chọn file .pypet").setInputFiles("e2e/fixtures/drained.pypet");
  await expect(page.getByText(/Hồ sơ trong file: Lan, giai đoạn 3/)).toBeVisible();
  await page.getByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }).click();
  // The page reloads on the room of the imported profile.
  await expect(page.getByText("Chào Lan!")).toBeVisible();

  const robo = page.getByRole("img", { name: "Robo" }).first();
  await expect(robo).toHaveAttribute("data-form", "3");
  await expect(robo).toHaveAttribute("data-mood", "drained");
  await expect(page.locator('[data-part="charger"]')).toBeVisible();
  await expect(robo.locator('[data-accessory="vuong-mien"]')).toHaveCount(1);
  await expect(page.getByText("Pin: 0/5")).toBeVisible();

  await page.getByRole("link", { name: "Sạc cho Robo" }).click();
  await expect(page.getByRole("heading", { name: "Ôn tập" })).toBeVisible();
  await expect(page.getByText(/^Câu 1\/\d$/)).toBeVisible();
});
