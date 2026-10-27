import { useLang } from "../../i18n/LangProvider";

/** The yellow "Py" box and the app name; a link to the landing page. The box is decoration, so the accessible name is the app name. */
export function Logo() {
  const { t } = useLang();
  return (
    <a href="#/welcome" className="logo">
      <b className="logo-mark" aria-hidden="true">
        Py
      </b>
      <span className="logo-text">{t("app.title")}</span>
    </a>
  );
}
