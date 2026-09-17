import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, ChevronDown, PauseCircle } from "lucide-react";
import { reportCopy, disclaimers } from "../../content";
import { useDemoState } from "../../lib/useDemoState";
import { comparePlanToRecorded } from "../../lib/calculations";
import { buildSummarySentence } from "../../lib/summary";
import { formatCents, formatDateShort, formatMinutes } from "../../lib/format";
import { BarChart } from "../../components/BarChart";

function StatCard({
  label,
  planned,
  recorded,
  difference,
}: {
  label: string;
  planned: string;
  recorded: string;
  difference: string | null;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-navy/50">What you planned</p>
          <p className="mt-0.5 font-serif text-xl font-semibold">{planned}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-navy/50">What you recorded</p>
          <p className="mt-0.5 font-serif text-xl font-semibold">{recorded}</p>
        </div>
      </div>
      {difference && (
        <p className="mt-3 border-t border-line pt-2.5 text-xs text-navy/65">{difference}</p>
      )}
    </div>
  );
}

export function Report() {
  const { state } = useDemoState();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const comparison = useMemo(
    () => (state.plan ? comparePlanToRecorded(state.plan, state.entries) : null),
    [state.plan, state.entries],
  );

  if (!state.plan || !comparison || state.entries.length === 0) {
    return <EmptyReport hasPlan={Boolean(state.plan)} />;
  }

  const c = comparison;
  const plan = state.plan;
  const aboveWagered = c.wageredDifferenceCents > 0;

  /* The same sentence the investor deck renders, from the same function. */
  const sentence = buildSummarySentence(c);

  const weeklyPlanDollars = Math.round(c.plannedWageredCents / 400);
  const chartData = c.weeks.map((w) => ({
    label: w.label,
    values: { Recorded: Math.round(w.wageredCents / 100) },
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-semibold">Plan versus recorded</h1>

      {plan.pauseUntil && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-teal/30 bg-softgreen/50 px-5 py-4">
          <PauseCircle className="h-5 w-5 flex-none text-teal" aria-hidden="true" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">
              You set a pause through {formatDateShort(plan.pauseUntil)}.
            </span>{" "}
            <span className="text-navy/65">{disclaimers.pauseIsANote}</span>
          </p>
          <Link to="/demo/actions" className="text-sm font-semibold text-teal hover:underline">
            Manage pause
          </Link>
        </div>
      )}

      {/* The factual summary, in the required tone */}
      <div className="card mt-6 border-l-4 border-l-blue p-6 sm:p-8">
        <p className="max-w-2xl text-lg leading-relaxed">
          {sentence} <span className="font-semibold">What would you like to do next?</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/demo/actions" className="btn-primary text-sm">
            See your options <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/demo" className="btn-secondary text-sm">
            Revise the plan
          </Link>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Amount wagered"
          planned={formatCents(c.plannedWageredCents)}
          recorded={formatCents(c.recordedWageredCents)}
          difference={
            c.wageredDifferenceCents === 0
              ? "Exactly at your plan."
              : `${formatCents(Math.abs(c.wageredDifferenceCents))} ${aboveWagered ? "above" : "under"} your plan.`
          }
        />
        <StatCard
          label="Gambling days"
          planned={`${c.plannedDays} days`}
          recorded={`${c.recordedDays} days`}
          difference={
            c.daysDifference === 0
              ? "Exactly at your plan."
              : `${Math.abs(c.daysDifference)} ${c.daysDifference > 0 ? "more" : "fewer"} than planned.`
          }
        />
        <StatCard
          label="Time spent"
          planned={formatMinutes(c.plannedMinutes)}
          recorded={formatMinutes(c.recordedMinutes)}
          difference={
            c.minutesDifference === 0
              ? "Exactly at your plan."
              : `${formatMinutes(Math.abs(c.minutesDifference))} ${c.minutesDifference > 0 ? "more" : "less"} than planned.`
          }
        />
        <StatCard
          label="Net recorded result"
          planned={`Loss limit ${formatCents(plan.maxNetLossCents)}`}
          recorded={formatCents(c.netResultCents, { sign: true })}
          difference="Wins and losses across everything you recorded."
        />
      </div>

      {/* Chart */}
      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Recorded amount wagered by week</h2>
          <p className="text-xs text-navy/55">
            Dashed line is your planned four-week total spread evenly
          </p>
        </div>
        <div className="mt-4">
          <BarChart
            data={chartData}
            series={[{ key: "Recorded", color: "#2D6CDF" }]}
            yAxisLabel="Dollars wagered"
            formatValue={(n) => `$${Math.round(n)}`}
            referenceLine={{ value: weeklyPlanDollars, label: "Planned pace" }}
          />
        </div>
        <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-navy/60">
          Accessible summary: weekly recorded wagers were{" "}
          {c.weeks.map((w) => `${w.label} ${formatCents(w.wageredCents)}`).join(", ")}. Your planned
          pace is about ${weeklyPlanDollars} per week.
        </p>
      </div>

      {/* Timeline */}
      <div className="card mt-8 p-6">
        <h2 className="text-sm font-semibold">Your private timeline</h2>
        <ol className="mt-4 space-y-0">
          {[...state.entries]
            .sort((a, b) => (a.date > b.date ? 1 : -1))
            .map((e, i, arr) => (
              <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
                {i < arr.length - 1 && (
                  <span className="absolute left-[5px] top-4 h-full w-px bg-navy/10" aria-hidden="true" />
                )}
                <span className="mt-1.5 h-[11px] w-[11px] flex-none rounded-full border-2 border-blue bg-white" aria-hidden="true" />
                <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-sm">
                    <span className="font-semibold">{formatDateShort(e.date)}</span>{" "}
                    <span className="text-navy/70">· {e.platform}</span>
                    {e.note && <span className="block text-xs text-navy/50">{e.note}</span>}
                  </p>
                  <p className="text-sm tabular-nums text-navy/70">
                    {formatCents(e.amountWageredCents)} wagered ·{" "}
                    <span className={e.netResultCents < 0 ? "" : "text-teal"}>
                      {formatCents(e.netResultCents, { sign: true })}
                    </span>{" "}
                    · {formatMinutes(e.timeSpentMinutes)}
                  </p>
                </div>
              </li>
            ))}
        </ol>
      </div>

      {/* Meaning */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-sm font-semibold">{reportCopy.meaningTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-navy/70">
            {reportCopy.meaning.map((m) => (
              <li key={m} className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-teal" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* How this was calculated */}
        <div className="card p-6">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Calculator className="h-4 w-4 text-teal" aria-hidden="true" />
              How this was calculated
            </span>
            <ChevronDown
              className={`h-4 w-4 text-navy/50 transition-transform ${drawerOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {drawerOpen && (
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-navy/70">
              <p>Deterministic arithmetic over your entries, nothing else:</p>
              <ul className="space-y-1.5 font-mono text-xs">
                <li>recorded wagered = sum of "amount wagered" = {formatCents(c.recordedWageredCents)}</li>
                <li>
                  difference = recorded minus planned = {formatCents(c.recordedWageredCents)} minus{" "}
                  {formatCents(c.plannedWageredCents)} = {formatCents(c.wageredDifferenceCents, { sign: true })}
                </li>
                <li>gambling days = count of distinct entry dates = {c.recordedDays}</li>
                <li>time = sum of "time spent" = {formatMinutes(c.recordedMinutes)}</li>
                <li>net result = sum of "net result" = {formatCents(c.netResultCents, { sign: true })}</li>
              </ul>
              <p className="text-xs text-navy/55">
                No model, no weighting, no inference. If an entry is missing, it simply is not
                counted.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next */}
      <div className="mt-10 rounded-xl bg-softblue/40 p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">{reportCopy.nextTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          Whatever you choose is yours to choose. Free support options always come first, and doing
          nothing for now is also an option.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/demo/actions" className="btn-primary text-sm">
            Open the action center <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/demo/log" className="btn-secondary text-sm">
            Keep logging
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-navy/50">{disclaimers.educational}</p>
    </div>
  );
}

function EmptyReport({ hasPlan }: { hasPlan: boolean }) {
  const { loadExampleMonth } = useDemoState();
  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-10 text-center">
        <h1 className="font-serif text-2xl font-semibold">No report yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-navy/65">
          {hasPlan
            ? "Add a few entries to your log, or load the example month, and your plan-versus-recorded report will appear here."
            : "Set up a plan first, then record some activity. Or load the example month to see a finished report right away."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-primary text-sm" onClick={loadExampleMonth}>
            Load example month
          </button>
          <Link to={hasPlan ? "/demo/log" : "/demo"} className="btn-secondary text-sm">
            {hasPlan ? "Go to the log" : "Set up a plan"}
          </Link>
        </div>
      </div>
    </div>
  );
}
