/**
 * Centralized copy system.
 *
 * Product copy is concise, plain, and nonjudgmental. Preferred terms:
 * "what you planned", "what you recorded", "difference from your plan",
 * "support options", "people affected by gambling harms",
 * "licensed professional", "independent support".
 *
 * House style: no em dashes anywhere in user-facing copy.
 *
 * A content-safety test (src/lib/content-safety.test.ts) scans all source
 * files for prohibited language and fails the build if any appears.
 */

export const landing = {
  heroEyebrow: "Independent player protection and support",
  heroCtas: {
    primary: "Try the private demo",
    secondary: "See how it works",
  },

  /* ---- Plain-language explanation. The clarity anchor of the page. ---- */
  whatItIs: {
    eyebrow: "In plain language",
    title: "A private notebook and an honest mirror",
    lead: "That is the whole product. Nothing is hiding behind it.",
    paragraphs: [
      "You decide, before you gamble, how much money and time you are willing to put in over the next four weeks. That is your guardrail, and you pick every number in it.",
      "You write down what you actually did. Clearline puts the two side by side in plain English: what you planned, what you recorded, and the difference. Then it shows you a menu of real options, including doing nothing for now.",
    ],
    notList: {
      title: "What it is not",
      items: [
        "Not a score, a grade, or an assessment of you",
        "Not a diagnosis, and not treatment",
        "Not a betting tool: no picks, no odds, no tips",
        "Not an emergency service",
      ],
    },
  },

  /**
   * Plan / Log / Reflect / Act.
   * Each step carries what it costs you in time and what you end up with, so
   * the process, the deliverables, and the rhythm are one section instead of
   * three that repeat each other.
   */
  howItWorks: {
    eyebrow: "How it works",
    title: "Four steps, about two minutes to start",
    intro:
      "The whole loop, from setting a guardrail to choosing what happens next.",
    steps: [
      {
        key: "plan",
        title: "Plan",
        when: "2 minutes, once",
        body: "Set the money, time, and frequency limits you are comfortable with for the next four weeks. You pick every number.",
        youGet: "A four-week plan in your own numbers",
      },
      {
        key: "log",
        title: "Log",
        when: "20 seconds a session",
        body: "Write down what you actually did. Nothing connects to your bank or your sportsbook.",
        youGet: "A private log only you can see",
      },
      {
        key: "reflect",
        title: "Reflect",
        when: "Weekly or monthly",
        body: "See what you planned next to what you recorded, with every calculation shown openly.",
        youGet: "A plain-language report, never a score",
      },
      {
        key: "act",
        title: "Act",
        when: "Whenever you choose",
        body: "Pick a next step from safeguards, free resources, peer support, family resources, or licensed care.",
        youGet: "A menu of real options, with honest limits",
      },
    ],
  },

  /**
   * The structural gap that justifies an independent layer.
   *
   * Deliberately factual and calm rather than alarming, and it names no
   * operator. The claims describe categories of regulation, not the outcome of
   * any specific dispute, because federal and state authority over sports event
   * contracts is actively contested.
   */
  gap: {
    eyebrow: "Why this needs to exist",
    title: "Self-exclusion does not reach prediction markets",
    intro:
      "Sports event contracts are regulated federally as derivatives, not by state gaming commissions. The protections built around licensed sportsbooks were written for a different category, and most of them do not carry across.",
    columns: [
      {
        heading: "A licensed sportsbook in your state",
        items: [
          "Licensed by a state gaming regulator",
          "Required to offer self-exclusion and account limits",
          "Required to display problem-gambling resources",
          "Gaming taxes help fund state treatment programs",
        ],
      },
      {
        heading: "A federally regulated event-contract exchange",
        items: [
          "Overseen for market integrity, not for gambling harm",
          "State self-exclusion lists generally do not apply",
          "No problem-gambling mandate attached to that oversight",
          "Typically outside state problem-gambling funding",
        ],
      },
    ],
    consequence:
      "So a person can self-exclude from every sportsbook in their state and place a similar wager on an exchange the next morning. The same holds for blockers keyed to gambling sites, and for a helpline funded by gaming taxes.",
    role: "Clearline sits above all of them on purpose. It belongs to you rather than to one operator or one regulator, so the line you set covers whatever you actually use.",
    caveat:
      "Authority over sports event contracts is unsettled and actively contested between federal and state regulators, and the details differ by state. This is general information, not legal advice.",
  },

  /* ---- Audiences ---- */
  whoItsFor: {
    eyebrow: "Who it is for",
    title: "You do not need a problem to use it",
    intro: "Four very different starting points, all of them welcome.",
    personas: [
      {
        title: "You just want the real number",
        body: "Gambling is part of your entertainment budget and you would like to know what that budget actually is.",
      },
      {
        title: "Something feels different lately",
        body: "More often, longer sessions, more headspace. Looking at four weeks of your own records is a reasonable first move.",
      },
      {
        title: "You have decided to cut back",
        body: "You want the guardrail written down, the safeguards in one place, and free support within reach.",
      },
      {
        title: "Someone you love gambles",
        body: "People affected by gambling harms carry real costs too. There are resources built for you.",
      },
    ],
  },

  /* ---- The payoff ---- */
  benefits: {
    eyebrow: "Why it helps",
    title: "What you actually walk away with",
    intro:
      "Clearline does not promise recovery, savings, or any clinical outcome. These are the things it genuinely gives you.",
    items: [
      {
        title: "A number instead of a feeling",
        body: "Memory rounds down and skips the bad nights. A written record does not. For many people, seeing four weeks laid out plainly is the entire value.",
      },
      {
        title: "A guardrail you set yourself",
        body: "Not an app's rule, not a clinical threshold, not a limit somebody set for you. You pick the numbers, so the comparison means something.",
      },
      {
        title: "Nobody looking over your shoulder",
        body: "No account, no email, no advertising pixels, no third-party tracking. In this prototype your data never leaves your browser.",
      },
      {
        title: "Rules beat in-the-moment decisions",
        body: "Most of what people lose goes on bets they never planned to make: bigger stakes, worse markets, late at night, chasing something back. A limit you set in advance is the part of this you actually control.",
      },
      {
        title: "Options most people never hear about",
        body: "State self-exclusion, bank-level gambling blocks, and operator limits already exist and are mostly free. Clearline lists them with their real limits.",
      },
      {
        title: "Nobody here profits from your next bet",
        body: "No affiliate revenue, no operator commissions, no payment tied to deposits or losses. Free help always appears before anything paid, and there is no high-ticket checkout.",
      },
    ],
  },

  /* ---- Trust: never-does, privacy, and measured outcomes in one place ---- */
  trust: {
    eyebrow: "How we keep ourselves honest",
    title: "The lines we will not cross",
    neverDoes: [
      "No picks or odds",
      "No gambling affiliate revenue",
      "No sale of sensitive data",
      "No diagnosis",
    ],
    privacy: {
      title: "Your data stays on your device",
      items: [
        "Everything you enter in this prototype stays in your browser. Nothing is transmitted.",
        "No advertising pixels, retargeting, audience uploads, or lead resale.",
        "Export everything as JSON, or delete all of it, in two clicks.",
      ],
    },
    outcomes: {
      title: "What we will measure, and what we will not claim",
      intro:
        "We intend to track how the product is used and whether people reach support, then publish what we learn either way. We do not promise efficacy.",
      items: [
        "Engagement: do people keep using their plan and log?",
        "Support uptake: do people reach free and licensed options?",
        "Safety: are crisis resources visible and reachable?",
        "Retention and longer-term outcomes, evaluated independently.",
      ],
    },
  },

  /* ---- Institutional, compact ---- */
  organizations: {
    eyebrow: "For organizations",
    title: "The consumer should not be the only payer",
    intro:
      "Providers, employers and EAPs, universities, operators and states, and financial institutions can offer Clearline to the people they serve. No identifiable support data ever flows back to them.",
    audiences: [
      "Providers",
      "Employers & EAPs",
      "Universities",
      "Operators & states",
      "Financial institutions",
    ],
  },

  finalCta: {
    title: "See your own picture in about two minutes",
    body: "The demo runs entirely on your device with example data you can replace or erase. No account, no email, nothing shared.",
  },
} as const;

export const disclaimers = {
  educational:
    "This is educational and does not provide diagnosis, therapy, or emergency monitoring.",
  recordsIncomplete:
    "Your records may be incomplete and are not verified financial statements. They are your private notes, for your own reflection.",
  importsSimulated:
    "Account imports are simulated for demonstration and are not connected in this demo.",
  notEnforcement:
    "Clearline explains these options and links you to the right place. It cannot itself enforce operator, bank, or government controls.",
  pauseIsANote:
    "A pause here is a note to yourself inside Clearline. It does not block any app, site, or account on its own.",
} as const;

export const reportCopy = {
  meaningTitle: "What these numbers mean, and what they do not",
  meaning: [
    "These figures compare what you planned with what you recorded. Nothing more.",
    "They are not a score, a grade, or an assessment of you as a person.",
    "They do not measure a disorder, and no part of this report is a diagnosis.",
    "Entries you did not record are not counted, so the real totals may differ.",
  ],
  nextTitle: "What would you like to do next?",
} as const;
