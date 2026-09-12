import { checkUserRegistered } from "@/services/auth.service";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";
import { BadRequestError } from "@/errors/http-error";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim();

    if (!email || !email.includes("@")) {
      throw new BadRequestError("Valid email address is required");
    }

    const exists = await checkUserRegistered(email);

    return successResponse({
      message: exists
        ? "Account is registered"
        : "You are not registered",
      data: {
        exists,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
