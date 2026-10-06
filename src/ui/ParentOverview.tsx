import { pick } from "../i18n/lang";
import { weekStart } from "../game/dates";
import { averageXuPerDay, conceptsNeedingHelp, minutesByDay } from "../game/parentStats";
import { currentStage, displayStreak, weekLessons } from "../game/progress";
import { weekTarget } from "../game/vacation";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";

/** Spec 9.1: alerts, 7 days of study minutes (vacation days grey), stage, week plan, streak, xu. */
export function ParentOverview() {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const { state, today } = game;
  const pending = state.rewards.requests.filter((r) => r.status === "pending").length;
  const help = conceptsNeedingHelp(state).length;
  const alerts: string[] = [];
  if (pending > 0) alerts.push(t("overview.pendingRewards", { n: pending }));
  if (help > 0) alerts.push(t("overview.needsHelp", { n: help }));
  if (game.needsBackupReminder) alerts.push(t("banner.backupReminder"));
  if (state.warnings.length > 0) alerts.push(t("overview.clock", { n: state.warnings.length }));
  const days = minutesByDay(state, today);
  const most = Math.max(30, ...days.map((d) => d.minutes));
  const stage = currentStage(bundle, state);
  return (
    <section className="parent-overview">
      <h2>{t("overview.alerts")}</h2>
      {alerts.length === 0 ? (
        <p>{t("overview.noAlerts")}</p>
      ) : (
        <ul className="alerts">
          {alerts.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <h2>{t("overview.minutesTitle")}</h2>
      <ul className="minutes-chart">
        {days.map((d) => (
          <li key={d.day} className={d.vacation ? "minutes-day minutes-vacation" : "minutes-day"}>
            <span className="minutes-bar" style={{ width: `${(d.minutes / most) * 100}%` }} aria-hidden="true" />
            <span>{d.vacation ? t("overview.vacationDay", { day: d.day }) : t("overview.minutes", { day: d.day, n: d.minutes })}</span>
          </li>
        ))}
      </ul>
      {stage && <p>{t("overview.stage", { n: state.pet.stage, title: pick(stage.title, uiLang) })}</p>}
      <p>{t("room.week", { done: weekLessons(state, today), target: weekTarget(state, weekStart(today)) })}</p>
      <p>{t("room.streak", { days: displayStreak(state, today) })}</p>
      <p>{t("overview.xu", { xu: state.wallet.xu, avg: averageXuPerDay(state, today) })}</p>
    </section>
  );
}
