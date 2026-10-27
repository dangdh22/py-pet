import { useState, type ReactNode } from "react";
import { useLang } from "../../i18n/LangProvider";
import { Banners } from "../Banners";
import { Icon } from "../icons";
import { PinChip, XuChip } from "./Chips";
import { FocusSlotContext } from "./FocusTitle";
import { RunnerAlert, RunnerStatus } from "./RunnerStatus";

/**
 * The frame of the study screens (design spec 6.1): a slim top bar and no side menu, so the child can focus. The bar
 * has a place for the title of the screen below it, which the screen fills with `FocusTitle`.
 */
export function FocusLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  // State, not a ref: the screens read it, and `null` tells them the place is not mounted yet.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  return (
    <FocusSlotContext.Provider value={slot}>
      <div className="focus-layout">
        <header className="focus-bar">
          <a href="#/" className="button small">
            <Icon name="back" />
            {t("nav.room")}
          </a>
          <div className="focus-title-slot" ref={setSlot} />
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
    </FocusSlotContext.Provider>
  );
}
