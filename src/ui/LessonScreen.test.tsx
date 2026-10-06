// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { fixtureLesson } from "../test/fixtures";
import { fakeRunner, okResult } from "../test/render";
import { renderWithGame } from "../test/renderGame";
import { LessonScreen } from "./LessonScreen";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; ariaLabel: string }) => (
    <textarea aria-label={props.ariaLabel} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}));

test("goes through cards, a code exercise and a question, then finishes", async () => {
  const onExit = vi.fn();
  const { store } = await renderWithGame(<LessonScreen lesson={fixtureLesson} onExit={onExit} />, {
    runner: fakeRunner(() => okResult("Hi\n")),
  });

  expect(screen.getByText("Thẻ 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Quay lại" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Thẻ 2/2")).toBeInTheDocument();
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
  await waitFor(async () => expect((await store.loadActive())?.state.progress.completedLessons).toEqual(["t.l1"]));
  await userEvent.click(screen.getByRole("button", { name: "Về danh sách bài" }));
  expect(onExit).toHaveBeenCalledOnce();
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
