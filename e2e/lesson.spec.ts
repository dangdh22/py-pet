import { expect, test, type Page } from "@playwright/test";
import { startApp, waitForPython } from "./helpers";

async function openFirstExercise(page: Page) {
  await startApp(page);
  await waitForPython(page);
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
  await waitForPython(page);
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
  // The error line has a 4 px left bar in --coral, drawn with an inset box-shadow (jsdom has no computed styles).
  const shadow = await page.locator(".cm-error-line").evaluate((line) => getComputedStyle(line).boxShadow);
  expect(shadow).toContain("rgb(255, 107, 107)");
  await expect(page.locator(".code-editor-tab")).toContainText("main.py");
  await expect(page.getByText("Xem lỗi gốc")).toBeVisible();
  // The long explanation must not squash Robo in the flex row (jsdom cannot see this).
  const robo = page.locator(".robot-bubble").getByRole("img", { name: "Robo" });
  expect((await robo.boundingBox())?.width).toBe(56);
});

test("stops an endless loop and stays usable", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, "while True:\npass");
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByText("Code chạy lâu quá nên Robo đã dừng lại.", { exact: false })).toBeVisible();
  await waitForPython(page);
  await typeCode(page, 'print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
});

test("switches the interface to English", async ({ page }) => {
  await startApp(page);
  // The language switch is in the side menu of the room; the study screens have no side menu.
  await page.getByRole("group", { name: "Ngôn ngữ giao diện" }).getByRole("button", { name: "EN" }).click();
  await page.getByRole("link", { name: "Continue learning" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByText("Write a program that prints this text: Xin chào Robo")).toBeVisible();
});

test("keeps the title and the chips inside the 60 px focus bar at 800 px", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 700 });
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toBeVisible();

  const bar = await page.locator(".focus-bar").boundingBox();
  expect(bar?.height).toBe(60);
  const chip = page.locator(".focus-bar").getByText("Xu: 0");
  await expect(chip).toBeVisible();
  for (const part of [await title.boundingBox(), await chip.boundingBox()]) {
    expect(part).not.toBeNull();
    expect(part!.y).toBeGreaterThanOrEqual(bar!.y);
    expect(part!.y + part!.height).toBeLessThanOrEqual(bar!.y + bar!.height);
    expect(part!.x + part!.width).toBeLessThanOrEqual(800);
  }
  // Nothing pushes the page wider than the window.
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
});
