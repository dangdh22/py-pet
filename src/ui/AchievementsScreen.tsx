import { BADGES, masteredConcepts, practisingConcepts } from "../game/badges";
import { formOf } from "../game/look";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { badgeKey, FORM_COUNT, formKey } from "./names";
import { Robot } from "./Robot";

/**
 * Spec 8.2.7: badges, the robot forms reached, concepts known well and being practised; no detailed weak points.
 * Design decision 9: each form is a picture of Robo; a form not reached yet is a grey shape with "?" and no name.
 */
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
          {forms.map((stage) => {
            const reached = stage <= state.pet.stage;
            return (
              <li key={stage} data-form={stage} className={reached ? "form form-reached" : "form form-locked"}>
                {/* The name below says it all; the picture (and its "?") is left out of the screen reader. */}
                <span className="form-picture" aria-hidden="true">
                  <Robot
                    form={formOf(stage)}
                    mood={reached ? "happy" : "neutral"}
                    size={72}
                    graduated={reached && stage === FORM_COUNT && state.pet.stage > FORM_COUNT}
                  />
                </span>
                <span className="form-name">{reached ? t(formKey(stage)) : t("achievements.locked")}</span>
              </li>
            );
          })}
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
