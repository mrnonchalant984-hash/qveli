import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redis';
import { getCurrentUser } from '@/lib/auth';

async function admin() { const u = await getCurrentUser(); return u?.role === 'ADMIN' ? u : null; }
export async function GET(request: Request) {
  if (!await admin()) return NextResponse.json({ error:'Admin access required.' }, { status:403 });
  const key = new URL(request.url).searchParams.get('key');
  if (!key || key.length > 200) return NextResponse.json({ error:'Valid key is required.' }, { status:400 });
  const value = await cacheGet(key);
  return NextResponse.json({ configured:Boolean(process.env.UPSTASH_REDIS_REST_URL), key, value });
}
export async function POST(request: Request) {
  if (!await admin()) return NextResponse.json({ error:'Admin access required.' }, { status:403 });
  const body = await request.json().catch(() => null);
  if (!body?.key || String(body.key).length > 200) return NextResponse.json({ error:'Valid key is required.' }, { status:400 });
  const ok = await cacheSet(String(body.key), body.value, Math.min(Math.max(Number(body.ttlSeconds)||60,1),86400));
  return NextResponse.json({ cached:ok });
}
