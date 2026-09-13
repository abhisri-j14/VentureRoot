/**
 * VentureRoot Finance Engine Integration Client
 * ===============================================
 * Connects the Next.js backend to the Python Finance Engine microservice (port 8004),
 * executing deterministic scheme eligibility routing, EMI calculations,
 * moratorium capitalisation, and working capital estimations.
 */

function getFinanceEngineUrl() {
  const url = process.env.FINANCE_ENGINE_URL || "https://ventureroot-finance-engine.onrender.com";
  return url.trim().replace(/\/+$/, "");
}

const FINANCE_TIMEOUT_MS = Number(process.env.FINANCE_TIMEOUT_MS) || 45000;

/**
 * Fetch wrapper with AbortController timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = FINANCE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Full financial calculation based on available margin, category, state, and optional proposed cost
 */
export async function calculateFinance({
  availableMargin,
  businessCategory = "Retail",
  state = "West Bengal",
  proposedProjectCost = null,
}) {
  const payload = {
    available_margin: Number(availableMargin),
    business_category: businessCategory,
    state: state || "West Bengal",
    proposed_project_cost: proposedProjectCost ? Number(proposedProjectCost) : null,
  };

  const res = await fetchWithTimeout(`${getFinanceEngineUrl()}/api/v1/finance/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Finance Engine calculation error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Calculate Monthly EMI and Total Repayment
 */
export async function calculateEmi({ principal, annualInterestRate, tenureMonths }) {
  const payload = {
    principal: Number(principal),
    annual_interest_rate: Number(annualInterestRate),
    tenure_months: Number(tenureMonths),
  };

  const res = await fetchWithTimeout(`${getFinanceEngineUrl()}/api/v1/finance/emi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Finance Engine EMI error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Generate complete month-by-month and quarter-by-quarter repayment schedules
 */
export async function generateRepaymentSchedule({
  disbursedLoan,
  annualInterestRate,
  tenureMonths,
  moratoriumMonths = 0,
}) {
  const payload = {
    disbursed_loan: Number(disbursedLoan),
    annual_interest_rate: Number(annualInterestRate),
    tenure_months: Number(tenureMonths),
    moratorium_months: Number(moratoriumMonths),
  };

  const res = await fetchWithTimeout(`${getFinanceEngineUrl()}/api/v1/finance/repayment-schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Finance Engine repayment schedule error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Route project cost to government scheme (Micro Finance, Term Loan, or Outside)
 */
export async function routeScheme({ projectCost }) {
  const payload = {
    project_cost: Number(projectCost),
  };

  const res = await fetchWithTimeout(`${getFinanceEngineUrl()}/api/v1/finance/scheme`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Finance Engine scheme routing error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Calculate working capital requirements and contingency
 */
export async function calculateWorkingCapital(params) {
  const payload = {
    fixed_assets: Number(params.fixedAssets || params.fixed_assets || 0),
    initial_inventory: Number(params.initialInventory || params.initial_inventory || 0),
    raw_material: Number(params.rawMaterial || params.raw_material || 0),
    wages: Number(params.wages || 0),
    rent: Number(params.rent || 0),
    utilities: Number(params.utilities || 0),
    transport: Number(params.transport || 0),
    marketing: Number(params.marketing || 0),
    maintenance: Number(params.maintenance || 0),
    other_expenses: Number(params.otherExpenses || params.other_expenses || 0),
    coverage_months: Number(params.coverageMonths || params.coverage_months || 3),
    contingency_pct: Number(params.contingencyPct || params.contingency_pct || 5.0),
  };

  const res = await fetchWithTimeout(`${getFinanceEngineUrl()}/api/v1/finance/working-capital`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Finance Engine working capital error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Fetch official list of government credit schemes
 */
export async function getSchemes() {
  const res = await fetchWithTimeout(`${getFinanceEngineUrl()}/api/v1/schemes`, {
    method: "GET",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Finance Engine schemes error (${res.status}): ${errText}`);
  }

  return res.json();
}
