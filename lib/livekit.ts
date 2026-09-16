import { AccessToken } from 'livekit-server-sdk';

export function livekitConfigured() {
  return Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.NEXT_PUBLIC_LIVEKIT_URL);
}

export async function createLiveKitToken({
  identity,
  name,
  room,
  canPublish,
  metadata,
}: {
  identity: string;
  name: string;
  room: string;
  canPublish: boolean;
  metadata?: Record<string, unknown>;
}) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error('LIVEKIT_NOT_CONFIGURED');

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: '1h',
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  });

  token.addGrant({
    roomJoin: true,
    room,
    canPublish,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
