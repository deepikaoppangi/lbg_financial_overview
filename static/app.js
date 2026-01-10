// ============================================
// Lloyds Wealth Insight - Dashboard JavaScript
// ============================================

let period = "6M";
let flowChart = null;
let wealthChart = null;
let behaviorChart = null;
let satisfactionChart = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function eur(n) {
  try {
    return "€" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  } catch (e) {
    return "€" + n;
  }
}

// Lloyds Banking Group Color Palette
const LBG_COLORS = {
  primary: "#087038",        // Salem (LBG Green)
  primaryDark: "#065a2d",
  primaryLight: "#0a8a4a",
  primaryBright: "#0da85a",
  primaryPale: "#e8f5ed",
  primarySubtle: "#c8e6d5",
  black: "#000000",
  white: "#ffffff",
  gray900: "#1a1a1a",
  gray800: "#2d2d2d",
  gray700: "#404040",
  gray600: "#666666",
  gray400: "#999999",
  gray200: "#e0e0e0",
  gray100: "#f5f5f5",
  warning: "#f59e0b",
  info: "#3b82f6",
  success: "#0da85a",
};

// Chart color configurations
const CHART_COLORS = {
  income: LBG_COLORS.primary,
  expense: LBG_COLORS.warning,
  savings: LBG_COLORS.primaryBright,
  grid: "rgba(0, 0, 0, 0.05)",
  text: LBG_COLORS.gray700,
  muted: LBG_COLORS.gray600,
  background: LBG_COLORS.white,
};

const NO_ANIM = { animation: false, responsiveAnimationDuration: 0 };

// ============================================
// RENDER FUNCTIONS
// ============================================

function setBars(res, liq) {
  document.getElementById("res").textContent = `${res}%`;
  document.getElementById("liq").textContent = `${liq}%`;
  document.getElementById("resBar").style.width = `${res}%`;
  document.getElementById("liqBar").style.width = `${liq}%`;
  document.getElementById("resBar").style.background = `linear-gradient(90deg, ${LBG_COLORS.primary} 0%, ${LBG_COLORS.primaryBright} 100%)`;
  document.getElementById("liqBar").style.background = `linear-gradient(90deg, ${LBG_COLORS.primary} 0%, ${LBG_COLORS.primaryBright} 100%)`;
}

function renderExpenses(expenses, total) {
  const expTotalEl = document.getElementById("expTotal");
  if (expTotalEl) {
    expTotalEl.textContent = eur(total);
  }
  
  const expTotalSubtitle = document.getElementById("expTotalSubtitle");
  if (expTotalSubtitle) {
    expTotalSubtitle.textContent = `Total: ${eur(total)}`;
  }
  
  const list = document.getElementById("expensesList");
  if (!list) return;
  
  list.innerHTML = "";
  expenses.forEach((e) => {
    const row = document.createElement("div");
    row.className = "expense-item";
    row.innerHTML = `
      <div class="expense-header">
        <div class="expense-label">${e.label}</div>
        <div class="expense-amount">${eur(e.monthly)}</div>
      </div>
      <div class="expense-details">
        <div>Share of expenses</div>
        <div>${e.pct}%</div>
      </div>
      <div class="expense-bar">
        <div class="expense-fill" style="width:${e.pct}%"></div>
      </div>
    `;
    list.appendChild(row);
  });
}

function renderSummary(summary) {
  const headlineEl = document.getElementById("sumHeadline");
  if (headlineEl) {
    headlineEl.textContent = summary.headline || "";
  }
  
  const ul = document.getElementById("sumBullets");
  if (ul) {
    ul.innerHTML = "";
    (summary.bullets || []).forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
  }
  
  const noteEl = document.getElementById("sumNote");
  if (noteEl) {
    noteEl.textContent = summary.note || "";
  }
}

