export function successResponse({
  message = "Request successful",
  data = null,
  status = 200,
}) {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}