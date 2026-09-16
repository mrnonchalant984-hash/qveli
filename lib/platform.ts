import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const flags = {
  monetization: process.env.QEVLI_MONETIZATION_ENABLED === 'true',
  email: process.env.QEVLI_EMAIL_ENABLED === 'true',
  push: process.env.QEVLI_PUSH_ENABLED === 'true',
  cloudStorage: Boolean((process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_STORAGE_BUCKET) || process.env.CLOUDINARY_CLOUD_NAME || process.env.S3_BUCKET),
  redis: Boolean(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL),
  livekit: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
};

export function hashSecret(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export async function audit(userId: string, type: string, metadata?: unknown) {
  try { await prisma.securityEvent.create({ data: { userId, type, metadata: metadata as any } }); } catch {}
}

export async function track(userId: string | null, name: string, path?: string, metadata?: unknown) {
  try { await prisma.analyticsEvent.create({ data: { userId, name, path, metadata: metadata as any } }); } catch {}
}

export function rateKey(req: Request, userId?: string) {
  return `${userId || 'anon'}:${req.headers.get('x-forwarded-for') || 'local'}:${new URL(req.url).pathname}`;
}

const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.reset) { buckets.set(key, { count: 1, reset: now + windowMs }); return { ok: true, remaining: limit - 1 }; }
  if (b.count >= limit) return { ok: false, remaining: 0 };
  b.count += 1; return { ok: true, remaining: limit - b.count };
}
