// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { PracticeScreen } from "./PracticeScreen";

const bundle = reviewBundle();

describe("PracticeScreen", () => {
  test("2 items at the child's level, then a short result", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1"];
    const { store } = await renderWithGame(<PracticeScreen conceptId="c1" onExit={() => {}} />, {
      bundle,
      state,
      runner: fakeRunner(() => okResult("Hi\nBye\n")),
    });
    expect(screen.getByRole("heading", { name: "Luyện tập: Khái niệm c1" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
    expect(screen.getByText("Sắp xếp để in ra Hi rồi Bye")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByRole("heading", { name: "Xong bài luyện!" })).toBeInTheDocument();
    expect(screen.getByText("Con đúng 2/2 câu.")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.mastery.c1?.recent).toEqual([1, 1]));
  });

  test("an unknown concept or a concept without items shows a message", async () => {
    await renderWithGame(<PracticeScreen conceptId="nope" onExit={() => {}} />, { bundle });
    expect(screen.getByText("Không tìm thấy phần luyện tập này.")).toBeInTheDocument();
  });

  test("a concept with nothing learned yet has no items", async () => {
    await renderWithGame(<PracticeScreen conceptId="c1" onExit={() => {}} />, { bundle });
    expect(screen.getByText("Chưa có bài luyện cho phần này. Con học thêm bài nhé!")).toBeInTheDocument();
  });

  test("a wrong answer in a practice set offers no more practice", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1"];
    await renderWithGame(<PracticeScreen conceptId="c1" onExit={() => {}} />, {
      bundle,
      state,
      runner: fakeRunner(() => okResult("Hi\nBye\n")),
    });
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByText("Con đúng 1/2 câu.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Luyện thêm/ })).not.toBeInTheDocument();
  });
});
