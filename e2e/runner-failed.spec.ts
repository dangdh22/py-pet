import { expect, test } from "@playwright/test";
import { startApp } from "./helpers";

const WASM = "**/pyodide.asm.wasm";

// A blocked Pyodide download is the common failure at school. Emscripten does not reject loadPyodide for a missing .wasm,
// so worker.ts turns the unhandled rejection into init-failed at once; the test needs no help from the 120 s start
// timeout (which has its own unit test).
test("a Pyodide that cannot download shows the failed panel, and Thử lại starts it", async ({ page }) => {
  await page.route(WASM, (route) => route.abort());

  await startApp(page);

  const panel = page.getByRole("alert").filter({ hasText: "Robo chưa khởi động được" });
  await expect(panel).toBeVisible();
  await expect(page.getByText("Robo sẵn sàng")).toHaveCount(0);

  // The child can still read the lesson while Python is down. The route change is asynchronous and the room shows the same
  // panel, so first wait for what only the focus frame of the lesson has: the lesson URL and the "Về phòng" link of its top bar.
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page).toHaveURL(/#\/lesson\//);
  await expect(page.getByRole("link", { name: "Về phòng" })).toBeVisible();
  await expect(panel).toBeVisible();
  const retry = panel.getByRole("button", { name: "Thử lại" });
  await expect(retry).toBeVisible();

  await page.unroute(WASM);
  await retry.click();
  await expect(panel).toBeHidden({ timeout: 60_000 });
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");
});
