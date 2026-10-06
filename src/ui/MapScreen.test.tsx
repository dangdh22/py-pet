// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
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

test("shows the review station between the lessons", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["r.l1", "r.l2"];
  await renderWithGame(<MapScreen />, { state, bundle: reviewBundle() });
  const items = screen.getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Bài r.l1Đã xong",
    "Bài r.l2Đã xong",
    "Trạm ônBài tiếp theo",
    "Bài r.l3Chưa mở",
  ]);
  expect(within(items[2]!).getByRole("link", { name: "Trạm ôn" })).toHaveAttribute("href", "#/review/r.r1");
});

test("shows the topic test after the lessons and the evolution test at the end of the stage", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  await renderWithGame(<MapScreen />, { state, bundle: examBundle() });
  const items = screen.getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Bài x.l1Đã xong",
    "Bài x.l2Đã xong",
    "Kiểm tra chủ đềBài tiếp theo",
    "Kiểm tra tiến hóaChưa mở",
  ]);
  expect(within(items[2]!).getByRole("link", { name: "Kiểm tra chủ đề" })).toHaveAttribute(
    "href",
    "#/topic-test/x.t",
  );
});
