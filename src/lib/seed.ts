import type { ActivityEntry, PersonalPlan } from "./types";

/**
 * Deterministic seed data for the example month, matching the demo scenario:
 * planned max wagered $500 over four weeks, recorded $820 (=$320 above plan),
 * planned 8 gambling days, recorded 12, example net result -$310.
 */

function isoDaysAgo(daysAgo: number, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function seedPlan(now = new Date()): PersonalPlan {
  return {
    createdAt: now.toISOString(),
    startDate: isoDaysAgo(27, now),
    goal: "understand",
    maxWageredCents: 50_000, // $500
    maxNetLossCents: 25_000, // $250
    maxGamblingDays: 8,
    maxTimeMinutes: 600, // 10 hours
    prohibitedFundingSources: ["Credit cards"],
    dataChoices: {
      manualLogging: true,
      simulatedImport: false,
      localReminders: false,
      aggregateResearch: false,
    },
    adultConfirmed: true,
    pauseUntil: null,
  };
}

/** [daysAgo, platform, wagered$, net$, minutes, note?] */
const SEED_ROWS: Array<[number, string, number, number, number, string?]> = [
  [26, "Sportsbook app", 40, -40, 55, "Sunday games"],
  [24, "Sportsbook app", 60, 25, 80],
  [22, "Daily fantasy", 50, -50, 70],
  [19, "Sportsbook app", 80, -35, 95, "Added a same-day parlay"],
  [17, "Online poker", 45, -45, 60],
  [15, "Sportsbook app", 100, 60, 110, "Big favorite hit"],
  [12, "Daily fantasy", 55, -55, 75],
  [10, "Sportsbook app", 70, -30, 90],
  [8, "Online poker", 60, -60, 70, "Late night session"],
  [5, "Sportsbook app", 90, -45, 105],
  [3, "Sportsbook app", 85, 20, 95],
  [1, "Daily fantasy", 85, -55, 65, "Wanted to end the month even"],
];

export function seedEntries(now = new Date()): ActivityEntry[] {
  return SEED_ROWS.map(([daysAgo, platform, wagered, net, minutes, note], i) => ({
    id: `seed-${i + 1}`,
    date: isoDaysAgo(daysAgo, now),
    platform,
    amountWageredCents: wagered * 100,
    netResultCents: net * 100,
    timeSpentMinutes: minutes,
    ...(note ? { note } : {}),
  }));
}
