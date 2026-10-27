import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { freeXu, requestBlock } from "../game/realRewards";
import { isConsumable, MAX_CONSUMABLES, SHOP_ITEMS, STREAK_GIFTS, type AccessorySlot, type ShopItem } from "../game/shop";
import { STAT_MAX, type GameState, type RewardItem } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { useGame } from "./GameProvider";
import { Icon } from "./icons";
import { itemKey } from "./names";
import { PageHead } from "./shell/PageHead";
import { StatIcon } from "./StatBar";
import { ItemIcon } from "./robot/accessories";
import { tabKeyTarget } from "./tabKeys";

type Tab = "robot" | "rewards";

const TABS: readonly Tab[] = ["robot", "rewards"];
const PANEL_ID = "shop-panel";
const tabId = (tab: Tab) => `shop-tab-${tab}`;

const SLOT_KEYS: Record<AccessorySlot, MessageKey> = {
  head: "shop.slotHead",
  face: "shop.slotFace",
  neck: "shop.slotNeck",
};

/** Spec 5.12 and 8.2.6: things for the robot, and real rewards from the parents. */
export function ShopScreen({ newId = () => crypto.randomUUID() }: { newId?: () => string }) {
  const { t } = useLang();
  const game = useGame();
  const [tab, setTab] = useState<Tab>("robot");
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const labels: Record<Tab, string> = {
    robot: t("shop.tabRobot", { name: game.profile.robotName }),
    rewards: t("shop.tabRewards"),
  };

  // The tabs follow the focus: an arrow key shows the tab it moves to.
  const select = (index: number) => {
    setTab(TABS[index]);
    tabButtons.current[index]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const target = tabKeyTarget(event.key, TABS.indexOf(tab), TABS.length, "horizontal");
    if (target === null) return;
    event.preventDefault();
    select(target);
  };

  return (
    <main className="page shop">
      <PageHead title={t("shop.title")}>
        <span className="chip chip-xu">
          <Icon name="coin" />
          {t("shop.balance", { xu: game.state.wallet.xu })}
        </span>
      </PageHead>
      <div role="tablist" aria-label={t("shop.tabsLabel")} className="page-tabs" onKeyDown={onKeyDown}>
        {TABS.map((id, index) => (
          <button
            key={id}
            ref={(element) => {
              tabButtons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tabId(id)}
            aria-selected={tab === id}
            aria-controls={PANEL_ID}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => select(index)}
          >
            {labels[id]}
          </button>
        ))}
      </div>
      <section role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(tab)}>
        {tab === "robot" ? <RobotShop /> : <RewardShop newId={newId} />}
      </section>
    </main>
  );
}

function giftDays(id: string): number | undefined {
  const entry = Object.entries(STREAK_GIFTS).find(([, gift]) => gift === id);
  return entry ? Number(entry[0]) : undefined;
}

/** One square card of the shop: a picture on the tint of its group, then what the child reads and presses. */
function ShopCard({
  group,
  picture,
  wearing = false,
  children,
}: {
  group: "pin" | "vui" | "accessory" | "decor" | "reward";
  picture: ReactNode;
  wearing?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={wearing ? "shop-card wearing" : "shop-card"}>
      <div className={`shop-pic shop-pic-${group}`} aria-hidden="true">
        {picture}
      </div>
      <div className="shop-meta">{children}</div>
    </li>
  );
}

function RobotShop() {
  const { t } = useLang();
  const game = useGame();
  const { state } = game;
  const section = (title: string, items: ShopItem[]) => (
    <section>
      <h2 className="section-title">{title}</h2>
      <ul className="shop-grid">
        {items.map((item) => (
          <ShopRow key={item.id} item={item} state={state} />
        ))}
      </ul>
    </section>
  );
  return (
    <>
      {section(t("shop.consumables"), SHOP_ITEMS.filter(isConsumable))}
      {section(t("shop.accessories"), SHOP_ITEMS.filter((item) => item.kind === "accessory"))}
      {section(t("shop.decor"), SHOP_ITEMS.filter((item) => item.kind === "decor"))}
    </>
  );
}

