// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { MapScreen } from "./MapScreen";

test("shows done, next and locked lessons", async () => {
  const state = initialGameState(TODAY);
  await renderWithGame(<MapScreen />, { state });
  expect(screen.getByRole("heading", { name: "Bản đồ học" })).toBeInTheDocument();
  const items = screen.getAllByRole("listitem");
  expect(within(items[0]!).getByRole("link", { name: "Bài thử" })).toHaveAttribute("href", "#/lesson/t.l1");
  expect(within(items[0]!).getByText("Bài tiếp theo")).toBeInTheDocument();
  expect(within(items[1]!).queryByRole("link")).not.toBeInTheDocument();
  expect(within(items[1]!).getByText("Chưa mở")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Về phòng" })).toHaveAttribute("href", "#/");
});

test("a done lesson stays open", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["t.l1"];
  await renderWithGame(<MapScreen />, { state });
  const items = screen.getAllByRole("listitem");
  expect(within(items[0]!).getByText("Đã xong")).toBeInTheDocument();
  expect(within(items[1]!).getByRole("link", { name: "Bài thử 2" })).toBeInTheDocument();
});
