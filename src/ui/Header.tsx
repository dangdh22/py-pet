import { useLang } from "../i18n/LangProvider";
import { useRunner } from "./contexts";

export function Header() {
  const { t, uiLang, setUiLang } = useLang();
  const runner = useRunner();
  return (
    <header className="app-header">
      <a href="#/" className="app-title">
        {t("app.title")}
      </a>
      <span className={`runner-status runner-${runner.status}`}>
        {runner.status === "loading" && t("runner.loading")}
        {runner.status === "ready" && t("runner.ready")}
        {runner.status === "failed" && (
          <>
            {t("runner.failed")} <button onClick={runner.retry}>{t("runner.retry")}</button>
          </>
        )}
      </span>
      <div role="group" aria-label={t("app.uiLanguage")} className="lang-switch">
        <button aria-pressed={uiLang === "vi"} onClick={() => setUiLang("vi")}>
          VI
        </button>
        <button aria-pressed={uiLang === "en"} onClick={() => setUiLang("en")}>
          EN
        </button>
      </div>
    </header>
  );
}
