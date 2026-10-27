// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { AchievementsScreen } from "./AchievementsScreen";

test("shows the forms of Robo, then the badges, then the 2 concept counts", async () => {
  const state = initialGameState(TODAY);
  state.badges = { "first-lesson": "2026-10-01" };
  state.mastery = { a: { ...emptyMastery(), score: 90 }, b: { ...emptyMastery(), score: 50 } };
  await renderWithGame(<AchievementsScreen />, { state });
  expect(screen.getByRole("heading", { level: 1, name: "Sổ thành tích" })).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
    "Các dạng của Robo",
    "Huy hiệu · 1/17",
  ]);
  const forms = screen.getByRole("heading", { name: "Các dạng của Robo" }).nextElementSibling as HTMLElement;
  expect(within(forms).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Viên nangGiai đoạn 1 · hiện tại",
    "Chưa cóGiai đoạn 2",
    "Chưa cóGiai đoạn 3",
    "Chưa cóGiai đoạn 4",
  ]);
  const cards = document.querySelectorAll<HTMLElement>(".concept-counts .card");
  expect(cards).toHaveLength(2);
  expect(cards[0].querySelector(".big")).toHaveTextContent("1");
  expect(cards[0]).toHaveTextContent("khái niệm đã vững");
  expect(cards[1].querySelector(".big")).toHaveTextContent("1");
  expect(cards[1]).toHaveTextContent("khái niệm đang luyện");
});

test("a badge earned is a square you can focus to read its date; one not earned is grey with a lock", async () => {
  const state = initialGameState(TODAY);
  state.badges = { "first-lesson": "2026-10-01", "topic-test": "2026-10-03" };
  await renderWithGame(<AchievementsScreen />, { state });
  const first = screen.getByText("Bài học đầu tiên").closest("li") as HTMLElement;
  expect(first).toHaveClass("badge", "badge-lessons", "badge-earned");
  expect(first).toHaveAttribute("tabindex", "0");
  expect(within(first).getByText("Nhận ngày 2026-10-01")).toBeInTheDocument();
  expect(first.querySelector(".badge-mark")).toHaveTextContent("1");
  expect(first.querySelector('svg[data-icon="lock"]')).toBeNull();

  const streak = screen.getByText("Chuỗi 30 ngày").closest("li") as HTMLElement;
  expect(streak).toHaveClass("badge", "badge-streak", "badge-locked");
  expect(streak).not.toHaveClass("badge-earned");
  expect(streak).not.toHaveAttribute("tabindex");
  expect(streak.querySelector('svg[data-icon="lock"]')).not.toBeNull();
  expect(within(streak).getByText("Chưa có")).toBeInTheDocument();
  expect(streak.querySelector(".badge-mark")).toHaveTextContent("30");

  const topic = screen.getByText("Đạt kiểm tra chủ đề").closest("li") as HTMLElement;
  expect(topic.querySelector('svg[data-icon="trophy"]')).not.toBeNull();
});

test("each of the 17 badges has its group and its mark", async () => {
  const { container } = await renderWithGame(<AchievementsScreen />);
  const marks = Array.from(container.querySelectorAll<HTMLElement>("ul.badges > li")).map((li) => {
    const group = Array.from(li.classList).find((name) => name.startsWith("badge-") && !/^badge-(earned|locked)$/.test(name));
    const mark = li.querySelector(".badge-mark") as HTMLElement;
    return [group, mark.querySelector("svg[data-icon]:not(.badge-lock)")?.getAttribute("data-icon") ?? mark.textContent];
  });
  expect(marks).toEqual([
    ["badge-lessons", "1"],
    ["badge-lessons", "10"],
    ["badge-lessons", "25"],
    ["badge-lessons", "50"],
    ["badge-streak", "3"],
    ["badge-streak", "7"],
    ["badge-streak", "14"],
    ["badge-streak", "30"],
    ["badge-practice", "5/5"],
    ["badge-practice", "+"],
    ["badge-test", "trophy"],
    ["badge-test", "chart"],
    ["badge-concepts", "5"],
    ["badge-concepts", "10"],
    ["badge-evolution", "II"],
    ["badge-evolution", "III"],
    ["badge-evolution", "IV"],
  ]);
});

test("only the form Robo has now is marked as the current one", async () => {
  const state = initialGameState(TODAY);
  state.pet.stage = 2;
  const { container } = await renderWithGame(<AchievementsScreen />, { state });
  const items = formItems(container);
  expect(items.map((li) => li.classList.contains("form-current"))).toEqual([false, true, false, false]);
  expect(within(items[1] as HTMLElement).getByText("Giai đoạn 2 · hiện tại")).toBeInTheDocument();
  expect(within(items[0] as HTMLElement).getByText("Giai đoạn 1")).toBeInTheDocument();
});

test("a graduate has the last form as the current one", async () => {
  const state = initialGameState(TODAY);
  state.pet.stage = 5;
  const { container } = await renderWithGame(<AchievementsScreen />, { state });
  const items = formItems(container);
  expect(items.map((li) => li.classList.contains("form-current"))).toEqual([false, false, false, true]);
  expect(within(items[3] as HTMLElement).getByText("Giai đoạn 4 · hiện tại")).toBeInTheDocument();
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
    expect(robot).toHaveAttribute("data-size", "100");
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
  expect(items.map((li) => li.className)).toEqual([
    "form form-reached form-current",
    "form form-locked",
    "form form-locked",
    "form form-locked",
  ]);
  expect(screen.queryByText("Sơ sinh")).not.toBeInTheDocument();
});
