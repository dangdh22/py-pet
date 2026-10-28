import { BADGES, masteredConcepts, practisingConcepts, type BadgeId } from "../game/badges";
import { formOf } from "../game/look";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { Icon, type IconName } from "./icons";
import { badgeKey, FORM_COUNT, formKey } from "./names";
import { PageHead } from "./shell/PageHead";
import { Robot } from "./Robot";

type BadgeGroup = "lessons" | "streak" | "practice" | "test" | "concepts" | "evolution";

/**
 * What a badge square shows and the color group it belongs to. The marks are numbers and short letters that need no
 * translation; the 2 test badges use an icon. The name under the mark says what the badge is.
 */
export const BADGE_LOOK: Record<BadgeId, { mark: { text: string } | { icon: IconName }; group: BadgeGroup }> = {
  "first-lesson": { mark: { text: "1" }, group: "lessons" },
  "lessons-10": { mark: { text: "10" }, group: "lessons" },
  "lessons-25": { mark: { text: "25" }, group: "lessons" },
  "lessons-50": { mark: { text: "50" }, group: "lessons" },
  "streak-3": { mark: { text: "3" }, group: "streak" },
  "streak-7": { mark: { text: "7" }, group: "streak" },
  "streak-14": { mark: { text: "14" }, group: "streak" },
  "streak-30": { mark: { text: "30" }, group: "streak" },
  "perfect-review": { mark: { text: "5/5" }, group: "practice" },
  persistence: { mark: { text: "+" }, group: "practice" },
  "topic-test": { mark: { icon: "trophy" }, group: "test" },
  "week-plan": { mark: { icon: "chart" }, group: "test" },
  "concepts-5": { mark: { text: "5" }, group: "concepts" },
  "concepts-10": { mark: { text: "10" }, group: "concepts" },
  "evolution-2": { mark: { text: "II" }, group: "evolution" },
  "evolution-3": { mark: { text: "III" }, group: "evolution" },
  "evolution-4": { mark: { text: "IV" }, group: "evolution" },
};

/**
 * Spec 8.2.7: badges, the robot forms reached, concepts known well and being practised; no detailed weak points.
 * Design decision 9: each form is a picture of Robo; a form not reached yet is a grey shape with "?" and no name.
 */
export function AchievementsScreen() {
  const { t } = useLang();
  const { state, profile } = useGame();
  const forms = Array.from({ length: FORM_COUNT }, (_, i) => i + 1);
  // A graduate (stage past the last form) still has the last form as the current one.
  const currentForm = formOf(state.pet.stage);
  const earnedCount = BADGES.filter((id) => state.badges[id]).length;
  return (
    <main className="page achievements">
      <PageHead title={t("achievements.title")} />
      <section>
        <h2 className="section-title">{t("achievements.forms", { name: profile.robotName })}</h2>
        <ol className="robo-forms">
          {forms.map((stage) => {
            const reached = stage <= state.pet.stage;
            const current = stage === currentForm;
            const classes = ["robo-form", reached ? "robo-form-reached" : "robo-form-locked", current ? "robo-form-current" : ""];
            return (
              <li key={stage} data-form={stage} className={classes.filter(Boolean).join(" ")}>
                {/* The name below says it all; the picture (and its "?") is left out of the screen reader. */}
                <span className="robo-form-stage" aria-hidden="true">
                  <Robot
                    form={formOf(stage)}
                    mood={reached ? "happy" : "neutral"}
                    size={100}
                    graduated={reached && stage === FORM_COUNT && state.pet.stage > FORM_COUNT}
                  />
                </span>
                <span className="robo-form-name">{reached ? t(formKey(stage)) : t("achievements.locked")}</span>
                <small>{t(current ? "achievements.formCurrent" : "achievements.formStage", { n: stage })}</small>
              </li>
            );
          })}
        </ol>
      </section>
      <section>
        <h2 className="section-title">{t("achievements.badgesCount", { n: earnedCount, total: BADGES.length })}</h2>
        <ul className="ach-badges">
          {BADGES.map((id) => {
            const day = state.badges[id];
            const { mark, group } = BADGE_LOOK[id];
            return (
              // An earned badge takes the focus so the keyboard can show the date of the note, as the pointer does.
              <li
                key={id}
                className={`ach-badge ach-badge-${group} ${day ? "ach-badge-earned" : "ach-badge-locked"}`}
                tabIndex={day ? 0 : undefined}
              >
                <span className="ach-badge-mark" aria-hidden="true">
                  {"text" in mark ? mark.text : <Icon name={mark.icon} size={22} />}
                  {!day && <Icon name="lock" size={12} className="ach-badge-lock" />}
                </span>
                <span className="ach-badge-name">{t(badgeKey(id))}</span>
                {day ? (
                  <span className="ach-badge-day">{t("achievements.earned", { day })}</span>
                ) : (
                  <span className="sr-only">{t("achievements.locked")}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <div className="concept-counts">
        {/* The label is a title above the number: after a number, the English "1 concepts known well" does not read right. */}
        <div className="card">
          <h2 className="card-title">{t("achievements.masteredLabel")}</h2>
          <span className="concept-count-number">{masteredConcepts(state)}</span>
        </div>
        <div className="card">
          <h2 className="card-title">{t("achievements.practisingLabel")}</h2>
          <span className="concept-count-number">{practisingConcepts(state)}</span>
        </div>
      </div>
    </main>
  );
}
