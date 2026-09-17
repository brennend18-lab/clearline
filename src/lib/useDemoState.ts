import { createContext, useContext } from "react";
import type { ActivityEntry, DemoState, PersonalPlan } from "./types";

export interface DemoStateApi {
  state: DemoState;
  setPlan(plan: PersonalPlan): void;
  setPause(pauseUntil: string | null): void;
  addEntry(entry: ActivityEntry): void;
  updateEntry(entry: ActivityEntry): void;
  deleteEntry(id: string): void;
  loadExampleMonth(): void;
  resetDemo(): void;
  deleteAll(): void;
  exportJson(): void;
}

export const DemoStateContext = createContext<DemoStateApi | null>(null);

export function useDemoState(): DemoStateApi {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error("useDemoState must be used within DemoStateProvider");
  return ctx;
}
