import type { ContentBundle } from "../../src/content/types";

/**
 * Spec 3.9 rule 8: every concept has a misconception card, a parent tip and practice at the 3 levels. The content
 * of M5 completes it, so a gap is a warning for now, not an error.
 */
export function contentWarnings(bundle: ContentBundle): string[] {
  const warnings: string[] = [];
  for (const concept of bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts))) {
    const missing: string[] = [];
    if (concept.misconceptionCard === null) missing.push("thẻ hiểu lầm");
    if (concept.parentTip === null) missing.push("gợi ý cho phụ huynh");
    for (const level of ["level1", "level2", "level3"] as const) {
      if (concept.practice[level].length === 0) missing.push(`bài luyện ${level}`);
    }
    if (missing.length > 0) warnings.push(`${concept.id}: thiếu ${missing.join(", ")}`);
  }
  return warnings;
}
