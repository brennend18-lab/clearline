import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  Building2,
  Check,
  Clock3,
  HeartHandshake,
  Landmark,
  MessageCircle,
  PauseCircle,
  PenLine,
  Phone,
  ShieldAlert,
  Smartphone,
  Stethoscope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supportResources } from "../../config/brand";
import { disclaimers } from "../../content";
import { SupportDialog } from "../../components/SupportPanel";
import { useDemoState } from "../../lib/useDemoState";
import { formatDateShort } from "../../lib/format";

interface ActionCard {
  icon: LucideIcon;
  title: string;
  benefit: string;
  limitation: string;
  cta?: { label: string; to: string };
  free: boolean;
}

const g = supportResources.gambling;

const cards: ActionCard[] = [
  {
    icon: PenLine,
    title: "Revise the plan",
    benefit:
      "Adjust your numbers so the next four weeks match what you actually want. Your current plan loads in, ready to edit.",
    limitation: "A plan is a personal boundary, not a control. It only works with your attention.",
    cta: { label: "Edit plan", to: "/demo" },
    free: true,
  },
  {
    icon: Clock3,
    title: "Use operator account limits",
    benefit: "Most licensed operators offer deposit, loss, and time limits inside their own apps.",
    limitation: "Limits apply per operator. Clearline cannot set or enforce them for you.",
    free: true,
  },
  {
    icon: Ban,
    title: "Learn about state self-exclusion",
    benefit:
      "Every regulated state offers a formal program to exclude yourself from licensed operators.",
    limitation:
      "Programs differ by state, take time to process, and are managed by the state, not by Clearline.",
    free: true,
  },
  {
    icon: Smartphone,
    title: "Add a device blocker",
    benefit: "Independent blocking software can restrict gambling apps and sites across your devices.",
    limitation: "Blockers are third-party tools with their own costs and coverage gaps.",
    free: false,
  },
  {
    icon: Landmark,
    title: "Explore banking safeguards",
    benefit: "Many banks and cards let you block or limit gambling transactions on request.",
    limitation: "Coverage varies by institution, and merchant coding is imperfect.",
    free: true,
  },
  {
    icon: HeartHandshake,
    title: "Talk with an affected-family resource",
    benefit:
      "Support designed for partners and family members of people who gamble, on your own terms.",
    limitation: "Family resources support you. They cannot change another adult's behavior.",
    free: true,
  },
  {
    icon: Users,
    title: "Find peer support",
    benefit: "People with lived experience, in person or online, at no cost.",
    limitation: "Peer support is community, not clinical care.",
    free: true,
  },
  {
    icon: MessageCircle,
    title: `Call, text, or chat with ${g.phraseNumber}`,
    benefit: `The ${g.name} (${g.digitsNumber}) is free, confidential, and open 24/7.`,
    limitation: "It is not an emergency service.",
    free: true,
  },
  {
    icon: Stethoscope,
    title: "Find a licensed professional",
    benefit:
      "A licensed professional can assess, diagnose where appropriate, and treat, which are things this product never does.",
    limitation: "Cost and availability vary. Directories and insurance can help you narrow it down.",
    free: false,
  },
];

const PAUSE_OPTIONS = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "30 days", days: 30 },
];

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** A real, self-directed pause written into the user's own plan. Enforces nothing. */
function PauseCard() {
  const { state, setPause } = useDemoState();
  const [open, setOpen] = useState(false);
  const pauseUntil = state.plan?.pauseUntil ?? null;
  const hasPlan = state.plan !== null;

  return (
    <div className="card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-softblue text-blue">
          <PauseCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-softgreen px-2.5 py-1 text-[11px] font-semibold text-teal">
          Free
        </span>
      </div>
      <h2 className="mt-4 text-base font-semibold">Take a temporary pause</h2>

      {pauseUntil ? (
        <>
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed">
            <Check className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
            <span>
              Pause set through <strong>{formatDateShort(pauseUntil)}</strong>. It shows on your
              report until then.
            </span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-navy/55">
            <span className="font-semibold">Limits:</span> {disclaimers.pauseIsANote}
          </p>
          <button
            type="button"
            className="mt-4 self-start text-sm font-semibold text-blue hover:underline"
            onClick={() => setPause(null)}
          >
            End the pause
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-navy/70">
            Decide on a break, write it down, and see it on your report for as long as it lasts.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-navy/55">
            <span className="font-semibold">Limits:</span> {disclaimers.pauseIsANote}
          </p>
          {!hasPlan ? (
            <Link to="/demo" className="mt-4 self-start text-sm font-semibold text-blue hover:underline">
              Set up a plan first
            </Link>
          ) : !open ? (
            <button
              type="button"
              className="mt-4 self-start text-sm font-semibold text-blue hover:underline"
              onClick={() => setOpen(true)}
            >
              Set a pause
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-xs font-medium text-navy/70">How long?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PAUSE_OPTIONS.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    className="rounded-lg border border-line-strong px-3 py-1.5 text-sm hover:bg-softblue/50"
                    onClick={() => {
                      setPause(addDaysIso(o.days));
                      setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm text-navy/60 hover:bg-navy/5"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Actions() {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-semibold">Your options, side by side</h1>
      <p className="mt-3 max-w-2xl text-sm text-navy/65">
        Every card explains what an option can do and what it cannot. Free options are always shown,
        and nothing here is a sales pitch. {disclaimers.notEnforcement}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Revise the plan comes first, then the working pause control. */}
        {cards.slice(0, 1).map((c) => (
          <ActionCardView key={c.title} card={c} />
        ))}
        <PauseCard />
        {cards.slice(1).map((c) => (
          <ActionCardView key={c.title} card={c} />
        ))}

        {/* Crisis panel card */}
        <div className="card flex flex-col border-caution/25 p-6 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-caution/10 text-caution">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold">
                  Crisis support: {supportResources.crisis.number} / {supportResources.emergency.number}
                </h2>
                <p className="mt-1 text-sm text-navy/70">
                  {supportResources.crisis.label}: {supportResources.crisis.methods}{" "}
                  {supportResources.crisis.number}. {supportResources.emergency.label}:{" "}
                  {supportResources.emergency.methods} {supportResources.emergency.number}.
                </p>
              </div>
            </div>
            <button type="button" className="btn-secondary text-sm" onClick={() => setCrisisOpen(true)}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Open the crisis panel
            </button>
          </div>
        </div>

        {/* Enterprise pointer, deliberately last and quiet */}
        <div className="rounded-xl border border-dashed border-line-strong p-6 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-3 text-sm text-navy/65">
              <Building2 className="h-4 w-4 text-teal" aria-hidden="true" />
              Employers, universities, providers, and operators can offer Clearline confidentially.
            </p>
            <Link to="/for-organizations" className="text-sm font-semibold text-blue hover:underline">
              For organizations
            </Link>
          </div>
        </div>
      </div>

      {crisisOpen && <SupportDialog onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}

function ActionCardView({ card }: { card: ActionCard }) {
  return (
    <div className="card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-softblue text-blue">
          <card.icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {card.free && (
          <span className="rounded-full bg-softgreen px-2.5 py-1 text-[11px] font-semibold text-teal">
            Free
          </span>
        )}
      </div>
      <h2 className="mt-4 text-base font-semibold">{card.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/70">{card.benefit}</p>
      <p className="mt-2 text-xs leading-relaxed text-navy/55">
        <span className="font-semibold">Limits:</span> {card.limitation}
      </p>
      {card.cta && (
        <Link
          to={card.cta.to}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue hover:underline"
        >
          {card.cta.label}
        </Link>
      )}
    </div>
  );
}
