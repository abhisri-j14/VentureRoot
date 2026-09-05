import { register } from "@/controllers/auth.controller";
import { registerSchema } from "@/validators/auth/auth.validator";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function POST(request) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const response = await register(validatedData);

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}