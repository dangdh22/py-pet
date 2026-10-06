import { lessonStatuses } from "../game/progress";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { routeToHash } from "./routing";

export function MapScreen() {
  const bundle = useContent();
  const game = useGame();
  const { t, uiLang } = useLang();
  const statuses = lessonStatuses(bundle, game.state);
  return (
    <main className="map">
      <h1>{t("map.title")}</h1>
      {bundle.stages.map((stage) => (
        <section key={stage.id}>
          <h2>{pick(stage.title, uiLang)}</h2>
          {stage.topics.map((topic) => (
            <div key={topic.id} className="topic">
              <h3>{pick(topic.title, uiLang)}</h3>
              <ol className="map-path">
                {topic.lessons.map((lesson) => {
                  const status = statuses.get(lesson.id) ?? "locked";
                  const title = pick(lesson.title, uiLang);
                  return (
                    <li key={lesson.id} className={`map-node node-${status}`}>
                      {status === "locked" ? (
                        <span aria-disabled="true">{title}</span>
                      ) : (
                        <a href={routeToHash({ name: "lesson", lessonId: lesson.id })}>{title}</a>
                      )}
                      <span className="node-status">{t(`map.${status}`)}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </section>
      ))}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
