import { useState, type ChangeEvent, type FormEvent } from "react";
import { localDay } from "../game/dates";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { decodeBackup, previewOf, type BackupPayload, type BackupPreview } from "../storage/backup";
import { downloadText } from "./download";
import { useGame } from "./GameProvider";

type ImportStep =
  | { kind: "locked" }
  | { kind: "choose" }
  | { kind: "error"; message: MessageKey }
  | { kind: "preview"; payload: BackupPayload; preview: BackupPreview; tampered: boolean };

export function BackupScreen() {
  const game = useGame();
  const { t } = useLang();
  const [exported, setExported] = useState<string | null>(null);
  const [exportFailed, setExportFailed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinWrong, setPinWrong] = useState(false);
  const [step, setStep] = useState<ImportStep>({ kind: "locked" });
  const [importing, setImporting] = useState(false);
  const [importFailed, setImportFailed] = useState(false);

  async function onImport(payload: BackupPayload) {
    setImporting(true);
    setImportFailed(false);
    try {
      await game.importBackup(payload);
    } catch {
      setImporting(false);
      setImportFailed(true);
    }
  }

  async function onExport() {
    setExportFailed(false);
    try {
      const { fileName, text } = await game.exportBackup();
      downloadText(fileName, text);
      setExported(fileName);
    } catch {
      setExported(null);
      setExportFailed(true);
    }
  }

  async function onPin(event: FormEvent) {
    event.preventDefault();
    if (await game.checkPin(pin)) {
      setPinWrong(false);
      setStep({ kind: "choose" });
    } else {
      setPinWrong(true);
    }
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await decodeBackup(await file.text());
    if (!result.ok) {
      setStep({ kind: "error", message: result.reason === "newer-version" ? "backup.newerVersion" : "backup.notABackup" });
      return;
    }
    const preview = previewOf(result.payload);
    if (!preview) {
      setStep({ kind: "error", message: "backup.notABackup" });
      return;
    }
    setStep({ kind: "preview", payload: result.payload, preview, tampered: !result.checksumValid });
  }

  return (
    <main className="backup">
      <h1>{t("backup.title")}</h1>
      <section>
        <p>{game.lastBackupAt ? t("backup.lastBackup", { date: localDay(new Date(game.lastBackupAt)) }) : t("backup.never")}</p>
        <button className="primary" onClick={onExport}>
          {t("backup.export")}
        </button>
        {exported && <p role="status">{t("backup.exported", { file: exported })}</p>}
        {exportFailed && <p role="alert">{t("backup.exportFailed")}</p>}
      </section>
      <section>
        <h2>{t("backup.import")}</h2>
        {step.kind === "locked" && (
          <form onSubmit={onPin}>
            <p>{t("backup.pinPrompt")}</p>
            <label>
              {t("backup.pinLabel")}
              <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} />
            </label>
            <button type="submit">{t("backup.pinCheck")}</button>
            {pinWrong && <p role="alert">{t("backup.pinWrong")}</p>}
          </form>
        )}
        {(step.kind === "choose" || step.kind === "error") && (
          <label>
            {t("backup.chooseFile")}
            <input type="file" accept=".pypet" onChange={onFile} />
          </label>
        )}
        {step.kind === "error" && <p role="alert">{t(step.message)}</p>}
        {step.kind === "preview" && (
          <div>
            {step.tampered && <p role="alert">{t("backup.tampered")}</p>}
            <p>
              {t("backup.preview", {
                name: step.preview.childName,
                stage: step.preview.stage,
                xu: step.preview.xu,
                day: step.preview.lastActiveDay ?? "-",
              })}
            </p>
            {importFailed && <p role="alert">{t("banner.writeFailed")}</p>}
            <button className="primary" disabled={importing} onClick={() => void onImport(step.payload)}>
              {t("backup.confirmImport")}
            </button>
            <button disabled={importing} onClick={() => setStep({ kind: "choose" })}>{t("backup.cancel")}</button>
          </div>
        )}
      </section>
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
