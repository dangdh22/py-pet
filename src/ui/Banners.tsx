import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";

export function Banners() {
  const game = useGame();
  const { t } = useLang();
  return (
    <div className="banners">
      {!game.persistent && (
        <p role="alert" className="banner banner-danger">
          {t("banner.notPersistent")}
        </p>
      )}
      {game.writeFailed && (
        <p role="alert" className="banner banner-danger">
          {t("banner.writeFailed")} <a href="#/backup">{t("banner.backupNow")}</a>
        </p>
      )}
      {game.needsBackupReminder && (
        <p className="banner">
          {t("banner.backupReminder")} <a href="#/backup">{t("banner.backupNow")}</a>
        </p>
      )}
    </div>
  );
}
