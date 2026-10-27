import { useLang } from "../../i18n/LangProvider";

/**
 * The yellow "Py" box and the app name; a link to the landing page, or plain text where the link would lead nowhere (the
 * welcome). The box is decoration, so the accessible name is the app name.
 */
export function Logo({ link = true }: { link?: boolean }) {
  const { t } = useLang();
  const content = (
    <>
      <b className="logo-mark" aria-hidden="true">
        Py
      </b>
      <span className="logo-text">{t("app.title")}</span>
    </>
  );
  return link ? (
    <a href="#/welcome" className="logo">
      {content}
    </a>
  ) : (
    <span className="logo">{content}</span>
  );
}
