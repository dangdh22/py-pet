// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { MemoryStore } from "../storage/memoryStore";
import { renderWithGame, testProfile, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { ParentHelp } from "./ParentHelp";

const bundle = reviewBundle();
bundle.stages[0]!.topics[0]!.concepts[0]!.parentTip = "Cùng con đọc to từng dòng code.";

function helpState() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["r.l1", "r.l2"];
  state.mastery = {
    c1: { ...emptyMastery(), score: 32.4, needsHelp: true, misconceptions: 3, recent: [1, 0, 0, 0], level: 2 },
    c2: { ...emptyMastery(), score: 55 },
  };
  return state;
}

describe("ParentHelp", () => {
  test("nothing flagged", async () => {
    await renderWithGame(<ParentHelp />, { bundle });
    expect(screen.getByText("Hiện không có khái niệm nào cần hỗ trợ.")).toBeInTheDocument();
  });

  test("a flagged concept: numbers, real work, tip, practice and coached", async () => {
    const store = new MemoryStore({ persistent: true });
    const state = helpState();
    await store.createProfile(testProfile(), state);
    await store.saveState("p1", state, {
      profileId: "p1",
      itemId: "r.q1",
      at: "2026-10-05T03:00:00.000Z",
      kind: "choice",
      choiceIndex: 1,
      correct: false,
      lang: "vi",
    });
    await store.saveState("p1", state, {
      profileId: "p1",
      itemId: "r.l1.ex1",
      at: "2026-10-05T04:00:00.000Z",
      kind: "code",
      code: 'print("Hi"',
      status: "error",
      passedCount: 0,
      total: 2,
      misconceptions: [],
    });
    await renderWithGame(<ParentHelp newId={() => "p-1"} rng={seededRng(1)} />, { bundle, state, store });
    const card = screen.getByRole("heading", { name: "Khái niệm c1" }).closest("article") as HTMLElement;
    expect(within(card).getByText("Điểm thành thạo: 32")).toBeInTheDocument();
    expect(within(card).getByText("Tỷ lệ đúng gần đây: 25%")).toBeInTheDocument();
    expect(within(card).getByText("Hiểu lầm gặp: 3 lần")).toBeInTheDocument();
    expect(within(card).getByText("Mức bậc thang: 2")).toBeInTheDocument();
    expect(await within(card).findByText(/: qua 0\/2 test$/)).toBeInTheDocument();
    expect(within(card).getByText('print("Hi"')).toBeInTheDocument();
    expect(within(card).getByText(/: chọn "Sai" \(sai\)$/)).toBeInTheDocument();
    expect(within(card).getByText("Cùng con đọc to từng dòng code.")).toBeInTheDocument();
    await userEvent.click(within(card).getByRole("button", { name: "Giao thêm bài luyện" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã giao bài luyện. Con sẽ thấy ở nút Học tiếp.");
    await waitFor(async () => expect((await store.loadActive())!.state.assigned).toMatchObject([{ id: "p-1", conceptId: "c1" }]));
    await userEvent.click(within(card).getByRole("button", { name: "Đánh dấu đã kèm con" }));
    await waitFor(async () => expect((await store.loadActive())!.state.mastery.c1!.needsHelp).toBe(false));
    expect(screen.getByText("Khái niệm c2: 55 điểm")).toBeInTheDocument();
  });

  test("a concept already assigned stays assigned after the card is shown again", async () => {
    const state = helpState();
    state.assigned = [{ id: "p-1", conceptId: "c1", items: ["r.q1"], day: TODAY }];
    await renderWithGame(<ParentHelp newId={() => "p-2"} rng={seededRng(1)} />, { bundle, state });
    const card = screen.getByRole("heading", { name: "Khái niệm c1" }).closest("article") as HTMLElement;
    expect(within(card).getByRole("button", { name: "Giao thêm bài luyện" })).toBeDisabled();
    expect(within(card).getByRole("status")).toHaveTextContent("Đã giao bài luyện.");
  });
});
