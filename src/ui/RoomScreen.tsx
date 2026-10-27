import { useId } from "react";
import { nextStep } from "../game/path";
import {
  currentStage,
  growthPercent,
  roomCondition,
  stageXp,
  stageXpMax,
  todayPoints,
  weekLessons,
} from "../game/progress";
import { weekStart } from "../game/dates";
import { robotLook, robotPixelSize } from "../game/look";
import { SHOP_ITEMS } from "../game/shop";
import { STAT_MAX } from "../game/state";
import { weekTarget } from "../game/vacation";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Icon } from "./icons";
import { itemKey } from "./names";
import { nextStepLabel } from "./nextStepLabel";
import { RoomScene } from "./robot/RoomScene";
import { routeToHash, stepRoute } from "./routing";
import { StreakChip, XuChip } from "./shell/Chips";
import { StatBar } from "./StatBar";

/** The most squares a goal row shows; a longer goal fills them in proportion. */
const SQUARES_MAX = 10;

/** A row of squares for a goal: `done` of `goal`, with the numbers in the text beside it, so the squares are only a picture. */
function Squares({ done, goal }: { done: number; goal: number }) {
  const shown = Math.min(goal, SQUARES_MAX);
  const filled = goal > 0 ? Math.min(shown, Math.floor((done * shown) / goal)) : 0;
  return (
    <span className="squares" aria-hidden="true">
      {Array.from({ length: shown }, (_, index) => (
        <span key={index} className={index < filled ? "on" : undefined} />
      ))}
    </span>
  );
}

export function RoomScreen() {
  const game = useGame();
  const bundle = useContent();
  const { t, uiLang } = useLang();
  const nextId = useId();
  const { state, profile, today } = game;
  const stage = currentStage(bundle, state);
  const max = stage ? stageXpMax(stage) : 0;
  const condition = roomCondition(state, today);
  const next = nextStep(bundle, state);
  const xp = stageXp(state);
  const canReview = state.progress.completedLessons.length > 0;
  const recharge = condition === "drained" && canReview;
  // An empty battery wins over an empty joy: charging by review fixes the battery first.
  const message = condition === "drained" && state.pet.pin > 0 ? "pet.drainedVui" : (`pet.${condition}` as const);
  const names = (ids: string[]) => ids.map((id) => t(itemKey(id))).join(", ");
  const look = robotLook(bundle, state, today);
  const decor = SHOP_ITEMS.filter((item) => item.kind === "decor" && state.inventory.owned.includes(item.id)).map(
    (item) => item.id,
  );
  const reviewHref = routeToHash({ name: "review", stationId: null });
  const points = todayPoints(state, today);
  const weekDone = weekLessons(state, today);
  const target = weekTarget(state, weekStart(today));
  const stepLabel = next ? nextStepLabel(bundle, next, uiLang) : "";

  return (
    <main className="room-page">
      <header className="room-head">
        <div className="room-title">
          <h1>{t("room.title", { name: profile.robotName })}</h1>
          <p>{t("room.greeting", { child: profile.childName })}</p>
        </div>
        <div className="room-chips">
          <StreakChip />
          <XuChip />
        </div>
      </header>
      <div className="room-body">
        <div className="room-left">
          <RoomScene look={look} decor={decor} robotSize={robotPixelSize(look.form, look.size)}>
            <p className="pet-says">{t(message, { name: profile.robotName })}</p>
          </RoomScene>
          {look.equipped.length > 0 && <p className="room-wearing">{t("room.wearing", { items: names(look.equipped) })}</p>}
          {decor.length > 0 && <p className="room-decor">{t("room.decor", { items: names(decor) })}</p>}
        </div>
        <div className="room-side">
          {recharge && (
            <a className="next-card" href={reviewHref}>
              <span className="next-card-text">
                <strong className="next-card-title">{t("room.recharge", { name: profile.robotName })}</strong>
              </span>
              <Icon name="next" size={26} />
            </a>
          )}
          {next ? (
            recharge ? (
              <a className="button" href={routeToHash(stepRoute(next))}>
                {t("room.continue")}
              </a>
            ) : (
              <a className="next-card" href={routeToHash(stepRoute(next))} aria-describedby={nextId}>
                <span className="next-card-text">
                  <span className="next-card-kicker" aria-hidden="true">
                    {t("room.nextKicker")}
                  </span>
                  <strong className="next-card-title">{t("room.continue")}</strong>
                  <span id={nextId} className="next-card-step" aria-hidden="true">
                    {stage ? t("room.nextIn", { step: stepLabel, stage: pick(stage.title, uiLang) }) : stepLabel}
                  </span>
                </span>
                <Icon name="next" size={26} />
              </a>
            )
          ) : (
            <p className="card room-all-done">{t("room.allDone")}</p>
          )}
          {canReview && condition !== "drained" && (
            <a className="button mint room-review" href={reviewHref}>
              {t("room.review")}
              <small aria-hidden="true">{t("room.reviewHint", { name: profile.robotName })}</small>
            </a>
          )}
          <section className="card">
            <h2 className="card-title">{t("room.statsTitle", { name: profile.robotName })}</h2>
            <div className="room-stats">
              <StatBar label={t("room.pin")} value={state.pet.pin} max={STAT_MAX} tone="pin" />
              <StatBar label={t("room.vui")} value={state.pet.vui} max={STAT_MAX} tone="vui" />
              <StatBar label={t("room.growth")} value={look.graduated ? 100 : growthPercent(xp, max)} max={100} tone="growth" />
            </div>
          </section>
          <section className="card">
            <h2 className="card-title">{t("room.goalsTitle")}</h2>
            <ul className="room-goals">
              <li>
                <span>{t("room.today", { done: points, goal: state.settings.dailyGoal })}</span>
                <Squares done={points} goal={state.settings.dailyGoal} />
              </li>
              <li>
                {target === 0 ? (
                  <span>{t("room.weekOff")}</span>
                ) : (
                  <>
                    <span>{t("room.week", { done: weekDone, target })}</span>
                    <Squares done={weekDone} goal={target} />
                  </>
                )}
              </li>
              <li>
                <span>{t("room.freezes", { count: state.streak.freezes })}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
