import { marked } from "marked";
import { z } from "zod";
import { fillTemplate, parsonsLines } from "../../src/content/exercise";
import {
  CHECK_NAMES,
  FILL_BLANK,
  type Choice,
  type ChoiceQuestion,
  type CodeExercise,
  type CompareMode,
  type Concept,
  type ErrorEntry,
  type Exercise,
  type FillExercise,
  type ParsonsExercise,
} from "../../src/content/types";
import type { LocalizedText } from "../../src/i18n/lang";

const ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const idSchema = z.string().regex(ID_PATTERN, "ID chỉ gồm chữ thường không dấu, số, dấu chấm và dấu gạch ngang");
const localizedSchema = z.object({ vi: z.string().min(1), en: z.string().min(1).optional() }).strict();
const bilingualSchema = z.object({ vi: z.string().min(1), en: z.string().min(1) }).strict();

const testCaseSchema = z
  .object({ input: z.string().default(""), output: z.string(), hidden: z.boolean().default(false) })
  .strict();

const commonWrongSchema = z
  .object({
    test: z.number().int().min(0).default(0),
    output: z.string(),
    misconception: idSchema,
    sample: z.string().min(1),
  })
  .strict();

type TestedRaw = {
  prompt: { vi: string; en?: string | undefined };
  tests: unknown[];
  compare: "exact" | "float";
  tolerance?: number | undefined;
  test_eligible: boolean;
};

/** Rules shared by every exercise graded with test cases. */
function refineTested(ex: TestedRaw, ctx: z.RefinementCtx): void {
  if (ex.test_eligible && ex.prompt.en === undefined) {
    ctx.addIssue({
      code: "custom",
      path: ["prompt", "en"],
      message: "Bài code dùng trong đề kiểm tra (test_eligible) phải có bản tiếng Anh",
    });
  }
  if (ex.compare === "float" && ex.tolerance === undefined) {
    ctx.addIssue({ code: "custom", path: ["tolerance"], message: "compare: float cần có tolerance" });
  }
}

const testedFields = {
  id: idSchema,
  concepts: z.array(idSchema).default([]),
  prompt: localizedSchema,
  tests: z.array(testCaseSchema).min(1),
  hints: z.array(localizedSchema).default([]),
  compare: z.enum(["exact", "float"]).default("exact"),
  tolerance: z.number().positive().optional(),
  test_eligible: z.boolean().default(false),
};

const parsonsSchema = z
  .object({ ...testedFields, type: z.literal("parsons"), solution: z.string().min(1) })
  .strict()
  .superRefine((ex, ctx) => {
    refineTested(ex, ctx);
    const lines = parsonsLines(ex.solution);
    if (new Set(lines).size < 2) {
      ctx.addIssue({ code: "custom", path: ["solution"], message: "Bài parsons cần ít nhất 2 dòng khác nhau" });
    }
  });

const fillSchema = z
  .object({
    ...testedFields,
    type: z.literal("fill"),
    template: z.string().min(1),
    answers: z.array(z.string().min(1).regex(/^[^\n]*$/, "Đáp án chỉ có 1 dòng")).min(1),
  })
  .strict()
  .superRefine((ex, ctx) => {
    refineTested(ex, ctx);
    const blanks = ex.template.split(FILL_BLANK).length - 1;
    if (blanks !== ex.answers.length) {
      ctx.addIssue({
        code: "custom",
        path: ["answers"],
        message: `Mẫu có ${blanks} chỗ trống ___ nhưng có ${ex.answers.length} đáp án`,
      });
    }
  });

const codeExerciseSchema = z
  .object({
    id: idSchema,
    type: z.literal("code"),
    concepts: z.array(idSchema).default([]),
    prompt: localizedSchema,
    starter: z.string().default(""),
    solution: z.string().min(1),
    tests: z.array(testCaseSchema).min(1),
    common_wrong: z.array(commonWrongSchema).default([]),
    hints: z.array(localizedSchema).default([]),
    compare: z.enum(["exact", "float"]).default("exact"),
    tolerance: z.number().positive().optional(),
    test_eligible: z.boolean().default(false),
  })
  .strict()
  .superRefine((ex, ctx) => {
    refineTested(ex, ctx);
    ex.common_wrong.forEach((cw, i) => {
      if (cw.test >= ex.tests.length) {
        ctx.addIssue({ code: "custom", path: ["common_wrong", i, "test"], message: "test vượt quá số test case" });
      }
    });
  });