function renderSimulation(payload) {
  const headingEl = document.getElementById("simHeading");
  const bodyEl = document.getElementById("simBody");

  if (headingEl) {
    headingEl.textContent = payload.heading || "";
  }
  
  const lines = payload.lines || [];

  if (bodyEl) {
    bodyEl.innerHTML = "";
    const ul = document.createElement("ul");
    ul.className = "simulation-list";
    lines.forEach((l) => {
      const li = document.createElement("li");
      li.textContent = l;
      ul.appendChild(li);
    });
    bodyEl.appendChild(ul);
  }

  // Visual hint if LLM disabled
  const box = document.getElementById("simulationBox");
  if (box) {
    box.classList.toggle("disabled", payload.enabled === false);
  }
}

function calculateEngagementMetrics(snap) {
  const salary = snap.salary_monthly || 0;
  const expenses = snap.monthly_expense_total || 0;
  const savings = snap.savings_est_monthly || 0;
  
  // Savings Rate
  const savingsRate = salary > 0 ? Math.round((savings / salary) * 100) : 0;
  document.getElementById("savingsRate").textContent = `${savingsRate}%`;
  document.getElementById("savingsRateBar").style.width = `${Math.min(savingsRate, 100)}%`;
  
  // Spending Efficiency (inverse of expense ratio, normalized)
  const expenseRatio = salary > 0 ? (expenses / salary) : 1;
  const efficiency = Math.max(0, Math.min(100, Math.round((1 - expenseRatio) * 100)));
  document.getElementById("efficiency").textContent = `${efficiency}%`;
  document.getElementById("efficiencyBar").style.width = `${efficiency}%`;
  
  // Goal Progress (average of resilience and liquidity)
  const goalProgress = Math.round((snap.resilience + snap.liquidity) / 2);
  document.getElementById("goalProgress").textContent = `${goalProgress}%`;
  document.getElementById("goalProgressBar").style.width = `${goalProgress}%`;
  
  // Financial Wellness Score
  const wellnessScore = Math.round((savingsRate * 0.3 + efficiency * 0.3 + goalProgress * 0.4));
  const wellnessEl = document.getElementById("wellnessScore");
  if (wellnessEl) {
    wellnessEl.textContent = `${wellnessScore}%`;
  }
}

function minMaxPad(values) {
  const nums = (values || []).map(Number).filter((v) => isFinite(v));
  if (!nums.length) return { min: 0, max: 100 };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  return { min: min - range * 0.15, max: max + range * 0.15 };
}

// ============================================
// CHART FUNCTIONS
// ============================================

function drawFlow(flow) {
  const titleEl = document.getElementById("flowTitle");
  if (titleEl) {
    titleEl.textContent =
      flow.grain === "monthly"
        ? "Flow (month-wise): Income vs Expense vs Savings"
        : "Flow (year-wise): Income vs Expense vs Savings";
  }

  const ctx = document.getElementById("flowChart");
  if (!ctx) return;
  
  const canvas = ctx.getContext("2d");
  if (flowChart) flowChart.destroy();

  const all = [
    ...(flow.income || []),
    ...(flow.expense || []),
    ...(flow.savings || []),
  ];
  const mm = minMaxPad(all);
  const yMin = 0;
  const yMax = Math.max(mm.max, 1);

  flowChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: flow.labels,
      datasets: [
        {
          label: "Income",
          data: flow.income,
          backgroundColor: LBG_COLORS.primary,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Expense",
          data: flow.expense,
          backgroundColor: LBG_COLORS.warning,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Savings",
          data: flow.savings,
          backgroundColor: LBG_COLORS.primaryBright,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...NO_ANIM,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: CHART_COLORS.text,
            font: { size: 12, weight: "600" },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: LBG_COLORS.gray800,
          padding: 12,
          titleFont: { size: 14, weight: "600" },
          bodyFont: { size: 13 },
          borderColor: LBG_COLORS.primary,
          borderWidth: 2,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          ticks: { color: CHART_COLORS.muted, font: { size: 11 } },
          grid: { color: CHART_COLORS.grid, drawBorder: false },
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: {
            color: CHART_COLORS.muted,
            font: { size: 11 },
            callback: function (value) {
              return "€" + value.toLocaleString();
            },
          },
          grid: { color: CHART_COLORS.grid, drawBorder: false },
        },
      },
    },
  });
}

