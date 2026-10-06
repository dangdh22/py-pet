import type { Concept, ContentBundle, Exercise, Lesson } from "./types";

export function allLessons(bundle: ContentBundle): Lesson[] {
  return bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons));
}

export function findLesson(bundle: ContentBundle, id: string): Lesson | undefined {
  return allLessons(bundle).find((lesson) => lesson.id === id);
}

export function allExercises(bundle: ContentBundle): Exercise[] {
  return bundle.stages.flatMap((stage) =>
    stage.topics.flatMap((topic) => [
      ...topic.lessons.flatMap((lesson) => lesson.exercises),
      ...topic.questions,
      ...topic.practice,
    ]),
  );
}

export function findItem(bundle: ContentBundle, id: string): Exercise | undefined {
  return allExercises(bundle).find((item) => item.id === id);
}

export function allConcepts(bundle: ContentBundle): Concept[] {
  return bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.concepts));
}

export function findConcept(bundle: ContentBundle, id: string): Concept | undefined {
  return allConcepts(bundle).find((concept) => concept.id === id);
}
