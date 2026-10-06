import { Component, useState, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { ErrorLogContext, type LogError } from "./contexts";
import { downloadText } from "./download";
import { useOptionalGame } from "./GameProvider";
import { Robot } from "./Robot";

function CrashFallback() {
  const { t } = useLang();
  const game = useOptionalGame();
  const [exportFailed, setExportFailed] = useState(false);
  return (
    <div role="alert" className="crash">
      <Robot mood="sad" size={80} />
      <p>{t("app.crash")}</p>
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
      {exportFailed && <p role="alert">{t("backup.exportFailed")}</p>}
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
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
    return this.state.failed ? <CrashFallback /> : this.props.children;
  }
}
