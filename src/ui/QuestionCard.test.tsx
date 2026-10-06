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
    expect(onAnswered).toHaveBeenCalledWith(true);
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
    expect(onAnswered).toHaveBeenCalledWith(false);
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
});
