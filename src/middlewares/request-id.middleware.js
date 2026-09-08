import { randomUUID } from "crypto";

export function getRequestId(request) {
  return (
    request.headers.get("x-request-id") ||
    randomUUID()
  );
}