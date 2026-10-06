import type { ContentBundle, Exercise, Lesson } from "./types";

export function allLessons(bundle: ContentBundle): Lesson[] {
  return bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons));
}

export function findLesson(bundle: ContentBundle, id: string): Lesson | undefined {
  return allLessons(bundle).find((lesson) => lesson.id === id);
}

export function allExercises(bundle: ContentBundle): Exercise[] {
  return bundle.stages.flatMap((stage) =>
    stage.topics.flatMap((topic) => [...topic.lessons.flatMap((lesson) => lesson.exercises), ...topic.questions]),
  );
}
