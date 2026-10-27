import { describe, expect, test } from "vitest";
import type { ContentBundle } from "../content/types";
import { pathNodes, type NextStep, type PathNode } from "../game/path";
import { pick } from "../i18n/lang";
import { examBundle } from "../test/examBundle";
import { testBundle } from "../test/fixtures";
import { reviewBundle } from "../test/reviewBundle";
import { nextStepLabel } from "./nextStepLabel";

function nodeStep(bundle: ContentBundle, kind: PathNode["kind"]): NextStep {
  const node = pathNodes(bundle).find((candidate) => candidate.kind === kind);
  if (!node) throw new Error(`the bundle has no ${kind} node`);
  return { kind: "node", node };
}

describe("nextStepLabel", () => {
  test("a lesson is named by its title, in the language asked", () => {
    const bundle = testBundle();
    const first = bundle.stages[0]!.topics[0]!.lessons[0]!;
    const step = nodeStep(bundle, "lesson");
    expect(nextStepLabel(bundle, step, "vi")).toBe(pick(first.title, "vi"));
    expect(nextStepLabel(bundle, step, "vi")).toBe("Bài thử");
    expect(nextStepLabel(bundle, step, "en")).toBe(pick(first.title, "en"));
    expect(nextStepLabel(bundle, step, "en")).toBe("Test lesson");
  });

  test("a lesson that is not in the content is named by its id", () => {
    const step: NextStep = { kind: "node", node: { kind: "lesson", id: "gone.l1", topicId: "t.topic" } };
    expect(nextStepLabel(testBundle(), step, "vi")).toBe("gone.l1");
  });

  test("a review station", () => {
    const step = nodeStep(reviewBundle(), "review");
    expect(nextStepLabel(reviewBundle(), step, "vi")).toBe("Trạm ôn");
    expect(nextStepLabel(reviewBundle(), step, "en")).toBe("Review station");
  });

  test("a topic test carries the name of the topic", () => {
    const bundle = examBundle();
    const topic = bundle.stages[0]!.topics[0]!;
    const step = nodeStep(bundle, "topicTest");
    expect(nextStepLabel(bundle, step, "vi")).toBe(`Kiểm tra chủ đề: ${pick(topic.title, "vi")}`);
    expect(nextStepLabel(bundle, step, "vi")).toBe("Kiểm tra chủ đề: Chủ đề thi");
    expect(nextStepLabel(bundle, step, "en")).toBe(`Topic test: ${pick(topic.title, "en")}`);
  });

  test("a topic test of a topic that is not in the content names the topic by its id", () => {
    const step: NextStep = { kind: "node", node: { kind: "topicTest", id: "gone.test", topicId: "gone" } };
    expect(nextStepLabel(examBundle(), step, "vi")).toBe("Kiểm tra chủ đề: gone");
  });

  test("the evolution test", () => {
    const step = nodeStep(examBundle(), "evolution");
    expect(nextStepLabel(examBundle(), step, "vi")).toBe("Kiểm tra tiến hóa");
    expect(nextStepLabel(examBundle(), step, "en")).toBe("Evolution test");
  });

  test("a focused review set and practice from the parents", () => {
    expect(nextStepLabel(testBundle(), { kind: "remedial" }, "vi")).toBe("Ôn tập trọng tâm");
    expect(nextStepLabel(testBundle(), { kind: "remedial" }, "en")).toBe("Focused review");
    expect(nextStepLabel(testBundle(), { kind: "assigned", id: "p1" }, "vi")).toBe("Bài luyện bố mẹ giao");
    expect(nextStepLabel(testBundle(), { kind: "assigned", id: "p1" }, "en")).toBe("Practice from your parents");
  });
});