function drawWealth(labels, points) {
  const ctx = document.getElementById("wealthChart");
  if (!ctx) return;
  
  const canvas = ctx.getContext("2d");
  if (wealthChart) wealthChart.destroy();

  const mm = minMaxPad(points);

  wealthChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Wealth Index",
          data: points,
          tension: 0.4,
          borderColor: LBG_COLORS.primary,
          backgroundColor: `rgba(8, 112, 56, 0.1)`,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: LBG_COLORS.primary,
          pointBorderColor: LBG_COLORS.white,
          pointBorderWidth: 2,
          borderWidth: 3,
          fill: true,
        },
      ],
    },
    options: {
      ...NO_ANIM,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: LBG_COLORS.gray800,
          padding: 12,
          titleFont: { size: 14, weight: "600" },
          bodyFont: { size: 13 },
          borderColor: LBG_COLORS.primary,
          borderWidth: 2,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          ticks: { color: CHART_COLORS.muted, font: { size: 11 } },
          grid: { color: CHART_COLORS.grid, drawBorder: false },
        },
        y: {
          min: mm.min,
          max: mm.max,
          ticks: {
            color: CHART_COLORS.muted,
            font: { size: 11 },
          },
          grid: { color: CHART_COLORS.grid, drawBorder: false },
        },
      },
    },
  });
}

function drawBehavior(expenses) {
  const ctx = document.getElementById("behaviorChart");
  if (!ctx) return;
  
  const canvas = ctx.getContext("2d");
  if (behaviorChart) behaviorChart.destroy();

  // Sort expenses by amount for better visualization
  const sortedExpenses = [...expenses].sort((a, b) => b.monthly - a.monthly);
  const labels = sortedExpenses.map((e) => e.label);
  const data = sortedExpenses.map((e) => e.monthly);
  const percentages = sortedExpenses.map((e) => e.pct);

  // Create gradient colors based on LBG palette
  const backgroundColors = data.map((_, index) => {
    const ratio = index / data.length;
    if (ratio < 0.33) return LBG_COLORS.primary;
    if (ratio < 0.66) return LBG_COLORS.primaryLight;
    return LBG_COLORS.primaryBright;
  });

  behaviorChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderColor: LBG_COLORS.white,
          borderWidth: 3,
        },
      ],
    },
    options: {
      ...NO_ANIM,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "right",
          labels: {
            color: CHART_COLORS.text,
            font: { size: 11, weight: "500" },
            padding: 12,
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const pct = percentages[i];
                  return {
                    text: `${label}: ${eur(value)} (${pct}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    strokeStyle: data.datasets[0].borderColor,
                    lineWidth: data.datasets[0].borderWidth,
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          backgroundColor: LBG_COLORS.gray800,
          padding: 12,
          titleFont: { size: 14, weight: "600" },
          bodyFont: { size: 13 },
          borderColor: LBG_COLORS.primary,
          borderWidth: 2,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const pct = percentages[context.dataIndex] || 0;
              return `${label}: ${eur(value)} (${pct}% of total)`;
            },
          },
        },
      },
    },
  });
}

function drawSatisfaction(snap) {
  const ctx = document.getElementById("satisfactionChart");
  if (!ctx) return;
  
  const canvas = ctx.getContext("2d");
  if (satisfactionChart) satisfactionChart.destroy();

  // Calculate satisfaction metrics based on financial health
  const resilience = snap.resilience || 0;
  const liquidity = snap.liquidity || 0;
  const savingsRate = snap.salary_monthly > 0
    ? Math.round((snap.savings_est_monthly / snap.salary_monthly) * 100)
    : 0;
  const expenseControl = snap.salary_monthly > 0
    ? Math.max(0, Math.min(100, Math.round((1 - snap.monthly_expense_total / snap.salary_monthly) * 100)))
    : 0;

  const metrics = [
    { label: "Resilience", value: resilience },
    { label: "Liquidity", value: liquidity },
    { label: "Savings Rate", value: savingsRate },
    { label: "Expense Control", value: expenseControl },
  ];

  satisfactionChart = new Chart(canvas, {
    type: "radar",
    data: {
      labels: metrics.map((m) => m.label),
      datasets: [
        {
          label: "Financial Satisfaction",
          data: metrics.map((m) => m.value),
          backgroundColor: `rgba(8, 112, 56, 0.2)`,
          borderColor: LBG_COLORS.primary,
          pointBackgroundColor: LBG_COLORS.primary,
          pointBorderColor: LBG_COLORS.white,
          pointHoverBackgroundColor: LBG_COLORS.primaryBright,
          pointHoverBorderColor: LBG_COLORS.white,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      ...NO_ANIM,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: LBG_COLORS.gray800,
          padding: 12,
          titleFont: { size: 14, weight: "600" },
          bodyFont: { size: 13 },
          borderColor: LBG_COLORS.primary,
          borderWidth: 2,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed.r}%`;
            },
          },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: CHART_COLORS.muted,
            font: { size: 10 },
            backdropColor: "transparent",
          },
          grid: {
            color: CHART_COLORS.grid,
          },
          pointLabels: {
            color: CHART_COLORS.text,
            font: { size: 11, weight: "600" },
          },
        },
      },
    },
  });
}

