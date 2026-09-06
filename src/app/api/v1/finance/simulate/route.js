import {
  simulateFinanceController,
} from "@/controllers/finance.controller";

import {
  financeSimulationSchema,
} from "@/validators/finance/finance.validator";

import {
  authenticate,
} from "@/middlewares/auth.middleware";

import {
  successResponse,
} from "@/utils/api-response";

import {
  handleError,
} from "@/utils/error-handler";


export async function POST(request) {
  try {
    await authenticate(request);

    const body =
      await request.json();

    const validatedData =
      financeSimulationSchema.parse(
        body
      );

    const response =
      await simulateFinanceController(
        validatedData
      );

    return successResponse(
      response
    );
  } catch (error) {
    return handleError(error);
  }
}