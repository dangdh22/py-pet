import {
  isChoiceQuestion,
  type ChoiceQuestion,
  type CodeExercise,
  type Concept,
  type ContentBundle,
  type Exercise,
  type Lesson,
  type Stage,
  type Topic,
} from "./types";

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

/** The stage number (1 for the first stage) whose topics define the concept, or undefined when it is not a concept. */
export function conceptStage(bundle: ContentBundle, id: string): number | undefined {
  const index = bundle.stages.findIndex((stage) =>
    stage.topics.some((topic) => topic.concepts.some((concept) => concept.id === id)),
  );
  return index === -1 ? undefined : index + 1;
}

/** A concept the pet has reached: it exists and belongs to the pet's stage or an earlier one. */
export function isConceptReached(bundle: ContentBundle, id: string, petStage: number): boolean {
  const stage = conceptStage(bundle, id);
  return stage !== undefined && stage <= petStage;
}

export function findTopic(bundle: ContentBundle, id: string): Topic | undefined {
  return bundle.stages.flatMap((stage) => stage.topics).find((topic) => topic.id === id);
}

export function findStage(bundle: ContentBundle, id: string): Stage | undefined {
  return bundle.stages.find((stage) => stage.id === id);
}

/** The map node ID of a topic's test. */
export function topicTestId(topic: Topic): string {
  return `${topic.id}.test`;
}

/** The map node ID of a stage's evolution test. */
export function evolutionTestId(stage: Stage): string {
  return `${stage.id}.evolution`;
}

/** The predict/mcq questions of a topic: those of its lessons, then its bank. */
export function topicQuestions(topic: Topic): ChoiceQuestion[] {
  return [...topic.lessons.flatMap((lesson) => lesson.exercises).filter(isChoiceQuestion), ...topic.questions];
}

/** The code exercises of a topic that a test may use (test_eligible), from its lessons and its practice file. */
export function topicTestCode(topic: Topic): CodeExercise[] {
  return [...topic.lessons.flatMap((lesson) => lesson.exercises), ...topic.practice].filter(
    (item): item is CodeExercise => item.type === "code" && item.testEligible,
  );
}
