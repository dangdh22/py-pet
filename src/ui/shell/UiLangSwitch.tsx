import { useLang } from "../../i18n/LangProvider";

/** The VI / EN buttons that switch the interface language. */
export function UiLangSwitch() {
  const { t, uiLang, setUiLang } = useLang();
  return (
    <div role="group" aria-label={t("app.uiLanguage")} className="lang-switch">
      <button aria-pressed={uiLang === "vi"} onClick={() => setUiLang("vi")}>
        VI
      </button>
      <button aria-pressed={uiLang === "en"} onClick={() => setUiLang("en")}>
        EN
      </button>
    </div>
  );
}
