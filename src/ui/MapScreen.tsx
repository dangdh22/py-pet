import { nodeStatuses, pathNodes, type PathNode } from "../game/path";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { nodeRoute, routeToHash } from "./routing";

export function MapScreen() {
  const bundle = useContent();
  const game = useGame();
  const { t, uiLang } = useLang();
  const statuses = nodeStatuses(bundle, game.state);
  const nodes = pathNodes(bundle);
  const lessonTitles = new Map(
    bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons)).map((lesson) => [lesson.id, lesson.title]),
  );
  const label = (node: PathNode) => {
    const title = lessonTitles.get(node.id);
    return node.kind === "lesson" && title ? pick(title, uiLang) : t("map.review");
  };
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
                {nodes
                  .filter((node) => node.topicId === topic.id)
                  .map((node) => {
                    const status = statuses.get(node.id) ?? "locked";
                    return (
                      <li key={node.id} className={`map-node node-${status} node-${node.kind}`}>
                        {status === "locked" ? (
                          <span aria-disabled="true">{label(node)}</span>
                        ) : (
                          <a href={routeToHash(nodeRoute(node))}>{label(node)}</a>
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
