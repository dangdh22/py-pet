import { useState } from "react";
import { averageXuPerDay } from "../game/parentStats";
import { cleanCatalog, REWARD_MAX_PER_WEEK, REWARD_MAX_PRICE } from "../game/realRewards";
import type { RewardItem } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

/** Decided requests shown in the history. */
export const REWARD_HISTORY_SHOWN = 20;

/** Spec 9.4: approve or reject requests, keep the reward list, see the daily xu average and the history. */
export function ParentRewards({ newId = () => crypto.randomUUID() }: { newId?: () => string }) {
  const { t } = useLang();
  const game = useGame();
  const { state, today } = game;
  const pending = state.rewards.requests.filter((r) => r.status === "pending");
  const decided = state.rewards.requests
    .filter((r) => r.status !== "pending")
    .slice(-REWARD_HISTORY_SHOWN)
    .reverse();
  const [rows, setRows] = useState<RewardItem[]>(() => state.rewards.catalog);
  const [saved, setSaved] = useState(false);
  const edit = (index: number, patch: Partial<RewardItem>) => {
    setSaved(false);
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="parent-rewards">
      <h2>{t("rewardsTab.pending")}</h2>
      {pending.length === 0 ? (
        <p>{t("rewardsTab.noPending")}</p>
      ) : (
        <ul className="requests">
          {pending.map((r) => {
            const short = state.wallet.xu < r.price;
            return (
              <li key={r.id}>
                <span>{t("rewardsTab.request", { name: r.name, price: r.price, time: formatDateTime(r.at) })}</span>
                <button
                  className="primary"
                  disabled={short}
                  aria-label={`${t("rewardsTab.approve")} ${r.name}`}
                  onClick={() => game.dispatch({ type: "RewardApproved", requestId: r.id })}
                >
                  {t("rewardsTab.approve")}
                </button>
                <button
                  aria-label={`${t("rewardsTab.reject")} ${r.name}`}
                  onClick={() => game.dispatch({ type: "RewardRejected", requestId: r.id })}
                >
                  {t("rewardsTab.reject")}
                </button>
                {short && <span>{t("rewardsTab.notEnough", { xu: state.wallet.xu })}</span>}
              </li>
            );
          })}
        </ul>
      )}

      <h2>{t("rewardsTab.listTitle")}</h2>
      <p>{t("rewardsTab.average", { avg: averageXuPerDay(state, today) })}</p>
      <ol className="reward-rows">
        {rows.map((row, index) => (
          <li key={row.id}>
            <label>
              {t("rewardsTab.name")}
              <input value={row.name} onChange={(e) => edit(index, { name: e.target.value })} />
            </label>
            <label>
              {t("rewardsTab.price")}
              <input
                type="number"
                min={0}
                max={REWARD_MAX_PRICE}
                value={row.price}
                onChange={(e) => edit(index, { price: Number(e.target.value) })}
              />
            </label>
            <label>
              {t("rewardsTab.limit")}
              <input
                type="number"
                min={0}
                max={REWARD_MAX_PER_WEEK}
                value={row.weeklyLimit}
                onChange={(e) => edit(index, { weeklyLimit: Number(e.target.value) })}
              />
            </label>
            <button
              onClick={() => {
                setSaved(false);
                setRows((current) => current.filter((_, i) => i !== index));
              }}
            >
              {t("rewardsTab.remove")}
            </button>
          </li>
        ))}
      </ol>
      <button
        onClick={() => {
          setSaved(false);
          setRows((current) => [...current, { id: newId(), name: "", price: 50, weeklyLimit: 1 }]);
        }}
      >
        {t("rewardsTab.add")}
      </button>
      <button
        className="primary"
        onClick={() => {
          const cleaned = cleanCatalog(rows);
          game.dispatch({ type: "RewardsEdited", catalog: cleaned });
          setRows(cleaned);
          setSaved(true);
        }}
      >
        {t("rewardsTab.save")}
      </button>
      {saved && <p role="status">{t("rewardsTab.saved")}</p>}

      {decided.length > 0 && (
        <>
          <h2>{t("rewardsTab.historyTitle")}</h2>
          <ul>
            {decided.map((r) => (
              <li key={r.id}>
                {t("rewardsTab.historyItem", {
                  time: formatDateTime(r.decidedAt ?? r.at),
                  name: r.name,
                  price: r.price,
                  status: t(r.status === "approved" ? "rewardsTab.approvedStatus" : "rewardsTab.rejectedStatus"),
                })}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
