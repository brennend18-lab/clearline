import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { disclaimers } from "../../content";
import { useDemoState } from "../../lib/useDemoState";
import { formatCents, formatMinutes } from "../../lib/format";
import { fundingSourceOptions, goalOptions } from "../../lib/types";
import type { DataChoices, GoalId, PersonalPlan } from "../../lib/types";

const STEPS = ["Welcome", "Your goal", "Your plan", "Privacy", "Confirm"] as const;

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Onboarding() {
  const { state, setPlan, loadExampleMonth } = useDemoState();
  const navigate = useNavigate();
  /**
   * Revising an existing plan must start from the plan you saved, not from
   * defaults. Every field below seeds from state.plan when one exists.
   */
  const saved = state.plan;
  const isRevising = saved !== null;

  const [step, setStep] = useState(0);
  const [adultConfirmed, setAdultConfirmed] = useState(saved?.adultConfirmed ?? false);
  const [goal, setGoal] = useState<GoalId | null>(saved?.goal ?? null);
  const [maxWagered, setMaxWagered] = useState(
    saved ? String(saved.maxWageredCents / 100) : "500",
  );
  const [maxNetLoss, setMaxNetLoss] = useState(
    saved ? String(saved.maxNetLossCents / 100) : "250",
  );
  const [maxDays, setMaxDays] = useState(saved ? String(saved.maxGamblingDays) : "8");
  const [maxHours, setMaxHours] = useState(
    saved ? String(Math.round((saved.maxTimeMinutes / 60) * 10) / 10) : "10",
  );
  const [prohibited, setProhibited] = useState<string[]>(saved?.prohibitedFundingSources ?? []);
  const [dataChoices, setDataChoices] = useState<DataChoices>(
    saved?.dataChoices ?? {
      manualLogging: true,
      simulatedImport: false,
      localReminders: false,
      aggregateResearch: false,
    },
  );

  const plan = useMemo<PersonalPlan | null>(() => {
    if (!goal) return null;
    const wagered = Math.max(0, Math.round(Number(maxWagered) || 0));
    const loss = Math.max(0, Math.round(Number(maxNetLoss) || 0));
    const days = Math.min(28, Math.max(0, Math.round(Number(maxDays) || 0)));
    const hours = Math.max(0, Number(maxHours) || 0);
    return {
      createdAt: saved?.createdAt ?? new Date().toISOString(),
      // Revising keeps the original four-week window so recorded entries stay in range.
      startDate: saved?.startDate ?? todayIso(),
      goal,
      maxWageredCents: wagered * 100,
      maxNetLossCents: loss * 100,
      maxGamblingDays: days,
      maxTimeMinutes: Math.round(hours * 60),
      prohibitedFundingSources: prohibited,
      dataChoices,
      adultConfirmed,
      pauseUntil: saved?.pauseUntil ?? null,
    };
  }, [goal, maxWagered, maxNetLoss, maxDays, maxHours, prohibited, dataChoices, adultConfirmed, saved]);

  const canContinue =
    step === 0 ? adultConfirmed : step === 1 ? goal !== null : true;

  function finish() {
    if (!plan) return;
    setPlan(plan);
    navigate("/demo/log");
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="flex items-center gap-2" aria-label="Onboarding progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1 rounded-full ${i <= step ? "bg-blue" : "bg-navy/10"}`}
              aria-hidden="true"
            />
            <span className={`hidden text-[11px] sm:block ${i === step ? "font-semibold text-navy" : "text-navy/45"}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-navy/50 sm:hidden">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div className="card mt-6 p-6 sm:p-10">
        {step === 0 && (
          <div>
            <h1 className="font-serif text-3xl font-semibold">
              {isRevising ? "Revise your plan" : "A private place to look clearly"}
            </h1>
            <p className="mt-4 leading-relaxed text-navy/70">
              {isRevising
                ? "Your current plan is loaded below. Change whatever you want, and your recorded entries stay exactly as they are."
                : "In the next few minutes you'll set a four-week plan in your own terms, see how logging works, and view a factual report of plan versus recorded activity. Everything stays on this device."}
            </p>
            <p className="mt-3 text-sm text-navy/60">{disclaimers.educational}</p>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4">
              <input
                type="checkbox"
                checked={adultConfirmed}
                onChange={(e) => setAdultConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue"
              />
              <span className="text-sm">
                I confirm I am an adult (21 or older where required, otherwise 18+)
                and I'm using this demo for myself or to support someone I care about.
              </span>
            </label>
            <div className="mt-6 rounded-lg bg-softblue/40 p-4 text-sm text-navy/70">
              Just want to explore?{" "}
              <button
                type="button"
                className="font-semibold text-blue underline-offset-2 hover:underline"
                onClick={() => {
                  loadExampleMonth();
                  navigate("/demo/report");
                }}
              >
                Skip ahead with example data
              </button>
              .
            </div>
          </div>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-serif text-3xl font-semibold">What brings you here?</legend>
            <p className="mt-3 text-sm text-navy/60">
              This only shapes which options we show first. You can change it anytime.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {goalOptions.map((g) => (
                <label
                  key={g.id}
                  className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors ${
                    goal === g.id ? "border-blue bg-softblue/40" : "border-line hover:border-line-strong"
                  }`}
                >
                  <span className="flex items-center justify-between text-sm font-semibold">
                    {g.label}
                    {goal === g.id && <Check className="h-4 w-4 text-blue" aria-hidden="true" />}
                  </span>
                  <span className="text-xs text-navy/60">{g.detail}</span>
                  <input
                    type="radio"
                    name="goal"
                    value={g.id}
                    checked={goal === g.id}
                    onChange={() => setGoal(g.id)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-serif text-3xl font-semibold">Your four-week plan</h2>
            <p className="mt-3 text-sm text-navy/60">
              Set the boundaries that feel right to you. These are your numbers, not ours.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="maxWagered" className="field-label">Maximum amount wagered ($)</label>
                <input id="maxWagered" type="number" min="0" inputMode="numeric" className="field-input" value={maxWagered} onChange={(e) => setMaxWagered(e.target.value)} />
              </div>
              <div>
                <label htmlFor="maxNetLoss" className="field-label">Maximum net loss ($)</label>
                <input id="maxNetLoss" type="number" min="0" inputMode="numeric" className="field-input" value={maxNetLoss} onChange={(e) => setMaxNetLoss(e.target.value)} />
              </div>
              <div>
                <label htmlFor="maxDays" className="field-label">Maximum gambling days (of 28)</label>
                <input id="maxDays" type="number" min="0" max="28" inputMode="numeric" className="field-input" value={maxDays} onChange={(e) => setMaxDays(e.target.value)} />
              </div>
              <div>
                <label htmlFor="maxHours" className="field-label">Maximum time (hours)</label>
                <input id="maxHours" type="number" min="0" inputMode="numeric" className="field-input" value={maxHours} onChange={(e) => setMaxHours(e.target.value)} />
              </div>
            </div>
            <fieldset className="mt-6">
              <legend className="field-label">Funding sources you'd rather keep off-limits (optional)</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {fundingSourceOptions.map((f) => (
                  <label key={f} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3.5 py-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-blue"
                      checked={prohibited.includes(f)}
                      onChange={(e) =>
                        setProhibited((p) => (e.target.checked ? [...p, f] : p.filter((x) => x !== f)))
                      }
                    />
                    {f}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-serif text-3xl font-semibold">Privacy and data choices</h2>
            <p className="mt-3 text-sm text-navy/60">
              Manual logging is the default. Each choice below is separate and optional.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-line bg-softgreen/40 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Manual logging (on)</p>
                  <p className="mt-0.5 text-xs text-navy/60">
                    You type what you want, when you want. Stored only on this device.
                  </p>
                </div>
              </div>
              {(
                [
                  {
                    key: "simulatedImport" as const,
                    title: "Simulated account import",
                    body: disclaimers.importsSimulated + " Off by default.",
                  },
                  {
                    key: "localReminders" as const,
                    title: "Local reminders",
                    body: "A gentle reminder inside the app to log, never an email or text.",
                  },
                  {
                    key: "aggregateResearch" as const,
                    title: "Aggregate research (simulated)",
                    body: "In a real product, share de-identified totals to improve support tools. Never sold, never advertising.",
                  },
                ]
              ).map((c) => (
                <label key={c.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-blue"
                    checked={dataChoices[c.key]}
                    onChange={(e) => setDataChoices((d) => ({ ...d, [c.key]: e.target.checked }))}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{c.title}</span>
                    <span className="mt-0.5 block text-xs text-navy/60">{c.body}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && plan && (
          <div>
            <h2 className="font-serif text-3xl font-semibold">Your plan, in plain words</h2>
            <div className="mt-6 rounded-xl bg-cream p-6 leading-relaxed">
              <p>
                Over the next four weeks, you plan to wager no more than{" "}
                <strong>{formatCents(plan.maxWageredCents)}</strong>, keep any
                net loss under <strong>{formatCents(plan.maxNetLossCents)}</strong>,
                gamble on at most <strong>{plan.maxGamblingDays} days</strong>,
                and spend no more than <strong>{formatMinutes(plan.maxTimeMinutes)}</strong> in total.
              </p>
              {plan.prohibitedFundingSources.length > 0 && (
                <p className="mt-3">
                  You'd rather not fund gambling from:{" "}
                  <strong>{plan.prohibitedFundingSources.join(", ")}</strong>.
                </p>
              )}
            </div>
            <p className="mt-4 text-sm text-navy/60">
              This is a plan you chose, not a rule we enforce. Next you'll see
              how logging works.
            </p>
            <p className="mt-2 text-xs text-navy/50">{disclaimers.educational}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <Link to="/" className="btn-quiet text-sm">Cancel</Link>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={finish}>
              {isRevising ? "Save changes" : "Save my plan"}{" "}
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
