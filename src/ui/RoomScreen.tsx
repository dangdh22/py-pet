import { nextStep } from "../game/path";
import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
  roomCondition,
  stageXp,
  stageXpMax,
  todayPoints,
  weekLessons,
  type GrowthSize,
  type PetCondition,
} from "../game/progress";
import { weekStart } from "../game/dates";
import { SHOP_ITEMS } from "../game/shop";
import { STAT_MAX } from "../game/state";
import { weekTarget } from "../game/vacation";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { itemKey } from "./names";
import { Robot, type RobotMood } from "./Robot";
import { routeToHash, stepRoute } from "./routing";

export const ROBOT_SIZES: Record<GrowthSize, number> = { 1: 96, 2: 128, 3: 160 };

export const CONDITION_MOOD: Record<PetCondition | "vacation", RobotMood> = {
  happy: "happy",
  normal: "neutral",
  sleepy: "sleepy",
  drained: "drained",
  vacation: "vacation",
};

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
  const decor = SHOP_ITEMS.filter((item) => item.kind === "decor" && state.inventory.owned.includes(item.id)).map(
    (item) => item.id,
  );

  return (
    <main className="room">
      <h1>{t("room.title", { name: profile.robotName })}</h1>
      <p>{t("room.greeting", { child: profile.childName })}</p>
      <div className={`room-scene condition-${condition}`}>
        <Robot mood={CONDITION_MOOD[condition]} size={ROBOT_SIZES[growthSize(xp, max)]} />
        <p className="pet-says">{t(message, { name: profile.robotName })}</p>
        {state.inventory.equipped.length > 0 && (
          <p className="room-wearing">{t("room.wearing", { items: names(state.inventory.equipped) })}</p>
        )}
        {decor.length > 0 && <p className="room-decor">{t("room.decor", { items: names(decor) })}</p>}
      </div>
      <ul className="room-stats">
        <li>
          {t("room.pin")}: {state.pet.pin}/{STAT_MAX}
        </li>
        <li>
          {t("room.vui")}: {state.pet.vui}/{STAT_MAX}
        </li>
        <li>
          {t("room.growth")}: {growthPercent(xp, max)}%
        </li>
      </ul>
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
        <a className="button" href="#/backup">
          {t("room.backup")}
        </a>
      </nav>
    </main>
  );
}
