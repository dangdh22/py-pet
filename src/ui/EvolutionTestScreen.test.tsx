// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { seededRng } from "../game/random";
import { initialGameState } from "../game/state";
import { answerPaper } from "../test/answerExam";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { EvolutionTestScreen } from "./EvolutionTestScreen";

const bundle = examBundle();
const stage = bundle.stages[0]!;

function ready() {
  const state = initialGameState(TODAY);
  state.progress.completedLessons = ["x.l1", "x.l2"];
  state.progress.topicTests["x.t"] = { attempts: 1, best: 6, max: 6, passed: true, lastItems: [] };
  return state;
}

describe("EvolutionTestScreen", () => {
  test("a pass evolves the robot", async () => {
    const { store } = await renderWithGame(
      <EvolutionTestScreen stage={stage} stageNumber={1} onExit={() => {}} rng={seededRng(3)} />,
      { bundle, runner: fakeRunner(() => okResult("Hi\n")), state: ready() },
    );
    expect(screen.getByRole("heading", { name: "Kiểm tra tiến hóa" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/5")).toBeInTheDocument();
    await answerPaper("Đúng");

    expect(screen.getByRole("heading", { name: "Robo đã tiến hóa!" })).toBeInTheDocument();
    expect(screen.getByText("Con được 7/7 điểm.")).toBeInTheDocument();
    expect(screen.getByText("+100 xu")).toBeInTheDocument();
    await waitFor(async () => expect((await store.loadActive())!.state.pet.stage).toBe(2));
    expect((await store.loadActive())!.state.remedial).toBeNull();
  });

  test("a fail lists the weak concepts and opens the focused review set", async () => {
    const { store } = await renderWithGame(
      <EvolutionTestScreen stage={stage} stageNumber={1} onExit={() => {}} rng={seededRng(3)} />,
      { bundle, runner: fakeRunner(() => okResult("Ho\n")), state: ready() },
    );
    await answerPaper("Sai");

    expect(screen.getByRole("heading", { name: "Lần này chưa đạt" })).toBeInTheDocument();
    expect(screen.getByText("Con được 0/7 điểm.")).toBeInTheDocument();
    expect(screen.getByText("Khái niệm k1")).toBeInTheDocument();
    expect(screen.getByText("Khái niệm a1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bắt đầu ôn tập trọng tâm" })).toHaveAttribute("href", "#/remedial");
    await waitFor(async () => expect((await store.loadActive())!.state.remedial).not.toBeNull());
    const saved = (await store.loadActive())!.state;
    expect(saved.pet.stage).toBe(1);
    expect(saved.progress.evolutionTests).toHaveLength(1);
  });
});
