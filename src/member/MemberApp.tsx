import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Handshake,
  ArrowRight,
  Download,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { api, ApiError, billingRedirect } from "./api";
import type { Session } from "./api";
import {
  addDays,
  blankData,
  dataKey,
  downloadJson,
  moneyToCents,
  parseMemberData,
  readMemberData,
  today,
  validEntry,
  writeMemberData,
} from "./model";
import type { MemberData, Reflection } from "./model";
import type { ActivityEntry, PersonalPlan, GoalId } from "../lib/types";
import { goalOptions } from "../lib/types";
import { comparePlanToRecorded } from "../lib/calculations";
import { formatCents, formatMinutes } from "../lib/format";
import "./member.css";
import { BrandMark } from "./BrandMark";

type Tab = "overview" | "plan" | "activity" | "journal" | "account";
const message = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Please try again.";
export function MemberLogo() {
  return (
    <a className="cl-logo" href="/">
      <BrandMark />
      clearline
    </a>
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cl-app">
      <header className="cl-header">
        <MemberLogo />
        <a href="/support">
          Free support <ArrowRight size={16} />
        </a>
      </header>
      {children}
      <footer className="cl-footer">
        Your pace. Your limits. Your next step.{" "}
        <a href="/support">Support resources</a>
        <span>
          For adults 18+. Educational reflection tools, not treatment or
          emergency monitoring.
        </span>
      </footer>
    </div>
  );
}
export function MemberApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    setError("");
    try {
      setSession(await api<Session>("me"));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) setError(message(e));
      setSession(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  return (
    <Shell>
      {loading ? (
        <main className="cl-loading" role="status">
          Opening your space…
        </main>
      ) : session ? (
        <Workspace
          key={session.user.id}
          session={session}
          refresh={refresh}
          onLogout={() => setSession(null)}
        />
      ) : (
        <Login error={error} onSignedIn={refresh} />
      )}
    </Shell>
  );
}
function Login({
  error,
  onSignedIn,
}: {
  error: string;
  onSignedIn: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [adult, setAdult] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(error);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      if (sent) {
        await api("auth/verify", { email, code });
        await onSignedIn();
      } else {
        await api("auth/start", { email, adultConfirmed: adult });
        setSent(true);
      }
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="cl-auth">
      <div>
        <p className="cl-eyebrow">CLARITY, AT YOUR PACE</p>
        <h1>
          A clearer picture.
          <br />
          <em>Your own space.</em>
        </h1>
        <p>
          Set your boundaries, understand your patterns and choose your next
          step.
        </p>
        <div className="cl-auth-note">
          <ShieldCheck />
          <p>
            Your activity and reflections stay in this browser. Your account is
            used for sign-in and billing.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="cl-card">
        <h2>{sent ? "Check your inbox" : "Welcome to Clearline"}</h2>
        <p>
          {sent
            ? `Enter the sign-in code sent to ${email}.`
            : "Create an account or sign in with a one-time email code."}
        </p>
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            disabled={sent}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {sent ? (
          <label>
            Sign-in code
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              minLength={6}
              maxLength={8}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </label>
        ) : (
          <label className="cl-checkbox">
            <input
              type="checkbox"
              required
              checked={adult}
              onChange={(e) => setAdult(e.target.checked)}
            />
            I confirm I am 18 or older.
          </label>
        )}
        {notice && (
          <p className="cl-error" role="alert">
            {notice}
          </p>
        )}
        <button className="cl-primary" disabled={busy}>
          {busy ? "Please wait…" : sent ? "Sign in" : "Email me a code"}
          <ArrowRight size={18} />
        </button>
        {sent && (
          <button
            type="button"
            className="cl-link"
            disabled={busy}
            onClick={() => {
              setSent(false);
              setCode("");
              setNotice("");
            }}
          >
            Use another email or request a new code
          </button>
        )}
        <p className="cl-small">
          Membership is $17/month. Signing in does not charge you. Free support
          does not require an account.
        </p>
      </form>
    </main>
  );
}
function Workspace({
  session,
  refresh,
  onLogout,
}: {
  session: Session;
  refresh: () => Promise<void>;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>(
    location.pathname === "/account" ? "account" : "overview",
  );
  const [data, setData] = useState<MemberData>(blankData);
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const uid = session.user.id;
  const paid = session.membership.active;
  useEffect(() => {
    try {
      setData(readMemberData(uid));
      setStorageError(false);
    } catch {
      setStorageError(true);
      setNotice(
        "Your saved data could not be read. It has not been overwritten. Export the raw backup or restore a valid backup from My data.",
      );
    }
  }, [uid]);
  useEffect(() => {
    const changed = (e: StorageEvent) => {
      if (e.key === dataKey(uid)) {
        try {
          setData(readMemberData(uid));
          setStorageError(false);
        } catch {
          setStorageError(true);
          setNotice("A change in another tab could not be read. Open My data.");
        }
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [uid]);
  function save(next: MemberData) {
    if (storageError)
      throw Error("Resolve the saved-data error in My data before editing.");
    writeMemberData(uid, next);
    setData(next);
    setNotice("Saved on this device.");
  }
  async function action(task: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await task();
    } catch (e) {
      setNotice(message(e));
      if (e instanceof ApiError && e.status === 401) onLogout();
    } finally {
      setBusy(false);
    }
  }
  async function checkout() {
    await action(async () => {
      const r = await api<{ url: string }>("billing/checkout", {});
      billingRedirect(r.url);
    });
  }
  async function logout() {
    await action(async () => {
      await api("auth/logout", {});
      onLogout();
    });
  }
  return (
    <main className="cl-workspace">
      <div className="cl-topline">
        <div>
          <p className="cl-eyebrow">YOUR CLEARLINE</p>
          <h1>Welcome back.</h1>
          <p>One honest check-in at a time.</p>
        </div>
        <button className="cl-secondary" disabled={busy} onClick={logout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <nav className="cl-tabs" aria-label="Member navigation">
        {(["overview", "plan", "activity", "journal", "account"] as Tab[]).map(
          (t) => (
            <button
              key={t}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => {
                setTab(t);
                setNotice("");
              }}
            >
              {
                {
                  overview: "My picture",
                  plan: "My plan",
                  activity: "Activity",
                  journal: "Reflections",
                  account: "My data & account",
                }[t]
              }
            </button>
          ),
        )}
      </nav>
      <p className="cl-local-note">
        Records stay in this browser. They do not sync across devices. Export a
        backup before clearing browser data or moving to another device.
      </p>
      {notice && (
        <p role="status" className="cl-notice">
          {notice}
        </p>
      )}
      {storageError && tab !== "account" ? (
        <div className="cl-card">
          <h2>Your saved records need attention.</h2>
          <p>
            Open My data to export the raw file, restore a backup or clear this
            device’s records.
          </p>
          <button className="cl-primary" onClick={() => setTab("account")}>
            Open My data
          </button>
        </div>
      ) : tab === "account" ? (
        <Account
          session={session}
          data={data}
          storageError={storageError}
          busy={busy}
          run={action}
          refresh={refresh}
          checkout={checkout}
          onDeleted={onLogout}
          replace={(next) => {
            writeMemberData(uid, next);
            setData(next);
            setStorageError(false);
            setNotice("Backup restored on this device.");
          }}
          clear={() => {
            localStorage.removeItem(dataKey(uid));
            setData(blankData());
            setStorageError(false);
            setNotice("Activity records on this device have been deleted.");
          }}
        />
      ) : !paid ? (
        <div className="cl-card cl-paywall">
          <p className="cl-eyebrow">ONE SIMPLE MEMBERSHIP</p>
          <h2>
            A little more clarity.
            <br />
            $17 / month.
          </h2>
          <p>
            Personal limits, activity logging, weekly and monthly summaries, and
            space to reflect.
          </p>
          <p className="cl-small">
            Billed monthly. Cancel anytime. Your existing records remain
            available for export or deletion in My data.
          </p>
          <div className="cl-actions">
            <button className="cl-primary" disabled={busy} onClick={checkout}>
              Start membership <ArrowRight size={18} />
            </button>
            <button className="cl-secondary" onClick={() => void refresh()}>
              Refresh payment status
            </button>
            <a href="/support">Explore free support</a>
          </div>
        </div>
      ) : tab === "plan" ? (
        <PlanForm plan={data.plan} onSave={(plan) => save({ ...data, plan })} />
      ) : tab === "activity" ? (
        <Activity data={data} save={save} />
      ) : tab === "journal" ? (
        <Journal data={data} save={save} />
      ) : (
        <Overview
          data={data}
          onPlan={() => setTab("plan")}
          onLog={() => setTab("activity")}
          onReflect={() => setTab("journal")}
        />
      )}
    </main>
  );
}
function Overview({
  data,
  onPlan,
  onLog,
  onReflect,
}: {
  data: MemberData;
  onPlan: () => void;
  onLog: () => void;
  onReflect: () => void;
}) {
  const [range, setRange] = useState<"plan" | "week" | "month">("plan");
  const p = data.plan;
  if (!p)
    return (
      <div className="cl-card cl-empty">
        <Handshake size={45} />
        <h2>Start with your own boundaries.</h2>
        <p>
          Choose a four-week plan. Zero is a valid limit if you’re taking a
          break.
        </p>
        <button className="cl-primary" onClick={onPlan}>
          Create my plan
        </button>
      </div>
    );
  const c = comparePlanToRecorded(p, data.entries);
  const end = today();
  const start = range === "week" ? addDays(end, -6) : `${end.slice(0, 7)}-01`;
  const records =
    range === "plan"
      ? data.entries.filter(
          (e) => e.date >= p.startDate && e.date < addDays(p.startDate, 28),
        )
      : data.entries.filter((e) => e.date >= start && e.date <= end);
  const wagered = records.reduce((a, e) => a + e.amountWageredCents, 0);
  const net = records.reduce((a, e) => a + e.netResultCents, 0);
  const minutes = records.reduce((a, e) => a + e.timeSpentMinutes, 0);
  return (
    <>
      <div className="cl-section-heading">
        <div>
          <h2>Your picture, in focus.</h2>
          <p>
            {range === "plan"
              ? `${p.startDate} to ${addDays(p.startDate, 27)}`
              : `${start} to ${end}`}
          </p>
        </div>
        <select
          aria-label="Report period"
          value={range}
          onChange={(e) => setRange(e.target.value as typeof range)}
        >
          <option value="plan">Four-week plan</option>
          <option value="week">Last 7 days</option>
          <option value="month">This calendar month</option>
        </select>
      </div>
      {p.pauseUntil && (
        <p className="cl-notice">
          Your self-directed pause is noted through {p.pauseUntil}. Clearline
          does not block bets.
        </p>
      )}
      <div className="cl-metrics">
        <div className="cl-card">
          <p>Amount wagered</p>
          <strong>{formatCents(wagered)}</strong>
          <span>Not the same as net loss</span>
        </div>
        <div className="cl-card">
          <p>Net result</p>
          <strong>{formatCents(net, { sign: true })}</strong>
          <span>Based on your entries</span>
        </div>
        <div className="cl-card">
          <p>Time recorded</p>
          <strong>{formatMinutes(minutes)}</strong>
          <span>
            {new Set(records.map((e) => e.date)).size} gambling{" "}
            {new Set(records.map((e) => e.date)).size === 1 ? "day" : "days"} ·{" "}
            {records.length} {records.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>
      {range === "plan" && (
        <div className="cl-card">
          <h3>Your plan vs. your record</h3>
          <div className="cl-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Measure</th>
                  <th>Your limit</th>
                  <th>Recorded</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Amount wagered</td>
                  <td>{formatCents(p.maxWageredCents)}</td>
                  <td>{formatCents(c.recordedWageredCents)}</td>
                </tr>
                <tr>
                  <td>Net loss</td>
                  <td>{formatCents(p.maxNetLossCents)}</td>
                  <td>{formatCents(Math.max(0, -c.netResultCents))}</td>
                </tr>
                <tr>
                  <td>Time</td>
                  <td>{formatMinutes(p.maxTimeMinutes)}</td>
                  <td>{formatMinutes(c.recordedMinutes)}</td>
                </tr>
                <tr>
                  <td>Gambling days</td>
                  <td>{p.maxGamblingDays}</td>
                  <td>{c.recordedDays}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="cl-insight">
            {records.length === 0
              ? "No activity recorded for this period yet."
              : c.wageredDifferenceCents > 0
                ? `You recorded ${formatCents(c.wageredDifferenceCents)} more in wagers than you planned.`
                : `Your recorded wagers are ${formatCents(Math.abs(c.wageredDifferenceCents))} below your four-week limit. This is a comparison, not a suggestion to use the difference.`}
          </p>
          <p className="cl-small">
            {data.entries.length - records.length} entries outside this window
            are excluded. Reports reflect only what you have recorded.
          </p>
        </div>
      )}
      {range === "plan" && (
        <div className="cl-card">
          <h3>Week by week</h3>
          <div className="cl-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Wagered</th>
                  <th>Net result</th>
                  <th>Time</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {c.weeks.map((w) => (
                  <tr key={w.weekIndex}>
                    <td>{w.label}</td>
                    <td>{formatCents(w.wageredCents)}</td>
                    <td>{formatCents(w.netResultCents, { sign: true })}</td>
                    <td>{formatMinutes(w.minutes)}</td>
                    <td>{w.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="cl-card cl-reflect-callout">
        <div>
          <h3>What would you like to change next week?</h3>
          <p>Make a note. Take a pause. Choose your next step.</p>
        </div>
        <button className="cl-primary" onClick={onReflect}>
          Reflect <ArrowRight size={18} />
        </button>
      </div>
      <div className="cl-actions">
        <button className="cl-secondary" onClick={onLog}>
          Add activity
        </button>
        <button className="cl-link" onClick={onPlan}>
          Review my plan
        </button>
        <a href="/support">Explore safeguards and support</a>
      </div>
    </>
  );
}
function PlanForm({
  plan,
  onSave,
}: {
  plan: PersonalPlan | null;
  onSave: (p: PersonalPlan) => void;
}) {
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      const f = new FormData(e.currentTarget);
      const p: PersonalPlan = {
        createdAt: plan?.createdAt || new Date().toISOString(),
        startDate: String(f.get("start")),
        goal: String(f.get("goal")) as GoalId,
        maxWageredCents: moneyToCents(String(f.get("wagers"))),
        maxNetLossCents: moneyToCents(String(f.get("loss"))),
        maxGamblingDays: Number(f.get("days")),
        maxTimeMinutes: Number(f.get("minutes")),
        prohibitedFundingSources: String(f.get("funding"))
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        dataChoices: {
          manualLogging: true,
          simulatedImport: false,
          localReminders: false,
          aggregateResearch: false,
        },
        adultConfirmed: true,
        pauseUntil: String(f.get("pause")) || null,
      };
      parseMemberData(JSON.stringify({ ...blankData(), plan: p }));
      onSave(p);
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <form className="cl-card" onSubmit={submit}>
      <h2>Your boundaries. In your words.</h2>
      <p>
        Limits apply to the full four-week period. They are personal goals, not
        enforced restrictions.
      </p>
      <div className="cl-form-grid">
        <label>
          Plan starts
          <input
            name="start"
            type="date"
            required
            defaultValue={plan?.startDate || today()}
          />
        </label>
        <label>
          My goal
          <select name="goal" defaultValue={plan?.goal || "understand"}>
            {goalOptions.map((g) => (
              <option value={g.id} key={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Maximum amount wagered ($)
          <input
            name="wagers"
            type="number"
            required
            min="0"
            max="100000000"
            step="0.01"
            defaultValue={plan ? plan.maxWageredCents / 100 : ""}
          />
        </label>
        <label>
          Maximum net loss ($)
          <input
            name="loss"
            type="number"
            required
            min="0"
            max="100000000"
            step="0.01"
            defaultValue={plan ? plan.maxNetLossCents / 100 : ""}
          />
        </label>
        <label>
          Maximum gambling days (0–28)
          <input
            name="days"
            type="number"
            required
            min="0"
            max="28"
            step="1"
            defaultValue={plan?.maxGamblingDays ?? ""}
          />
        </label>
        <label>
          Total time limit (minutes)
          <input
            name="minutes"
            type="number"
            required
            min="0"
            max="40320"
            step="1"
            defaultValue={plan?.maxTimeMinutes ?? ""}
          />
        </label>
        <label>
          Funding sources off-limits (optional)
          <input
            name="funding"
            maxLength={400}
            placeholder="Credit cards, household savings"
            defaultValue={plan?.prohibitedFundingSources.join(", ") || ""}
          />
        </label>
        <label>
          Pause through (optional)
          <input
            name="pause"
            type="date"
            defaultValue={plan?.pauseUntil || ""}
          />
        </label>
      </div>
      <p className="cl-small">
        Changing the start date changes your reporting window. Your old entries
        remain in the log.
      </p>
      {error && (
        <p role="alert" className="cl-error">
          {error}
        </p>
      )}
      <button className="cl-primary" type="submit">
        Save my plan
      </button>
    </form>
  );
}
function Activity({
  data,
  save,
}: {
  data: MemberData;
  save: (d: MemberData) => void;
}) {
  const [editing, setEditing] = useState<ActivityEntry | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const f = new FormData(e.currentTarget);
      const entry: ActivityEntry = {
        id: editing?.id || crypto.randomUUID(),
        date: String(f.get("date")),
        platform: String(f.get("platform")).trim(),
        amountWageredCents: moneyToCents(String(f.get("wagers"))),
        netResultCents: moneyToCents(String(f.get("net")), true),
        timeSpentMinutes: Number(f.get("minutes")),
        note: String(f.get("note")).trim(),
      };
      if (!validEntry(entry) || entry.date > today())
        throw Error(
          "Check the date and amounts. Activity dates cannot be in the future.",
        );
      save({
        ...data,
        entries: editing
          ? data.entries.map((x) => (x.id === entry.id ? entry : x))
          : [...data.entries, entry],
      });
      setShow(false);
      setEditing(null);
      setError("");
    } catch (e) {
      setError(message(e));
    }
  }
  function remove(id: string) {
    if (!confirm("Delete this activity entry from this device?")) return;
    try {
      save({ ...data, entries: data.entries.filter((e) => e.id !== id) });
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <>
      <div className="cl-section-heading">
        <div>
          <h2>Your activity log.</h2>
          <p>Record what happened. No account connections needed.</p>
        </div>
        <button
          className="cl-primary"
          onClick={() => {
            setEditing(null);
            setShow(true);
            setError("");
          }}
        >
          Add entry
        </button>
      </div>
      {error && (
        <p role="alert" className="cl-error">
          {error}
        </p>
      )}
      {show && (
        <form className="cl-card" onSubmit={submit} key={editing?.id || "new"}>
          <h3>{editing ? "Edit entry" : "New entry"}</h3>
          <div className="cl-form-grid">
            <label>
              Date
              <input
                name="date"
                type="date"
                required
                max={today()}
                defaultValue={editing?.date || today()}
              />
            </label>
            <label>
              Platform or venue
              <input
                name="platform"
                required
                maxLength={100}
                placeholder="Name of app or venue"
                defaultValue={editing?.platform || ""}
              />
            </label>
            <label>
              Amount wagered ($)
              <input
                name="wagers"
                type="number"
                min="0"
                max="100000000"
                step="0.01"
                required
                defaultValue={editing ? editing.amountWageredCents / 100 : ""}
              />
            </label>
            <label>
              Net result ($, losses negative)
              <input
                name="net"
                type="number"
                min="-100000000"
                max="100000000"
                step="0.01"
                required
                defaultValue={editing ? editing.netResultCents / 100 : ""}
              />
            </label>
            <label>
              Time spent (minutes)
              <input
                name="minutes"
                type="number"
                min="0"
                max="1440"
                step="1"
                required
                defaultValue={editing?.timeSpentMinutes ?? ""}
              />
            </label>
            <label>
              Context (optional)
              <textarea
                name="note"
                maxLength={2000}
                placeholder="Anything you want to remember"
                defaultValue={editing?.note || ""}
              />
            </label>
          </div>
          <div className="cl-actions">
            <button className="cl-primary">Save entry</button>
            <button
              type="button"
              className="cl-secondary"
              onClick={() => {
                setShow(false);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {data.entries.length === 0 ? (
        <div className="cl-card cl-empty">
          <h3>Nothing recorded yet.</h3>
          <p>
            Your member space starts empty. Example data stays in the separate
            demo.
          </p>
        </div>
      ) : (
        <div className="cl-card cl-table-scroll">
          <table>
            <caption className="sr-only">Your recorded activity</caption>
            <thead>
              <tr>
                <th>Date / platform</th>
                <th>Wagered</th>
                <th>Net result</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...data.entries]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.date}</strong>
                      <br />
                      {e.platform}
                      {e.note && <p className="cl-entry-note">{e.note}</p>}
                    </td>
                    <td>{formatCents(e.amountWageredCents)}</td>
                    <td>{formatCents(e.netResultCents, { sign: true })}</td>
                    <td>{formatMinutes(e.timeSpentMinutes)}</td>
                    <td>
                      <div className="cl-actions">
                        <button
                          className="cl-link"
                          aria-label={`Edit ${e.platform} ${e.date}`}
                          onClick={() => {
                            setEditing(e);
                            setShow(true);
                            setError("");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="cl-link"
                          aria-label={`Delete ${e.platform} ${e.date}`}
                          onClick={() => remove(e.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
function Journal({
  data,
  save,
}: {
  data: MemberData;
  save: (d: MemberData) => void;
}) {
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const f = new FormData(e.currentTarget);
      const entry: Reflection = {
        id: crypto.randomUUID(),
        date: today(),
        feeling: String(f.get("feeling")) as Reflection["feeling"],
        text: String(f.get("text")).trim(),
      };
      if (!entry.text) throw Error("Write a reflection before saving.");
      save({ ...data, reflections: [entry, ...data.reflections] });
      e.currentTarget.reset();
      setError("");
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <>
      <form className="cl-card" onSubmit={submit}>
        <p className="cl-eyebrow">A MOMENT TO CHECK IN</p>
        <h2>How are you feeling about this week?</h2>
        <label>
          Right now, I feel
          <select name="feeling">
            <option value="okay">Okay</option>
            <option value="unsure">Unsure</option>
            <option value="concerned">Concerned</option>
          </select>
        </label>
        <label>
          What would you like to remember or change?
          <textarea
            name="text"
            required
            maxLength={4000}
            rows={5}
            placeholder="Start wherever you are…"
          />
        </label>
        {error && (
          <p role="alert" className="cl-error">
            {error}
          </p>
        )}
        <button className="cl-primary">Save reflection</button>
        <p className="cl-small">
          This journal stays on this device. It is not reviewed by a counselor
          or monitored for emergencies. <a href="/support">Find support</a>.
        </p>
      </form>
      {data.reflections.map((r) => (
        <article className="cl-card" key={r.id}>
          <p className="cl-eyebrow">
            {r.date} · {r.feeling}
          </p>
          <p className="cl-journal-text">{r.text}</p>
          <button
            className="cl-link"
            onClick={() => {
              if (confirm("Delete this reflection?")) {
                try {
                  save({
                    ...data,
                    reflections: data.reflections.filter((x) => x.id !== r.id),
                  });
                } catch (e) {
                  setError(message(e));
                }
              }
            }}
          >
            Delete reflection
          </button>
        </article>
      ))}
    </>
  );
}
function Account({
  session,
  data,
  storageError,
  busy,
  run,
  refresh,
  checkout,
  onDeleted,
  replace,
  clear,
}: {
  session: Session;
  data: MemberData;
  storageError: boolean;
  busy: boolean;
  run: (fn: () => Promise<void>) => Promise<void>;
  refresh: () => Promise<void>;
  checkout: () => Promise<void>;
  onDeleted: () => void;
  replace: (d: MemberData) => void;
  clear: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const uid = session.user.id;
  function safe(fn: () => void) {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <>
      <div className="cl-card">
        <h2>My membership</h2>
        <p>{session.user.email}</p>
        <p className="cl-insight">
          {session.membership.active
            ? "Membership active"
            : `Membership: ${session.membership.status}`}
          {session.membership.cancelAtPeriodEnd ? " · Renewal canceled" : ""}
          {session.membership.periodEnd
            ? ` · Current period ends ${new Date(session.membership.periodEnd * 1000).toLocaleDateString()}`
            : ""}
        </p>
        <div className="cl-actions">
          {!session.membership.active && (
            <button disabled={busy} className="cl-primary" onClick={checkout}>
              Subscribe · $17/month
            </button>
          )}
          {session.membership.status !== "none" && (
            <button
              disabled={busy}
              className="cl-secondary"
              onClick={() =>
                void run(async () => {
                  const r = await api<{ url: string }>("billing/portal", {});
                  billingRedirect(r.url);
                })
              }
            >
              Manage billing / cancel
            </button>
          )}
          <button
            disabled={busy}
            className="cl-link"
            onClick={() => void refresh()}
          >
            Refresh status
          </button>
        </div>
        <p className="cl-small">
          Cancellation through the billing portal stops future renewals. You
          keep access through the paid period. Account deletion below ends the
          subscription immediately.
        </p>
      </div>
      <div className="cl-card">
        <h2>My data, on this device.</h2>
        <p>
          Your records are stored in this browser, not on Clearline’s servers.
          Anyone with access to this browser profile may be able to read them.
          They are not encrypted at rest by Clearline.
        </p>
        <p className="cl-small">
          Clearing browser storage removes them. Export a backup before
          switching devices. Signing out does not erase your local records.
        </p>
        {error && (
          <p role="alert" className="cl-error">
            {error}
          </p>
        )}
        <div className="cl-actions">
          <button
            className="cl-secondary"
            onClick={() =>
              safe(() => downloadJson("clearline-activity-backup.json", data))
            }
            disabled={storageError}
          >
            <Download size={16} />
            Export activity & reflections
          </button>
          <button
            className="cl-secondary"
            disabled={busy}
            onClick={() =>
              void run(async () =>
                downloadJson(
                  "clearline-account.json",
                  await api("account/export"),
                ),
              )
            }
          >
            Export account details
          </button>
          {storageError && (
            <button
              className="cl-secondary"
              onClick={() =>
                safe(() => {
                  const raw = localStorage.getItem(dataKey(uid));
                  downloadJson("clearline-raw-backup.json", { raw });
                })
              }
            >
              Export unreadable raw data
            </button>
          )}
        </div>
        <label>
          Restore activity backup (JSON, maximum 5 MB)
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                if (file.size > 5_000_000) throw Error("Backup is too large.");
                const restored = parseMemberData(await file.text());
                if (
                  confirm(
                    "Replace this device’s activity records with this backup? Export your current records first.",
                  )
                )
                  replace(restored);
              } catch (e) {
                setError(message(e));
              }
            }}
          />
        </label>
        <button
          className="cl-danger"
          onClick={() => {
            if (
              confirm(
                "Permanently delete this account’s activity and reflections from this browser? This does not cancel your subscription.",
              )
            )
              safe(clear);
          }}
        >
          Delete local activity & reflections
        </button>
      </div>
      <div className="cl-card">
        <h2>Delete my account</h2>
        <p>
          This cancels your subscription immediately and deletes your Clearline
          login and billing link. It also clears this account’s activity from
          this browser. Records on other devices must be deleted on those
          devices. Payment providers may retain invoices and transaction
          records.
        </p>
        <label>
          Type DELETE to confirm
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button
          className="cl-danger"
          disabled={busy || confirmation !== "DELETE"}
          onClick={() =>
            void run(async () => {
              await api("account/delete", { confirm: confirmation });
              try {
                localStorage.removeItem(dataKey(uid));
              } finally {
                onDeleted();
              }
            })
          }
        >
          Delete account and stop billing
        </button>
      </div>
    </>
  );
}
export function SupportPage() {
  return (
    <Shell>
      <main className="cl-workspace">
        <p className="cl-eyebrow">NO ACCOUNT OR MEMBERSHIP REQUIRED</p>
        <h1>Support is within reach.</h1>
        <p className="cl-lede">
          Explore the next step that feels right for you. Availability and
          safeguards vary by location.
        </p>
        <div className="cl-support-grid">
          <article className="cl-card">
            <h2>Gambling support</h2>
            <p>
              Find problem-gambling support and resources through the National
              Council on Problem Gambling.
            </p>
            <a
              href="https://www.ncpgambling.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore NCPG resources ↗
            </a>
          </article>
          <article className="cl-card">
            <h2>Family & peer support</h2>
            <p>
              Explore resources for people affected by someone else’s gambling.
            </p>
            <a
              href="https://www.gam-anon.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Gam-Anon ↗
            </a>
          </article>
          <article className="cl-card">
            <h2>Safeguards</h2>
            <p>
              Ask your platform about account limits and self-exclusion. Ask
              your bank about available gambling-payment blocks. These options
              vary and may not cover every platform.
            </p>
            <a
              href="https://www.ncpgambling.org/help-treatment/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore help and treatment ↗
            </a>
          </article>
          <article className="cl-card">
            <h2>Emotional crisis support</h2>
            <p>
              In the U.S., call or text <a href="tel:988">988</a>. In immediate
              physical danger, call <a href="tel:911">911</a>. Clearline does
              not provide emergency monitoring.
            </p>
            <a
              href="https://988lifeline.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit 988 Lifeline ↗
            </a>
          </article>
        </div>
      </main>
    </Shell>
  );
}

export function PrivacyPage() {
  return (
    <Shell>
      <main className="cl-workspace">
        <p className="cl-eyebrow">HOW YOUR DATA IS HANDLED</p>
        <h1>Your record. Your control.</h1>
        <div className="cl-card">
          <h2>Activity stays on your device</h2>
          <p>
            Your plan, activity entries and reflections are stored in this
            browser’s local storage, separately for each Clearline account. They
            are not sent to our account or payment services. Export, restore or
            delete them from My data &amp; account.
          </p>
          <p>
            There is no cross-device synchronization. Clearing browser storage
            can permanently remove your records. Anyone who can access your
            browser profile may be able to read them; Clearline does not encrypt
            these records at rest.
          </p>
        </div>
        <div className="cl-card">
          <h2>Accounts and billing are separate</h2>
          <p>
            Supabase handles your email-code sign-in. Stripe handles payment
            information and subscriptions. Clearline keeps the
            account-to-billing connection and limited service records needed to
            operate the product, including hashed rate-limit identifiers and
            payment-event IDs. Your activity journal is not part of those
            records.
          </p>
          <p>
            Session cookies are used for sign-in. This application adds no
            advertising pixels or third-party analytics scripts. Service
            providers may keep their own operational records.
          </p>
        </div>
        <div className="cl-card">
          <h2>Export or leave whenever you choose</h2>
          <p>
            Account details and local activity have separate export controls.
            Deleting your account cancels your subscription immediately, removes
            your login and billing connection, and clears this account’s
            activity in the current browser. Clear local data on any other
            devices separately. Payment providers may retain invoices and
            transaction records.
          </p>
          <p>
            To keep access until the end of your paid period, cancel future
            renewals through Manage billing instead of deleting the account.
          </p>
        </div>
        <div className="cl-card">
          <h2>Support without a subscription</h2>
          <p>
            Free resources are always available. Clearline is an educational
            reflection tool. It does not diagnose, provide therapy, place bets,
            enforce limits or monitor emergencies.
          </p>
          <a href="/support">Explore free support →</a>
        </div>
      </main>
    </Shell>
  );
}
