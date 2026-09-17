import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Log } from "./Log";
import { DemoStateProvider } from "../../lib/DemoStateProvider";

/**
 * Exercises the real activity-log form, not just the state transitions:
 * adding, editing, and deleting an entry through the UI the user sees.
 */

function renderLog() {
  return render(
    <MemoryRouter>
      <DemoStateProvider>
        <Log />
      </DemoStateProvider>
    </MemoryRouter>,
  );
}

async function addEntry(
  user: ReturnType<typeof userEvent.setup>,
  values: { date: string; platform: string; wagered: string; net: string; minutes: string },
) {
  await user.click(screen.getByRole("button", { name: /add entry/i }));
  // A native date input takes a value, not keystrokes.
  fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: values.date } });
  await user.type(screen.getByLabelText(/platform or venue/i), values.platform);
  await user.type(screen.getByLabelText(/amount wagered/i), values.wagered);
  await user.type(screen.getByLabelText(/net result/i), values.net);
  await user.type(screen.getByLabelText(/time spent/i), values.minutes);
  await user.click(screen.getByRole("button", { name: /add to log/i }));
}

const SAMPLE = {
  date: "2026-09-10",
  platform: "Sportsbook app",
  wagered: "40",
  net: "-15",
  minutes: "45",
};

describe("activity log UI", () => {
  it("starts empty and shows the empty state", () => {
    renderLog();
    expect(screen.getByText(/nothing recorded yet/i)).toBeInTheDocument();
  });

  it("adds an entry and shows it in the table", async () => {
    const user = userEvent.setup();
    renderLog();
    await addEntry(user, SAMPLE);

    const table = screen.getByRole("table");
    expect(within(table).getByText("Sportsbook app")).toBeInTheDocument();
    expect(within(table).getByText("$40")).toBeInTheDocument();
    expect(within(table).getByText("-$15")).toBeInTheDocument();
    expect(screen.queryByText(/nothing recorded yet/i)).not.toBeInTheDocument();
  });

  it("refuses an entry with no platform and reports why", async () => {
    const user = userEvent.setup();
    renderLog();
    await user.click(screen.getByRole("button", { name: /add entry/i }));
    fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: "2026-09-10" } });
    await user.click(screen.getByRole("button", { name: /add to log/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/date and a platform or venue/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("edits an existing entry in place", async () => {
    const user = userEvent.setup();
    renderLog();
    await addEntry(user, SAMPLE);

    await user.click(screen.getByRole("button", { name: /edit entry from/i }));
    const platform = screen.getByLabelText(/platform or venue/i);
    await user.clear(platform);
    await user.type(platform, "Online poker");
    const wagered = screen.getByLabelText(/amount wagered/i);
    await user.clear(wagered);
    await user.type(wagered, "75");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    const table = screen.getByRole("table");
    expect(within(table).getByText("Online poker")).toBeInTheDocument();
    expect(within(table).getByText("$75")).toBeInTheDocument();
    expect(within(table).queryByText("Sportsbook app")).not.toBeInTheDocument();
    // Editing must not create a second row.
    expect(within(table).getAllByRole("row")).toHaveLength(2); // header + one entry
  });

  it("deletes an entry and returns to the empty state", async () => {
    const user = userEvent.setup();
    renderLog();
    await addEntry(user, SAMPLE);
    expect(screen.getByRole("table")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete entry from/i }));

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/nothing recorded yet/i)).toBeInTheDocument();
  });

  it("loads the example month with twelve entries", async () => {
    const user = userEvent.setup();
    renderLog();
    await user.click(screen.getByRole("button", { name: /load example month/i }));

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(13); // header + 12 seeded entries
  });
});
