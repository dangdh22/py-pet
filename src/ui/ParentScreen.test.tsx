// @vitest-environment jsdom
import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useState } from "react";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { hashPin } from "../storage/pin";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { LOCK_AFTER_MS, ParentScreen } from "./ParentScreen";

// One tab that always crashes, to check that the parent frame survives it.
vi.mock("./ParentProgress", () => ({
  ParentProgress: (): never => {
    throw new Error("boom");
  },
}));

beforeEach(() => {
  window.location.hash = "";
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function openWith(pin: string) {
  await userEvent.type(screen.getByLabelText("Mã PIN"), pin);
  await userEvent.click(screen.getByRole("button", { name: "Mở" }));
}

/** Wrapper component that triggers re-renders within provider context. */
function ParentScreenWrapper() {
  const [, setRenderCount] = useState(0);
  return (
    <>
      <ParentScreen key="parent" />
      <button
        onClick={() => setRenderCount((c) => c + 1)}
        style={{ display: "none" }}
        data-testid="force-rerender"
      >
        Force Rerender
      </button>
    </>
  );
}

describe("ParentScreen gate", () => {
  test("a wrong PIN keeps it locked; the right one opens it", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("9999");
    expect(await screen.findByRole("alert")).toHaveTextContent("Mã PIN chưa đúng.");
    await userEvent.clear(screen.getByLabelText("Mã PIN"));
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Khóa và quay lại" }));
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
  });

  test("a forgotten PIN is reset, and the area then shows when", async () => {
    const { store } = await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await userEvent.click(screen.getByRole("button", { name: "Quên mã PIN?" }));
    await userEvent.type(screen.getByLabelText("Mã PIN mới (4 đến 6 chữ số)"), "12");
    await userEvent.click(screen.getByRole("button", { name: "Đặt mã PIN mới" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Mã PIN phải gồm 4 đến 6 chữ số.");
    await userEvent.type(screen.getByLabelText("Mã PIN mới (4 đến 6 chữ số)"), "34");
    await userEvent.type(screen.getByLabelText("Nhập lại mã PIN mới"), "1234");
    await userEvent.click(screen.getByRole("button", { name: "Đặt mã PIN mới" }));
    expect(await screen.findByText(/^Mã PIN đã được đặt lại lúc 2026-10-06 09:00\.$/)).toBeInTheDocument();
    expect((await store.readMeta()).pinResetAt).toBe(FIXED_NOW.toISOString());
  });

  test("the reset form can cancel and go back to the PIN form", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await userEvent.click(screen.getByRole("button", { name: "Quên mã PIN?" }));
    expect(screen.getByLabelText("Mã PIN mới (4 đến 6 chữ số)")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
  });

  test("locks itself after 5 minutes without use", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    // After 4 min 10s, it should not be locked yet
    await act(async () => {
      vi.advanceTimersByTime(4 * 60_000 + 10_000);
    });
    expect(screen.queryByText("Khu phụ huynh đã tự khóa sau 5 phút không dùng.")).not.toBeInTheDocument();
    // Advance 2 more minutes (now at 6 min 10s, past the 5 min threshold)
    await act(async () => {
      vi.advanceTimersByTime(2 * 60_000);
    });
    // Now it should be locked
    expect(screen.getByText("Khu phụ huynh đã tự khóa sau 5 phút không dùng.")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
    // The parent tabs are gone; the side menu of the child's pages is back.
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu chính" })).toBeInTheDocument();
  });

  test("the auto-lock clock survives a re-render", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderWithGame(<ParentScreenWrapper />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    // Advance close to the lock threshold (5 min - 1 min = 4 min, plus 10s check interval)
    await act(async () => {
      vi.advanceTimersByTime(LOCK_AFTER_MS - 60_000 + 10_000);
    });
    expect(screen.queryByText("Khu phụ huynh đã tự khóa sau 5 phút không dùng.")).not.toBeInTheDocument();
    // Force a re-render of ParentScreen (simulates game state change like DayRollover)
    // This creates a new onLock callback, which would have reset the effect with the old code
    fireEvent.click(screen.getByTestId("force-rerender"));
    // Advance 2 more minutes (past the 5 min threshold)
    await act(async () => {
      vi.advanceTimersByTime(2 * 60_000);
    });
    // The auto-lock should have triggered despite the re-render
    expect(screen.getByText("Khu phụ huynh đã tự khóa sau 5 phút không dùng.")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
  });
});

describe("ParentScreen frame", () => {
  async function openArea(options: Parameters<typeof renderWithGame>[1] = {}) {
    await renderWithGame(<ParentScreen />, { ...options, meta: { pin: await hashPin("1234", 1000), ...options.meta } });
    await openWith("1234");
    return screen.findByRole("tablist");
  }

  test("the gate has the child's side menu and no way back link of its own", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    expect(screen.getByRole("navigation", { name: "Menu chính" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Về phòng" })).not.toBeInTheDocument();
  });

  test("the right PIN turns the side menu into 5 vertical tabs", async () => {
    const tablist = await openArea();
    expect(tablist).toHaveAttribute("aria-orientation", "vertical");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Tổng quan", "Con cần hỗ trợ", "Tiến độ", "Phần thưởng", "Cài đặt"]);
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 1, name: "Tổng quan" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Khu phụ huynh" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Menu chính" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Về phòng" })).not.toBeInTheDocument();
    // Nothing to count: no number in any tab.
    expect(within(tablist).queryByText("0")).not.toBeInTheDocument();
  });

  test("a tab shows its panel, and the panel and the heading take its name", async () => {
    await openArea();
    await userEvent.click(screen.getByRole("tab", { name: "Cài đặt" }));
    expect(screen.getByRole("tab", { name: "Cài đặt" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("heading", { level: 1, name: "Cài đặt" })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Cài đặt" })).toHaveAttribute("id", "parent-panel");
  });

  test("the tabs of requests and of concepts that need help show their count, and keep their name", async () => {
    const state = initialGameState(TODAY);
    state.mastery = { k1: { ...emptyMastery(), needsHelp: true } };
    state.rewards.requests = [
      { id: "q", rewardId: "r", name: "Kem", price: 30, at: FIXED_NOW.toISOString(), status: "pending", decidedAt: null },
    ];
    await openArea({ state });
    const rewards = screen.getByRole("tab", { name: "Phần thưởng" });
    const help = screen.getByRole("tab", { name: "Con cần hỗ trợ" });
    expect(within(rewards).getByText("1")).toBeInTheDocument();
    expect(within(help).getByText("1")).toBeInTheDocument();
    expect(within(screen.getByRole("tab", { name: "Tiến độ" })).queryByText(/\d/)).not.toBeInTheDocument();
  });

  test("Lock and go back locks the area and goes to the room", async () => {
    window.location.hash = "#/parent";
    await openArea();
    expect(screen.getByText("Tự khóa sau 5 phút không dùng")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Khóa và quay lại" }));
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(window.location.hash).toBe("#/");
  });

  test("a tab that crashes keeps the parent side menu; another tab recovers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await openArea();
    await userEvent.click(screen.getByRole("tab", { name: "Tiến độ" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    expect(screen.getByRole("navigation", { name: "Khu phụ huynh" })).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Tổng quan" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Không có cảnh báo.")).toBeInTheDocument();
  });
});

describe("ParentOverview", () => {
  test("alerts, study minutes, stage, week plan, streak and xu", async () => {
    const state = initialGameState(TODAY);
    state.wallet.xu = 70;
    state.wallet.history = [{ day: TODAY, delta: 140, reason: "code", ref: "e" }];
    state.activity.seconds = { [TODAY]: 900 };
    state.vacation.ranges = [{ start: "2026-10-03", end: "2026-10-04" }];
    state.mastery = { k1: { ...emptyMastery(), needsHelp: true } };
    state.rewards.requests = [
      { id: "q", rewardId: "r", name: "Kem", price: 30, at: FIXED_NOW.toISOString(), status: "pending", decidedAt: null },
    ];
    state.warnings = [{ at: FIXED_NOW.toISOString(), kind: "clock-rollback" }];
    await renderWithGame(<ParentScreen />, { state, meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() } });
    await openWith("1234");
    expect(await screen.findByText("1 yêu cầu đổi thưởng chờ duyệt")).toBeInTheDocument();
    expect(screen.getByText("1 khái niệm con cần hỗ trợ")).toBeInTheDocument();
    expect(screen.getByText("Đồng hồ máy bị chỉnh lùi 1 lần")).toBeInTheDocument();
    expect(screen.getByText("2026-10-06: 15 phút")).toBeInTheDocument();
    expect(screen.getByText("2026-10-03: nghỉ")).toBeInTheDocument();
    expect(screen.getByText("Giai đoạn 1: Giai đoạn thử")).toBeInTheDocument();
    expect(screen.getByText("Xu: 70, trung bình 10 xu/ngày (14 ngày)")).toBeInTheDocument();
  });

  test("no alerts", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() } });
    await openWith("1234");
    expect(await screen.findByText("Không có cảnh báo.")).toBeInTheDocument();
  });
});
