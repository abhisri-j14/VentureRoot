export function errorResponse({
  message = "Something went wrong",
  errorCode = "INTERNAL_ERROR",
  errors = null,
  status = 500,
}) {
  return Response.json(
    {
      success: false,
      message,
      error_code: errorCode,
      errors,
      data: null,
    },
    { status }
  );
}