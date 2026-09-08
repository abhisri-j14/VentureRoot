import {
  repaymentController,
} from "@/controllers/finance.controller";

import {
  financeRepaymentSchema,
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
    const { user } =
      await authenticate(request);

    const body =
      await request.json();

    const validatedData =
      financeRepaymentSchema.parse(
        body
      );

    const response =
      await repaymentController(
        user,
        validatedData
      );

    return successResponse(
      response
    );
  } catch (error) {
    return handleError(error);
  }
}