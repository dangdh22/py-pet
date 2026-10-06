// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { examCode } from "../test/examBundle";
import { errorResult, fakeRunner, okResult, renderWithApp } from "../test/render";
import { ExamCodeView } from "./ExamCodeView";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; errorLine: number | null; ariaLabel: string }) => (
    <textarea
      aria-label={props.ariaLabel}
      data-error-line={props.errorLine ?? ""}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    />
  ),
}));

const exercise = examCode("x.l1.ex1", "k1");

describe("ExamCodeView", () => {
  test("Run explains an error and marks the line; Submit shows no marks", async () => {
    const onSubmitted = vi.fn();
    const runner = fakeRunner(() =>
      errorResult({ type: "NameError", message: "name 'Robo' is not defined", line: 1, lineText: "print(Robo)" }),
    );
    renderWithApp(<ExamCodeView exercise={exercise} onSubmitted={onSubmitted} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText('Dòng 1: Python không biết "Robo" là gì.')).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveAttribute("data-error-line", "1");

    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    expect(await screen.findByText("Đã nộp bài. Kết quả hiện ở cuối bài.")).toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(onSubmitted.mock.calls[0][0].result.status).not.toBe("accepted");
    expect(screen.queryByText('Dòng 1: Python không biết "Robo" là gì.')).not.toBeInTheDocument();
    expect(screen.queryByText(/Đúng hết|Chính xác|test/)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveAttribute("data-error-line", "");
  });

  test("a correct run shows the output and no error", async () => {
    renderWithApp(<ExamCodeView exercise={exercise} onSubmitted={() => {}} />, { runner: fakeRunner(() => okResult("Hi\n")) });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("region", { name: "Kết quả" })).toHaveTextContent("Hi");
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveAttribute("data-error-line", "");
  });

  test("a failed submit asks the child to submit again, not to reload", async () => {
    const onSubmitted = vi.fn();
    const runner = fakeRunner(() => {
      throw new Error("worker died");
    });
    renderWithApp(<ExamCodeView exercise={exercise} onSubmitted={onSubmitted} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Chưa nộp được bài. Con bấm Nộp bài lần nữa nhé.");
    expect(screen.queryByText(/tải lại trang/)).not.toBeInTheDocument();
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Nộp bài" })).toBeEnabled();
  });

  test("a failed trial run still says Robo has a problem", async () => {
    const runner = fakeRunner(() => {
      throw new Error("worker died");
    });
    renderWithApp(<ExamCodeView exercise={exercise} onSubmitted={() => {}} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Robo/);
    expect(screen.queryByText(/Chưa nộp được bài/)).not.toBeInTheDocument();
  });
});
