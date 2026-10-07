import { useEffect, useState } from "react";
import { allExercises, findConcept, findItem } from "../content/lookup";
import { isChoiceQuestion } from "../content/types";
import { accuracyPercent, conceptsNeedingHelp, conceptsPractising, topMisconceptions } from "../game/parentStats";
import type { Rng } from "../game/random";
import { buildPracticeSet } from "../game/reviewSet";
import type { ConceptMastery } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import type { AttemptRecord } from "../storage/types";
import { useContent } from "./contexts";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";

/** Attempts shown per concept, newest first. */
export const EVIDENCE_COUNT = 3;

/**
 * Spec 9.2: each concept that needs help, with its numbers, the child's real recent work, the tip for the parent,
 * "assign more practice" and "mark as coached"; then the concepts being practised.
 */
export function ParentHelp({ newId = () => crypto.randomUUID(), rng = Math.random }: { newId?: () => string; rng?: Rng }) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { state } = useGame();
  const flagged = conceptsNeedingHelp(state);
  const practising = conceptsPractising(state);
  const name = (id: string) => {
    const concept = findConcept(bundle, id);
    return concept ? pick(concept.name, uiLang) : id;
  };
  return (
    <section className="parent-help">
      {flagged.length === 0 ? (
        <p>{t("help.none")}</p>
      ) : (
        flagged.map(([id, m]) => <HelpCard key={id} conceptId={id} mastery={m} newId={newId} rng={rng} />)
      )}
      {practising.length > 0 && (
        <>
          <h2>{t("help.practising")}</h2>
          <ul>
            {practising.map(([id, m]) => (
              <li key={id}>{t("help.practisingItem", { name: name(id), n: Math.round(m.score) })}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function HelpCard({
  conceptId,
  mastery,
  newId,
  rng,
}: {
  conceptId: string;
  mastery: ConceptMastery;
  newId(): string;
  rng: Rng;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const game = useGame();
  const concept = findConcept(bundle, conceptId);
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  // Derived from the saved state, so it holds after a tab switch too.
  const assigned = game.state.assigned.some((a) => a.conceptId === conceptId);
  // The set is drawn when the parent clicks (with rng); its size does not depend on the draw.
  const canPractice = buildPracticeSet(bundle, game.state, conceptId, () => 0).length > 0;
  const accuracy = accuracyPercent(mastery);
  // Newest first, a few of them; the misconception counts use the whole history.
  const evidence = attempts?.slice(-EVIDENCE_COUNT).reverse() ?? null;
  const common = attempts
    ? topMisconceptions(attempts, {
        choice: (itemId, index) => {
          const item = findItem(bundle, itemId);
          return item && isChoiceQuestion(item) ? (item.choices[index]?.misconception ?? null) : null;
        },
        known: (id) => findConcept(bundle, id) !== undefined,
      })
    : [];

  useEffect(() => {
    let alive = true;
    const ids = allExercises(bundle)
      .filter((item) => item.concepts.includes(conceptId))
      .map((item) => item.id);
    game.attemptsFor(ids).then(
      (found) => alive && setAttempts(found),
      () => alive && setAttempts([]),
    );
    return () => {
      alive = false;
    };
    // The evidence is read once per card.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- game changes with every event; the evidence is read once per card
  }, [bundle, conceptId]);

  function describe(attempt: AttemptRecord): string {
    const time = formatDateTime(attempt.at);
    if (attempt.kind === "code") return t("help.codeResult", { time, passed: attempt.passedCount, total: attempt.total });
    const item = findItem(bundle, attempt.itemId);
    const choice = item && isChoiceQuestion(item) ? item.choices[attempt.choiceIndex] : undefined;
    const text = choice ? pick(choice.text, uiLang) : String(attempt.choiceIndex + 1);
    return t(attempt.correct ? "help.choiceRight" : "help.choiceWrong", { time, choice: text });
  }

  return (
    <article className="help-card">
      <h2>{concept ? pick(concept.name, uiLang) : conceptId}</h2>
      <ul className="help-numbers">
        <li>{t("help.score", { n: Math.round(mastery.score) })}</li>
        <li>{accuracy === null ? t("help.noResults") : t("help.accuracy", { n: accuracy })}</li>
        <li>{t("help.misconceptions", { n: mastery.misconceptions })}</li>
        <li>{t("help.level", { n: mastery.level })}</li>
        {mastery.coachedAt && <li>{t("help.coached", { day: mastery.coachedAt })}</li>}
      </ul>
      <h3>{t("help.evidence")}</h3>
      {evidence !== null && evidence.length === 0 && <p>{t("help.noEvidence")}</p>}
      {evidence !== null && evidence.length > 0 && (
        <ul className="help-evidence">
          {evidence.map((attempt) => (
            <li key={`${attempt.itemId}-${attempt.at}`}>
              <span>{describe(attempt)}</span>
              {attempt.kind === "code" && (
                <pre className="code-block">
                  <code>{attempt.code}</code>
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
      {common.length > 0 && (
        <>
          <h3 id={`help-common-${conceptId}`}>{t("help.topMisconceptions")}</h3>
          <ul className="help-common" aria-labelledby={`help-common-${conceptId}`}>
            {common.map(([id, n]) => (
              <li key={id}>{t("help.misconceptionItem", { name: pick(findConcept(bundle, id)!.name, uiLang), n })}</li>
            ))}
          </ul>
        </>
      )}
      {concept?.parentTip && (
        <>
          <h3>{t("help.tip")}</h3>
          <p className="help-tip">{concept.parentTip}</p>
        </>
      )}
      <div className="help-actions">
        <button
          disabled={!canPractice || assigned}
          onClick={() => {
            const items = buildPracticeSet(bundle, game.state, conceptId, rng).map((item) => item.id);
            game.dispatch({ type: "PracticeAssigned", id: newId(), conceptId, items });
          }}
        >
          {t("help.assign")}
        </button>
        <button onClick={() => game.dispatch({ type: "SupportGiven", conceptId })}>{t("help.markCoached")}</button>
      </div>
      {!canPractice && <p>{t("help.noPractice")}</p>}
      {assigned && <p role="status">{t("help.assigned")}</p>}
    </article>
  );
}
