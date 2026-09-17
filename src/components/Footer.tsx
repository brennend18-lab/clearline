import { Link } from "react-router-dom";
import { adultsOnlyNotice, brand, navLinks, supportResources } from "../config/brand";
import { Logo } from "./Logo";
import { SupportButton } from "./SupportPanel";

export function Footer() {
  const g = supportResources.gambling;
  return (
    <footer className="mt-24 border-t border-line bg-navy text-cream">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            {brand.tagline}
          </p>
          <p className="mt-4 text-xs text-cream/50">
            "{brand.name}" is a working name and has not been cleared for legal
            or trademark use.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cream/60">
            Explore
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-cream/80 hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/demo" className="text-cream/80 hover:text-cream">
                Try the demo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cream/60">
            If you want help now
          </h3>
          <ul className="mt-3 space-y-3 text-sm text-cream/80">
            <li>
              {g.methods} with the {g.name}:{" "}
              <a href="tel:18006973738" className="font-semibold text-cream underline underline-offset-2">
                {g.phraseNumber} ({g.digitsNumber})
              </a>
              . {g.note}
            </li>
            <li>
              {supportResources.crisis.label}: {supportResources.crisis.methods}{" "}
              <a href="tel:988" className="font-semibold text-cream underline underline-offset-2">
                {supportResources.crisis.number}
              </a>
              .
            </li>
            <li>
              {supportResources.emergency.label}: {supportResources.emergency.methods}{" "}
              <a href="tel:911" className="font-semibold text-cream underline underline-offset-2">
                {supportResources.emergency.number}
              </a>
              .
            </li>
          </ul>
          <div className="mt-4 rounded-lg bg-cream/10 p-1 [&_button]:text-cream/90 [&_button:hover]:bg-cream/10 [&_button:hover]:text-cream">
            <SupportButton />
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>{adultsOnlyNotice}</p>
          <p>Prototype. No real accounts, payments, or data collection.</p>
        </div>
      </div>
    </footer>
  );
}
