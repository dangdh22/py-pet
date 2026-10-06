import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { isValidPin } from "../storage/pin";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";
import { ParentHelp } from "./ParentHelp";
import { ParentOverview } from "./ParentOverview";

/** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
export const LOCK_AFTER_MS = 5 * 60_000;
const LOCK_CHECK_MS = 10_000;

type Tab = "overview" | "help";

const TABS: { id: Tab; label: MessageKey }[] = [
  { id: "overview", label: "parent.tabOverview" },
  { id: "help", label: "parent.tabHelp" },
];

export function ParentScreen() {
  const [open, setOpen] = useState(false);
  const [autoLocked, setAutoLocked] = useState(false);
  if (!open) {
    return (
      <ParentGate
        autoLocked={autoLocked}
        onOpen={() => {
          setOpen(true);
          setAutoLocked(false);
        }}
      />
    );
  }
  return (
    <ParentArea
      onLock={(auto) => {
        setOpen(false);
        setAutoLocked(auto);
      }}
    />
  );
}

function ParentGate({ autoLocked, onOpen }: { autoLocked: boolean; onOpen(): void }) {
  const { t } = useLang();
  const game = useGame();
  const [mode, setMode] = useState<"pin" | "reset">("pin");
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function check(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const ok = await game.checkPin(pin);
      if (ok) onOpen();
      else setError("backup.pinWrong");
    } catch {
      setError("banner.writeFailed");
    } finally {
      setBusy(false);
    }
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (!isValidPin(pin)) return setError("onboarding.errorPin");
    if (pin !== again) return setError("onboarding.errorPinMatch");
    setBusy(true);
    try {
      await game.setPin(pin, true);
      onOpen();
    } catch {
      setError("banner.writeFailed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="parent-gate">
      <h1>{t("parent.title")}</h1>
      {autoLocked && <p>{t("parent.autoLocked")}</p>}
      {mode === "pin" ? (
        <form onSubmit={check}>
          <p>{t("parent.pinPrompt")}</p>
          <label>
            {t("backup.pinLabel")}
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </label>
          <button className="primary" type="submit" disabled={busy || pin === ""}>
            {t("parent.open")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setPin("");
              setError(null);
            }}
          >
            {t("parent.forgot")}
          </button>
        </form>
      ) : (
        <form onSubmit={reset}>
          <h2>{t("parent.resetTitle")}</h2>
          <p>{t("parent.resetNote")}</p>
          <label>
            {t("parent.newPin")}
            <input type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </label>
          <label>
            {t("parent.newPinAgain")}
            <input type="password" inputMode="numeric" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
          </label>
          <button className="primary" type="submit" disabled={busy}>
            {t("parent.resetSave")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("pin");
              setPin("");
              setAgain("");
              setError(null);
            }}
          >
            {t("backup.cancel")}
          </button>
        </form>
      )}
      {error && <p role="alert">{t(error)}</p>}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}

function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
  const { t } = useLang();
  const game = useGame();
  const [tab, setTab] = useState<Tab>("overview");
  const lockRef = useRef(onLock);
  lockRef.current = onLock;

  useEffect(() => {
    let last = Date.now();
    const onInput = () => {
      last = Date.now();
    };
    const events = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
    for (const name of events) window.addEventListener(name, onInput, { passive: true });
    const timer = setInterval(() => {
      if (Date.now() - last >= LOCK_AFTER_MS) lockRef.current(true);
    }, LOCK_CHECK_MS);
    return () => {
      clearInterval(timer);
      for (const name of events) window.removeEventListener(name, onInput);
    };
  }, []);

  return (
    <main className="parent">
      <div className="parent-top">
        <h1>{t("parent.title")}</h1>
        <button onClick={() => onLock(false)}>{t("parent.lock")}</button>
      </div>
      {game.pinResetAt && (
        <p role="status" className="banner">
          {t("parent.resetAt", { time: formatDateTime(game.pinResetAt) })}
        </p>
      )}
      <div role="tablist" className="tabs">
        {TABS.map((item) => (
          <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>
            {t(item.label)}
          </button>
        ))}
      </div>
      {tab === "overview" && <ParentOverview />}
      {tab === "help" && <ParentHelp />}
      <a href="#/">{t("nav.room")}</a>
    </main>
  );
}
