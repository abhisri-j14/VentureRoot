// ─────────────────────────────────────────────────────────────────────────────
// Scheme Engine — PS-mandated financial structuring logic (frontend-only)
//
// Implements:
//   1. 10% Margin → Project Cost → 90% Loan formula
//   2. Two-tier Scheme Auto-Selection (Micro Finance / Term Loan)
//   3. EMI calculation with moratorium handling
//   4. Quarterly repayment schedule generation
// ─────────────────────────────────────────────────────────────────────────────

// ── Scheme Definitions (exact PS parameters) ────────────────────────────────

export interface SchemeDefinition {
  id: string;
  name: string;
  description: string;
  interestRate: number;       // annual % for beneficiary
  tenureYears: number;
  tenureMonths: number;       // derived: tenureYears * 12
  moratoriumMonths: number;
  maxLoanAmount: number;      // in ₹
  maxProjectCost: number;     // upper threshold for routing
  fundingRatio: number;       // 0.90 = agency provides 90%
}

export const MICRO_FINANCE_SCHEME: SchemeDefinition = {
  id: "micro-finance",
  name: "Micro Finance Scheme",
  description:
    "For small units with project cost up to ₹1.40 lakh. The funding agency provides up to 90% (max ₹1.25 lakh) at a concessional interest rate of 6.5% p.a., repayable over 3 years including a 3-month moratorium.",
  interestRate: 6.5,
  tenureYears: 3,
  tenureMonths: 36,
  moratoriumMonths: 3,
  maxLoanAmount: 125000,      // ₹1.25 lakh
  maxProjectCost: 140000,     // ₹1.40 lakh
  fundingRatio: 0.90,
};

export const TERM_LOAN_SCHEME: SchemeDefinition = {
  id: "term-loan",
  name: "Term Loan Scheme",
  description:
    "For larger projects costing between ₹1.40 lakh and ₹50.00 lakh. The agency provides up to 90% (max ₹45 lakh) at 8% p.a., repayable over 7 years including a 6-month moratorium.",
  interestRate: 8,
  tenureYears: 7,
  tenureMonths: 84,
  moratoriumMonths: 6,
  maxLoanAmount: 4500000,     // ₹45 lakh
  maxProjectCost: 5000000,    // ₹50 lakh
  fundingRatio: 0.90,
};

// ── 10% Formula ─────────────────────────────────────────────────────────────

/**
 * PS Rule: Available Margin = 10% of Project Cost
 *   → Project Cost  = Available Margin / 0.10
 *   → Loan Amount   = Project Cost × 0.90  (capped by scheme max)
 */
export function computeProjectCost(availableMargin: number): number {
  return availableMargin / 0.10;
}

export function computeLoanAmount(
  projectCost: number,
  scheme: SchemeDefinition
): number {
  const raw = projectCost * scheme.fundingRatio;
  return Math.min(raw, scheme.maxLoanAmount);
}

// ── Scheme Auto-Selection ───────────────────────────────────────────────────

export type SchemeRouteResult =
  | { routed: true; scheme: SchemeDefinition }
  | { routed: false; reason: string };

export function autoSelectScheme(projectCost: number): SchemeRouteResult {
  if (projectCost <= 0) {
    return { routed: false, reason: "Project cost must be greater than zero." };
  }
  if (projectCost <= MICRO_FINANCE_SCHEME.maxProjectCost) {
    return { routed: true, scheme: MICRO_FINANCE_SCHEME };
  }
  if (projectCost <= TERM_LOAN_SCHEME.maxProjectCost) {
    return { routed: true, scheme: TERM_LOAN_SCHEME };
  }
  return {
    routed: false,
    reason: `Project cost ₹${projectCost.toLocaleString("en-IN")} exceeds the maximum ₹50 lakh limit for concessional schemes.`,
  };
}

// ── EMI Calculator ──────────────────────────────────────────────────────────

/**
 * Standard reducing-balance EMI formula.
 * Returns monthly EMI in ₹ (rounded).
 */
export function calcEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate === 0) return Math.round(principal / tenureMonths);
  const r = annualRate / 12 / 100;
  return Math.round(
    (principal * r * Math.pow(1 + r, tenureMonths)) /
      (Math.pow(1 + r, tenureMonths) - 1)
  );
}

