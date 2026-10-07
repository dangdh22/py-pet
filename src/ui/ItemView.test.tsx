// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fixtureCodeExercise, fixtureQuestion } from "../test/fixtures";
import { fakeRunner, okResult } from "../test/render";
import { initialGameState } from "../game/state";
import { renderWithGame, TODAY } from "../test/renderGame";
import { reviewBundle, reviewCode, reviewFill } from "../test/reviewBundle";
import { ItemView } from "./ItemView";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; ariaLabel: string }) => (
    <textarea aria-label={props.ariaLabel} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}));

const bundle = reviewBundle();
const question = bundle.stages[0]!.topics[0]!.questions[0]!;

async function savedState(store: Awaited<ReturnType<typeof renderWithGame>>["store"]) {
  return (await store.loadActive())!.state;
}

describe("ItemView", () => {
  test("a wrong answer records the concept, the misconception, the Leitner box and the attempt", async () => {
    const onDone = vi.fn();
    const { store } = await renderWithGame(<ItemView item={question} source="review" onDone={onDone} />, { bundle });
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(onDone).toHaveBeenCalledWith({ correct: false });
    await waitFor(async () => expect((await savedState(store)).reviews["r.q1"]).toEqual({ box: 1, due: "2026-10-07" }));
    const state = await savedState(store);
    expect(state.mastery.c1).toMatchObject({ score: 0, recent: [0], reviewMisses: 1, misconceptions: 1 });
    expect(state.pet.xp).toBe(0);
    const [bundleOut] = await store.exportProfiles();
    expect(bundleOut!.attempts).toMatchObject([{ kind: "choice", itemId: "r.q1", correct: false }]);
  });

  test("a code exercise solved at the first submit is correct and updates the concept", async () => {
    const onDone = vi.fn();
    const { store } = await renderWithGame(<ItemView item={reviewCode} source="practice" onDone={onDone} />, {
      bundle,
      runner: fakeRunner(() => okResult("Hi\n")),
    });
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ correct: true }));
    await waitFor(async () => expect((await savedState(store)).mastery.c1?.score).toBe(30));
    expect((await savedState(store)).pet.xp).toBe(15);
  });

  test("outside a lesson the code starts from the starter, not from the lesson draft", async () => {
    await renderWithGame(<ItemView item={fixtureCodeExercise} source="review" onDone={() => {}} />, {
      drafts: { [fixtureCodeExercise.id]: 'print("Hi")' },
    });
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveValue("");
  });

  test("in a lesson the code starts from the saved draft", async () => {
    await renderWithGame(<ItemView item={fixtureCodeExercise} source="lesson" onDone={() => {}} />, {
      drafts: { [fixtureCodeExercise.id]: 'print("Hi")' },
    });
    expect(screen.getByRole("textbox", { name: "Trình soạn code" })).toHaveValue('print("Hi")');
  });

  test("a fill exercise solved after a failed submit is not counted as correct", async () => {
    const onDone = vi.fn();
    await renderWithGame(<ItemView item={reviewFill} source="review" onDone={onDone} />, {
      bundle,
      runner: fakeRunner((code) => okResult(code.includes('"Hi"') ? "Hi\n" : "")),
    });
    const submit = screen.getByRole("button", { name: "Nộp bài" });
    await userEvent.click(submit);
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.type(screen.getByRole("textbox", { name: "Chỗ trống 1" }), '"Hi"');
    await userEvent.click(submit);
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ correct: false }));
  });

  test("a wrong answer with a misconception shows its card, reports the concept and offers no practice inside", async () => {
    const onMisconception = vi.fn();
    await renderWithGame(<ItemView item={question} source="lesson" onDone={() => {}} onMisconception={onMisconception} />, {
      bundle,
    });
    await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    await userEvent.click(screen.getByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
    const card = screen.getByRole("region", { name: "Hiểu lầm thường gặp" });
    expect(card).toHaveTextContent("Hiểu lầm thường gặp: Khái niệm c1");
    expect(card).toHaveTextContent("Hiểu lầm về c1.");
    expect(onMisconception).toHaveBeenCalledWith("c1");
    expect(screen.queryByRole("link", { name: /Luyện thêm/ })).not.toBeInTheDocument();
  });

  test("a right answer shows no card and reports no misconception", async () => {
    const onMisconception = vi.fn();
    await renderWithGame(<ItemView item={question} source="lesson" onDone={() => {}} onMisconception={onMisconception} />, {
      bundle,
    });
    await userEvent.click(screen.getByRole("radio", { name: "Đúng" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(screen.queryByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" })).not.toBeInTheDocument();
    expect(onMisconception).not.toHaveBeenCalled();
  });

  test("a code misconception found by the judge offers its card", async () => {
    const code = { ...reviewCode, commonWrong: [{ test: 0, output: "hi", misconception: "c2", sample: 'print("hi")' }] };
    const onMisconception = vi.fn();
    await renderWithGame(<ItemView item={code} source="lesson" onDone={() => {}} onMisconception={onMisconception} />, {
      bundle,
      runner: fakeRunner(() => okResult("hi\n")),
    });
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await userEvent.click(await screen.findByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
    expect(screen.getByRole("region", { name: "Hiểu lầm thường gặp" })).toHaveTextContent("Khái niệm c2");
    expect(onMisconception).toHaveBeenCalledWith("c2");
  });

  test("misconception ids that are not concepts are dropped before the event and the card", async () => {
    const code = {
      ...reviewCode,
      commonWrong: [
        { test: 0, output: "hi", misconception: "nope", sample: 'print("hi")' },
        { test: 0, output: "hi", misconception: "c2", sample: 'print("hi")' },
      ],
    };
    const onMisconception = vi.fn();
    const { store } = await renderWithGame(
      <ItemView item={code} source="lesson" onDone={() => {}} onMisconception={onMisconception} />,
      { bundle, runner: fakeRunner(() => okResult("hi\n", { usedInputPrompt: true })) },
    );
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await userEvent.click(await screen.findByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
    expect(screen.getByRole("region", { name: "Hiểu lầm thường gặp" })).toHaveTextContent("Khái niệm c2");
    expect(onMisconception.mock.calls).toEqual([["c2"]]);
    await waitFor(async () => expect((await savedState(store)).mastery.c2).toMatchObject({ misconceptions: 1 }));
    const mastery = (await savedState(store)).mastery;
    expect(mastery.nope).toBeUndefined();
  });

  test("a misconception that is not a concept shows no card", async () => {
    const code = { ...reviewCode, commonWrong: [{ test: 0, output: "hi", misconception: "nope", sample: 'print("hi")' }] };
    const onMisconception = vi.fn();
    const { store } = await renderWithGame(
      <ItemView item={code} source="lesson" onDone={() => {}} onMisconception={onMisconception} />,
      { bundle, runner: fakeRunner(() => okResult("hi\n")) },
    );
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await waitFor(async () => expect((await savedState(store)).progress.exerciseStats?.[reviewCode.id]?.fails).toBe(1));
    expect(screen.queryByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" })).not.toBeInTheDocument();
    expect(onMisconception).not.toHaveBeenCalled();
    expect((await savedState(store)).mastery.nope).toBeUndefined();
  });

  describe("a misconception of a later stage", () => {
    const code = {
      ...reviewCode,
      commonWrong: [
        { test: 0, output: "hi", misconception: "later", sample: 'print("hi")' },
        { test: 0, output: "hi", misconception: "c2", sample: 'print("hi")' },
      ],
    };
    const base = reviewBundle();
    const stage1 = base.stages[0]!;
    const laterConcept = { ...stage1.topics[0]!.concepts[1]!, id: "later", name: { vi: "Khái niệm later", en: "Concept later" } };
    const twoStages = {
      ...base,
      stages: [
        stage1,
        { ...stage1, id: "r2", topics: [{ ...stage1.topics[0]!, id: "r2.topic", lessons: [], questions: [], practice: [], concepts: [laterConcept] }] },
      ],
    };
    const submit = async (petStage: number) => {
      const state = initialGameState(TODAY);
      state.pet.stage = petStage;
      const onMisconception = vi.fn();
      const { store } = await renderWithGame(
        <ItemView item={code} source="lesson" onDone={() => {}} onMisconception={onMisconception} />,
        { bundle: twoStages, state, runner: fakeRunner(() => okResult("hi\n")) },
      );
      await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
      await waitFor(async () => expect((await savedState(store)).progress.exerciseStats?.[code.id]?.fails).toBe(1));
      return { store, onMisconception };
    };

    test("a stage 1 child gets no mastery entry and no card for it", async () => {
      const { store, onMisconception } = await submit(1);
      expect((await savedState(store)).mastery.later).toBeUndefined();
      expect((await savedState(store)).mastery.c2).toMatchObject({ misconceptions: 1 });
      await userEvent.click(await screen.findByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
      expect(screen.getByRole("region", { name: "Hiểu lầm thường gặp" })).toHaveTextContent("Khái niệm c2");
      expect(onMisconception.mock.calls).toEqual([["c2"]]);
    });

    test("a choice tagged with a concept of a later stage is not recorded for a stage 1 child", async () => {
      const question = {
        ...fixtureQuestion,
        choices: [
          { text: { vi: "A", en: "A" }, correct: true, error: false, misconception: null },
          { text: { vi: "Sai", en: "Wrong" }, correct: false, error: false, misconception: "later" },
        ],
      };
      const state = initialGameState(TODAY);
      const { store } = await renderWithGame(<ItemView item={question} source="lesson" onDone={() => {}} />, { bundle: twoStages, state });
      await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
      await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
      await waitFor(async () => expect((await savedState(store)).reviews[question.id]).toBeDefined());
      expect((await savedState(store)).mastery.later).toBeUndefined();
    });

    test("a stage 2 child gets both", async () => {
      const { store, onMisconception } = await submit(2);
      expect((await savedState(store)).mastery.later).toMatchObject({ misconceptions: 1 });
      expect((await savedState(store)).mastery.c2).toMatchObject({ misconceptions: 1 });
      await userEvent.click(await screen.findByRole("button", { name: "Xem thẻ Hiểu lầm thường gặp" }));
      expect(screen.getByRole("region", { name: "Hiểu lầm thường gặp" })).toHaveTextContent("Khái niệm later");
      expect(onMisconception.mock.calls).toEqual([["later"]]);
    });
  });
});
