import { useRef, type MouseEvent, type ReactNode } from "react";
import { useLang } from "../../i18n/LangProvider";
import { Banners } from "../Banners";
import { RunnerAlert } from "./RunnerStatus";
import { useEscapeHidesTips } from "./useEscapeHidesTips";

const MAIN_ID = "main-content";

/**
 * The frame with a side menu (design spec 6.1): the menu stays in view, the main column scrolls with the page. The first stop of
 * the keyboard is a link that skips the menu.
 */
export function RailLayout({
  nav,
  mode = "child",
  children,
}: {
  nav: ReactNode;
  mode?: "child" | "parent";
  children: ReactNode;
}) {
  const { t } = useLang();
  const main = useRef<HTMLDivElement>(null);
  // The floating notes (the narrow menu's labels, the badge dates, the map captions) only exist inside this frame.
  useEscapeHidesTips();
  // The pages are chosen by the hash of the address, so the link cannot go to "#main-content": it would open another page.
  // It moves the focus instead and the address stays as it is.
  const skip = (event: MouseEvent) => {
    event.preventDefault();
    main.current?.focus();
  };
  return (
    <div className="rail-layout" data-mode={mode}>
      <a href={`#${MAIN_ID}`} className="skip-link button primary small" onClick={skip}>
        {t("rail.skip")}
      </a>
      {nav}
      <div ref={main} id={MAIN_ID} tabIndex={-1} className="rail-main">
        <RunnerAlert />
        <Banners />
        {children}
      </div>
    </div>
  );
}
