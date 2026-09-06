export function startRequestTimer() {
  return performance.now();
}


export function getRequestDuration(
  startTime
) {
  return Math.round(
    performance.now() -
    startTime
  );
}