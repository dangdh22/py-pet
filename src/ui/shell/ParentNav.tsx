import { useLang } from "../../i18n/LangProvider";
import type { MessageKey } from "../../i18n/vi";
import { Icon, type IconName } from "../icons";
import { useRovingTabs } from "../useRovingTabs";
import { Logo } from "./Logo";

export type ParentTab = "overview" | "help" | "progress" | "rewards" | "settings";

export const PARENT_TABS: { id: ParentTab; label: MessageKey; icon: IconName }[] = [
  { id: "overview", label: "parent.tabOverview", icon: "chart" },
  { id: "help", label: "parent.tabHelp", icon: "alert" },
  { id: "progress", label: "parent.tabProgress", icon: "list" },
  { id: "rewards", label: "parent.tabRewards", icon: "gift" },
  { id: "settings", label: "parent.tabSettings", icon: "sliders" },
];

/** The id of the one panel that shows the chosen tab; every tab controls it. */
export const PARENT_PANEL_ID = "parent-panel";

/** The id of a tab: the panel takes its name from it. */
export function parentTabId(tab: ParentTab): string {
  return `parent-tab-${tab}`;
}

/**
 * The side menu of the parent area (design spec 6.2): the 5 tabs as a vertical tab list, a number on the tabs that have
 * something to look at, and the way out at the bottom. The numbers are hidden from assistive technology, so a tab keeps its name.
 * The tabs follow the focus: ArrowUp and ArrowDown show the tab they move to, Home and End go to the first and the last.
 */
export function ParentNav({
  tab,
  onTab,
  onLock,
  helpCount,
  rewardCount,
}: {
  tab: ParentTab;
  onTab(tab: ParentTab): void;
  onLock(): void;
  helpCount: number;
  rewardCount: number;
}) {
  const { t } = useLang();
  const counts: Partial<Record<ParentTab, number>> = { help: helpCount, rewards: rewardCount };
  const { tabRef, select, onKeyDown } = useRovingTabs({
    count: PARENT_TABS.length,
    current: PARENT_TABS.findIndex((item) => item.id === tab),
    orientation: "vertical",
    onSelect: (index) => onTab(PARENT_TABS[index].id),
  });
  return (
    <nav aria-label={t("parent.title")} className="side-nav">
      <Logo />
      <p className="side-nav-zone">
        <Icon name="lock" />
        <span className="side-nav-zone-text">{t("parent.title")}</span>
      </p>
      <div
        role="tablist"
        aria-label={t("parent.tabsLabel")}
        aria-orientation="vertical"
        className="side-nav-group"
        onKeyDown={onKeyDown}
      >
        {PARENT_TABS.map((item, index) => {
          const count = counts[item.id] ?? 0;
          return (
            <button
              key={item.id}
              ref={tabRef(index)}
              type="button"
              role="tab"
              id={parentTabId(item.id)}
              className="side-nav-item"
              aria-selected={tab === item.id}
              aria-controls={PARENT_PANEL_ID}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => select(index)}
            >
              <Icon name={item.icon} />
              <span className="side-nav-label">{t(item.label)}</span>
              {count > 0 && (
                <span className="count" aria-hidden="true">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="side-nav-bottom">
        <p className="side-nav-note">{t("parent.autoLockNote")}</p>
        <button type="button" className="side-nav-lock" onClick={onLock}>
          <Icon name="back" />
          <span className="side-nav-label">{t("parent.lockAndLeave")}</span>
        </button>
      </div>
    </nav>
  );
}
