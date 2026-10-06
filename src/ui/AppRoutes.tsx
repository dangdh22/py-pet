import { evolutionTestId, findLesson, findStage, findTopic, topicTestId } from "../content/lookup";
import { findNode, nodeStatuses } from "../game/path";
import { useLang } from "../i18n/LangProvider";
import { BackupScreen } from "./BackupScreen";
import { Banners } from "./Banners";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { EvolutionTestScreen } from "./EvolutionTestScreen";
import { useGame } from "./GameProvider";
import { Header } from "./Header";
import { LessonScreen } from "./LessonScreen";
import { MapScreen } from "./MapScreen";
import { PracticeScreen } from "./PracticeScreen";
import { RemedialScreen } from "./RemedialScreen";
import { ReviewScreen } from "./ReviewScreen";
import { RoomScreen } from "./RoomScreen";
import { routeToHash, useHashRoute } from "./routing";
import { TopicTestScreen } from "./TopicTestScreen";

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();

  const game = useGame();
  const goHome = () => navigate({ name: "home" });
  let screen;
  if (route.name === "map") {
    screen = <MapScreen />;
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
      screen = <EvolutionTestScreen key={stage.id} stage={stage} stageNumber={node.stage} onExit={goHome} />;
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

function Notice({ message }: { message: string }) {
  const { t } = useLang();
  return (
    <main className="room">
      <p>{message}</p>
      <a href="#/map">{t("room.map")}</a>
    </main>
  );
}
