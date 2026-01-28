import { buildSnapshot, buildSummary } from "./engine";

async function readJson(url) {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`Failed to load ${url}: ${resp.status}`);
  }
  return await resp.json();
}

async function loadProfile(profileId) {
  const fallback = "james_thompson";
  const id = profileId || fallback;
  try {
    return await readJson(`/data/profiles/${id}.json`);
  } catch {
    return await readJson(`/data/profiles/${fallback}.json`);
  }
}

export const fetchProfiles = async () => {
  // Pure-frontend mode: load profiles list from public/ (no /api calls)
  return await readJson("/data/profiles/index.json");
};

export const fetchSnapshot = async (period, question, profile) => {
  const pdata = await loadProfile(profile);
  const snapshot = buildSnapshot(period, pdata.time_series, pdata.expenses);
  const summary = buildSummary(snapshot, question);
  return { snapshot, summary };
};

export const fetchSimulation = async (period, question, profile) => {
  const q = (question || "").trim();
  if (!q) {
    return {
      heading: "",
      lines: ["Type a scenario question first (e.g. 'retire at 65')."],
      enabled: true,
    };
  }

  const pdata = await loadProfile(profile);
  const snap = buildSnapshot(period, pdata.time_series, pdata.expenses);

  try {
    const resp = await fetch("/.netlify/functions/simulate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        period,
        question: q,
        snapshot: snap,
      }),
    });

    if (!resp.ok) {
      console.error("Simulation API error", resp.status);
      throw new Error(`Simulation failed: ${resp.status}`);
    }

    const data = await resp.json();
    if (data && data.heading && Array.isArray(data.lines)) {
      return {
        heading: data.heading,
        lines: data.lines,
        enabled: true,
      };
    }

    throw new Error("Malformed simulation response");
  } catch (err) {
    console.error("Simulation call failed, falling back", err);

    const heading = `Scenario: ${q}`;
    const lines = [
      `Period: ${snap.period}`,
      `Income £${Math.round(snap.salary_monthly)}/month | Expenses £${Math.round(
        snap.monthly_expense_total
      )}/month | Savings £${Math.round(snap.savings_est_monthly)}/month`,
      `Resilience ${Math.round(snap.resilience)}% | Liquidity ${Math.round(
        snap.liquidity
      )}%`,
      "Simulation service is currently unavailable. Showing basic snapshot only.",
    ];
    return { heading, lines, enabled: true };
  }
};
