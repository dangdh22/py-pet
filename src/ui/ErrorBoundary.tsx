import { Component, useState, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { ErrorLogContext, type LogError } from "./contexts";
import { downloadText } from "./download";
import { ErrorCard } from "./ErrorCard";
import { useOptionalGame } from "./GameProvider";

/**
 * The crash message as an error card; `level` 2 where the place already has its own `h1` (a section of the parent area).
 * At level 1 the card is the whole screen, and the screen that crashed took its `main` with it, so the card brings a `main` landmark.
 * At level 2 it sits inside the `main` of the parent area, so a `main` there would be a second one.
 */
export function CrashFallback({ level = 1 }: { level?: 1 | 2 }) {
  const { t } = useLang();
  const game = useOptionalGame();
  const [exportFailed, setExportFailed] = useState(false);
  const panel = (
    <div role="alert" className="error-panel">
      <ErrorCard title={t("app.crashTitle")} level={level}>
        <p>{t("app.crash")}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
          {game && (
            <button
              onClick={async () => {
                try {
                  const { fileName, text } = await game.exportBackup();
                  downloadText(fileName, text);
                  setExportFailed(false);
                } catch {
                  setExportFailed(true);
                }
              }}
            >
              {t("backup.export")}
            </button>
          )}
        </div>
        {exportFailed && <p role="alert">{t("backup.exportFailed")}</p>}
      </ErrorCard>
    </div>
  );
  return level === 1 ? <main>{panel}</main> : panel;
}

/** Catches a crash below it and shows the crash screen, or `fallback` where a smaller stand-in suits the place (a side menu). */
export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  static contextType = ErrorLogContext;
  declare context: LogError;
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
    this.context({ kind: "ui-crash", detail: String(error) });
  }

  render(): ReactNode {
    return this.state.failed ? (this.props.fallback ?? <CrashFallback />) : this.props.children;
  }
}
