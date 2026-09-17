import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  HeartHandshake,
  Printer,
  Scale,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { BarChart } from "../components/BarChart";
import { PlanSnapshot } from "../components/PlanSnapshot";
import { comparePlanToRecorded } from "../lib/calculations";
import { seedEntries, seedPlan } from "../lib/seed";
import { brand, supportResources } from "../config/brand";
import {
  ASSUMPTION_FOOTNOTE,
  marketSignals,
  planningFigures,
  revenueScenario,
  yearTotal,
} from "../data/financials";
import { IllustrativeBadge } from "../components/IllustrativeBadge";
import { Logo } from "../components/Logo";
import { formatCompactUsd } from "../lib/format";
import { asset } from "../lib/asset";

/* ---------- slide scaffolding ---------- */

function Slide({
  children,
  tone = "cream",
  label,
}: {
  children: ReactNode;
  tone?: "cream" | "navy" | "white";
  label?: string;
}) {
  const tones = {
    cream: "bg-cream text-navy",
    white: "bg-white text-navy",
    navy: "bg-navy text-cream",
  };
  return (
    <div className={`deck-slide flex h-full w-full flex-col justify-between overflow-hidden p-8 sm:p-12 lg:p-16 ${tones[tone]}`}>
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
      {label && (
        <p className={`pt-4 text-[11px] uppercase tracking-[0.18em] ${tone === "navy" ? "text-cream/40" : "text-navy/40"}`}>
          {brand.name} · {label}
        </p>
      )}
    </div>
  );
}

function SlideEyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone === "dark" ? "text-softgreen" : "text-teal"}`}>
      {children}
    </p>
  );
}

/* ---------- individual slides ---------- */

/**
 * The deck's product slide is computed from the product's own seed data and
 * calculation code, so it cannot drift away from what the demo actually shows.
 */
function liveDemoComparison() {
  const now = new Date();
  return comparePlanToRecorded(seedPlan(now), seedEntries(now));
}

function CoverSlide() {
  return (
    <div
      className="deck-slide relative flex h-full w-full flex-col justify-center overflow-hidden bg-navy p-8 text-cream sm:p-12 lg:p-16"
      style={{
        backgroundImage: `url(${asset("assets/deck-cover.webp")})`,
        backgroundSize: "cover",
        backgroundPosition: "center 62%",
      }}
    >
      <div className="relative max-w-3xl">
        <Logo light />
        <h1 className="mt-8 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          Independent player protection
          <br />
          for the digital wagering era
        </h1>
        <p className="mt-6 max-w-xl text-lg text-cream/75">{brand.tagline}</p>
        <p className="mt-10 text-xs text-cream/45">
          Working name, not cleared for legal or trademark use. Prototype for
          strategic feedback, not an offering.
        </p>
      </div>
    </div>
  );
}

const slideDefs: Array<{ label: string; render: () => ReactNode }> = [
  { label: "Cover", render: () => <CoverSlide /> },
  {
    label: "Problem",
    render: () => (
      <Slide label="Problem">
        <SlideEyebrow>Problem</SlideEyebrow>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Access to gambling has expanded faster than trusted, low-friction support
        </h2>
        <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { t: "Always in your pocket", b: "Legal online wagering now reaches most U.S. adults, on the same device they use for everything else." },
            { t: "Fragmented help", b: "Helplines, state programs, blockers, peer groups, and clinics all exist, but nothing independent sits with the person day to day." },
            { t: "Careful framing", b: "Many adults want perspective or a boundary, not treatment. Need is not the same as diagnosis, or as purchasing demand." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-line bg-white p-5">
              <p className="text-sm font-semibold">{c.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{c.b}</p>
            </div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    label: "Market signal",
    render: () => (
      <Slide label="Market signal" tone="white">
        <SlideEyebrow>Market signal</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
          The need is large, measurable, and financial
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            { stat: "~20M", body: marketSignals.frequentIndicatorAdults, src: `Source: ${marketSignals.frequentIndicatorSource}` },
            { stat: "377,410", body: marketSignals.helplineContacts, src: `Source: ${marketSignals.helplineSource}` },
            { stat: "73.32%", body: marketSignals.financialStruggles, src: `Source: ${marketSignals.financialStrugglesSource}` },
          ].map((s) => (
            <div key={s.stat} className="flex flex-col rounded-xl border border-line bg-cream p-6">
              <p className="font-serif text-4xl font-semibold text-blue lg:text-5xl">{s.stat}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{s.body}</p>
              <p className="mt-4 border-t border-line pt-3 text-xs text-navy/55">{s.src}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-4xl text-xs leading-relaxed text-navy/55">
          Limitations: {marketSignals.limitations}
        </p>
      </Slide>
    ),
  },
  {
    label: "Core insight",
    render: () => (
      <Slide label="Core insight" tone="navy">
        <SlideEyebrow tone="dark">Core insight</SlideEyebrow>
        <h2 className="mt-4 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The consumer should not be the only payer
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">
          Providers, employers, universities, operators, states, and financial
          institutions already carry gambling-harm costs. Shift revenue
          upstream to the institutions, and keep the front door free for people.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-cream/25 px-4 py-2">Free front door</span>
          <ArrowRight className="h-4 w-4 text-softgreen" aria-hidden="true" />
          <span className="rounded-full border border-cream/25 px-4 py-2">Modest consumer membership</span>
          <ArrowRight className="h-4 w-4 text-softgreen" aria-hidden="true" />
          <span className="rounded-full bg-cream/10 px-4 py-2 font-semibold">Institutional recurring contracts</span>
        </div>
      </Slide>
    ),
  },
  {
    label: "Solution",
    render: () => (
      <Slide label="Solution">
        <SlideEyebrow>Solution</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
          One journey: Plan → Log → Reflect → Act
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-navy/10 sm:grid-cols-4">
          {[
            { n: "01", t: "Plan", b: "Personal money, time, and frequency boundaries, chosen by the user." },
            { n: "02", t: "Log", b: "Manual, private records. Read-only imports later, with real consent." },
            { n: "03", t: "Reflect", b: "Plan versus recorded, in factual, non-diagnostic language." },
            { n: "04", t: "Act", b: "Safeguards, free resources, peer and family support, licensed care." },
          ].map((s) => (
            <div key={s.n} className="bg-white p-6">
              <p className="text-xs font-semibold text-navy/35">{s.n}</p>
              <p className="mt-2 font-serif text-2xl font-semibold">{s.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{s.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-navy/60">
          Free help is always shown before any paid product. Nothing sells picks,
          shows odds, or optimizes betting.
        </p>
      </Slide>
    ),
  },
  {
    label: "Product demo",
    render: () => (
      <Slide label="Product demo" tone="white">
        <SlideEyebrow>Product</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">The report, in the product's own voice</h2>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-line bg-cream p-6 shadow-calm">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
              Plan versus recorded, live demo data
            </p>
            <div className="mt-3">
              {/*
                The real product component, rendered from the same seed data and
                the same comparePlanToRecorded function the demo uses. If the
                product's wording or math changes, this slide changes with it.
              */}
              <PlanSnapshot comparison={liveDemoComparison()} compact />
            </div>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed">
            {[
              "Factual tone: never a label, never a lecture",
              "Transparent arithmetic behind every number",
              "Action center pairs every option with its limits",
              "Crisis resources one tap away, calm by default",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
                {t}
              </li>
            ))}
            <li className="pt-2 text-xs text-navy/55">
              Live prototype at <span className="font-mono">/demo</span>. This deck and the product render the same component.
            </li>
          </ul>
        </div>
      </Slide>
    ),
  },
  {
    label: "Business model",
    render: () => (
      <Slide label="Business model">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SlideEyebrow>Business model</SlideEyebrow>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
              Free front door, revenue upstream
            </h2>
          </div>
          <IllustrativeBadge />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: HeartHandshake, t: "Free front door", b: "Plan, log, reflect, crisis resources, free forever." },
            { icon: CheckCircle2, t: `Membership ${planningFigures.consumerPriceBand}`, b: "Deeper reflection and safeguards. No high-ticket consumer checkout." },
            { icon: ShieldCheck, t: "Bounded navigation", b: "Care navigation to licensed partners at transparent, bounded pricing." },
            { icon: Stethoscope, t: "Provider software", b: "Recurring per-clinician workflow licenses." },
            { icon: Building2, t: "Employer / EAP / university", b: "Per-covered-life contracts, aggregate reporting only." },
            { icon: Scale, t: "Operator / state contracts", b: "Independent player-protection tooling under strict governance." },
          ].map((m) => (
            <div key={m.t} className="rounded-xl border border-line bg-white p-5">
              <m.icon className="h-5 w-5 text-teal" aria-hidden="true" />
              <p className="mt-2.5 text-sm font-semibold">{m.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-navy/60">{m.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-navy/55">{ASSUMPTION_FOOTNOTE}</p>
      </Slide>
    ),
  },
  {
    label: "Go-to-market",
    render: () => (
      <Slide label="Go-to-market" tone="white">
        <SlideEyebrow>Go-to-market</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
          Earn trust in channels advertising can't buy
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-navy/10 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { t: "Clinically reviewed SEO", b: "Own the questions people actually search, with reviewed content." },
            { t: "Providers", b: "Design partners who embed the workflow in real care." },
            { t: "Employers & EAPs", b: "Confidential benefit with aggregate reporting." },
            { t: "Universities & financial wellness", b: "Prevention programs and banking safeguards." },
            { t: "Operators & states", b: "Governed partnerships last, once independence is proven." },
          ].map((s, i) => (
            <li key={s.t} className="bg-white p-5">
              <p className="text-xs font-semibold text-navy/35">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-sm font-semibold">{s.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-navy/60">{s.b}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm font-medium text-navy/70">
          Meta is not a dependency. Paid social is optional, not structural.
        </p>
      </Slide>
    ),
  },
  {
    label: "Competition",
    render: () => (
      <Slide label="Competition and whitespace">
        <SlideEyebrow>Competition & whitespace</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
          Everyone owns a piece. No one owns the person's view.
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: "Free helplines & peer support", b: "Essential and episodic, not a daily tool." },
              { t: "Operator responsible-gaming tools", b: "Per-operator, and inherently conflicted." },
              { t: "Blocking software", b: "One blunt lever, no reflection or navigation." },
              { t: "Insurance-funded care", b: "High acuity only; most people never get there." },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-line bg-white p-5">
                <p className="text-sm font-semibold">{c.t}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-navy/60">{c.b}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-navy p-6 text-cream">
            <p className="text-xs font-semibold uppercase tracking-wide text-softgreen">The whitespace</p>
            <p className="mt-3 font-serif text-xl font-semibold leading-snug">
              Independent, cross-operator reflection, plus navigation and
              institutional workflow on top.
            </p>
          </div>
        </div>
      </Slide>
    ),
  },
  {
    label: "Moat",
    render: () => (
      <Slide label="Moat" tone="navy">
        <SlideEyebrow tone="dark">Moat</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Compounding trust, hard to copy</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Trust & privacy posture", b: "No ads, no data sales, verifiable rather than claimed." },
            { t: "Governance firewall", b: "Institutional contracts that conflicted players can't sign." },
            { t: "Cross-operator picture", b: "With consent, the only whole-of-person view." },
            { t: "State resource coverage", b: "Maintained map of every state's programs and rules." },
            { t: "Provider integration", b: "Embedded in clinical workflow, renewed yearly." },
            { t: "Longitudinal outcomes", b: "Years of measured cohorts competitors can't backfill." },
            { t: "Purchaser renewals", b: "Aggregate reporting institutions budget around." },
            { t: "Independence itself", b: "The one asset an operator-owned tool can never have." },
          ].map((m) => (
            <div key={m.t} className="rounded-xl border border-cream/15 bg-cream/5 p-4">
              <p className="text-sm font-semibold">{m.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-cream/65">{m.b}</p>
            </div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    label: "Illustrative $50M hurdle",
    render: () => <HurdleSlide /> ,
  },
  {
    label: "Roadmap and ask",
    render: () => (
      <Slide label="Roadmap and ask" tone="white">
        <SlideEyebrow>Roadmap & ask</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Prove it carefully, then scale it</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <ol className="space-y-3">
            {[
              { t: "100-person pilot", b: "Consumer cohort using plan-log-reflect-act, measured honestly." },
              { t: "3–5 provider design partners", b: "Shape the clinical workflow with real practices." },
              { t: "First institutional contracts", b: "One employer/EAP and one university program." },
              { t: "Independent evaluation", b: "External researchers, published either way." },
              { t: "Minimum team", b: "Product engineering, clinical advisor, partnerships lead." },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4 rounded-xl border border-line bg-cream p-4">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.t}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-navy/60">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col justify-center rounded-xl border border-dashed border-line-strong p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">The ask</p>
            <p className="mt-3 font-serif text-3xl font-semibold text-navy/70">[Funding amount]</p>
            <p className="mt-3 text-sm leading-relaxed text-navy/65">
              Placeholder, sized to reach the milestones at left with
              approximately 18–24 months of runway.
            </p>
            <p className="mt-4 text-xs text-navy/55">
              Use of funds: [product & engineering] · [clinical & evaluation] ·
              [partnerships] · [operations]
            </p>
          </div>
        </div>
      </Slide>
    ),
  },
  /* ---------- appendix ---------- */
  {
    label: "Appendix A: Boundaries",
    render: () => (
      <Slide label="Appendix A">
        <SlideEyebrow>Appendix A</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold">Ethical and regulatory boundaries</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            "Adults only; no diagnosis, no clinical promises, no crisis-time sales.",
            "No picks, odds, wager recommendations, or betting optimization, ever.",
            "No advertising pixels, retargeting, audience uploads, or lead resale.",
            "AI never diagnoses, assesses crisis risk alone, sets a level of care, or writes a treatment plan.",
            "Free help always appears before any paid product; no high-ticket consumer checkout.",
            "No compensation tied to deposits, wagers, losses, exclusion, retention, reactivation, or treatment conversion.",
          ].map((b) => (
            <div key={b.slice(0, 20)} className="flex gap-3 rounded-lg border border-line bg-white p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
              <p className="text-sm leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    label: "Appendix B: Program economics",
    render: () => (
      <Slide label="Appendix B" tone="white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SlideEyebrow>Appendix B</SlideEyebrow>
            <h2 className="mt-4 font-serif text-3xl font-semibold">High-touch program unit economics</h2>
          </div>
          <IllustrativeBadge />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { k: "App-to-program acquisition cost", v: `$${planningFigures.programAcquisitionCost.toLocaleString()}`, n: "Per $5,000-program enrollee, before sales labor." },
            { k: "Post-acquisition contribution margin", v: `${(planningFigures.programContributionMargin * 100).toFixed(1)}%`, n: "On the $5,000 program after delivery costs." },
            { k: "Consumer LTV / CAC", v: `${planningFigures.consumerLtvToCac}×`, n: `Gross-profit basis at $${planningFigures.consumerTestPriceMonthly}/month test price.` },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-line bg-cream p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{s.k}</p>
              <p className="mt-2 font-serif text-3xl font-semibold text-blue">{s.v}</p>
              <p className="mt-2 text-xs leading-relaxed text-navy/60">{s.n}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-navy/70">
          Read plainly: a high-touch program funded by consumer acquisition
          alone is thin. The margin structure only works when institutional
          channels supply enrollees, which is the strategy rather than a workaround.
        </p>
        <p className="mt-4 text-xs text-navy/55">{ASSUMPTION_FOOTNOTE}</p>
      </Slide>
    ),
  },
  {
    label: "Appendix C: Facility deferred",
    render: () => (
      <Slide label="Appendix C">
        <SlideEyebrow>Appendix C</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold">Why an in-person facility is deferred</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            { t: "Capital intensity", b: "Real estate, licensure, and clinical staffing consume seed capital that software milestones need." },
            { t: "Regulatory surface", b: "Facility licensure is state-by-state and slow; software partnerships reach people now." },
            { t: "Utilization risk", b: "A facility bets on one metro's demand; the platform aggregates demand first and derisks any later site." },
            { t: "Sequencing", b: "Outcomes data and referral volume make a future facility fundable on evidence, not hope." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-line bg-white p-5">
              <p className="text-sm font-semibold">{c.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/65">{c.b}</p>
            </div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    label: "Appendix D: Sources",
    render: () => (
      <Slide label="Appendix D" tone="white">
        <SlideEyebrow>Appendix D</SlideEyebrow>
        <h2 className="mt-4 font-serif text-3xl font-semibold">Sources and notes</h2>
        <ul className="mt-8 max-w-3xl space-y-4 text-sm leading-relaxed">
          <li className="rounded-lg border border-line bg-cream p-4">
            <p className="font-semibold">{marketSignals.frequentIndicatorSource}</p>
            <p className="mt-1 text-navy/65">{marketSignals.frequentIndicatorAdults}. Self-reported survey indicators; not diagnoses.</p>
          </li>
          <li className="rounded-lg border border-line bg-cream p-4">
            <p className="font-semibold">{marketSignals.helplineSource}</p>
            <p className="mt-1 text-navy/65">
              {marketSignals.helplineContacts}. Includes family members and repeat contacts. Helpline: {supportResources.gambling.phraseNumber} ({supportResources.gambling.digitsNumber}).
            </p>
          </li>
          <li className="rounded-lg border border-line bg-cream p-4">
            <p className="font-semibold">Financial-struggles share</p>
            <p className="mt-1 text-navy/65">{marketSignals.financialStruggles}. {marketSignals.financialStrugglesSource}.</p>
          </li>
          <li className="rounded-lg border border-line bg-cream p-4">
            <p className="font-semibold">Financial scenario</p>
            <p className="mt-1 text-navy/65">
              All revenue, margin, and valuation figures are illustrative planning
              assumptions maintained in <span className="font-mono text-xs">src/data/financials.ts</span>. {ASSUMPTION_FOOTNOTE}
            </p>
          </li>
        </ul>
      </Slide>
    ),
  },
];

function HurdleSlide() {
  const data = revenueScenario.map((y) => ({
    label: `Y${y.year}`,
    values: {
      Consumer: y.consumer,
      Provider: y.provider,
      "Employer/EAP/Univ": y.employerEduUniversity,
      "Operator/State": y.operatorState,
    },
  }));
  const series = [
    { key: "Consumer", color: "#2D6CDF" },
    { key: "Provider", color: "#2B6B5F" },
    { key: "Employer/EAP/Univ", color: "#8FB4E8" },
    { key: "Operator/State", color: "#17324D" },
  ];
  const y5 = revenueScenario[4];
  return (
    <Slide label="Illustrative $50M hurdle">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SlideEyebrow>Illustrative $50M hurdle</SlideEyebrow>
          <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
            An assumption-driven path, not a forecast
          </h2>
        </div>
        <IllustrativeBadge />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-line bg-white p-4">
          <BarChart
            data={data}
            series={series}
            yAxisLabel="Annual recurring revenue"
            formatValue={(n) => formatCompactUsd(n)}
            height={230}
          />
          <p className="px-2 pt-3 text-xs text-navy/55">
            Accessible summary: total modeled recurring revenue grows from{" "}
            {formatCompactUsd(yearTotal(revenueScenario[0]))} in year one to{" "}
            {formatCompactUsd(yearTotal(y5))} in year five, mixing all four streams.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <div className="rounded-xl border border-line bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Year-5 modeled recurring revenue</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-blue">
              ${(yearTotal(y5) / 1_000_000).toFixed(2)}M
            </p>
            <p className="mt-1 text-xs text-navy/60">
              Blended gross margin {(planningFigures.yearFiveBlendedGrossMargin * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-line bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
              {planningFigures.illustrativeMultiple}× illustrative multiple
            </p>
            <p className="mt-1 font-serif text-4xl font-semibold">
              ≈ ${(planningFigures.illustrativeYearFiveValue / 1_000_000).toFixed(2)}M
            </p>
            <p className="mt-1 text-xs leading-relaxed text-navy/60">
              A scenario, not a forecast or valuation assurance. Values are
              editable in <span className="font-mono">src/data/financials.ts</span>.
            </p>
          </div>
          <p className="text-xs text-navy/55">{ASSUMPTION_FOOTNOTE}</p>
        </div>
      </div>
    </Slide>
  );
}

/* ---------- deck shell ---------- */

const MAIN_SLIDES = 12;
const APPENDIX_START = 12;

/** Fixed design size every slide is authored against (16:9). */
const SLIDE_W = 1280;
const SLIDE_H = 720;

export function Deck() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / SLIDE_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = useCallback((delta: number) => {
    setIndex((i) => Math.min(slideDefs.length - 1, Math.max(0, i + delta)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(MAIN_SLIDES - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const inAppendix = index >= APPENDIX_START;
  const counter = inAppendix
    ? `Appendix ${index - APPENDIX_START + 1} / ${slideDefs.length - APPENDIX_START}`
    : `${index + 1} / ${MAIN_SLIDES}`;

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  }

  return (
    <div ref={containerRef} className="deck-viewport flex min-h-screen flex-col bg-[#0E2033]">
      {/* Chrome */}
      <div className="deck-chrome flex items-center justify-between gap-3 px-4 py-3 text-cream sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-cream/70 hover:text-cream">
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Exit deck</span>
        </Link>
        <p className="text-xs text-cream/60">
          {brand.name} investor overview · <span className="tabular-nums">{counter}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIndex(inAppendix ? 0 : APPENDIX_START)}
            className="rounded-md px-2.5 py-1.5 text-xs text-cream/70 hover:bg-cream/10 hover:text-cream"
          >
            <BookOpen className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            {inAppendix ? "Back to deck" : "Appendix"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md p-2 text-cream/70 hover:bg-cream/10 hover:text-cream"
            aria-label="Print deck to PDF"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-md p-2 text-cream/70 hover:bg-cream/10 hover:text-cream"
            aria-label="Toggle fullscreen"
          >
            <Expand className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Slide area, kept 16:9 */}
      <div className="deck-stage-outer flex flex-1 items-center justify-center px-3 pb-3 sm:px-6 sm:pb-6">
        <div
          ref={stageRef}
          className="deck-stage relative w-full max-w-6xl overflow-hidden rounded-xl shadow-raise"
          style={{ aspectRatio: `${SLIDE_W} / ${SLIDE_H}` }}
        >
          {slideDefs.map((s, i) => (
            <div
              key={s.label}
              className="deck-slide-wrap absolute inset-0"
              style={{ display: i === index ? "block" : "none" }}
              aria-hidden={i !== index}
            >
              {/*
                Every slide is authored at one fixed design size and scaled to
                fit, so a slide looks identical at any viewport and can never
                overflow its frame.
              */}
              <div
                className="deck-slide-scale"
                style={{
                  width: SLIDE_W,
                  height: SLIDE_H,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {s.render()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Click controls */}
      <div className="deck-chrome flex items-center justify-center gap-3 pb-5 text-cream">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-full border border-cream/25 p-2.5 hover:bg-cream/10 disabled:opacity-30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {slideDefs.slice(0, MAIN_SLIDES).map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-cream" : "w-1.5 bg-cream/30 hover:bg-cream/60"}`}
              aria-label={`Go to slide ${i + 1}: ${s.label}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === slideDefs.length - 1}
          className="rounded-full border border-cream/25 p-2.5 hover:bg-cream/10 disabled:opacity-30"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
