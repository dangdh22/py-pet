// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { initialGameState, type GameState } from "../game/state";
import { renderWithApp } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { ResultView, RewardChips } from "./ResultView";

/** `after` is 28 XP, 8 coins and 1 battery above `before`, with 1 point earned today. */
function states(): { before: GameState; after: GameState } {
  const before = initialGameState(TODAY);
  const after = structuredClone(before);
  after.pet.xp += 28;
  after.wallet.xu += 8;
  after.pet.pin += 1;
  after.streak.pointsDay = TODAY;
  after.streak.points = 1;
  return { before, after };
}

function renderResult(before: GameState, after: GameState, onExit: () => void = () => {}) {
  return renderWithGame(
    <ResultView before={before} after={after} title="Hoàn thành bài học!" message="Giỏi lắm!" onExit={onExit} />,
  );
}

describe("ResultView", () => {
  test("the card has the title as the only h1 and a list of the rewards", async () => {
    const { before, after } = states();
    const { container } = await renderResult(before, after);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Hoàn thành bài học!" })).toBeInTheDocument();
    expect(screen.getByText("Giỏi lắm!")).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(main).toHaveClass("result-page");
    expect(main.querySelector("section.card.result-card")).not.toBeNull();
    expect(container.querySelector(".lesson-done")).toBeNull();

    const rewards = screen.getByRole("list", { name: "Phần thưởng" });
    expect(rewards).toHaveClass("reward-chips");
    const items = within(rewards).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["+28 XP", "+8 xu", "Pin +1"]);
    expect(items.map((item) => item.className)).toEqual([
      "chip chip-big chip-xp",
      "chip chip-big chip-xu",
      "chip chip-big chip-pin",
    ]);
  });

  test("no list of rewards when nothing was earned", async () => {
    const { before } = states();
    await renderResult(before, structuredClone(before));
    expect(screen.queryByRole("list", { name: "Phần thưởng" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Hoàn thành bài học!" })).toBeInTheDocument();
  });

  test("the goal of the day has squares beside its text, and the streak is a chip with the flame", async () => {
    const { before, after } = states();
    await renderResult(before, after);

    const goal = screen.getByText("Mục tiêu hôm nay: 1/2");
    expect(goal.parentElement?.querySelector(".squares")).not.toBeNull();
    expect(goal.parentElement?.querySelectorAll(".squares > .on")).toHaveLength(1);
    const streak = screen.getByText("Chuỗi: 0 ngày");
    expect(streak).toHaveClass("chip", "chip-streak");
    expect(streak.querySelector('[data-icon="flame"]')).not.toBeNull();
  });

  test("Học tiếp is the primary button and comes before Về phòng, which is not primary", async () => {
    const onExit = vi.fn();
    const { before, after } = states();
    await renderResult(before, after, onExit);

    const next = screen.getByRole("link", { name: "Học tiếp" });
    const room = screen.getByRole("button", { name: "Về phòng" });
    expect(next).toHaveClass("button", "primary");
    expect(next).toHaveAttribute("href", "#/lesson/t.l1");
    expect(room).not.toHaveClass("primary");
    expect(next.compareDocumentPosition(room) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(next.parentElement).toHaveClass("result-actions");
    expect(room.parentElement).toBe(next.parentElement);
    room.click();
    expect(onExit).toHaveBeenCalledOnce();
  });
});

describe("RewardChips", () => {
  const renderChips = (props: Parameters<typeof RewardChips>[0]) => renderWithApp(<RewardChips {...props} />);

  test("shows a chip for each value above 0, in the order XP, coins, battery, joy", () => {
    renderChips({ xp: 5, xu: 0, pin: 2, vui: 3 });
    const items = within(screen.getByRole("list", { name: "Phần thưởng" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["+5 XP", "Pin +2", "Vui +3"]);
    expect(items[2]).toHaveClass("chip", "chip-big", "chip-vui");
  });

  test("returns nothing when every value is 0", () => {
    const { container } = renderChips({});
    expect(container).toBeEmptyDOMElement();
  });
});
