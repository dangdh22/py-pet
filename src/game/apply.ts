import { addDays, daysBetween, localDay, weekStart } from "./dates";
import { reviewCard } from "./leitner";
import { emptyMastery, MASTERY, recordMisconception, recordResult, solvedScore, type ResultSource } from "./mastery";
import {
  CORRECT_RUN_FOR_VUI,
  FREEZE_EVERY,
  MAX_FREEZES,
  PERSISTENCE_FAILS,
  PIN_REVIEW,
  POINTS,
  RETRY_AFTER_DAYS,
  STREAK_MILESTONES,
  WEEK_EXCEED_RATIO,
  XP,
  XU,
} from "./rewards";
import {
  STAT_MAX,
  WARNING_LIMIT,
  type ConceptMastery,
  type ExerciseStats,
  type GameSettings,
  type GameState,
} from "./state";

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
      /** The exercise's concepts. Default: none. */
      concepts?: string[];
      /** The misconceptions the judge found. Default: none. */
      misconceptions?: string[];
      /** Where the exercise was done. Default: "lesson". */
      source?: ResultSource;
    }
  | {
      type: "QuestionAnswered";
      questionId: string;
      correct: boolean;
      concepts?: string[];
      /** The misconception of the chosen wrong answer. */
      misconception?: string | null;
      source?: ResultSource;
    }
  | { type: "ReviewCompleted"; stationId: string | null; correct: number; total: number }
  | { type: "HintShown"; exerciseId: string }
  | { type: "SolutionViewed"; exerciseId: string };

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
  "ReviewCompleted",
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
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "HintShown":
      statsFor(next, event.exerciseId).hints += 1;
      break;
    case "SolutionViewed":
      statsFor(next, event.exerciseId).viewedSolution = true;
      next.retry[event.exerciseId] = addDays(today, RETRY_AFTER_DAYS);
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

function statsFor(s: GameState, exerciseId: string): ExerciseStats {
  const all = (s.progress.exerciseStats ??= {});
  return (all[exerciseId] ??= { fails: 0, hints: 0, viewedSolution: false });
}

function updateMastery(s: GameState, conceptId: string, change: (m: ConceptMastery) => ConceptMastery): void {
  s.mastery[conceptId] = change(s.mastery[conceptId] ?? emptyMastery());
}

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>): void {
  const source = e.source ?? "lesson";
  for (const id of e.misconceptions ?? []) updateMastery(s, id, recordMisconception);
  if (e.accepted) {
    const score = solvedScore(e.failedSubmitsBefore, e.hintsUsed, e.viewedSolution);
    for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
    if (!e.viewedSolution) delete s.retry[e.exerciseId];
  }
  // A review station pays for the whole station (ReviewCompleted), not per exercise,
  // but its answers still count for the correct run that raises Vui.
  if (source === "review") {
    if (e.accepted && e.failedSubmitsBefore === 0 && e.hintsUsed === 0 && !e.viewedSolution) bumpCorrectRun(s);
    else s.pet.correctRun = 0;
    return;
  }
  const solved = s.progress.solvedExercises.includes(e.exerciseId);
  if (!e.accepted) {
    s.pet.correctRun = 0;
    if (!solved) statsFor(s, e.exerciseId).fails += 1;
    return;
  }
  if (solved) return;
  s.progress.solvedExercises.push(e.exerciseId);
  // The stored stats survive a reload; the event only knows what the current screen saw.
  const stored = s.progress.exerciseStats?.[e.exerciseId];
  const failedSubmitsBefore = Math.max(e.failedSubmitsBefore, stored?.fails ?? 0);
  const hintsUsed = Math.max(e.hintsUsed, stored?.hints ?? 0);
  const viewedSolution = e.viewedSolution || (stored?.viewedSolution ?? false);
  if (viewedSolution) {
    s.pet.xp += XP.codeAfterSolution;
    s.pet.correctRun = 0;
    return;
  }
  if (failedSubmitsBefore === 0) {
    s.pet.xp += XP.codeFirstTry;
    s.wallet.xu += XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) s.wallet.xu += XU.persistenceBonus;
  s.pet.correctRun = 0;
}

function answerQuestion(s: GameState, e: Extract<GameEvent, { type: "QuestionAnswered" }>, today: string): void {
  const source = e.source ?? "lesson";
  const score = e.correct ? MASTERY.score.firstTry : MASTERY.score.wrong;
  for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
  if (!e.correct && e.misconception) updateMastery(s, e.misconception, recordMisconception);
  s.reviews[e.questionId] = reviewCard(s.reviews[e.questionId], e.correct, today);
  if (source === "review") {
    // No XP for a review answer, but it counts for the correct run that raises Vui.
    if (e.correct) bumpCorrectRun(s);
    else s.pet.correctRun = 0;
    return;
  }
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

function completeReview(
  s: GameState,
  e: Extract<GameEvent, { type: "ReviewCompleted" }>,
  today: string,
  rollback: boolean,
): void {
  const total = Math.max(0, e.total);
  const correct = Math.max(0, Math.min(e.correct, total));
  const first = e.stationId !== null && !s.progress.completedReviews.includes(e.stationId);
  if (first) s.progress.completedReviews.push(e.stationId as string);
  s.pet.xp += XP.review + XP.reviewPerCorrect * correct;
  s.pet.pin = Math.min(STAT_MAX, s.pet.pin + PIN_REVIEW);
  // Xu only for the first run of a station on the map, so repeated reviews cannot farm xu.
  if (first) s.wallet.xu += XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0);
  if (!rollback) addPoints(s, POINTS.review, today);
}
