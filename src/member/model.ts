import type { ActivityEntry, PersonalPlan } from "../lib/types";
import { goalOptions } from "../lib/types";
export interface Reflection {
  id: string;
  date: string;
  feeling: "okay" | "unsure" | "concerned";
  text: string;
}
export interface MemberData {
  version: 1;
  plan: PersonalPlan | null;
  entries: ActivityEntry[];
  reflections: Reflection[];
}
export const blankData = (): MemberData => ({
  version: 1,
  plan: null,
  entries: [],
  reflections: [],
});
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export const addDays = (value: string, days: number) => {
  const d = new Date(`${value}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const integer = (v: unknown, min = 0, max = 1e10): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.length <= max;
const id = (v: unknown): v is string => text(v, 100) && v.length > 0;
export function validEntry(v: unknown): v is ActivityEntry {
  return (
    object(v) &&
    id(v.id) &&
    validDate(v.date) &&
    text(v.platform, 100) &&
    v.platform.trim().length > 0 &&
    integer(v.amountWageredCents) &&
    integer(v.netResultCents, -1e10) &&
    integer(v.timeSpentMinutes, 0, 1440) &&
    (v.note === undefined || text(v.note, 2000))
  );
}
function validPlan(v: unknown): v is PersonalPlan {
  return (
    object(v) &&
    validDate(v.startDate) &&
    text(v.createdAt, 50) &&
    !isNaN(Date.parse(v.createdAt)) &&
    goalOptions.some((g) => g.id === v.goal) &&
    integer(v.maxWageredCents) &&
    integer(v.maxNetLossCents) &&
    integer(v.maxGamblingDays, 0, 28) &&
    integer(v.maxTimeMinutes, 0, 40320) &&
    v.adultConfirmed === true &&
    Array.isArray(v.prohibitedFundingSources) &&
    v.prohibitedFundingSources.every((x) => text(x, 100)) &&
    (v.pauseUntil === null || validDate(v.pauseUntil)) &&
    object(v.dataChoices) &&
    v.dataChoices.manualLogging === true &&
    v.dataChoices.simulatedImport === false &&
    v.dataChoices.aggregateResearch === false &&
    v.dataChoices.localReminders === false
  );
}
export function parseMemberData(raw: string): MemberData {
  if (raw.length > 5_000_000)
    throw Error("Backup is too large (maximum 5 MB).");
  const v: unknown = JSON.parse(raw);
  if (
    !object(v) ||
    v.version !== 1 ||
    !(v.plan === null || validPlan(v.plan)) ||
    !Array.isArray(v.entries) ||
    v.entries.length > 10000 ||
    !v.entries.every(validEntry) ||
    !Array.isArray(v.reflections) ||
    v.reflections.length > 10000 ||
    !v.reflections.every(
      (r) =>
        object(r) &&
        id(r.id) &&
        validDate(r.date) &&
        ["okay", "unsure", "concerned"].includes(String(r.feeling)) &&
        text(r.text, 4000),
    )
  )
    throw Error("This is not a valid Clearline backup. Nothing was changed.");
  if (
    new Set(v.entries.map((e) => e.id)).size !== v.entries.length ||
    new Set(v.reflections.map((r) => r.id)).size !== v.reflections.length
  )
    throw Error("Backup contains duplicate records. Nothing was changed.");
  return {
    version: 1,
    plan: v.plan,
    entries: v.entries,
    reflections: v.reflections,
  } as MemberData;
}
export const dataKey = (userId: string) => `clearline-member-v1:${userId}`;
export function readMemberData(userId: string): MemberData {
  const raw = localStorage.getItem(dataKey(userId));
  return raw ? parseMemberData(raw) : blankData();
}
export function writeMemberData(userId: string, data: MemberData) {
  const raw = JSON.stringify(data);
  parseMemberData(raw);
  localStorage.setItem(dataKey(userId), raw);
}
export function downloadJson(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function moneyToCents(raw: string, allowNegative = false) {
  if (!/^-?\d+(\.\d{1,2})?$/.test(raw.trim()))
    throw Error("Enter a valid dollar amount with at most two decimal places.");
  const n = Math.round(Number(raw) * 100);
  if (!integer(n, allowNegative ? -1e10 : 0))
    throw Error("Amount is outside the supported range.");
  return n;
}
