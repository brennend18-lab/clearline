import { describe, expect, it } from "vitest";
import {
  addEntry,
  deleteAllData,
  deleteEntry,
  emptyState,
  exportStateJson,
  loadState,
  saveState,
  setPause,
  STORAGE_KEY,
  updateEntry,
  withPlan,
} from "./storage";
import type { KeyValueStore } from "./storage";
import { seedEntries, seedPlan } from "./seed";
import type { ActivityEntry } from "./types";

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const entry: ActivityEntry = {
  id: "t-1",
  date: "2026-09-01",
  platform: "Sportsbook app",
  amountWageredCents: 2_500,
  netResultCents: -1_000,
  timeSpentMinutes: 30,
  note: "test",
};

describe("activity log add / edit / delete", () => {
  it("adds an entry", () => {
    const s = addEntry(emptyState(), entry);
    expect(s.entries).toHaveLength(1);
    expect(s.entries[0].platform).toBe("Sportsbook app");
  });

  it("edits an entry by id", () => {
    const s0 = addEntry(emptyState(), entry);
    const s1 = updateEntry(s0, { ...entry, amountWageredCents: 5_000 });
    expect(s1.entries).toHaveLength(1);
    expect(s1.entries[0].amountWageredCents).toBe(5_000);
  });

  it("deletes an entry by id and leaves others alone", () => {
    let s = addEntry(emptyState(), entry);
    s = addEntry(s, { ...entry, id: "t-2" });
    s = deleteEntry(s, "t-1");
    expect(s.entries.map((e) => e.id)).toEqual(["t-2"]);
  });
});

describe("self-directed pause", () => {
  it("records and clears a pause on the plan", () => {
    const withAPlan = withPlan(emptyState(), seedPlan(new Date(2026, 8, 15)));
    expect(withAPlan.plan?.pauseUntil).toBeNull();

    const paused = setPause(withAPlan, "2026-10-01");
    expect(paused.plan?.pauseUntil).toBe("2026-10-01");

    expect(setPause(paused, null).plan?.pauseUntil).toBeNull();
  });

  it("is a no-op when no plan exists yet", () => {
    const s = emptyState();
    expect(setPause(s, "2026-10-01")).toEqual(s);
  });

  it("leaves logged entries untouched", () => {
    const s = setPause(
      withPlan(addEntry(emptyState(), entry), seedPlan(new Date(2026, 8, 15))),
      "2026-10-01",
    );
    expect(s.entries).toHaveLength(1);
  });
});

describe("persistence round-trip", () => {
  it("saves and loads state", () => {
    const store = memoryStore();
    const state = withPlan(addEntry(emptyState(), entry), seedPlan(new Date(2026, 8, 15)));
    saveState(state, store);
    const loaded = loadState(store);
    expect(loaded.onboardingComplete).toBe(true);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.plan?.maxWageredCents).toBe(50_000);
  });

  it("returns an empty state for corrupt data", () => {
    const store = memoryStore();
    store.setItem(STORAGE_KEY, "not json{{{");
    expect(loadState(store)).toEqual(emptyState());
  });

  it("normalizes a plan saved before the pause field existed", () => {
    const store = memoryStore();
    const legacy = { ...seedPlan(new Date(2026, 8, 15)) } as Record<string, unknown>;
    delete legacy.pauseUntil;
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({ plan: legacy, entries: [], onboardingComplete: true }),
    );
    expect(loadState(store).plan?.pauseUntil).toBeNull();
  });
});

describe("export and delete-all", () => {
  it("exports valid JSON with plan and entries", () => {
    const state = withPlan(
      { ...emptyState(), entries: seedEntries(new Date(2026, 8, 15)) },
      seedPlan(new Date(2026, 8, 15)),
    );
    const json = exportStateJson(state);
    const parsed = JSON.parse(json);
    expect(parsed.entries).toHaveLength(12);
    expect(parsed.plan.maxGamblingDays).toBe(8);
    expect(parsed.note).toContain("generated locally");
  });

  it("delete-all removes everything from the store", () => {
    const store = memoryStore();
    saveState(withPlan(emptyState(), seedPlan()), store);
    expect(store.data.size).toBe(1);
    deleteAllData(store);
    expect(store.data.size).toBe(0);
    expect(loadState(store)).toEqual(emptyState());
  });
});
