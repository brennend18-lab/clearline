import { Link } from "react-router-dom";
import {
  ArrowRight,
  Ban,
  Check,
  Download,
  Eye,
  HeartHandshake,
  Lock,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Unlock,
  UserX,
} from "lucide-react";
import { brand } from "../config/brand";
import { landing } from "../content";
import { formatCents } from "../lib/format";
import { asset } from "../lib/asset";
import { Reveal, useInView } from "../components/Reveal";

const benefitIcons = [Eye, SlidersHorizontal, UserX, Unlock, HeartHandshake, Scale];

/** Generated marks, one per step. */
const stepArt: Record<string, string> = {
  plan: asset("assets/step-plan.webp"),
  log: asset("assets/step-log.webp"),
  reflect: asset("assets/step-reflect.webp"),
  act: asset("assets/step-act.webp"),
};

/**
 * Plan-versus-recorded preview. Both bars share one scale so the gap reads
 * correctly, and they grow from the left once the card is on screen, which
 * shows the comparison happening rather than describing it.
 */
function PlanPreviewCard() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const rows = [
    { label: "Amount wagered", planned: 500, recorded: 820, fmt: (n: number) => formatCents(n * 100) },
    { label: "Gambling days", planned: 8, recorded: 12, fmt: (n: number) => `${n} days` },
    { label: "Time spent", planned: 10, recorded: 16.2, fmt: (n: number) => `${Math.round(n)}h` },
  ];
  return (
    <div
      ref={ref}
      className="card w-full max-w-md p-6"
      aria-label="Example plan-versus-recorded summary"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Your four weeks</p>
        <span className="rounded-full bg-softblue px-2.5 py-1 text-[11px] font-semibold text-navy/70">
          Example data
        </span>
      </div>
      <ul className="mt-5 space-y-4">
        {rows.map((r, i) => {
          const max = Math.max(r.planned, r.recorded);
          const bars = [
            { key: "planned", value: r.planned, color: "bg-teal/70", weight: "font-medium" },
            { key: "recorded", value: r.recorded, color: "bg-blue", weight: "font-semibold" },
          ];
          return (
            <li key={r.label}>
              <p className="text-sm font-medium text-navy/75">{r.label}</p>
              <div className="mt-2 space-y-1.5">
                {bars.map((b, bi) => (
                  <div key={b.key} className="flex items-center gap-2.5">
                    <span className="w-16 flex-none text-[11px] text-navy/50">{b.key}</span>
                    <span className="h-2 flex-1 rounded-full bg-softblue/60" aria-hidden="true">
                      <span
                        className={`bar-grow ${inView ? "bar-grow-in" : ""} block h-2 rounded-full ${b.color}`}
                        style={{
                          width: `${(b.value / max) * 100}%`,
                          transitionDelay: `${i * 110 + bi * 90}ms`,
                        }}
                      />
                    </span>
                    <span
                      className={`w-16 flex-none text-right text-[11px] tabular-nums ${b.weight}`}
                    >
                      {r.fmt(b.value)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-navy/55">
        Factual, side by side, in your own words. No score. No judgment.
      </p>
    </div>
  );
}

/**
 * The four steps, each with its own generated mark. The connector line draws
 * itself once the row is on screen, echoing the guardrail in the logo.
 */
function StepsRow() {
  const { ref, inView } = useInView<HTMLOListElement>();
  return (
    <ol ref={ref} className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      <span
        className={`line-draw ${inView ? "line-draw-in" : ""} absolute left-0 right-0 top-[13px] hidden h-px bg-navy/20 lg:block`}
        aria-hidden="true"
      />
      {landing.howItWorks.steps.map((s, i) => (
        <li
          key={s.key}
          className={`reveal ${inView ? "reveal-in" : ""} relative flex flex-col lg:px-3`}
          style={{ transitionDelay: `${250 + i * 130}ms` }}
        >
          <span className="relative mb-5 flex h-[27px] items-center justify-start">
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full border border-navy/20 bg-cream text-[11px] font-semibold text-navy/60">
              0{i + 1}
            </span>
          </span>
          <img
            src={stepArt[s.key]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={130}
            height={130}
            className="mb-4 h-[104px] w-[104px] rounded-xl border border-line bg-white object-contain p-1"
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">{s.when}</p>
          <h3 className="mt-1.5 font-serif text-2xl font-semibold">{s.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/65">{s.body}</p>
          <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-sm font-medium">
            <Check className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
            {s.youGet}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function Landing() {
  return (
    <>
      {/* ---------------- 1. Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70rem 36rem at 88% -15%, #DCE8FA 0%, transparent 58%), radial-gradient(50rem 28rem at -10% 60%, #DDF1E8 0%, transparent 55%)",
          }}
          aria-hidden="true"
        />
        <div className="container-page relative pb-10 pt-14 sm:pb-12 sm:pt-16">
          <p className="eyebrow rise-in">{landing.heroEyebrow}</p>
          {/*
            The headline spans the full container so each sentence lands on its
            own line instead of breaking mid-phrase. text-balance evens out the
            wrap on narrow screens where a sentence still needs two lines.
          */}
          {/*
            Fluid size tuned so each sentence stays on one line at every width
            down to about 610px, where the container finally runs out of room.
          */}
          <h1 className="rise-in rise-in-delay-1 mt-4 font-serif text-[clamp(1.95rem,5vw,3.4rem)] font-semibold leading-[1.12] tracking-tight">
            <span className="block text-balance">{brand.heroHeadline.lead}</span>
            <span className="block text-balance text-blue">{brand.heroHeadline.emphasis}</span>
          </h1>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-xl">
              <p className="rise-in rise-in-delay-2 text-lg leading-relaxed text-navy/70">
                {brand.positioning}
              </p>
              <div className="rise-in rise-in-delay-2 mt-7 flex flex-wrap items-center gap-3">
                <Link to="/demo" className="btn-primary">
                  {landing.heroCtas.primary}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href="#how-it-works" className="btn-secondary">
                  {landing.heroCtas.secondary}
                </a>
              </div>
              {/* Naming the categories up front: prediction markets in particular
                  sit outside the reach of helplines and state self-exclusion. */}
              <ul className="mt-6 flex flex-wrap gap-2">
                {brand.coverage.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-medium text-navy/70"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-navy/50">
                Adults only. No account, no email, no payment. Free support options always come
                first.
              </p>
            </div>
            <div className="rise-in rise-in-delay-2 flex justify-center lg:justify-end">
              <PlanPreviewCard />
            </div>
          </div>
        </div>
        {/*
          A thin band cropped to the artwork's horizon line, which carries the
          same boundary motif as the logo. Cropped above the dark water so it
          never reads as a stray dark bar, and faded at both edges.
        */}
        <div className="relative h-24 overflow-hidden sm:h-28" aria-hidden="true">
          <img
            src={asset("assets/hero.webp")}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, #F8F7F3 0%, rgba(248,247,243,0) 45%, rgba(255,255,255,0) 60%, #FFFFFF 100%)",
            }}
          />
        </div>
      </section>

      {/* ---------------- 2. What it actually is ---------------- */}
      <section id="what-it-is" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <p className="eyebrow">{landing.whatItIs.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {landing.whatItIs.title}
            </h2>
            <p className="mt-4 text-lg text-navy/70">{landing.whatItIs.lead}</p>
            <div className="mt-5 space-y-4">
              {landing.whatItIs.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="leading-relaxed text-navy/75">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120} className="self-start">
            <img
              src={asset("assets/mirror.webp")}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="mb-4 w-full rounded-xl border border-line"
            />
            <div className="rounded-2xl border border-line bg-cream p-7">
              <h3 className="font-serif text-xl font-semibold">{landing.whatItIs.notList.title}</h3>
              <ul className="mt-4 space-y-3">
                {landing.whatItIs.notList.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <Ban className="mt-0.5 h-4 w-4 flex-none text-caution/70" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-navy/65">
                {brand.plainSummary}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 3. How it works: process, deliverables and rhythm in one ---------------- */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-cream py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{landing.howItWorks.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {landing.howItWorks.title}
            </h2>
            <p className="mt-4 text-navy/70">{landing.howItWorks.intro}</p>
          </div>

          <StepsRow />

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link to="/demo" className="btn-primary">
              {landing.heroCtas.primary}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/demo/report" className="btn-secondary">
              Skip to a finished report
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 4. The regulatory gap ---------------- */}
      <section className="border-b border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">{landing.gap.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {landing.gap.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-navy/70">{landing.gap.intro}</p>
          </Reveal>

          {/* Two regimes side by side, split by a rule, echoing the governance firewall. */}
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-navy/10 lg:grid-cols-2">
            {landing.gap.columns.map((col, ci) => (
              <Reveal key={col.heading} delay={ci * 120} className="bg-cream p-7">
                <h3 className="font-serif text-xl font-semibold leading-snug">{col.heading}</h3>
                <ul className="mt-5 space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-navy/70">
                      {ci === 0 ? (
                        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
                      ) : (
                        <Ban className="mt-0.5 h-4 w-4 flex-none text-caution/70" aria-hidden="true" />
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160} className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <p className="rounded-xl border-l-4 border-l-caution/50 bg-cream px-6 py-5 text-base leading-relaxed">
              {landing.gap.consequence}
            </p>
            <p className="rounded-xl bg-navy px-6 py-5 text-base leading-relaxed text-cream">
              {landing.gap.role}
            </p>
          </Reveal>

          <p className="mt-5 max-w-3xl text-xs leading-relaxed text-navy/55">
            {landing.gap.caveat}
          </p>
        </div>
      </section>

      {/* ---------------- 5. Who it is for ---------------- */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{landing.whoItsFor.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {landing.whoItsFor.title}
            </h2>
            <p className="mt-3 text-lg text-navy/70">{landing.whoItsFor.intro}</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
            {landing.whoItsFor.personas.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} className="bg-white p-6">
                <span className="text-xs font-semibold text-navy/35">0{i + 1}</span>
                <h3 className="mt-2 font-serif text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/65">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 6. Benefits: the payoff ---------------- */}
      <section className="bg-navy py-16 text-cream sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow text-softgreen">{landing.benefits.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {landing.benefits.title}
            </h2>
            <p className="mt-4 leading-relaxed text-cream/70">{landing.benefits.intro}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {landing.benefits.items.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <Reveal
                  key={b.title}
                  delay={i * 80}
                  className="lift rounded-xl border border-cream/15 bg-cream/[0.06] p-6"
                >
                  <Icon className="h-5 w-5 text-softgreen" aria-hidden="true" />
                  <h3 className="mt-3.5 font-serif text-lg font-semibold leading-snug">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">{b.body}</p>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10">
            <Link
              to="/demo"
              className="btn inline-flex bg-cream px-5 py-3 text-navy hover:bg-white"
            >
              {landing.heroCtas.primary}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 7. Trust: never-does, privacy, and what we measure ---------------- */}
      <section className="border-b border-line bg-cream py-16 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{landing.trust.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {landing.trust.title}
            </h2>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {landing.trust.neverDoes.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3.5 text-sm font-medium"
              >
                <Ban className="h-4 w-4 flex-none text-caution/70" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-7">
              <Lock className="h-5 w-5 text-teal" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-xl font-semibold">
                {landing.trust.privacy.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {landing.trust.privacy.items.map((t) => (
                  <li key={t.slice(0, 20)} className="flex gap-2.5 text-sm leading-relaxed text-navy/70">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                to="/trust"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue hover:underline"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export or delete your data
              </Link>
            </div>

            <div className="rounded-xl border border-line bg-white p-7">
              <Scale className="h-5 w-5 text-teal" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-xl font-semibold">
                {landing.trust.outcomes.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy/70">
                {landing.trust.outcomes.intro}
              </p>
              <ul className="mt-4 space-y-2">
                {landing.trust.outcomes.items.map((t) => (
                  <li key={t.slice(0, 20)} className="flex gap-2.5 text-sm text-navy/65">
                    <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-teal" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 8. For organizations, compact ---------------- */}
      <section className="border-b border-line bg-softblue/30 py-12">
        <div className="container-page flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">{landing.organizations.eyebrow}</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
              {landing.organizations.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">
              {landing.organizations.intro}
            </p>
          </div>
          <div className="lg:text-right">
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {landing.organizations.audiences.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-navy/70"
                >
                  {a}
                </li>
              ))}
            </ul>
            <Link to="/for-organizations" className="btn-secondary mt-4 bg-white">
              Explore institutional products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 9. Final CTA ---------------- */}
      <section className="py-16 sm:py-20">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {landing.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-navy/70">{landing.finalCta.body}</p>
          <Link to="/demo" className="btn-primary mt-7">
            {landing.heroCtas.primary}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
