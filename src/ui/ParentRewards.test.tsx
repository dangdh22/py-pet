// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { ParentRewards } from "./ParentRewards";

const at = FIXED_NOW.toISOString();

function stateWithRequests() {
  const state = initialGameState(TODAY);
  state.wallet.xu = 60;
  state.wallet.history = [{ day: TODAY, delta: 140, reason: "code", ref: "e" }];
  state.rewards.catalog = [{ id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 }];
  state.rewards.requests = [
    { id: "q1", rewardId: "ice", name: "Kem", price: 30, at, status: "pending", decidedAt: null },
    { id: "q2", rewardId: "park", name: "Đi công viên", price: 100, at, status: "pending", decidedAt: null },
    { id: "q0", rewardId: "ice", name: "Kem", price: 30, at, status: "rejected", decidedAt: at },
  ];
  return state;
}

describe("ParentRewards", () => {
  test("approves a request the child can pay and rejects another", async () => {
    const { store } = await renderWithGame(<ParentRewards />, { state: stateWithRequests() });
    expect(screen.getByRole("button", { name: "Duyệt Đi công viên" })).toBeDisabled();
    expect(screen.getByText("Con chưa đủ xu (đang có 60 xu)")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Duyệt Kem" }));
    await userEvent.click(screen.getByRole("button", { name: "Từ chối Đi công viên" }));
    expect(screen.getByText("Không có yêu cầu nào.")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.wallet.xu).toBe(30));
    expect(screen.getByText(/: Kem \(30 xu\), đã duyệt$/)).toBeInTheDocument();
    expect(screen.getByText(/: Đi công viên \(100 xu\), đã từ chối$/)).toBeInTheDocument();
    expect(screen.getByText("Con kiếm trung bình 10 xu/ngày trong 14 ngày qua.")).toBeInTheDocument();
  });

  test("edits and saves the reward list", async () => {
    const { store } = await renderWithGame(<ParentRewards newId={() => "new"} />, { state: stateWithRequests() });
    await userEvent.click(screen.getByRole("button", { name: "Thêm phần thưởng" }));
    const rows = screen.getAllByRole("listitem").filter((li) => li.closest("ol"));
    const fresh = rows.at(-1) as HTMLElement;
    await userEvent.type(within(fresh).getByLabelText("Tên"), "Đọc truyện");
    await userEvent.clear(within(fresh).getByLabelText("Giá (xu)"));
    await userEvent.type(within(fresh).getByLabelText("Giá (xu)"), "40");
    await userEvent.click(within(rows[0] as HTMLElement).getByRole("button", { name: "Xóa" }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu danh sách" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã lưu danh sách.");
    await waitFor(async () =>
      expect((await store.loadActive())!.state.rewards.catalog).toEqual([
        { id: "new", name: "Đọc truyện", price: 40, weeklyLimit: 1 },
      ]),
    );
  });

  test("shows cleaned values after save (clamped price, removed blank rows)", async () => {
    const { store } = await renderWithGame(<ParentRewards newId={() => "new"} />, { state: stateWithRequests() });
    await userEvent.click(screen.getByRole("button", { name: "Thêm phần thưởng" }));
    const rows = screen.getAllByRole("listitem").filter((li) => li.closest("ol"));
    const fresh = rows.at(-1) as HTMLElement;
    await userEvent.type(within(fresh).getByLabelText("Tên"), "Xe đạp");
    await userEvent.clear(within(fresh).getByLabelText("Giá (xu)"));
    await userEvent.type(within(fresh).getByLabelText("Giá (xu)"), "150000");
    await userEvent.click(screen.getByRole("button", { name: "Thêm phần thưởng" }));
    const allRows = screen.getAllByRole("listitem").filter((li) => li.closest("ol"));
    const blankRow = allRows.at(-1) as HTMLElement;
    await userEvent.clear(within(blankRow).getByLabelText("Giá (xu)"));
    await userEvent.type(within(blankRow).getByLabelText("Giá (xu)"), "20");
    await userEvent.click(screen.getByRole("button", { name: "Lưu danh sách" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã lưu danh sách.");
    const priceInput = within(allRows[1] as HTMLElement).getByLabelText("Giá (xu)") as HTMLInputElement;
    expect(priceInput.value).toBe("100000");
    await waitFor(async () =>
      expect((await store.loadActive())!.state.rewards.catalog).toEqual([
        { id: "park", name: "Đi công viên", price: 100, weeklyLimit: 1 },
        { id: "new", name: "Xe đạp", price: 100000, weeklyLimit: 1 },
      ]),
    );
    const finalRows = screen.getAllByRole("listitem").filter((li) => li.closest("ol"));
    expect(finalRows).toHaveLength(2);
  });
});
