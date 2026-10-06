import { expect, test } from "vitest";
import { allExercises, allLessons, findLesson } from "./lookup";
import type { ChoiceQuestion, CodeExercise, ContentBundle, Lesson } from "./types";

const code: CodeExercise = {
  id: "a.l1.ex1",
  type: "code",
  concepts: [],
  prompt: { vi: "In ra Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests: [{ input: "", output: "Hi", hidden: false }],
  commonWrong: [],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};
const question: ChoiceQuestion = {
  id: "a.b1",
  type: "mcq",
  concepts: [],
  lessons: ["a.l1"],
  code: null,
  prompt: { vi: "Hỏi?", en: "Question?" },
  choices: [
    { text: { vi: "Có", en: "Yes" }, correct: true, error: false, misconception: null },
    { text: { vi: "Không", en: "No" }, correct: false, error: false, misconception: null },
  ],
  explanation: { vi: "Vì vậy.", en: "Because." },
};
const lesson1: Lesson = { id: "a.l1", title: { vi: "Bài 1" }, cards: [], exercises: [code] };
const lesson2: Lesson = { id: "a.l2", title: { vi: "Bài 2" }, cards: [], exercises: [] };
const bundle: ContentBundle = {
  stages: [
    {
      id: "s1",
      title: { vi: "Giai đoạn 1" },
      topics: [{ id: "a", title: { vi: "A" }, lessons: [lesson1, lesson2], concepts: [], questions: [question] }],
    },
  ],
  errors: [],
};

test("allLessons lists lessons in order", () => {
  expect(allLessons(bundle).map((l) => l.id)).toEqual(["a.l1", "a.l2"]);
});

test("findLesson finds by id", () => {
  expect(findLesson(bundle, "a.l2")).toBe(lesson2);
  expect(findLesson(bundle, "missing")).toBeUndefined();
});

test("allExercises includes lesson exercises and bank questions", () => {
  expect(allExercises(bundle).map((e) => e.id)).toEqual(["a.l1.ex1", "a.b1"]);
});
