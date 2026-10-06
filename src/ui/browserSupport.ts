interface BrowserEnv {
  WebAssembly?: unknown;
  Worker?: unknown;
}

export function isBrowserSupported(env: BrowserEnv = globalThis as BrowserEnv): boolean {
  return typeof env.WebAssembly === "object" && env.WebAssembly !== null && typeof env.Worker === "function";
}
