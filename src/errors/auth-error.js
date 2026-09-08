import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
    TooManyRequestsError,
} from "@/errors/http-error";

export function mapAuthError(error) {
  switch (error?.code) {
    case "invalid_credentials":
      return new UnauthorizedError(
        "Invalid email or password"
      );

    case "email_not_confirmed":
      return new UnauthorizedError(
        "Please verify your email before logging in"
      );
      case "over_email_send_rate_limit":
  return new TooManyRequestsError(
    "Too many email requests. Please try again later."
  );

    case "user_already_exists":
      return new ConflictError(
        "User already exists"
      );

    case "email_exists":
      return new ConflictError(
        "User already exists"
      );

    case "weak_password":
      return new BadRequestError(
        "Password does not meet security requirements"
      );

    case "validation_failed":
      return new BadRequestError(
        "Invalid authentication data"
      );

    case "refresh_token_not_found":
      return new UnauthorizedError(
        "Invalid or expired refresh token"
      );

    case "refresh_token_already_used":
      return new UnauthorizedError(
        "Refresh token has already been used"
      );

    default:
      console.error("Supabase Auth Error:", error);

      return new UnauthorizedError(
        "Authentication failed"
      );
  }
}