import { describe, it, expect, beforeEach } from "vitest";
import {
  blankData,
  parseMemberData,
  readMemberData,
  writeMemberData,
  moneyToCents,
  validDate,
} from "./model";
import { comparePlanToRecorded, weeklySummaries } from "../lib/calculations";
import { seedPlan } from "../lib/seed";
const entry = {
  id: "a",
  date: "2026-09-01",
  platform: "Example",
  amountWageredCents: 10000,
  netResultCents: -500,
  timeSpentMinutes: 20,
};
beforeEach(() => localStorage.clear());
describe("member records", () => {
  it("isolates demo and different signed-in accounts", () => {
    localStorage.setItem("clearline-demo-v1", "sample");
    writeMemberData("one", { ...blankData(), entries: [entry] });
    expect(readMemberData("two").entries).toHaveLength(0);
    expect(readMemberData("one").entries).toHaveLength(1);
  });
  it("round trips backup without credentials or server calls", () => {
    const original = {
      ...blankData(),
      entries: [entry],
      reflections: [
        {
          id: "r",
          date: "2026-09-01",
          feeling: "unsure" as const,
          text: "A personal note",
        },
      ],
    };
    expect(parseMemberData(JSON.stringify(original))).toEqual(original);
  });
  it("rejects malformed imports and impossible dates", () => {
    for (const date of ["2026-02-30", "not-a-date", "2026-13-01"]) {
      expect(validDate(date)).toBe(false);
      expect(() =>
        parseMemberData(
          JSON.stringify({ ...blankData(), entries: [{ ...entry, date }] }),
        ),
      ).toThrow();
    }
  });
  it("rejects unsafe numeric and duplicate records", () => {
    for (const amountWageredCents of [-1, 1.2, 1e20])
      expect(() =>
        parseMemberData(
          JSON.stringify({
            ...blankData(),
            entries: [{ ...entry, amountWageredCents }],
          }),
        ),
      ).toThrow();
    expect(() =>
      parseMemberData(
        JSON.stringify({ ...blankData(), entries: [entry, entry] }),
      ),
    ).toThrow();
  });
  it("does not silently erase a malformed backup", () => {
    localStorage.setItem("clearline-member-v1:one", "corrupt");
    expect(() => readMemberData("one")).toThrow();
    expect(localStorage.getItem("clearline-member-v1:one")).toBe("corrupt");
  });
  it("parses dollar cents without accepting NaN, exponent or extra decimals", () => {
    expect(moneyToCents("17.29")).toBe(1729);
    expect(moneyToCents("-10", true)).toBe(-1000);
    for (const v of ["", "NaN", "1e6", "-1", "1.123"])
      expect(() => moneyToCents(v)).toThrow();
  });
});
describe("four week boundary regression", () => {
  it("excludes old and future records instead of clamping them to weeks", () => {
    const p = { ...seedPlan(), startDate: "2026-09-01" };
    const entries = [
      entry,
      { ...entry, id: "before", date: "2026-08-31" },
      { ...entry, id: "last", date: "2026-09-28" },
      { ...entry, id: "after", date: "2026-09-29" },
    ];
    const comparison = comparePlanToRecorded(p, entries);
    expect(comparison.recordedWageredCents).toBe(20000);
    expect(comparison.recordedDays).toBe(2);
    expect(weeklySummaries(p, entries).map((w) => w.wageredCents)).toEqual([
      10000, 0, 0, 10000,
    ]);
  });
});