// ── Repayment Schedule ──────────────────────────────────────────────────────

export interface RepaymentRow {
  period: string;       // "Q1", "Q2", etc.
  principal: number;
  interest: number;
  total: number;
  balance: number;
  isMoratorium: boolean;
}

/**
 * Generates a quarterly repayment schedule.
 * During moratorium quarters only interest is paid (no principal reduction).
 * After moratorium, uniform principal + declining interest is computed.
 */
export function generateRepaymentSchedule(
  loanAmount: number,
  annualRate: number,
  tenureMonths: number,
  moratoriumMonths: number
): RepaymentRow[] {
  if (loanAmount <= 0) return [];

  const totalQuarters = Math.ceil(tenureMonths / 3);
  const moratoriumQuarters = Math.ceil(moratoriumMonths / 3);
  const activeQuarters = totalQuarters - moratoriumQuarters;

  const monthlyRate = annualRate / 12 / 100;
  const quarterlyInterestOnFull = Math.round(
    loanAmount * monthlyRate * 3
  );

  // Uniform principal repayment per active quarter
  const principalPerQuarter =
    activeQuarters > 0 ? Math.round(loanAmount / activeQuarters) : 0;

  const rows: RepaymentRow[] = [];
  let balance = loanAmount;

  for (let q = 1; q <= totalQuarters; q++) {
    const isMoratorium = q <= moratoriumQuarters;

    if (isMoratorium) {
      const interest = Math.round(balance * monthlyRate * 3);
      rows.push({
        period: `Q${q}`,
        principal: 0,
        interest,
        total: interest,
        balance,
        isMoratorium: true,
      });
    } else {
      const interest = Math.round(balance * monthlyRate * 3);
      // For the last quarter, use remaining balance as principal
      const principal =
        q === totalQuarters ? balance : Math.min(principalPerQuarter, balance);
      balance = Math.max(0, balance - principal);
      rows.push({
        period: `Q${q}`,
        principal,
        interest,
        total: principal + interest,
        balance,
        isMoratorium: false,
      });
    }
  }

  return rows;
}

// ── Full Financial Plan ─────────────────────────────────────────────────────

export interface FinancialPlan {
  availableMargin: number;
  projectCost: number;
  loanAmount: number;
  schemeResult: SchemeRouteResult;
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  repaymentSchedule: RepaymentRow[];
}

/**
 * Master function: takes the user's available margin and outputs a complete
 * financial plan including scheme selection, EMI, and repayment schedule.
 */
export function computeFinancialPlan(availableMargin: number): FinancialPlan {
  const projectCost = computeProjectCost(availableMargin);
  const schemeResult = autoSelectScheme(projectCost);

  if (!schemeResult.routed) {
    return {
      availableMargin,
      projectCost,
      loanAmount: 0,
      schemeResult,
      monthlyEMI: 0,
      totalInterest: 0,
      totalRepayment: 0,
      repaymentSchedule: [],
    };
  }

  const scheme = schemeResult.scheme;
  const loanAmount = computeLoanAmount(projectCost, scheme);

  // EMI is calculated on the active months (tenure minus moratorium)
  const activeMonths = scheme.tenureMonths - scheme.moratoriumMonths;
  const monthlyEMI = calcEMI(loanAmount, scheme.interestRate, activeMonths);

  // During moratorium, interest accrues but only interest is paid
  const monthlyRate = scheme.interestRate / 12 / 100;
  const moratoriumInterest = Math.round(
    loanAmount * monthlyRate * scheme.moratoriumMonths
  );
  const activeRepayment = monthlyEMI * activeMonths;
  const totalRepayment = moratoriumInterest + activeRepayment;
  const totalInterest = Math.round(totalRepayment - loanAmount);

  const repaymentSchedule = generateRepaymentSchedule(
    loanAmount,
    scheme.interestRate,
    scheme.tenureMonths,
    scheme.moratoriumMonths
  );

  return {
    availableMargin,
    projectCost,
    loanAmount,
    schemeResult,
    monthlyEMI,
    totalInterest,
    totalRepayment,
    repaymentSchedule,
  };
}
