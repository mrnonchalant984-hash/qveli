import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 });
  const value = await cacheGet(key);
  return NextResponse.json({ configured: Boolean(process.env.UPSTASH_REDIS_REST_URL), key, value });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.key) return NextResponse.json({ error: 'key is required' }, { status: 400 });
  const ok = await cacheSet(String(body.key), body.value, Number(body.ttlSeconds) || 60);
  return NextResponse.json({ cached: ok });
}
