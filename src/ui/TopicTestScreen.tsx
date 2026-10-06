import { useState } from "react";
import type { Topic } from "../content/types";
import { drawTopicTest, gradePaper, type ExamGrade } from "../game/exam";
import type { Rng } from "../game/random";
import { isPass } from "../game/rewards";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { ExamRunner, formatScore } from "./ExamRunner";
import { useGame } from "./GameProvider";
import { ResultView } from "./ResultView";

/** The test at the end of a topic (spec 5.3): any score moves the path on; the weak concepts get practice links. */
export function TopicTestScreen({ topic, onExit, rng = Math.random }: { topic: Topic; onExit(): void; rng?: Rng }) {
  const { t, uiLang } = useLang();
  const game = useGame();
  const [before] = useState(() => game.state);
  const [items] = useState(() => drawTopicTest(topic, game.state.progress.topicTests[topic.id]?.lastItems ?? [], rng));
  const [grade, setGrade] = useState<ExamGrade | null>(null);

  if (grade) {
    const percent = game.state.settings.passPercent;
    const verdict = isPass(grade.score, grade.max, percent) ? t("exam.passed") : t("exam.notPassed", { percent });
    return (
      <ResultView
        before={before}
        after={game.state}
        title={t("exam.topicDone")}
        message={`${t("exam.score", { score: formatScore(grade.score, uiLang), max: grade.max })} ${verdict}`}
        practiceConcepts={grade.wrongConcepts}
        onExit={onExit}
      />
    );
  }
  return (
    <ExamRunner
      title={t("exam.topicTitle", { topic: pick(topic.title, uiLang) })}
      items={items}
      onFinish={(answers) => {
        const result = gradePaper(items, answers);
        game.dispatch({
          type: "TopicTestCompleted",
          topicId: topic.id,
          score: result.score,
          max: result.max,
          items: items.map((item) => item.id),
        });
        setGrade(result);
      }}
    />
  );
}
