// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fixtureQuestion } from "../test/fixtures";
import { renderWithApp } from "../test/render";
import { QuestionCard } from "./QuestionCard";

describe("QuestionCard", () => {
  test("shows the Vietnamese prompt and the code", () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    expect(screen.getByText("In ra gì?")).toBeInTheDocument();
    expect(screen.getByText('print("A")')).toBeInTheDocument();
  });

  test("checks a correct answer", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} />);
    const check = screen.getByRole("button", { name: "Kiểm tra" });
    expect(check).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "A" }));
    await userEvent.click(check);
    expect(onAnswered).toHaveBeenCalledWith(true, { choiceIndex: 0, lang: "vi" });
    expect(screen.getByText("Chính xác!")).toBeInTheDocument();
    expect(screen.getByText("Lệnh print in ra A.")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "A" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Kiểm tra" })).not.toBeInTheDocument();
  });

  test("checks a wrong answer", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} />);
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(onAnswered).toHaveBeenCalledWith(false, { choiceIndex: 1, lang: "vi" });
    expect(screen.getByText("Chưa đúng rồi.")).toBeInTheDocument();
  });

  test("switches the question language", async () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("What is printed?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Error" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "VI + EN" }));
    expect(screen.getByText("In ra gì?")).toBeInTheDocument();
    expect(screen.getByText("What is printed?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Lỗi / Error" })).toBeInTheDocument();
  });

  test("reports the chosen index and the question language", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} />);
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    await userEvent.click(screen.getByRole("radio", { name: "Error" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(onAnswered).toHaveBeenCalledWith(false, { choiceIndex: 1, lang: "en" });
  });
});

describe("QuestionCard choice order", () => {
  const question = (id: string) => ({
    ...fixtureQuestion,
    id,
    choices: ["A", "B", "C", "D"].map((text, i) => ({ text: { vi: text, en: text }, correct: i === 0, error: false, misconception: null })),
  });
  const shown = () => screen.getAllByRole("radio").map((radio) => radio.closest("label")!.textContent);

  test("is shuffled by the question ID, the same on every render, and answers keep their content index", async () => {
    const onAnswered = vi.fn();
    const first = renderWithApp(<QuestionCard question={question("q.order")} onAnswered={onAnswered} />);
    const order = shown();
    expect([...order].sort()).toEqual(["A", "B", "C", "D"]);
    first.unmount();
    renderWithApp(<QuestionCard question={question("q.order")} onAnswered={onAnswered} />);
    expect(shown()).toEqual(order);
    await userEvent.click(screen.getByRole("radio", { name: "C" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(onAnswered).toHaveBeenCalledWith(false, { choiceIndex: 2, lang: "vi" });
  });

  test("the right answer is not always shown first", () => {
    const firsts = new Set<string | null>();
    for (const id of ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"]) {
      const view = renderWithApp(<QuestionCard question={question(id)} onAnswered={() => {}} />);
      firsts.add(shown()[0] ?? null);
      view.unmount();
    }
    expect(firsts.size).toBeGreaterThan(1);
  });
});

describe("QuestionCard in a test", () => {
  test("records the answer without marks or explanation", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} exam />);
    expect(screen.queryByRole("button", { name: "Kiểm tra" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    expect(onAnswered).toHaveBeenCalledWith(false, { choiceIndex: 1, lang: "vi" });
    expect(screen.getByText("Đã ghi nhận câu trả lời. Kết quả hiện ở cuối bài.")).toBeInTheDocument();
    expect(screen.queryByText("Chưa đúng rồi.")).not.toBeInTheDocument();
    expect(screen.queryByText("Lệnh print in ra A.")).not.toBeInTheDocument();
    expect(document.querySelector(".choice-wrong, .choice-correct")).toBeNull();
    expect(screen.getByRole("radio", { name: "Lỗi" })).toBeDisabled();
  });
});
