// @vitest-environment jsdom
import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useState } from "react";
import { emptyMastery } from "../game/mastery";
import { initialGameState, type GameState } from "../game/state";
import { hashPin } from "../storage/pin";
import { testBundle } from "../test/fixtures";
import { FIXED_NOW, renderWithGame, TODAY } from "../test/renderGame";
import { AppRoutes } from "./AppRoutes";
import { LOCK_AFTER_MS, ParentScreen } from "./ParentScreen";

// One tab that always crashes, to check that the parent frame survives it.
vi.mock("./ParentProgress", () => ({
  ParentProgress: (): never => {
    throw new Error("boom");
  },
}));

// The PIN gate is the only screen that shows this text. While the flag is on, the gate throws as it renders.
const gateCrash = vi.hoisted(() => ({ on: false }));
vi.mock("../i18n/translate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../i18n/translate")>();
  return {
    ...actual,
    translate: (...args: Parameters<typeof actual.translate>) => {
      if (gateCrash.on && args[1] === "parent.pinPrompt") throw new Error("boom");
      return actual.translate(...args);
    },
  };
});

// The side menu counts the concepts that need help. While the flag is on, that count throws (so does the tab that lists them).
const countCrash = vi.hoisted(() => ({ on: false }));
vi.mock("../game/parentStats", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../game/parentStats")>();
  return {
    ...actual,
    conceptsNeedingHelp: (...args: Parameters<typeof actual.conceptsNeedingHelp>) => {
      if (countCrash.on) throw new Error("boom");
      return actual.conceptsNeedingHelp(...args);
    },
  };
});

