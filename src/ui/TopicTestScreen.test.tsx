// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { answerPaper } from "../test/answerExam";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { TopicTestScreen } from "./TopicTestScreen";

const bundle = examBundle();
const topic = bundle.stages[0]!.topics[0]!;

function studied() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  return state;
}

describe("TopicTestScreen", () => {
  test("a full score passes: XP, xu and the record", async () => {
    const { store } = await renderWithGame(<TopicTestScreen topic={topic} onExit={() => {}} rng={seededRng(1)} />, {
      bundle,
      runner: fakeRunner(() => okResult("Hi\n")),
      state: studied(),
    });
    expect(screen.getByRole("heading", { name: "Kiểm tra chủ đề: Chủ đề thi" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/4")).toBeInTheDocument();
    await answerPaper("Đúng");

    expect(screen.getByRole("heading", { name: "Xong bài kiểm tra!" })).toBeInTheDocument();
    expect(screen.getByText("Con được 6/6 điểm. Con đã đạt!")).toBeInTheDocument();
    expect(screen.getByText("+30 XP")).toBeInTheDocument();
    expect(screen.getByText("+20 xu")).toBeInTheDocument();
    await waitFor(async () =>
      expect((await store.loadActive())!.state.progress.topicTests["x.t"]).toMatchObject({
        attempts: 1,
        best: 6,
        max: 6,
        passed: true,
      }),
    );
  });

  test("a low score is not passed but the test is done, with practice for the weak concepts", async () => {
    const { store } = await renderWithGame(<TopicTestScreen topic={topic} onExit={() => {}} rng={seededRng(1)} />, {
      bundle,
      runner: fakeRunner(() => okResult("Ho\n")),
      state: studied(),
    });
    await answerPaper("Sai");
    expect(screen.getByText("Con được 0/6 điểm. Lần này chưa đạt 80%, con ôn thêm nhé.")).toBeInTheDocument();
    expect(screen.getByText("+30 XP")).toBeInTheDocument();
    expect(screen.queryByText(/xu$/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Luyện thêm: Khái niệm k[12]$/ }).length).toBeGreaterThan(0);
    await waitFor(async () =>
      expect((await store.loadActive())!.state.progress.topicTests["x.t"]).toMatchObject({ passed: false }),
    );
  });
});
