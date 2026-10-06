import { useState } from "react";
import { findConcept } from "../content/lookup";
import type { Rng } from "../game/random";
import { buildPracticeSet } from "../game/reviewSet";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { useGame } from "./GameProvider";
import { SessionScreen } from "./SessionScreen";

/** 2 practice items for 1 concept at the child's ladder level. Each item pays and records as usual; the set adds nothing. */
export function PracticeScreen({ conceptId, onExit, rng = Math.random }: { conceptId: string; onExit(): void; rng?: Rng }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const concept = findConcept(bundle, conceptId);
  const [items] = useState(() => buildPracticeSet(bundle, game.state, conceptId, rng));

  if (!concept || items.length === 0) {
    return (
      <main className="room">
        <p>{t(concept ? "practice.empty" : "practice.notFound")}</p>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  return (
    <SessionScreen
      title={t("practice.title", { concept: pick(concept.name, uiLang) })}
      items={items}
      source="practice"
      doneTitle={t("practice.doneTitle")}
      onFinish={() => {}}
      onExit={onExit}
    />
  );
}
