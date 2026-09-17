# Clearline 0.2: member application and backend

Start with [SETUP.md](./SETUP.md) for the new account, billing, database and deployment instructions. The historical prototype documentation below describes the original demo, not the new member backend.

---

# Clearline (prototype)

An independent player-protection and support platform prototype: public
marketing site, interactive consumer demo, and a browser-based investor pitch
deck. One React app, no backend, no dependencies beyond the UI stack.

> "Clearline" is a working name. It has not been cleared for legal or
> trademark use. This prototype is educational and does not provide
> diagnosis, therapy, or emergency monitoring.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3123
npm run build      # typecheck + production build (dist/)
npm run preview    # serve the production build
npm run test       # 44 tests: calculations, summary wording, log CRUD, storage, safety
npm run typecheck  # TypeScript only
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Public landing page |
| `/demo` | Five-step onboarding. Reopening it revises the saved plan in place |
| `/demo/log` | Manual activity log (add / edit / delete, Load example month) |
| `/demo/report` | Plan-versus-recorded report with chart, timeline, pause banner, and "How this was calculated" |
| `/demo/actions` | Action center, including a working self-directed pause |
| `/for-organizations` | Four institutional products, governance firewall, demo pilot form |
| `/trust` | Trust, privacy, and boundaries plus working export and delete controls |
| `/deck` | 12-slide 16:9 investor deck with a 4-slide appendix |

## Where to change things

- **Brand, tagline, navigation, contact, crisis resources**: `src/config/brand.ts`.
  The support numbers (1-800-MY-RESET / 1-800-697-3738, 988, 911) render
  everywhere from this one file.
- **All landing-page copy**: `src/content.ts`. Every section (the plain-language
  explanation, the four steps, who it is for, the benefits, the trust block, and
  the institutional band) is data rather than markup, so it can be rewritten
  without touching components.
- **The hero headline**: `brand.heroHeadline` in `src/config/brand.ts`.
- **Financial assumptions**: `src/data/financials.ts`. Every figure renders with
  an "Illustrative only" badge and the validate-through-real-cohorts footnote.
- **Pilot form fields**: `PilotForm` in `src/pages/ForOrganizations.tsx`
  (demo only, never submits externally).
- **Seed/example data**: `src/lib/seed.ts`, kept in sync with the
  $500-planned / $820-recorded / 8-vs-12-days / -$310 scenario that
  `src/lib/calculations.test.ts` and `src/lib/summary.test.ts` assert.

## Landing page structure

Eight sections, in this order. Three earlier sections (How it works, What you
get, How you use it) all described the same loop and were merged into one, and
the trust strip, privacy section, and measured-outcomes section were merged into
another. The page went from 12 sections and 1,374 words to 8 and 927.

1. Hero: guardrails headline, positioning, product preview card, two CTAs
2. In plain language: what it is, next to what it is not
3. How it works: Plan, Log, Reflect, Act on one connector line, each step
   carrying its time cost and what you end up with, then a CTA
4. Who it is for: four starting points, including people affected by someone
   else's gambling
5. Why it helps: the six honest benefits, then a CTA
6. How we keep ourselves honest: never-does strip, privacy, and what we will
   measure without promising efficacy
7. For organizations: a compact band with the five institutional audiences
8. Final CTA

## Design and safety decisions

- Calm financial-wellness aesthetic: warm off-white, deep navy, Source Serif 4
  headings over Inter body (self-hosted), thin borders, restrained motion that
  respects `prefers-reduced-motion`. No casino imagery anywhere.
- All demo data lives in `localStorage` on the device. No network submission of
  personal information, no analytics SDKs, no advertising pixels.
- Free support options always appear before any paid product, and there is no
  consumer high-ticket checkout.
- Report language is strictly factual plan-versus-recorded. The sentence itself
  lives in `src/lib/summary.ts` and is rendered by **both** the product report
  and the deck's product slide, so the pitch cannot drift from the product.
- A self-directed pause is stored on the user's own plan and is labeled
  everywhere as a note to themselves that enforces nothing.
- Charts are plain SVG (`src/components/BarChart.tsx`) with labeled axes,
  legends, and visible text summaries. No charting dependency.
- The deck renders every slide at a fixed 1280x720 design size and scales it to
  fit, so slides never overflow at any viewport and print one-per-page at
  native size.
- Artwork in `public/assets/` is generated to the brand palette around an
  abstract boundary-line motif: a horizon band under the hero, one mark per
  step (guardrail, notebook, planned-versus-recorded bars, branching paths), a
  notebook illustration, and the governance and deck-cover pieces. All are WebP,
  76KB for the whole set. Functional icons remain Lucide.
- Motion is deliberately calm and is defined in `src/components/Reveal.tsx` plus
  the `.reveal` / `.line-draw` / `.bar-grow` rules in `index.css`: a short fade
  and rise on scroll, the steps connector line drawing itself once, and the
  comparison bars growing from the left. Nothing springs or bounces.
  `prefers-reduced-motion` is honored twice over, in the component (no observer
  is attached and content starts visible) and in CSS (`!important` overrides
  that hold even if the script never runs).
- PWA manifest included so the prototype can be saved to a phone home screen.

## Enforced content rules

`src/lib/content-safety.test.ts` scans every `.ts`/`.tsx` file under `src/` and
fails the test run on:

- prohibited language (degen, irresponsible, addict, compulsive gambler, failed,
  cure, guaranteed recovery, recover your losses, clinically proven) and
  user-labeling phrases;
- any em dash, which is a house style rule;
- diagnostic language in the report page or in the generated report sentence.

Run `npm run test` after any copy edit. The scan is the gate.

## Verification performed

- `npm run build` clean (typecheck plus production build), 350KB JS / 104KB
  gzipped, no chunk-size warnings.
- 44/44 tests passing, including six that drive the real log form through add,
  edit, validation-failure, delete, and load-example-month.
- Every route checked at 375px and desktop: no horizontal overflow anywhere.
- All 16 deck slides measured against the 720px design height: zero clipped
  content.
- Print path verified by applying the `@media print` rules and measuring: all
  16 slides become visible, navigation chrome hides, each slide is exactly
  1280x720 with transforms cleared and page breaks applied.
- Keyboard focus verified: visible 2px focus ring, and all 22 focusable
  controls on the landing page carry accessible names.
- Live-tested: plan revision prefill, pause set and clear, delete-all-data,
  example-month load. Console clean on a fresh session.

## Known assumptions

- Planned time for the seeded example month is 10 hours (600 minutes) against
  16h 10m recorded. The brief fixed money and days but left time open.
- Market-signal figures render with the source labels given in the brief and
  carry visible limitation notes. They are not independently re-verified here.
- The simulated account import is a disabled-by-default consent choice, clearly
  labeled as not connected in this demo.
