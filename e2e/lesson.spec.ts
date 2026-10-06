import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
}

async function openFirstExercise(page: Page) {
  await startApp(page);
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await expect(page.getByText("Bài tập 1/2")).toBeVisible();
}

async function typeCode(page: Page, code: string) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
}

test("runs an example on a card with real Pyodide", async ({ page }) => {
  await startApp(page);
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");
});

test("submits a correct answer to the first exercise", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, 'print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tiếp" })).toBeEnabled();
});

test("explains an error in Vietnamese and marks the line", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, "print(Robo)");
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByText('Dòng 1: Python không biết "Robo" là gì.', { exact: false })).toBeVisible();
  await expect(page.locator(".cm-error-line")).toHaveCount(1);
  await expect(page.getByText("Xem lỗi gốc")).toBeVisible();
});

test("stops an endless loop and stays usable", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, "while True:\npass");
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByText("Code chạy lâu quá nên Robo đã dừng lại.", { exact: false })).toBeVisible();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await typeCode(page, 'print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
});

test("switches the interface to English", async ({ page }) => {
  await openFirstExercise(page);
  await page.getByRole("group", { name: "Ngôn ngữ giao diện" }).getByRole("button", { name: "EN" }).click();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByText("Write a program that prints this text: Xin chào Robo")).toBeVisible();
});