const choiceSchema = z
  .object({
    text: z.string().min(1).optional(),
    vi: z.string().optional(),
    en: z.string().optional(),
    correct: z.boolean().default(false),
    error: z.boolean().default(false),
    misconception: idSchema.optional(),
  })
  .strict()
  .superRefine((choice, ctx) => {
    const hasText = choice.text !== undefined;
    const hasLocalized = choice.vi !== undefined || choice.en !== undefined;
    if (hasText === hasLocalized) {
      ctx.addIssue({ code: "custom", path: [], message: "Lựa chọn phải có text (trung tính) hoặc có vi + en" });
    } else if (hasLocalized && (!choice.vi || !choice.en)) {
      ctx.addIssue({ code: "custom", path: [], message: "Lựa chọn song ngữ phải có đủ vi và en" });
    }
  });

const choiceQuestionSchema = z
  .object({
    id: idSchema,
    type: z.enum(["predict", "mcq"]),
    concepts: z.array(idSchema).default([]),
    lessons: z.array(idSchema).default([]),
    code: z.string().min(1).optional(),
    prompt: bilingualSchema,
    choices: z.array(choiceSchema).min(2).max(6),
    explanation: bilingualSchema,
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.type === "predict" && q.code === undefined) {
      ctx.addIssue({ code: "custom", path: ["code"], message: "Câu predict phải có code" });
    }
    if (q.choices.filter((c) => c.correct).length !== 1) {
      ctx.addIssue({ code: "custom", path: ["choices"], message: "Phải có đúng 1 lựa chọn correct: true" });
    }
  });

export const stageFileSchema = z
  .object({ id: idSchema, title: localizedSchema, topics: z.array(z.string().min(1)).min(1) })
  .strict();

export const topicFileSchema = z
  .object({
    id: idSchema,
    title: localizedSchema,
    lessons: z.array(z.string().min(1)).min(1),
    reviews: z.array(z.object({ id: idSchema, after: idSchema }).strict()).default([]),
  })
  .strict();

const conceptSchema = z
  .object({
    id: idSchema,
    name: localizedSchema,
    misconception_card: z.string().min(1).optional(),
    parent_tip: z.string().min(1).optional(),
    practice: z
      .object({
        level1: z.array(idSchema).default([]),
        level2: z.array(idSchema).default([]),
        level3: z.array(idSchema).default([]),
      })
      .strict()
      .default({ level1: [], level2: [], level3: [] }),
  })
  .strict();

export const conceptsFileSchema = z.object({ concepts: z.array(conceptSchema) }).strict();

export const questionsFileSchema = z.object({ questions: z.array(z.unknown()) }).strict();

export const practiceFileSchema = z.object({ exercises: z.array(z.unknown()) }).strict();

export const lessonFrontmatterSchema = z
  .object({ id: idSchema, title: localizedSchema, exercises: z.array(z.unknown()).default([]) })
  .strict();

const errorEntrySchema = z
  .object({
    id: idSchema,
    match: z
      .object({ type: z.string().min(1), message: z.string().min(1).optional(), check: z.enum(CHECK_NAMES).optional() })
      .strict(),
    explain: bilingualSchema,
    hint: bilingualSchema.optional(),
    misconception: idSchema.optional(),
    sample: z.string().min(1),
    sample_input: z.string().default(""),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.match.message === undefined) return;
    try {
      new RegExp(entry.match.message);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        path: ["match", "message"],
        message: `Biểu thức chính quy không hợp lệ: ${(error as Error).message}`,
      });
    }
  });

export const errorsFileSchema = z.array(errorEntrySchema);

export type ParseResult<T> = { ok: true; value: T } | { ok: false; issues: string[] };
export type SafeResult<T> = { success: true; data: T } | { success: false; error: z.ZodError };

export function formatIssues(error: z.ZodError, where: string): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `: ${issue.path.join(".")}` : "";
    return `${where}${path}: ${issue.message}`;
  });
}

export function parseWith<T>(result: SafeResult<T>, where: string): ParseResult<T> {
  return result.success ? { ok: true, value: result.data } : { ok: false, issues: formatIssues(result.error, where) };
}

export function toLocalized(raw: { vi: string; en?: string | undefined }): LocalizedText {
  return raw.en === undefined ? { vi: raw.vi } : { vi: raw.vi, en: raw.en };
}

