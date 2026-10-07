// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { AchievementsScreen } from "./AchievementsScreen";

test("shows badges earned and not yet, the forms reached and the concepts", async () => {
  const state = initialGameState(TODAY);
  state.badges = { "first-lesson": "2026-10-01", "evolution-2": "2026-10-05" };
  state.pet.stage = 2;
  state.mastery = { a: { ...emptyMastery(), score: 90 }, b: { ...emptyMastery(), score: 50 } };
  await renderWithGame(<AchievementsScreen />, { state });
  expect(screen.getByRole("heading", { name: "Sổ thành tích" })).toBeInTheDocument();
  const first = screen.getByText("Bài học đầu tiên").closest("li") as HTMLElement;
  expect(within(first).getByText("Nhận ngày 2026-10-01")).toBeInTheDocument();
  const streak = screen.getByText("Chuỗi 30 ngày").closest("li") as HTMLElement;
  expect(within(streak).getByText("Chưa có")).toBeInTheDocument();
  const forms = screen.getByRole("heading", { name: "Các dạng của Robo" }).nextElementSibling as HTMLElement;
  expect(within(forms).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Viên nang",
    "Sơ sinh",
    "Chưa có",
    "Chưa có",
  ]);
  expect(screen.getByText("Khái niệm đã vững: 1")).toBeInTheDocument();
  expect(screen.getByText("Khái niệm đang luyện: 1")).toBeInTheDocument();
});

function formItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("ol.forms > li"));
}

test("shows each form as a picture of Robo: in colour with its name when reached, a grey shape with ? when not", async () => {
  const state = initialGameState(TODAY);
  state.pet.stage = 2;
  const { container } = await renderWithGame(<AchievementsScreen />, { state });
  const items = formItems(container);
  expect(items.map((li) => li.getAttribute("data-form"))).toEqual(["1", "2", "3", "4"]);
  items.forEach((li, i) => {
    const robot = li.querySelector("svg[data-form]") as SVGElement;
    expect(robot).toHaveAttribute("data-form", String(i + 1));
    expect(robot).toHaveAttribute("data-size", "72");
  });
  const [first, second, third, fourth] = items as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
  expect(first).toHaveClass("form-reached");
  expect(second).toHaveClass("form-reached");
  expect(within(second).getByText("Sơ sinh")).toBeInTheDocument();
  for (const locked of [third, fourth]) {
    expect(locked).toHaveClass("form-locked");
    expect(locked).not.toHaveClass("form-reached");
    expect(within(locked).getByText("Chưa có")).toBeInTheDocument();
  }
  // The names of the forms not reached yet stay a surprise.
  expect(screen.queryByText("Bé con")).not.toBeInTheDocument();
  expect(screen.queryByText("Thiếu niên")).not.toBeInTheDocument();
  expect(fourth.querySelector('[data-part="star"]')).toBeNull();
});

test("a graduate sees all 4 forms in colour and the gold star on the teen", async () => {
  const state = initialGameState(TODAY);
  state.pet.stage = 5;
  const { container } = await renderWithGame(<AchievementsScreen />, { state });
  const items = formItems(container);
  expect(items.every((li) => li.classList.contains("form-reached"))).toBe(true);
  expect(items.map((li) => li.querySelector('[data-part="star"]') !== null)).toEqual([false, false, false, true]);
  expect(within(items[3] as HTMLElement).getByText("Thiếu niên")).toBeInTheDocument();
});

test("at the first stage only the capsule is reached", async () => {
  const { container } = await renderWithGame(<AchievementsScreen />);
  const items = formItems(container);
  expect(items.map((li) => li.className)).toEqual(["form form-reached", "form form-locked", "form form-locked", "form form-locked"]);
  expect(screen.queryByText("Sơ sinh")).not.toBeInTheDocument();
});
