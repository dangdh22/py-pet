// @vitest-environment jsdom
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { hashPin } from "../storage/pin";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { LOCK_AFTER_MS, ParentScreen } from "./ParentScreen";

afterEach(() => {
  vi.useRealTimers();
});

async function openWith(pin: string) {
  await userEvent.type(screen.getByLabelText("Mã PIN"), pin);
  await userEvent.click(screen.getByRole("button", { name: "Mở" }));
}

describe("ParentScreen gate", () => {
  test("a wrong PIN keeps it locked; the right one opens it", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("9999");
    expect(await screen.findByRole("alert")).toHaveTextContent("Mã PIN chưa đúng.");
    await userEvent.clear(screen.getByLabelText("Mã PIN"));
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Khóa" }));
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

  test("locks itself after 5 minutes without use", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("1234");
    expect(await screen.findByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(LOCK_AFTER_MS + 10_000);
    });
    expect(screen.getByText("Khu phụ huynh đã tự khóa sau 5 phút không dùng.")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã PIN")).toBeInTheDocument();
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
