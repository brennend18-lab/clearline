import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { disclaimers } from "../../content";
import { useDemoState } from "../../lib/useDemoState";
import { newEntryId } from "../../lib/storage";
import { formatCents, formatDateShort, formatMinutes } from "../../lib/format";
import type { ActivityEntry } from "../../lib/types";

interface Draft {
  id: string | null;
  date: string;
  platform: string;
  amountWagered: string;
  netResult: string;
  timeSpent: string;
  note: string;
}

const emptyDraft = (): Draft => ({
  id: null,
  date: new Date().toISOString().slice(0, 10),
  platform: "",
  amountWagered: "",
  netResult: "",
  timeSpent: "",
  note: "",
});

export function Log() {
  const { state, addEntry, updateEntry, deleteEntry, loadExampleMonth } = useDemoState();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entries = [...state.entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  function startEdit(e: ActivityEntry) {
    setDraft({
      id: e.id,
      date: e.date,
      platform: e.platform,
      amountWagered: String(e.amountWageredCents / 100),
      netResult: String(e.netResultCents / 100),
      timeSpent: String(e.timeSpentMinutes),
      note: e.note ?? "",
    });
    setError(null);
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    if (!draft) return;
    if (!draft.date || !draft.platform.trim()) {
      setError("Please add at least a date and a platform or venue.");
      return;
    }
    const entry: ActivityEntry = {
      id: draft.id ?? newEntryId(),
      date: draft.date,
      platform: draft.platform.trim(),
      amountWageredCents: Math.round((Number(draft.amountWagered) || 0) * 100),
      netResultCents: Math.round((Number(draft.netResult) || 0) * 100),
      timeSpentMinutes: Math.max(0, Math.round(Number(draft.timeSpent) || 0)),
      ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    };
    if (draft.id) updateEntry(entry);
    else addEntry(entry);
    setDraft(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Your activity log</h1>
          <p className="mt-2 max-w-xl text-sm text-navy/65">{disclaimers.recordsIncomplete}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary text-sm" onClick={loadExampleMonth}>
            Load example month
          </button>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => {
              setDraft(emptyDraft());
              setError(null);
            }}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add entry
          </button>
        </div>
      </div>

      {draft && (
        <form onSubmit={submit} className="card mt-6 p-6" aria-label={draft.id ? "Edit entry" : "Add entry"}>
          <h2 className="text-sm font-semibold">{draft.id ? "Edit entry" : "New entry"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="entry-date" className="field-label">Date</label>
              <input id="entry-date" type="date" className="field-input" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </div>
            <div>
              <label htmlFor="entry-platform" className="field-label">Platform or venue</label>
              <input id="entry-platform" type="text" className="field-input" placeholder="Sportsbook app, casino, poker night…" value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} />
            </div>
            <div>
              <label htmlFor="entry-wagered" className="field-label">Amount wagered ($)</label>
              <input id="entry-wagered" type="number" min="0" step="0.01" className="field-input" value={draft.amountWagered} onChange={(e) => setDraft({ ...draft, amountWagered: e.target.value })} />
            </div>
            <div>
              <label htmlFor="entry-net" className="field-label">Net result ($, losses negative)</label>
              <input id="entry-net" type="number" step="0.01" className="field-input" placeholder="-25" value={draft.netResult} onChange={(e) => setDraft({ ...draft, netResult: e.target.value })} />
            </div>
            <div>
              <label htmlFor="entry-time" className="field-label">Time spent (minutes)</label>
              <input id="entry-time" type="number" min="0" className="field-input" value={draft.timeSpent} onChange={(e) => setDraft({ ...draft, timeSpent: e.target.value })} />
            </div>
            <div>
              <label htmlFor="entry-note" className="field-label">Note or context (optional)</label>
              <input id="entry-note" type="text" className="field-input" placeholder="Anything you want to remember" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-caution">
              {error}
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <button type="submit" className="btn-primary text-sm">
              {draft.id ? "Save changes" : "Add to log"}
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="font-serif text-xl font-semibold">Nothing recorded yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy/60">
            Add an entry above, or load the example month to see how the report
            works with realistic data.
          </p>
        </div>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">Recorded gambling activity entries</caption>
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-navy/50">
                <th scope="col" className="px-5 py-3.5 font-semibold">Date</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Platform / venue</th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold">Wagered</th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold">Net result</th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold">Time</th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 align-top">
                    <div className="font-medium">{formatDateShort(e.date)}</div>
                    {e.note && <div className="mt-0.5 max-w-[14rem] text-xs text-navy/55">{e.note}</div>}
                  </td>
                  <td className="px-5 py-3.5 align-top">{e.platform}</td>
                  <td className="px-5 py-3.5 text-right align-top tabular-nums">{formatCents(e.amountWageredCents)}</td>
                  <td className={`px-5 py-3.5 text-right align-top font-medium tabular-nums ${e.netResultCents < 0 ? "text-navy" : "text-teal"}`}>
                    {formatCents(e.netResultCents, { sign: true })}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right align-top tabular-nums">{formatMinutes(e.timeSpentMinutes)}</td>
                  <td className="px-5 py-3.5 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <button type="button" className="rounded-md p-1.5 text-navy/50 hover:bg-navy/5 hover:text-navy" aria-label={`Edit entry from ${formatDateShort(e.date)}`} onClick={() => startEdit(e)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" className="rounded-md p-1.5 text-navy/50 hover:bg-caution/10 hover:text-caution" aria-label={`Delete entry from ${formatDateShort(e.date)}`} onClick={() => deleteEntry(e.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Link to="/demo/report" className="btn-primary">
            See your report
          </Link>
        </div>
      )}
    </div>
  );
}
