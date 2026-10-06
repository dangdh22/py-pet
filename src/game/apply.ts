import { addDays, localDay, weekStart } from "./dates";
import { awardBadges, giveBadge } from "./badges";
import { reviewCard } from "./leitner";
import { emptyMastery, MASTERY, recordMisconception, recordResult, solvedScore, type ResultSource } from "./mastery";
import {
  CORRECT_RUN_FOR_VUI,
  FREEZE_EVERY,
  MAX_FREEZES,
  PERSISTENCE_FAILS,
  isPass,
  PIN_REVIEW,
  POINTS,
  RETRY_AFTER_DAYS,
  STREAK_MILESTONES,
  WEEK_EXCEED_RATIO,
  XP,
  XU,
} from "./rewards";
import {
  KEEP_DAYS,
  STAT_MAX,
  WARNING_LIMIT,
  type ConceptMastery,
  type ExerciseStats,
  type GameSettings,
  type GameState,
  type RewardItem,
} from "./state";
import { cleanCatalog, requestBlock, trimRequests } from "./realRewards";
import { findShopItem, isConsumable, MAX_CONSUMABLES, STREAK_GIFTS } from "./shop";
import { cancelVacation, pruneVacations, scheduleVacation, toggleVacation, weekTarget, workDaysBetween } from "./vacation";
import { changeXu } from "./wallet";

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
  | { type: "TopicTestCompleted"; topicId: string; score: number; max: number; items: string[] }
  | {
      type: "EvolutionTestCompleted";
      /** The stage the test was for (1-based). */
      stage: number;
      score: number;
      max: number;
      items: string[];
      wrongConcepts: string[];
      /** The focused review set to open if the test is failed (built by the caller with buildRemedialSet). */
      remedialItems: string[];
    }
  | { type: "RemedialCompleted" }
  | { type: "ItemBought"; itemId: string }
  /** Uses a Pin or Vui item, or puts an accessory on or takes it off. */
  | { type: "ItemUsed"; itemId: string }
  /** The parent's list of real rewards (spec 5.12), replaced as a whole. */
  | { type: "RewardsEdited"; catalog: RewardItem[] }
  /** `requestId` is made by the caller (the UI), so the rule stays pure. */
  | { type: "RewardRequested"; requestId: string; rewardId: string }
  | { type: "RewardApproved"; requestId: string }
  | { type: "RewardRejected"; requestId: string }
  /** Spec 5.7: the parent switches the vacation on now, or off. */
  | { type: "VacationToggled"; on: boolean }
  | { type: "VacationScheduled"; start: string; end: string }
  | { type: "VacationCancelled"; start: string }
  /** Spec 5.13: active study seconds, sent about once a minute. */
  | { type: "ActiveTimeRecorded"; seconds: number }
  /** Spec 9.2: practice a parent gives; `id` is made by the caller. */
  | { type: "PracticeAssigned"; id: string; conceptId: string; items: string[] }
  | { type: "AssignedPracticeDone"; id: string }
  /** Spec 9.2 "Đánh dấu đã kèm con": the parent helped with this concept. */
  | { type: "SupportGiven"; conceptId: string }
  | { type: "HintShown"; exerciseId: string }
  | { type: "SolutionViewed"; exerciseId: string };

const DAY_SECONDS = 86_400;

