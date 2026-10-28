import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// jsdom has no layout: its `window.scrollTo` only prints "Not implemented". A test that looks at the scroll spies on this stub.
if (typeof window !== "undefined") window.scrollTo = () => {};

afterEach(async () => {
  if (typeof document === "undefined") return;
  const { cleanup } = await import("@testing-library/react");
  cleanup();
});
