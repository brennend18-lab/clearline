# Clearline 0.2 — activation and handoff

This package extends your existing Vite/React project. It preserves the approved
handshake landing page and adds a member application plus Vercel API functions.
It is source code, not an already-configured or deployed service.

## Implemented

- `/account`: email-code registration/sign-in, subscription status, Stripe Checkout,
  billing portal, account export and deletion.
- `/app`: personal four-week limits, activity CRUD, weekly/four-week and calendar-month
  reporting, reflection journal, backup/restore and local deletion.
- `/support`: public support and family resources, available without payment/login.
- `/trust`: actual data-handling explanation for the new account architecture.
- Separate member data per user, no mixing with the original `/demo` sample records.
- Signed Stripe webhook validation, idempotent event-ID storage, authoritative Stripe
  entitlement checks, fixed server-side price, billing ownership verification,
  per-user billing operation locks and shared database-backed rate limits.
- Secure HttpOnly session cookies. No authentication tokens in browser localStorage.
- Fixed the old calculation bug that clamped out-of-window records into a plan.

## Architecture and privacy

Account/email authentication: **Supabase Auth**.
Billing/account link and rate limits: **Supabase Postgres**, accessible to the server
service role only (RLS enabled; anon/authenticated roles have no table access).
Subscriptions: **Stripe Checkout + customer portal**.
Hosting/API: existing **Vercel** project, Node Web Standard function.
Activity, plans and reflection text: **browser localStorage only**, namespaced by user
ID. No AI service, cloud activity database or automatic account import is connected.

This architecture deliberately preserves the public promise that activity stays on
the device. Local data is not encrypted at rest, can be read by someone with access
to the browser profile and is lost if browser storage is cleared. The member UI says
this and provides exports. Logging out does not delete those records. Deleting an
account clears the current browser only; other devices must be cleared separately.

The local application is not DRM: a technically sophisticated user can manipulate
client code/localStorage. Actual account/billing operations remain authenticated on
the server. Do not move sensitive activity to the server merely to enforce the UI paywall.

## 1. Supabase setup

Create/use a Supabase project that you own. Run `database/001_accounts.sql` in its SQL
editor. This provisions only operational account/billing tables, not betting data.
No migration has been run by this handoff.

Enable email authentication. Configure a production SMTP sender and verified sending
domain. Supabase's default email service is not a production mailing solution.

Change the **Magic Link** email template to include the numeric OTP:

```html
<h2>Your Clearline sign-in code</h2>
<p>Enter this code in the Clearline window where you requested it:</p>
<p><strong>{{ .Token }}</strong></p>
<p>If you did not request this code, you can ignore this email.</p>
```

Set the Site URL to the deployed application's origin. Configure short OTP expiration
(e.g. 10 minutes), retain provider abuse/rate protections, and test email delivery.
The UI accepts 6–8 digit codes; there is no password or password-reset flow.

Obtain SUPABASE_URL, the project's legacy anon API key (SUPABASE_ANON_KEY), and its
service-role key. Store them only as Vercel server environment variables. Do not
paste secret values into chat or commit them. No VITE_-prefixed secrets are needed.

## 2. Stripe setup (test mode first)

Create a product named Clearline Membership and a recurring **USD 17.00 per month**
price (one month interval). Set STRIPE_PRICE_ID to this price. The API rejects any
price that differs in currency, amount, interval or active status.

Enable the hosted customer portal: subscription cancellation at period end, invoice
history and payment-method updates. Do not allow arbitrary plan/quantity switching.
Checkout does not add a free trial, promotion codes or adjustable quantity.

Create a webhook endpoint at:

`https://YOUR-DEPLOYMENT/api/webhooks/stripe`

Subscribe to:

- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed

Save its signing secret as STRIPE_WEBHOOK_SECRET. Do not use the API secret in its
place. The implementation pins Stripe REST requests to API version 2024-06-20.
Webhook processing reads only event IDs/types; current membership is fetched directly
from Stripe so stale or out-of-order webhooks cannot grant stale access.

`active`/`trialing` subscriptions for the configured price permit member UI access.
`past_due`, `unpaid`, `incomplete`, `canceled` and `paused` do not. Scheduled cancellation
keeps access while the subscription remains active. Data export/deletion controls are
available to a signed-in user without an active subscription.

## 3. Vercel configuration

Use the existing `clearline` project in your `brennen-134fcc48` account. Replace its
source with this package or commit it to the linked repository. Do not upload
node_modules. Preserve your existing project identity and domain.

