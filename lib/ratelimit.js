import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting is optional: if Upstash isn't configured, checkRateLimit()
// always allows the request (so the app still works without extra setup).
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Different buckets get different limits - AI calls are stricter since they
// cost real API quota/money; plain writes are more lenient.
const BUCKET_CONFIG = {
  ai: [10, "1 m"], // 10 requests per minute
  write: [30, "1 m"], // 30 requests per minute
  upload: [15, "1 m"], // 15 uploads per minute
};

const limiters = {};

function getLimiter(bucket) {
  if (!redis) return null;
  if (!limiters[bucket]) {
    const [requests, window] = BUCKET_CONFIG[bucket] || BUCKET_CONFIG.write;
    limiters[bucket] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `ratelimit:${bucket}`,
    });
  }
  return limiters[bucket];
}

// Returns { allowed: boolean, remaining?: number, reset?: number }.
// `identifier` should be something per-user, e.g. the userId.
export async function checkRateLimit(bucket, identifier) {
  const limiter = getLimiter(bucket);
  if (!limiter) return { allowed: true }; // not configured - skip silently
  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining, reset: result.reset };
}

// Convenience wrapper for API routes: returns a ready-to-return 429 Response
// if the identifier is over the limit for this bucket, or null if the request
// should proceed. Usage:
//   const blocked = await rateLimitResponse("ai", userId);
//   if (blocked) return blocked;
export async function rateLimitResponse(bucket, identifier) {
  const { NextResponse } = await import("next/server");
  const result = await checkRateLimit(bucket, identifier);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests - please slow down and try again in a minute." },
      { status: 429 }
    );
  }
  return null;
}
