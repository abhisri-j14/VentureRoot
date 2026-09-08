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


  const repayment =
    calculateRepaymentSummary({
      loanAmount: data.loanAmount,
      interestRate: data.interestRate,
      tenure: data.tenure,
    });


  const repaymentSchedule =
    generateRepaymentSchedule({
      loanAmount: data.loanAmount,
      interestRate: data.interestRate,
      tenure: data.tenure,
    });


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
        false,
    },

    repayment,

    repaymentSchedule,
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
        false,
    },

    repayment,

    cashFlow,

    recommendationStatus:
      "NOT_EVALUATED",
  };
}
