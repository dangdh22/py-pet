import { useId } from "react";
import { findConcept } from "../content/lookup";
import { pick } from "../i18n/lang";
import { localDay, weekStart } from "../game/dates";
import { averageXuPerDay, conceptsNeedingHelp, minutesByDay } from "../game/parentStats";
import { currentStage, displayStreak, weekLessons } from "../game/progress";
import { weekTarget } from "../game/vacation";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import type { ParentTab } from "./shell/ParentNav";

/** The weekday under a bar of the chart, by `Date#getUTCDay` (0 is Sunday). */
const DAY_NAMES: readonly MessageKey[] = [
  "overview.day0",
  "overview.day1",
  "overview.day2",
  "overview.day3",
  "overview.day4",
  "overview.day5",
  "overview.day6",
];

/** An alert card: a title, a line of detail, and where "Xem" leads (a section of the area, or a page outside it). */
interface OverviewAlert {
  key: string;
  title: string;
  detail?: string;
  red?: boolean;
  to: { kind: "tab"; tab: ParentTab } | { kind: "link"; href: string };
}

/**
 * Spec 9.1 and UI revamp spec 7.10: alert cards that lead to the part that needs the parent, 7 days of study minutes
 * (vacation days striped grey), and the stage, week plan, streak and xu as 4 figures.
 */
export function ParentOverview({ onShow }: { onShow(tab: ParentTab): void }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const ids = useId();
  const { state, today } = game;
  const pending = state.rewards.requests.filter((r) => r.status === "pending");
  const help = conceptsNeedingHelp(state);
  const alerts: OverviewAlert[] = [];
  if (pending.length > 0) {
    alerts.push({
      key: "rewards",
      title: t("overview.pendingRewards", { n: pending.length }),
      detail: pending.map((r) => t("overview.rewardDetail", { name: r.name, price: r.price })).join(", "),
      to: { kind: "tab", tab: "rewards" },
    });
  }
  if (help.length > 0) {
    alerts.push({
      key: "help",
      title: t("overview.needsHelp", { n: help.length }),
      detail: help
        .map(([id]) => {
          const concept = findConcept(bundle, id);
          return concept ? pick(concept.name, uiLang) : id;
        })
        .join(" · "),
      red: true,
      to: { kind: "tab", tab: "help" },
    });
  }
  if (game.needsBackupReminder) {
    alerts.push({
      key: "backup",
      title: t("banner.backupReminder"),
      detail: game.lastBackupAt ? t("backup.lastBackup", { date: localDay(new Date(game.lastBackupAt)) }) : t("backup.never"),
      to: { kind: "link", href: "#/backup" },
    });
  }
  if (state.warnings.length > 0) {
    alerts.push({ key: "clock", title: t("overview.clock", { n: state.warnings.length }), to: { kind: "tab", tab: "settings" } });
  }
  const days = minutesByDay(state, today);
  const most = Math.max(30, ...days.map((d) => d.minutes));
  const stage = currentStage(bundle, state);
  const chartTitleId = `${ids}-chart`;
  return (
    <section className="parent-overview">
      <h2 className="section-title">{t("overview.alerts")}</h2>
      {alerts.length === 0 ? (
        <p>{t("overview.noAlerts")}</p>
      ) : (
        <ul className="alert-cards">
          {alerts.map(({ key, title, detail, red, to }) => {
            const titleId = `${ids}-${key}`;
            return (
              <li key={key} className={red ? "alert-card alert-red" : "alert-card"}>
                <div>
                  <b id={titleId}>{title}</b>
                  {detail && <span>{detail}</span>}
                </div>
                {to.kind === "tab" ? (
                  <button type="button" className="small" aria-describedby={titleId} onClick={() => onShow(to.tab)}>
                    {t("overview.show")}
                  </button>
                ) : (
                  <a className="button small" href={to.href} aria-describedby={titleId}>
                    {t("overview.show")}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="overview-grid">
        <section className="card">
          <h2 className="card-title" id={chartTitleId}>
            {t("overview.minutesTitle")}
          </h2>
          <ul className="minutes-chart" aria-labelledby={chartTitleId}>
            {days.map((d) => (
              <li key={d.day} className={d.vacation ? "minutes-day minutes-vacation" : "minutes-day"}>
                <span className="minutes-value" aria-hidden="true">
                  {d.vacation ? t("overview.vacationShort") : d.minutes}
                </span>
                {/* A vacation day has a short striped bar of its own in the style sheet; a study day is as tall as its share of the most. */}
                <span
                  className="minutes-bar"
                  style={d.vacation ? undefined : { height: `${(d.minutes / most) * 100}%` }}
                  aria-hidden="true"
                />
                <span className="minutes-label" aria-hidden="true">
                  {t(DAY_NAMES[new Date(`${d.day}T00:00:00Z`).getUTCDay()])}
                </span>
                <span className="sr-only">
                  {d.vacation ? t("overview.vacationDay", { day: d.day }) : t("overview.minutes", { day: d.day, n: d.minutes })}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <dl className="overview-stats">
          {stage && (
            <div className="card">
              <dt>{t("overview.stageLabel")}</dt>
              <dd>{t("overview.stageValue", { n: state.pet.stage, title: pick(stage.title, uiLang) })}</dd>
            </div>
          )}
          <div className="card">
            <dt>{t("overview.weekLabel")}</dt>
            <dd>{t("overview.weekValue", { done: weekLessons(state, today), target: weekTarget(state, weekStart(today)) })}</dd>
          </div>
          <div className="card">
            <dt>{t("overview.streakLabel")}</dt>
            <dd>{t("overview.streakValue", { days: displayStreak(state, today) })}</dd>
          </div>
          <div className="card">
            <dt>{t("overview.xuLabel")}</dt>
            <dd>
              {state.wallet.xu}
              <small>{t("overview.xuAvg", { avg: averageXuPerDay(state, today) })}</small>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
