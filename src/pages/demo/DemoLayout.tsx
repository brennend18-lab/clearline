import { NavLink, Outlet } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { adultsOnlyNotice } from "../../config/brand";
import { useDemoState } from "../../lib/useDemoState";

const tabs = [
  { to: "/demo", label: "Plan", end: true },
  { to: "/demo/log", label: "Log" },
  { to: "/demo/report", label: "Report" },
  { to: "/demo/actions", label: "Actions" },
];

export function DemoLayout() {
  const { resetDemo } = useDemoState();
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Demo sections" className="flex flex-wrap gap-1 rounded-lg border border-line bg-white p-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm transition-colors ${
                  isActive ? "bg-navy text-cream" : "text-navy/70 hover:bg-navy/5"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={resetDemo} className="btn-quiet text-xs">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset demo
        </button>
      </div>
      <p className="mt-3 text-xs text-navy/50">{adultsOnlyNotice}</p>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
