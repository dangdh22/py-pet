import type { ReactNode } from "react";
import { useLang } from "../../i18n/LangProvider";
import { Banners } from "../Banners";
import { Icon } from "../icons";
import { PinChip, XuChip } from "./Chips";
import { RunnerAlert, RunnerStatus } from "./RunnerStatus";

/** The frame of the study screens (design spec 6.1): a slim top bar and no side menu, so the child can focus. */
export function FocusLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="focus-layout">
      <header className="focus-bar">
        <a href="#/" className="button small">
          <Icon name="back" />
          {t("nav.room")}
        </a>
        <RunnerStatus />
        <span className="focus-chips">
          <PinChip />
          <XuChip />
        </span>
      </header>
      <RunnerAlert />
      <Banners />
      {children}
    </div>
  );
}
