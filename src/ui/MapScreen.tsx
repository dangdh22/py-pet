import { useState } from "react";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { formatScore } from "./format";
import { useGame } from "./GameProvider";
import { Icon } from "./icons";
import { fitCaption } from "./mapCaption";
import { mapModel, type MapNodeView, type MapStageView, type MapTopicView } from "./mapModel";
import { nodeRoute, routeToHash } from "./routing";
import { useRovingTabs } from "./useRovingTabs";

const PANEL_ID = "map-panel";
const PASSED_ID = "map-stage-passed";
const tabId = (stageId: string) => `map-tab-${stageId}`;

/** One square of a topic row. It is named "{step}: {status}"; the step name also shows as a caption while the square has the pointer or the keyboard focus. */
function MapNode({ view, step }: { view: MapNodeView; step: string }) {
  const { t } = useLang();
  const { node, status, number } = view;
  const shape = node.kind === "topicTest" ? "test" : node.kind;
  const props = {
    className: `map-node map-node-${shape} map-node-${status}`,
    "aria-label": t("map.nodeName", { step, status: t(`map.${status}`) }),
    // The caption shows on hover or focus; it moves back into the page when the square is near a side.
    onPointerEnter: fitCaption,
    onFocus: fitCaption,
  };
  let face = null;
  if (status === "done") face = <Icon name="check" />;
  else if (status === "locked") face = <Icon name="lock" size={16} />;
  else if (node.kind === "lesson") face = number;
  else if (node.kind === "topicTest") face = t("map.testShort");
  const content = (
    <>
      <span className="map-node-box" aria-hidden="true">
        <span className="map-node-face">{face}</span>
      </span>
      <span className="map-node-caption" aria-hidden="true">
        {step}
      </span>
      {status === "next" && (
        <span className="map-node-flag" aria-hidden="true">
          {t("map.next")}
        </span>
      )}
    </>
  );
  return (
    <li>
      {status === "locked" ? (
        <span role="link" aria-disabled="true" {...props}>
          {content}
        </span>
      ) : (
        <a href={routeToHash(nodeRoute(node))} {...props}>
          {content}
        </a>
      )}
    </li>
  );
}

function MapTopic({ view }: { view: MapTopicView }) {
  const { t, uiLang } = useLang();
  const { topic, test } = view;
  const title = pick(topic.title, uiLang);
  const lessonTitles = new Map(topic.lessons.map((lesson) => [lesson.id, pick(lesson.title, uiLang)]));
  const stepName = ({ node }: MapNodeView) => {
    if (node.kind === "lesson") return lessonTitles.get(node.id) ?? node.id;
    return t(node.kind === "review" ? "map.review" : "map.topicTest");
  };
  const count = t("map.lessonsDone", { done: view.lessonsDone, total: view.lessonCount });
  const best = test ? ` · ${t("map.testBest", { score: formatScore(test.best, uiLang), max: test.max })}` : "";
  // The "Next" label floats above its square: the row keeps room for it.
  const hasNext = view.nodes.some(({ status }) => status === "next");
  return (
    <div className={view.open ? "map-topic" : "map-topic map-topic-locked"}>
      <div className="map-topic-head">
        <p className="kicker">{t("map.topicKicker", { n: view.number })}</p>
        <h2>{title}</h2>
        <p className="map-topic-count">{count + best}</p>
      </div>
      {/* role="list": Safari and VoiceOver drop the list role of a list that has `list-style: none`. */}
      <ol className={hasNext ? "map-track map-track-has-next" : "map-track"} role="list" aria-label={title}>
        {view.nodes.map((node) => (
          <MapNode key={node.node.id} view={node} step={stepName(node)} />
        ))}
      </ol>
    </div>
  );
}

