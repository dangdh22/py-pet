import type { Card } from "../content/types";
import { CodeExample } from "./CodeExample";

export function CardView({ card }: { card: Card }) {
  return (
    <div className="card">
      {card.segments.map((segment, i) => {
        if (segment.kind === "html") {
          return <div key={i} className="card-text" dangerouslySetInnerHTML={{ __html: segment.html }} />;
        }
        if (segment.run) return <CodeExample key={i} code={segment.code} />;
        return (
          <pre key={i} className="code-block">
            <code>{segment.code}</code>
          </pre>
        );
      })}
    </div>
  );
}
