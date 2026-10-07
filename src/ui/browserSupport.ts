import type { Lang } from "../i18n/lang";

interface BrowserEnv {
  WebAssembly?: unknown;
  Worker?: unknown;
  indexedDB?: unknown;
}

/** Design decision 4: Pyodide needs WebAssembly and a Worker; the game store needs indexedDB. */
export function isBrowserSupported(env: BrowserEnv = globalThis as BrowserEnv): boolean {
  return (
    typeof env.WebAssembly === "object" &&
    env.WebAssembly !== null &&
    typeof env.Worker === "function" &&
    hasIndexedDb(env)
  );
}

/** Some browsers throw when `indexedDB` is read (blocked storage). The app still loads: the store falls back to memory. */
function hasIndexedDb(env: BrowserEnv): boolean {
  try {
    return typeof env.indexedDB === "object" && env.indexedDB !== null;
  } catch {
    return true;
  }
}

/** Before the LangProvider exists: Vietnamese unless the browser says another language. */
export function browserLang(nav: { language?: string } = navigator): Lang {
  if (nav.language === undefined) return "vi";
  return nav.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}
