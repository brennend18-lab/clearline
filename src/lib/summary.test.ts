import { describe, expect, it } from "vitest";
import { buildSummarySentence } from "./summary";
import { comparePlanToRecorded } from "./calculations";
import { seedEntries, seedPlan } from "./seed";

const NOW = new Date(2026, 8, 15);

/**
 * The summary sentence is shared by the product report and the investor deck,
 * so its exact wording is pinned here. It must state arithmetic only and must
 * never characterize the person.
 */
describe("plan-versus-recorded summary sentence", () => {
  const plan = seedPlan(NOW);
  const entries = seedEntries(NOW);

  it("matches the required demo wording exactly", () => {
    const sentence = buildSummarySentence(comparePlanToRecorded(plan, entries));
    expect(sentence).toBe(
      "You planned to wager no more than $500 over four weeks. " +
        "You recorded $820, which is $320 above your plan. " +
        "You also recorded gambling on 12 days instead of the 8 you selected. " +
        "Your entries may be incomplete.",
    );
  });

  it("says 'under your plan' when recorded activity is below the line", () => {
    const sentence = buildSummarySentence(comparePlanToRecorded(plan, entries.slice(0, 2)));
    expect(sentence).toContain("$400 under your plan");
    expect(sentence).not.toContain("above your plan");
  });

  it("handles landing exactly on the plan without awkward phrasing", () => {
    const c = comparePlanToRecorded(plan, []);
    c.recordedWageredCents = c.plannedWageredCents;
    c.wageredDifferenceCents = 0;
    c.recordedDays = c.plannedDays;
    expect(buildSummarySentence(c)).toContain("exactly at your plan");
    expect(buildSummarySentence(c)).toContain("matching the 8 you selected");
  });

  it("never characterizes the person", () => {
    const sentence = buildSummarySentence(comparePlanToRecorded(plan, entries)).toLowerCase();
    for (const banned of ["you were", "you are", "problem", "control", "too much", "should"]) {
      expect(sentence).not.toContain(banned);
    }
  });

  it("always warns that entries may be incomplete", () => {
    for (const set of [entries, entries.slice(0, 3), []]) {
      expect(buildSummarySentence(comparePlanToRecorded(plan, set))).toContain(
        "Your entries may be incomplete.",
      );
    }
  });
});
