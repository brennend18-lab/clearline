import { useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { navLinks, primaryCta } from "../config/brand";
import { Logo } from "./Logo";
import { SupportButton } from "./SupportPanel";

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isHash = to.includes("#");
  if (isHash) {
    const active = location.pathname === "/" && location.hash === to.slice(1);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`rounded-md px-3 py-2 text-sm transition-colors ${
          active ? "text-navy" : "text-navy/70 hover:bg-navy/5 hover:text-navy"
        }`}
      >
        {label}
      </Link>
    );
  }
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm transition-colors ${
          isActive ? "bg-navy/5 font-medium text-navy" : "text-navy/70 hover:bg-navy/5 hover:text-navy"
        }`
      }
    >
      {label}
    </RouterNavLink>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="rounded-md" aria-label="Clearline home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <SupportButton />
          <Link to={primaryCta.to} className="btn-primary py-2.5">
            {primaryCta.label}
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <SupportButton />
          <button
            type="button"
            className="rounded-md p-2 text-navy hover:bg-navy/5"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-line bg-cream px-5 pb-4 pt-2 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col">
            {navLinks.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} onClick={() => setMobileOpen(false)} />
            ))}
            <Link
              to={primaryCta.to}
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-3 w-full"
            >
              {primaryCta.label}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
