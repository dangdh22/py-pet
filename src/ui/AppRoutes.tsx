import { findLesson } from "../content/lookup";
import { useLang } from "../i18n/LangProvider";
import { Banners } from "./Banners";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { Header } from "./Header";
import { LessonScreen } from "./LessonScreen";
import { RoomScreen } from "./RoomScreen";
import { routeToHash, useHashRoute } from "./routing";

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();

  let screen;
  if (route.name === "lesson") {
    const lesson = findLesson(bundle, route.lessonId);
    screen = lesson ? (
      <LessonScreen
        key={lesson.id}
        lesson={lesson}
        onExit={() => navigate({ name: "home" })}
      />
    ) : (
      <main className="home">
        <p>{t("lesson.notFound")}</p>
        <a href="#/">{t("lesson.backHome")}</a>
      </main>
    );
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
