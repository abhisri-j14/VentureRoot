const requests = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

export function rateLimit(identifier) {
  const now = Date.now();

  const record = requests.get(identifier);

  if (!record || now - record.startTime > WINDOW_MS) {
    requests.set(identifier, {
      startTime: now,
      count: 1,
    });

    return {
      allowed: true,
    };
  }

  if (record.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil(
        (WINDOW_MS - (now - record.startTime)) / 1000
      ),
    };
  }

  record.count += 1;

  return {
    allowed: true,
  };
}