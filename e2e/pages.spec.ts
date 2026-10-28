import { expect, test, type Locator, type Page } from "@playwright/test";
import { finishLessonOne, startApp } from "./helpers";

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

// The parts that `visitPages` does not reach: the backup table (it shows only after the PIN and after 1 import, which leaves the data from
// before it as an automatic backup), the rewards tab of the shop, and the Help, Rewards and Settings tabs of the parent area (the date
// inputs of the vacation, the rows of the rewards). A new profile has no concept that needs help, so the Help tab is only its empty state.
// The imported file has no PIN, so the PIN of this device stays.
test("the backup table, the shop rewards and the parent tabs fit a 375 px phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await startApp(page);

  const unlockBackup = async () => {
    await page.getByLabel("Mã PIN").fill("1234");
    await page.getByRole("button", { name: "Xác nhận" }).click();
  };
  await page.getByRole("link", { name: "Sao lưu", exact: true }).click();
  await unlockBackup();
  await page.getByLabel("Chọn file .pypet").setInputFiles("e2e/fixtures/drained.pypet");
  await expect(page.getByText(/Hồ sơ trong file: Lan, giai đoạn 3/)).toBeVisible();
  // The file picker and the preview of the file are in the cards now.
  await expectPageFits(page, "Sao lưu");
  await page.getByRole("button", { name: "Nhập dữ liệu (thay dữ liệu hiện tại)" }).click();
  await expect(page.getByText("Chào Lan!")).toBeVisible();
  await page.getByRole("link", { name: "Sao lưu", exact: true }).click();
  await unlockBackup();
  await expect(page.getByRole("table")).toBeVisible();
  await expectPageFits(page, "Sao lưu");

  // The tabs of the parent area. A profile starts with a list of rewards, so the rewards tab and the shop have rows.
  await page.getByRole("link", { name: "Khu phụ huynh" }).click();
  await page.getByLabel("Mã PIN").fill("1234");
  await page.getByRole("button", { name: "Mở" }).click();
  await page.getByRole("tab", { name: "Con cần hỗ trợ" }).click();
  await expectPageFits(page, "Con cần hỗ trợ");
  await page.getByRole("tab", { name: "Phần thưởng" }).click();
  await expectPageFits(page, "Phần thưởng");
  await page.getByRole("button", { name: "Thêm phần thưởng" }).click();
  await expectPageFits(page, "Phần thưởng");
  await page.getByRole("tab", { name: "Cài đặt" }).click();
  await expectPageFits(page, "Cài đặt");
  await page.getByRole("button", { name: "Khóa và quay lại" }).click();

  await page.getByRole("link", { name: "Cửa hàng" }).click();
  await page.getByRole("tab", { name: "Phần thưởng từ bố mẹ" }).click();
  await expect(page.getByRole("button", { name: /^Đổi / }).first()).toBeVisible();
  await expectPageFits(page, "Cửa hàng");
});

// A new page opens at its top (the window keeps its scroll position when the hash changes, so it did not). The room is tall on a phone,
// so the page can be scrolled; the window is short, so the "Bắt đầu" button of the welcome is below the fold and Playwright scrolls to it.
test("a new page opens at its top on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 500 });
  await startApp(page);
  expect(await page.evaluate(() => window.scrollY), "the room after the welcome").toBe(0);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  expect(await page.evaluate(() => window.scrollY), "the room is scrolled down").toBeGreaterThan(0);
  await page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Bản đồ học" })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY), "the map after the room").toBe(0);
});

/**
 * The map has 1 tab per stage. For each stage: the page fits, and every square whose caption would reach past the page (in the place the CSS
 * gives it, before the square has the pointer) brings its caption back inside the page when it has the pointer. Returns how many there were.
 */
async function checkMapStages(page: Page): Promise<number> {
  const tabs = page.getByRole("tablist", { name: "Các giai đoạn" }).getByRole("tab");
  let shifted = 0;
  for (let stage = 0; stage < (await tabs.count()); stage += 1) {
    await tabs.nth(stage).click();
    await expectPageFits(page, "Bản đồ học");

    const nodes = page.locator(".map-node");
    const reaching = await nodes.evaluateAll((squares) => {
      const bounds = document.querySelector(".map-page")!.getBoundingClientRect();
      return squares.flatMap((square, index) => {
        const box = square.querySelector(".map-node-caption")!.getBoundingClientRect();
        return box.left < bounds.left || box.right > bounds.right ? [index] : [];
      });
    });
    for (const index of reaching) {
      await nodes.nth(index).hover();
      const inside = await nodes.nth(index).evaluate((square) => {
        const bounds = document.querySelector(".map-page")!.getBoundingClientRect();
        const box = square.querySelector(".map-node-caption")!.getBoundingClientRect();
        return { left: box.left - bounds.left, right: bounds.right - box.right };
      });
      expect(inside.left, `stage ${stage + 1}, square ${index + 1}: the caption is cut at the left`).toBeGreaterThanOrEqual(0);
      expect(inside.right, `stage ${stage + 1}, square ${index + 1}: the caption is cut at the right`).toBeGreaterThanOrEqual(0);
    }
    shifted += reaching.length;
  }
  return shifted;
}

