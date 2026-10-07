import { allConcepts, topicQuestions, topicTestCode } from "../../src/content/lookup";
import type { ContentBundle } from "../../src/content/types";

/**
 * Spec 3.9 rule 9 and the test configs: a stage's bank holds at least twice the evolution test's questions, with
 * enough AI questions and test-eligible code; a topic has enough items for its test.
 */
function testProblems(bundle: ContentBundle): string[] {
  const problems: string[] = [];
  const aiConcepts = new Set(allConcepts(bundle).filter((concept) => concept.ai).map((concept) => concept.id));
  for (const stage of bundle.stages) {
    const questions = stage.topics.flatMap(topicQuestions);
    const ai = questions.filter((q) => q.concepts.some((id) => aiConcepts.has(id))).length;
    const code = stage.topics.flatMap(topicTestCode).length;
    const { evolution } = stage;
    if (questions.length < 2 * evolution.questions) {
      problems.push(`${stage.id}: ngân hàng có ${questions.length} câu, cần ít nhất ${2 * evolution.questions} câu cho đề tiến hóa`);
    }
    if (ai < evolution.ai) problems.push(`${stage.id}: có ${ai} câu AI, đề tiến hóa cần ${evolution.ai}`);
    if (code < evolution.code) problems.push(`${stage.id}: có ${code} bài code test_eligible, đề tiến hóa cần ${evolution.code}`);
    for (const topic of stage.topics) {
      const topicQ = topicQuestions(topic).length;
      const topicCode = topicTestCode(topic).length;
      if (topicQ < topic.test.questions) problems.push(`${topic.id}: có ${topicQ} câu, kiểm tra chủ đề cần ${topic.test.questions}`);
      if (topicCode < topic.test.code) {
        problems.push(`${topic.id}: có ${topicCode} bài code test_eligible, kiểm tra chủ đề cần ${topic.test.code}`);
      }
    }
  }
  return problems;
}

/**
 * Spec 3.9 rules 8 and 9, as problems for `buildBundle` to report (all gaps at once).
 * Rule 8: every concept has a misconception card, a parent tip and practice at the 3 levels. An AI concept
 * (knowledge, no code) needs only level 1.
 */
export function coverageProblems(bundle: ContentBundle): string[] {
  const problems: string[] = [];
  for (const concept of bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts))) {
    const missing: string[] = [];
    if (concept.misconceptionCard === null) missing.push("thẻ hiểu lầm");
    if (concept.parentTip === null) missing.push("gợi ý cho phụ huynh");
    const levels = concept.ai ? (["level1"] as const) : (["level1", "level2", "level3"] as const);
    for (const level of levels) {
      if (concept.practice[level].length === 0) missing.push(`bài luyện ${level}`);
    }
    if (missing.length > 0) problems.push(`${concept.id}: thiếu ${missing.join(", ")}`);
  }
  return [...problems, ...testProblems(bundle)];
}