const ACTIVITY_EVENTS: ReadonlySet<GameEvent["type"]> = new Set([
  "LessonCompleted",
  "ExerciseJudged",
  "QuestionAnswered",
  "ReviewCompleted",
  "TopicTestCompleted",
  "EvolutionTestCompleted",
  "RemedialCompleted",
  "AssignedPracticeDone",
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
      judgeExercise(next, event, today);
      break;
    case "QuestionAnswered":
      answerQuestion(next, event, today);
      break;
    case "ReviewCompleted":
      completeReview(next, event, today, rollback);
      break;
    case "TopicTestCompleted":
      completeTopicTest(next, event, today);
      break;
    case "EvolutionTestCompleted":
      completeEvolutionTest(next, event, now);
      break;
    case "RemedialCompleted":
      next.remedial = null;
      break;
    case "ItemBought":
      buyItem(next, event.itemId, today);
      break;
    case "ItemUsed":
      useItem(next, event.itemId);
      break;
    case "RewardsEdited":
      next.rewards.catalog = cleanCatalog(event.catalog);
      break;
    case "RewardRequested":
      requestReward(next, event, now, today);
      break;
    case "RewardApproved":
      decideReward(next, event.requestId, true, now, today);
      break;
    case "RewardRejected":
      decideReward(next, event.requestId, false, now, today);
      break;
    // Spec 5.14: no vacation change while the clock is set back (it would date the vacation in the past).
    case "VacationToggled":
      if (!rollback) toggleVacation(next, event.on, today);
      break;
    case "VacationScheduled":
      if (!rollback) scheduleVacation(next, event.start, event.end, today);
      break;
    case "VacationCancelled":
      if (!rollback) cancelVacation(next, event.start, today);
      break;
    case "ActiveTimeRecorded":
      recordTime(next, event.seconds, today);
      break;
    case "PracticeAssigned":
      if (event.items.length > 0 && !next.assigned.some((a) => a.id === event.id)) {
        next.assigned.push({ id: event.id, conceptId: event.conceptId, items: event.items, day: today });
      }
      break;
    case "AssignedPracticeDone":
      next.assigned = next.assigned.filter((a) => a.id !== event.id);
      break;
    case "SupportGiven":
      giveSupport(next, event.conceptId, today);
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
  if (!rollback) awardBadges(next, today);
  return next;
}

function recordRollback(s: GameState, now: Date, today: string): void {
  const last = s.warnings[s.warnings.length - 1];
  if (last && localDay(new Date(last.at)) === today) return;
  s.warnings = [...s.warnings, { at: now.toISOString(), kind: "clock-rollback" as const }].slice(-WARNING_LIMIT);
}

function rollover(s: GameState, today: string): void {
  settleWeek(s, today);
  pruneVacations(s, today);
  const lastActive = s.activity.lastActiveDay;
  if (lastActive === null) return;
  // Spec 5.6-5.7: vacation days are not absent days.
  const absentDays = workDaysBetween(s, lastActive, today);
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
  // Spec 5.7: vacation days do not count in the week plan.
  const target = weekTarget(s, s.week.start);
  if (target > 0 && s.week.lessonsDone >= target * WEEK_EXCEED_RATIO) changeXu(s, XU.weekPlanExceeded, "week", s.week.start, today);
  else if (target > 0 && s.week.lessonsDone >= target) changeXu(s, XU.weekPlanMet, "week", s.week.start, today);
  if (target > 0 && s.week.lessonsDone >= target) giveBadge(s, "week-plan", today);
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
    const missed = workDaysBetween(s, last, today);
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
  if (bonus) changeXu(s, bonus, "streak", String(s.streak.current), today);
  const gift = STREAK_GIFTS[s.streak.current];
  if (gift && !s.inventory.owned.includes(gift)) s.inventory.owned.push(gift);
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

function judgeExercise(s: GameState, e: Extract<GameEvent, { type: "ExerciseJudged" }>, today: string): void {
  const source = e.source ?? "lesson";
  for (const id of e.misconceptions ?? []) updateMastery(s, id, recordMisconception);
  if (e.accepted) {
    const score = solvedScore(e.failedSubmitsBefore, e.hintsUsed, e.viewedSolution);
    for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
    if (!e.viewedSolution) delete s.retry[e.exerciseId];
  }
  // A review station or a test pays as a whole (ReviewCompleted, TopicTestCompleted, EvolutionTestCompleted), not per
  // exercise, but its answers still count for the correct run that raises Vui.
  if (source === "review" || source === "test") {
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
    changeXu(s, XU.codeFirstSubmit + (hintsUsed === 0 ? XU.noHintBonus : 0), "code", e.exerciseId, today);
    bumpCorrectRun(s);
    return;
  }
  s.pet.xp += XP.codeAfterRetries;
  if (failedSubmitsBefore >= PERSISTENCE_FAILS) changeXu(s, XU.persistenceBonus, "code", e.exerciseId, today);
  s.pet.correctRun = 0;
}

function answerQuestion(s: GameState, e: Extract<GameEvent, { type: "QuestionAnswered" }>, today: string): void {
  const source = e.source ?? "lesson";
  const score = e.correct ? MASTERY.score.firstTry : MASTERY.score.wrong;
  for (const id of e.concepts ?? []) updateMastery(s, id, (m) => recordResult(m, score, source));
  if (!e.correct && e.misconception) updateMastery(s, e.misconception, recordMisconception);
  s.reviews[e.questionId] = reviewCard(s.reviews[e.questionId], e.correct, today);
  if (source === "review" || source === "test") {
    // No XP for a review or test answer, but it counts for the correct run that raises Vui.
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
  if (first) changeXu(s, XU.review + (total > 0 && correct === total ? XU.reviewPerfect : 0), "review", e.stationId, today);
  if (total > 0 && correct === total) giveBadge(s, "perfect-review", today);
  if (!rollback) addPoints(s, POINTS.review, today);
}

function raiseVui(s: GameState): void {
  s.pet.vui = Math.min(STAT_MAX, s.pet.vui + 1);
}

/** Spec 5.4-5.6: the first completion pays 30 XP; the first pass pays 20 xu and Vui +1. Any score moves the path on. */
function completeTopicTest(s: GameState, e: Extract<GameEvent, { type: "TopicTestCompleted" }>, today: string): void {
  const previous = s.progress.topicTests[e.topicId];
  const passed = isPass(e.score, e.max);
  s.progress.topicTests[e.topicId] = {
    attempts: (previous?.attempts ?? 0) + 1,
    best: Math.max(previous?.best ?? 0, e.score),
    max: e.max,
    passed: passed || (previous?.passed ?? false),
    lastItems: e.items,
  };
  if (!previous) s.pet.xp += XP.topicTest;
  if (passed && !previous?.passed) {
    changeXu(s, XU.topicTestPassed, "topicTest", e.topicId, today);
    raiseVui(s);
  }
}

/**
 * Spec 5.11. Passed: the robot evolves to the next stage, +100 xu, Vui +1; the growth bar starts again. Failed: nothing
 * is taken away, and the focused review set opens; the retake waits for it.
 */
function completeEvolutionTest(
  s: GameState,
  e: Extract<GameEvent, { type: "EvolutionTestCompleted" }>,
  now: Date,
): void {
  const passed = isPass(e.score, e.max);
  s.progress.evolutionTests.push({
    at: now.toISOString(),
    stage: e.stage,
    score: e.score,
    max: e.max,
    passed,
    items: e.items,
    wrongConcepts: e.wrongConcepts,
  });
  if (!passed) {
    // A test of a stage the robot already passed (a retake from the map) must not open a review set.
    if (e.stage !== s.pet.stage) return;
    s.remedial = e.remedialItems.length > 0 ? { stage: e.stage, items: e.remedialItems } : null;
    return;
  }
  s.remedial = null;
  // A second pass of the same stage changes nothing more.
  if (s.pet.stage !== e.stage) return;
  s.pet.stage += 1;
  s.pet.stageStartXp = s.pet.xp;
  changeXu(s, XU.evolution, "evolution", String(e.stage), localDay(now));
  raiseVui(s);
}

/** Spec 5.12. A purchase needs enough xu; an accessory or a decoration is bought once, a Pin or Vui item up to 9. */
function buyItem(s: GameState, itemId: string, today: string): void {
  const item = findShopItem(itemId);
  if (!item || item.price === null || s.wallet.xu < item.price) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    if (have >= MAX_CONSUMABLES) return;
    s.inventory.consumables[itemId] = have + 1;
  } else {
    if (s.inventory.owned.includes(itemId)) return;
    s.inventory.owned.push(itemId);
  }
  changeXu(s, -item.price, "shop", itemId, today);
}

/** A Pin or Vui item is used only when it can raise its stat; an accessory is worn alone in its slot. */
function useItem(s: GameState, itemId: string): void {
  const item = findShopItem(itemId);
  if (!item) return;
  if (isConsumable(item)) {
    const have = s.inventory.consumables[itemId] ?? 0;
    const stat = item.kind === "pin" ? "pin" : "vui";
    if (have === 0 || s.pet[stat] >= STAT_MAX) return;
    s.pet[stat] = Math.min(STAT_MAX, s.pet[stat] + (item.effect ?? 0));
    if (have === 1) delete s.inventory.consumables[itemId];
    else s.inventory.consumables[itemId] = have - 1;
    return;
  }
  if (item.kind !== "accessory" || !s.inventory.owned.includes(itemId)) return;
  if (s.inventory.equipped.includes(itemId)) {
    s.inventory.equipped = s.inventory.equipped.filter((id) => id !== itemId);
    return;
  }
  s.inventory.equipped = [
    ...s.inventory.equipped.filter((id) => findShopItem(id)?.slot !== item.slot),
    itemId,
  ];
}

/** Spec 5.12: asking creates a request waiting for the parent; no xu is taken yet. */
function requestReward(
  s: GameState,
  e: Extract<GameEvent, { type: "RewardRequested" }>,
  now: Date,
  today: string,
): void {
  const reward = s.rewards.catalog.find((item) => item.id === e.rewardId);
  if (!reward || s.rewards.requests.some((r) => r.id === e.requestId) || requestBlock(s, reward, today) !== null) return;
  s.rewards.requests.push({
    id: e.requestId,
    rewardId: reward.id,
    name: reward.name,
    price: reward.price,
    at: now.toISOString(),
    status: "pending",
    decidedAt: null,
  });
}

/** Spec 5.12: xu are taken only when the parent approves (with the PIN), and only if the child still has them. */
function decideReward(s: GameState, requestId: string, approve: boolean, now: Date, today: string): void {
  const request = s.rewards.requests.find((r) => r.id === requestId);
  if (!request || request.status !== "pending") return;
  if (approve) {
    if (s.wallet.xu < request.price) return;
    changeXu(s, -request.price, "reward", request.rewardId, today);
  }
  request.status = approve ? "approved" : "rejected";
  request.decidedAt = now.toISOString();
  s.rewards.requests = trimRequests(s.rewards.requests);
}

/** Spec 5.13: seconds per day, at most a whole day, the last KEEP_DAYS days. */
function recordTime(s: GameState, seconds: number, today: string): void {
  if (!(seconds > 0)) return;
  const total = (s.activity.seconds[today] ?? 0) + Math.round(seconds);
  const oldest = addDays(today, -KEEP_DAYS);
  s.activity.seconds = Object.fromEntries(
    Object.entries({ ...s.activity.seconds, [today]: Math.min(DAY_SECONDS, total) }).filter(([day]) => day >= oldest),
  );
}

/** The parent helped: the flag and its counters start again, as when the score passes 70 (spec 5.9). */
function giveSupport(s: GameState, conceptId: string, today: string): void {
  updateMastery(s, conceptId, (m) => ({
    ...m,
    needsHelp: false,
    misconceptions: 0,
    recent: [],
    reviewMisses: 0,
    coachedAt: today,
  }));
}