// The captions of the squares are in the layout while they are hidden. The one under the last square of a row reached past the window and
// the page scrolled sideways (spec 6.4): measured 406 to 424 px of width in a 375 px window, 930 px in a 900 px one. The page clips the
// sideways overflow now, and a caption that has the pointer is moved back inside the page, so it is not cut off.
for (const width of [375, 900]) {
  test(`every stage of the map fits a ${width} px window and keeps its captions in the page`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await startApp(page);
    await page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Bản đồ học" }).click();
    await expectPageFits(page, "Bản đồ học");
    const shifted = await checkMapStages(page);
    // A guard against a test that checks nothing: at both widths some caption reaches past the page.
    expect(shifted, "squares whose caption had to be moved").toBeGreaterThan(0);
  });
}

// The focus bar is 1 row of 60 px from 600 px up. Below that it wraps (spec 6.4, WCAG 1.4.10): the title had 0 px of width at 375 px, and
// at 320 px the page scrolled sideways and the Xu chip was cut.
for (const width of [375, 320]) {
  test(`the focus bar of a lesson shows the title and fits a ${width} px window`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await startApp(page);
    await page.getByRole("link", { name: "Học tiếp" }).click();
    const title = page.getByRole("banner").getByRole("heading", { level: 1 });
    await expect(title).toBeVisible();
    expect((await title.boundingBox())?.width ?? 0, "the title has width").toBeGreaterThan(0);
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth, "the lesson scrolls sideways").toBeLessThanOrEqual(innerWidth);
    // Both chips are inside the window, none is cut at the right.
    for (const chip of [page.locator(".focus-chips .chip-pin"), page.locator(".focus-chips .chip-xu")]) {
      const box = await chip.boundingBox();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(innerWidth);
    }
  });
}

test("the focus bar keeps its 1 row of 60 px from 600 px up", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 700 });
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("banner").getByRole("heading", { level: 1 })).toBeVisible();
  expect((await page.getByRole("banner").boundingBox())?.height).toBe(60);
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

/**
 * WCAG 1.4.13, hoverable: the pointer goes from the trigger to its note in small steps, over the gap between them, and the note stays. It is a
 * child of the trigger, so it keeps the hover of the trigger once it takes the pointer, and a strip of the note fills the gap. A note that
 * is hidden takes no pointer, or it would catch the pointer over what lies under it.
 */
async function expectNoteCanBeHovered(page: Page, trigger: Locator, note: Locator) {
  await expect(note).toHaveCSS("pointer-events", "none");
  await trigger.hover();
  await expect(note).toHaveCSS("opacity", "1");
  await expect(note).toHaveCSS("pointer-events", "auto");
  const from = (await trigger.boundingBox())!;
  const to = (await note.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 30 });
  await expect(note).toHaveCSS("opacity", "1");
  // Away from both, it goes and takes no pointer again.
  await page.mouse.move(2, 2);
  await expect(note).toHaveCSS("opacity", "0");
  await expect(note).toHaveCSS("pointer-events", "none");
}

test("the label of a side menu item at a narrow window can be hovered", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await startApp(page);
  const item = page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Cửa hàng" });
  await expectNoteCanBeHovered(page, item, item.locator(".side-nav-label"));
});

test("the caption of a map square can be hovered", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await startApp(page);
  await page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Bản đồ học" }).click();
  const square = page.getByRole("main").getByRole("link", { name: /: (Tiếp theo|Chưa mở|Đã xong)$/ }).nth(1);
  await expectNoteCanBeHovered(page, square, square.locator(".map-node-caption"));
});

// The date note of an earned badge. The first lesson earns the first badge; it needs Pyodide, like the other lesson tests.
test("the date note of a badge can be hovered", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await startApp(page);
  await finishLessonOne(page);
  await page.getByRole("link", { name: "Về phòng" }).click();
  await page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "Sổ thành tích" }).click();
  const badge = page.locator(".ach-badge-earned").first();
  await expectNoteCanBeHovered(page, badge, badge.locator(".ach-badge-day"));
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
