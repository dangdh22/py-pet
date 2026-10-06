import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { routeToHash } from "./routing";

export function HomeScreen() {
  const bundle = useContent();
  const completed = new Set(useGame().state.progress.completedLessons);
  const { t, uiLang } = useLang();
  return (
    <main className="home">
      <h1>{t("home.title")}</h1>
      {bundle.stages.map((stage) => (
        <section key={stage.id}>
          <h2>{pick(stage.title, uiLang)}</h2>
          {stage.topics.map((topic) => (
            <div key={topic.id} className="topic">
              <h3>{pick(topic.title, uiLang)}</h3>
              <ol className="lesson-list">
                {topic.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <a href={routeToHash({ name: "lesson", lessonId: lesson.id })}>{pick(lesson.title, uiLang)}</a>
                    {completed.has(lesson.id) && <span className="badge-done">{t("home.done")}</span>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
