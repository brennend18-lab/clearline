import { useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  Scale,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { brand } from "../config/brand";
import { Section } from "../components/Section";
import { asset } from "../lib/asset";

const products = [
  {
    icon: Stethoscope,
    title: "Provider workflow",
    body: "Consent management, patient education, between-session reflection, referral follow-through, and outcomes tracking that fits into existing clinical practice.",
  },
  {
    icon: Building2,
    title: "Employer / EAP benefit",
    body: "Confidential education and navigation for employees, with aggregate reporting only. No employer ever sees an individual's activity.",
  },
  {
    icon: GraduationCap,
    title: "University prevention",
    body: "Campus education, staff training, and private opt-in access for students. No student lead lists, ever.",
  },
  {
    icon: Scale,
    title: "Operator / state player protection",
    body: "Independent tools, referral pathways, and aggregate evaluation, without identifiable support data flowing back to any operator or state.",
  },
];

const firewall = [
  "No identifiable consumer support data is shared with an employer, university, operator, or financial institution.",
  "No compensation is tied to deposits, wagers, losses, exclusion, retention, reactivation, or treatment conversion.",
  "Clinical judgment remains independent from commercial purchasers.",
];

export function ForOrganizations() {
  return (
    <>
      <section className="border-b border-line bg-softblue/30 py-16 sm:py-20">
        <div className="container-page max-w-3xl">
          <p className="eyebrow rise-in">For organizations</p>
          <h1 className="rise-in rise-in-delay-1 mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Independent support your people will actually trust
          </h1>
          <p className="rise-in rise-in-delay-2 mt-5 text-lg leading-relaxed text-navy/70">
            {brand.name} is purchased by institutions and used privately by
            individuals. That separation is the product: people engage because
            nothing they share flows back to whoever pays.
          </p>
        </div>
      </section>

      <Section eyebrow="Four recurring products" title="Built for the institutions that already carry the cost" tone="cream">
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-navy/10 sm:grid-cols-2">
          {products.map((p) => (
            <div key={p.title} className="bg-white p-8">
              <p.icon className="h-6 w-6 text-teal" aria-hidden="true" />
              <h3 className="mt-4 font-serif text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Governance"
        title="A visible firewall, not a promise buried in terms"
        intro="Individual support data lives on one side. Institutional reporting lives on the other. Aggregates cross; identities never do."
        tone="white"
      >
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <figure>
            <img
              src={asset("assets/governance.webp")}
              alt="Diagram: a protected individual node separated by a firewall line from a grid of anonymous aggregate dots"
              className="w-full rounded-xl border border-line shadow-calm"
            />
            <figcaption className="mt-3 flex justify-between px-2 text-xs text-navy/55">
              <span>Individual support data, protected</span>
              <span>Aggregate, de-identified reporting</span>
            </figcaption>
          </figure>
          <ul className="space-y-4">
            {firewall.map((f) => (
              <li key={f} className="flex gap-3 rounded-lg border border-line bg-cream p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal" aria-hidden="true" />
                <p className="text-sm leading-relaxed">{f}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        eyebrow="Pilot"
        title="Request a pilot"
        intro="Tell us about your organization. This demo form does not send anything. It simply shows the flow."
        tone="cream"
      >
        <PilotForm />
      </Section>
    </>
  );
}

function PilotForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card mt-10 max-w-2xl p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-2xl font-semibold">Received, locally</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy/65">
          This is a demo: nothing was sent anywhere. In the real product, our
          partnerships team would follow up within two business days.
        </p>
        <button type="button" className="btn-secondary mt-6 text-sm" onClick={() => setSubmitted(false)}>
          Fill it out again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mt-10 max-w-2xl p-8" aria-label="Request a pilot (demo form)">
      <p className="rounded-lg bg-softblue/50 px-4 py-2.5 text-xs font-medium text-navy/70">
        Demo form. Nothing is submitted or stored outside this page.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="org-type" className="field-label">Organization type</label>
          <select id="org-type" className="field-input" defaultValue="">
            <option value="" disabled>Select one…</option>
            <option>Healthcare provider</option>
            <option>Employer / EAP</option>
            <option>University</option>
            <option>Operator / state program</option>
            <option>Financial institution</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="org-name" className="field-label">Your name</label>
          <input id="org-name" type="text" className="field-input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="org-role" className="field-label">Role</label>
          <input id="org-role" type="text" className="field-input" autoComplete="organization-title" />
        </div>
        <div>
          <label htmlFor="org-email" className="field-label">Work email</label>
          <input id="org-email" type="email" className="field-input" autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="org-pop" className="field-label">Estimated eligible population</label>
          <input id="org-pop" type="text" className="field-input" placeholder="e.g. 2,500 employees" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="org-msg" className="field-label">Message</label>
          <textarea id="org-msg" rows={4} className="field-input" placeholder="What would a successful pilot look like for you?" />
        </div>
      </div>
      <button type="submit" className="btn-primary mt-6">
        Request a pilot
      </button>
    </form>
  );
}