function toChoice(raw: z.infer<typeof choiceSchema>): Choice {
  const text: LocalizedText =
    raw.text !== undefined ? { vi: raw.text, en: raw.text } : { vi: raw.vi ?? "", en: raw.en ?? "" };
  return { text, correct: raw.correct, error: raw.error, misconception: raw.misconception ?? null };
}

function toCompare(raw: { compare: "exact" | "float"; tolerance?: number | undefined }): CompareMode {
  return raw.compare === "float" ? { kind: "float", tolerance: raw.tolerance ?? 0 } : { kind: "exact" };
}

function toTests(raw: { tests: { input: string; output: string; hidden: boolean }[] }) {
  return raw.tests.map((t) => ({ input: t.input, output: t.output, hidden: t.hidden }));
}

function toParsons(raw: z.infer<typeof parsonsSchema>): ParsonsExercise {
  const lines = parsonsLines(raw.solution);
  return {
    id: raw.id,
    type: "parsons",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    lines,
    solution: `${lines.join("\n")}\n`,
    tests: toTests(raw),
    hints: raw.hints.map(toLocalized),
    compare: toCompare(raw),
    testEligible: raw.test_eligible,
  };
}

function toFill(raw: z.infer<typeof fillSchema>): FillExercise {
  return {
    id: raw.id,
    type: "fill",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    template: raw.template,
    answers: raw.answers,
    solution: fillTemplate(raw.template, raw.answers),
    tests: toTests(raw),
    hints: raw.hints.map(toLocalized),
    compare: toCompare(raw),
    testEligible: raw.test_eligible,
  };
}

function toCodeExercise(raw: z.infer<typeof codeExerciseSchema>): CodeExercise {
  return {
    id: raw.id,
    type: "code",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    starter: raw.starter,
    solution: raw.solution,
    tests: toTests(raw),
    commonWrong: raw.common_wrong.map((cw) => ({
      test: cw.test,
      output: cw.output,
      misconception: cw.misconception,
      sample: cw.sample,
    })),
    hints: raw.hints.map(toLocalized),
    compare: toCompare(raw),
    testEligible: raw.test_eligible,
  };
}

function toChoiceQuestion(raw: z.infer<typeof choiceQuestionSchema>, ownerLessonId: string | null): ChoiceQuestion {
  return {
    id: raw.id,
    type: raw.type,
    concepts: raw.concepts,
    lessons: raw.lessons.length > 0 ? raw.lessons : ownerLessonId ? [ownerLessonId] : [],
    code: raw.code ?? null,
    prompt: raw.prompt,
    choices: raw.choices.map(toChoice),
    explanation: raw.explanation,
  };
}

/** Parses 1 exercise. A predict/mcq inside a lesson gets that lesson as its default `lessons`. */
export function parseExercise(raw: unknown, ownerLessonId: string | null, where: string): ParseResult<Exercise> {
  const type = typeof raw === "object" && raw !== null ? (raw as { type?: unknown }).type : undefined;
  if (type === "code") {
    const result = parseWith(codeExerciseSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toCodeExercise(result.value) } : result;
  }
  if (type === "parsons") {
    const result = parseWith(parsonsSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toParsons(result.value) } : result;
  }
  if (type === "fill") {
    const result = parseWith(fillSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toFill(result.value) } : result;
  }
  if (type === "predict" || type === "mcq") {
    const result = parseWith(choiceQuestionSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toChoiceQuestion(result.value, ownerLessonId) } : result;
  }
  return { ok: false, issues: [`${where}: type phải là code, parsons, fill, predict hoặc mcq`] };
}

export function toConcept(raw: z.infer<typeof conceptSchema>): Concept {
  return {
    id: raw.id,
    name: toLocalized(raw.name),
    misconceptionCard: raw.misconception_card ?? null,
    misconceptionHtml:
      raw.misconception_card === undefined ? null : (marked.parse(raw.misconception_card, { async: false }) as string),
    parentTip: raw.parent_tip ?? null,
    practice: raw.practice,
  };
}

export function toErrorEntry(raw: z.infer<typeof errorEntrySchema>): ErrorEntry {
  return {
    id: raw.id,
    match: { type: raw.match.type, message: raw.match.message ?? null, check: raw.match.check ?? null },
    explain: raw.explain,
    hint: raw.hint ?? null,
    misconception: raw.misconception ?? null,
    sample: raw.sample,
    sampleInput: raw.sample_input,
  };
}
