import { useCallback, useEffect, useState } from "react";
import type { PathNode } from "../game/path";

export type Route =
  | { name: "home" }
  | { name: "map" }
  | { name: "backup" }
  | { name: "lesson"; lessonId: string }
  /** stationId null: a free review, for example to charge the robot. */
  | { name: "review"; stationId: string | null }
  | { name: "practice"; conceptId: string };

function decode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function parseHash(hash: string): Route {
  if (hash === "#/map") return { name: "map" };
  if (hash === "#/backup") return { name: "backup" };
  if (hash === "#/review") return { name: "review", stationId: null };
  const match = /^#\/(lesson|review|practice)\/(.+)$/.exec(hash);
  if (!match) return { name: "home" };
  const id = decode(match[2] as string);
  if (match[1] === "lesson") return { name: "lesson", lessonId: id };
  if (match[1] === "review") return { name: "review", stationId: id };
  return { name: "practice", conceptId: id };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "lesson":
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case "review":
      return route.stationId === null ? "#/review" : `#/review/${encodeURIComponent(route.stationId)}`;
    case "practice":
      return `#/practice/${encodeURIComponent(route.conceptId)}`;
    case "map":
      return "#/map";
    case "backup":
      return "#/backup";
    default:
      return "#/";
  }
}

/** The route that opens a node of the map. */
export function nodeRoute(node: PathNode): Route {
  return node.kind === "lesson" ? { name: "lesson", lessonId: node.id } : { name: "review", stationId: node.id };
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
