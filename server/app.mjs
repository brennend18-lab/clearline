import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};
const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
};
export function verifySignature(raw, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const fields = header.split(",").map((x) => x.split("="));
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${raw}`)
    .digest();
  return fields.some(
    ([key, value]) =>
      key === "v1" &&
      /^[a-f0-9]{64}$/i.test(value || "") &&
      timingSafeEqual(expected, Buffer.from(value, "hex")),
  );
}
export async function readBody(req, max = 16384) {
  // Web entrypoint streams the raw bytes; never reconstruct signed JSON.
  if (req.body !== undefined) {
    if (typeof req.body !== "string" && !Buffer.isBuffer(req.body))
      fail(400, "Expected raw request body.");
    if (Buffer.byteLength(req.body) > max) fail(413, "Request too large.");
    return req.body.toString();
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > max) fail(413, "Request too large.");
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}
export function subscriptionAccess(subscriptions, priceId) {
  const matching = subscriptions.filter((s) =>
    s.items?.data?.some((i) => i.price?.id === priceId),
  );
  const active = matching.find((s) =>
    ["active", "trialing"].includes(s.status),
  );
  const sub = active || matching[0];
  return {
    active: Boolean(active),
    status: sub?.status || "none",
    cancelAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
    periodEnd:
      sub?.current_period_end ||
      sub?.items?.data?.[0]?.current_period_end ||
      null,
  };
}
export function createHandler({
  env = process.env,
  fetcher = fetch,
  clock = () => Date.now(),
} = {}) {
  const config = (key) =>
    env[key] ||
    fail(
      503,
      "Account services are not configured yet. Please try again later.",
    );
  const origin = () => new URL(config("APP_ORIGIN")).origin;
  async function remote(url, options = {}) {
    let response;
    try {
      response = await fetcher(url, {
        ...options,
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      fail(503, "A service is temporarily unavailable. Please try again.");
    }
    let data = null;
    try {
      data = await response.json();
    } catch {
      /* DELETE/204 */
    }
    return { ok: response.ok, status: response.status, data };
  }
  async function auth(path, body, token, method) {
    return remote(`${config("SUPABASE_URL")}/auth/v1/${path}`, {
      method: method || (body ? "POST" : "GET"),
      headers: {
        apikey: config("SUPABASE_ANON_KEY"),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  }
  async function db(path, { method = "GET", body, prefer } = {}) {
    const secret = config("SUPABASE_SERVICE_ROLE_KEY");
    const r = await remote(`${config("SUPABASE_URL")}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!r.ok) fail(503, "Account storage is temporarily unavailable.");
    return r.data;
  }
  async function stripe(path, method = "GET", fields, idempotency) {
    const r = await remote(`https://api.stripe.com/v1/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config("STRIPE_SECRET_KEY")}`,
        "Stripe-Version": "2024-06-20",
        ...(fields
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {}),
        ...(idempotency ? { "Idempotency-Key": idempotency } : {}),
      },
      ...(fields ? { body: new URLSearchParams(fields).toString() } : {}),
    });
    if (!r.ok)
      fail(503, "Billing is temporarily unavailable. Please try again.");
    return r.data;
  }
  function cookies(req) {
    return Object.fromEntries(
      String(req.headers.cookie || "")
        .split(";")
        .map((x) => {
          const i = x.indexOf("=");
          return i < 0 ? ["", ""] : [x.slice(0, i).trim(), x.slice(i + 1)];
        }),
    );
  }
  function setSession(res, session) {
    const secure = origin().startsWith("https:") ? "; Secure" : "";
    const suffix = `; Path=/; HttpOnly; SameSite=Lax${secure}`;
    res.setHeader("Set-Cookie", [
      `cl_access=${session?.access_token || ""}; Max-Age=${session ? Math.min(session.expires_in || 3600, 3600) : 0}${suffix}`,
      `cl_refresh=${session?.refresh_token || ""}; Max-Age=${session ? 60 * 60 * 24 * 30 : 0}${suffix}`,
    ]);
  }
  async function user(req, res) {
    const c = cookies(req);
    let token = c.cl_access;
    if (token) {
      const r = await auth("user", null, token);
      if (r.ok && r.data?.id && r.data.email_confirmed_at)
        return { ...r.data, token };
      if (r.status >= 500)
        fail(503, "Sign-in service is temporarily unavailable.");
    }
    if (c.cl_refresh) {
      const r = await auth("token?grant_type=refresh_token", {
        refresh_token: c.cl_refresh,
      });
      if (r.ok && r.data?.access_token) {
        const verified = await auth("user", null, r.data.access_token);
        if (verified.ok && verified.data?.email_confirmed_at) {
          setSession(res, r.data);
          return { ...verified.data, token: r.data.access_token };
        }
      }
      if (r.status >= 500)
        fail(503, "Sign-in service is temporarily unavailable.");
    }
    setSession(res, null);
    fail(401, "Please sign in to continue.");
  }
  async function limit(req, action, identity, maximum = 10) {
    const ip = env.VERCEL
      ? String(
          req.headers["x-vercel-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "unknown",
        )
          .split(",")[0]
          .trim()
      : "local";
    // Vercel supplies the trusted client-IP header; do not use user-controlled x-forwarded-for.
    for (const value of [ip, identity].filter(Boolean)) {
      const bucket = createHmac("sha256", config("SUPABASE_SERVICE_ROLE_KEY"))
        .update(`${action}:${value}:${Math.floor(clock() / 900000)}`)
        .digest("hex");
      const allowed = await db("rpc/consume_rate_limit", {
        method: "POST",
        body: { p_key: bucket, p_max: maximum },
      });
      if (allowed !== true)
        fail(429, "Too many attempts. Please wait 15 minutes and try again.");
    }
  }
  async function profile(id) {
    return (
      await db(
        `billing_accounts?user_id=eq.${encodeURIComponent(id)}&select=stripe_customer_id,deleting`,
      )
    )?.[0];
  }
  async function customer(u) {
    let p = await profile(u.id);
    if (p?.deleting)
      fail(409, "Account deletion is in progress. Please complete deletion.");
    if (p?.stripe_customer_id) return p.stripe_customer_id;
    const c = await stripe(
      "customers",
      "POST",
      { email: u.email, "metadata[clearline_user_id]": u.id },
      `clearline-customer-${u.id}`,
    );
    await db("billing_accounts?on_conflict=user_id", {
      method: "POST",
      body: { user_id: u.id, stripe_customer_id: c.id },
      prefer: "resolution=ignore-duplicates",
    });
    p = await profile(u.id);
    if (!p?.stripe_customer_id)
      fail(503, "Could not connect your billing account.");
    return p.stripe_customer_id;
  }
  async function allStripe(path) {
    let items = [],
      cursor = "";
    for (let page = 0; page < 100; page++) {
      const result = await stripe(
        `${path}${path.includes("?") ? "&" : "?"}limit=100${cursor ? `&starting_after=${encodeURIComponent(cursor)}` : ""}`,
      );
      items.push(...result.data);
      if (!result.has_more) return items;
      cursor = result.data.at(-1)?.id;
      if (!cursor) break;
    }
    fail(503, "Could not finish reading billing records. Please try again.");
  }
  const subscriptions = (cid) =>
    allStripe(`subscriptions?customer=${encodeURIComponent(cid)}&status=all`);
  async function status(u) {
    const p = await profile(u.id);
    if (!p?.stripe_customer_id)
      return {
        active: false,
        status: "none",
        cancelAtPeriodEnd: false,
        periodEnd: null,
      };
    if (p.deleting)
      return {
        active: false,
        status: "deleting",
        cancelAtPeriodEnd: false,
        periodEnd: null,
      };
    return subscriptionAccess(
      await subscriptions(p.stripe_customer_id),
      config("STRIPE_PRICE_ID"),
    );
  }
  return async function handler(req, res) {
    const requestId = randomUUID();
    let lockUser = null;
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Request-Id", requestId);
    try {
      const route = new URL(req.url, "https://placeholder.invalid").pathname
        .replace(/^\/api\/?/, "")
        .replace(/\/$/, "");
      const methods = {
        health: "GET",
        "auth/start": "POST",
        "auth/verify": "POST",
        "auth/logout": "POST",
        me: "GET",
        "billing/checkout": "POST",
        "billing/portal": "POST",
        "account/export": "GET",
        "account/delete": "POST",
        "webhooks/stripe": "POST",
      };
      if (!Object.hasOwn(methods, route)) fail(404, "Not found.");
      if (req.method !== methods[route]) {
        res.setHeader("Allow", methods[route]);
        fail(405, "Method not allowed.");
      }
      if (route === "health")
        return json(res, 200, {
          service: "clearline",
          configured: [
            "APP_ORIGIN",
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY",
            "STRIPE_SECRET_KEY",
            "STRIPE_PRICE_ID",
            "STRIPE_WEBHOOK_SECRET",
          ].every((k) => Boolean(env[k])),
        });
      if (
        req.headers["sec-fetch-site"] === "cross-site" &&
        route !== "webhooks/stripe"
      )
        fail(403, "Cross-site request rejected.");
      if (req.method === "POST" && route !== "webhooks/stripe") {
        if (req.headers.origin !== origin())
          fail(403, "Request origin not allowed.");
        if (
          !String(req.headers["content-type"] || "").startsWith(
            "application/json",
          )
        )
          fail(415, "Use application/json.");
      }
      const raw =
        req.method === "POST"
          ? await readBody(req, route === "webhooks/stripe" ? 1048576 : 16384)
          : "";
      if (route === "webhooks/stripe") {
        if (
          !verifySignature(
            raw,
            req.headers["stripe-signature"],
            config("STRIPE_WEBHOOK_SECRET"),
            clock(),
          )
        )
          fail(400, "Invalid webhook signature.");
        let event;
        try {
          event = JSON.parse(raw);
        } catch {
          fail(400, "Invalid JSON.");
        }
        if (!event.id || !event.type) fail(400, "Invalid webhook event.");
        if (
          ![
            "checkout.session.completed",
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "invoice.paid",
            "invoice.payment_failed",
          ].includes(event.type)
        )
          return json(res, 200, { received: true });
        // Store event IDs only, never raw payment payloads. Current entitlements are always read
        // from Stripe, so duplicate/out-of-order deliveries cannot overwrite newer state.
        await db("billing_events?on_conflict=event_id", {
          method: "POST",
          body: { event_id: event.id, event_type: event.type },
          prefer: "resolution=ignore-duplicates",
        });
        return json(res, 200, { received: true });
      }
      let body = {};
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          fail(400, "Invalid JSON.");
        }
        if (!body || Array.isArray(body) || typeof body !== "object")
          fail(400, "Invalid request.");
      }
      if (route === "auth/start" || route === "auth/verify") {
        const email = String(body.email || "")
          .trim()
          .toLowerCase();
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          fail(400, "Enter a valid email address.");
        await limit(req, route, email, route === "auth/start" ? 5 : 10);
        if (route === "auth/start") {
          if (body.adultConfirmed !== true)
            fail(400, "Clearline is for adults 18 and older.");
          const r = await auth("otp", {
            email,
            create_user: true,
            data: { adult_confirmed: true },
          });
          if (!r.ok)
            fail(
              r.status === 429 ? 429 : 503,
              r.status === 429
                ? "Please wait before requesting another code."
                : "Could not send a sign-in code. Please try again.",
            );
          return json(res, 200, { sent: true });
        }
        if (!/^\d{6,8}$/.test(String(body.code || "")))
          fail(400, "Enter the code from your email.");
        const r = await auth("verify", {
          email,
          token: String(body.code),
          type: "email",
        });
        if (!r.ok || !r.data?.access_token)
          fail(401, "That code is invalid or expired. Request a new code.");
        setSession(res, r.data);
        return json(res, 200, { signedIn: true });
      }
      const u = await user(req, res);
      if (route === "auth/logout") {
        const r = await auth("logout?scope=local", null, u.token, "POST");
        if (!r.ok && r.status !== 401)
          fail(503, "Could not revoke the session. Please try again.");
        setSession(res, null);
        return json(res, 200, { signedOut: true });
      }
      if (route === "me")
        return json(res, 200, {
          user: { id: u.id, email: u.email },
          membership: await status(u),
        });
      await limit(req, route, u.id, 30);
      if (route === "billing/checkout" || route === "account/delete") {
        const granted = await db("rpc/acquire_billing_lock", {
          method: "POST",
          body: { p_user: u.id, p_token: requestId },
        });
        if (granted !== true)
          fail(
            409,
            "Another billing change is in progress. Please wait a moment and retry.",
          );
        lockUser = u.id;
      }
      if (route === "billing/checkout") {
        const cid = await customer(u);
        const price = await stripe(
          `prices/${encodeURIComponent(config("STRIPE_PRICE_ID"))}`,
        );
        if (
          price.unit_amount !== 1700 ||
          price.currency !== "usd" ||
          price.recurring?.interval !== "month" ||
          price.recurring?.interval_count !== 1 ||
          !price.active
        )
          fail(503, "The $17 monthly plan is not configured correctly.");
        const existing = await subscriptions(cid);
        if (
          existing.some(
            (s) => !["canceled", "incomplete_expired"].includes(s.status),
          )
        )
          fail(
            409,
            "A subscription already exists. Use Manage billing to update it.",
          );
        const open = await stripe(
          `checkout/sessions?customer=${encodeURIComponent(cid)}&status=open&limit=10`,
        );
        const reusable = open.data?.find(
          (s) => s.metadata?.clearline_price_id === env.STRIPE_PRICE_ID,
        );
        if (reusable?.url) return json(res, 200, { url: reusable.url });
        const s = await stripe(
          "checkout/sessions",
          "POST",
          {
            mode: "subscription",
            customer: cid,
            "line_items[0][price]": env.STRIPE_PRICE_ID,
            "line_items[0][quantity]": "1",
            success_url: `${origin()}/account?checkout=success`,
            cancel_url: `${origin()}/account?checkout=canceled`,
            "metadata[clearline_price_id]": env.STRIPE_PRICE_ID,
            "subscription_data[metadata][clearline_user_id]": u.id,
            client_reference_id: u.id,
          },
          `checkout-${u.id}-${Math.floor(clock() / 1800000)}`,
        );
        return json(res, 200, { url: s.url });
      }
      if (route === "billing/portal") {
        const p = await profile(u.id);
        if (p?.deleting)
          fail(
            409,
            "Account deletion is in progress. Complete deletion before making billing changes.",
          );
        if (!p?.stripe_customer_id) fail(400, "No billing account exists yet.");
        const s = await stripe("billing_portal/sessions", "POST", {
          customer: p.stripe_customer_id,
          return_url: `${origin()}/account`,
        });
        return json(res, 200, { url: s.url });
      }
      if (route === "account/export")
        return json(res, 200, {
          exportedAt: new Date(clock()).toISOString(),
          account: { id: u.id, email: u.email, createdAt: u.created_at },
          membership: await status(u),
          note: "Activity and reflections are stored only on your device. Export those from My data.",
        });
      if (route === "account/delete") {
        if (body.confirm !== "DELETE")
          fail(400, "Type DELETE to confirm account deletion.");
        const p = await profile(u.id);
        if (p?.stripe_customer_id) {
          await db(`billing_accounts?user_id=eq.${encodeURIComponent(u.id)}`, {
            method: "PATCH",
            body: { deleting: true },
          });
          const sessions = await allStripe(
            `checkout/sessions?customer=${encodeURIComponent(p.stripe_customer_id)}&status=open`,
          );
          for (const s of sessions)
            await stripe(`checkout/sessions/${s.id}/expire`, "POST", {});
          for (const s of await subscriptions(p.stripe_customer_id))
            if (!["canceled", "incomplete_expired"].includes(s.status))
              await stripe(`subscriptions/${s.id}`, "DELETE");
          const c = await stripe(`customers/${p.stripe_customer_id}`);
          if (!c.deleted)
            await stripe(`customers/${p.stripe_customer_id}`, "DELETE");
        }
        const secret = config("SUPABASE_SERVICE_ROLE_KEY");
        const r = await remote(
          `${config("SUPABASE_URL")}/auth/v1/admin/users/${encodeURIComponent(u.id)}`,
          {
            method: "DELETE",
            headers: { apikey: secret, Authorization: `Bearer ${secret}` },
          },
        );
        if (!r.ok)
          fail(
            503,
            "Could not finish account deletion. Please retry. Billing has already been stopped if cancellation succeeded.",
          );
        setSession(res, null);
        return json(res, 200, { deleted: true });
      }
    } catch (error) {
      // Do not log email addresses, tokens, provider response bodies or user activity.
      const status = error instanceof HttpError ? error.status : 500;
      json(res, status, {
        error:
          error instanceof HttpError
            ? error.message
            : "Something went wrong. Please try again.",
        requestId,
      });
    } finally {
      if (lockUser) {
        try {
          await db("rpc/release_billing_lock", {
            method: "POST",
            body: { p_user: lockUser, p_token: requestId },
          });
        } catch {
          /* TTL releases the lock; no secrets logged. */
        }
      }
    }
  };
}
