import { useLang } from "../i18n/LangProvider";
import { useRunner } from "./contexts";
import { PetRobot } from "./PetRobot";

/** Design decision 5: shown under the header while Python could not start; replaces the small header text. */
export function RunnerFailedPanel() {
  const { t } = useLang();
  const runner = useRunner();
  return (
    <section className="runner-failed" role="alert">
      <PetRobot mood="sad" size={64} />
      <div>
        <h2>{t("runner.failed")}</h2>
        <p>{t("runner.reloadHint")}</p>
        <button className="primary" onClick={runner.retry}>
          {t("runner.retry")}
        </button>
      </div>
    </section>
  );
}
