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
    if (node.kind === "lesson" && title) return pick(title, uiLang);
    if (node.kind === "topicTest") return t("map.topicTest");
    if (node.kind === "evolution") return t("map.evolution");
    return t("map.review");
  };
  const item = (node: PathNode) => {
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
                {nodes.filter((node) => node.kind !== "evolution" && node.topicId === topic.id).map(item)}
              </ol>
            </div>
          ))}
          <ol className="map-path">
            {nodes.filter((node) => node.kind === "evolution" && node.stageId === stage.id).map(item)}
          </ol>
        </section>
      ))}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
