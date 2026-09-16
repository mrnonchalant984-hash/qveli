import { NextResponse } from 'next/server';
import { createUploadUrl, publicMediaUrl } from '@/lib/storage';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const key = String(body?.key || '').replace(/^\/+/, '');
  const contentType = String(body?.contentType || 'application/octet-stream');
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 });
  const uploadUrl = await createUploadUrl(key, contentType);
  if (!uploadUrl) return NextResponse.json({ error: 'Object storage is not configured' }, { status: 503 });
  return NextResponse.json({ uploadUrl, publicUrl: publicMediaUrl(key), expiresIn: 900 });
}
