import { useState } from "react";
import {
  Database,
  Download,
  FileWarning,
  HandHeart,
  PenLine,
  Scale,
  ShieldCheck,
  Siren,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { brand, supportResources } from "../config/brand";
import { disclaimers } from "../content";
import { useDemoState } from "../lib/useDemoState";

interface TrustItem {
  icon: LucideIcon;
  title: string;
  body: string[];
}

const items: TrustItem[] = [
  {
    icon: Database,
    title: "What this prototype stores, and where",
    body: [
      "Your plan, your log entries, and your privacy choices, stored in your browser's local storage on this device only.",
      "No account, no server, no cookies for tracking, and no transmission of personal information anywhere.",
    ],
  },
  {
    icon: PenLine,
    title: "Why manual entry comes first",
    body: [
      "Manual logging keeps you in control of what exists at all. Nothing is captured about you silently.",
      "It also keeps the product honest: your report reflects what you chose to record, and says so.",
    ],
  },
  {
    icon: UserCheck,
    title: "How real import consent would work",
    body: [
      "If a future version offered read-only account imports, each connection would require separate, revocable consent naming the source, the exact fields, and the retention period.",
      "Imports would never be a condition of using the product. In this demo, imports are simulated and clearly labeled as not connected.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "No advertising use",
    body: [
      "No advertising pixels, no retargeting, no audience uploads, no lead resale, no third-party behavior tracking.",
      "Nothing about your gambling activity is ever used to target you with anything.",
    ],
  },
  {
    icon: Scale,
    title: "Clinical versus nonclinical roles",
    body: [
      `${brand.name} is a nonclinical product: education, reflection, and navigation.`,
      "Assessment, diagnosis, and treatment belong to licensed professionals. When those are what you need, our job is a clean handoff, not a substitute.",
    ],
  },
  {
    icon: FileWarning,
    title: "Limitations of screening and AI",
    body: [
      "No score in this product is a diagnosis, and no AI feature may diagnose, assess crisis risk on its own, determine a level of care, or create a treatment plan.",
      "Calculations in your report are simple, visible arithmetic. You can open \"How this was calculated\" and check every number.",
    ],
  },
  {
    icon: Siren,
    title: "Safety and crisis escalation",
    body: [
      `Crisis resources are always one tap away: the ${supportResources.gambling.name} at ${supportResources.gambling.phraseNumber} (${supportResources.gambling.digitsNumber}), which is not an emergency service, plus ${supportResources.crisis.number} for suicide or emotional crisis and ${supportResources.emergency.number} for immediate physical danger.`,
      "The support control stays calm and persistent in the header and footer; it never uses alarm to get attention.",
    ],
  },
  {
    icon: HandHeart,
    title: "Independence and conflicts",
    body: [
      "No revenue from picks, odds, or gambling affiliates. No compensation tied to deposits, wagers, losses, retention, reactivation, exclusion, or treatment conversion.",
      "Institutional purchasers buy workflow and aggregate insight, never influence over what an individual sees or is advised.",
    ],
  },
];

export function Trust() {
  return (
    <>
      <section className="border-b border-line bg-softgreen/30 py-16 sm:py-20">
        <div className="container-page max-w-3xl">
          <p className="eyebrow rise-in">Trust</p>
          <h1 className="rise-in rise-in-delay-1 mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Boundaries we hold for ourselves
          </h1>
          <p className="rise-in rise-in-delay-2 mt-5 text-lg leading-relaxed text-navy/70">
            A product about personal boundaries should be explicit about its
            own. This page is the whole list, with no fine print elsewhere.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.title} className="card p-7">
              <it.icon className="h-5 w-5 text-teal" aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold">{it.title}</h2>
              {it.body.map((p) => (
                <p key={p.slice(0, 24)} className="mt-2 text-sm leading-relaxed text-navy/65">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <h2 className="font-serif text-3xl font-semibold">Your data controls</h2>
          <p className="mt-3 text-sm text-navy/65">
            These work right now, on the demo data in your browser.
          </p>
          <DataControls />
          <div className="mt-12 rounded-xl border border-line bg-cream p-6">
            <p className="text-sm leading-relaxed text-navy/75">
              <strong>Plain language:</strong> {brand.name} is not currently an
              emergency service and is not a replacement for licensed care.{" "}
              {disclaimers.educational}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function DataControls() {
  const { exportJson, deleteAll, state } = useDemoState();
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const hasData = state.plan !== null || state.entries.length > 0;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button type="button" className="btn-secondary" onClick={exportJson}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Export demo data as JSON
      </button>
      {!confirming ? (
        <button
          type="button"
          className="btn border border-caution/40 text-caution hover:bg-caution/5"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete all local demo data
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-caution/40 bg-caution/5 px-4 py-2">
          <span className="text-sm font-medium text-caution">Delete everything on this device?</span>
          <button
            type="button"
            className="rounded-md bg-caution px-3 py-1.5 text-sm font-semibold text-white"
            onClick={() => {
              deleteAll();
              setConfirming(false);
              setDeleted(true);
            }}
          >
            Yes, delete
          </button>
          <button type="button" className="rounded-md px-3 py-1.5 text-sm" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      )}
      <p role="status" className="self-center text-sm text-navy/60">
        {deleted && !hasData ? "All local demo data deleted." : null}
      </p>
    </div>
  );
}
