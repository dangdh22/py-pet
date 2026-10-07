import type { CSSProperties, ReactNode } from "react";

export type StatTone = "pin" | "vui" | "growth";

/** Small pictures beside the stat names: a battery, a heart, a sprout. */
const ICONS: Record<StatTone, ReactNode> = {
  pin: (
    <>
      <rect x={2} y={5} width={14} height={9} rx={2} fill="none" stroke="currentColor" strokeWidth={1.8} />
      <rect x={16.5} y={7.5} width={2} height={4} rx={0.6} fill="currentColor" />
      <rect x={4.5} y={7.5} width={6} height={4} rx={0.6} fill="currentColor" />
    </>
  ),
  vui: (
    <path
      d="M10 16.5 C4 12.5 2 9.5 2 7 C2 4.6 3.9 3 6 3 C7.6 3 9 3.9 10 5.3 C11 3.9 12.4 3 14 3 C16.1 3 18 4.6 18 7 C18 9.5 16 12.5 10 16.5 Z"
      fill="currentColor"
    />
  ),
  growth: (
    <>
      <path d="M10 18 V9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M10 10 C10 6 7 4 3 4 C3 8 6 10 10 10 Z" fill="currentColor" />
      <path d="M10 8.5 C10 4.5 13 2 17 2 C17 6 14 8.5 10 8.5 Z" fill="currentColor" />
    </>
  ),
};

/** The picture of a stat: beside its bar, and beside the shop items that raise it. */
export function StatIcon({ tone, size = 20, className = "stat-icon" }: { tone: StatTone; size?: number; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 20 20">
      {ICONS[tone]}
    </svg>
  );
}

/**
 * Spec 8.2.1: a bar for Pin, Vui or Lớn lên. The text stays inside ("Pin: 3/5", "Lớn lên: 79%"); the growth is a
 * percentage, so its max is 100. Pin and Vui are cut into one segment per point.
 */
export function StatBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: StatTone }) {
  const percent = tone === "growth";
  const shown = percent ? `${value}%` : `${value}/${max}`;
  const fill = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const low = !percent && max > 0 && value <= max / 5;
  return (
    <div
      className={`stat-bar stat-${tone}${low ? " stat-low" : ""}`}
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={shown}
    >
      <span className="stat-head">
        <StatIcon tone={tone} />
        <span className="stat-text">
          {label}: {shown}
        </span>
      </span>
      <span
        className={percent ? "stat-track" : "stat-track stat-segmented"}
        style={percent ? undefined : ({ "--segments": Math.max(1, max) } as CSSProperties)}
      >
        <span className="stat-fill" style={{ width: `${Math.round(fill * 10) / 10}%` }} />
      </span>
    </div>
  );
}
