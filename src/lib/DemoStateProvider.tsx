import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ActivityEntry, DemoState, PersonalPlan } from "./types";
import {
  addEntry as addEntryFn,
  deleteAllData,
  deleteEntry as deleteEntryFn,
  emptyState,
  exportStateJson,
  loadState,
  saveState,
  setPause as setPauseFn,
  updateEntry as updateEntryFn,
  withPlan,
} from "./storage";
import { seedEntries, seedPlan } from "./seed";
import { DemoStateContext } from "./useDemoState";
import type { DemoStateApi } from "./useDemoState";

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setPlan = useCallback((plan: PersonalPlan) => {
    setState((s) => withPlan(s, plan));
  }, []);

  const setPause = useCallback((pauseUntil: string | null) => {
    setState((s) => setPauseFn(s, pauseUntil));
  }, []);

  const addEntry = useCallback((entry: ActivityEntry) => {
    setState((s) => addEntryFn(s, entry));
  }, []);

  const updateEntry = useCallback((entry: ActivityEntry) => {
    setState((s) => updateEntryFn(s, entry));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setState((s) => deleteEntryFn(s, id));
  }, []);

  const loadExampleMonth = useCallback(() => {
    setState((s) => ({
      plan: s.plan ?? seedPlan(),
      onboardingComplete: true,
      entries: seedEntries(),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState({ plan: seedPlan(), entries: seedEntries(), onboardingComplete: true });
  }, []);

  const deleteAll = useCallback(() => {
    deleteAllData();
    setState(emptyState());
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([exportStateJson(loadState())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearline-demo-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const api = useMemo<DemoStateApi>(
    () => ({
      state,
      setPlan,
      setPause,
      addEntry,
      updateEntry,
      deleteEntry,
      loadExampleMonth,
      resetDemo,
      deleteAll,
      exportJson,
    }),
    [state, setPlan, setPause, addEntry, updateEntry, deleteEntry, loadExampleMonth, resetDemo, deleteAll, exportJson],
  );

  return <DemoStateContext.Provider value={api}>{children}</DemoStateContext.Provider>;
}
