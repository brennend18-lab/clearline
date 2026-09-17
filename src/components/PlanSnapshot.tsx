import type { PlanComparison } from "../lib/calculations";
import { buildSummarySentence, buildSummaryTiles } from "../lib/summary";

/**
 * The live report snapshot.
 *
 * The investor deck renders this exact component against the same seed data
 * and the same calculation functions the product uses, so the "product demo"
 * slide cannot drift away from the real product.
 */
export function PlanSnapshot({
  comparison,
  compact = false,
}: {
  comparison: PlanComparison;
  compact?: boolean;
}) {
  const sentence = buildSummarySentence(comparison);
  const tiles = buildSummaryTiles(comparison);

  return (
    <div className={compact ? "" : "max-w-2xl"}>
      <p className={compact ? "leading-relaxed" : "text-lg leading-relaxed"}>
        {sentence}{" "}
        <span className="font-semibold">What would you like to do next?</span>
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-line bg-white px-3 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{t.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{t.recorded}</p>
            <p className="mt-0.5 text-[11px] text-navy/50">
              {t.planned === "not planned" ? "not planned" : `planned ${t.planned}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
