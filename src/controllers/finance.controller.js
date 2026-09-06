import {
  simulateFinance,
  calculateBusinessRepayment,
  buildFinanceStructure,
} from "@/services/finance.service";


export async function simulateFinanceController(
  validatedData
) {
  const simulation =
    await simulateFinance(
      validatedData
    );

  return {
    message:
      "Finance simulation completed successfully",

    data: {
      simulation,
    },
  };
}


export async function repaymentController(
  user,
  validatedData
) {
  const repayment =
    await calculateBusinessRepayment({
      user,
      data: validatedData,
    });

  return {
    message:
      "Repayment calculation completed successfully",

    data: {
      repayment,
    },
  };
}


export async function financeStructureController(
  user,
  validatedData
) {
  const structure =
    await buildFinanceStructure({
      user,
      data: validatedData,
    });

  return {
    message:
      "Finance structure generated successfully",

    data: {
      structure,
    },
  };
}