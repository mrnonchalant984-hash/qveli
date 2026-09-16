import { NextResponse } from 'next/server';
import { enqueue, QEVLI_QUEUES } from '@/lib/queue';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const queue = String(body?.queue || QEVLI_QUEUES.analytics);
  const jobName = String(body?.jobName || 'generic');
  if (!Object.values(QEVLI_QUEUES).includes(queue as typeof QEVLI_QUEUES[keyof typeof QEVLI_QUEUES])) {
    return NextResponse.json({ error: 'Unknown queue' }, { status: 400 });
  }
  const result = await enqueue(queue as typeof QEVLI_QUEUES[keyof typeof QEVLI_QUEUES], jobName, body?.data ?? {});
  return NextResponse.json(result, { status: result.queued ? 202 : 503 });
}
