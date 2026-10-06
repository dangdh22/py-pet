import { useState } from "react";
import { findConcept, findItem } from "../content/lookup";
import type { Exercise } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/** Practice a parent gave (spec 9.2): a practice session; finishing it removes it from "Học tiếp". */
export function AssignedPracticeScreen({ id, onExit }: { id: string; onExit(): void }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const [assigned] = useState(() => game.state.assigned.find((a) => a.id === id));
  const [items] = useState(() =>
    (assigned?.items ?? []).map((itemId) => findItem(bundle, itemId)).filter((item): item is Exercise => item !== undefined),
  );
  const concept = assigned ? findConcept(bundle, assigned.conceptId) : undefined;

  if (!assigned) {
    return (
      <main className="room">
        <p>{t("assigned.notFound")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t("assigned.title", { concept: concept ? pick(concept.name, uiLang) : assigned.conceptId })}
      items={items}
      source="practice"
      doneTitle={t("assigned.doneTitle")}
      onFinish={() => game.dispatch({ type: "AssignedPracticeDone", id })}
      onExit={onExit}
    />
  );
}
