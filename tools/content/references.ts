import type { ContentBundle, Exercise } from "../../src/content/types";

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

  for (const stage of bundle.stages) {
    claim(stage.id, "giai đoạn");
    for (const topic of stage.topics) {
      claim(topic.id, "chủ đề");
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
    }
  }
  for (const entry of bundle.errors) claim(entry.id, "mục từ điển lỗi");

  const needConcept = (id: string, where: string) => {
    if (!conceptIds.has(id)) problems.push(`${where}: khái niệm "${id}" chưa được khai báo trong concepts.yaml`);
  };
  for (const item of items) {
    item.concepts.forEach((id) => needConcept(id, item.id));
    if (item.type === "code") {
      item.commonWrong.forEach((cw) => needConcept(cw.misconception, item.id));
    } else {
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
  return problems;
}
