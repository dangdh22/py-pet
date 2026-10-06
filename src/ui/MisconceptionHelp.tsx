import { useState } from "react";
import { findConcept } from "../content/lookup";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { routeToHash } from "./routing";

/** Spec 5.9 step 2: after a misconception, the robot offers its "common misconception" card and 2 practice items. */
export function MisconceptionHelp({ conceptId, offerPractice }: { conceptId: string; offerPractice: boolean }) {
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
          {offerPractice && (
            <a className="button" href={routeToHash({ name: "practice", conceptId })}>
              {t("misconception.practice")}
            </a>
          )}
        </section>
      )}
    </div>
  );
}
