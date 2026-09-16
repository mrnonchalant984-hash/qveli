import { getRedis } from './redis';

export type QevliEvent = {
  type: string;
  id?: string;
  region?: string;
  timestamp?: string;
  payload?: Record<string, unknown>;
};

export async function publishEvent(event: QevliEvent) {
  const redis = getRedis();
  if (!redis) return { published: false, reason: 'Redis REST is not configured' };
  const stream = process.env.QEVLI_EVENT_STREAM || 'qevli:events';
  const id = await redis.xadd(stream, '*', {
    type: event.type,
    eventId: event.id ?? crypto.randomUUID(),
    region: event.region ?? process.env.QEVLI_REGION ?? 'local',
    timestamp: event.timestamp ?? new Date().toISOString(),
    payload: JSON.stringify(event.payload ?? {}),
  });
  return { published: true, id };
}
