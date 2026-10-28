import type { ReactNode } from "react";
import { Robot } from "./Robot";

/**
 * The card of every error screen (spec 8): Robo, form 1, drained, then the title and what the child can do. A screen
 * that crashed has lost its own title, so the card is the 1 `h1` of the page; inside a parent section, which keeps its
 * `h1`, the card takes `level` 2.
 */
export function ErrorCard({ title, level = 1, children }: { title: string; level?: 1 | 2; children?: ReactNode }) {
  const Title = level === 1 ? "h1" : "h2";
  return (
    <div className="card error-card">
      <Robot form={1} mood="drained" size={120} />
      <Title>{title}</Title>
      {children}
    </div>
  );
}
