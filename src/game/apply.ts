import { daysBetween, localDay, weekStart } from "./dates";
import {
  CORRECT_RUN_FOR_VUI,
  FREEZE_EVERY,
  MAX_FREEZES,
  PERSISTENCE_FAILS,
  POINTS,
  STREAK_MILESTONES,
  WEEK_EXCEED_RATIO,
  XP,
  XU,
} from "./rewards";
import { STAT_MAX, WARNING_LIMIT, type GameSettings, type GameState } from "./state";

export type GameEvent =
  | { type: "DayRollover" }
  | { type: "SettingsChanged"; patch: Partial<GameSettings> }
  | { type: "LessonCompleted"; lessonId: string }
  | {
      type: "ExerciseJudged";
      exerciseId: string;
      accepted: boolean;
      failedSubmitsBefore: number;
      hintsUsed: number;
      viewedSolution: boolean;
    }
  | { type: "QuestionAnswered"; questionId: string; correct: boolean };

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
]);

export function apply(state: GameState, event: GameEvent, now: Date): GameState {
  const next = JSON.parse(JSON.stringify(state)) as GameState;
  const today = localDay(now);
  const lastActive = next.activity.lastActiveDay;
  const rollback = lastActive !== null && today < lastActive;

  if (rollback) recordRollback(next, now, today);
  else rollover(next, today);

  switch (event.type) {
    case "DayRollover":
      break;
    case "SettingsChanged":
      next.settings = { ...next.settings, ...event.patch };
      break;
    case "LessonCompleted":
      completeLesson(next, event.lessonId, today, rollback);
      break;
    case "ExerciseJudged":
      judgeExercise(next, event);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event);
      break;
  }

  if (ACTIVITY_EVENTS.has(event.type) && !rollback) {
    next.activity.lastActiveDay = today;
    next.activity.decayApplied = 0;
  }
  return next;
}

function recordRollback(s: GameState, now: Date, today: string): void {
  const last = s.warnings[s.warnings.length - 1];
  if (last && localDay(new Date(last.at)) === today) return;
  s.warnings = [...s.warnings, { at: now.toISOString(), kind: "clock-rollback" as const }].slice(-WARNING_LIMIT);
}

function rollover(s: GameState, today: string): void {
  settleWeek(s, today);
  const lastActive = s.activity.lastActiveDay;
  if (lastActive === null) return;
  const absentDays = daysBetween(lastActive, today) - 1;
  const due = Math.max(0, absentDays - s.settings.graceDays);
  const delta = due - s.activity.decayApplied;
  if (delta <= 0) return;
  s.pet.pin = Math.max(0, s.pet.pin - delta);
  s.pet.vui = Math.max(0, s.pet.vui - delta);
  s.activity.decayApplied = due;
}

function settleWeek(s: GameState, today: string): void {
  const current = weekStart(today);
  if (s.week.start >= current) return;
  const target = s.settings.weeklyTarget;
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) s.wallet.xu += XU.weekPlanExceeded;
  else if (target > 0 && s.week.lessonsDone >= target) s.wallet.xu += XU.weekPlanMet;
  s.week = { start: current, lessonsDone: 0 };
}

function completeLesson(s: GameState, lessonId: string, today: string, rollback: boolean): void {
  if (s.progress.completedLessons.includes(lessonId)) return;
  s.progress.completedLessons.push(lessonId);
  s.pet.xp += XP.lesson;
  s.pet.pin = Math.min(STAT_MAX, s.pet.pin + 1);
  if (rollback) return;
  s.week.lessonsDone += 1;
  addPoints(s, POINTS.lesson, today);
}

function addPoints(s: GameState, points: number, today: string): void {
  if (s.streak.pointsDay !== today) {
    s.streak.pointsDay = today;
    s.streak.points = 0;
  }
  const before = s.streak.points;
  s.streak.points += points;
  if (before < s.settings.dailyGoal && s.streak.points >= s.settings.dailyGoal) achieveDay(s, today);
}

function achieveDay(s: GameState, today: string): void {
  const last = s.streak.lastAchievedDay;
  if (last === null) {
    s.streak.current = 1;
  } else {
    const missed = daysBetween(last, today) - 1;
    if (missed <= 0) {
      s.streak.current += 1;
    } else if (s.streak.freezes >= missed) {
      s.streak.freezes -= missed;
      s.streak.current += 1;
    } else {
      s.streak.current = 1;
    }
  }
  s.streak.lastAchievedDay = today;
  s.streak.best = Math.max(s.streak.best, s.streak.current);
  const bonus = STREAK_MILESTONES[s.streak.current];
  if (bonus) s.wallet.xu += bonus;
  if (s.streak.current % FREEZE_EVERY === 0) s.streak.freezes = Math.min(MAX_FREEZES, s.streak.freezes + 1);
}

function bumpCorrectRun(s: GameState): void {
  s.pet.correctRun += 1;
  if (s.pet.correctRun % CORRECT_RUN_FOR_VUI === 0) s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>): void {
  if (!e.accepted) {
    s.pet.correctRun = 0;
    return;
  }
  if (s.progress.solvedExercises.includes(e.exerciseId)) return;
  s.progress.solvedExercises.push(e.exerciseId);
  if (e.viewedSolution) {
    s.pet.xp += XP.codeAfterSolution;
    s.pet.correctRun = 0;
    return;
  }
  if (e.failedSubmitsBefore === 0) {
    s.pet.xp += XP.codeFirstTry;
    s.wallet.xu += XU.codeFirstSubmit + (e.hintsUsed === 0 ? XU.noHintBonus : 0);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (e.failedSubmitsBefore >= PERSISTENCE_FAILS) s.wallet.xu += XU.persistenceBonus;
  s.pet.correctRun = 0;
}

function answerQuestion(s: GameState, e: Extract<GameEvent, { type: "QuestionAnswered" }>): void {
  const first = !s.progress.answeredQuestions.includes(e.questionId);
  if (first) s.progress.answeredQuestions.push(e.questionId);
  if (!e.correct) {
    s.pet.correctRun = 0;
    return;
  }
  if (!first) return;
  s.pet.xp += XP.question;
  bumpCorrectRun(s);
}
