import { authenticate } from "@/middlewares/auth.middleware";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function GET(request) {
  try {
    const { user } = await authenticate(request);

    return successResponse({
      message: "Protected route accessed successfully",
      data: {
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}