/** The card at the end of a stage: the evolution test, locked, open, or passed with the best score. */
function EvolutionCard({ stage, evolution }: { stage: MapStageView; evolution: MapNodeView }) {
  const { t, uiLang } = useLang();
  const { state, profile } = useGame();
  const vars = { percent: state.settings.passPercent, name: profile.robotName };
  const { status } = evolution;
  const best = stage.bestPass;
  return (
    <section className="map-evo" aria-labelledby="map-evo-title">
      <div>
        <h2 id="map-evo-title">{t("map.evoTitle", { n: stage.number })}</h2>
        {status === "done" ? (
          <p className="map-evo-passed">
            <Icon name="check" />
            {best ? t("map.evoPassed", { score: formatScore(best.score, uiLang), max: best.max }) : t("map.done")}
          </p>
        ) : (
          <p>{t(status === "locked" ? "map.evoLocked" : "map.evoOpen", vars)}</p>
        )}
      </div>
      {status === "locked" && (
        <span className="map-evo-state">
          <Icon name="lock" />
          {t("map.locked")}
        </span>
      )}
      {status === "next" && (
        <a className="button primary" href={routeToHash(nodeRoute(evolution.node))}>
          {t("map.evoStart")}
        </a>
      )}
    </section>
  );
}

/** The panel of a stage holds something to focus: a square that is not locked is a link, and so is the start of an open evolution test. */
function hasFocusable(stage: MapStageView): boolean {
  const openSquare = stage.topics.some(({ nodes }) => nodes.some(({ status }) => status !== "locked"));
  return openSquare || stage.evolution?.status === "next";
}

/** The learning map (design spec 7.4): 1 tab per stage, 1 row of square steps per topic, the evolution test at the end of the stage. */
export function MapScreen() {
  const bundle = useContent();
  const { state } = useGame();
  const { t, uiLang } = useLang();
  const model = mapModel(bundle, state);
  // Until the child picks a tab, the map shows the stage of the next step.
  const [chosen, setChosen] = useState<string | null>(null);
  const picked = model.stages.findIndex(({ stage }) => stage.id === chosen);
  const active = picked >= 0 ? picked : model.current;
  const shown = model.stages[active];

  const { tabRef, select, onKeyDown } = useRovingTabs({
    count: model.stages.length,
    current: active,
    orientation: "horizontal",
    onSelect: (index) => setChosen(model.stages[index].stage.id),
  });

  return (
    <main className="map-page">
      <div className="map-head">
        <h1>{t("map.title")}</h1>
        <div className="map-legend" aria-hidden="true">
          <span>
            <i className="map-key map-key-done" />
            {t("map.done")}
          </span>
          <span>
            <i className="map-key map-key-next" />
            {t("map.next")}
          </span>
          <span>
            <i className="map-key map-key-review" />
            {t("map.review")}
          </span>
          <span>
            <i className="map-key map-key-test" />
            {t("map.legendTest")}
          </span>
          <span>
            <i className="map-key map-key-locked" />
            {t("map.locked")}
          </span>
        </div>
      </div>
      <div className="map-stages">
        <div className="map-tabs" role="tablist" aria-label={t("map.stages")} onKeyDown={onKeyDown}>
          {model.stages.map((view, index) => (
            <button
              key={view.stage.id}
              ref={tabRef(index)}
              type="button"
              role="tab"
              id={tabId(view.stage.id)}
              className="map-tab"
              aria-selected={index === active}
              aria-controls={PANEL_ID}
              aria-describedby={view.passed ? PASSED_ID : undefined}
              tabIndex={index === active ? 0 : -1}
              onClick={() => select(index)}
            >
              {view.passed && <Icon name="check" size={14} />}
              {pick(view.stage.title, uiLang)}
            </button>
          ))}
        </div>
        {model.stages.some(({ passed }) => passed) && (
          <span id={PASSED_ID} className="sr-only">
            {t("map.stagePassed")}
          </span>
        )}
      </div>
      {shown && (
        <section
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={tabId(shown.stage.id)}
          // A panel with nothing to focus is a tab stop itself, so the keyboard can reach it from the tabs (WAI-ARIA APG).
          tabIndex={hasFocusable(shown) ? undefined : 0}
        >
          {shown.topics.map((topic) => (
            <MapTopic key={topic.topic.id} view={topic} />
          ))}
          {shown.evolution && <EvolutionCard stage={shown} evolution={shown.evolution} />}
        </section>
      )}
    </main>
  );
}
