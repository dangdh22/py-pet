import type { ChoiceQuestion, CodeExercise, ContentBundle, ErrorEntry, Lesson } from "../content/types";

export const fixtureErrors: ErrorEntry[] = [
  {
    id: "name-undefined",
    match: { type: "NameError", message: "^name '(?<name>\\w+)' is not defined$", check: null },
    explain: { vi: 'Dòng {line}: Python không biết "{name}" là gì.', en: 'Line {line}: Python does not know "{name}".' },
    hint: { vi: "Đặt chữ trong dấu nháy.", en: "Put the text in quotes." },
    misconception: "string-quotes",
    sample: "print(Robo)",
    sampleInput: "",
  },
  {
    id: "timeout",
    match: { type: "Timeout", message: null, check: null },
    explain: { vi: "Code chạy lâu quá.", en: "The code ran too long." },
    hint: null,
    misconception: null,
    sample: "while True:\n    pass",
    sampleInput: "",
  },
];

export const fixtureCodeExercise: CodeExercise = {
  id: "t.l1.ex1",
  type: "code",
  concepts: [],
  prompt: { vi: "In ra Hi", en: "Print Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests: [
    { input: "", output: "Hi", hidden: false },
    { input: "", output: "Hi", hidden: true },
  ],
  commonWrong: [],
  hints: [{ vi: "Dùng print" }, { vi: "Nhớ dấu nháy" }],
  compare: { kind: "exact" },
  testEligible: false,
};

export const fixtureQuestion: ChoiceQuestion = {
  id: "t.l1.q1",
  type: "predict",
  concepts: [],
  lessons: ["t.l1"],
  code: 'print("A")',
  prompt: { vi: "In ra gì?", en: "What is printed?" },
  choices: [
    { text: { vi: "A", en: "A" }, correct: true, error: false, misconception: null },
    { text: { vi: "Lỗi", en: "Error" }, correct: false, error: true, misconception: null },
  ],
  explanation: { vi: "Lệnh print in ra A.", en: "print shows A." },
};

export const fixtureLesson: Lesson = {
  id: "t.l1",
  title: { vi: "Bài thử", en: "Test lesson" },
  cards: [
    {
      segments: [
        { kind: "html", html: "<p>Thẻ một</p>" },
        { kind: "code", code: 'print("Xin chào")', run: true, expectError: false },
      ],
    },
    { segments: [{ kind: "html", html: "<p>Thẻ hai</p>" }] },
  ],
  exercises: [fixtureCodeExercise, fixtureQuestion],
};

const fixtureLesson2: Lesson = {
  id: "t.l2",
  title: { vi: "Bài thử 2", en: "Test lesson 2" },
  cards: [{ segments: [{ kind: "html", html: "<p>Chỉ 1 thẻ</p>" }] }],
  exercises: [],
};

export function testBundle(): ContentBundle {
  return {
    stages: [
      {
        id: "t",
        title: { vi: "Giai đoạn thử", en: "Test stage" },
        topics: [
          {
            id: "t.topic",
            title: { vi: "Chủ đề thử", en: "Test topic" },
            lessons: [fixtureLesson, fixtureLesson2],
            concepts: [],
            questions: [],
            reviews: [],
            practice: [],
          },
        ],
      },
    ],
    errors: fixtureErrors,
  };
}
