import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import { createHandler, verifySignature, subscriptionAccess } from "./app.mjs";
const now = 1720000000000;
const env = {
  APP_ORIGIN: "https://clearline.test",
  SUPABASE_URL: "https://auth.test",
  SUPABASE_ANON_KEY: "test-anon",
  SUPABASE_SERVICE_ROLE_KEY: "test-service",
  STRIPE_SECRET_KEY: "test-stripe",
  STRIPE_PRICE_ID: "price_month",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
};
const confirmed = {
  id: "u-123",
  email: "a@example.com",
  email_confirmed_at: "2024-01-01",
  created_at: "2024-01-01",
};
const active = {
  id: "sub_1",
  status: "active",
  items: { data: [{ price: { id: "price_month" } }] },
  current_period_end: 2000000000,
};
const response = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});
function mockProvider(custom) {
  const calls = [];
  return {
    calls,
    fetcher: async (url, options) => {
      calls.push({ url, options });
      const r = custom?.(url, options, calls);
      if (r) return r;
      if (url.includes("/rpc/")) return response(true);
      if (url.endsWith("/auth/v1/user")) return response(confirmed);
      if (url.includes("/billing_accounts?"))
        return response([{ stripe_customer_id: "cus_owned", deleting: false }]);
      if (url.includes("/subscriptions?"))
        return response({ data: [active], has_more: false });
      throw Error(`Unexpected request ${url}`);
    },
  };
}
async function invoke(
  handler,
  path,
  { method = "POST", body = {}, headers = {} } = {},
) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  const req = Readable.from(method === "GET" ? [] : [Buffer.from(raw)]);
  req.url = `/api/${path}`;
  req.method = method;
  req.headers = {
    origin: env.APP_ORIGIN,
    "content-type": "application/json",
    cookie: "cl_access=verified-token",
    ...headers,
  };
  const res = {
    headers: {},
    statusCode: 200,
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    end(raw) {
      this.data = JSON.parse(raw);
    },
  };
  await handler(req, res);
  return res;
}
function fixture(custom) {
  const m = mockProvider(custom);
  return {
    ...m,
    handler: createHandler({ env, fetcher: m.fetcher, clock: () => now }),
  };
}
test("does not treat a client-supplied status or customer as authority", async () => {
  const f = fixture();
  const r = await invoke(f.handler, "me", { method: "GET" });
  assert.equal(r.data.membership.active, true);
  assert.ok(f.calls.some((c) => c.url.includes("customer=cus_owned")));
  assert.equal(r.headers["cache-control"], "no-store, private");
});
test("rejects unsigned client session and does not touch billing", async () => {
  const f = fixture((url) =>
    url.endsWith("/user") ? response({}, 401) : null,
  );
  const r = await invoke(f.handler, "billing/portal", {
    body: { customerId: "cus_other" },
  });
  assert.equal(r.statusCode, 401);
  assert.ok(!f.calls.some((c) => c.url.includes("stripe.com")));
});
test("portal binds customer to authenticated user, never request body", async () => {
  const f = fixture((url, o) => {
    if (url.endsWith("billing_portal/sessions")) {
      assert.equal(new URLSearchParams(o.body).get("customer"), "cus_owned");
      return response({ url: "https://billing.stripe.com/portal" });
    }
  });
  const r = await invoke(f.handler, "billing/portal", {
    body: { customerId: "cus_other" },
  });
  assert.equal(r.statusCode, 200);
});
test("POST requires exact allowed origin before any provider calls", async () => {
  const f = fixture();
  for (const origin of ["https://evil.test", "null", ""]) {
    const r = await invoke(f.handler, "auth/start", {
      headers: { origin },
      body: { email: "a@example.com", adultConfirmed: true },
    });
    assert.equal(r.statusCode, 403);
  }
  assert.equal(f.calls.length, 0);
});
test("unknown routes and wrong methods are rejected", async () => {
  const f = fixture();
  assert.equal((await invoke(f.handler, "unknown")).statusCode, 404);
  assert.equal((await invoke(f.handler, "me")).statusCode, 405);
  assert.equal(f.calls.length, 0);
});
test("enforces rate limits before sending an email", async () => {
  const f = fixture((url) =>
    url.includes("consume_rate_limit") ? response(false) : null,
  );
  const r = await invoke(f.handler, "auth/start", {
    body: { email: "a@example.com", adultConfirmed: true },
  });
  assert.equal(r.statusCode, 429);
  assert.ok(!f.calls.some((c) => c.url.endsWith("/otp")));
});
test("OTP creates HttpOnly Secure cookies without exposing tokens in JSON", async () => {
  const f = fixture((url) =>
    url.endsWith("/verify")
      ? response({
          access_token: "access-secret",
          refresh_token: "refresh-secret",
          expires_in: 3600,
        })
      : null,
  );
  const r = await invoke(f.handler, "auth/verify", {
    body: { email: "a@example.com", code: "123456" },
  });
  assert.equal(r.statusCode, 200);
  assert.ok(
    r.headers["set-cookie"].every(
      (x) =>
        x.includes("HttpOnly") &&
        x.includes("Secure") &&
        x.includes("SameSite=Lax"),
    ),
  );
  assert.ok(!JSON.stringify(r.data).includes("secret"));
});
test("expired sessions refresh and verify user before access", async () => {
  let reads = 0;
  const f = fixture((url) => {
    if (url.endsWith("/user"))
      return ++reads === 1 ? response({}, 401) : response(confirmed);
    if (url.includes("grant_type=refresh_token"))
      return response({
        access_token: "new-access",
        refresh_token: "new-refresh",
        expires_in: 3600,
      });
  });
  const r = await invoke(f.handler, "me", {
    method: "GET",
    headers: { cookie: "cl_access=expired; cl_refresh=refresh" },
  });
  assert.equal(r.statusCode, 200);
  assert.ok(r.headers["set-cookie"][0].includes("new-access"));
});
test("Stripe failures fail closed rather than grant membership", async () => {
  const f = fixture((url) =>
    url.includes("stripe.com")
      ? response({ error: "secret provider details" }, 500)
      : null,
  );
  const r = await invoke(f.handler, "me", { method: "GET" });
  assert.equal(r.statusCode, 503);
  assert.ok(!JSON.stringify(r.data).includes("secret provider"));
});
test("membership recognizes only correct price and eligible statuses", () => {
  for (const status of [
    "past_due",
    "unpaid",
    "incomplete",
    "canceled",
    "paused",
  ])
    assert.equal(
      subscriptionAccess([{ ...active, status }], "price_month").active,
      false,
    );
  assert.equal(subscriptionAccess([active], "another_price").active, false);
  assert.equal(
    subscriptionAccess(
      [{ ...active, cancel_at_period_end: true }],
      "price_month",
    ).active,
    true,
  );
});
test("checkout rejects duplicate active subscription and releases lock", async () => {
  const f = fixture((url) =>
    url.includes("/prices/")
      ? response({
          active: true,
          unit_amount: 1700,
          currency: "usd",
          recurring: { interval: "month", interval_count: 1 },
        })
      : null,
  );
  const r = await invoke(f.handler, "billing/checkout");
  assert.equal(r.statusCode, 409);
  assert.ok(!f.calls.some((c) => c.url.endsWith("/checkout/sessions")));
  assert.ok(f.calls.at(-1).url.includes("release_billing_lock"));
});
test("checkout rejects an incorrectly configured price", async () => {
  const f = fixture((url) =>
    url.includes("/prices/")
      ? response({
          active: true,
          unit_amount: 9900,
          currency: "usd",
          recurring: { interval: "month", interval_count: 1 },
        })
      : null,
  );
  assert.equal((await invoke(f.handler, "billing/checkout")).statusCode, 503);
});
test("checkout uses configured price and safe redirect, ignores client fields", async () => {
  const f = fixture((url, o) => {
    if (url.includes("/prices/"))
      return response({
        active: true,
        unit_amount: 1700,
        currency: "usd",
        recurring: { interval: "month", interval_count: 1 },
      });
    if (url.includes("/subscriptions?") || url.includes("/checkout/sessions?"))
      return response({ data: [], has_more: false });
    if (url.endsWith("/checkout/sessions")) {
      const p = new URLSearchParams(o.body);
      assert.equal(p.get("line_items[0][price]"), "price_month");
      assert.equal(p.get("customer"), "cus_owned");
      assert.equal(
        p.get("success_url"),
        "https://clearline.test/account?checkout=success",
      );
      return response({ url: "https://checkout.stripe.com/pay/123" });
    }
  });
  const r = await invoke(f.handler, "billing/checkout", {
    body: { priceId: "price_free", success_url: "https://evil.test" },
  });
  assert.equal(r.statusCode, 200);
});
test("billing lock prevents concurrent subscription creation", async () => {
  const f = fixture((url) =>
    url.includes("acquire_billing_lock") ? response(false) : null,
  );
  const r = await invoke(f.handler, "billing/checkout");
  assert.equal(r.statusCode, 409);
  assert.ok(!f.calls.some((c) => c.url.includes("stripe.com")));
});
test("webhook rejects stale, modified and unsigned bodies", async () => {
  const raw = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
  const ts = String(now / 1000);
  const signature = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
    .update(`${ts}.${raw}`)
    .digest("hex");
  assert.equal(
    verifySignature(
      raw,
      `t=${ts},v1=${signature}`,
      env.STRIPE_WEBHOOK_SECRET,
      now,
    ),
    true,
  );
  assert.equal(
    verifySignature(
      raw + " ",
      `t=${ts},v1=${signature}`,
      env.STRIPE_WEBHOOK_SECRET,
      now,
    ),
    false,
  );
  assert.equal(
    verifySignature(
      raw,
      `t=${ts},v1=${signature}`,
      env.STRIPE_WEBHOOK_SECRET,
      now + 301000,
    ),
    false,
  );
  const f = fixture();
  assert.equal(
    (await invoke(f.handler, "webhooks/stripe", { body: raw })).statusCode,
    400,
  );
});
test("duplicate valid events are idempotent upserts; no payload or entitlements written", async () => {
  const raw = JSON.stringify({
    id: "evt_1",
    type: "invoice.paid",
    data: { object: { email: "private@example.com" } },
  });
  const ts = String(now / 1000);
  const signature = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
    .update(`${ts}.${raw}`)
    .digest("hex");
  const f = fixture((url, o) => {
    if (url.includes("billing_events?")) {
      assert.match(o.headers.Prefer, /ignore-duplicates/);
      assert.deepEqual(JSON.parse(o.body), {
        event_id: "evt_1",
        event_type: "invoice.paid",
      });
      return response(null);
    }
  });
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await invoke(f.handler, "webhooks/stripe", {
          headers: {
            "stripe-signature": `t=${ts},v1=${signature}`,
            origin: "https://stripe.com",
          },
          body: raw,
        })
      ).statusCode,
      200,
    );
});
test("rejects oversized input", async () => {
  const f = fixture();
  assert.equal(
    (await invoke(f.handler, "auth/start", { body: "x".repeat(17000) }))
      .statusCode,
    413,
  );
  assert.equal(f.calls.length, 0);
});
test("delete requires typed confirmation and cancels billing before removing login", async () => {
  const f = fixture((url, o) => {
    if (url.includes("/checkout/sessions?"))
      return response({ data: [{ id: "cs_open" }], has_more: false });
    if (
      url.includes("/subscriptions/sub_1") ||
      url.includes("/checkout/sessions/cs_open")
    )
      return response({});
    if (url.endsWith("/customers/cus_owned"))
      return response({ id: "cus_owned" });
    if (url.includes("/admin/users/")) return response({});
  });
  assert.equal(
    (await invoke(f.handler, "account/delete", { body: { confirm: "NO" } }))
      .statusCode,
    400,
  );
  const r = await invoke(f.handler, "account/delete", {
    body: { confirm: "DELETE" },
  });
  assert.equal(r.statusCode, 200);
  const cancel = f.calls.findIndex(
    (c) =>
      c.url.endsWith("/subscriptions/sub_1") && c.options.method === "DELETE",
  );
  const remove = f.calls.findIndex((c) => c.url.includes("/admin/users/"));
  assert.ok(cancel >= 0 && cancel < remove);
  assert.ok(r.headers["set-cookie"].every((c) => c.includes("Max-Age=0")));
});
