import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { contentBundle } from "./content/bundle";
import { translate } from "./i18n/translate";
import { createBrowserRunner } from "./runner/browser";
import { acquireTabLock, openGameStore } from "./storage/bootstrap";
import { App } from "./ui/App";
import { isBrowserSupported } from "./ui/browserSupport";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");
const root = createRoot(container);

async function start() {
  const [store, ownsTab] = await Promise.all([openGameStore(), acquireTabLock()]);
  root.render(
    <StrictMode>
      <App bundle={contentBundle} runnerClient={createBrowserRunner()} store={store} ownsTab={ownsTab} />
    </StrictMode>,
  );
}

if (isBrowserSupported()) {
  void start();
} else {
  root.render(<p className="crash">{translate("vi", "browser.unsupported")}</p>);
}
