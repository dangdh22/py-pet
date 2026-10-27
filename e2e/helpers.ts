import { expect, type Page } from "@playwright/test";

/**
 * Creates a profile the way a child does: the landing page, then the 4 steps of the welcome (language, the child's name,
 * the robot's name, the parents' PIN). Ends on the room; it does not wait for Python (see `waitForPython`).
 */
export async function startApp(page: Page, name = "An", pin = "1234"): Promise<void> {
  await page.goto("./");
  await page.getByRole("main").getByRole("button", { name: "Bắt đầu học" }).click();
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();

  await expect(page.getByText("Bước 1/4")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp", exact: true }).click();

  await expect(page.getByText("Bước 2/4")).toBeVisible();
  await page.getByLabel("Tên của con").fill(name);
  await page.getByRole("button", { name: "Tiếp", exact: true }).click();

  // The robot keeps its default name.
  await expect(page.getByText("Bước 3/4")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp", exact: true }).click();

  await expect(page.getByText("Bước 4/4")).toBeVisible();
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill(pin);
  await page.getByLabel("Nhập lại mã PIN").fill(pin);
  await page.getByRole("button", { name: "Bắt đầu", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Phòng của Robo" })).toBeVisible();
}

/** Waits until Pyodide has started: the status text of the side menu or of the top bar. */
export async function waitForPython(page: Page): Promise<void> {
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}
