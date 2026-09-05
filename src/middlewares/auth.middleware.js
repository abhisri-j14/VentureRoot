import { UnauthorizedError } from "@/errors/http-error";
import { getCurrentUser } from "@/services/auth.service";

export async function authenticate(request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    throw new UnauthorizedError(
      "Authorization header is required"
    );
  }

  const [scheme, token] =
    authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError(
      "Invalid authorization header"
    );
  }

  try {
    const user = await getCurrentUser(token);

    if (!user) {
      throw new UnauthorizedError(
        "Invalid or expired access token"
      );
    }

    return {
      user,
      accessToken: token,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError(
      "Invalid or expired access token"
    );
  }
}