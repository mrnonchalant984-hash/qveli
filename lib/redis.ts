import { Redis } from '@upstash/redis';

let client: Redis | null = null;

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!client) client = new Redis({ url, token });
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.get<T>(key);
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60) {
  const redis = getRedis();
  if (!redis) return false;
  await redis.set(key, value, { ex: ttlSeconds });
  return true;
}

export async function cacheDelete(key: string) {
  const redis = getRedis();
  if (!redis) return false;
  await redis.del(key);
  return true;
}
