import type { ReactNode } from "react";

/** The head of a child page: the title (the page's only h1) on the left, what the page shows about the child on the right. */
export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {children && <div className="page-head-side">{children}</div>}
    </div>
  );
}
