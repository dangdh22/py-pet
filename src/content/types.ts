import type { LocalizedText } from "../i18n/lang";

export type { Lang, LocalizedText } from "../i18n/lang";

export interface TestCase {
  input: string;
  output: string;
  hidden: boolean;
}

/** A typical wrong output for one test case, and the misconception it reveals. */
export interface CommonWrong {
  test: number;
  output: string;
  misconception: string;
  sample: string;
}

export type CompareMode = { kind: "exact" } | { kind: "float"; tolerance: number };

export interface CodeExercise {
  id: string;
  type: "code";
  concepts: string[];
  prompt: LocalizedText;
  starter: string;
  solution: string;
  tests: TestCase[];
  commonWrong: CommonWrong[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

export interface Choice {
  text: LocalizedText;
  correct: boolean;
  /** True when this choice means "the code stops with an error". */
  error: boolean;
  misconception: string | null;
}

export interface ChoiceQuestion {
  id: string;
  type: "predict" | "mcq";
  concepts: string[];
  lessons: string[];
  code: string | null;
  prompt: LocalizedText;
  choices: Choice[];
  explanation: LocalizedText;
}

export type Exercise = CodeExercise | ChoiceQuestion;

export type CardSegment =
  | { kind: "html"; html: string }
  | { kind: "code"; code: string; run: boolean; expectError: boolean };

export interface Card {
  segments: CardSegment[];
}

export interface Lesson {
  id: string;
  title: LocalizedText;
  cards: Card[];
  exercises: Exercise[];
}

export interface Concept {
  id: string;
  name: LocalizedText;
  misconceptionCard: string | null;
  parentTip: string | null;
}

export interface Topic {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
  concepts: Concept[];
  questions: ChoiceQuestion[];
}

export interface Stage {
  id: string;
  title: LocalizedText;
  topics: Topic[];
}

export const CHECK_NAMES = ["similar-name", "assign-in-condition", "while-loop"] as const;
export type CheckName = (typeof CHECK_NAMES)[number];

export interface BilingualText {
  vi: string;
  en: string;
}

export interface ErrorEntry {
  id: string;
  match: { type: string; message: string | null; check: CheckName | null };
  explain: BilingualText;
  hint: BilingualText | null;
  misconception: string | null;
  sample: string;
  sampleInput: string;
}

export interface ContentBundle {
  stages: Stage[];
  errors: ErrorEntry[];
}
