// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { RunnerCrashError } from "../runner/client";
import { fixtureLesson } from "../test/fixtures";
import { errorResult, fakeRunner, okResult, renderWithApp } from "../test/render";
import { CardView } from "./CardView";
import { OUTPUT_DISPLAY_LIMIT, OutputPanel } from "./OutputPanel";

const card = fixtureLesson.cards[0]!;

describe("CardView", () => {
  test("renders text and runs an example", async () => {
    const runner = fakeRunner(() => okResult("Xin chào\n"));
    renderWithApp(<CardView card={card} />, { runner });
    expect(screen.getByText("Thẻ một")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("region", { name: "Kết quả" })).toHaveTextContent("Xin chào");
    expect(runner.calls).toEqual([{ code: 'print("Xin chào")', stdin: "" }]);
  });

  test("explains an error from an example", async () => {
    const runner = fakeRunner(() => errorResult({ type: "NameError", message: "name 'Robo' is not defined", line: 1 }));
    renderWithApp(<CardView card={card} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText('Dòng 1: Python không biết "Robo" là gì.')).toBeInTheDocument();
    expect(screen.getByText("Đặt chữ trong dấu nháy.")).toBeInTheDocument();
  });

  test("explains a timeout", async () => {
    renderWithApp(<CardView card={card} />, { runner: fakeRunner(() => okResult("", { outcome: "timeout" })) });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText("Code chạy lâu quá.")).toBeInTheDocument();
  });

  test("shows a crash message when the runner fails", async () => {
    const runner = fakeRunner(() => {
      throw new RunnerCrashError("worker crashed");
    });
    renderWithApp(<CardView card={card} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText("Robo bị trục trặc rồi. Con tải lại trang nhé.")).toBeInTheDocument();
  });

  test("a crash on a second run removes the old output", async () => {
    let calls = 0;
    const runner = fakeRunner(() => {
      calls += 1;
      if (calls === 1) return okResult("Xin chào\n");
      throw new RunnerCrashError("worker crashed");
    });
    renderWithApp(<CardView card={card} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("region", { name: "Kết quả" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText("Robo bị trục trặc rồi. Con tải lại trang nhé.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Kết quả" })).not.toBeInTheDocument();
  });

  test("disables Run until the runner is ready", () => {
    renderWithApp(<CardView card={card} />, { runner: fakeRunner(() => okResult(""), "loading") });
    expect(screen.getByRole("button", { name: "Chạy thử" })).toBeDisabled();
  });

  test("shows a code block that cannot run without a Run button", () => {
    renderWithApp(<CardView card={{ segments: [{ kind: "code", code: "x = 1", run: false, expectError: false }] }} />);
    expect(screen.getByText("x = 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chạy thử" })).not.toBeInTheDocument();
  });
});

describe("OutputPanel", () => {
  test("says when nothing is printed", () => {
    renderWithApp(<OutputPanel stdout="" />);
    expect(screen.getByRole("region", { name: "Kết quả" })).toHaveTextContent("(Chương trình không in ra gì)");
  });

  test("cuts very long output", () => {
    renderWithApp(<OutputPanel stdout={"a".repeat(OUTPUT_DISPLAY_LIMIT + 5)} />);
    expect(screen.getByText("(Kết quả quá dài, chỉ hiện phần đầu)")).toBeInTheDocument();
  });
});
