// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { AssignedPracticeScreen } from "./AssignedPracticeScreen";

const bundle = examBundle();

describe("AssignedPracticeScreen", () => {
  test("an unknown id says so", async () => {
    await renderWithGame(<AssignedPracticeScreen id="nope" onExit={() => {}} />, { bundle });
    expect(screen.getByText("Không tìm thấy bài luyện này.")).toBeInTheDocument();
  });

  test("finishing the practice removes it", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1"];
    state.assigned = [{ id: "p1", conceptId: "k1", items: ["x.q1"], day: TODAY }];
    const { store } = await renderWithGame(<AssignedPracticeScreen id="p1" onExit={() => {}} />, { bundle, state });
    expect(screen.getByRole("heading", { name: "Bài luyện bố mẹ giao: Khái niệm k1" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByRole("heading", { name: "Xong bài luyện bố mẹ giao!" })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.assigned).toEqual([]));
  });
});
