import { useState } from "react";
import { findItem } from "../content/lookup";
import type { Exercise } from "../content/types";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/** The focused review set of a failed evolution test (spec 5.11). Finishing it opens the retake. */
export function RemedialScreen({ onExit }: { onExit(): void }) {
  const { t } = useLang();
  const bundle = useContent();
  const game = useGame();
  const [items] = useState(() =>
    (game.state.remedial?.items ?? [])
      .map((id) => findItem(bundle, id))
      .filter((item): item is Exercise => item !== undefined),
  );
  const [open] = useState(() => game.state.remedial !== null);

  if (!open) {
    return (
      <main className="room">
        <p>{t("remedial.none")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t("remedial.title")}
      items={items}
      source="practice"
      doneTitle={t("remedial.doneTitle")}
      onFinish={() => game.dispatch({ type: "RemedialCompleted" })}
      onExit={onExit}
    />
  );
}
