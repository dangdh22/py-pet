import { expect, test } from "@playwright/test";
import { finishLessonOne, startApp } from "./helpers";

test("progress survives a reload", async ({ page }) => {
  await startApp(page);
  await finishLessonOne(page);
  await expect(page.getByText("+28 XP")).toBeVisible();
  await expect(page.getByText("+8 xu")).toBeVisible();
  await page.getByRole("button", { name: "Về phòng" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Phòng của Robo" })).toBeVisible();
  await expect(page.getByText("Mục tiêu hôm nay: 1/2")).toBeVisible();
  await expect(page.getByText("Xu: 8")).toBeVisible();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("link", { name: "Chương trình là gì?: Đã xong" })).toBeVisible();
});

test("a second tab only shows the other-tab message", async ({ page, context }) => {
  await startApp(page);
  const second = await context.newPage();
  await second.goto("./");
  await expect(second.getByText("Py-Pet đang mở ở tab khác. Con dùng tab đó nhé.")).toBeVisible();
});

test("exports a backup and imports it on another device", async ({ page, browser }, testInfo) => {
  await startApp(page, "An", "1234");
  await page.getByRole("link", { name: "Sao lưu" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất file sao lưu" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^py-pet-an-\d{4}-\d{2}-\d{2}\.pypet$/);
  const file = testInfo.outputPath("backup.pypet");
  await download.saveAs(file);

  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  await startApp(other, "Bình", "5678");
  await expect(other.getByText("Chào Bình!")).toBeVisible();
  await other.getByRole("link", { name: "Sao lưu" }).click();
  await other.getByLabel("Mã PIN").fill("5678");
  await other.getByRole("button", { name: "Xác nhận" }).click();
  await other.getByLabel("Chọn file .pypet").setInputFiles(file);
  await expect(other.getByText(/Hồ sơ trong file: An, giai đoạn 1/)).toBeVisible();
  await other.getByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }).click();
  // The page reloads on the room.
  await expect(other.getByText("Chào An!")).toBeVisible();
  await otherContext.close();
});
