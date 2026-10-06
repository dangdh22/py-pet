import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";
import type { z } from "zod";
import type { ChoiceQuestion, ContentBundle, ErrorEntry, Exercise, Lesson, Stage, Topic } from "../../src/content/types";
import { LessonFormatError, parseLessonFile } from "./parseLesson";
import { checkReferences } from "./references";
import {
  conceptsFileSchema,
  errorsFileSchema,
  lessonFrontmatterSchema,
  parseExercise,
  parseWith,
  questionsFileSchema,
  stageFileSchema,
  toConcept,
  toErrorEntry,
  toLocalized,
  topicFileSchema,
  type SafeResult,
} from "./schema";

export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(`Nội dung có ${problems.length} lỗi:\n${problems.join("\n")}`);
    this.name = "ContentError";
  }
}

class Collector {
  readonly problems: string[] = [];

  constructor(readonly root: string) {}

  exists(rel: string): boolean {
    return existsSync(join(this.root, rel));
  }

  readText(rel: string): string | undefined {
    if (!this.exists(rel)) {
      this.problems.push(`${rel}: không tìm thấy file`);
      return undefined;
    }
    return readFileSync(join(this.root, rel), "utf8");
  }

  readYaml(rel: string): unknown {
    const text = this.readText(rel);
    if (text === undefined) return undefined;
    try {
      return load(text);
    } catch (error) {
      this.problems.push(`${rel}: YAML lỗi: ${(error as Error).message}`);
      return undefined;
    }
  }

  parse<S extends z.ZodType>(schema: S, raw: unknown, where: string): z.infer<S> | undefined {
    const result = parseWith(schema.safeParse(raw) as SafeResult<z.infer<S>>, where);
    if (result.ok) return result.value;
    this.problems.push(...result.issues);
    return undefined;
  }
}

export function buildBundle(contentDir: string): ContentBundle {
  const collector = new Collector(contentDir);
  const stageDirs = readdirSync(contentDir)
    .filter((name) => /^stage-\d+$/.test(name))
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)));
  const stages = stageDirs.map((dir) => buildStage(collector, dir)).filter((s): s is Stage => s !== undefined);

  const errorsFile = "errors/errors.yaml";
  const rawErrors = collector.parse(errorsFileSchema, collector.readYaml(errorsFile), errorsFile);
  const errors: ErrorEntry[] = rawErrors ? rawErrors.map(toErrorEntry) : [];

  const bundle: ContentBundle = { stages, errors };
  const problems = [...collector.problems, ...checkReferences(bundle)];
  if (problems.length > 0) throw new ContentError(problems);
  return bundle;
}

function buildStage(c: Collector, dir: string): Stage | undefined {
  const file = `${dir}/stage.yaml`;
  const raw = c.parse(stageFileSchema, c.readYaml(file), file);
  if (!raw) return undefined;
  const topics = raw.topics.map((name) => buildTopic(c, `${dir}/${name}`)).filter((t): t is Topic => t !== undefined);
  return { id: raw.id, title: toLocalized(raw.title), topics };
}

function buildTopic(c: Collector, dir: string): Topic | undefined {
  const topicFile = `${dir}/topic.yaml`;
  const conceptsFile = `${dir}/concepts.yaml`;
  const raw = c.parse(topicFileSchema, c.readYaml(topicFile), topicFile);
  const rawConcepts = c.parse(conceptsFileSchema, c.readYaml(conceptsFile), conceptsFile);
  if (!raw) return undefined;
  const lessons = raw.lessons.map((name) => buildLesson(c, `${dir}/${name}`)).filter((l): l is Lesson => l !== undefined);
  return {
    id: raw.id,
    title: toLocalized(raw.title),
    lessons,
    concepts: rawConcepts ? rawConcepts.concepts.map(toConcept) : [],
    questions: buildQuestions(c, `${dir}/questions.yaml`),
  };
}

function buildLesson(c: Collector, file: string): Lesson | undefined {
  const text = c.readText(file);
  if (text === undefined) return undefined;
  let parsed: ReturnType<typeof parseLessonFile>;
  try {
    parsed = parseLessonFile(text);
  } catch (error) {
    if (error instanceof LessonFormatError) {
      c.problems.push(`${file}: ${error.message}`);
      return undefined;
    }
    throw error;
  }
  const frontmatter = c.parse(lessonFrontmatterSchema, parsed.frontmatter, file);
  if (!frontmatter) return undefined;
  if (parsed.cards.length === 0) c.problems.push(`${file}: bài học phải có ít nhất 1 thẻ`);
  const exercises: Exercise[] = [];
  frontmatter.exercises.forEach((rawExercise, i) => {
    const result = parseExercise(rawExercise, frontmatter.id, `${file}: exercises.${i}`);
    if (result.ok) exercises.push(result.value);
    else c.problems.push(...result.issues);
  });
  return { id: frontmatter.id, title: toLocalized(frontmatter.title), cards: parsed.cards, exercises };
}

function buildQuestions(c: Collector, file: string): ChoiceQuestion[] {
  if (!c.exists(file)) return [];
  const raw = c.parse(questionsFileSchema, c.readYaml(file), file);
  if (!raw) return [];
  const questions: ChoiceQuestion[] = [];
  raw.questions.forEach((rawQuestion, i) => {
    const where = `${file}: questions.${i}`;
    const result = parseExercise(rawQuestion, null, where);
    if (!result.ok) {
      c.problems.push(...result.issues);
      return;
    }
    if (result.value.type === "code") {
      c.problems.push(`${where}: questions.yaml chỉ chứa câu predict hoặc mcq`);
      return;
    }
    if (result.value.lessons.length === 0) {
      c.problems.push(`${where}: câu hỏi trong ngân hàng phải có lessons`);
      return;
    }
    questions.push(result.value);
  });
  return questions;
}
