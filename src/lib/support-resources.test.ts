import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { supportResources } from "../config/brand";

describe("support resources", () => {
  it("configures the exact required resources", () => {
    expect(supportResources.gambling.phraseNumber).toBe("1-800-MY-RESET");
    expect(supportResources.gambling.digitsNumber).toBe("1-800-697-3738");
    expect(supportResources.gambling.note).toContain("not an emergency service");
    expect(supportResources.crisis.number).toBe("988");
    expect(supportResources.emergency.number).toBe("911");
  });

  it("renders all three resources in the support panel component", () => {
    const src = readFileSync(
      join(__dirname, "..", "components", "SupportPanel.tsx"),
      "utf8",
    );
    // The panel renders from config; verify it uses every resource group.
    expect(src).toContain("supportResources.gambling");
    expect(src).toContain("supportResources.crisis");
    expect(src).toContain("supportResources.emergency");
    expect(src).toContain("tel:18006973738");
    expect(src).toContain("tel:988");
    expect(src).toContain("tel:911");
  });
});
