import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateRecord = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, RateRecord>();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

export async function rateLimit(key: string, identifier = "global", limit = 30, windowMs = 60_000) {
  if (redis && process.env.NODE_ENV !== "test") {
    const seconds = Math.max(1, Math.round(windowMs / 1000));
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
      prefix: "rehnuma:rate"
    });
    const result = await limiter.limit(`${key}:${identifier}`);
    return { success: result.success, remaining: result.remaining, resetAt: result.reset ? result.reset * 1000 : undefined };
  }

  const now = Date.now();
  const storeKey = `${key}:${identifier}`;
  const record = memoryStore.get(storeKey);
  if (!record || record.resetAt < now) {
    memoryStore.set(storeKey, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }
  record.count += 1;
  memoryStore.set(storeKey, record);
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}
