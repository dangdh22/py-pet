import type { ReactNode } from "react";

export type RobotMood = "happy" | "neutral" | "sad" | "thinking" | "sleepy" | "drained" | "vacation";

const EYES: Record<RobotMood, ReactNode> = {
  happy: <path d="M20 21 q3 -5 6 0 M30 21 q3 -5 6 0" stroke="#6ff" strokeWidth="2" fill="none" />,
  neutral: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#6ff" />
      <circle cx="33" cy="20" r="2.5" fill="#6ff" />
    </>
  ),
  sad: <path d="M20 19 q3 4 6 0 M30 19 q3 4 6 0" stroke="#6ff" strokeWidth="2" fill="none" />,
  thinking: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#6ff" />
      <path d="M30 20 h6" stroke="#6ff" strokeWidth="2" />
    </>
  ),
  sleepy: <path d="M20 21 h6 M30 21 h6" stroke="#6ff" strokeWidth="2" />,
  drained: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#4a5578" />
      <circle cx="33" cy="20" r="2.5" fill="#4a5578" />
    </>
  ),
  // Spec 8.3: on vacation the robot wears sunglasses.
  vacation: (
    <>
      <rect x="18" y="17" width="9" height="6" rx="2" fill="#111" />
      <rect x="29" y="17" width="9" height="6" rx="2" fill="#111" />
      <path d="M27 19 h2" stroke="#111" strokeWidth="1.5" />
    </>
  ),
};

export function Robot({ mood = "neutral", size = 56 }: { mood?: RobotMood; size?: number }) {
  return (
    <svg
      role="img"
      aria-label="Robo"
      data-mood={mood}
      width={size}
      height={Math.round((size * 62) / 56)}
      viewBox="0 0 56 62"
    >
      <line x1="28" y1="8" x2="28" y2="1" stroke="#7b8bb3" strokeWidth="2" />
      <circle cx="28" cy="2" r="3" fill="#ff5c7a" />
      <rect x="10" y="8" width="36" height="26" rx="9" fill="#9aa8cc" />
      <rect x="15" y="13" width="26" height="14" rx="5" fill="#1d2440" />
      {EYES[mood]}
      <rect x="14" y="36" width="28" height="18" rx="6" fill="#7b8bb3" />
      <rect x="18" y="54" width="7" height="7" fill="#7b8bb3" />
      <rect x="31" y="54" width="7" height="7" fill="#7b8bb3" />
    </svg>
  );
}