// ============================================
// DATA LOADING
// ============================================

async function loadSnapshot() {
  const q = document.getElementById("question")?.value || "";

  const headlineEl = document.getElementById("sumHeadline");
  if (headlineEl) {
    headlineEl.textContent = "Generating insight…";
  }
  
  const bulletsEl = document.getElementById("sumBullets");
  if (bulletsEl) {
    bulletsEl.innerHTML = "";
  }
  
  const noteEl = document.getElementById("sumNote");
  if (noteEl) {
    noteEl.textContent = "";
  }

  try {
    const res = await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, question: q }),
    });

    const data = await res.json();
    const snap = data.snapshot;

    // Update metrics
    const salaryEl = document.getElementById("salary");
    if (salaryEl) salaryEl.textContent = eur(snap.salary_monthly);
    
    const savingsEl = document.getElementById("savings");
    if (savingsEl) savingsEl.textContent = eur(snap.savings_est_monthly);

    // Render components
    renderExpenses(snap.expenses, snap.monthly_expense_total);
    setBars(snap.resilience, snap.liquidity);
    calculateEngagementMetrics(snap);
    drawFlow(snap.flow);
    drawWealth(snap.labels, snap.wealth);
    drawBehavior(snap.expenses);
    drawSatisfaction(snap);
    renderSummary(data.summary);
  } catch (error) {
    console.error("Error loading snapshot:", error);
  }
}

async function runSimulation() {
  const q = (document.getElementById("question")?.value || "").trim();

  // UX: show loading state
  renderSimulation({
    heading: "Simulation running…",
    lines: ["Please wait"],
    enabled: true,
  });

  try {
    const res = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, question: q }),
    });

    const payload = await res.json();
    renderSimulation(payload);
  } catch (error) {
    console.error("Error running simulation:", error);
    renderSimulation({
      heading: "Error",
      lines: ["Failed to run simulation. Please try again."],
      enabled: false,
    });
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.querySelectorAll(".period-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    period = btn.dataset.period;
    await loadSnapshot();
  });
});

const simulateBtn = document.getElementById("simulateBtn");
if (simulateBtn) {
  simulateBtn.addEventListener("click", async () => {
    await loadSnapshot(); // refresh charts + insight
    await runSimulation(); // simulation result in separate box
  });
}

// Allow Enter key in simulation input
const questionInput = document.getElementById("question");
if (questionInput) {
  questionInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      await loadSnapshot();
      await runSimulation();
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================

// Initial load
loadSnapshot();
renderSimulation({
  heading: "",
  lines: ["Type a scenario question and click Simulate to see personalized insights."],
  enabled: true,
});
