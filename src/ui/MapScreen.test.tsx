// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialGameState } from "../game/state";
import { examBundle, twoStageBundle } from "../test/examBundle";
import { testBundle } from "../test/fixtures";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { MapScreen } from "./MapScreen";

/** The state of `examBundle()` once both lessons are done. */
function lessonsDone() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  return state;
}

const TEST_DONE = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };

describe("MapScreen", () => {
  test("a new profile: the stage tab, the topic row, the next lesson and a locked one", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY) });
    expect(screen.getByRole("heading", { level: 1, name: "Bản đồ học" })).toBeInTheDocument();
    const tabs = within(screen.getByRole("tablist", { name: "Các giai đoạn" })).getAllByRole("tab");
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveAccessibleName("Giai đoạn thử");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: "Bài thử: Tiếp theo" })).toHaveAttribute("href", "#/lesson/t.l1");
    const locked = screen.getByRole("link", { name: "Bài thử 2: Chưa mở" });
    expect(locked).toHaveAttribute("aria-disabled", "true");
    expect(locked).not.toHaveAttribute("href");
    expect(screen.getByText("Chủ đề 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Chủ đề thử" })).toBeInTheDocument();
    expect(screen.getByText("0/2 bài")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Chủ đề thử" })).toBeInTheDocument();
  });

  test("a done lesson stays open", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["t.l1"];
    await renderWithGame(<MapScreen />, { state });
    expect(screen.getByRole("link", { name: "Bài thử: Đã xong" })).toHaveAttribute("href", "#/lesson/t.l1");
    expect(screen.getByRole("link", { name: "Bài thử 2: Tiếp theo" })).toHaveAttribute("href", "#/lesson/t.l2");
    expect(screen.getByText("1/2 bài")).toBeInTheDocument();
  });

  test("shows the review station between the lessons", async () => {
    const state = initialGameState(TODAY);
    state.progress.completedLessons = ["r.l1", "r.l2"];
    await renderWithGame(<MapScreen />, { state, bundle: reviewBundle() });
    const track = screen.getByRole("list", { name: "Chủ đề ôn" });
    expect(within(track).getAllByRole("link").map((link) => link.getAttribute("aria-label"))).toEqual([
      "Bài r.l1: Đã xong",
      "Bài r.l2: Đã xong",
      "Trạm ôn: Tiếp theo",
      "Bài r.l3: Chưa mở",
    ]);
    expect(screen.getByRole("link", { name: "Trạm ôn: Tiếp theo" })).toHaveAttribute("href", "#/review/r.r1");
  });

  test("the topic test comes after the lessons; the evolution card follows the stage", async () => {
    await renderWithGame(<MapScreen />, { state: lessonsDone(), bundle: examBundle() });
    expect(screen.getByRole("link", { name: "Kiểm tra chủ đề: Tiếp theo" })).toHaveAttribute("href", "#/topic-test/x.t");
    const card = screen.getByRole("region", { name: "Kiểm tra tiến hóa · Giai đoạn 1" });
    expect(screen.getByRole("heading", { level: 2, name: "Kiểm tra tiến hóa · Giai đoạn 1" })).toBeInTheDocument();
    expect(
      within(card).getByText("Mở khi con xong mọi chủ đề của giai đoạn này. Đạt từ 80% thì Robo tiến hóa."),
    ).toBeInTheDocument();
    expect(within(card).getByText("Chưa mở")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Làm bài kiểm tra" })).not.toBeInTheDocument();
  });

  test("a topic test that is done opens the evolution test; a passed one shows the score", async () => {
    const state = lessonsDone();
    state.progress.topicTests["x.t"] = TEST_DONE;
    const { unmount } = await renderWithGame(<MapScreen />, { state, bundle: examBundle() });
    expect(screen.getByText("2/2 bài · kiểm tra 6/6")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Làm bài kiểm tra" })).toHaveAttribute("href", "#/evolution/x");
    expect(screen.getByText("Đạt từ 80% thì Robo tiến hóa.")).toBeInTheDocument();
    unmount();

    state.pet.stage = 2;
    state.progress.evolutionTests = [
      { at: "2026-10-06T09:00:00.000Z", stage: 1, score: 7, max: 7, passed: true, items: [], wrongConcepts: [] },
    ];
    await renderWithGame(<MapScreen />, { state, bundle: examBundle() });
    expect(screen.getByText("Đã đạt: 7/7 điểm.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Làm bài kiểm tra" })).not.toBeInTheDocument();
  });

  test("an evolution test that is done without a saved paper says it is done", async () => {
    const state = lessonsDone();
    state.progress.topicTests["x.t"] = TEST_DONE;
    state.pet.stage = 2;
    await renderWithGame(<MapScreen />, { state, bundle: examBundle() });
    const card = screen.getByRole("region", { name: "Kiểm tra tiến hóa · Giai đoạn 1" });
    expect(within(card).getByText("Đã xong")).toBeInTheDocument();
  });

  test("the legend is a picture: it is hidden from assistive technology", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY) });
    // The statuses are in the names of the squares, so the legend only repeats them as a picture.
    expect(screen.getByText("Kiểm tra").closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText("Trạm ôn").closest('[aria-hidden="true"]')).not.toBeNull();
  });

  test("in English the names and the statuses are English", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), lang: "en" });
    expect(screen.getByRole("link", { name: "Test lesson: Next" })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Stages" })).toBeInTheDocument();
    expect(screen.getByText("Topic 1")).toBeInTheDocument();
  });
});

