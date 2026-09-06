const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "apiKey",
]);


function sanitizeValue(
  value,
  depth = 0
) {
  if (depth > 5) {
    return "[MAX_DEPTH]";
  }


  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeValue(
        item,
        depth + 1
      )
    );
  }


  if (
    value !== null &&
    typeof value === "object"
  ) {
    const sanitized = {};

    for (
      const [key, item]
      of Object.entries(value)
    ) {
      if (
        SENSITIVE_KEYS.has(
          key.toLowerCase()
        )
      ) {
        sanitized[key] =
          "[REDACTED]";

        continue;
      }

      sanitized[key] =
        sanitizeValue(
          item,
          depth + 1
        );
    }

    return sanitized;
  }


  return value;
}


function createLogPayload({
  level,
  message,
  context = {},
}) {
  return {
    timestamp:
      new Date().toISOString(),

    level,

    message,

    ...sanitizeValue(context),
  };
}


export function logInfo(
  message,
  context = {}
) {
  console.info(
    JSON.stringify(
      createLogPayload({
        level: "INFO",
        message,
        context,
      })
    )
  );
}


export function logWarn(
  message,
  context = {}
) {
  console.warn(
    JSON.stringify(
      createLogPayload({
        level: "WARN",
        message,
        context,
      })
    )
  );
}


export function logError(
  message,
  context = {}
) {
  console.error(
    JSON.stringify(
      createLogPayload({
        level: "ERROR",
        message,
        context,
      })
    )
  );
}


export function logDebug(
  message,
  context = {}
) {
  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    console.debug(
      JSON.stringify(
        createLogPayload({
          level: "DEBUG",
          message,
          context,
        })
      )
    );
  }
}