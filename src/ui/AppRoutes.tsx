import { useState } from "react";
import { evolutionTestId, findLesson, findStage, findTopic, topicTestId } from "../content/lookup";
import type { Stage } from "../content/types";
import { findNode, nodeStatuses } from "../game/path";
import { useLang } from "../i18n/LangProvider";
import { AchievementsScreen } from "./AchievementsScreen";
import { AssignedPracticeScreen } from "./AssignedPracticeScreen";
import { BackupScreen } from "./BackupScreen";
import { Banners } from "./Banners";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { EvolutionTestScreen } from "./EvolutionTestScreen";
import { useGame } from "./GameProvider";
import { Header } from "./Header";
import { LessonScreen } from "./LessonScreen";
import { MapScreen } from "./MapScreen";
import { ParentScreen } from "./ParentScreen";
import { PracticeScreen } from "./PracticeScreen";
import { RemedialScreen } from "./RemedialScreen";
import { ReviewScreen } from "./ReviewScreen";
import { RoomScreen } from "./RoomScreen";
import { routeToHash, useHashRoute, type Route } from "./routing";
import { ShopScreen } from "./ShopScreen";
import { TopicTestScreen } from "./TopicTestScreen";
import { useStudyTimer } from "./useStudyTimer";

/** The screens whose time counts as study time (spec 5.13). */
const STUDY_ROUTES: ReadonlySet<Route["name"]> = new Set([
  "lesson",
  "review",
  "practice",
  "topicTest",
  "evolution",
  "remedial",
  "assigned",
]);

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();

  const game = useGame();
  useStudyTimer(STUDY_ROUTES.has(route.name));
  const goHome = () => navigate({ name: "home" });
  let screen;
  if (route.name === "map") {
    screen = <MapScreen />;
  } else if (route.name === "shop") {
    screen = <ShopScreen />;
  } else if (route.name === "achievements") {
    screen = <AchievementsScreen />;
  } else if (route.name === "parent") {
    screen = <ParentScreen />;
  } else if (route.name === "assigned") {
    screen = <AssignedPracticeScreen key={route.id} id={route.id} onExit={goHome} />;
  } else if (route.name === "backup") {
    screen = <BackupScreen />;
  } else if (route.name === "lesson") {
    const lesson = findLesson(bundle, route.lessonId);
    if (!lesson) {
      screen = <Notice message={t("lesson.notFound")} />;
    } else if (nodeStatuses(bundle, game.state).get(lesson.id) === "locked") {
      screen = <Notice message={t("lesson.locked")} />;
    } else {
      screen = <LessonScreen key={lesson.id} lesson={lesson} onExit={goHome} />;
    }
  } else if (route.name === "review") {
    const node = route.stationId === null ? null : findNode(bundle, route.stationId);
    if (node === undefined || (node !== null && node.kind !== "review")) {
      screen = <Notice message={t("review.notFound")} />;
    } else if (node !== null && nodeStatuses(bundle, game.state).get(node.id) === "locked") {
      screen = <Notice message={t("review.locked")} />;
    } else {
      screen = <ReviewScreen key={route.stationId ?? "free"} stationId={route.stationId} onExit={goHome} />;
    }
  } else if (route.name === "practice") {
    screen = <PracticeScreen key={route.conceptId} conceptId={route.conceptId} onExit={goHome} />;
  } else if (route.name === "topicTest") {
    const topic = findTopic(bundle, route.topicId);
    const node = topic && findNode(bundle, topicTestId(topic));
    if (!topic || node?.kind !== "topicTest") {
      screen = <Notice message={t("exam.notFound")} />;
    } else if (nodeStatuses(bundle, game.state).get(node.id) === "locked") {
      screen = <Notice message={t("exam.locked")} />;
    } else {
      screen = <TopicTestScreen key={topic.id} topic={topic} onExit={goHome} />;
    }
  } else if (route.name === "evolution") {
    const stage = findStage(bundle, route.stageId);
    const node = stage && findNode(bundle, evolutionTestId(stage));
    if (!stage || node?.kind !== "evolution") {
      screen = <Notice message={t("exam.notFound")} />;
    } else if (nodeStatuses(bundle, game.state).get(node.id) === "locked") {
      screen = <Notice message={t("exam.locked")} />;
    } else {
      screen = <EvolutionRoute key={stage.id} stage={stage} stageNumber={node.stage} onExit={goHome} />;
    }
  } else if (route.name === "remedial") {
    screen = <RemedialScreen onExit={goHome} />;
  } else {
    screen = <RoomScreen />;
  }

  return (
    <>
      <Header />
      <Banners />
      <ErrorBoundary key={routeToHash(route)}>{screen}</ErrorBoundary>
    </>
  );
}

/**
 * A passed evolution test is not offered again. Checked once on opening: passing the test marks its node done, and
 * the result screen must stay.
 */
function EvolutionRoute({ stage, stageNumber, onExit }: { stage: Stage; stageNumber: number; onExit(): void }) {
  const { t } = useLang();
  const game = useGame();
  const [alreadyDone] = useState(() => game.state.pet.stage > stageNumber);
  if (alreadyDone) return <Notice message={t("evolution.alreadyDone", { name: game.profile.robotName })} />;
  return <EvolutionTestScreen stage={stage} stageNumber={stageNumber} onExit={onExit} />;
}

function Notice({ message }: { message: string }) {
  const { t } = useLang();
  return (
    <main className="room">
      <p>{message}</p>
      <a href="#/map">{t("room.map")}</a>
    </main>
  );
}