describe("MapScreen stage tabs", () => {
  test("the arrow keys, Home and End change the tab and move the focus", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), bundle: twoStageBundle() });
    const first = screen.getByRole("tab", { name: "Giai đoạn thi" });
    const second = screen.getByRole("tab", { name: "Giai đoạn thử" });
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(first).toHaveAttribute("tabindex", "0");
    expect(second).toHaveAttribute("tabindex", "-1");

    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("tabindex", "0");
    expect(first).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("link", { name: "Bài thử: Chưa mở" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Bài x\.l1/ })).not.toBeInTheDocument();

    await userEvent.keyboard("{ArrowRight}");
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(second).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(first).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveFocus();
  });

  test("a click on a tab shows the panel of that stage, named by the tab", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), bundle: twoStageBundle() });
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Giai đoạn thi");
    await userEvent.click(screen.getByRole("tab", { name: "Giai đoạn thử" }));
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Giai đoạn thử");
    expect(screen.getByRole("heading", { level: 2, name: "Chủ đề thử" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Chủ đề thi" })).not.toBeInTheDocument();
  });

  test("the child's tab is chosen at the start, and a stage that is passed says so", async () => {
    const state = lessonsDone();
    state.progress.topicTests["x.t"] = TEST_DONE;
    state.pet.stage = 2;
    state.progress.evolutionTests = [
      { at: "2026-10-06T09:00:00.000Z", stage: 1, score: 7, max: 7, passed: true, items: [], wrongConcepts: [] },
    ];
    await renderWithGame(<MapScreen />, { state, bundle: twoStageBundle() });
    const first = screen.getByRole("tab", { name: "Giai đoạn thi" });
    const second = screen.getByRole("tab", { name: "Giai đoạn thử" });
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(first).toHaveAccessibleDescription("Con đã qua giai đoạn này");
    expect(second).not.toHaveAccessibleDescription();
    expect(screen.getByRole("link", { name: "Bài thử: Tiếp theo" })).toBeInTheDocument();
  });

  test("the tab name is the stage title alone: a title that starts with its number is not numbered twice", async () => {
    const bundle = testBundle();
    bundle.stages[0]!.title = { vi: "Giai đoạn 1: Khởi động", en: "Stage 1: Getting started" };
    const { unmount } = await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), bundle });
    expect(screen.getByRole("tab")).toHaveAccessibleName("Giai đoạn 1: Khởi động");
    expect(screen.getByRole("tab")).toHaveTextContent(/^Giai đoạn 1: Khởi động$/);
    unmount();
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), bundle, lang: "en" });
    expect(screen.getByRole("tab")).toHaveAccessibleName("Stage 1: Getting started");
  });

  test("a key with Alt, Meta or Ctrl is left to the browser: Alt+ArrowRight (history forward) does not change the tab", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), bundle: twoStageBundle() });
    const first = screen.getByRole("tab", { name: "Giai đoạn thi" });
    first.focus();
    for (const modifier of ["Alt", "Meta", "Control"]) {
      await userEvent.keyboard(`{${modifier}>}{ArrowRight}{/${modifier}}`);
      await userEvent.keyboard(`{${modifier}>}{End}{/${modifier}}`);
      expect(first).toHaveAttribute("aria-selected", "true");
      expect(first).toHaveFocus();
    }
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Giai đoạn thử" })).toHaveAttribute("aria-selected", "true");
  });

  test("the panel takes the focus order only when it holds nothing to focus (a stage with every square locked)", async () => {
    await renderWithGame(<MapScreen />, { state: initialGameState(TODAY), bundle: twoStageBundle() });
    // Stage 1 has an open lesson (a link), so the panel is not a tab stop.
    expect(screen.getByRole("tabpanel")).not.toHaveAttribute("tabindex");
    await userEvent.click(screen.getByRole("tab", { name: "Giai đoạn thử" }));
    expect(screen.queryByRole("link", { name: /: (Tiếp theo|Đã xong)$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
  });

  test("a panel whose only link is the evolution test is not a tab stop", async () => {
    const state = lessonsDone();
    state.progress.topicTests["x.t"] = TEST_DONE;
    await renderWithGame(<MapScreen />, { state, bundle: examBundle() });
    expect(screen.getByRole("link", { name: "Làm bài kiểm tra" })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).not.toHaveAttribute("tabindex");
  });
});
