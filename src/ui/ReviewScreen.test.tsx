// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { ReviewScreen } from "./ReviewScreen";

const bundle = reviewBundle();

function stateWith(lessons: string[]) {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = lessons;
  return state;
}

/** Answers the current question with the given choice, then goes on. */
async function answer(choice: "Đúng" | "Sai", last = false) {
  await userEvent.click(screen.getByRole("radio", { name: choice }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: last ? "Hoàn thành" : "Tiếp" }));
}

describe("ReviewScreen", () => {
  test("a station: 5 questions, explanations at once, then the rewards and the next lesson", async () => {
    const { store } = await renderWithGame(<ReviewScreen stationId="r.r1" onExit={() => {}} rng={seededRng(1)} />, {
      bundle,
      state: stateWith(["r.l1", "r.l2"]),
    });
    expect(screen.getByRole("heading", { name: "Trạm ôn" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(screen.getByText("Giải thích.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
    for (let n = 2; n <= 4; n += 1) await answer("Đúng");
    await answer("Đúng", true);

    expect(screen.getByRole("heading", { name: "Xong trạm ôn!" })).toBeInTheDocument();
    expect(screen.getByText("Con đúng 4/5 câu.")).toBeInTheDocument();
    expect(screen.getByText("+13 XP")).toBeInTheDocument();
    expect(screen.getByText("+10 xu")).toBeInTheDocument();
    expect(screen.getByText("Pin +1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/r.l3");
    expect(screen.getAllByRole("link", { name: /^Luyện thêm: Khái niệm c[12]$/ })).toHaveLength(1);
    await waitFor(async () => expect((await store.loadActive())?.state.progress.completedReviews).toEqual(["r.r1"]));
    expect(Object.keys((await store.loadActive())!.state.reviews)).toHaveLength(5);
  });

  test("a free review does not open without anything to review", async () => {
    await renderWithGame(<ReviewScreen stationId={null} onExit={() => {}} />, { bundle });
    expect(screen.getByText("Chưa có câu nào để ôn. Con học thêm bài nhé!")).toBeInTheDocument();
  });

  test("a free review charges the robot and pays no xu", async () => {
    const state = stateWith(["r.l1"]);
    state.pet.pin = 0;
    const onExit = vi.fn();
    const { store } = await renderWithGame(<ReviewScreen stationId={null} onExit={onExit} rng={seededRng(2)} />, {
      bundle,
      state,
    });
    expect(screen.getByRole("heading", { name: "Ôn tập" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/3")).toBeInTheDocument();
    await answer("Đúng");
    await answer("Đúng");
    await answer("Đúng", true);
    expect(screen.getByRole("heading", { name: "Xong lượt ôn tập!" })).toBeInTheDocument();
    expect(screen.getByText("Pin +2")).toBeInTheDocument();
    expect(screen.queryByText(/xu$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Luyện thêm/ })).not.toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())?.state.pet.pin).toBe(2));
    expect((await store.loadActive())!.state.progress.completedReviews).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Về phòng" }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  test("a station with nothing to ask can still be finished", async () => {
    const empty = reviewBundle();
    empty.stages[0]!.topics[0]!.questions = [];
    empty.stages[0]!.topics[0]!.practice = [];
    empty.stages[0]!.topics[0]!.lessons[0]!.exercises = [];
    await renderWithGame(<ReviewScreen stationId="r.r1" onExit={() => {}} />, {
      bundle: empty,
      state: stateWith(["r.l1", "r.l2"]),
    });
    expect(screen.getByText("Chưa có câu nào để ôn. Con học thêm bài nhé!")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByText("Con đúng 0/0 câu.")).toBeInTheDocument();
  });
});
