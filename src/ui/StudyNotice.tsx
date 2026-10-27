import type { ReactNode } from "react";

/** A short message for a study screen that has nothing to study (not found, not open, nothing to review): 1 card in the middle of the page. */
export function StudyNotice({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <main className="study-notice">
      <div className="card">
        <p>{message}</p>
        {children}
      </div>
    </main>
  );
}
