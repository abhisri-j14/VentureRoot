import { logout } from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function POST(request) {
  try {
    const { user } = await authenticate(request);

    const response = await logout(user);

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}