// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { findItem } from "../content/lookup";
import type { ExamItem } from "../game/exam";
import { initialGameState } from "../game/state";
import { examBundle } from "../test/examBundle";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame, TODAY } from "../test/renderGame";
import { ExamRunner, formatScore } from "./ExamRunner";

const bundle = examBundle();
const items = ["x.q1", "x.l1.ex1"].map((id) => findItem(bundle, id) as ExamItem);

describe("formatScore", () => {
  test("writes at most 1 decimal, with a comma in Vietnamese", () => {
    expect(formatScore(19, "vi")).toBe("19");
    expect(formatScore(19.25, "vi")).toBe("19,3");
    expect(formatScore(19.25, "en")).toBe("19.3");
  });
});

describe("ExamRunner", () => {
  test("1 item per card; the answers are recorded as test answers and handed in at the end", async () => {
    const onFinish = vi.fn();
    const runner = fakeRunner(() => okResult("Hi\n"));
    const { store } = await renderWithGame(<ExamRunner title="Đề thử" items={items} onFinish={onFinish} />, {
      bundle,
      runner,
      state: initialGameState(TODAY),
    });
    expect(screen.getByRole("heading", { name: "Đề thử" })).toBeInTheDocument();
    expect(screen.getByText("Câu 1/2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));

    expect(screen.getByText("In ra Hi (x.l1.ex1)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /gợi ý/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nộp bài kiểm tra" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    expect(await screen.findByText("Đã nộp bài. Kết quả hiện ở cuối bài.")).toBeInTheDocument();
    expect(screen.queryByText("Chính xác!")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nộp bài" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài kiểm tra" }));

    expect(onFinish).toHaveBeenCalledWith([
      { kind: "choice", correct: false },
      { kind: "code", passed: 2, total: 2 },
    ]);
    await waitFor(async () => expect(Object.keys((await store.loadActive())!.state.mastery)).toContain("k1"));
    const saved = (await store.loadActive())!.state;
    expect(saved.pet.xp).toBe(0);
    expect(saved.wallet.xu).toBe(0);
    expect(saved.progress.answeredQuestions).toEqual([]);
  });

  test("an empty paper says so and can still be handed in", async () => {
    const onFinish = vi.fn();
    await renderWithGame(<ExamRunner title="Đề trống" items={[]} onFinish={onFinish} />, { bundle });
    expect(screen.getByText("Chưa có câu hỏi cho bài kiểm tra này.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài kiểm tra" }));
    expect(onFinish).toHaveBeenCalledWith([]);
  });
});
