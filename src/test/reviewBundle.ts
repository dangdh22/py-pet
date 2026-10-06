import type {
  ChoiceQuestion,
  CodeExercise,
  Concept,
  ContentBundle,
  FillExercise,
  Lesson,
  ParsonsExercise,
} from "../content/types";
import { fixtureErrors } from "./fixtures";

const tests = [{ input: "", output: "Hi", hidden: false }];

function question(id: string, lesson: string, concept: string): ChoiceQuestion {
  return {
    id,
    type: "mcq",
    concepts: [concept],
    lessons: [lesson],
    code: null,
    prompt: { vi: `Câu ${id}?`, en: `Question ${id}?` },
    choices: [
      { text: { vi: "Đúng", en: "Right" }, correct: true, error: false, misconception: null },
      { text: { vi: "Sai", en: "Wrong" }, correct: false, error: false, misconception: concept },
    ],
    explanation: { vi: "Giải thích.", en: "Because." },
  };
}

export const reviewCode: CodeExercise = {
  id: "r.l1.ex1",
  type: "code",
  concepts: ["c1"],
  prompt: { vi: "In ra Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests,
  commonWrong: [],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};

export const reviewParsons: ParsonsExercise = {
  id: "r.p1",
  type: "parsons",
  concepts: ["c1"],
  prompt: { vi: "Sắp xếp để in ra Hi rồi Bye" },
  lines: ['print("Hi")', 'print("Bye")'],
  solution: 'print("Hi")\nprint("Bye")\n',
  tests: [{ input: "", output: "Hi\nBye", hidden: false }],
  hints: [{ vi: "Hi đứng trước." }],
  compare: { kind: "exact" },
  testEligible: false,
};

export const reviewFill: FillExercise = {
  id: "r.f1",
  type: "fill",
  concepts: ["c2"],
  prompt: { vi: "Điền để in ra Hi" },
  template: "print(___)\n",
  answers: ['"Hi"'],
  solution: 'print("Hi")\n',
  tests,
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};

function lesson(id: string, exercises: Lesson["exercises"] = []): Lesson {
  return { id, title: { vi: `Bài ${id}`, en: `Lesson ${id}` }, cards: [{ segments: [{ kind: "html", html: `<p>${id}</p>` }] }], exercises };
}

function concept(id: string, practice: Concept["practice"]): Concept {
  return {
    id,
    name: { vi: `Khái niệm ${id}`, en: `Concept ${id}` },
    ai: false,
    misconceptionCard: `Hiểu lầm về **${id}**.`,
    misconceptionHtml: `<p>Hiểu lầm về <strong>${id}</strong>.</p>`,
    parentTip: null,
    practice,
  };
}

/**
 * 3 lessons with a review station after lesson 2, 6 bank questions, 1 code exercise in lesson 1 and a parsons and a
 * fill practice exercise. Concept c1: r.q1, r.q2, r.q5, r.l1.ex1, r.p1. Concept c2: r.q3, r.q4, r.q6, r.f1.
 */
export function reviewBundle(): ContentBundle {
  return {
    stages: [
      {
        id: "r",
        title: { vi: "Giai đoạn ôn", en: "Review stage" },
        topics: [
          {
            id: "r.topic",
            title: { vi: "Chủ đề ôn", en: "Review topic" },
            lessons: [lesson("r.l1", [reviewCode]), lesson("r.l2"), lesson("r.l3")],
            concepts: [
              concept("c1", { level1: ["r.q1"], level2: ["r.p1"], level3: ["r.l1.ex1"] }),
              concept("c2", { level1: ["r.q3"], level2: ["r.f1"], level3: [] }),
            ],
            questions: [
              question("r.q1", "r.l1", "c1"),
              question("r.q2", "r.l1", "c1"),
              question("r.q3", "r.l2", "c2"),
              question("r.q4", "r.l2", "c2"),
              question("r.q5", "r.l3", "c1"),
              question("r.q6", "r.l1", "c2"),
            ],
            reviews: [{ id: "r.r1", after: "r.l2" }],
            practice: [reviewParsons, reviewFill],
            test: { questions: 0, code: 0 },
          },
        ],
        evolution: { questions: 0, ai: 0, code: 0 },
      },
    ],
    errors: fixtureErrors,
  };
}
