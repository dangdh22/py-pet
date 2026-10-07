import { useState } from "react";
import { freeXu, requestBlock } from "../game/realRewards";
import { isConsumable, MAX_CONSUMABLES, SHOP_ITEMS, STREAK_GIFTS, type ShopItem } from "../game/shop";
import { STAT_MAX, type GameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useGame } from "./GameProvider";
import { itemKey } from "./names";
import { StatIcon } from "./StatBar";
import { ItemIcon } from "./robot/accessories";

type Tab = "robot" | "rewards";

/** Spec 5.12 and 8.2.6: things for the robot, and real rewards from the parents. */
export function ShopScreen({ newId = () => crypto.randomUUID() }: { newId?: () => string }) {
  const { t } = useLang();
  const game = useGame();
  const [tab, setTab] = useState<Tab>("robot");
  return (
    <main className="shop">
      <h1>{t("shop.title")}</h1>
      <p className="shop-balance">{t("shop.balance", { xu: game.state.wallet.xu })}</p>
      <div role="tablist" className="tabs">
        <button role="tab" aria-selected={tab === "robot"} onClick={() => setTab("robot")}>
          {t("shop.tabRobot", { name: game.profile.robotName })}
        </button>
        <button role="tab" aria-selected={tab === "rewards"} onClick={() => setTab("rewards")}>
          {t("shop.tabRewards")}
        </button>
      </div>
      {tab === "robot" ? <RobotShop /> : <RewardShop newId={newId} />}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}

function giftDays(id: string): number | undefined {
  const entry = Object.entries(STREAK_GIFTS).find(([, gift]) => gift === id);
  return entry ? Number(entry[0]) : undefined;
}

function RobotShop() {
  const { t } = useLang();
  const game = useGame();
  const { state } = game;
  const section = (title: string, items: ShopItem[]) => (
    <section>
      <h2>{title}</h2>
      <ul className="shop-items">
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
  const name = t(itemKey(item.id));
  const owned = state.inventory.owned.includes(item.id);
  const count = state.inventory.consumables[item.id] ?? 0;
  const buy = () => game.dispatch({ type: "ItemBought", itemId: item.id });
  const use = () => game.dispatch({ type: "ItemUsed", itemId: item.id });
  const canAfford = item.price !== null && freeXu(state) >= item.price;
  // Xu the child has but a pending reward holds back.
  const noXuReason = t(item.price !== null && state.wallet.xu >= item.price ? "shop.reserved" : "shop.noXu");

  let detail;
  let actions;
  if (isConsumable(item)) {
    const full = state.pet[item.kind === "pin" ? "pin" : "vui"] >= STAT_MAX;
    detail = t(item.kind === "pin" ? "result.pin" : "result.vui", { n: item.effect ?? 0 });
    const maxed = count >= MAX_CONSUMABLES;
    const buyReason = maxed ? t("shop.maxed", { n: MAX_CONSUMABLES }) : !canAfford ? noXuReason : null;
    const useReason =
      count === 0 ? t("shop.noneLeft") : full ? t(item.kind === "pin" ? "shop.pinFull" : "shop.vuiFull") : null;
    actions = (
      <>
        <span>{t("shop.have", { n: count })}</span>
        {buyReason && <span className="shop-reason">{buyReason}</span>}
        <button onClick={buy} disabled={buyReason !== null} aria-label={`${t("shop.buy")} ${name}`}>
          {t("shop.buy")}
        </button>
        {useReason && <span className="shop-reason">{useReason}</span>}
        <button onClick={use} disabled={useReason !== null} aria-label={`${t("shop.use")} ${name}`}>
          {t("shop.use")}
        </button>
      </>
    );
  } else if (owned) {
    const worn = state.inventory.equipped.includes(item.id);
    actions =
      item.kind === "accessory" ? (
        <button onClick={use} aria-label={`${t(worn ? "shop.takeOff" : "shop.wear")} ${name}`}>
          {t(worn ? "shop.takeOff" : "shop.wear")}
        </button>
      ) : (
        <span>{t("shop.owned")}</span>
      );
  } else if (item.price === null) {
    detail = t("shop.gift", { days: giftDays(item.id) ?? 0 });
  } else {
    actions = (
      <>
        {!canAfford && <span className="shop-reason">{noXuReason}</span>}
        <button onClick={buy} disabled={!canAfford} aria-label={`${t("shop.buy")} ${name}`}>
          {t("shop.buy")}
        </button>
      </>
    );
  }
  return (
    <li className="shop-item">
      {isConsumable(item) ? (
        <StatIcon tone={item.kind} size={40} className={`item-icon item-icon-${item.kind}`} />
      ) : (
        <ItemIcon id={item.id} />
      )}
      <span className="shop-name">{name}</span>
      {item.price !== null && <span className="shop-price">{t("shop.price", { n: item.price })}</span>}
      {detail && <span className="shop-detail">{detail}</span>}
      <span className="shop-actions">{actions}</span>
    </li>
  );
}

function RewardShop({ newId }: { newId(): string }) {
  const { t } = useLang();
  const game = useGame();
  const { state, today } = game;
  const [asked, setAsked] = useState(false);
  const { catalog, requests } = state.rewards;
  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending").slice(-10).reverse();
  return (
    <section>
      {catalog.length === 0 ? (
        <p>{t("rewards.empty")}</p>
      ) : (
        <ul className="shop-items">
          {catalog.map((reward) => {
            const block = requestBlock(state, reward, today);
            return (
              <li key={reward.id} className="shop-item">
                <span className="shop-name">{reward.name}</span>
                <span className="shop-price">{t("shop.price", { n: reward.price })}</span>
                <span className="shop-detail">{t("rewards.limit", { n: reward.weeklyLimit })}</span>
                <span className="shop-actions">
                  {block && (
                    <span className="shop-reason">{t(block === "xu" ? "rewards.noXu" : "rewards.limitReached")}</span>
                  )}
                  <button
                    disabled={block !== null}
                    aria-label={`${t("rewards.ask")} ${reward.name}`}
                    onClick={() => {
                      game.dispatch({ type: "RewardRequested", requestId: newId(), rewardId: reward.id });
                      setAsked(true);
                    }}
                  >
                    {t("rewards.ask")}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {asked && <p role="status">{t("rewards.asked")}</p>}
      {pending.length > 0 && (
        <>
          <h2>{t("rewards.pendingTitle")}</h2>
          <ul>
            {pending.map((r) => (
              <li key={r.id}>
                {r.name} · {t("shop.price", { n: r.price })}
              </li>
            ))}
          </ul>
          <p>{t("rewards.freeXu", { xu: freeXu(state) })}</p>
        </>
      )}
      {decided.length > 0 && (
        <>
          <h2>{t("rewards.historyTitle")}</h2>
          <ul>
            {decided.map((r) => (
              <li key={r.id}>
                {r.name} · {t(r.status === "approved" ? "rewards.approved" : "rewards.rejected")}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
