import type { ActivityEntry, DemoState, PersonalPlan } from "./types";

/**
 * Local-only persistence. All demo data lives in localStorage on this
 * device. Nothing is transmitted anywhere.
 */

export const STORAGE_KEY = "clearline-demo-v1";

/** Minimal storage interface so tests can supply an in-memory implementation. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): KeyValueStore | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
  return null;
}

export function emptyState(): DemoState {
  return { plan: null, entries: [], onboardingComplete: false };
}

export function loadState(store: KeyValueStore | null = defaultStore()): DemoState {
  if (!store) return emptyState();
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      // Normalize fields added after a plan may have been saved, so older
      // stored data loads without undefined leaking into the UI.
      plan: parsed.plan ? { ...parsed.plan, pauseUntil: parsed.plan.pauseUntil ?? null } : null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      onboardingComplete: Boolean(parsed.onboardingComplete),
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: DemoState, store: KeyValueStore | null = defaultStore()): void {
  if (!store) return;
  store.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function deleteAllData(store: KeyValueStore | null = defaultStore()): void {
  if (!store) return;
  store.removeItem(STORAGE_KEY);
}

/** Pure state transitions used by the UI and covered by unit tests. */

export function withPlan(state: DemoState, plan: PersonalPlan): DemoState {
  return { ...state, plan, onboardingComplete: true };
}

/** Set or clear a self-directed pause. Enforces nothing; it is the user's own note. */
export function setPause(state: DemoState, pauseUntil: string | null): DemoState {
  if (!state.plan) return state;
  return { ...state, plan: { ...state.plan, pauseUntil } };
}

export function addEntry(state: DemoState, entry: ActivityEntry): DemoState {
  return { ...state, entries: [...state.entries, entry] };
}

export function updateEntry(state: DemoState, entry: ActivityEntry): DemoState {
  return {
    ...state,
    entries: state.entries.map((e) => (e.id === entry.id ? entry : e)),
  };
}

export function deleteEntry(state: DemoState, id: string): DemoState {
  return { ...state, entries: state.entries.filter((e) => e.id !== id) };
}

/** Serialize the demo state for user-controlled JSON export. */
export function exportStateJson(state: DemoState): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      note: "Clearline demo export. This file was generated locally on your device.",
      ...state,
    },
    null,
    2,
  );
}

export function newEntryId(): string {
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
