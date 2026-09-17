import type { PlanComparison } from "./calculations";
import { formatCents } from "./format";

/**
 * The factual plan-versus-recorded sentence.
 *
 * This is the single source of that sentence for BOTH the product report and
 * the investor deck, so the deck cannot drift away from what the product
 * actually says. It is a pure function, and it is unit tested.
 *
 * It states only arithmetic. It never characterizes the person.
 */
export function buildSummarySentence(c: PlanComparison): string {
  const planned = formatCents(c.plannedWageredCents);
  const recorded = formatCents(c.recordedWageredCents);

  let wageredClause: string;
  if (c.wageredDifferenceCents > 0) {
    wageredClause = `, which is ${formatCents(c.wageredDifferenceCents)} above your plan.`;
  } else if (c.wageredDifferenceCents === 0) {
    wageredClause = ", exactly at your plan.";
  } else {
    wageredClause = `, which is ${formatCents(Math.abs(c.wageredDifferenceCents))} under your plan.`;
  }

  const daysClause =
    c.recordedDays === c.plannedDays
      ? ` You recorded gambling on ${c.recordedDays} days, matching the ${c.plannedDays} you selected.`
      : ` You also recorded gambling on ${c.recordedDays} days instead of the ${c.plannedDays} you selected.`;

  return (
    `You planned to wager no more than ${planned} over four weeks. ` +
    `You recorded ${recorded}${wageredClause}` +
    daysClause +
    " Your entries may be incomplete."
  );
}

/** Compact "planned vs recorded" tiles shared by the report and the deck. */
export interface SummaryTile {
  label: string;
  planned: string;
  recorded: string;
}

export function buildSummaryTiles(c: PlanComparison): SummaryTile[] {
  return [
    {
      label: "Wagered",
      planned: formatCents(c.plannedWageredCents),
      recorded: formatCents(c.recordedWageredCents),
    },
    {
      label: "Days",
      planned: `${c.plannedDays}`,
      recorded: `${c.recordedDays}`,
    },
    {
      label: "Net result",
      planned: "not planned",
      recorded: formatCents(c.netResultCents, { sign: true }),
    },
  ];
}
