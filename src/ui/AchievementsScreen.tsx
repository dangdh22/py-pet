import { BADGES, masteredConcepts, practisingConcepts } from "../game/badges";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { badgeKey, FORM_COUNT, formKey } from "./names";

/** Spec 8.2.7: badges, the robot forms reached, concepts known well and being practised; no detailed weak points. */
export function AchievementsScreen() {
  const { t } = useLang();
  const { state, profile } = useGame();
  const forms = Array.from({ length: FORM_COUNT }, (_, i) => i + 1);
  return (
    <main className="achievements">
      <h1>{t("achievements.title")}</h1>
      <section>
        <h2>{t("achievements.badges")}</h2>
        <ul className="badges">
          {BADGES.map((id) => {
            const day = state.badges[id];
            return (
              <li key={id} className={day ? "badge badge-earned" : "badge badge-locked"}>
                <span className="badge-name">{t(badgeKey(id))}</span>
                <span className="badge-day">{day ? t("achievements.earned", { day }) : t("achievements.locked")}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2>{t("achievements.forms", { name: profile.robotName })}</h2>
        <ol className="forms">
          {forms.map((stage) => (
            <li key={stage} className={stage <= state.pet.stage ? "form form-reached" : "form form-locked"}>
              {stage <= state.pet.stage ? t(formKey(stage)) : t("achievements.locked")}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <p>{t("achievements.concepts", { n: masteredConcepts(state) })}</p>
        <p>{t("achievements.practising", { n: practisingConcepts(state) })}</p>
      </section>
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
