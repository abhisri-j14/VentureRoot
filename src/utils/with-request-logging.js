import {
  getRequestId,
} from "@/utils/request-id";

import {
  startRequestTimer,
  getRequestDuration,
} from "@/utils/request-timing";

import {
  logRequestStart,
  logRequestComplete,
  logRequestError,
} from "@/utils/request-logger";

import {
  handleError,
} from "@/utils/error-handler";


export function withRequestLogging(
  handler
) {
  return async function loggedHandler(
    request,
    context
  ) {
    const requestId =
      getRequestId(request);

    const startTime =
      startRequestTimer();


    logRequestStart({
      requestId,
      request,
    });


    try {
      const response =
        await handler(
          request,
          context,
          {
            requestId,
          }
        );


      logRequestComplete({
        requestId,
        request,

        status:
          response?.status ?? 200,

        durationMs:
          getRequestDuration(
            startTime
          ),
      });


      return response;
    } catch (error) {
      logRequestError({
        requestId,
        request,
        error,

        durationMs:
          getRequestDuration(
            startTime
          ),
      });


      return handleError(
        error
      );
    }
  };
}