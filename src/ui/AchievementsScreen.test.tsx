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
