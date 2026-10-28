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

// WCAG 1.4.13: a floating note goes away with Escape while the pointer stays where it is, and shows again for the next place the pointer
// reaches. The jsdom tests cannot check this, they have no cascade and no hover. `toHaveCSS` retries until the computed style settles.
test("Escape hides a map caption until the pointer moves on", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await startApp(page);
  await page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Bản đồ học" }).click();

  // The squares are named "{step}: {status}"; the first 2 of the first topic are enough.
  const squares = page.getByRole("main").getByRole("link", { name: /: (Tiếp theo|Chưa mở|Đã xong)$/ });
  const first = squares.nth(0).locator(".map-node-caption");
  const second = squares.nth(1).locator(".map-node-caption");

  await squares.nth(0).hover();
  await expect(first).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(first).toHaveCSS("opacity", "0");

  await squares.nth(1).hover();
  await expect(second).toHaveCSS("opacity", "1");
});

// Below 1100 px the side menu shows icons only; the text of an item floats beside it while the item has the pointer.
test("Escape hides a side menu label at a narrow window while the pointer stays", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await startApp(page);
  const item = page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Cửa hàng" });
  const label = item.locator(".side-nav-label");

  await item.hover();
  await expect(label).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(label).toHaveCSS("opacity", "0");
});

// The narrow menu is as tall as the window and sticks to it, and it is about 500 px tall by itself (494 px of content). In a window shorter
// than that, its bottom group (the language, the parent area) was out of reach: the page could not scroll it into view. Up to 540 px of
// height the menu scrolls with the page instead. The window is 400 px tall here: at 500 px the menu still fits, so the test would pass
// with or without the rule.
test("a short window still reaches the bottom of the narrow side menu", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 400 });
  await startApp(page);
  const parentArea = page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Khu phụ huynh" });

  await parentArea.scrollIntoViewIfNeeded();
  await expect(parentArea).toBeInViewport();
});
