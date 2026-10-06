import { expect, test, type Page } from "@playwright/test";

async function startApp(page: Page) {
  await page.goto("./");
  await page.getByLabel("Tên của con").fill("An");
  await page.getByLabel("Mã PIN của bố mẹ (4 đến 6 chữ số)").fill("1234");
  await page.getByLabel("Nhập lại mã PIN").fill("1234");
  await page.getByRole("button", { name: "Bắt đầu" }).click();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
}

async function submitCode(page: Page, code: string, last: boolean) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await page.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }).click();
}

/** Picks the first choice of the question on screen, checks it, then goes on. */
async function answerFirstChoice(page: Page, last: boolean) {
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await page.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }).click();
}

async function readCards(page: Page) {
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
}

async function reviewStation(page: Page) {
  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Trạm ôn" })).toBeVisible();
  const total = Number((await page.getByText(/^Câu 1\/\d+$/).textContent())!.split("/")[1]);
  for (let n = 1; n <= total; n += 1) {
    await expect(page.getByText(`Câu ${n}/${total}`)).toBeVisible();
    await answerFirstChoice(page, n === total);
  }
  await expect(page.getByRole("heading", { name: "Xong trạm ôn!" })).toBeVisible();
}

/** Answers every item of the open test: the first choice of each question, the starter code of each exercise. */
async function answerPaper(page: Page) {
  const total = Number((await page.getByText(/^Câu 1\/\d+$/).textContent())!.split("/")[1]);
  for (let n = 1; n <= total; n += 1) {
    await expect(page.getByText(`Câu ${n}/${total}`)).toBeVisible();
    if ((await page.getByRole("radio").count()) > 0) {
      await page.getByRole("radio").first().check();
      await page.getByRole("button", { name: "Chọn đáp án này" }).click();
    } else {
      await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
      await expect(page.getByText("Đã nộp bài. Kết quả hiện ở cuối bài.")).toBeVisible();
    }
    await page.getByRole("button", { name: n === total ? "Nộp bài kiểm tra" : "Tiếp", exact: true }).click();
  }
  return total;
}

test("after the 5 lessons of the topic come the topic test and then the evolution test", async ({ page }) => {
  test.setTimeout(120_000);
  await startApp(page);
  await readCards(page);
  await submitCode(page, 'print("Xin chào Robo")', false);
  await answerFirstChoice(page, true);
  await readCards(page);
  await submitCode(page, 'print("Robo đang học Python")', false);
  await answerFirstChoice(page, true);
  await reviewStation(page);
  await page.getByRole("button", { name: "Về phòng" }).click();
  await readCards(page);
  await submitCode(page, 'print("+-----+")\nprint("| o o |")\nprint("|  -  |")\nprint("+-----+")', false);
  await answerFirstChoice(page, true);
  await readCards(page);
  await answerFirstChoice(page, false);
  await submitCode(page, 'print("Robo")\nprint("đang học")\nprint("Python")', true);
  await reviewStation(page);
  await page.getByRole("button", { name: "Về phòng" }).click();
  await readCards(page);
  await answerFirstChoice(page, false);
  await answerFirstChoice(page, true);

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra chủ đề: Làm quen với chương trình" })).toBeVisible();
  expect(await answerPaper(page)).toBe(10);
  await expect(page.getByRole("heading", { name: "Xong bài kiểm tra!" })).toBeVisible();
  await expect(page.getByText(/^Con được [\d,]+\/14 điểm\./)).toBeVisible();
  await expect(page.getByText("+30 XP")).toBeVisible();

  await page.getByRole("link", { name: "Học tiếp" }).click();
  await expect(page.getByRole("heading", { name: "Kiểm tra tiến hóa" })).toBeVisible();
  await expect(page.getByText(/^Câu 1\/\d+$/)).toBeVisible();
  await page.getByRole("link", { name: "Py-Pet" }).click();
  await page.getByRole("link", { name: "Bản đồ học" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Kiểm tra chủ đề" })).toContainText("Đã xong");
  await expect(page.getByRole("listitem").filter({ hasText: "Kiểm tra tiến hóa" })).toContainText("Bài tiếp theo");
});
