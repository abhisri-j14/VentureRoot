import {
  calculateFinanceSimulation,
} from "@/utils/finance";

import {
  calculateRepaymentSummary,
  generateRepaymentSchedule,
} from "@/utils/finance/repayment";

import {
  calculateCashFlow,
} from "@/utils/finance/cash-flow";

import {
  findBusinessByIdAndUserId,
} from "@/repositories/business.repository";

import {
  NotFoundError,
} from "@/errors/http-error";

import * as financeClient from "@/integrations/finance.client";


async function getOwnedBusiness({
  userId,
  businessId,
}) {
  const business =
    await findBusinessByIdAndUserId({
      businessId,
      userId,
    });

  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }

  return business;
}


export async function simulateFinance(
  data
) {
  return calculateFinanceSimulation({
    loanAmount: data.loanAmount,
    interestRate: data.interestRate,
    tenure: data.tenure,
    moratorium: data.moratorium,
    revenue: data.revenue,
    expenses: data.expenses,
  });
}


export async function calculateBusinessRepayment({
  user,
  data,
}) {
  const business =
    await getOwnedBusiness({
      userId: user.id,
      businessId: data.businessId,
    });

  let repayment = null;
  let repaymentSchedule = null;

  try {
    const rateDecimal = data.interestRate > 1 ? data.interestRate / 100 : data.interestRate;
    const pySchedule = await financeClient.generateRepaymentSchedule({
      disbursedLoan: data.loanAmount,
      annualInterestRate: rateDecimal,
      tenureMonths: data.tenure,
      moratoriumMonths: data.moratorium || 0,
    });

    if (pySchedule && pySchedule.monthly_emi) {
      repayment = {
        monthlyEmi: Math.round(pySchedule.monthly_emi * 100) / 100,
        totalInterest: Math.round(pySchedule.total_interest * 100) / 100,
        totalRepayment: Math.round(pySchedule.total_repayment * 100) / 100,
        effectivePrincipal: Math.round(pySchedule.effective_principal_after_moratorium * 100) / 100,
      };
      repaymentSchedule = (pySchedule.monthly_schedule || []).map((item) => ({
        month: item.month,
        period: item.period,
        openingBalance: item.opening_balance,
        interest: item.interest,
        principal: item.principal,
        payment: item.payment,
        closingBalance: item.closing_balance,
        moratoriumFlag: item.moratorium_flag,
      }));
    }
  } catch (err) {
    console.warn("[finance.service] Remote Python Finance Engine repayment unavailable, using local calculation:", err.message);
  }

  if (!repayment) {
    repayment =
      calculateRepaymentSummary({
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        tenure: data.tenure,
      });
  }

  if (!repaymentSchedule) {
    repaymentSchedule =
      generateRepaymentSchedule({
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        tenure: data.tenure,
      });
  }

  return {
    business: {
      id: business.id,
      name: business.name,
      status: business.status,
    },

    loan: {
      principal:
        data.loanAmount,

      annualInterestRate:
        data.interestRate,

      tenureMonths:
        data.tenure,

      moratoriumMonths:
        data.moratorium,

      moratoriumApplied:
        Boolean(data.moratorium && data.moratorium > 0),
    },

    repayment,

    repaymentSchedule,
  };
}


