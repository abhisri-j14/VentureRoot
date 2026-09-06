import {
  getFeasibilityController,
} from "@/controllers/feasibility.controller";

import {
  feasibilityBusinessIdSchema,
} from "@/validators/feasibility/feasibility.validator";

import {
  authenticate,
} from "@/middlewares/auth.middleware";

import {
  successResponse,
} from "@/utils/api-response";

import {
  handleError,
} from "@/utils/error-handler";


export async function GET(
  request,
  { params }
) {
  try {
    const { user } =
      await authenticate(request);

    const { businessId } =
      await params;

    const validatedBusinessId =
      feasibilityBusinessIdSchema.parse(
        businessId
      );

    const response =
      await getFeasibilityController(
        user,
        validatedBusinessId
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}