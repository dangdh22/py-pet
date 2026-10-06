import { Component, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { ErrorLogContext, type LogError } from "./contexts";
import { downloadText } from "./download";
import { useOptionalGame } from "./GameProvider";
import { Robot } from "./Robot";

function CrashFallback() {
  const { t } = useLang();
  const game = useOptionalGame();
  return (
    <div role="alert" className="crash">
      <Robot mood="sad" size={80} />
      <p>{t("app.crash")}</p>
      <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
      {game && (
        <button
          onClick={async () => {
            const { fileName, text } = await game.exportBackup();
            downloadText(fileName, text);
          }}
        >
          {t("backup.export")}
        </button>
      )}
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
