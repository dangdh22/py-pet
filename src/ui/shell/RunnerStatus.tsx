import { useLang } from "../../i18n/LangProvider";
import { useRunner } from "../contexts";
import { RunnerFailedPanel } from "../RunnerFailedPanel";

/** The small line that says whether Python is starting or ready. When Python failed it shows nothing: the alert says so. */
export function RunnerStatus() {
  const { t } = useLang();
  const runner = useRunner();
  // Not an empty `<span class="runner-failed">`: that class is the style of the alert panel.
  if (runner.status === "failed") return null;
  return (
    <span className={`runner-status runner-${runner.status}`}>
      {runner.status === "loading" ? t("runner.loading") : t("runner.ready")}
    </span>
  );
}

/** Design decision 5: the Robo panel with retry advice, shown only while Python could not start. */
export function RunnerAlert() {
  const runner = useRunner();
  return runner.status === "failed" ? <RunnerFailedPanel /> : null;
}
