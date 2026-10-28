import { expect, test, type Page } from "@playwright/test";
import { startApp } from "./helpers";

/** The page has its h1 and no sideways scroll: nothing is wider than the window. */
async function expectPageFits(page: Page, title: string) {
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, `${title}: the page scrolls sideways`).toBeLessThanOrEqual(innerWidth);
}

/** The 4 pages of R3 one after the other, from the room to the overview of the parent area (after the PIN). */
async function visitPages(page: Page) {
  await startApp(page);

  for (const title of ["Cửa hàng", "Sổ thành tích", "Sao lưu"]) {
    await page.getByRole("link", { name: title, exact: true }).click();
    await expectPageFits(page, title);
  }

  await page.getByRole("link", { name: "Khu phụ huynh" }).click();
  await expectPageFits(page, "Khu phụ huynh");
  await page.getByLabel("Mã PIN").fill("1234");
  await page.getByRole("button", { name: "Mở" }).click();
  await expectPageFits(page, "Tổng quan");
}

// The side menu shrinks to icons below 1100 px and the cards re-flow: at 800 px (a small laptop window) the pages of R3 must still
// fit. The jsdom tests cannot check this, they have no layout.
test("the shop, the achievements, the backup and the parent area fit an 800 px window", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 700 });
  await visitPages(page);
});

// Spec 6.4: below 760 px the content area must not scroll sideways. The tables scroll inside their own box; the progress
// section, which holds the widest table of the parent area, is looked at as well.
test("the same pages fit a 375 px phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await visitPages(page);
  await page.getByRole("tab", { name: "Tiến độ" }).click();
  await expectPageFits(page, "Tiến độ");
});
