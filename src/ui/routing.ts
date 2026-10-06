import { useCallback, useEffect, useState } from "react";

export type Route = { name: "home" } | { name: "map" } | { name: "backup" } | { name: "lesson"; lessonId: string };

export function parseHash(hash: string): Route {
  if (hash === "#/map") return { name: "map" };
  if (hash === "#/backup") return { name: "backup" };
  const match = /^#\/lesson\/(.+)$/.exec(hash);
  if (!match) return { name: "home" };
  const raw = match[1] as string;
  try {
    return { name: "lesson", lessonId: decodeURIComponent(raw) };
  } catch {
    return { name: "lesson", lessonId: raw };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "lesson":
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case "map":
      return "#/map";
    case "backup":
      return "#/backup";
    default:
      return "#/";
  }
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);
  return [route, navigate];
}
