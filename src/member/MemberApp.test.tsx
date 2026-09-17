import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { MemberApp, SupportPage } from "./MemberApp";
const member = {
  user: { id: "test-account", email: "member@example.com" },
  membership: {
    active: true,
    status: "active",
    cancelAtPeriodEnd: false,
    periodEnd: null,
  },
};
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => member }),
  );
  vi.stubGlobal("confirm", () => true);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("member flow", () => {
  it("saves a real plan and activity locally, updates the report, no data sent to API", async () => {
    const user = userEvent.setup();
    render(<MemberApp />);
    await user.click(
      await screen.findByRole("button", { name: "Create my plan" }),
    );
    await user.type(screen.getByLabelText("Maximum amount wagered ($)"), "200");
    await user.type(screen.getByLabelText("Maximum net loss ($)"), "100");
    await user.type(screen.getByLabelText("Maximum gambling days (0–28)"), "5");
    await user.type(screen.getByLabelText("Total time limit (minutes)"), "120");
    await user.click(screen.getByRole("button", { name: "Save my plan" }));
    await user.click(screen.getByRole("button", { name: /^Activity$/ }));
    await user.click(screen.getByRole("button", { name: "Add entry" }));
    await user.type(screen.getByLabelText("Platform or venue"), "Example app");
    await user.type(screen.getByLabelText("Amount wagered ($)"), "340");
    await user.type(
      screen.getByLabelText("Net result ($, losses negative)"),
      "-50",
    );
    await user.type(screen.getByLabelText("Time spent (minutes)"), "45");
    await user.click(screen.getByRole("button", { name: "Save entry" }));
    await user.click(screen.getByRole("button", { name: "My picture" }));
    expect(
      await screen.findByText(
        "You recorded $140 more in wagers than you planned.",
      ),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("clearline-member-v1:test-account")).toContain(
      "Example app",
    );
  });
  it("does not load the demo into a new account", async () => {
    localStorage.setItem(
      "clearline-demo-v1",
      JSON.stringify({ entries: [{ platform: "DEMO_SECRET" }] }),
    );
    render(<MemberApp />);
    expect(
      await screen.findByText("Start with your own boundaries."),
    ).toBeInTheDocument();
    expect(screen.queryByText("DEMO_SECRET")).not.toBeInTheDocument();
  });
  it("allows unpaid users to access their data controls", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...member,
        membership: { ...member.membership, active: false, status: "none" },
      }),
    } as Response);
    const user = userEvent.setup();
    render(<MemberApp />);
    await user.click(
      await screen.findByRole("button", { name: "My data & account" }),
    );
    expect(
      screen.getByRole("button", { name: "Export activity & reflections" }),
    ).toBeInTheDocument();
  });
  it("reports provider failure instead of claiming an email was sent", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Please sign in" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: "Services are not configured." }),
      } as Response);
    const user = userEvent.setup();
    render(<MemberApp />);
    await user.type(
      await screen.findByLabelText("Email address"),
      "a@example.com",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Email me a code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Services are not configured.",
    );
    expect(screen.queryByText("Check your inbox")).not.toBeInTheDocument();
  });
  it("free support does not make an account or billing API request", async () => {
    render(<SupportPage />);
    await waitFor(() =>
      expect(screen.getByText("Support is within reach.")).toBeInTheDocument(),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