function ShopRow({ item, state }: { item: ShopItem; state: GameState }) {
  const { t } = useLang();
  const game = useGame();
  const reasonId = useId();
  const buyReasonId = `${reasonId}-buy`;
  const useReasonId = `${reasonId}-use`;
  const name = t(itemKey(item.id));
  const consumable = isConsumable(item);
  const owned = !consumable && state.inventory.owned.includes(item.id);
  const worn = owned && state.inventory.equipped.includes(item.id);
  const count = state.inventory.consumables[item.id] ?? 0;
  const buy = () => game.dispatch({ type: "ItemBought", itemId: item.id });
  const use = () => game.dispatch({ type: "ItemUsed", itemId: item.id });
  const canAfford = item.price !== null && freeXu(state) >= item.price;
  // Xu the child has but a pending reward holds back.
  const noXuReason = t(item.price !== null && state.wallet.xu >= item.price ? "shop.reserved" : "shop.noXu");

  // What the item does, then why each button is off (null when it works).
  let detail: string | null;
  let buyReason: string | null;
  let useReason: string | null = null;
  if (consumable) {
    const full = state.pet[item.kind === "pin" ? "pin" : "vui"] >= STAT_MAX;
    detail = t(item.kind === "pin" ? "result.pin" : "result.vui", { n: item.effect ?? 0 });
    buyReason = count >= MAX_CONSUMABLES ? t("shop.maxed", { n: MAX_CONSUMABLES }) : !canAfford ? noXuReason : null;
    useReason =
      count === 0 ? t("shop.noneLeft") : full ? t(item.kind === "pin" ? "shop.pinFull" : "shop.vuiFull") : null;
  } else {
    detail = item.kind === "accessory" ? (item.slot ? t(SLOT_KEYS[item.slot]) : null) : t("shop.decorDetail");
    buyReason = !owned && item.price !== null && !canAfford ? noXuReason : null;
  }

  // The left of the last line: the price, or what the child already has, or how to get a gift.
  let left: ReactNode;
  if (owned) left = <span className="shop-status">{t("shop.owned")}</span>;
  else if (item.price === null) {
    left = <span className="shop-status">{t("shop.gift", { days: giftDays(item.id) ?? 0 })}</span>;
  } else {
    left = (
      <span className="shop-price">
        <Icon name="coin" size={14} />
        {t("shop.price", { n: item.price })}
      </span>
    );
  }

  const buyButton = (
    <button
      type="button"
      className="small"
      onClick={buy}
      disabled={buyReason !== null}
      aria-describedby={buyReason ? buyReasonId : undefined}
      aria-label={`${t("shop.buy")} ${name}`}
    >
      {t("shop.buy")}
    </button>
  );
  let buttons: ReactNode = null;
  if (consumable) {
    buttons = (
      <>
        {buyButton}
        <button
          type="button"
          className="small"
          onClick={use}
          disabled={useReason !== null}
          aria-describedby={useReason ? useReasonId : undefined}
          aria-label={`${t("shop.use")} ${name}`}
        >
          {t("shop.use")}
        </button>
      </>
    );
  } else if (owned) {
    if (item.kind === "accessory") {
      buttons = (
        <button type="button" className="small" onClick={use} aria-label={`${t(worn ? "shop.takeOff" : "shop.wear")} ${name}`}>
          {t(worn ? "shop.takeOff" : "shop.wear")}
        </button>
      );
    }
  } else if (item.price !== null) {
    buttons = buyButton;
  }

  return (
    <ShopCard
      group={item.kind}
      wearing={worn}
      picture={consumable ? <StatIcon tone={item.kind} size={48} /> : <ItemIcon id={item.id} size={54} />}
    >
      <span className="shop-name">{name}</span>
      {detail && <span className="shop-detail">{detail}</span>}
      {worn && <span className="tag">{t("shop.wearing")}</span>}
      {consumable && <span className="shop-have">{t("shop.have", { n: count })}</span>}
      {buyReason && (
        <p className="shop-reason" id={buyReasonId}>
          {buyReason}
        </p>
      )}
      {useReason && (
        <p className="shop-reason" id={useReasonId}>
          {useReason}
        </p>
      )}
      <div className="shop-row">
        {left}
        {buttons && <span className="shop-buttons">{buttons}</span>}
      </div>
    </ShopCard>
  );
}

function RewardCard({ reward, onAsked, newId }: { reward: RewardItem; onAsked(): void; newId(): string }) {
  const { t } = useLang();
  const game = useGame();
  const reasonId = useId();
  const block = requestBlock(game.state, reward, game.today);
  return (
    <ShopCard group="reward" picture={<Icon name="gift" size={48} />}>
      <span className="shop-name">{reward.name}</span>
      <span className="shop-detail">{t("rewards.limit", { n: reward.weeklyLimit })}</span>
      {block && (
        <p className="shop-reason" id={reasonId}>
          {t(block === "xu" ? "rewards.noXu" : "rewards.limitReached")}
        </p>
      )}
      <div className="shop-row">
        <span className="shop-price">
          <Icon name="coin" size={14} />
          {t("shop.price", { n: reward.price })}
        </span>
        <span className="shop-buttons">
          <button
            type="button"
            className="small"
            disabled={block !== null}
            aria-describedby={block ? reasonId : undefined}
            aria-label={`${t("rewards.ask")} ${reward.name}`}
            onClick={() => {
              game.dispatch({ type: "RewardRequested", requestId: newId(), rewardId: reward.id });
              onAsked();
            }}
          >
            {t("rewards.ask")}
          </button>
        </span>
      </div>
    </ShopCard>
  );
}

function RewardShop({ newId }: { newId(): string }) {
  const { t } = useLang();
  const game = useGame();
  const { state } = game;
  const [asked, setAsked] = useState(false);
  const { catalog, requests } = state.rewards;
  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending").slice(-10).reverse();
  return (
    <>
      {catalog.length === 0 ? (
        <p>{t("rewards.empty")}</p>
      ) : (
        <ul className="shop-grid">
          {catalog.map((reward) => (
            <RewardCard key={reward.id} reward={reward} newId={newId} onAsked={() => setAsked(true)} />
          ))}
        </ul>
      )}
      {asked && (
        <p role="status" className="shop-asked">
          {t("rewards.asked")}
        </p>
      )}
      {pending.length > 0 && (
        <section className="card">
          <h2 className="card-title">{t("rewards.pendingTitle")}</h2>
          <ul>
            {pending.map((r) => (
              <li key={r.id}>
                {r.name} · {t("shop.price", { n: r.price })}
              </li>
            ))}
          </ul>
          <p>{t("rewards.freeXu", { xu: freeXu(state) })}</p>
        </section>
      )}
      {decided.length > 0 && (
        <section className="card">
          <h2 className="card-title">{t("rewards.historyTitle")}</h2>
          <ul>
            {decided.map((r) => (
              <li key={r.id}>
                {r.name} · {t(r.status === "approved" ? "rewards.approved" : "rewards.rejected")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
