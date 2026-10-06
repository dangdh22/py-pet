// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { emptyMastery } from "../game/mastery";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { renderWithGame, TODAY } from "../test/renderGame";
import { ParentProgress } from "./ParentProgress";

test("topics, evolution tests and lesson details", async () => {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1"];
  state.mastery = { k1: { ...emptyMastery(), score: 60 }, k2: { ...emptyMastery(), score: 41 } };
  state.progress.topicTests["x.t"] = { attempts: 2, best: 4.5, max: 6, passed: false, lastItems: [] };
  state.progress.evolutionTests = [
    { at: "2026-10-05T03:00:00.000Z", stage: 1, score: 3, max: 7, passed: false, items: [], wrongConcepts: [] },
  ];
  state.progress.exerciseStats = { "x.l1.ex1": { fails: 2, hints: 1, viewedSolution: true } };
  await renderWithGame(<ParentProgress />, { bundle: examBundle(), state });
  const row = screen.getByRole("row", { name: /Chủ đề thi/ });
  expect(within(row).getAllByRole("cell").map((cell) => cell.textContent)).toEqual(["Chủ đề thi", "1/2", "51", "4,5/6"]);
  expect(screen.getByText(/: giai đoạn 1, 3\/7 điểm, chưa đạt$/)).toBeInTheDocument();
  expect(screen.getByText("x.l1.ex1: 2 lần nộp sai, 1 gợi ý, đã xem lời giải")).toBeInTheDocument();
});

test("nothing yet", async () => {
  await renderWithGame(<ParentProgress />, { bundle: examBundle() });
  expect(screen.getAllByText("Chưa có")).toHaveLength(2);
  expect(screen.getByText("Chưa thi lần nào.")).toBeInTheDocument();
});
