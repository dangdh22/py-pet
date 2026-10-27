import { expect, test } from "@playwright/test";
import { startApp, waitForPython } from "./helpers";

// Runs against dist/ served under /py-pet/ (project "subpath"): a build that used
// absolute asset paths, or a Pyodide/worker URL not relative to the page, fails here.
test("the build works under the /py-pet/ sub-path and runs Python", async ({ page }) => {
  const missing: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) missing.push(`${response.status()} ${response.url()}`);
  });

  await startApp(page);
  await waitForPython(page);

  // The self-hosted fonts load under the sub-path too (a 4xx on a font file is caught by `missing` below). "ủ" lives in the
  // Vietnamese face of Lexend, so the second check proves that face, not only the latin one. `check` is also true when no face is
  // declared for the family at all (the browser would use a fallback), so `loaded` asks for a Lexend face that really arrived.
  const lexend = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      latin: document.fonts.check('16px "Lexend"'),
      vietnamese: document.fonts.check('16px "Lexend"', "ủ"),
      loaded: [...document.fonts].some((face) => face.family.replaceAll('"', "") === "Lexend" && face.status === "loaded"),
    };
  });
  expect(lexend).toEqual({ latin: true, vietnamese: true, loaded: true });

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");

  // The guide is a static page next to the app: it must open under the sub-path without a 4xx.
  const guide = await page.goto("huong-dan.html");
  expect(guide?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Py-Pet: học Python cùng Robo" })).toBeVisible();

  expect(page.url()).toContain("/py-pet/");
  expect(missing).toEqual([]);
});
