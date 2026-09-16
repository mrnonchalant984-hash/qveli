import { getRedis } from "./redis";

const local = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit = 60, windowSeconds = 60) {
  const redis = getRedis();
  if (redis) {
    const bucket = `qevli:rl:${key}`;
    const current = Number((await redis.incr(bucket)) || 0);
    if (current === 1) await redis.expire(bucket, windowSeconds);
    return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
  }
  const now = Date.now();
  const item = local.get(key);
  if (!item || item.reset <= now) {
    local.set(key, { count: 1, reset: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }
  item.count += 1;
  return { allowed: item.count <= limit, remaining: Math.max(0, limit - item.count) };
}
