import { useCallback, useEffect, useState } from "react";
import type { NextStep, PathNode } from "../game/path";

export type Route =
  | { name: "home" }
  | { name: "map" }
  | { name: "backup" }
  | { name: "lesson"; lessonId: string }
  /** stationId null: a free review, for example to charge the robot. */
  | { name: "review"; stationId: string | null }
  | { name: "practice"; conceptId: string }
  | { name: "topicTest"; topicId: string }
  | { name: "evolution"; stageId: string }
  | { name: "remedial" }
  /** Practice a parent gave (spec 9.2). */
  | { name: "assigned"; id: string }
  | { name: "shop" }
  | { name: "achievements" };

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
  if (hash === "#/remedial") return { name: "remedial" };
  if (hash === "#/shop") return { name: "shop" };
  if (hash === "#/achievements") return { name: "achievements" };
  const match = /^#\/(lesson|review|practice|topic-test|evolution|assigned)\/(.+)$/.exec(hash);
  if (!match) return { name: "home" };
  const id = decode(match[2] as string);
  switch (match[1]) {
    case "lesson":
      return { name: "lesson", lessonId: id };
    case "review":
      return { name: "review", stationId: id };
    case "practice":
      return { name: "practice", conceptId: id };
    case "topic-test":
      return { name: "topicTest", topicId: id };
    case "assigned":
      return { name: "assigned", id };
    default:
      return { name: "evolution", stageId: id };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "lesson":
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case "review":
      return route.stationId === null ? "#/review" : `#/review/${encodeURIComponent(route.stationId)}`;
    case "practice":
      return `#/practice/${encodeURIComponent(route.conceptId)}`;
    case "topicTest":
      return `#/topic-test/${encodeURIComponent(route.topicId)}`;
    case "evolution":
      return `#/evolution/${encodeURIComponent(route.stageId)}`;
    case "remedial":
      return "#/remedial";
    case "assigned":
      return `#/assigned/${encodeURIComponent(route.id)}`;
    case "shop":
      return "#/shop";
    case "achievements":
      return "#/achievements";
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
  switch (node.kind) {
    case "lesson":
      return { name: "lesson", lessonId: node.id };
    case "review":
      return { name: "review", stationId: node.id };
    case "topicTest":
      return { name: "topicTest", topicId: node.topicId };
    case "evolution":
      return { name: "evolution", stageId: node.stageId };
  }
}

/** The route that "Học tiếp" opens. */
export function stepRoute(step: NextStep): Route {
  switch (step.kind) {
    case "assigned":
      return { name: "assigned", id: step.id };
    case "remedial":
      return { name: "remedial" };
    case "node":
      return nodeRoute(step.node);
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
