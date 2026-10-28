import { useLang } from "../i18n/LangProvider";
import { ErrorCard } from "./ErrorCard";

export function SecondTabScreen() {
  const { t } = useLang();
  return (
    <main className="error-page">
      <ErrorCard title={t("app.otherTabTitle")}>
        <p>{t("app.otherTab")}</p>
      </ErrorCard>
    </main>
  );
}
