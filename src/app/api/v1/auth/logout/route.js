import { logout } from "@/controllers/auth.controller";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function POST() {
  try {
    const response = await logout();

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}