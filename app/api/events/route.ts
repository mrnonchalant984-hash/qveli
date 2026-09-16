import { NextResponse } from 'next/server';
import { publishEvent } from '@/lib/event-bus';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ error: 'type is required' }, { status: 400 });
  const result = await publishEvent({ type: String(body.type), payload: body.payload ?? {} });
  return NextResponse.json(result, { status: result.published ? 202 : 503 });
}
