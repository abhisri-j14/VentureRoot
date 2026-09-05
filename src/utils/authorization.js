import { ForbiddenError } from "@/errors/http-error";

export function ensureResourceOwnership({
  resourceUserId,
  currentUserId,
}) {
  if (!resourceUserId || !currentUserId) {
    throw new ForbiddenError(
      "You are not allowed to access this resource"
    );
  }

  if (resourceUserId !== currentUserId) {
    throw new ForbiddenError(
      "You are not allowed to access this resource"
    );
  }

  return true;
}