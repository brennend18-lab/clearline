import { describe, expect, it } from "vitest";
import { comparePlanToRecorded, countDistinctDays, weeklySummaries } from "./calculations";
import { seedEntries, seedPlan } from "./seed";

const NOW = new Date(2026, 8, 15); // fixed date for deterministic seeds

describe("plan-versus-recorded calculations", () => {
  const plan = seedPlan(NOW);
  const entries = seedEntries(NOW);

  it("matches the required demo scenario exactly", () => {
    const c = comparePlanToRecorded(plan, entries);
    expect(c.plannedWageredCents).toBe(50_000); // $500 planned
    expect(c.recordedWageredCents).toBe(82_000); // $820 recorded
    expect(c.wageredDifferenceCents).toBe(32_000); // $320 above plan
    expect(c.plannedDays).toBe(8);
    expect(c.recordedDays).toBe(12);
    expect(c.netResultCents).toBe(-31_000); // -$310
  });

  it("counts distinct days, not entries", () => {
    const doubled = [...entries, { ...entries[0], id: "dup" }];
    expect(countDistinctDays(doubled)).toBe(12);
  });

  it("buckets entries into four weeks covering all activity", () => {
    const weeks = weeklySummaries(plan, entries);
    expect(weeks).toHaveLength(4);
    const total = weeks.reduce((a, w) => a + w.wageredCents, 0);
    expect(total).toBe(82_000);
    const days = weeks.reduce((a, w) => a + w.days, 0);
    expect(days).toBe(12);
  });

  it("reports under-plan differences as negative", () => {
    const c = comparePlanToRecorded(plan, entries.slice(0, 2));
    expect(c.recordedWageredCents).toBe(10_000);
    expect(c.wageredDifferenceCents).toBe(-40_000);
  });

  it("handles an empty log without error", () => {
    const c = comparePlanToRecorded(plan, []);
    expect(c.recordedWageredCents).toBe(0);
    expect(c.recordedDays).toBe(0);
    expect(c.netResultCents).toBe(0);
  });
});
