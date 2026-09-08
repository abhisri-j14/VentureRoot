import { getTest } from "@/controllers/test.controller";
import { testSchema } from "@/validators/test/test.validator";
import { successResponse } from "@/utils/api-response";
import { errorResponse } from "@/utils/api-error";
import { handleError } from "@/utils/error-handler";

import { getRequestId } from "@/middlewares/request-id.middleware";

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const response = await getTest();

    return successResponse({
      ...response,
        requestId
    });
  } catch (error) {
    console.error(`[${requestId}]`, error);

    return handleError(error);
  }
}


export async function POST(request) {
  const body = await request.json();

  const result = testSchema.safeParse(body);

  if (!result.success) {
   return errorResponse({
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors: result.error.flatten().fieldErrors,
      status: 400,
    });
  }

  return Response.json({
    message: "Data is valid",
    data: result.data,
  });
}