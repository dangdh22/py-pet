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

/** Lines of a correct program in a shuffled order; the child puts them back in order (spec 3.4). */
export interface ParsonsExercise {
  id: string;
  type: "parsons";
  concepts: string[];
  prompt: LocalizedText;
  /** The program's lines in the right order, indentation included. */
  lines: string[];
  solution: string;
  tests: TestCase[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

/** The marker of a blank in a fill template. */
export const FILL_BLANK = "___";

/** A program with blanks; the child types the missing parts (spec 3.4). */
export interface FillExercise {
  id: string;
  type: "fill";
  concepts: string[];
  prompt: LocalizedText;
  /** The program with each blank written as ___. */
  template: string;
  /** 1 answer per blank, in order. */
  answers: string[];
  solution: string;
  tests: TestCase[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

/** An exercise graded by running code against test cases. */
export type TestedExercise = CodeExercise | ParsonsExercise | FillExercise;

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

export type Exercise = TestedExercise | ChoiceQuestion;

export function isChoiceQuestion(item: Exercise): item is ChoiceQuestion {
  return item.type === "predict" || item.type === "mcq";
}

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

/** Practice item IDs per ladder level (spec 3.6): 1 = predict/mcq, 2 = parsons/fill, 3 = code. */
export interface ConceptPractice {
  level1: string[];
  level2: string[];
  level3: string[];
}

export interface Concept {
  id: string;
  name: LocalizedText;
  /** Markdown, as written in concepts.yaml. */
  misconceptionCard: string | null;
  /** The misconception card as HTML, ready to show. */
  misconceptionHtml: string | null;
  parentTip: string | null;
  practice: ConceptPractice;
}

/** A review station on the map, placed after a lesson of its topic. */
export interface ReviewStation {
  id: string;
  after: string;
}

export interface Topic {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
  concepts: Concept[];
  questions: ChoiceQuestion[];
  reviews: ReviewStation[];
  /** Practice exercises that belong to no lesson (practice.yaml). */
  practice: TestedExercise[];
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
