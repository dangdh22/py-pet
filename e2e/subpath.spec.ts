import { expect, test, type Page } from "@playwright/test";
import { startApp, waitForPython } from "./helpers";

/**
 * What the self-hosted Lexend looks like to the page once the fonts are settled. "ủ" lives in the Vietnamese face of Lexend, so
 * `vietnamese` proves that face, not only the latin one. `check` is also true when no face is declared for the family at all (the
 * browser would use a fallback), so `loaded` asks for a Lexend face that really arrived.
 */
async function lexendState(page: Page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return {
      latin: document.fonts.check('16px "Lexend"'),
      vietnamese: document.fonts.check('16px "Lexend"', "ủ"),
      loaded: [...document.fonts].some((face) => face.family.replaceAll('"', "") === "Lexend" && face.status === "loaded"),
    };
  });
}

// Runs against dist/ served under /py-pet/ (project "subpath"): a build that used
// absolute asset paths, or a Pyodide/worker URL not relative to the page, fails here.
test("the build works under the /py-pet/ sub-path and runs Python", async ({ page }) => {
  const missing: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) missing.push(`${response.status()} ${response.url()}`);
  });

  await startApp(page);
  await waitForPython(page);

  // The self-hosted fonts load under the sub-path too (a 4xx on a font file is caught by `missing` below).
  expect(await lexendState(page)).toEqual({ latin: true, vietnamese: true, loaded: true });

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");

  // The guide is a static page next to the app: it must open under the sub-path without a 4xx, with its own link to the fonts
  // (it does not go through Vite) and its way back into the app.
  const guide = await page.goto("huong-dan.html");
  expect(guide?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Py-Pet: học Python cùng Robo" })).toBeVisible();
  expect(await lexendState(page)).toEqual({ latin: true, vietnamese: true, loaded: true });
  // The landing page links to this anchor ("Đọc phần dành cho bố mẹ").
  await expect(page.getByRole("heading", { name: "Dành cho bố mẹ" })).toHaveAttribute("id", "bo-me");

  const openApp = page.getByRole("link", { name: "Mở app" });
  await expect(openApp).toHaveAttribute("href", "./");
  await openApp.click();
  // This browser context has a profile now, so the app opens on the room; a fresh one would open on the landing page.
  await expect(
    page.getByRole("heading", { name: "Phòng của Robo" }).or(page.getByRole("button", { name: "Bắt đầu học" })),
  ).toBeVisible();

  expect(page.url()).toContain("/py-pet/");
  expect(missing).toEqual([]);
});
