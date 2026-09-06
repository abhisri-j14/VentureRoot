export function getRequestId(
  request
) {
  const existingRequestId =
    request.headers.get(
      "x-request-id"
    );

  if (existingRequestId) {
    return existingRequestId;
  }

  return crypto.randomUUID();
}