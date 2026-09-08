import { z } from "zod";


const loanAmountSchema = z
  .number()
  .positive(
    "Loan amount must be greater than 0"
  )
  .max(
    1_000_000_000,
    "Loan amount is too large"
  );


const interestRateSchema = z
  .number()
  .min(
    0,
    "Interest rate cannot be negative"
  )
  .max(
    100,
    "Interest rate cannot exceed 100"
  );


const tenureSchema = z
  .number()
  .int()
  .min(
    1,
    "Tenure must be at least 1 month"
  )
  .max(
    600,
    "Tenure cannot exceed 600 months"
  );


const moratoriumSchema = z
  .number()
  .int()
  .min(
    0,
    "Moratorium cannot be negative"
  )
  .max(
    120,
    "Moratorium cannot exceed 120 months"
  )
  .default(0);


const revenueSchema = z
  .number()
  .min(
    0,
    "Revenue cannot be negative"
  )
  .max(
    1_000_000_000,
    "Revenue is too large"
  );


const expensesSchema = z
  .number()
  .min(
    0,
    "Expenses cannot be negative"
  )
  .max(
    1_000_000_000,
    "Expenses are too large"
  );


function validateMoratorium(schema) {
  return schema.refine(
    (data) =>
      data.moratorium <
      data.tenure,
    {
      message:
        "Moratorium must be less than tenure",
      path: ["moratorium"],
    }
  );
}


export const financeSimulationSchema =
  validateMoratorium(
    z
      .object({
        loanAmount:
          loanAmountSchema,

        interestRate:
          interestRateSchema,

        tenure:
          tenureSchema,

        moratorium:
          moratoriumSchema,

        revenue:
          revenueSchema,

        expenses:
          expensesSchema,
      })
      .strict()
  );


export const financeRepaymentSchema =
  validateMoratorium(
    z
      .object({
        businessId: z
          .string()
          .uuid(
            "Invalid business ID"
          ),

        loanAmount:
          loanAmountSchema,

        interestRate:
          interestRateSchema,

        tenure:
          tenureSchema,

        moratorium:
          moratoriumSchema,
      })
      .strict()
  );


export const financeStructureSchema =
  validateMoratorium(
    z
      .object({
        businessId: z
          .string()
          .uuid(
            "Invalid business ID"
          ),

        loanAmount:
          loanAmountSchema,

        interestRate:
          interestRateSchema,

        tenure:
          tenureSchema,

        moratorium:
          moratoriumSchema,

        revenue:
          revenueSchema,

        expenses:
          expensesSchema,
      })
      .strict()
  );