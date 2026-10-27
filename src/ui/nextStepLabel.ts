import { findLesson, findTopic } from "../content/lookup";
import type { ContentBundle } from "../content/types";
import type { NextStep } from "../game/path";
import { pick, type Lang } from "../i18n/lang";
import { translate } from "../i18n/translate";

/** The name of what "Học tiếp" opens, for the card of the room: a lesson title, or the name of the kind of step. */
export function nextStepLabel(bundle: ContentBundle, step: NextStep, lang: Lang): string {
  if (step.kind === "assigned") return translate(lang, "room.nextAssigned");
  if (step.kind === "remedial") return translate(lang, "remedial.title");
  const { node } = step;
  switch (node.kind) {
    case "lesson": {
      const lesson = findLesson(bundle, node.id);
      return lesson ? pick(lesson.title, lang) : node.id;
    }
    case "review":
      return translate(lang, "review.title");
    case "topicTest": {
      const topic = findTopic(bundle, node.topicId);
      return translate(lang, "exam.topicTitle", { topic: topic ? pick(topic.title, lang) : node.topicId });
    }
    case "evolution":
      return translate(lang, "exam.evolutionTitle");
  }
}
