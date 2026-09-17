import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildSummarySentence } from "./summary";
import { comparePlanToRecorded } from "./calculations";
import { seedEntries, seedPlan } from "./seed";

/**
 * Content-safety check: fails the test run if prohibited, judgmental, or
 * over-promising language appears anywhere in ordinary product source, and if
 * house style is violated.
 *
 * The word lists themselves live only in this test file, which is excluded
 * from its own scan.
 */

const PROHIBITED: Array<{ name: string; re: RegExp }> = [
  { name: "degen", re: /\bdegens?\b/i },
  { name: "irresponsible", re: /\birresponsib\w*/i },
  { name: "addict", re: /\baddict\w*/i },
  { name: "compulsive gambler", re: /compulsive\s+gambl/i },
  { name: "failed", re: /\bfailed\b/i },
  { name: "cure", re: /\bcure[sd]?\b/i },
  { name: "guaranteed recovery", re: /guaranteed\s+recovery/i },
  { name: "recover your losses", re: /recover\s+your\s+losses/i },
  { name: "clinically proven", re: /clinically\s+proven/i },
  // Diagnostic labeling of the user is also prohibited product copy.
  { name: "problem gambler (label)", re: /\byou\s+are\s+a\s+problem\s+gambler\b/i },
  { name: "out of control (label)", re: /\byou\s+(are|were)\s+out\s+of\s+control\b/i },
];

const SRC_ROOT = join(__dirname, "..");
const EXCLUDED_FILES = new Set(["content-safety.test.ts"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(name) && !EXCLUDED_FILES.has(name)) acc.push(full);
  }
  return acc;
}

describe("content safety", () => {
  const files = walk(SRC_ROOT);

  it("scans a meaningful number of source files", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  for (const { name, re } of PROHIBITED) {
    it(`contains no prohibited phrase: "${name}"`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const text = readFileSync(file, "utf8");
        const m = text.match(re);
        if (m) offenders.push(`${file}: "${m[0]}"`);
      }
      expect(offenders, offenders.join("\n")).toEqual([]);
    });
  }

  it("uses no em dashes anywhere (house style)", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (line.includes("—")) offenders.push(`${file}:${i + 1}: ${line.trim().slice(0, 70)}`);
      });
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("never diagnoses the user in the rendered report sentence", () => {
    const now = new Date(2026, 8, 15);
    const sentence = buildSummarySentence(
      comparePlanToRecorded(seedPlan(now), seedEntries(now)),
    ).toLowerCase();

    // It states arithmetic and the completeness caveat, and nothing about the person.
    expect(sentence).toContain("you planned");
    expect(sentence).toContain("you recorded");
    expect(sentence).toContain("entries may be incomplete");
    for (const banned of ["diagnos", "disorder", "addict", "problem gambl", "out of control"]) {
      expect(sentence).not.toContain(banned);
    }
  });

  it("keeps the report page free of diagnostic language", () => {
    const report = readFileSync(join(SRC_ROOT, "pages", "demo", "Report.tsx"), "utf8");
    expect(report).toContain("planned");
    expect(report).toContain("recorded");
    expect(/\bdiagnos(is|e|ed)\b/i.test(report)).toBe(false);
  });
});
