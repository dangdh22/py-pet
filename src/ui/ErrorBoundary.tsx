import { Component, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { Robot } from "./Robot";

function CrashFallback() {
  const { t } = useLang();
  return (
    <div role="alert" className="crash">
      <Robot mood="sad" size={80} />
      <p>{t("app.crash")}</p>
      <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
  }

  render(): ReactNode {
    return this.state.failed ? <CrashFallback /> : this.props.children;
  }
}
