import { useEffect, useRef, useState, type ComponentProps, type FormEvent } from "react";
import { conceptsNeedingHelp } from "../game/parentStats";
import { useLang } from "../i18n/LangProvider";
import type { MessageKey } from "../i18n/vi";
import { isValidPin } from "../storage/pin";
import { CrashFallback, ErrorBoundary } from "./ErrorBoundary";
import { formatDateTime } from "./format";
import { useGame } from "./GameProvider";
import { Icon } from "./icons";
import { ParentHelp } from "./ParentHelp";
import { ParentOverview } from "./ParentOverview";
import { ParentProgress } from "./ParentProgress";
import { ParentRewards } from "./ParentRewards";
import { ParentSettings } from "./ParentSettings";
import { PARENT_PANEL_ID, PARENT_TABS, ParentNav, parentTabId, type ParentTab } from "./shell/ParentNav";
import { RailLayout } from "./shell/RailLayout";
import { SideNav } from "./shell/SideNav";

/** Spec 9: the parent area locks itself after 5 minutes without use, and when the parent leaves it. */
export const LOCK_AFTER_MS = 5 * 60_000;
const LOCK_CHECK_MS = 10_000;

/** The gate has the side menu of the child's pages; once open, the menu turns into the parent tabs. */
export function ParentScreen() {
  const [open, setOpen] = useState(false);
  const [autoLocked, setAutoLocked] = useState(false);
  if (open) {
    return (
      <ParentArea
        onLock={(auto) => {
          setOpen(false);
          setAutoLocked(auto);
        }}
      />
    );
  }
  return (
    <RailLayout nav={<SideNav current="parent" />}>
      {/* A gate that crashes shows the crash message in the main column and keeps the side menu. */}
      <ErrorBoundary>
        <ParentGate
          autoLocked={autoLocked}
          onOpen={() => {
            setOpen(true);
            setAutoLocked(false);
          }}
        />
      </ErrorBoundary>
    </RailLayout>
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
      <section className="card gate-card">
        <span className="gate-lock">
          <Icon name="lock" />
        </span>
        <h1>{t("parent.title")}</h1>
        {autoLocked && (
          <p role="status" className="gate-note">
            {t("parent.autoLocked")}
          </p>
        )}
        {mode === "pin" ? (
          <form className="pin-form" onSubmit={check}>
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
              className="link-button"
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
          <form className="pin-form" onSubmit={reset}>
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
      </section>
    </main>
  );
}

/** The parent menu with the numbers of the tabs that have something to look at. */
function CountedParentNav(props: Omit<ComponentProps<typeof ParentNav>, "helpCount" | "rewardCount">) {
  const game = useGame();
  const helpCount = conceptsNeedingHelp(game.state).length;
  const rewardCount = game.state.rewards.requests.filter((r) => r.status === "pending").length;
  return <ParentNav {...props} helpCount={helpCount} rewardCount={rewardCount} />;
}

function ParentArea({ onLock }: { onLock(auto: boolean): void }) {
  const { t } = useLang();
  const game = useGame();
  const [tab, setTab] = useState<ParentTab>("overview");
  const lockRef = useRef(onLock);
  useEffect(() => {
    lockRef.current = onLock;
  });

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

  const heading = useRef<HTMLHeadingElement>(null);
  // The PIN form is gone once the area opens: the focus goes to the heading, so a keyboard or screen reader user lands on the area.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  // A button of the overview ("Xem") leaves the page it was on: the focus goes to the heading of the new section once it is drawn.
  const focusHeadingAfterShow = useRef(false);
  useEffect(() => {
    if (!focusHeadingAfterShow.current) return;
    focusHeadingAfterShow.current = false;
    heading.current?.focus();
  }, [tab]);
  const show = (next: ParentTab) => {
    // The same tab again: no effect will run, so the focus goes now and no flag is left behind for a later key press.
    if (next === tab) {
      heading.current?.focus();
      return;
    }
    focusHeadingAfterShow.current = true;
    setTab(next);
  };

  const tabLabel = PARENT_TABS.find((item) => item.id === tab)?.label ?? "parent.title";
  // Leaving the route unmounts the area, and that locks it: the PIN form must not show up for a moment on the way out.
  const leave = () => {
    window.location.hash = "#/";
  };
  const navProps = { tab, onTab: setTab, onLock: leave };
  // The name of the child is the one part of the line that is not translated: it goes in bold between the 2 halves of the text.
  const [profileBefore, profileAfter] = t("parent.profileOf", { name: "{name}" }).split("{name}");

  return (
    <RailLayout
      mode="parent"
      nav={
        // If the numbers cannot be counted, the menu stays and shows no numbers.
        <ErrorBoundary fallback={<ParentNav {...navProps} helpCount={0} rewardCount={0} />}>
          <CountedParentNav {...navProps} />
        </ErrorBoundary>
      }
    >
      <main className="parent">
        <div className="page-head">
          <h1 ref={heading} tabIndex={-1}>
            {t(tabLabel)}
          </h1>
          <p className="page-head-side">
            {profileBefore}
            <b>{game.profile.childName}</b>
            {profileAfter}
          </p>
        </div>
        {game.pinResetAt && (
          <p role="status" className="banner">
            {t("parent.resetAt", { time: formatDateTime(game.pinResetAt) })}
          </p>
        )}
        <div role="tabpanel" id={PARENT_PANEL_ID} aria-labelledby={parentTabId(tab)}>
          {/* A tab that crashes shows the crash message here and keeps the side menu; choosing another tab starts clean. The title of the section stays the h1, so the card is an h2. */}
          <ErrorBoundary key={tab} fallback={<CrashFallback level={2} />}>
            {tab === "overview" && <ParentOverview onShow={show} />}
            {tab === "help" && <ParentHelp />}
            {tab === "progress" && <ParentProgress />}
            {tab === "rewards" && <ParentRewards />}
            {tab === "settings" && <ParentSettings />}
          </ErrorBoundary>
        </div>
      </main>
    </RailLayout>
  );
}
