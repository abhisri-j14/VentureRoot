import {
  calculateRepaymentSummary,
  generateRepaymentSchedule,
} from "@/utils/finance/repayment";

import {
  calculateCashFlow,
} from "@/utils/finance/cash-flow";


export function calculateFinanceSimulation({
  loanAmount,
  interestRate,
  tenure,
  moratorium,
  revenue,
  expenses,
}) {
  const repayment =
    calculateRepaymentSummary({
      loanAmount,
      interestRate,
      tenure,
    });


  const repaymentSchedule =
    generateRepaymentSchedule({
      loanAmount,
      interestRate,
      tenure,
    });


  const cashFlow =
    calculateCashFlow({
      revenue,
      expenses,
      monthlyEmi:
        repayment.monthlyEmi,
    });


  return {
    loan: {
      principal:
        loanAmount,

      annualInterestRate:
        interestRate,

      tenureMonths:
        tenure,

      moratoriumMonths:
        moratorium,

      moratoriumApplied:
        false,
    },

    repayment,

    cashFlow,

    repaymentSchedule,
  };
}