import { AppError } from "@/errors/AppError";
import { errorResponse } from "@/utils/api-error";


export function handleError(error , requestId = null) {
   // Zod validation error
  if (error instanceof ZodError) {
    return errorResponse({
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors: error.flatten().fieldErrors,
      status: 400,
      requestId
    });
  }


  // Hamara known/custom error
  if (error instanceof AppError) {
    return errorResponse({
      message: error.message,
      errorCode: error.errorCode,
      status: error.statusCode,
      requestId
    });
  }

  // Unknown/unexpected error
  console.error(error);

  return errorResponse({
    message: "Internal server error",
    errorCode: "INTERNAL_ERROR",
    status: 500,
    requestId
  });
}