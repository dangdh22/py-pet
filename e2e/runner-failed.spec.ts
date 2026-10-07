import { expect, test } from "@playwright/test";

const WASM = "**/pyodide.asm.wasm";

// A blocked Pyodide download is the common failure at school. Emscripten does not reject loadPyodide for a missing .wasm,
// so worker.ts turns the unhandled rejection into init-failed at once; the test needs no help from the 120 s start
// timeout (which has its own unit test).
test("a Pyodide that cannot download shows the failed panel, and Thử lại starts it", async ({ page }) => {
  await page.route(WASM, (route) => route.abort());

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Chào mừng đến với Py-Pet!" })).toBeVisible();
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();

  const panel = page.getByRole("alert").filter({ hasText: "Robo đang gặp trục trặc khi chạy Python" });
  await expect(panel).toBeVisible();
  await expect(page.getByText("Robo sẵn sàng")).toHaveCount(0);

  // The child can still read the lesson while Python is down.
  await page.getByRole("link", { name: "Học tiếp" }).click();

  await page.unroute(WASM);
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(panel).toBeHidden({ timeout: 60_000 });
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");
});
