import { useState } from "react";
import { findConcept } from "../content/lookup";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";

/**
 * Spec 5.9 step 2: after a misconception, the robot offers its "common misconception" card. The 2 practice items
 * come after the lesson or the session (ResultView), so the child never leaves it half-way.
 */
export function MisconceptionHelp({ conceptId }: { conceptId: string }) {
  const { t, uiLang } = useLang();
  const concept = findConcept(useContent(), conceptId);
  const [open, setOpen] = useState(false);
  if (!concept?.misconceptionHtml) return null;
  return (
    <div className="misconception">
      <button aria-expanded={open} onClick={() => setOpen(!open)}>
        {t("misconception.show")}
      </button>
      {open && (
        <section className="misconception-card" aria-label={t("misconception.title")}>
          <h4>
            {t("misconception.title")}: {pick(concept.name, uiLang)}
          </h4>
          <div className="card-text" dangerouslySetInnerHTML={{ __html: concept.misconceptionHtml }} />
        </section>
      )}
    </div>
  );
}
