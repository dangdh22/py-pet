import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page, name = "An", pin = "1234") {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill(name);
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill(pin);
  await page.getByLabel("Nhập lại mã PIN").fill(pin);
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByRole("heading", { name: "Phòng của Robo" })).toBeVisible();
}

async function finishLessonOne(page: Page) {
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type('print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("radio", { name: 'print("Hello")', exact: true }).check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: "Hoàn thành" }).click();
}

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
  await expect(page.getByRole("listitem").filter({ hasText: "Chương trình là gì?" })).toContainText("Đã xong");
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
  // The page reloads on the same #/backup route, so go back to the room.
  await other.getByRole("link", { name: "Về phòng" }).click();
  await expect(other.getByText("Chào An!")).toBeVisible();
  await otherContext.close();
});