- Framework preset: Other (Vite frontend + Node API function)
- Node runtime: a currently supported Node version, **22.x or newer**
- Build command: `npm run build`
- Output directory: `dist`
- Use the included vercel.json; API requests must never be rewritten to app.html.

Set these seven server-side variables:

| Variable                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| APP_ORIGIN                | Exact HTTPS origin of this environment; no path  |
| SUPABASE_URL              | Your Supabase project URL                        |
| SUPABASE_ANON_KEY         | Your project's anon key                          |
| SUPABASE_SERVICE_ROLE_KEY | Your project's service role key                  |
| STRIPE_SECRET_KEY         | Stripe secret key for the same mode as the price |
| STRIPE_PRICE_ID           | The USD $17 monthly price                        |
| STRIPE_WEBHOOK_SECRET     | Signing secret for this deployment's endpoint    |

Use separate preview/test and production resources. APP_ORIGIN must exactly match
the address used in the browser; cross-origin POST requests are intentionally rejected.
Do not derive trusted redirect URLs from a request-supplied Host header.

The ZIP contains no credentials. An environment template is provided. No database,
email sender, Vercel environment variables or live Stripe objects have been provisioned.

## 4. Verify before accepting real customers

```sh
npm ci
npm run test:all
npm run build
```

Only after project linkage and environment variables are verified, use `vercel dev`
for full-stack local development, with APP_ORIGIN set to its local origin. `npm run
dev` alone runs the original Vite frontend and cannot serve the new API.

On a test Vercel deployment:

1. `/api/health` returns configured:true (presence check, not a connectivity guarantee).
2. Get an email code, enter it, and confirm account access. Invalid/expired code fails.
3. Subscribe in Stripe test mode; refresh account status after checkout if needed.
4. Create a plan, add/edit/delete activity, save a reflection and reload.
5. Check weekly/four-week and calendar-month totals. Wagered amount and net loss are
   deliberately separate. Entries outside the active plan window must be excluded.
6. Export a backup, restore it, and confirm records match. Test malformed backup
   rejection without losing existing records. Test two accounts on the same browser.
7. Open the billing portal; schedule cancellation and confirm current-period access.
8. Simulate payment failure and verify paid access is removed while data controls stay.
9. Replay a signed webhook; event-ID storage stays idempotent. Unsigned requests fail.
10. Delete a test account: open checkout sessions expire, subscriptions stop immediately,
    the Stripe customer is deleted, the login/billing link is removed, and this browser's
    local records are cleared. Stripe may retain invoices/transaction history.
11. Confirm `/support` works signed out and on mobile.

If billing cancellation fails, deletion stops with an error rather than deleting the
login and leaving an undisclosed live subscription. Retry finishes the remaining steps.
Billing locks expire after 90 seconds following interrupted operations.

## Before public launch

- Supply approved terms and real contact details. Original landing-page Terms/Contact
  links still show explicit unconfigured dialogs; no legal identity or email was invented.
- Review the existing `/for-organizations` and `/deck` prototype content before using it
  externally. The old demo remains a clearly labeled demo.
- Review the site's privacy explanation and your providers' actual retention policies.
- Keep analytics and advertising pixels off activity/reflection pages.
- Test live-mode configuration and your actual signup/payment path after test-mode QA.
- Remove the deliberate noindex headers/robots restrictions only when ready to publish.

## Key implementation files

- `server/app.mjs`: API business logic, provider calls, sessions, billing and deletion.
- `api/[...path].js`: Vercel Web Standard adapter preserving raw webhook bytes.
- `database/001_accounts.sql`: RLS-protected operational tables and atomic RPCs.
- `src/member/MemberApp.tsx`, `model.ts`, `api.ts`, `member.css`: member application.
- `src/member/BrandMark.tsx`: approved landing-page SVG handshake reused in app header.
- `public/home.html`: preserved landing page with real account/support routes.
- `server/app.test.mjs`, `src/member/*.test.*`: provider-boundary and member-flow tests.

## Documentation used

- Supabase email OTP: https://supabase.com/docs/guides/auth/auth-email-passwordless
- Stripe Checkout: https://docs.stripe.com/api/checkout/sessions/create
- Stripe webhooks: https://docs.stripe.com/webhooks
- Vercel Node function formats: https://vercel.com/docs/functions/runtimes/node-js
- NCPG: https://www.ncpgambling.org/
- Family support: https://www.gam-anon.org/
- U.S. crisis support: https://988lifeline.org/
