import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';
import { createLiveKitToken, livekitConfigured } from '@/lib/livekit';

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    if (!livekitConfigured()) return bad('Live media infrastructure is not configured yet. Add the LiveKit environment variables.', 503);

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || 'CALL').toUpperCase();
    const id = String(body.id || '').trim();
    const mode = String(body.mode || 'viewer').toLowerCase();
    if (!id || !['CALL', 'LIVE'].includes(kind)) return bad('Invalid media room.');

    let room = '';
    let canPublish = false;

    if (kind === 'CALL') {
      const call = await prisma.callSession.findUnique({ where: { id } });
      if (!call || ![call.callerId, call.calleeId].includes(me.id)) return bad('Call not found.', 404);
      if (['ENDED', 'DECLINED'].includes(call.status)) return bad('This call has ended.', 409);
      room = `qevli-call-${call.id}`;
      canPublish = true;
    } else {
      const stream = await prisma.liveStream.findUnique({ where: { id } });
      if (!stream || stream.status !== 'LIVE') return bad('Live stream is not active.', 404);
      room = `qevli-live-${stream.id}`;
      if (mode === 'host') {
        if (stream.hostId !== me.id) return bad('Only the host can publish to this live room.', 403);
        canPublish = true;
      }
    }

    const token = await createLiveKitToken({
      identity: me.id,
      name: me.name,
      room,
      canPublish,
      metadata: { username: me.username, userId: me.id, kind, mode },
    });

    return ok({ token, url: process.env.NEXT_PUBLIC_LIVEKIT_URL, room, canPublish });
  } catch (error) {
    if (error instanceof Error && error.message === 'LIVEKIT_NOT_CONFIGURED') return bad('Live media infrastructure is not configured yet.', 503);
    return serverError();
  }
}
