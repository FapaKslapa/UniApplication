import { TRPCError } from "@trpc/server";

type Bucket = { count: number; resetAt: number };

const MAX_BUCKETS = 5000;
const buckets = new Map<string, Bucket>();

export function getClientIp(headers: Headers): string {
  return headers.get("cf-connecting-ip")?.trim() || "unknown";
}

function evictExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

export function isRateLimited(
  scope: string,
  headers: Headers,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const key = `${scope}:${getClientIp(headers)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) evictExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}

export function enforceRateLimit(
  scope: string,
  headers: Headers,
  max: number,
  windowMs = 60_000,
) {
  if (isRateLimited(scope, headers, max, windowMs)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Troppe richieste, riprova tra poco.",
    });
  }
}
