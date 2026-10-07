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

  describe("a misconception of a later stage", () => {
    const base = examBundle();
    const stage1 = base.stages[0]!;
    const topic = stage1.topics[0]!;
    const wrong = [
      { test: 0, output: "hi", misconception: "later", sample: 'print("hi")' },
      { test: 0, output: "hi", misconception: "k2", sample: 'print("hi")' },
    ];
    const laterConcept = { ...topic.concepts[1]!, id: "later" };
    const twoStages = {
      ...base,
      stages: [
        {
          ...stage1,
          topics: [
            {
              ...topic,
              lessons: topic.lessons.map((l) => ({
                ...l,
                exercises: l.exercises.map((e) => (e.type === "code" ? { ...e, commonWrong: wrong } : e)),
              })),
            },
          ],
        },
        { ...stage1, id: "y", topics: [{ ...topic, id: "y.t", lessons: [], questions: [], concepts: [laterConcept] }] },
      ],
    };
    const codeItem = findItem(twoStages, "x.l1.ex1") as ExamItem;

    const submit = async (petStage: number) => {
      const state = initialGameState(TODAY);
      state.pet.stage = petStage;
      const { store } = await renderWithGame(<ExamRunner title="Đề" items={[codeItem]} onFinish={() => {}} />, {
        bundle: twoStages,
        state,
        runner: fakeRunner(() => okResult("hi\n")),
      });
      await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
      await screen.findByText("Đã nộp bài. Kết quả hiện ở cuối bài.");
      await waitFor(async () => expect((await store.loadActive())!.state.mastery.k2).toBeDefined());
      return (await store.loadActive())!.state.mastery;
    };

    test("a stage 1 child gets no mastery entry for it", async () => {
      const mastery = await submit(1);
      expect(mastery.later).toBeUndefined();
      expect(mastery.k2).toMatchObject({ misconceptions: 1 });
    });

    test("a stage 2 child gets both", async () => {
      const mastery = await submit(2);
      expect(mastery.later).toMatchObject({ misconceptions: 1 });
      expect(mastery.k2).toMatchObject({ misconceptions: 1 });
    });
  });
});
