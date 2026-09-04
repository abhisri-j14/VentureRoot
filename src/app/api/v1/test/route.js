import { getTest } from "@/controllers/test.controller";
import { testSchema } from "@/validators/test/test.validator";
import { successResponse } from "@/utils/api-response";
import { errorResponse } from "@/utils/api-error";

export async function GET() {
  const response = await getTest();

  return successResponse(response);
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