/**
 * Central financial assumptions for the pitch deck and enterprise pages.
 *
 * Every figure here is a PLANNING ASSUMPTION for an illustrative scenario.
 * None of it describes actual results. Wherever these values render, the UI
 * shows an "Illustrative only" label, and footnotes say:
 * "Planning assumption. Validate through real cohorts and contracts."
 */

export const ILLUSTRATIVE_LABEL = "Illustrative only";
export const ASSUMPTION_FOOTNOTE =
  "Planning assumption. Validate through real cohorts and contracts.";

export interface RevenueYear {
  year: number;
  consumer: number;
  provider: number;
  employerEduUniversity: number;
  operatorState: number;
}

/** Five-year recurring-revenue scenario (USD, annual recurring revenue). */
export const revenueScenario: RevenueYear[] = [
  { year: 1, consumer: 182_400, provider: 60_000, employerEduUniversity: 100_000, operatorState: 150_000 },
  { year: 2, consumer: 684_000, provider: 250_000, employerEduUniversity: 420_000, operatorState: 600_000 },
  { year: 3, consumer: 1_482_000, provider: 750_000, employerEduUniversity: 1_020_000, operatorState: 1_500_000 },
  { year: 4, consumer: 1_824_000, provider: 1_137_500, employerEduUniversity: 1_520_000, operatorState: 2_200_000 },
  { year: 5, consumer: 2_280_000, provider: 1_750_000, employerEduUniversity: 2_500_000, operatorState: 3_600_000 },
];

export function yearTotal(y: RevenueYear): number {
  return y.consumer + y.provider + y.employerEduUniversity + y.operatorState;
}

export const planningFigures = {
  /** Year-five modeled blended gross margin. */
  yearFiveBlendedGrossMargin: 0.76,
  /** Illustrative valuation multiple applied to year-five recurring revenue. */
  illustrativeMultiple: 5,
  /** Illustrative 5x year-five recurring-revenue value (USD). */
  illustrativeYearFiveValue: 50_650_000,
  /** Consumer subscription test price per month (USD). */
  consumerTestPriceMonthly: 19,
  /** Consumer membership price band shown on the business-model slide. */
  consumerPriceBand: "$12–$19/month",
  /** Illustrative consumer gross-profit LTV/CAC multiple. */
  consumerLtvToCac: 3.9,
  /** Illustrative app-to-$5,000-program acquisition cost before sales labor (USD). */
  programAcquisitionCost: 6_222,
  /** Illustrative $5,000-program post-acquisition contribution margin. */
  programContributionMargin: 0.289,
} as const;

/** Sourced market-signal figures for the deck. Label limitations visibly. */
export const marketSignals = {
  frequentIndicatorAdults:
    "Almost 20 million U.S. adults reported at least one frequent problematic-gambling indicator",
  frequentIndicatorSource: "NCPG National Survey of Gambling Attitudes and Gambling Experiences",
  helplineContacts: "377,410 national helpline contacts in 2025",
  helplineSource: "National Problem Gambling Helpline network reporting",
  financialStruggles:
    "73.32% of the available contact-detail sample cited financial struggles",
  financialStrugglesSource:
    "Helpline contact-detail subsample; many contacts have no recorded detail",
  limitations:
    "Survey indicators are self-reported and are not diagnoses. Helpline contacts include family members and repeat contacts. The financial-struggles share reflects only the sample with recorded details.",
} as const;