function evaluateSchemeAndRecommendation({ projectCost, revenue, expenses, monthlyEmi, pyScheme }) {
  const operatingProfit = Math.max(0, Number(revenue || 0) - Number(expenses || 0));
  const emi = Number(monthlyEmi || 0);
  const netCashFlow = operatingProfit - emi;
  const dscr = emi > 0 ? (operatingProfit / emi) : 2.0;

  let recommendationStatus = "FEASIBLE";
  if (netCashFlow < 0 || dscr < 1.1) {
    recommendationStatus = "HIGH_RISK";
  } else if (dscr < 1.5) {
    recommendationStatus = "MODERATE_RISK";
  }

  if (pyScheme) {
    return {
      recommendationStatus,
      dscr: Math.round(dscr * 100) / 100,
      scheme: {
        schemeId: pyScheme.scheme_id || "term_loan",
        name: pyScheme.name || "Government Credit Linkage Scheme",
        maxProjectCost: pyScheme.max_project_cost || 5000000,
        maxLoan: pyScheme.max_loan || 4500000,
        standardInterestRate: pyScheme.interest_rate || 0.08,
        standardTenureMonths: pyScheme.tenure_months || 84,
        moratoriumMonths: pyScheme.moratorium_months || 6,
        beneficiaryContributionPct: (pyScheme.beneficiary_contribution_pct || 0.1) * 100,
        statusMessage: `Project cost qualified under ${pyScheme.name} with ${(pyScheme.interest_rate * 100).toFixed(1)}% p.a. interest.`,
      },
    };
  }

  let scheme = null;
  if (projectCost <= 140000) {
    scheme = {
      schemeId: "micro_finance",
      name: "Micro Finance Scheme",
      maxProjectCost: 140000,
      maxLoan: 125000,
      standardInterestRate: 0.065,
      standardTenureMonths: 36,
      moratoriumMonths: 3,
      beneficiaryContributionPct: 10,
      statusMessage: "Project cost qualifies for Micro Finance Scheme with 6.5% interest rate and 3-month moratorium.",
    };
  } else if (projectCost <= 5000000) {
    scheme = {
      schemeId: "term_loan",
      name: "Term Loan Scheme (PMEGP / MUDRA Credit Linkage)",
      maxProjectCost: 5000000,
      maxLoan: 4500000,
      standardInterestRate: 0.08,
      standardTenureMonths: 84,
      moratoriumMonths: 6,
      beneficiaryContributionPct: 10,
      statusMessage: "Project cost qualifies for Term Loan Scheme with up to ₹45 Lakh eligible loan and 6-month moratorium.",
    };
  } else {
    scheme = {
      schemeId: "outside_range",
      name: "Commercial Lending / Outside Micro Scheme Range",
      maxProjectCost: 5000000,
      maxLoan: 4500000,
      standardInterestRate: 0.10,
      standardTenureMonths: 84,
      moratoriumMonths: 6,
      beneficiaryContributionPct: 15,
      statusMessage: "Project cost exceeds government micro-enterprise limits (₹50 Lakh). Standard commercial rates apply.",
    };
  }

  return {
    recommendationStatus,
    dscr: Math.round(dscr * 100) / 100,
    scheme,
  };
}

export async function buildFinanceStructure({
  user,
  data,
}) {
  const business =
    await getOwnedBusiness({
      userId: user.id,
      businessId: data.businessId,
    });

  const margin = Number(business.availableMargin || 0);
  const projectCost = Number(data.loanAmount) + margin;

  let pyFinance = null;
  try {
    const routeRes = await financeClient.routeScheme({ projectCost });
    if (routeRes && routeRes.scheme) {
      pyFinance = routeRes;
    }
  } catch (err) {
    console.warn("[finance.service] Remote Python Finance Engine route scheme unavailable, falling back:", err.message);
  }

  const repayment =
    calculateRepaymentSummary({
      loanAmount: data.loanAmount,
      interestRate: data.interestRate,
      tenure: data.tenure,
    });

  const cashFlow =
    calculateCashFlow({
      revenue: data.revenue,
      expenses: data.expenses,
      monthlyEmi:
        repayment.monthlyEmi,
    });

  const evaluation = evaluateSchemeAndRecommendation({
    projectCost,
    revenue: data.revenue,
    expenses: data.expenses,
    monthlyEmi: repayment.monthlyEmi,
    pyScheme: pyFinance?.scheme,
  });

  return {
    business: {
      id: business.id,
      name: business.name,
      status: business.status,

      expectedRevenue:
        business.expectedRevenue !== null
          ? Number(
              business.expectedRevenue
            )
          : null,

      availableMargin:
        business.availableMargin !== null
          ? Number(
              business.availableMargin
            )
          : null,
    },

    loan: {
      principal:
        data.loanAmount,

      annualInterestRate:
        data.interestRate,

      tenureMonths:
        data.tenure,

      moratoriumMonths:
        data.moratorium,

      moratoriumApplied:
        Boolean(data.moratorium && data.moratorium > 0),
    },

    repayment,

    cashFlow,

    dscr: evaluation.dscr,

    scheme: evaluation.scheme,

    recommendationStatus:
      evaluation.recommendationStatus,
  };
}

