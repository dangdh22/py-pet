import { useState } from "react";
import { findNode } from "../game/path";
import type { Rng } from "../game/random";
import { buildReviewSet } from "../game/reviewSet";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/**
 * A review station of the map (stationId) or a free review (null). A free review needs at least 1 item: it charges
 * the robot, so it must not pay for nothing.
 */
export function ReviewScreen({ stationId, onExit, rng = Math.random }: { stationId: string | null; onExit(): void; rng?: Rng }) {
  const { t } = useLang();
  const bundle = useContent();
  const game = useGame();
  const [items] = useState(() => {
    const node = stationId === null ? undefined : findNode(bundle, stationId);
    const recentLessons = node?.kind === "review" ? node.lessons : game.state.progress.completedLessons.slice(-2);
    return buildReviewSet({ bundle, state: game.state, today: game.today, rng, recentLessons });
  });

  if (stationId === null && items.length === 0) {
    return (
      <main className="room">
        <p>{t("review.empty")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t(stationId === null ? "review.freeTitle" : "review.title")}
      items={items}
      source="review"
      doneTitle={t(stationId === null ? "review.freeDoneTitle" : "review.doneTitle")}
      onFinish={({ correct, total }) => game.dispatch({ type: "ReviewCompleted", stationId, correct, total })}
      onExit={onExit}
    />
  );
}
