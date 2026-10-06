import { evolutionTestId, topicTestId } from "../../src/content/lookup";
import { isChoiceQuestion, type ContentBundle, type Exercise } from "../../src/content/types";

/** The item types allowed at each ladder level (spec 5.9). */
const LEVEL_TYPES = {
  level1: ["predict", "mcq"],
  level2: ["parsons", "fill"],
  level3: ["code"],
} as const;

export function checkReferences(bundle: ContentBundle): string[] {
  const problems: string[] = [];
  const owners = new Map<string, string>();
  const claim = (id: string, what: string) => {
    const previous = owners.get(id);
    if (previous) problems.push(`ID trùng "${id}": ${previous} và ${what}`);
    else owners.set(id, what);
  };

  const conceptIds = new Set<string>();
  const lessonIds = new Set<string>();
  const items: Exercise[] = [];
  const itemsById = new Map<string, Exercise>();

  for (const stage of bundle.stages) {
    claim(stage.id, "giai đoạn");
    claim(evolutionTestId(stage), "kiểm tra tiến hóa");
    for (const topic of stage.topics) {
      claim(topic.id, "chủ đề");
      claim(topicTestId(topic), "kiểm tra chủ đề");
      for (const concept of topic.concepts) {
        if (conceptIds.has(concept.id)) problems.push(`Khái niệm trùng "${concept.id}"`);
        conceptIds.add(concept.id);
      }
      for (const lesson of topic.lessons) {
        claim(lesson.id, "bài học");
        lessonIds.add(lesson.id);
        for (const exercise of lesson.exercises) {
          claim(exercise.id, "bài tập");
          items.push(exercise);
        }
      }
      for (const question of topic.questions) {
        claim(question.id, "câu hỏi");
        items.push(question);
      }
      for (const exercise of topic.practice) {
        claim(exercise.id, "bài luyện");
        items.push(exercise);
      }
      const topicLessons = new Set(topic.lessons.map((lesson) => lesson.id));
      const placed = new Set<string>();
      for (const review of topic.reviews) {
        claim(review.id, "trạm ôn");
        if (!topicLessons.has(review.after)) {
          problems.push(`${review.id}: trạm ôn phải đặt sau 1 bài học của chủ đề ${topic.id}, không có "${review.after}"`);
        } else if (placed.has(review.after)) {
          problems.push(`${review.id}: đã có trạm ôn khác sau bài "${review.after}"`);
        }
        placed.add(review.after);
      }
    }
  }
  for (const item of items) itemsById.set(item.id, item);
  for (const entry of bundle.errors) claim(entry.id, "mục từ điển lỗi");

  const needConcept = (id: string, where: string) => {
    if (!conceptIds.has(id)) problems.push(`${where}: khái niệm "${id}" chưa được khai báo trong concepts.yaml`);
  };
  for (const item of items) {
    item.concepts.forEach((id) => needConcept(id, item.id));
    if (item.type === "code") {
      item.commonWrong.forEach((cw) => needConcept(cw.misconception, item.id));
    } else if (isChoiceQuestion(item)) {
      item.choices.forEach((choice) => {
        if (choice.misconception) needConcept(choice.misconception, item.id);
      });
      item.lessons.forEach((id) => {
        if (!lessonIds.has(id)) problems.push(`${item.id}: bài học "${id}" không tồn tại`);
      });
    }
  }
  for (const entry of bundle.errors) {
    if (entry.misconception) needConcept(entry.misconception, `errors/${entry.id}`);
  }
  for (const concept of bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts))) {
    for (const level of ["level1", "level2", "level3"] as const) {
      for (const id of concept.practice[level]) {
        const item = itemsById.get(id);
        const where = `${concept.id}: practice.${level}`;
        if (!item) problems.push(`${where}: bài "${id}" không tồn tại`);
        else if (!(LEVEL_TYPES[level] as readonly string[]).includes(item.type)) {
          problems.push(`${where}: bài "${id}" có type ${item.type}, mức này cần ${LEVEL_TYPES[level].join(" hoặc ")}`);
        } else if (!item.concepts.includes(concept.id)) {
          problems.push(`${where}: bài "${id}" chưa khai báo khái niệm ${concept.id} trong concepts`);
        }
      }
    }
  }
  return problems;
}
