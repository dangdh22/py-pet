import { expect, test } from "@playwright/test";
import { startApp } from "./helpers";

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
