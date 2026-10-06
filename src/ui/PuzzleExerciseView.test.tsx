// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { seededRng } from "../game/random";
import { fakeRunner, okResult, renderWithApp } from "../test/render";
import { reviewFill, reviewParsons } from "../test/reviewBundle";
import { PuzzleExerciseView, scrambleLines } from "./PuzzleExerciseView";

const lineTexts = () => screen.getAllByRole("listitem").map((li) => li.querySelector("pre")!.textContent);
const submit = () => screen.getByRole("button", { name: "Nộp bài" });

/** Prints what the code would print: only the 2 print lines of the fixtures matter. */
const echoRunner = () =>
  fakeRunner((code) => okResult(code.includes("Bye") ? code.replace(/print\("(\w+)"\)/g, "$1") : code.includes('"Hi"') ? "Hi\n" : ""));

describe("scrambleLines", () => {
  test("never returns the right order when another order exists", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      expect(scrambleLines(["a", "b"], seededRng(seed))).toEqual(["b", "a"]);
      const out = scrambleLines(["a", "b", "c"], seededRng(seed));
      expect([...out].sort()).toEqual(["a", "b", "c"]);
      expect(out).not.toEqual(["a", "b", "c"]);
    }
    expect(scrambleLines(["x", "x"], seededRng(1))).toEqual(["x", "x"]);
  });
});

describe("PuzzleExerciseView: parsons", () => {
  test("moves lines and submits them in the new order", async () => {
    const onComplete = vi.fn();
    const onJudged = vi.fn();
    const runner = echoRunner();
    renderWithApp(<PuzzleExerciseView exercise={reviewParsons} onComplete={onComplete} onJudged={onJudged} rng={seededRng(1)} />, {
      runner,
    });
    expect(screen.getByText("Sắp xếp để in ra Hi rồi Bye")).toBeInTheDocument();
    expect(lineTexts()).toEqual(['print("Bye")', 'print("Hi")']);
    expect(screen.getByRole("button", { name: "Đưa dòng 1 lên" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Đưa dòng 2 lên" }));
    expect(lineTexts()).toEqual(['print("Hi")', 'print("Bye")']);
    await userEvent.click(submit());
    expect(await screen.findByText("Đúng hết 1/1 test!")).toBeInTheDocument();
    expect(runner.calls[0]!.code).toBe('print("Hi")\nprint("Bye")\n');
    expect(onComplete).toHaveBeenCalledWith("solved");
    expect(onJudged.mock.calls[0]![0]).toMatchObject({ failedSubmitsBefore: 0, hintsUsed: 0, viewedSolution: false });
    expect(submit()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Đưa dòng 2 lên" })).toBeDisabled();
  });

  test("a wrong order fails; after 3 fails the solution can be shown", async () => {
    const onComplete = vi.fn();
    const onSolutionViewed = vi.fn();
    renderWithApp(
      <PuzzleExerciseView exercise={reviewParsons} onComplete={onComplete} onSolutionViewed={onSolutionViewed} rng={seededRng(1)} />,
      { runner: echoRunner() },
    );
    for (let n = 0; n < 3; n += 1) {
      await userEvent.click(submit());
      await waitFor(() => expect(submit()).toBeEnabled());
    }
    expect(screen.getByText("Đúng 0/1 test. Xem test bị sai ở bên dưới nhé.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
    expect(screen.getByText("Gợi ý 1: Hi đứng trước.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xem lời giải" }));
    expect(screen.getByText("Lời giải mẫu")).toBeInTheDocument();
    expect(onSolutionViewed).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith("viewed-solution");
  });
});

describe("PuzzleExerciseView: fill", () => {
  test("puts the typed text into the blank", async () => {
    const onComplete = vi.fn();
    const runner = echoRunner();
    renderWithApp(<PuzzleExerciseView exercise={reviewFill} onComplete={onComplete} />, { runner });
    await userEvent.type(screen.getByRole("textbox", { name: "Chỗ trống 1" }), '"Hi"');
    await userEvent.click(submit());
    expect(await screen.findByText("Đúng hết 1/1 test!")).toBeInTheDocument();
    expect(runner.calls[0]!.code).toBe('print("Hi")\n');
    expect(onComplete).toHaveBeenCalledWith("solved");
  });
});
