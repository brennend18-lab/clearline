/**
 * Central brand configuration.
 * Change the working name, tagline, navigation, contact details, and
 * crisis resources here. Nothing else in the app hard-codes them.
 *
 * "Clearline" is a working name only. It has not been cleared for legal
 * or trademark use.
 */

export const brand = {
  name: "Clearline",
  nameIsWorkingTitle: true,
  tagline: "Set your line. See what happened. Choose your next step.",
  /**
   * The hero headline. Deliberately names the subject ("your gambling") in the
   * first line: the tagline alone never says what the product is about.
   *
   * Keep this non-judgmental. Language that warns the reader about losing
   * control, or that borrows operator phrasing like "play responsibly", breaks
   * the product's positioning and fails the content-safety test.
   */
  heroHeadline: {
    lead: "Put guardrails around your gambling.",
    emphasis: "Access help if you need it.",
  },
  positioning:
    "One place to set your limits before you play, see what actually happened across every app you use, and reach real help if you want it. No picks, no odds, no operator pressure, no hidden data sharing.",
  /** One-sentence answer to "what is this?", used under the hero. */
  plainSummary:
    "Set your own limits before you play, write down what actually happened, and see the difference in plain English. Private on your device, free help always one tap away.",
  /**
   * The categories Clearline covers. Prediction markets sit under the CFTC
   * rather than state gaming regulators, so helplines, self-exclusion, and
   * operator limits largely do not reach them. That gap is deliberate to name.
   */
  coverage: ["Sportsbooks", "Prediction markets", "Casino apps", "Daily fantasy"],
  contact: {
    email: "hello@clearline.example",
    emailNote: "Placeholder address for the prototype. Not monitored.",
  },
} as const;

export interface NavLink {
  label: string;
  to: string;
}

export const navLinks: NavLink[] = [
  { label: "Product", to: "/#product" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "For Organizations", to: "/for-organizations" },
  { label: "Trust", to: "/trust" },
  { label: "Pitch", to: "/deck" },
];

export const primaryCta = { label: "Try the demo", to: "/demo" } as const;

/**
 * Support resources. These strings are rendered exactly as written in the
 * support panel, footer, and action center. A unit test asserts they exist.
 */
export const supportResources = {
  gambling: {
    label: "Gambling-specific support",
    name: "National Problem Gambling Helpline",
    phraseNumber: "1-800-MY-RESET",
    digitsNumber: "1-800-697-3738",
    methods: "Call, text, or chat",
    note: "Free and confidential. This is not an emergency service.",
  },
  crisis: {
    label: "Suicide or emotional crisis",
    number: "988",
    methods: "Call or text",
    note: "The 988 Suicide & Crisis Lifeline, 24/7.",
  },
  emergency: {
    label: "Immediate physical danger",
    number: "911",
    methods: "Call",
    note: "For any medical or safety emergency.",
  },
} as const;

export const adultsOnlyNotice =
  "Clearline is for adults only. This prototype is educational and does not provide diagnosis, therapy, or emergency monitoring.";
