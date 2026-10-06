import { displayStreak, nextLessonId, todayPoints } from "../game/progress";
import type { GameState } from "../game/state";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { routeToHash } from "./routing";

export function ResultView({ before, after, onExit }: { before: GameState; after: GameState; onExit(): void }) {
  const { t } = useLang();
  const bundle = useContent();
  const { today } = useGame();
  const xp = after.pet.xp - before.pet.xp;
  const xu = after.wallet.xu - before.wallet.xu;
  const pin = after.pet.pin - before.pet.pin;
  const nextId = nextLessonId(bundle, after);
  return (
    <main className="lesson-done">
      <Robot mood="happy" size={96} />
      <h2>{t("lesson.doneTitle")}</h2>
      <p>{t("lesson.doneBody")}</p>
      <ul className="result-rewards">
        {xp > 0 && <li>{t("result.xp", { n: xp })}</li>}
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {pin > 0 && <li>{t("result.pin", { n: pin })}</li>}
      </ul>
      <p>{t("room.today", { done: todayPoints(after, today), goal: after.settings.dailyGoal })}</p>
      <p>{t("room.streak", { days: displayStreak(after, today) })}</p>
      <nav className="room-actions">
        {nextId && (
          <a className="button primary" href={routeToHash({ name: "lesson", lessonId: nextId })}>
            {t("result.next")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
