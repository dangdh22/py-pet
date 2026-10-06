import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import type { GameState } from "../game/state";
import type { Topic } from "../content/types";
import { useContent } from "./contexts";
import { formatScore } from "./ExamRunner";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

/** The average mastery of a topic's concepts that have a record, or null. */
function topicMastery(topic: Topic, state: GameState): number | null {
  const scores = topic.concepts.map((c) => state.mastery[c.id]?.score).filter((s): s is number => s !== undefined);
  return scores.length === 0 ? null : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Spec 9.3: a table by topic, the evolution test history, and the details of each lesson. */
export function ParentProgress() {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { state } = useGame();
  const topics = bundle.stages.flatMap((stage) => stage.topics);
  const done = new Set(state.progress.completedLessons);
  const stats = state.progress.exerciseStats ?? {};
  return (
    <section className="parent-progress">
      <h2>{t("progress.topicsTitle")}</h2>
      <table>
        <thead>
          <tr>
            <th>{t("progress.topic")}</th>
            <th>{t("progress.lessons")}</th>
            <th>{t("progress.mastery")}</th>
            <th>{t("progress.topicTest")}</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => {
            const mastery = topicMastery(topic, state);
            const record = state.progress.topicTests[topic.id];
            return (
              <tr key={topic.id}>
                <td>{pick(topic.title, uiLang)}</td>
                <td>
                  {t("progress.count", {
                    done: topic.lessons.filter((lesson) => done.has(lesson.id)).length,
                    total: topic.lessons.length,
                  })}
                </td>
                <td>{mastery === null ? t("progress.none") : mastery}</td>
                <td>
                  {record
                    ? t("progress.count", { done: formatScore(record.best, uiLang), total: record.max })
                    : t("progress.none")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>{t("progress.evolutionTitle")}</h2>
      {state.progress.evolutionTests.length === 0 ? (
        <p>{t("progress.evolutionNone")}</p>
      ) : (
        <ul>
          {state.progress.evolutionTests.map((attempt) => (
            <li key={attempt.at}>
              {t("progress.evolutionItem", {
                time: formatDateTime(attempt.at),
                stage: attempt.stage,
                score: formatScore(attempt.score, uiLang),
                max: attempt.max,
                verdict: t(attempt.passed ? "progress.passed" : "progress.failed"),
              })}
            </li>
          ))}
        </ul>
      )}

      <h2>{t("progress.lessonsTitle")}</h2>
      <ul className="lesson-details">
        {topics.flatMap((topic) =>
          topic.lessons.map((lesson) => (
            <li key={lesson.id}>
              <strong>{pick(lesson.title, uiLang)}</strong>{" "}
              {t(done.has(lesson.id) ? "progress.lessonDone" : "progress.lessonNotDone")}
              <ul>
                {lesson.exercises
                  .filter((exercise) => stats[exercise.id])
                  .map((exercise) => {
                    const s = stats[exercise.id]!;
                    const parts = [t("progress.fails", { n: s.fails }), t("progress.hints", { n: s.hints })];
                    if (s.viewedSolution) parts.push(t("progress.solution"));
                    return (
                      <li key={exercise.id}>
                        {exercise.id}: {parts.join(", ")}
                      </li>
                    );
                  })}
              </ul>
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
