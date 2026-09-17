/** Typed data model for the personal plan and activity entries. */

export type GoalId =
  | "understand"
  | "spend-less"
  | "take-a-break"
  | "stop"
  | "support-family"
  | "not-sure";

export interface GoalOption {
  id: GoalId;
  label: string;
  detail: string;
}

export const goalOptions: GoalOption[] = [
  { id: "understand", label: "Understand my activity", detail: "See a clear picture before deciding anything." },
  { id: "spend-less", label: "Spend less", detail: "Keep gambling but inside a smaller boundary." },
  { id: "take-a-break", label: "Take a break", detail: "Step away for a while and see how it feels." },
  { id: "stop", label: "Stop", detail: "Move away from gambling with support options." },
  { id: "support-family", label: "Support a family member", detail: "Learn and find resources for someone you care about." },
  { id: "not-sure", label: "Not sure yet", detail: "That's okay. Start by looking, not deciding." },
];

export const fundingSourceOptions = [
  "Credit cards",
  "Overdraft or borrowed money",
  "Shared household accounts",
  "Savings earmarked for bills",
] as const;

export interface DataChoices {
  /** Manual logging is the default and always available. */
  manualLogging: boolean;
  /** Simulated read-only import. Disabled by default; clearly labeled as not connected. */
  simulatedImport: boolean;
  /** Optional consent: local reminders inside the app. */
  localReminders: boolean;
  /** Optional consent: share aggregate, de-identified stats to improve the product. */
  aggregateResearch: boolean;
}

export interface PersonalPlan {
  createdAt: string; // ISO date
  /** Start of the four-week window, ISO date (YYYY-MM-DD). */
  startDate: string;
  goal: GoalId;
  /** Maximum total amount wagered across four weeks, in cents. */
  maxWageredCents: number;
  /** Maximum acceptable net loss across four weeks, in cents. */
  maxNetLossCents: number;
  /** Maximum number of gambling days across four weeks. */
  maxGamblingDays: number;
  /** Maximum total time across four weeks, in minutes. */
  maxTimeMinutes: number;
  /** Funding sources the user chose to mark off-limits. */
  prohibitedFundingSources: string[];
  dataChoices: DataChoices;
  adultConfirmed: boolean;
  /**
   * Optional self-directed break, as an ISO date (YYYY-MM-DD) the user chose.
   * This is a note to the user inside Clearline. It enforces nothing.
   */
  pauseUntil: string | null;
}

export interface ActivityEntry {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  platform: string;
  amountWageredCents: number;
  /** Positive = net gain, negative = net loss, in cents. */
  netResultCents: number;
  timeSpentMinutes: number;
  note?: string;
}

export interface DemoState {
  plan: PersonalPlan | null;
  entries: ActivityEntry[];
  onboardingComplete: boolean;
}
