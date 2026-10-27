// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { JudgeResult, TestOutcome } from "../runner/judge";
import { renderWithApp } from "../test/render";
import { TestResultList } from "./TestResultList";

function outcome(extra: Partial<TestOutcome> & Pick<TestOutcome, "index">): TestOutcome {
  return {
    passed: false,
    hidden: false,
    ran: true,
    input: "",
    expected: "1\n2",
    actual: "1\n3",
    firstDiffLine: 1,
    outcome: "ok",
    error: null,
    usedInputPrompt: false,
    ...extra,
  };
}

/** A wrong paper: test 1 and 2 are shown, test 3 is hidden; all 3 fail. */
const wrong: JudgeResult = {
  status: "wrong-answer",
  passedCount: 0,
  total: 3,
  tests: [outcome({ index: 0 }), outcome({ index: 1 }), outcome({ index: 2, hidden: true })],
  misconceptions: [],
};

const rows = () => within(screen.getByRole("list", { name: "Kết quả chấm" })).getAllByRole("listitem");

describe("TestResultList", () => {
  test("shows the summary and 1 row with a mark for each test", () => {
    renderWithApp(<TestResultList result={wrong} />);
    expect(screen.getByText("Kết quả test · 0/3 đúng")).toBeInTheDocument();
    expect(rows()).toHaveLength(3);
    for (const row of rows()) {
      const mark = row.querySelector(".test-mark");
      expect(mark).not.toBeNull();
      expect(mark).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("the summary counts the tests that passed", () => {
    const partly: JudgeResult = {
      ...wrong,
      passedCount: 1,
      tests: [outcome({ index: 0, passed: true, firstDiffLine: null, actual: "1\n2" }), ...wrong.tests.slice(1)],
    };
    renderWithApp(<TestResultList result={partly} />);
    expect(screen.getByText("Kết quả test · 1/3 đúng")).toBeInTheDocument();
    expect(rows()[0]).toHaveClass("pass");
    expect(rows()[1]).toHaveClass("fail");
  });

  test("the first failed shown test opens its comparison under the row, with the first different line marked", () => {
    renderWithApp(<TestResultList result={wrong} />);
    const row = rows()[0]!;
    expect(within(row).getByText("Mong đợi").closest("details")).toBeNull();
    expect(within(row).getByText("Code của con in ra").closest("details")).toBeNull();
    expect([...row.querySelectorAll(".diff-line")].map((line) => line.textContent)).toEqual(["2\n", "3\n"]);
  });

  test("another failed shown test keeps its comparison in a closed details block", () => {
    renderWithApp(<TestResultList result={wrong} />);
    const row = rows()[1]!;
    const details = row.querySelector("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(within(details as HTMLElement).getByText("Xem so sánh").tagName).toBe("SUMMARY");
    expect(within(details as HTMLElement).getByText("Mong đợi")).toBeInTheDocument();
  });

  test("a hidden test shows no comparison", () => {
    renderWithApp(<TestResultList result={wrong} />);
    const row = rows()[2]!;
    expect(within(row).getByText("Test ẩn")).toBeInTheDocument();
    expect(within(row).queryByText("Mong đợi")).not.toBeInTheDocument();
    expect(row.querySelector("details")).toBeNull();
  });

  test("the input of a test is shown above its comparison, only when it has one", () => {
    const result: JudgeResult = { ...wrong, tests: [outcome({ index: 0, input: "7\n0\n" }), outcome({ index: 1 })] };
    renderWithApp(<TestResultList result={result} />);
    expect(within(rows()[0]!).getByText("Dữ liệu nhập")).toBeInTheDocument();
    expect(within(rows()[1]!).queryByText("Dữ liệu nhập")).not.toBeInTheDocument();
  });

  test("a test that did not run has a grey row and no comparison; the first comparison skips a hidden failed test", () => {
    const result: JudgeResult = {
      ...wrong,
      tests: [
        outcome({ index: 0, hidden: true }),
        outcome({ index: 1 }),
        outcome({ index: 2, ran: false, actual: "", firstDiffLine: null, outcome: null }),
      ],
    };
    renderWithApp(<TestResultList result={result} />);
    expect(rows()[2]).toHaveClass("not-run");
    expect(rows()[2]).toHaveTextContent("Test 3: Chưa chạy");
    expect(within(rows()[2]!).queryByText("Mong đợi")).not.toBeInTheDocument();
    expect(within(rows()[1]!).getByText("Mong đợi").closest("details")).toBeNull();
  });
});
