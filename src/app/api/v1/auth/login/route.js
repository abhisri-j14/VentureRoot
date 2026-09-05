import { login } from "@/controllers/auth.controller";
import { loginSchema } from "@/validators/auth/auth.validator";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function POST(request) {
  try {
    const body = await request.json();

    const validatedData = loginSchema.parse(body);

    const response = await login(validatedData);

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}