import { useState } from "react";
import { findConcept } from "../content/lookup";
import type { Concept, Stage } from "../content/types";
import { buildRemedialSet, drawEvolutionTest, gradePaper, type ExamGrade } from "../game/exam";
import { nextStep } from "../game/path";
import type { Rng } from "../game/random";
import { isPass } from "../game/rewards";
import type { GameState } from "../game/state";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { ExamRunner, formatScore } from "./ExamRunner";
import { useGame } from "./GameProvider";
import { Robot } from "./Robot";
import { routeToHash, stepRoute } from "./routing";

/**
 * The evolution test of a stage (spec 5.11). The paper avoids the previous attempt's items. Passed: the robot
 * evolves. Failed: the weak concepts and a focused review set; the retake opens once the set is done.
 */
export function EvolutionTestScreen({
  stage,
  stageNumber,
  onExit,
  rng = Math.random,
}: {
  stage: Stage;
  stageNumber: number;
  onExit(): void;
  rng?: Rng;
}) {
  // The retake link leads to the hash of this very screen, which changes nothing by itself: it starts a new paper.
  const [round, setRound] = useState(0);
  return (
    <EvolutionAttempt
      key={round}
      stage={stage}
      stageNumber={stageNumber}
      onExit={onExit}
      onRetake={() => setRound((n) => n + 1)}
      rng={rng}
    />
  );
}

function EvolutionAttempt({
  stage,
  stageNumber,
  onExit,
  onRetake,
  rng,
}: {
  stage: Stage;
  stageNumber: number;
  onExit(): void;
  onRetake(): void;
  rng: Rng;
}) {
  const { t } = useLang();
  const game = useGame();
  const bundle = useContent();
  const [before] = useState(() => game.state);
  const [items] = useState(() => {
    const previous = game.state.progress.evolutionTests.filter((attempt) => attempt.stage === stageNumber).at(-1);
    return drawEvolutionTest(bundle, stage, previous?.items ?? [], rng);
  });
  const [grade, setGrade] = useState<ExamGrade | null>(null);
  // Checked once on opening: a failed attempt opens a set, and its result screen must stay.
  const [remedialFirst] = useState(() => game.state.remedial !== null);

  if (remedialFirst) {
    return (
      <main className="room">
        <p>{t("evolution.remedialFirst")}</p>
        <a className="button primary" href={routeToHash({ name: "remedial" })}>
          {t("evolution.startRemedial")}
        </a>
        <a href="#/">{t("nav.room")}</a>
      </main>
    );
  }
  if (grade) {
    return isPass(grade.score, grade.max) ? (
      <EvolutionPassed before={before} after={game.state} grade={grade} onExit={onExit} />
    ) : (
      <EvolutionFailed after={game.state} grade={grade} stageId={stage.id} onRetake={onRetake} onExit={onExit} />
    );
  }
  return (
    <ExamRunner
      title={t("exam.evolutionTitle")}
      items={items}
      onFinish={(answers) => {
        const result = gradePaper(items, answers);
        const remedial = isPass(result.score, result.max)
          ? []
          : buildRemedialSet(bundle, game.state, result.wrongConcepts, rng);
        game.dispatch({
          type: "EvolutionTestCompleted",
          stage: stageNumber,
          score: result.score,
          max: result.max,
          items: items.map((item) => item.id),
          wrongConcepts: result.wrongConcepts,
          remedialItems: remedial.map((item) => item.id),
        });
        setGrade(result);
      }}
    />
  );
}

function EvolutionPassed({
  before,
  after,
  grade,
  onExit,
}: {
  before: GameState;
  after: GameState;
  grade: ExamGrade;
  onExit(): void;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const { profile } = useGame();
  const next = nextStep(bundle, after);
  const xu = after.wallet.xu - before.wallet.xu;
  const vui = after.pet.vui - before.pet.vui;
  return (
    <main className="evolution-done">
      <div className="evolve">
        <Robot mood="happy" size={200} />
      </div>
      <h1>{t("evolution.title", { name: profile.robotName })}</h1>
      <p>{t("evolution.body", { name: profile.robotName })}</p>
      <p>{t("exam.score", { score: formatScore(grade.score, uiLang), max: grade.max })}</p>
      <ul className="result-rewards">
        {xu > 0 && <li>{t("result.xu", { n: xu })}</li>}
        {vui > 0 && <li>{t("result.vui", { n: vui })}</li>}
      </ul>
      <nav className="room-actions">
        {next && (
          <a className="button primary" href={routeToHash(stepRoute(next))}>
            {t("room.continue")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}

function EvolutionFailed({
  after,
  grade,
  stageId,
  onRetake,
  onExit,
}: {
  after: GameState;
  grade: ExamGrade;
  stageId: string;
  onRetake(): void;
  onExit(): void;
}) {
  const { t, uiLang } = useLang();
  const bundle = useContent();
  const weak = grade.wrongConcepts
    .map((id) => findConcept(bundle, id))
    .filter((concept): concept is Concept => concept !== undefined);
  return (
    <main className="lesson-done">
      <Robot mood="thinking" size={96} />
      <h2>{t("evolution.failTitle")}</h2>
      <p>{t("evolution.failBody")}</p>
      <p>{t("exam.score", { score: formatScore(grade.score, uiLang), max: grade.max })}</p>
      {weak.length > 0 && (
        <section>
          <h3>{t("evolution.weakTitle")}</h3>
          <ul>
            {weak.map((concept) => (
              <li key={concept.id}>{pick(concept.name, uiLang)}</li>
            ))}
          </ul>
        </section>
      )}
      <nav className="room-actions">
        {after.remedial ? (
          <a className="button primary" href={routeToHash({ name: "remedial" })}>
            {t("evolution.startRemedial")}
          </a>
        ) : (
          <a
            className="button primary"
            href={routeToHash({ name: "evolution", stageId })}
            onClick={(event) => {
              event.preventDefault();
              onRetake();
            }}
          >
            {t("evolution.retake")}
          </a>
        )}
        <button onClick={onExit}>{t("nav.room")}</button>
      </nav>
    </main>
  );
}
