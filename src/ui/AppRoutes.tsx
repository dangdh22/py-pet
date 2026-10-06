import { useState } from "react";
import { findLesson } from "../content/lookup";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { Header } from "./Header";
import { HomeScreen } from "./HomeScreen";
import { LessonScreen } from "./LessonScreen";
import { routeToHash, useHashRoute } from "./routing";

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();
  const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set());

  let screen;
  if (route.name === "lesson") {
    const lesson = findLesson(bundle, route.lessonId);
    screen = lesson ? (
      <LessonScreen
        key={lesson.id}
        lesson={lesson}
        onComplete={(id) => setCompleted((previous) => new Set(previous).add(id))}
        onExit={() => navigate({ name: "home" })}
      />
    ) : (
      <main className="home">
        <p>{t("lesson.notFound")}</p>
        <a href="#/">{t("lesson.backHome")}</a>
      </main>
    );
  } else {
    screen = <HomeScreen completed={completed} />;
  }

  return (
    <>
      <Header />
      <ErrorBoundary key={routeToHash(route)}>{screen}</ErrorBoundary>
    </>
  );
}
