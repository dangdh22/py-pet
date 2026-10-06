import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}

async function submitCode(page: Page, code: string) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: "Tiếp" }).click();
}

/** Picks the first choice of the question on screen, checks it, then goes on. */
async function answerFirstChoice(page: Page, last: boolean) {
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }).click();
}

test("after 2 lessons the review station opens, pays and unlocks lesson 3", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, 'print("Xin chào Robo")');
  await answerFirstChoice(page, true);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, 'print("Robo đang học Python")');
  await answerFirstChoice(page, true);

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Trạm ôn" })).toBeVisible();
  // The station holds up to 5 questions of the 2 lessons done; the AI questions now belong to lesson 5, so there are 4.
  const total = Number((await page.getByText(/^Câu 1\/\d+$/).textContent())!.split("/")[1]);
  expect(total).toBeGreaterThanOrEqual(4);
  for (let n = 1; n <= total; n += 1) {
    await expect(page.getByText(`Câu ${n}/${total}`)).toBeVisible();
    await answerFirstChoice(page, n === total);
  }
  await expect(page.getByRole("heading", { name: "Xong trạm ôn!" })).toBeVisible();
  await expect(page.getByText(new RegExp(`^Con đúng [0-${total}]/${total} câu\\.$`))).toBeVisible();
  await expect(page.getByText(/^\+(10|15) xu$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/s1.lam-quen.l3");

  await page.getByRole("button", { name: "Về phòng" }).click();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Trạm ôn" }).first()).toContainText("Đã xong");
  await expect(page.getByRole("listitem").filter({ hasText: "Lệnh chạy từ trên xuống" })).toContainText("Bài tiếp theo");
});

test("the room offers a free review after the first lesson", async ({ page }) => {
  await startApp(page);
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await submitCode(page, 'print("Xin chào Robo")');
  await answerFirstChoice(page, true);
  await page.getByRole("button", { name: "Về phòng" }).click();
  await page.getByRole("link", { name: "Ôn tập" }).click();
  await expect(page.getByRole("heading", { name: "Ôn tập" })).toBeVisible();
  await expect(page.getByText(/^Câu 1\/\d$/)).toBeVisible();
});
