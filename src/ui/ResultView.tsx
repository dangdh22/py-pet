import { findConcept } from "../content/lookup";
import type { Concept } from "../content/types";
import { nextStep } from "../game/path";
import { displayStreak, todayPoints } from "../game/progress";
import { buildPracticeSet } from "../game/reviewSet";
import type { GameState } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Icon } from "./icons";
import { PetRobot } from "./PetRobot";
import { routeToHash, stepRoute } from "./routing";
import { GoalSquares } from "./shell/Squares";

/** A big chip for each reward above 0 (XP, coins, battery, joy), in this order; nothing at all when there is no reward. */
export function RewardChips({ xp = 0, xu = 0, pin = 0, vui = 0 }: { xp?: number; xu?: number; pin?: number; vui?: number }) {
  const { t } = useLang();
  const rewards = (
    [
      ["xp", xp, "result.xp"],
      ["xu", xu, "result.xu"],
      ["pin", pin, "result.pin"],
      ["vui", vui, "result.vui"],
    ] as const
  ).filter(([, amount]) => amount > 0);
  if (rewards.length === 0) return null;
  return (
    <ul className="reward-chips" aria-label={t("result.rewards")}>
      {rewards.map(([kind, amount, key]) => (
        <li key={kind} className={`chip chip-big chip-${kind}`}>
          {t(key, { n: amount })}
        </li>
      ))}
    </ul>
  );
}

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
  const vui = after.pet.vui - before.pet.vui;
  const next = nextStep(bundle, after);
  const practice = practiceConcepts
    .map((id) => findConcept(bundle, id))
    .filter((concept): concept is Concept => concept !== undefined)
    .filter((concept) => buildPracticeSet(bundle, after, concept.id, Math.random).length > 0);
  const points = todayPoints(after, today);
  return (
    <main className="result-page">
      <section className="card result-card">
        <PetRobot mood="happy" size={96} />
        <h1>{title}</h1>
        <p>{message}</p>
        <RewardChips xp={xp} xu={xu} pin={pin} vui={vui} />
        <div className="result-goal">
          <span>{t("room.today", { done: points, goal: after.settings.dailyGoal })}</span>
          <GoalSquares done={points} goal={after.settings.dailyGoal} />
        </div>
        <span className="chip chip-streak">
          <Icon name="flame" />
          {t("room.streak", { days: displayStreak(after, today) })}
        </span>
        <div className="result-actions">
          {next && (
            <a className="button primary" href={routeToHash(stepRoute(next))}>
              {t("room.continue")}
            </a>
          )}
          {practice.map((concept) => (
            <a key={concept.id} className="button" href={routeToHash({ name: "practice", conceptId: concept.id })}>
              {t("result.practice", { concept: pick(concept.name, uiLang) })}
            </a>
          ))}
          <button onClick={onExit}>{t("nav.room")}</button>
        </div>
      </section>
    </main>
  );
}
