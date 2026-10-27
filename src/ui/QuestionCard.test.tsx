// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
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

describe("QuestionCard kind label and choice marks", () => {
  const label = (name: string) => screen.getByRole("radio", { name }).closest("label")!;

  test("the kicker names the kind of the question", () => {
    const first = renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    expect(screen.getByText("Đoán kết quả")).toHaveClass("kicker");
    first.unmount();
    renderWithApp(<QuestionCard question={{ ...fixtureQuestion, type: "mcq" }} onAnswered={() => {}} />);
    expect(screen.getByText("Trắc nghiệm")).toHaveClass("kicker");
  });

  test("the card is a .card with the language switch in its head", () => {
    const { container } = renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    expect(container.firstElementChild).toHaveClass("card", "question-card");
    const head = screen.getByText("Đoán kết quả").parentElement!;
    expect(within(head).getByRole("group", { name: "Ngôn ngữ câu hỏi" })).toBeInTheDocument();
  });

  test("the chosen option has the selected class before the check", async () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    expect(label("Lỗi")).not.toHaveClass("choice-selected");
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    expect(label("Lỗi")).toHaveClass("choice", "choice-selected");
    expect(label("A")).not.toHaveClass("choice-selected");
    expect(label("Lỗi").querySelector("svg")).toBeNull();
  });

  test("after the check, the right answer has a check mark and the wrong choice a cross", async () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(label("Lỗi")).toHaveClass("choice-wrong");
    expect(label("Lỗi").querySelector('svg[data-icon="cross"]')).not.toBeNull();
    expect(label("A")).toHaveClass("choice-correct");
    expect(label("A").querySelector('svg[data-icon="check"]')).not.toBeNull();
    // The marks are read through a description, so the names of the radios stay the text of the choices.
    expect(screen.getByRole("radio", { name: "Lỗi" })).toHaveAccessibleDescription("Con chọn câu này, chưa đúng");
    expect(screen.getByRole("radio", { name: "A" })).toHaveAccessibleDescription("Đáp án đúng");
  });

  test("the mark text is outside the label, so it is not part of the name", async () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    await userEvent.click(screen.getByRole("radio", { name: "A" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    const mark = screen.getByText("Đáp án đúng");
    expect(mark).toHaveClass("sr-only");
    expect(mark.closest("label")).toBeNull();
    expect(label("A")).toHaveClass("choice-selected", "choice-correct");
    // A choice with no mark has no description.
    expect(screen.getByRole("radio", { name: "Lỗi" })).toHaveAccessibleDescription("");
    expect(screen.getByRole("radio", { name: "Lỗi" })).not.toHaveAttribute("aria-describedby");
  });
});

describe("QuestionCard choice style", () => {
  const mcq = {
    ...fixtureQuestion,
    id: "q.style",
    type: "mcq" as const,
    choices: [
      { text: { vi: "2 + 3", en: "2 + 3" }, correct: true, error: false, misconception: null },
      { text: { vi: "Báo lỗi", en: "An error" }, correct: false, error: true, misconception: null },
    ],
  };

  test("an mcq choice that is the same in vi and en is code; a translated choice is not", () => {
    renderWithApp(<QuestionCard question={mcq} onAnswered={() => {}} />);
    expect(screen.getByText("2 + 3")).toHaveClass("code");
    expect(screen.getByText("Báo lỗi")).not.toHaveClass("code");
  });

  test("every predict choice is code", () => {
    renderWithApp(<QuestionCard question={{ ...mcq, type: "predict" }} onAnswered={() => {}} />);
    expect(screen.getByText("Báo lỗi")).toHaveClass("code");
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

  test("the chosen option is yellow, but nothing tells right from wrong: no icon, class or description", async () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} exam />);
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    expect(screen.getByRole("radio", { name: "Lỗi" }).closest("label")).toHaveClass("choice-selected");
    const choices = screen.getByRole("group", { name: "Các lựa chọn" });
    expect(choices.querySelector('[data-icon="check"], [data-icon="cross"], .choice-correct, .choice-wrong')).toBeNull();
    expect(screen.getByRole("radio", { name: "Lỗi" })).toHaveAccessibleDescription("");
    expect(screen.getByRole("radio", { name: "A" })).toHaveAccessibleDescription("");
    expect(screen.getByRole("radio", { name: "Lỗi" })).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("radio", { name: "A" })).not.toHaveAttribute("aria-describedby");
  });
});
