import { refresh } from "@/controllers/auth.controller";
import { refreshSchema } from "@/validators/auth/auth.validator";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function POST(request) {
  try {
    const body = await request.json();

    const validatedData = refreshSchema.parse(body);

    const response = await refresh(
      validatedData.refreshToken
    );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}