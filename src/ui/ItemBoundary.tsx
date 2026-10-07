import { Component, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { ErrorLogContext, type LogError } from "./contexts";
import { Robot } from "./Robot";

function BrokenItem({ onSkip }: { onSkip(): void }) {
  const { t } = useLang();
  return (
    <div role="alert" className="item-broken">
      <Robot mood="sad" size={64} />
      <p>{t("item.broken")}</p>
      <button className="primary" onClick={onSkip}>
        {t("item.skip")}
      </button>
    </div>
  );
}

/**
 * Catches a render error of 1 item so a broken item never traps the child: it is logged as "content-error" and the
 * child can skip it. The screen decides what a skip means (no grading event). Key it by the item id, so the next item
 * starts clean.
 */
export class ItemBoundary extends Component<
  { itemId: string; onSkip(): void; children: ReactNode },
  { failed: boolean }
> {
  static contextType = ErrorLogContext;
  declare context: LogError;
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    this.context({
      kind: "content-error",
      detail: `${this.props.itemId}: ${message}`,
    });
  }

  render(): ReactNode {
    return this.state.failed ? <BrokenItem onSkip={this.props.onSkip} /> : this.props.children;
  }
}
