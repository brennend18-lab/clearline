import type { ActivityEntry, PersonalPlan } from "./types";

/**
 * Transparent, deterministic comparison of what the user planned with what
 * the user recorded. Simple arithmetic only: no scoring, no inference.
 */

export interface WeekSummary {
  weekIndex: number; // 0..3
  label: string; // "Week 1"
  wageredCents: number;
  netResultCents: number;
  days: number;
  minutes: number;
}

export interface PlanComparison {
  plannedWageredCents: number;
  recordedWageredCents: number;
  /** recorded - planned; positive means above plan. */
  wageredDifferenceCents: number;
  plannedDays: number;
  recordedDays: number;
  daysDifference: number;
  plannedMinutes: number;
  recordedMinutes: number;
  minutesDifference: number;
  netResultCents: number;
  weeks: WeekSummary[];
}

/** Count of distinct calendar dates with at least one entry. */
export function countDistinctDays(entries: ActivityEntry[]): number {
  return new Set(entries.map((e) => e.date)).size;
}

export function sumWagered(entries: ActivityEntry[]): number {
  return entries.reduce((acc, e) => acc + e.amountWageredCents, 0);
}

export function sumNetResult(entries: ActivityEntry[]): number {
  return entries.reduce((acc, e) => acc + e.netResultCents, 0);
}

export function sumMinutes(entries: ActivityEntry[]): number {
  return entries.reduce((acc, e) => acc + e.timeSpentMinutes, 0);
}

function dayDiff(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.floor((to - from) / 86_400_000);
}

/** Bucket entries into four weeks starting at plan.startDate. Entries outside the window are clamped to the nearest week. */
export function weeklySummaries(plan: PersonalPlan, entries: ActivityEntry[]): WeekSummary[] {
  const weeks: WeekSummary[] = [0, 1, 2, 3].map((i) => ({
    weekIndex: i,
    label: `Week ${i + 1}`,
    wageredCents: 0,
    netResultCents: 0,
    days: 0,
    minutes: 0,
  }));
  const dayBuckets: Array<Set<string>> = [new Set(), new Set(), new Set(), new Set()];
  for (const e of entries) {
    const offset = dayDiff(plan.startDate, e.date);
    const idx = Math.min(3, Math.max(0, Math.floor(offset / 7)));
    weeks[idx].wageredCents += e.amountWageredCents;
    weeks[idx].netResultCents += e.netResultCents;
    weeks[idx].minutes += e.timeSpentMinutes;
    dayBuckets[idx].add(e.date);
  }
  for (let i = 0; i < 4; i++) weeks[i].days = dayBuckets[i].size;
  return weeks;
}

export function comparePlanToRecorded(
  plan: PersonalPlan,
  entries: ActivityEntry[],
): PlanComparison {
  const recordedWageredCents = sumWagered(entries);
  const recordedDays = countDistinctDays(entries);
  const recordedMinutes = sumMinutes(entries);
  return {
    plannedWageredCents: plan.maxWageredCents,
    recordedWageredCents,
    wageredDifferenceCents: recordedWageredCents - plan.maxWageredCents,
    plannedDays: plan.maxGamblingDays,
    recordedDays,
    daysDifference: recordedDays - plan.maxGamblingDays,
    plannedMinutes: plan.maxTimeMinutes,
    recordedMinutes,
    minutesDifference: recordedMinutes - plan.maxTimeMinutes,
    netResultCents: sumNetResult(entries),
    weeks: weeklySummaries(plan, entries),
  };
}
