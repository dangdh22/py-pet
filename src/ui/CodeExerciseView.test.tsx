// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fixtureCodeExercise } from "../test/fixtures";
import { errorResult, fakeRunner, okResult, renderWithApp } from "../test/render";
import { CodeExerciseView } from "./CodeExerciseView";

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

const editor = () => screen.getByRole("textbox", { name: "Trình soạn code" });
const submitButton = () => screen.getByRole("button", { name: "Nộp bài" });

async function submitOnce() {
  await userEvent.click(submitButton());
  await waitFor(() => expect(submitButton()).toBeEnabled());
}

describe("CodeExerciseView", () => {
  test("shows the prompt, the example and the starter code", () => {
    renderWithApp(<CodeExerciseView exercise={{ ...fixtureCodeExercise, starter: "# code" }} onComplete={() => {}} />);
    expect(screen.getByText("In ra Hi")).toBeInTheDocument();
    expect(screen.getByText("Kết quả mong đợi")).toBeInTheDocument();
    expect(editor()).toHaveValue("# code");
  });

  test("Run sends the code and the input, then shows the output", async () => {
    const runner = fakeRunner(() => okResult("Hi\n"));
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, { runner });
    await userEvent.type(editor(), 'print("Hi")');
    await userEvent.type(screen.getByRole("textbox", { name: "Dữ liệu nhập (Input)" }), "5");
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("region", { name: "Kết quả" })).toHaveTextContent("Hi");
    expect(runner.calls).toEqual([{ code: 'print("Hi")', stdin: "5" }]);
  });

  test("Run explains an error and marks the error line", async () => {
    const runner = fakeRunner(() =>
      errorResult({ type: "NameError", message: "name 'Robo' is not defined", line: 1, lineText: "print(Robo)" }),
    );
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText('Dòng 1: Python không biết "Robo" là gì.')).toBeInTheDocument();
    expect(editor()).toHaveAttribute("data-error-line", "1");
  });

  test("Submit accepts a correct answer", async () => {
    const onComplete = vi.fn();
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={onComplete} />, {
      runner: fakeRunner(() => okResult("Hi\n")),
    });
    await userEvent.click(submitButton());
    expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith("solved");
  });

  test("Submit shows the failed tests without leaking hidden data", async () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, {
      runner: fakeRunner(() => okResult("Hello\n")),
    });
    await userEvent.click(submitButton());
    expect(await screen.findByText("Đúng 0/2 test. Xem test bị sai ở bên dưới nhé.")).toBeInTheDocument();
    const results = screen.getByRole("list", { name: "Kết quả chấm" });
    expect(within(results).getAllByText("Mong đợi")).toHaveLength(1);
    expect(within(results).getAllByText("Code của con in ra")).toHaveLength(1);
    expect(within(results).getByText("Test ẩn")).toBeInTheDocument();
  });

  test("hints appear one by one", async () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
    expect(screen.getByText("Gợi ý 1: Dùng print")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý tiếp" }));
    expect(screen.getByText("Gợi ý 2: Nhớ dấu nháy")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gợi ý tiếp" })).not.toBeInTheDocument();
  });

  test("the solution appears only after 3 failed submits", async () => {
    const onComplete = vi.fn();
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={onComplete} />, {
      runner: fakeRunner(() => okResult("x\n")),
    });
    await submitOnce();
    await submitOnce();
    expect(screen.queryByRole("button", { name: "Xem lời giải" })).not.toBeInTheDocument();
    await submitOnce();
    await userEvent.click(screen.getByRole("button", { name: "Xem lời giải" }));
    expect(screen.getByText("Lời giải mẫu")).toBeInTheDocument();
    expect(screen.getByText('print("Hi")')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith("viewed-solution");
  });

  test("disables Run and Submit until the runner is ready", () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, {
      runner: fakeRunner(() => okResult(""), "loading"),
    });
    expect(screen.getByRole("button", { name: "Chạy thử" })).toBeDisabled();
    expect(submitButton()).toBeDisabled();
  });

  test("shows the English prompt when the interface is English", () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, { lang: "en" });
    expect(screen.getByText("Print Hi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
