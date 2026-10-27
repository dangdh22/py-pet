import type { ReactNode } from "react";
import { Banners } from "../Banners";
import { RunnerAlert } from "./RunnerStatus";

/** The frame with a side menu (design spec 6.1): the menu stays in view, the main column scrolls with the page. */
export function RailLayout({
  nav,
  mode = "child",
  children,
}: {
  nav: ReactNode;
  mode?: "child" | "parent";
  children: ReactNode;
}) {
  return (
    <div className="rail-layout" data-mode={mode}>
      {nav}
      <div className="rail-main">
        <RunnerAlert />
        <Banners />
        {children}
      </div>
    </div>
  );
}
