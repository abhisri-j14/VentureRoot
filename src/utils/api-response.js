export function successResponse({
  message = "Request successful",
  data = null,
  status = 200,
  requestId = null,
}) {
  const headers = {};

  if (requestId) {
    headers["X-Request-ID"] = requestId;
  }

  return Response.json(
    {
      success: true,
      message,
      data,
    },
    {
      status,
      headers,
    }
  );
}