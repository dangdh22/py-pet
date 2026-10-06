import { useLang } from "../i18n/LangProvider";
import { Robot } from "./Robot";

export function SecondTabScreen() {
  const { t } = useLang();
  return (
    <main className="crash">
      <Robot mood="neutral" size={80} />
      <p>{t("app.otherTab")}</p>
    </main>
  );
}
