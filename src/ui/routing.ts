import { useCallback, useEffect, useState } from "react";

export type Route = { name: "home" } | { name: "lesson"; lessonId: string };

export function parseHash(hash: string): Route {
  const match = /^#\/lesson\/(.+)$/.exec(hash);
  return match ? { name: "lesson", lessonId: decodeURIComponent(match[1] as string) } : { name: "home" };
}

export function routeToHash(route: Route): string {
  return route.name === "lesson" ? `#/lesson/${encodeURIComponent(route.lessonId)}` : "#/";
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
