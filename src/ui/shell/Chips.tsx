import { displayStreak } from "../../game/progress";
import { STAT_MAX } from "../../game/state";
import { useLang } from "../../i18n/LangProvider";
import { useGame } from "../GameProvider";
import { Icon } from "../icons";
import { StatIcon } from "../StatBar";

export function StreakChip() {
  const { t } = useLang();
  const { state, today } = useGame();
  return (
    <span className="chip chip-streak">
      <Icon name="flame" />
      {t("room.streak", { days: displayStreak(state, today) })}
    </span>
  );
}

export function XuChip() {
  const { t } = useLang();
  const { state } = useGame();
  return (
    <span className="chip chip-xu">
      <Icon name="coin" />
      {t("room.xu", { xu: state.wallet.xu })}
    </span>
  );
}

export function PinChip() {
  const { t } = useLang();
  const { state } = useGame();
  return (
    <span className="chip chip-pin">
      <StatIcon tone="pin" size={18} />
      {t("focus.pin", { n: state.pet.pin, max: STAT_MAX })}
    </span>
  );
}
