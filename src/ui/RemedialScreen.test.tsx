// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { RemedialScreen } from "./RemedialScreen";

const bundle = examBundle();

describe("RemedialScreen", () => {
  test("without a focused review set it says so", async () => {
    await renderWithGame(<RemedialScreen onExit={() => {}} />, { bundle });
    expect(screen.getByText("Con không có bộ ôn tập trọng tâm nào.")).toBeInTheDocument();
  });

  test("finishing the set closes it", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.remedial = { stage: 1, items: ["x.q1", "x.q3"] };
    const { store } = await renderWithGame(<RemedialScreen onExit={() => {}} />, { bundle, state });
    expect(screen.getByRole("heading", { name: "Ôn tập trọng tâm" })).toBeInTheDocument();
    for (const last of [false, true]) {
      await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
      await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
      await userEvent.click(screen.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }));
    }
    expect(screen.getByRole("heading", { name: "Xong ôn tập trọng tâm! Con có thể thi lại." })).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.remedial).toBeNull());
  });
});
