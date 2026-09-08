import {
  logInfo,
  logError,
  logWarn,
} from "@/lib/logger";


export function logRequestStart({
  requestId,
  request,
}) {
  const url =
    new URL(request.url);

  logInfo(
    "Request started",
    {
      requestId,

      method:
        request.method,

      path:
        url.pathname,
    }
  );
}


export function logRequestComplete({
  requestId,
  request,
  status,
  durationMs,
}) {
  const url =
    new URL(request.url);


  const context = {
    requestId,

    method:
      request.method,

    path:
      url.pathname,

    status,

    durationMs,
  };


  if (durationMs >= 2000) {
    logWarn(
      "Slow request completed",
      context
    );

    return;
  }


  logInfo(
    "Request completed",
    context
  );
}


export function logRequestError({
  requestId,
  request,
  error,
  durationMs,
}) {
  const url =
    new URL(request.url);


  logError(
    "Request failed",
    {
      requestId,

      method:
        request.method,

      path:
        url.pathname,

      durationMs,

      errorName:
        error?.name ??
        "UnknownError",

      errorMessage:
        error?.message ??
        "Unknown error",

      errorCode:
        error?.errorCode ??
        error?.code ??
        null,

      stack:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error?.stack,
    }
  );
}