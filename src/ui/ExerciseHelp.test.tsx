// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { renderWithApp } from "../test/render";
import { ExerciseHelp } from "./ExerciseHelp";

const props = {
  hints: [],
  shown: 0,
  onHint: () => {},
  failedSubmits: 0,
  solution: "print(1)\n",
  solutionShown: false,
  onShowSolution: () => {},
};

describe("ExerciseHelp", () => {
  test("renders nothing when there is nothing to show, so the card adds no gap", () => {
    // Solved: both buttons are gone, and no hint was opened.
    const { container } = renderWithApp(<ExerciseHelp {...props} hints={[{ vi: "Dùng print" }]} finished />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the block while the solution button is on offer", () => {
    const { container } = renderWithApp(<ExerciseHelp {...props} />);
    expect(container.querySelector(".exercise-help")).not.toBeNull();
  });

  test("renders the block for a shown solution, with no buttons", () => {
    const { container } = renderWithApp(<ExerciseHelp {...props} solutionShown />);
    expect(container.querySelector(".exercise-help")).not.toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });
});
