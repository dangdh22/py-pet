import { describe, expect, test } from "vitest";
import { examBundle } from "../test/examBundle";
import { buildRemedialSet, drawEvolutionTest, drawTopicTest, gradePaper, type ExamAnswer } from "./exam";
import { emptyMastery } from "./mastery";
import { seededRng } from "./random";
import { initialGameState } from "./state";

const bundle = examBundle();
const stage = bundle.stages[0]!;
const topic = stage.topics[0]!;
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe("drawTopicTest", () => {
  test("has the configured questions, then the code exercises", () => {
    for (const seed of SEEDS) {
      const paper = drawTopicTest(topic, [], seededRng(seed));
      expect(paper).toHaveLength(4);
      expect(paper.slice(0, 3).every((item) => item.type === "mcq")).toBe(true);
      expect(paper[3]!.type).toBe("code");
    }
  });

  test("avoids the items of the previous attempt when the bank allows", () => {
    const first = ids(drawTopicTest(topic, [], seededRng(1)));
    for (const seed of SEEDS) {
      const second = ids(drawTopicTest(topic, first, seededRng(seed)));
      expect(second.filter((id) => first.includes(id))).toEqual([]);
    }
  });

  test("a short bank gives a shorter paper", () => {
    const small = { ...topic, questions: [], test: { questions: 9, code: 5 } };
    expect(drawTopicTest(small, [], seededRng(1))).toHaveLength(2);
  });
});

describe("drawEvolutionTest", () => {
  test("has the configured AI share, the other questions and the code", () => {
    for (const seed of SEEDS) {
      const paper = drawEvolutionTest(bundle, stage, [], seededRng(seed));
      expect(paper).toHaveLength(5);
      expect(ids(paper).filter((id) => id.startsWith("x.a"))).toHaveLength(1);
      expect(paper[4]!.type).toBe("code");
    }
  });

  test("fills with AI questions when the other questions run out", () => {
    const fewOthers = {
      ...stage,
      topics: [{ ...topic, questions: topic.questions.filter((q) => q.id !== "x.q3" && q.id !== "x.q4") }],
    };
    const paper = drawEvolutionTest(bundle, fewOthers, [], seededRng(1));
    expect(ids(paper).slice(0, 4).sort()).toEqual(["x.a1", "x.a2", "x.q1", "x.q2"]);
  });

  test("avoids the previous attempt's questions first", () => {
    for (const seed of SEEDS) {
      const questions = ids(drawEvolutionTest(bundle, stage, ["x.q1", "x.q2", "x.a1"], seededRng(seed)).slice(0, 4));
      expect(questions).toEqual(expect.arrayContaining(["x.a2", "x.q3", "x.q4"]));
      expect(questions).not.toContain("x.a1");
    }
  });
});

describe("gradePaper", () => {
  const items = [topic.questions[0]!, topic.questions[1]!, examCodeItem()];
  function examCodeItem() {
    return topic.lessons[0]!.exercises[0]!;
  }

  test("1 point per right question and 3 points shared by the passed test cases", () => {
    const answers: ExamAnswer[] = [
      { kind: "choice", correct: true },
      { kind: "choice", correct: false },
      { kind: "code", passed: 1, total: 2 },
    ];
    expect(gradePaper(items, answers)).toEqual({ score: 2.5, max: 5, wrongConcepts: ["k1"] });
  });

  test("an unanswered item scores 0", () => {
    expect(gradePaper(items, [])).toEqual({ score: 0, max: 5, wrongConcepts: ["k1"] });
    expect(gradePaper([], [])).toEqual({ score: 0, max: 0, wrongConcepts: [] });
  });
});

describe("buildRemedialSet", () => {
  test("gives up to 2 items per wrong concept at the child's level", () => {
    const state = initialGameState("2026-10-06");
    state.progress.completedLessons = ["x.l1", "x.l2"];
    const set = buildRemedialSet(bundle, state, ["k1", "k2"], seededRng(1));
    expect(ids(set)).toEqual(expect.arrayContaining(["x.q1", "x.q2", "x.q3", "x.q4"]));
    expect(set).toHaveLength(4);
  });

  test("starts from the ladder level and skips concepts with nothing to practise", () => {
    const state = initialGameState("2026-10-06");
    state.progress.completedLessons = ["x.l1", "x.l2"];
    state.mastery = { k1: { ...emptyMastery(), level: 3 } };
    const set = buildRemedialSet(bundle, state, ["k1", "nope"], seededRng(1));
    expect(set).toHaveLength(2);
    expect(set.every((item) => item.concepts.includes("k1"))).toBe(true);
  });
});