beforeEach(() => {
  window.location.hash = "";
  gateCrash.on = false;
  countCrash.on = false;
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
  });

  test("the PIN card: the title in the card, the field in a pin form, and Forgot as a link-like button", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    const heading = screen.getByRole("heading", { level: 1, name: "Khu phụ huynh" });
    expect(heading.closest(".gate-card")).not.toBeNull();
    expect(screen.getByLabelText("Mã PIN").closest("form")).toHaveClass("pin-form");
    expect(screen.getByRole("button", { name: "Quên mã PIN?" })).toHaveClass("link-button");
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

  test("the tab list has a name, only the chosen tab is in the tab order, and the head names the child", async () => {
    const tablist = await openArea();
    expect(tablist).toHaveAccessibleName("Các mục của khu phụ huynh");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1, -1]);
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("An", { selector: "b" }).parentElement).toHaveTextContent("Hồ sơ của An");
  });

  test("the arrow keys move to the tab above or below and show it; Home and End go to the ends", async () => {
    await openArea();
    act(() => screen.getByRole("tab", { name: "Tổng quan" }).focus());
    await userEvent.keyboard("{ArrowDown}");
    const help = screen.getByRole("tab", { name: "Con cần hỗ trợ" });
    expect(help).toHaveAttribute("aria-selected", "true");
    expect(help).toHaveFocus();
    expect(help).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("heading", { level: 1, name: "Con cần hỗ trợ" })).toBeInTheDocument();
    // Up from the first tab wraps to the last one.
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("tab", { name: "Cài đặt" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Cài đặt" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Cài đặt" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Cài đặt" })).toHaveFocus();
    // The keys of a row of tabs are left alone: in a column they do nothing.
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Cài đặt" })).toHaveAttribute("aria-selected", "true");
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

  test("Lock and go back only changes the route: the PIN form does not flash before the room", async () => {
    window.location.hash = "#/parent";
    await openArea();
    expect(screen.getByText("Tự khóa sau 5 phút không dùng")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Khóa và quay lại" }));
    expect(window.location.hash).toBe("#/");
    // This screen alone does not follow the route; leaving it is what locks the area, so the form must not appear in between.
    expect(screen.queryByLabelText("Mã PIN")).not.toBeInTheDocument();
  });

  test("Lock and go back leaves for the room, and the area is locked when the parent returns", async () => {
    window.location.hash = "#/parent";
    await renderWithGame(<AppRoutes />, { meta: { pin: await hashPin("1234", 1000) } });
    await openWith("1234");
    await screen.findByRole("tablist");
    await userEvent.click(screen.getByRole("button", { name: "Khóa và quay lại" }));
    expect(await screen.findByRole("heading", { name: "Phòng của Robo" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#/");
    window.location.hash = "#/parent";
    expect(await screen.findByLabelText("Mã PIN")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  test("the focus moves to the heading of the area once the PIN opens it", async () => {
    await openArea();
    expect(screen.getByRole("heading", { level: 1, name: "Tổng quan" })).toHaveFocus();
  });

  test("a PIN gate that crashes keeps the side menu", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    gateCrash.on = true;
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    expect(screen.getByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    expect(screen.getByRole("navigation", { name: "Menu chính" })).toBeInTheDocument();
  });

  test("numbers that cannot be counted leave the tabs without numbers, not a crashed page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000) } });
    countCrash.on = true;
    await openWith("1234");
    const tablist = await screen.findByRole("tablist");
    expect(within(tablist).getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Khóa và quay lại" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Khu phụ huynh" })).toBeInTheDocument();
  });

  test("a tab that crashes keeps the parent side menu; another tab recovers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await openArea();
    await userEvent.click(screen.getByRole("tab", { name: "Tiến độ" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    // The name of the section stays the 1 title of the page; the card inside the panel is an h2.
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["Tiến độ"]);
    expect(screen.getByRole("heading", { level: 2, name: "Robo gặp sự cố" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Khu phụ huynh" })).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Tổng quan" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Không có cảnh báo.")).toBeInTheDocument();
  });
});

/** A child with a request waiting, a concept that needs help and a clock set back: 3 of the 4 alerts. */
function alertState(): GameState {
  const state = initialGameState(TODAY);
  state.mastery = { k1: { ...emptyMastery(), needsHelp: true } };
  state.rewards.requests = [
    { id: "q", rewardId: "r", name: "Kem", price: 30, at: FIXED_NOW.toISOString(), status: "pending", decidedAt: null },
  ];
  state.warnings = [{ at: FIXED_NOW.toISOString(), kind: "clock-rollback" }];
  return state;
}

/** The test content with 1 concept, so the card of the concepts that need help can name it. */
function bundleWithConcept() {
  const bundle = testBundle();
  bundle.stages[0].topics[0].concepts.push({
    id: "k1",
    name: { vi: "Vòng lặp while", en: "while loops" },
    ai: false,
    misconceptionCard: null,
    misconceptionHtml: null,
    parentTip: null,
    practice: { level1: [], level2: [], level3: [] },
  });
  return bundle;
}

const DAY_MS = 86_400_000;

/** The card (the `li`) of an alert, found by its title in the list under the "Cảnh báo" heading (the page banner can say the same words). */
async function alertCard(title: string) {
  const heading = await screen.findByRole("heading", { level: 2, name: "Cảnh báo" });
  const card = within(heading.nextElementSibling as HTMLElement).getByText(title).closest("li");
  if (!card) throw new Error(`no card for ${title}`);
  return card;
}

describe("ParentOverview", () => {
  test("alerts, study minutes, stage, week plan, streak and xu", async () => {
    const state = alertState();
    state.wallet.xu = 70;
    state.wallet.history = [{ day: TODAY, delta: 140, reason: "code", ref: "e" }];
    state.activity.seconds = { [TODAY]: 900 };
    state.vacation.ranges = [{ start: "2026-10-03", end: "2026-10-04" }];
    await renderWithGame(<ParentScreen />, {
      state,
      bundle: bundleWithConcept(),
      meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() },
    });
    await openWith("1234");
    const rewards = await alertCard("1 yêu cầu đổi thưởng chờ duyệt");
    expect(rewards).toHaveClass("alert-card");
    expect(rewards).not.toHaveClass("alert-red");
    expect(within(rewards).getByText("Kem · 30 xu")).toBeInTheDocument();
    const help = await alertCard("1 khái niệm con cần hỗ trợ");
    expect(help).toHaveClass("alert-card", "alert-red");
    expect(within(help).getByText("Vòng lặp while")).toBeInTheDocument();
    const clock = await alertCard("Đồng hồ máy bị chỉnh lùi 1 lần");
    expect(clock).toHaveClass("alert-card");
    expect(within(clock).getAllByRole("button")).toHaveLength(1);
    // A chart column keeps the whole sentence for a screen reader, and shows the weekday under the bar (2026-10-06 is a Tuesday).
    expect(screen.getByText("2026-10-06: 15 phút")).toBeInTheDocument();
    expect(screen.getByText("2026-10-03: nghỉ")).toBeInTheDocument();
    expect(within(screen.getByText("2026-10-06: 15 phút").closest("li")!).getByText("T3")).toBeInTheDocument();
    expect(within(screen.getByText("2026-10-03: nghỉ").closest("li")!).getByText("nghỉ")).toBeInTheDocument();
    expect(screen.getByText("2026-10-03: nghỉ").closest("li")).toHaveClass("minutes-vacation");
    const figure = (term: string) => screen.getByText(term, { selector: "dt" }).nextElementSibling;
    expect(figure("Giai đoạn")).toHaveTextContent("1 · Giai đoạn thử");
    expect(figure("Kế hoạch tuần")).toHaveTextContent(/^\d+\/\d+ bài$/);
    expect(figure("Chuỗi ngày")).toHaveTextContent(/^\d+ ngày$/);
    expect(figure("Xu")).toHaveTextContent("70");
    expect(figure("Xu")).toHaveTextContent("Trung bình 10 xu/ngày (14 ngày)");
  });

  test("the chart: 7 days, the tallest bar full, a day off as a short bar marked in words", async () => {
    const state = initialGameState(TODAY);
    state.activity.seconds = { [TODAY]: 15 * 60, "2026-10-05": 60 * 60 };
    state.vacation.ranges = [{ start: "2026-10-03", end: "2026-10-04" }];
    await renderWithGame(<ParentScreen />, { state, meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() } });
    await openWith("1234");
    const chart = await screen.findByRole("list", { name: "Số phút học 7 ngày qua" });
    const days = within(chart).getAllByRole("listitem");
    expect(days).toHaveLength(7);
    const bar = (day: HTMLElement) => day.querySelector<HTMLElement>(".minutes-bar")!;
    // 2026-10-05 is the most (60 min); 2026-10-06 is 15 of 60.
    expect(bar(days[5]).style.height).toBe("100%");
    expect(bar(days[6]).style.height).toBe("25%");
    expect(within(days[5]).getByText("60")).toBeInTheDocument();
    // A day off has no height of its own: the style sheet gives it a fixed short bar.
    expect(days[3]).toHaveClass("minutes-vacation");
    expect(bar(days[3]).style.height).toBe("");
    // The numbers, the weekdays and the bars are for the eyes; the sentence is what a screen reader reads.
    for (const part of [".minutes-value", ".minutes-bar", ".minutes-label"]) {
      expect(days[6].querySelector(part)).toHaveAttribute("aria-hidden", "true");
    }
    expect(days.map((day) => day.querySelector(".minutes-label")?.textContent)).toEqual(["T4", "T5", "T6", "T7", "CN", "T2", "T3"]);
  });

  test("no alerts", async () => {
    await renderWithGame(<ParentScreen />, { meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() } });
    await openWith("1234");
    expect(await screen.findByText("Không có cảnh báo.")).toBeInTheDocument();
  });

  test("Xem opens the section of the alert and puts the focus on its heading; the lock still comes after 5 minutes", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderWithGame(<ParentScreen />, {
      state: alertState(),
      meta: { pin: await hashPin("1234", 1000), lastBackupAt: FIXED_NOW.toISOString() },
    });
    await openWith("1234");
    await userEvent.click(within(await alertCard("1 yêu cầu đổi thưởng chờ duyệt")).getByRole("button", { name: "Xem" }));
    expect(screen.getByRole("tab", { name: "Phần thưởng" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 1, name: "Phần thưởng" })).toHaveFocus();
    await userEvent.click(screen.getByRole("tab", { name: "Tổng quan" }));
    await userEvent.click(within(await alertCard("1 khái niệm con cần hỗ trợ")).getByRole("button", { name: "Xem" }));
    expect(screen.getByRole("tab", { name: "Con cần hỗ trợ" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 1, name: "Con cần hỗ trợ" })).toHaveFocus();
    await userEvent.click(screen.getByRole("tab", { name: "Tổng quan" }));
    await userEvent.click(within(await alertCard("Đồng hồ máy bị chỉnh lùi 1 lần")).getByRole("button", { name: "Xem" }));
    expect(screen.getByRole("heading", { level: 1, name: "Cài đặt" })).toHaveFocus();
    await act(async () => {
      vi.advanceTimersByTime(LOCK_AFTER_MS + 10_000);
    });
    const note = screen.getByRole("status");
    expect(note).toHaveTextContent("Khu phụ huynh đã tự khóa sau 5 phút không dùng.");
    expect(note).toHaveClass("gate-note");
  });

  test("the backup reminder links to the backup page; every Xem is described by the title of its card", async () => {
    const lastBackupAt = new Date(FIXED_NOW.getTime() - 8 * DAY_MS).toISOString();
    await renderWithGame(<ParentScreen />, { state: alertState(), meta: { pin: await hashPin("1234", 1000), lastBackupAt } });
    await openWith("1234");
    const backup = await alertCard("Đã 7 ngày chưa sao lưu.");
    expect(within(backup).getByText("Lần sao lưu gần nhất: 2026-09-28")).toBeInTheDocument();
    expect(within(backup).getByRole("link", { name: "Xem" })).toHaveAttribute("href", "#/backup");
    const cards = within(backup.closest("ul")!).getAllByRole("listitem");
    const titles = cards.map((card) => card.querySelector("b")?.textContent);
    expect(titles).toEqual([
      "1 yêu cầu đổi thưởng chờ duyệt",
      "1 khái niệm con cần hỗ trợ",
      "Đã 7 ngày chưa sao lưu.",
      "Đồng hồ máy bị chỉnh lùi 1 lần",
    ]);
    for (const [index, card] of cards.entries()) {
      const action = within(card).getByRole(index === 2 ? "link" : "button", { name: "Xem" });
      expect(action).toHaveAccessibleDescription(titles[index]!);
    }
  });

  test("a backup reminder without any backup says so", async () => {
    await renderWithGame(<ParentScreen />, {
      meta: { pin: await hashPin("1234", 1000) },
      clock: () => new Date(FIXED_NOW.getTime() + 8 * DAY_MS),
    });
    await openWith("1234");
    expect(within(await alertCard("Đã 7 ngày chưa sao lưu.")).getByText("Chưa sao lưu lần nào")).toBeInTheDocument();
  });
});
