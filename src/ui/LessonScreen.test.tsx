// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { fixtureLesson } from "../test/fixtures";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame } from "../test/renderGame";
import { reviewBundle } from "../test/reviewBundle";
import { LessonScreen } from "./LessonScreen";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; ariaLabel: string }) => (
    <textarea aria-label={props.ariaLabel} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}));

test("goes through the lesson, records the attempts and shows the rewards", async () => {
  const onExit = vi.fn();
  const { store } = await renderWithGame(<LessonScreen lesson={fixtureLesson} onExit={onExit} />, {
    runner: fakeRunner(() => okResult("Hi\n")),
  });

  expect(screen.getByText("Thẻ 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Quay lại" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Thẻ 2/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Quay lại" })).toBeEnabled();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Bài tập 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
  expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Bài tập 2/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hoàn thành" })).toBeDisabled();
  await userEvent.click(screen.getByRole("radio", { name: "A" }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));

  expect(screen.getByText("Hoàn thành bài học!")).toBeInTheDocument();
  expect(screen.getByText("+28 XP")).toBeInTheDocument();
  expect(screen.getByText("+8 xu")).toBeInTheDocument();
  expect(screen.getByText("Pin +1")).toBeInTheDocument();
  expect(screen.getByText("Mục tiêu hôm nay: 1/2")).toBeInTheDocument();
  expect(screen.getByText("Chuỗi: 0 ngày")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Học tiếp" })).toHaveAttribute("href", "#/lesson/t.l2");

  await waitFor(async () => expect((await store.loadActive())?.state.pet.xp).toBe(28));
  const [bundle] = await store.exportProfiles();
  expect(bundle!.attempts.map((a) => [a.kind, a.itemId])).toEqual([
    ["code", "t.l1.ex1"],
    ["choice", "t.l1.q1"],
  ]);
  await userEvent.click(screen.getByRole("button", { name: "Về phòng" }));
  expect(onExit).toHaveBeenCalledOnce();
});

test("restores and saves the code draft of an exercise", async () => {
  const { store } = await renderWithGame(<LessonScreen lesson={{ ...fixtureLesson, cards: [] }} onExit={() => {}} />, {
    drafts: { "t.l1.ex1": "print(42)" },
  });
  const editor = screen.getByRole("textbox", { name: "Trình soạn code" });
  expect(editor).toHaveValue("print(42)");
  await userEvent.type(editor, "!");
  await waitFor(async () => expect((await store.loadActive())?.drafts.get("t.l1.ex1")).toBe("print(42)!"));
});

test("a new card starts without the output of the previous card", async () => {
  const lesson = {
    ...fixtureLesson,
    cards: [fixtureLesson.cards[0]!, { segments: [{ kind: "code" as const, code: "print(2)", run: true, expectError: false }] }],
    exercises: [],
  };
  await renderWithGame(<LessonScreen lesson={lesson} onExit={() => {}} />, {
    runner: fakeRunner(() => okResult("Xin chào\n")),
  });
  await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
  expect(await screen.findByRole("region", { name: "Kết quả" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.queryByRole("region", { name: "Kết quả" })).not.toBeInTheDocument();
});

test("a reload keeps the viewed solution, so a later correct submit pays only 3 XP", async () => {
  const lesson = { ...fixtureLesson, cards: [], exercises: [fixtureLesson.exercises[0]!] };
  const first = await renderWithGame(<LessonScreen lesson={lesson} onExit={() => {}} />, {
    runner: fakeRunner(() => okResult("x\n")),
  });
  for (let n = 0; n < 3; n += 1) {
    await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Nộp bài" })).toBeEnabled());
  }
  await userEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
  await userEvent.click(screen.getByRole("button", { name: "Xem lời giải" }));
  await waitFor(async () =>
    expect((await first.store.loadActive())?.state.progress.exerciseStats?.["t.l1.ex1"]).toEqual({
      fails: 3,
      hints: 1,
      viewedSolution: true,
    }),
  );
  const saved = (await first.store.loadActive())!.state;
  first.unmount();

  const second = await renderWithGame(<LessonScreen lesson={lesson} onExit={() => {}} />, {
    state: saved,
    runner: fakeRunner(() => okResult("Hi\n")),
  });
  expect(screen.getByText("Lời giải mẫu")).toBeInTheDocument();
  expect(screen.getByText("Gợi ý 1: Dùng print")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hoàn thành" })).toBeEnabled();
  await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
  expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
  await waitFor(async () => expect((await second.store.loadActive())?.state.progress.solvedExercises).toEqual(["t.l1.ex1"]));
  const after = (await second.store.loadActive())!.state;
  expect(after.pet.xp).toBe(3);
  expect(after.wallet.xu).toBe(0);
});

/** Lesson r.l1 of the review bundle with 1 question whose wrong answer shows the misconception card of `misconception`. */
function misconceptionLesson(misconception: string) {
  const bundle = reviewBundle();
  const topic = bundle.stages[0]!.topics[0]!;
  const base = topic.questions[0]!;
  const question = {
    ...base,
    id: "r.l1.q",
    choices: base.choices.map((choice) => (choice.correct ? choice : { ...choice, misconception })),
  };
  topic.lessons[0] = { ...topic.lessons[0]!, exercises: [question] };
  return { bundle, lesson: topic.lessons[0] };
}

async function finishWithWrongAnswer() {
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  await userEvent.click(screen.getByRole("radio", { name: "Sai" }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
  expect(screen.getByText("Hoàn thành bài học!")).toBeInTheDocument();
}

test("a misconception in the lesson offers its practice after the lesson", async () => {
  const { bundle, lesson } = misconceptionLesson("c1");
  await renderWithGame(<LessonScreen lesson={lesson} onExit={() => {}} />, { bundle });
  await finishWithWrongAnswer();
  expect(screen.getByRole("link", { name: "Luyện thêm: Khái niệm c1" })).toHaveAttribute("href", "#/practice/c1");
});

test("a misconception without practice items offers no practice link", async () => {
  const { bundle, lesson } = misconceptionLesson("c2");
  const topic = bundle.stages[0]!.topics[0]!;
  topic.questions = topic.questions.filter((q) => q.id !== "r.q6");
  topic.practice = topic.practice.filter((item) => item.id !== "r.f1");
  await renderWithGame(<LessonScreen lesson={lesson} onExit={() => {}} />, { bundle });
  await finishWithWrongAnswer();
  expect(screen.queryByRole("link", { name: /^Luyện thêm/ })).not.toBeInTheDocument();
});
