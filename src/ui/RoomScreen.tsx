import { nextStep } from "../game/path";
import {
  currentStage,
  displayStreak,
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
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { itemKey } from "./names";
import { RoomScene } from "./robot/RoomScene";
import { routeToHash, stepRoute } from "./routing";
import { StatBar } from "./StatBar";

export function RoomScreen() {
  const game = useGame();
  const bundle = useContent();
  const { t } = useLang();
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

  return (
    <main className="room">
      <h1>{t("room.title", { name: profile.robotName })}</h1>
      <p>{t("room.greeting", { child: profile.childName })}</p>
      <RoomScene look={look} decor={decor} robotSize={robotPixelSize(look.form, look.size)}>
        <p className="pet-says">{t(message, { name: profile.robotName })}</p>
      </RoomScene>
      {look.equipped.length > 0 && <p className="room-wearing">{t("room.wearing", { items: names(look.equipped) })}</p>}
      {decor.length > 0 && <p className="room-decor">{t("room.decor", { items: names(decor) })}</p>}
      <div className="room-stats">
        <StatBar label={t("room.pin")} value={state.pet.pin} max={STAT_MAX} tone="pin" />
        <StatBar label={t("room.vui")} value={state.pet.vui} max={STAT_MAX} tone="vui" />
        <StatBar label={t("room.growth")} value={look.graduated ? 100 : growthPercent(xp, max)} max={100} tone="growth" />
      </div>
      <ul className="room-goals">
        <li>{t("room.today", { done: todayPoints(state, today), goal: state.settings.dailyGoal })}</li>
        <li>
          {weekTarget(state, weekStart(today)) === 0
            ? t("room.weekOff")
            : t("room.week", { done: weekLessons(state, today), target: weekTarget(state, weekStart(today)) })}
        </li>
        <li>{t("room.streak", { days: displayStreak(state, today) })}</li>
        <li>{t("room.freezes", { count: state.streak.freezes })}</li>
        <li>{t("room.xu", { xu: state.wallet.xu })}</li>
      </ul>
      <nav className="room-actions">
        {recharge && (
          <a className="button primary" href={routeToHash({ name: "review", stationId: null })}>
            {t("room.recharge", { name: profile.robotName })}
          </a>
        )}
        {next ? (
          <a className={recharge ? "button" : "button primary"} href={routeToHash(stepRoute(next))}>
            {t("room.continue")}
          </a>
        ) : (
          <p>{t("room.allDone")}</p>
        )}
        {canReview && condition !== "drained" && (
          <a className="button" href={routeToHash({ name: "review", stationId: null })}>
            {t("room.review")}
          </a>
        )}
        <a className="button" href="#/map">
          {t("room.map")}
        </a>
        <a className="button" href={routeToHash({ name: "shop" })}>
          {t("room.shop")}
        </a>
        <a className="button" href={routeToHash({ name: "achievements" })}>
          {t("room.achievements")}
        </a>
        <a className="button" href={routeToHash({ name: "parent" })}>
          {t("room.parent")}
        </a>
        <a className="button" href="#/backup">
          {t("room.backup")}
        </a>
      </nav>
    </main>
  );
}
