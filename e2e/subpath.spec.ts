import { expect, test } from "@playwright/test";

// Runs against dist/ served under /py-pet/ (project "subpath"): a build that used
// absolute asset paths, or a Pyodide/worker URL not relative to the page, fails here.
test("the build works under the /py-pet/ sub-path and runs Python", async ({ page }) => {
  const missing: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) missing.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");

  expect(page.url()).toContain("/py-pet/");
  expect(missing).toEqual([]);
});
