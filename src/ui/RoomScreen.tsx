import {
  currentStage,
  displayStreak,
  growthPercent,
  growthSize,
  nextLessonId,
  petCondition,
  stageXpMax,
  todayPoints,
  weekLessons,
  type GrowthSize,
  type PetCondition,
} from "../game/progress";
import { STAT_MAX } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot, type RobotMood } from "./Robot";
import { routeToHash } from "./routing";

export const ROBOT_SIZES: Record<GrowthSize, number> = { 1: 96, 2: 128, 3: 160 };

export const CONDITION_MOOD: Record<PetCondition, RobotMood> = {
  happy: "happy",
  normal: "neutral",
  sleepy: "sleepy",
  drained: "drained",
};

export function RoomScreen() {
  const game = useGame();
  const bundle = useContent();
  const { t } = useLang();
  const { state, profile, today } = game;
  const stage = currentStage(bundle, state);
  const max = stage ? stageXpMax(stage) : 0;
  const condition = petCondition(state);
  const nextId = nextLessonId(bundle, state);

  return (
    <main className="room">
      <h1>{t("room.title", { name: profile.robotName })}</h1>
      <p>{t("room.greeting", { child: profile.childName })}</p>
      <div className={`room-scene condition-${condition}`}>
        <Robot mood={CONDITION_MOOD[condition]} size={ROBOT_SIZES[growthSize(state.pet.xp, max)]} />
        <p className="pet-says">{t(`pet.${condition}`, { name: profile.robotName })}</p>
      </div>
      <ul className="room-stats">
        <li>
          {t("room.pin")}: {state.pet.pin}/{STAT_MAX}
        </li>
        <li>
          {t("room.vui")}: {state.pet.vui}/{STAT_MAX}
        </li>
        <li>
          {t("room.growth")}: {growthPercent(state.pet.xp, max)}%
        </li>
      </ul>
      <ul className="room-goals">
        <li>{t("room.today", { done: todayPoints(state, today), goal: state.settings.dailyGoal })}</li>
        <li>{t("room.week", { done: weekLessons(state, today), target: state.settings.weeklyTarget })}</li>
        <li>{t("room.streak", { days: displayStreak(state, today) })}</li>
        <li>{t("room.freezes", { count: state.streak.freezes })}</li>
        <li>{t("room.xu", { xu: state.wallet.xu })}</li>
      </ul>
      <nav className="room-actions">
        {nextId ? (
          <a className="button primary" href={routeToHash({ name: "lesson", lessonId: nextId })}>
            {t("room.continue")}
          </a>
        ) : (
          <p>{t("room.allDone")}</p>
        )}
        <a className="button" href="#/map">
          {t("room.map")}
        </a>
        <a className="button" href="#/backup">
          {t("room.backup")}
        </a>
      </nav>
    </main>
  );
}
