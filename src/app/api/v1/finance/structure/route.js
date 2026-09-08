import {
  financeStructureController,
} from "@/controllers/finance.controller";

import {
  financeStructureSchema,
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
      financeStructureSchema.parse(
        body
      );

    const response =
      await financeStructureController(
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