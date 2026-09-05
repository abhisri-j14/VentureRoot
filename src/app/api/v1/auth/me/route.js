import { me } from "@/controllers/auth.controller";
import { UnauthorizedError } from "@/errors/http-error";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function GET(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      throw new UnauthorizedError("Authorization header is required");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Invalid authorization header");
    }

    const response = await me(token);

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}