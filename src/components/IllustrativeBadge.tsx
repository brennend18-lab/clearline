import { Info } from "lucide-react";
import { ASSUMPTION_FOOTNOTE, ILLUSTRATIVE_LABEL } from "../data/financials";

/** Visible label required wherever financial assumptions render. */
export function IllustrativeBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        dark
          ? "border-cream/25 bg-cream/10 text-cream/80"
          : "border-caution/30 bg-caution/5 text-caution"
      }`}
      title={ASSUMPTION_FOOTNOTE}
    >
      <Info className="h-3 w-3" aria-hidden="true" />
      {ILLUSTRATIVE_LABEL}
    </span>
  );
}

export function AssumptionFootnote({ dark = false }: { dark?: boolean }) {
  return (
    <p className={`mt-3 text-xs ${dark ? "text-cream/55" : "text-navy/55"}`}>
      {ASSUMPTION_FOOTNOTE}
    </p>
  );
}
