let period = "6M";
let flowChart = null;
let wealthChart = null;

function eur(n){
  try { return "€" + Number(n).toLocaleString(undefined,{maximumFractionDigits:0}); }
  catch(e){ return "€" + n; }
}

function cssVar(name, fallback){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const COLORS = {
  income: cssVar("--accent", "#006a4d"),
  expense: cssVar("--warn", "#d97706"),
  savings: cssVar("--accent2", "#2abf88"),
  grid: cssVar("--grid", "rgba(219,231,227,.9)"),
  muted: cssVar("--muted", "#4b6b61"),
  text: cssVar("--text", "#0b1f1a")
};

const NO_ANIM = { animation: false, responsiveAnimationDuration: 0 };

function setBars(res, liq){
  document.getElementById("res").textContent = `${res}%`;
  document.getElementById("liq").textContent = `${liq}%`;
  document.getElementById("resBar").style.width = `${res}%`;
  document.getElementById("liqBar").style.width = `${liq}%`;
  document.getElementById("resBar").style.background = COLORS.income;
  document.getElementById("liqBar").style.background = COLORS.income;
}

function renderExpenses(expenses, total){
  document.getElementById("expTotal").textContent = `Estimated monthly expenses: ${eur(total)}`;
  const list = document.getElementById("expensesList");
  list.innerHTML = "";
  expenses.forEach(e=>{
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="rowTop">
        <div>${e.label}</div>
        <div>${eur(e.monthly)}</div>
      </div>
      <div class="rowSub">
        <div>Share of expenses</div>
        <div>${e.pct}%</div>
      </div>
      <div class="miniBar">
        <div class="miniFill" style="width:${e.pct}%; background:${COLORS.income}"></div>
      </div>
    `;
    list.appendChild(row);
  });
}

function renderSummary(summary){
  document.getElementById("sumHeadline").textContent = summary.headline || "";
  const ul = document.getElementById("sumBullets");
  ul.innerHTML = "";
  (summary.bullets || []).forEach(b=>{
    const li = document.createElement("li");
    li.textContent = b;
    ul.appendChild(li);
  });
  document.getElementById("sumNote").textContent = summary.note || "";
}

function renderSimulation(payload){
  const headingEl = document.getElementById("simHeading");
  const bodyEl = document.getElementById("simBody");

  headingEl.textContent = payload.heading || "";
  const lines = payload.lines || [];

  bodyEl.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "simulationList";
  lines.forEach(l=>{
    const li = document.createElement("li");
    li.textContent = l;
    ul.appendChild(li);
  });
  bodyEl.appendChild(ul);

  // visual hint if LLM disabled
  const box = document.getElementById("simulationBox");
  box.classList.toggle("disabled", payload.enabled === false);
}

function minMaxPad(values){
  const nums = (values || []).map(Number).filter(v=>isFinite(v));
  if (!nums.length) return {min: 0, max: 100};
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = (max - min) || 1;
  return { min: min - range * 0.15, max: max + range * 0.15 };
}

function drawFlow(flow){
  const title = document.getElementById("flowTitle");
  title.textContent =
    flow.grain === "monthly"
      ? "Flow (month-wise): Income vs Expense vs Savings"
      : "Flow (year-wise): Income vs Expense vs Savings";

  const ctx = document.getElementById("flowChart").getContext("2d");
  if (flowChart) flowChart.destroy();

  const all = [...(flow.income||[]), ...(flow.expense||[]), ...(flow.savings||[])];
  const mm = minMaxPad(all);
  const yMin = 0;
  const yMax = Math.max(mm.max, 1);

  flowChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: flow.labels,
      datasets: [
        { label: "Income",  data: flow.income,  backgroundColor: COLORS.income, borderRadius: 6 },
        { label: "Expense", data: flow.expense, backgroundColor: COLORS.expense, borderRadius: 6 },
        { label: "Savings", data: flow.savings, backgroundColor: COLORS.savings, borderRadius: 6 }
      ]
    },
    options: {
      ...NO_ANIM,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: COLORS.text } } },
      scales: {
        x: { ticks: { color: COLORS.muted }, grid: { color: COLORS.grid } },
        y: { min: yMin, max: yMax, ticks: { color: COLORS.muted }, grid: { color: COLORS.grid } }
      }
    }
  });
}

function drawWealth(labels, points){
  const ctx = document.getElementById("wealthChart").getContext("2d");
  if (wealthChart) wealthChart.destroy();

  const mm = minMaxPad(points);

  wealthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Wealth index",
        data: points,
        tension: 0.35,
        borderColor: COLORS.income,
        backgroundColor: "rgba(0,0,0,0)",
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      ...NO_ANIM,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: COLORS.text } } },
      scales: {
        x: { ticks: { color: COLORS.muted }, grid: { color: COLORS.grid } },
        y: { min: mm.min, max: mm.max, ticks: { color: COLORS.muted }, grid: { color: COLORS.grid } }
      }
    }
  });
}

async function loadSnapshot(){
  const q = document.getElementById("question").value || "";

  document.getElementById("sumHeadline").textContent = "Generating insight…";
  document.getElementById("sumBullets").innerHTML = "";
  document.getElementById("sumNote").textContent = "";

  const res = await fetch("/api/snapshot", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ period, question: q })
  });

  const data = await res.json();
  const snap = data.snapshot;

  document.getElementById("salary").textContent = eur(snap.salary_monthly);
  document.getElementById("savings").textContent = eur(snap.savings_est_monthly);

  renderExpenses(snap.expenses, snap.monthly_expense_total);
  setBars(snap.resilience, snap.liquidity);
  drawFlow(snap.flow);
  drawWealth(snap.labels, snap.wealth);
  renderSummary(data.summary);
}

async function runSimulation(){
  const q = (document.getElementById("question").value || "").trim();

  // UX: show loading state
  renderSimulation({ heading: "Simulation running…", lines: ["Please wait"], enabled: true });

  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ period, question: q })
  });

  const payload = await res.json();
  renderSimulation(payload);
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    period = btn.dataset.period;
    await loadSnapshot();
  });
});

document.getElementById("simulateBtn").addEventListener("click", async ()=>{
  await loadSnapshot();    // refresh charts + insight
  await runSimulation();   // simulation result in separate box
});

// initial
loadSnapshot();
renderSimulation({ heading: "", lines: ["Type a scenario question and click SIMULATE."], enabled: true });
