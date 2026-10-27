import { useLang } from "../../i18n/LangProvider";
import type { MessageKey } from "../../i18n/vi";
import { Icon, type IconName } from "../icons";
import { Logo } from "./Logo";
import { RunnerStatus } from "./RunnerStatus";
import { UiLangSwitch } from "./UiLangSwitch";

/** The items of the side menu that name a page; `null` means the page is none of them. */
export type RailItem = "room" | "map" | "shop" | "achievements" | "backup" | "parent";

interface NavLink {
  item: RailItem | "guide";
  href: string;
  label: MessageKey;
  icon: IconName;
}

const MAIN_LINKS: NavLink[] = [
  { item: "room", href: "#/", label: "rail.room", icon: "home" },
  { item: "map", href: "#/map", label: "room.map", icon: "map" },
  { item: "shop", href: "#/shop", label: "room.shop", icon: "shop" },
  { item: "achievements", href: "#/achievements", label: "room.achievements", icon: "trophy" },
];

const MORE_LINKS: NavLink[] = [
  { item: "backup", href: "#/backup", label: "room.backup", icon: "save" },
  // A static page, opened in the same tab.
  { item: "guide", href: "huong-dan.html", label: "rail.guide", icon: "help" },
];

/** The left menu of the child's pages (design spec 6.2). */
export function SideNav({ current }: { current: RailItem | null }) {
  const { t } = useLang();
  const renderLink = ({ item, href, label, icon }: NavLink) => (
    <a key={item} href={href} className="side-nav-item" aria-current={item === current ? "page" : undefined}>
      <Icon name={icon} />
      <span className="side-nav-label">{t(label)}</span>
    </a>
  );
  return (
    <nav aria-label={t("rail.label")} className="side-nav">
      <Logo />
      <div className="side-nav-group">{MAIN_LINKS.map(renderLink)}</div>
      <hr className="side-nav-sep" />
      <div className="side-nav-group">{MORE_LINKS.map(renderLink)}</div>
      <div className="side-nav-bottom">
        <RunnerStatus />
        <UiLangSwitch />
        <a href="#/parent" className="side-nav-parent button mint" aria-current={current === "parent" ? "page" : undefined}>
          <Icon name="lock" />
          <span className="side-nav-label">{t("room.parent")}</span>
        </a>
      </div>
    </nav>
  );
}
