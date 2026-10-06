import { findConcept } from "../content/lookup";
import type { Concept } from "../content/types";
import { nextNode } from "../game/path";
import { displayStreak, todayPoints } from "../game/progress";
import { buildPracticeSet } from "../game/reviewSet";
import type { GameState } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { nodeRoute, routeToHash } from "./routing";

export function ResultView({
  before,
  after,
  title,
  message,
  practiceConcepts = [],
  onExit,
}: {
  before: GameState;
  after: GameState;
  title: string;
  message: string;
  /** Concepts whose misconception card the child saw: each one with practice items gets a link (spec 5.9 step 2). */
  practiceConcepts?: string[];
  onExit(): void;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { today } = useGame();
  const xp = after.pet.xp - before.pet.xp;
  const xu = after.wallet.xu - before.wallet.xu;
  const pin = after.pet.pin - before.pet.pin;
  const next = nextNode(bundle, after);
  const practice = practiceConcepts
    .map((id) => findConcept(bundle, id))
    .filter((concept): concept is Concept => concept !== undefined)
    .filter((concept) => buildPracticeSet(bundle, after, concept.id, Math.random).length > 0);
  return (
    <main className="lesson-done">
      <Robot mood="happy" size={96} />
      <h2>{title}</h2>
      <p>{message}</p>
      <ul className="result-rewards">
        {xp > 0 && <li>{t("result.xp", { n: xp })}</li>}
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {pin > 0 && <li>{t("result.pin", { n: pin })}</li>}
      </ul>
      <p>{t("room.today", { done: todayPoints(after, today), goal: after.settings.dailyGoal })}</p>
      <p>{t("room.streak", { days: displayStreak(after, today) })}</p>
      <nav className="room-actions">
        {next && (
          <a className="button primary" href={routeToHash(nodeRoute(next))}>
            {t("room.continue")}
          </a>
        )}
        {practice.map((concept) => (
          <a key={concept.id} className="button" href={routeToHash({ name: "practice", conceptId: concept.id })}>
            {t("result.practice", { concept: pick(concept.name, uiLang) })}
          </a>
        ))}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
