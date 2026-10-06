import type { ChoiceQuestion, CodeExercise, Concept, ContentBundle, Lesson } from "../content/types";
import { fixtureErrors } from "./fixtures";

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
      { text: { vi: "Sai", en: "Wrong" }, correct: false, error: false, misconception: null },
    ],
    explanation: { vi: "Giải thích.", en: "Because." },
  };
}

export function examCode(id: string, concept: string): CodeExercise {
  return {
    id,
    type: "code",
    concepts: [concept],
    prompt: { vi: `In ra Hi (${id})`, en: `Print Hi (${id})` },
    starter: "",
    solution: 'print("Hi")',
    tests: [
      { input: "", output: "Hi", hidden: false },
      { input: "", output: "Hi", hidden: true },
    ],
    commonWrong: [],
    hints: [{ vi: "Dùng print." }],
    compare: { kind: "exact" },
    testEligible: true,
  };
}

function lesson(id: string, exercises: Lesson["exercises"]): Lesson {
  return {
    id,
    title: { vi: `Bài ${id}`, en: `Lesson ${id}` },
    cards: [{ segments: [{ kind: "html", html: `<p>${id}</p>` }] }],
    exercises,
  };
}

function concept(id: string, ai: boolean, level1: string[]): Concept {
  return {
    id,
    name: { vi: `Khái niệm ${id}`, en: `Concept ${id}` },
    ai,
    misconceptionCard: null,
    misconceptionHtml: null,
    parentTip: null,
    practice: { level1, level2: [], level3: [] },
  };
}

/**
 * 1 stage with 1 topic of 2 lessons, a topic test (3 questions + 1 code) and an evolution test (4 questions of which
 * 1 about AI + 1 code). 6 bank questions: x.q1-x.q4 on concept k1/k2, x.a1-x.a2 on the AI concept a1. Every right
 * answer is the choice "Đúng"; both code exercises are solved by printing Hi.
 */
export function examBundle(): ContentBundle {
  return {
    stages: [
      {
        id: "x",
        title: { vi: "Giai đoạn thi", en: "Exam stage" },
        topics: [
          {
            id: "x.t",
            title: { vi: "Chủ đề thi", en: "Exam topic" },
            lessons: [lesson("x.l1", [examCode("x.l1.ex1", "k1")]), lesson("x.l2", [examCode("x.l2.ex1", "k2")])],
            concepts: [
              concept("k1", false, ["x.q1", "x.q2"]),
              concept("k2", false, ["x.q3", "x.q4"]),
              concept("a1", true, []),
            ],
            questions: [
              question("x.q1", "x.l1", "k1"),
              question("x.q2", "x.l1", "k1"),
              question("x.q3", "x.l2", "k2"),
              question("x.q4", "x.l2", "k2"),
              question("x.a1", "x.l1", "a1"),
              question("x.a2", "x.l2", "a1"),
            ],
            reviews: [],
            practice: [],
            test: { questions: 3, code: 1 },
          },
        ],
        evolution: { questions: 4, ai: 1, code: 1 },
      },
    ],
    errors: fixtureErrors,
  };
}
